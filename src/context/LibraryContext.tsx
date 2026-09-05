"use strict";
import React, { createContext, useContext, useState, useEffect, useRef, useCallback } from "react";
import { Book, Transaction, Wishlist, LibrarySettings, SyncStatus, Borrower } from "@/types";
import { DEFAULT_SETTINGS, SAMPLE_BOOKS } from "@/constants/library";
import { getTodayString, getCurrentTime, addDays, isOverdue } from "@/lib/utils";

interface BorrowParams {
  bookId: string;
  borrower: Borrower;
  borrowDate?: string;
  borrowTime?: string;
  dueDate?: string;
  dueTime?: string;
  notes?: string;
}

interface LibraryContextType {
  books: Book[];
  transactions: Transaction[];
  wishlists: Wishlist[];
  settings: LibrarySettings;
  updateSettings: (newSettings: Partial<LibrarySettings>) => void;
  addBook: (bookData: Omit<Book, "id" | "status" | "totalBorrowedCount" | "createdAt"> & { id?: string }) => Book;
  updateBook: (id: string, updates: Partial<Book>) => void;
  deleteBook: (id: string) => void;
  borrowBook: (params: BorrowParams) => { success: boolean; message: string; transaction?: Transaction };
  returnBook: (transactionId: string, returnDate?: string) => { success: boolean; message: string };
  addWishlist: (wishlistData: Omit<Wishlist, "id" | "status" | "createdAt">) => Wishlist;
  updateWishlistStatus: (id: string, status: Wishlist["status"], librarianNotes?: string) => void;
  deleteWishlist: (id: string) => void;
  loadSampleData: () => void;
  clearAllData: () => void;
  isLoaded: boolean;
  isAdmin: boolean;
  loginAdmin: () => void;
  logoutAdmin: () => void;
  syncStatus: SyncStatus;
  syncProvider: "supabase" | "local";
  isSyncing: boolean;
  lastSyncedAt: Date | null;
  syncWithCloud: (manual?: boolean) => Promise<void>;
  exportBackup: () => void;
  importBackup: (jsonString: string) => Promise<{ success: boolean; message: string }>;
}

const LibraryContext = createContext<LibraryContextType | undefined>(undefined);

const STORAGE_KEYS = {
  BOOKS: "school_lib_books_thai_v3",
  TRANSACTIONS: "school_lib_trx_thai_v3",
  WISHLISTS: "school_lib_wish_thai_v3",
  SETTINGS: "school_lib_settings_thai_v3",
  AUTH: "school_lib_admin_auth_v3",
  LAST_SYNC: "school_lib_last_sync_v3",
};

const sanitizeSettings = (raw: any): LibrarySettings => {
  if (!raw || typeof raw !== "object") return DEFAULT_SETTINGS;
  const schoolName = typeof raw.schoolName === "string" ? raw.schoolName.trim() : "";
  return {
    ...DEFAULT_SETTINGS,
    ...raw,
    schoolName: schoolName && !schoolName.includes("?") ? schoolName : DEFAULT_SETTINGS.schoolName,
    adminUsername: raw.adminUsername && !raw.adminUsername.includes("?") ? raw.adminUsername : DEFAULT_SETTINGS.adminUsername,
    adminPasscode: raw.adminPasscode && !raw.adminPasscode.includes("?") && raw.adminPasscode !== "1234" ? raw.adminPasscode : DEFAULT_SETTINGS.adminPasscode,
    studentBorrowDays: Number(raw.studentBorrowDays) || 5,
    teacherBorrowDays: Number(raw.teacherBorrowDays) || 10,
    maxBooksPerPerson: Number(raw.maxBooksPerPerson) || 3,
    finePerDay: isNaN(Number(raw.finePerDay)) ? 25 : Number(raw.finePerDay),
    googleSheetsWebhookUrl: raw.googleSheetsWebhookUrl || undefined,
    supabaseUrl: raw.supabaseUrl || undefined,
    supabaseAnonKey: raw.supabaseAnonKey || undefined,
  };
};

export const LibraryProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [books, setBooks] = useState<Book[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [wishlists, setWishlists] = useState<Wishlist[]>([]);
  const [settings, setSettings] = useState<LibrarySettings>(DEFAULT_SETTINGS);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const [syncStatus, setSyncStatus] = useState<SyncStatus>("syncing");
  const [syncProvider, setSyncProvider] = useState<"supabase" | "local">("local");
  const [isSyncing, setIsSyncing] = useState(false);
  const [lastSyncedAt, setLastSyncedAt] = useState<Date | null>(null);

  const stateRef = useRef({ books, transactions, wishlists, settings });
  useEffect(() => {
    stateRef.current = { books, transactions, wishlists, settings };
  }, [books, transactions, wishlists, settings]);

  const pushToCloud = useCallback(async (
    newBooks?: Book[],
    newTrx?: Transaction[],
    newWish?: Wishlist[],
    newSet?: LibrarySettings
  ) => {
    const payloadBooks = newBooks !== undefined ? newBooks : stateRef.current.books;
    const payloadTrx = newTrx !== undefined ? newTrx : stateRef.current.transactions;
    const payloadWish = newWish !== undefined ? newWish : stateRef.current.wishlists;
    const payloadSet = newSet !== undefined ? newSet : stateRef.current.settings;

    setIsSyncing(true);
    setSyncStatus("syncing");
    try {
      const res = await fetch("/api/sync", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          books: payloadBooks,
          transactions: payloadTrx,
          wishlists: payloadWish,
          settings: payloadSet,
          clientTimestamp: new Date().toISOString(),
        }),
      });

      if (res.ok) {
        const json = await res.json().catch(() => null);
        if (json?.provider) setSyncProvider(json.provider);
        const now = new Date();
        setLastSyncedAt(now);
        setSyncStatus("synced");
        try {
          localStorage.setItem(STORAGE_KEYS.LAST_SYNC, now.toISOString());
        } catch {}
      } else {
        setSyncStatus("error");
      }
    } catch (err) {
      console.warn("Failed to push data to cloud sync API:", err);
      setSyncStatus("offline");
    } finally {
      setIsSyncing(false);
    }
  }, []);

  const syncWithCloud = useCallback(async (manual = false) => {
    setIsSyncing(true);
    setSyncStatus("syncing");
    try {
      const res = await fetch("/api/sync", { method: "GET", cache: "no-store" });
      if (!res.ok) throw new Error(`Cloud API error status ${res.status}`);
      const json = await res.json();
      if (json.success && json.data) {
        if (json.provider) setSyncProvider(json.provider);
        const d = json.data;
        if (Array.isArray(d.books)) {
          const sBooks: Book[] = d.books.length > 0 ? d.books : (stateRef.current.books.length > 0 ? stateRef.current.books : SAMPLE_BOOKS);
          const sTrx: Transaction[] = Array.isArray(d.transactions) ? d.transactions : [];
          const validBookIds = new Set(sBooks.map((b) => b.id));
          const filteredTrx = sTrx.filter((t) => validBookIds.has(t.bookId)).map((t) => {
            if (t.status === "ACTIVE" && isOverdue(t.dueDate, t.returnDate)) {
              return { ...t, status: "OVERDUE" as const };
            }
            return t;
          });
          const sWish: Wishlist[] = Array.isArray(d.wishlists) ? d.wishlists : [];
          const sSettings = sanitizeSettings(d.settings);

          setBooks(sBooks);
          setTransactions(filteredTrx);
          setWishlists(sWish);
          setSettings(sSettings);

          try {
            localStorage.setItem(STORAGE_KEYS.BOOKS, JSON.stringify(sBooks));
            localStorage.setItem(STORAGE_KEYS.TRANSACTIONS, JSON.stringify(filteredTrx));
            localStorage.setItem(STORAGE_KEYS.WISHLISTS, JSON.stringify(sWish));
            localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(sSettings));
          } catch {}

          const now = new Date();
          setLastSyncedAt(now);
          setSyncStatus("synced");
          try {
            localStorage.setItem(STORAGE_KEYS.LAST_SYNC, now.toISOString());
          } catch {}
        }
      }
    } catch (err) {
      console.warn("Could not sync with cloud database:", err);
      setSyncStatus("offline");
    } finally {
      setIsSyncing(false);
    }
  }, []);

  // Initialize from localStorage
  useEffect(() => {
    try {
      const lBooks = localStorage.getItem(STORAGE_KEYS.BOOKS);
      const lTrx = localStorage.getItem(STORAGE_KEYS.TRANSACTIONS);
      const lWish = localStorage.getItem(STORAGE_KEYS.WISHLISTS);
      const lSettings = localStorage.getItem(STORAGE_KEYS.SETTINGS);
      const lAuth = localStorage.getItem(STORAGE_KEYS.AUTH);
      const lLastSync = localStorage.getItem(STORAGE_KEYS.LAST_SYNC);

      if (lAuth === "true") setIsAdmin(true);
      if (lLastSync) setLastSyncedAt(new Date(lLastSync));

      let loadedBooks: Book[] = [];
      if (lBooks) {
        loadedBooks = JSON.parse(lBooks);
        setBooks(loadedBooks);
      } else {
        // Preload sample books if empty on initial visit
        setBooks(SAMPLE_BOOKS);
      }

      if (lTrx && loadedBooks.length > 0) {
        const parsedTrx: Transaction[] = JSON.parse(lTrx);
        const bookIds = new Set(loadedBooks.map((b) => b.id));
        const valid = parsedTrx
          .filter((t) => bookIds.has(t.bookId))
          .map((t) => (t.status === "ACTIVE" && isOverdue(t.dueDate, t.returnDate) ? { ...t, status: "OVERDUE" as const } : t));
        setTransactions(valid);
      }

      if (lWish) setWishlists(JSON.parse(lWish));
      if (lSettings) setSettings(sanitizeSettings(JSON.parse(lSettings)));
    } catch (err) {
      console.warn("LocalStorage not accessible, using initial state:", err);
    } finally {
      setIsLoaded(true);
    }

    syncWithCloud();
  }, [syncWithCloud]);

  // Periodic and focus sync
  useEffect(() => {
    const onSync = () => syncWithCloud();
    window.addEventListener("focus", onSync);
    window.addEventListener("online", onSync);
    const interval = setInterval(onSync, 15000);
    return () => {
      window.removeEventListener("focus", onSync);
      window.removeEventListener("online", onSync);
      clearInterval(interval);
    };
  }, [syncWithCloud]);

  const saveBooks = (newBooks: Book[]) => {
    setBooks(newBooks);
    try {
      localStorage.setItem(STORAGE_KEYS.BOOKS, JSON.stringify(newBooks));
    } catch (err) {
      console.warn("Error saving books", err);
    }
    pushToCloud(newBooks, undefined, undefined, undefined);
  };

  const saveWishlists = (newWish: Wishlist[]) => {
    setWishlists(newWish);
    try {
      localStorage.setItem(STORAGE_KEYS.WISHLISTS, JSON.stringify(newWish));
    } catch (err) {
      console.warn("Error saving wishlists", err);
    }
    pushToCloud(undefined, undefined, newWish, undefined);
  };

  const updateSettings = (newSettings: Partial<LibrarySettings>) => {
    const merged = { ...settings, ...newSettings };
    setSettings(merged);
    try {
      localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(merged));
    } catch (err) {
      console.warn("Error saving settings", err);
    }
    pushToCloud(undefined, undefined, undefined, merged);
  };

  const addBook = (bookData: Omit<Book, "id" | "status" | "totalBorrowedCount" | "createdAt"> & { id?: string }): Book => {
    const id = bookData.id?.trim() ? bookData.id.trim() : `TH-${String(books.length + 1).padStart(3, "0")}`;
    const newBook: Book = {
      ...bookData,
      id,
      status: "AVAILABLE",
      totalBorrowedCount: 0,
      createdAt: getTodayString(),
    };
    saveBooks([newBook, ...books]);
    return newBook;
  };

  const updateBook = (id: string, updates: Partial<Book>) => {
    saveBooks(books.map((b) => (b.id === id ? { ...b, ...updates } : b)));
  };

  const deleteBook = (id: string) => {
    const updatedBooks = books.filter((b) => b.id !== id);
    const updatedTrx = transactions.filter((t) => t.bookId !== id);
    setBooks(updatedBooks);
    setTransactions(updatedTrx);
    try {
      localStorage.setItem(STORAGE_KEYS.BOOKS, JSON.stringify(updatedBooks));
      localStorage.setItem(STORAGE_KEYS.TRANSACTIONS, JSON.stringify(updatedTrx));
    } catch (err) {
      console.warn("Error saving books/trx", err);
    }
    pushToCloud(updatedBooks, updatedTrx, undefined, undefined);
  };

  const borrowBook = (params: BorrowParams) => {
    const search = params.bookId.trim().toLowerCase();
    const book = books.find(
      (b) =>
        b.id.toLowerCase() === search ||
        b.isbn.toLowerCase() === search ||
        b.title.toLowerCase() === search
    );

    if (!book) {
      return {
        success: false,
        message: `ไม่พบข้อมูลหนังสือรหัส "${params.bookId}" ในระบบ กรุณาตรวจสอบรหัสหนังสืออีกครั้ง`,
      };
    }

    if (book.status === "BORROWED") {
      return {
        success: false,
        message: `หนังสือ "${book.title}" (รหัส ${book.id}) กำลังถูกยืมอยู่ ไม่สามารถทำรายการซ้ำได้`,
      };
    }

    const borrowDate = params.borrowDate || getTodayString();
    const borrowTime = params.borrowTime || getCurrentTime();
    const borrowDays =
      params.borrower.type === "STUDENT"
        ? settings.studentBorrowDays || 5
        : settings.teacherBorrowDays || 10;
    const dueDate = params.dueDate || addDays(new Date(borrowDate), borrowDays);
    const dueTime = params.dueTime || "16:30 น.";

    const trxId = `TRX-${new Date().getFullYear()}-${String(transactions.length + 1).padStart(3, "0")}`;
    const transaction: Transaction = {
      id: trxId,
      bookId: book.id,
      bookTitle: book.title,
      bookCoverUrl: book.coverUrl,
      bookCategory: book.category,
      borrower: params.borrower,
      borrowDate,
      borrowTime,
      dueDate,
      dueTime,
      status: isOverdue(dueDate) ? "OVERDUE" : "ACTIVE",
      notes: params.notes,
    };

    const updatedBooks = books.map((b) =>
      b.id === book.id
        ? { ...b, status: "BORROWED" as const, totalBorrowedCount: (b.totalBorrowedCount || 0) + 1 }
        : b
    );
    const updatedTrx = [transaction, ...transactions];

    setBooks(updatedBooks);
    setTransactions(updatedTrx);
    try {
      localStorage.setItem(STORAGE_KEYS.BOOKS, JSON.stringify(updatedBooks));
      localStorage.setItem(STORAGE_KEYS.TRANSACTIONS, JSON.stringify(updatedTrx));
    } catch {}

    pushToCloud(updatedBooks, updatedTrx, undefined, undefined);

    return {
      success: true,
      message: `บันทึกการยืม "${book.title}" (รหัส ${book.id}) ให้ ${params.borrower.name} เรียบร้อยแล้ว`,
      transaction,
    };
  };

  const returnBook = (transactionId: string, returnDate?: string) => {
    const trx = transactions.find((t) => t.id === transactionId);
    if (!trx) return { success: false, message: "ไม่พบรายการยืมนี้ในระบบ" };
    if (trx.status === "RETURNED") return { success: false, message: "หนังสือรายการนี้ถูกบันทึกคืนไปแล้ว" };

    const rDate = returnDate || getTodayString();
    const rTime = getCurrentTime();

    const updatedTrx = transactions.map((t) =>
      t.id === transactionId
        ? { ...t, returnDate: rDate, returnTime: rTime, status: "RETURNED" as const }
        : t
    );
    const updatedBooks = books.map((b) =>
      b.id === trx.bookId ? { ...b, status: "AVAILABLE" as const } : b
    );

    setTransactions(updatedTrx);
    setBooks(updatedBooks);
    try {
      localStorage.setItem(STORAGE_KEYS.TRANSACTIONS, JSON.stringify(updatedTrx));
      localStorage.setItem(STORAGE_KEYS.BOOKS, JSON.stringify(updatedBooks));
    } catch {}

    pushToCloud(updatedBooks, updatedTrx, undefined, undefined);

    return {
      success: true,
      message: `บันทึกการรับคืน "${trx.bookTitle}" (รหัส ${trx.bookId}) เรียบร้อยแล้ว`,
    };
  };

  const addWishlist = (wishlistData: Omit<Wishlist, "id" | "status" | "createdAt">): Wishlist => {
    const newWish: Wishlist = {
      ...wishlistData,
      id: `WL-${String(wishlists.length + 1).padStart(3, "0")}`,
      status: "PENDING",
      createdAt: getTodayString(),
    };
    saveWishlists([newWish, ...wishlists]);
    return newWish;
  };

  const updateWishlistStatus = (id: string, status: Wishlist["status"], librarianNotes?: string) => {
    saveWishlists(
      wishlists.map((w) =>
        w.id === id ? { ...w, status, ...(librarianNotes !== undefined ? { librarianNotes } : {}) } : w
      )
    );
  };

  const deleteWishlist = (id: string) => {
    saveWishlists(wishlists.filter((w) => w.id !== id));
  };

  const loadSampleData = () => {
    saveBooks(SAMPLE_BOOKS);
  };

  const clearAllData = () => {
    setBooks([]);
    setTransactions([]);
    setWishlists([]);
    try {
      localStorage.setItem(STORAGE_KEYS.BOOKS, JSON.stringify([]));
      localStorage.setItem(STORAGE_KEYS.TRANSACTIONS, JSON.stringify([]));
      localStorage.setItem(STORAGE_KEYS.WISHLISTS, JSON.stringify([]));
    } catch {}
    pushToCloud([], [], [], undefined);
  };

  const loginAdmin = () => {
    setIsAdmin(true);
    try {
      localStorage.setItem(STORAGE_KEYS.AUTH, "true");
    } catch {}
  };

  const logoutAdmin = () => {
    setIsAdmin(false);
    try {
      localStorage.removeItem(STORAGE_KEYS.AUTH);
    } catch {}
  };

  const exportBackup = () => {
    const backupData = {
      app: "school-library-system",
      school: settings.schoolName,
      exportedAt: new Date().toISOString(),
      books,
      transactions,
      wishlists,
      settings,
    };
    const blob = new Blob([JSON.stringify(backupData, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `library_backup_${getTodayString()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const importBackup = async (jsonString: string) => {
    try {
      const data = JSON.parse(jsonString);
      if (!data || !Array.isArray(data.books)) {
        return { success: false, message: "รูปแบบไฟล์สำรองไม่ถูกต้อง (ไม่พบข้อมูลหนังสือ)" };
      }
      const newBooks = data.books;
      const newTrx = Array.isArray(data.transactions) ? data.transactions : [];
      const newWish = Array.isArray(data.wishlists) ? data.wishlists : [];
      const newSettings = data.settings ? sanitizeSettings(data.settings) : settings;

      setBooks(newBooks);
      setTransactions(newTrx);
      setWishlists(newWish);
      setSettings(newSettings);

      try {
        localStorage.setItem(STORAGE_KEYS.BOOKS, JSON.stringify(newBooks));
        localStorage.setItem(STORAGE_KEYS.TRANSACTIONS, JSON.stringify(newTrx));
        localStorage.setItem(STORAGE_KEYS.WISHLISTS, JSON.stringify(newWish));
        localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(newSettings));
      } catch {}

      await pushToCloud(newBooks, newTrx, newWish, newSettings);

      return {
        success: true,
        message: `นำเข้าข้อมูลสำเร็จ! (หนังสือ ${newBooks.length} เล่ม, ธุรกรรม ${newTrx.length} รายการ)`,
      };
    } catch (err: any) {
      return { success: false, message: `เกิดข้อผิดพลาดในการนำเข้าไฟล์: ${err.message}` };
    }
  };

  return (
    <LibraryContext.Provider
      value={{
        books,
        transactions,
        wishlists,
        settings,
        updateSettings,
        addBook,
        updateBook,
        deleteBook,
        borrowBook,
        returnBook,
        addWishlist,
        updateWishlistStatus,
        deleteWishlist,
        loadSampleData,
        clearAllData,
        isLoaded,
        isAdmin,
        loginAdmin,
        logoutAdmin,
        syncStatus,
        syncProvider,
        isSyncing,
        lastSyncedAt,
        syncWithCloud,
        exportBackup,
        importBackup,
      }}
    >
      {children}
    </LibraryContext.Provider>
  );
};

export const useLibrary = () => {
  const ctx = useContext(LibraryContext);
  if (!ctx) throw new Error("useLibrary must be used within a LibraryProvider");
  return ctx;
};
