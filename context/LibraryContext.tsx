'use client';

import React, { createContext, useContext, useState, useEffect, useRef, useCallback } from 'react';
import { Book, BorrowTransaction, BookWishlist, Borrower, WishlistStatus, LibrarySettings, DEFAULT_SETTINGS } from '@/types';
import { INITIAL_BOOKS, INITIAL_TRANSACTIONS, INITIAL_WISHLISTS } from '@/lib/mockData';
import { getTodayString, isOverdue, addDays, getCurrentTimeString } from '@/lib/utils';

interface BorrowParams {
  bookId: string;
  borrower: Borrower;
  borrowDate?: string;
  borrowTime?: string;
  dueDate?: string;
  dueTime?: string;
  notes?: string;
}

export type SyncStatus = 'synced' | 'syncing' | 'offline' | 'error';

interface LibraryContextType {
  books: Book[];
  transactions: BorrowTransaction[];
  wishlists: BookWishlist[];
  settings: LibrarySettings;
  updateSettings: (newSettings: Partial<LibrarySettings>) => Promise<void>;
  addBook: (book: Omit<Book, 'id' | 'createdAt' | 'totalBorrowedCount' | 'status'> & { id?: string }) => Promise<Book>;
  updateBook: (id: string, book: Partial<Book>) => Promise<void>;
  deleteBook: (id: string) => Promise<void>;
  borrowBook: (params: BorrowParams) => { success: boolean; message: string; transaction?: BorrowTransaction };
  returnBook: (transactionId: string, returnDate?: string) => { success: boolean; message: string };
  addWishlist: (item: Omit<BookWishlist, 'id' | 'createdAt' | 'status'>) => BookWishlist;
  updateWishlistStatus: (id: string, status: WishlistStatus, librarianNotes?: string) => void;
  deleteWishlist: (id: string) => void;
  loadSampleData: () => void;
  clearAllData: () => void;
  isLoaded: boolean;
  isAdmin: boolean;
  loginAdmin: () => void;
  logoutAdmin: () => void;
  // Cloud Sync
  syncStatus: SyncStatus;
  isSyncing: boolean;
  lastSyncedAt: Date | null;
  syncWithCloud: (force?: boolean) => Promise<void>;
  exportBackup: () => void;
  importBackup: (jsonString: string) => Promise<{ success: boolean; message: string }>;
}

const LibraryContext = createContext<LibraryContextType | undefined>(undefined);

const STORAGE_KEYS = {
  BOOKS: 'school_lib_books_thai_v3',
  TRANSACTIONS: 'school_lib_trx_thai_v3',
  WISHLISTS: 'school_lib_wish_thai_v3',
  SETTINGS: 'school_lib_settings_thai_v3',
  AUTH: 'school_lib_admin_auth_v3',
  LAST_SYNC: 'school_lib_last_sync_v3',
};

const DEFAULT_SCHOOL_NAME = 'ห้องสมุดหมวดภาษาไทย โรงเรียนบรรหารแจ่มใสวิทยา ๓';

export const sanitizeSettings = (raw: any): LibrarySettings => {
  if (!raw || typeof raw !== 'object') return DEFAULT_SETTINGS;
  const rawSchool = typeof raw.schoolName === 'string' ? raw.schoolName.trim() : '';
  const schoolName = (rawSchool && !rawSchool.includes('?'))
    ? rawSchool
    : DEFAULT_SCHOOL_NAME;

  return {
    ...DEFAULT_SETTINGS,
    ...raw,
    schoolName,
    adminUsername: (raw.adminUsername && !raw.adminUsername.includes('?')) ? raw.adminUsername : DEFAULT_SETTINGS.adminUsername,
    adminPasscode: (raw.adminPasscode && !raw.adminPasscode.includes('?') && raw.adminPasscode !== '1234') ? raw.adminPasscode : DEFAULT_SETTINGS.adminPasscode,
    studentBorrowDays: Number(raw.studentBorrowDays) || 5,
    teacherBorrowDays: Number(raw.teacherBorrowDays) || 10,
    maxBooksPerPerson: Number(raw.maxBooksPerPerson) || 3,
    finePerDay: Number(raw.finePerDay) !== undefined && !isNaN(Number(raw.finePerDay)) ? Number(raw.finePerDay) : 25,
  };
};

export const LibraryProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [books, setBooks] = useState<Book[]>(INITIAL_BOOKS);
  const [transactions, setTransactions] = useState<BorrowTransaction[]>(INITIAL_TRANSACTIONS);
  const [wishlists, setWishlists] = useState<BookWishlist[]>(INITIAL_WISHLISTS);
  const [settings, setSettings] = useState<LibrarySettings>(DEFAULT_SETTINGS);
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const [isLoaded, setIsLoaded] = useState<boolean>(false);

  // Cloud Sync State
  const [syncStatus, setSyncStatus] = useState<SyncStatus>('syncing');
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [lastSyncedAt, setLastSyncedAt] = useState<Date | null>(null);

  // Ref to hold latest state for sync operations
  const stateRef = useRef({
    books: INITIAL_BOOKS,
    transactions: INITIAL_TRANSACTIONS,
    wishlists: INITIAL_WISHLISTS,
    settings: DEFAULT_SETTINGS,
  });

  useEffect(() => {
    stateRef.current = { books, transactions, wishlists, settings };
  }, [books, transactions, wishlists, settings]);

  const lastLocalMutationTimeRef = useRef<number>(0);
  const locallyDeletedBookIdsRef = useRef<Set<string>>(new Set());

  // Push state to cloud database via /api/sync
  const pushToCloud = useCallback(
    async (
      overrideBooks?: Book[],
      overrideTrx?: BorrowTransaction[],
      overrideWish?: BookWishlist[],
      overrideSet?: LibrarySettings
    ) => {
      const payloadBooks = overrideBooks !== undefined ? overrideBooks : stateRef.current.books;
      const payloadTrx = overrideTrx !== undefined ? overrideTrx : stateRef.current.transactions;
      const payloadWish = overrideWish !== undefined ? overrideWish : stateRef.current.wishlists;
      const payloadSet = overrideSet !== undefined ? overrideSet : stateRef.current.settings;

      setIsSyncing(true);
      setSyncStatus('syncing');

      try {
        const res = await fetch('/api/sync', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            books: payloadBooks,
            transactions: payloadTrx,
            wishlists: payloadWish,
            settings: payloadSet,
            clientTimestamp: new Date().toISOString(),
          }),
        });

        if (res.ok) {
          const now = new Date();
          setLastSyncedAt(now);
          setSyncStatus('synced');
          try {
            localStorage.setItem(STORAGE_KEYS.LAST_SYNC, now.toISOString());
            // Broadcast to other tabs on the same device
            if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
              const bc = new BroadcastChannel('school_lib_realtime');
              bc.postMessage({ type: 'SYNC_UPDATE', timestamp: now.toISOString() });
              bc.close();
            }
          } catch (e) {}
        } else {
          setSyncStatus('error');
        }
      } catch (err) {
        console.warn('Failed to push data to cloud sync API:', err);
        setSyncStatus('offline');
      } finally {
        setIsSyncing(false);
      }
    },
    []
  );

  // Pull data from cloud database via /api/sync with cache-busting
  const syncWithCloud = useCallback(async (force = false) => {
    // If a local mutation happened very recently (< 6s), do not overwrite with potentially stale GET
    if (!force && Date.now() - lastLocalMutationTimeRef.current < 6000) {
      return;
    }

    setIsSyncing(true);
    try {
      const res = await fetch(`/api/sync?_t=${Date.now()}`, {
        method: 'GET',
        cache: 'no-store',
        headers: {
          'Cache-Control': 'no-cache, no-store, max-age=0',
        },
      });

      if (!res.ok) {
        throw new Error(`Cloud API error status ${res.status}`);
      }

      const json = await res.json();
      if (json.success && json.data) {
        const cloudData = json.data;

        // Cloud DB is the Single Source of Truth (SSOT)
        if (Array.isArray(cloudData.books)) {
          // Double check mutation guard
          if (!force && Date.now() - lastLocalMutationTimeRef.current < 6000) {
            return;
          }

          // Filter out any locally deleted books
          const cloudBooks: Book[] = cloudData.books.filter(
            (b: Book) => !locallyDeletedBookIdsRef.current.has(b.id.toLowerCase())
          );
          const rawTrx: BorrowTransaction[] = Array.isArray(cloudData.transactions) ? cloudData.transactions : [];
          const cloudWish = Array.isArray(cloudData.wishlists) ? cloudData.wishlists : [];
          const cloudSet = sanitizeSettings(cloudData.settings);

          // If local has books that haven't reached cloud yet and aren't deleted, preserve them
          const currentLocalBooks = (stateRef.current.books || []).filter(
            (b) => !locallyDeletedBookIdsRef.current.has(b.id.toLowerCase())
          );
          const cloudBookMap = new Map(cloudBooks.map((b) => [b.id.toLowerCase(), b]));
          
          // Combine: start with cloud books, then append any local books not yet in cloud
          const mergedBooks: Book[] = [...cloudBooks];
          for (const localBook of currentLocalBooks) {
            if (!cloudBookMap.has(localBook.id.toLowerCase())) {
              mergedBooks.unshift(localBook);
            }
          }

          const bookIdSet = new Set(mergedBooks.map((b) => b.id));
          const cloudTrx = rawTrx.filter((t) => bookIdSet.has(t.bookId));

          // If we had uncommitted local changes, push the complete merged list back to cloud
          if (mergedBooks.length !== cloudData.books.length) {
            pushToCloud(mergedBooks, cloudTrx, cloudWish, cloudSet);
          }

          // Update state and persistence
          stateRef.current.books = mergedBooks;
          stateRef.current.transactions = cloudTrx;
          stateRef.current.wishlists = cloudWish;
          stateRef.current.settings = cloudSet;

          setBooks(mergedBooks);
          setTransactions(
            cloudTrx.map((trx: BorrowTransaction) => {
              if (trx.status === 'ACTIVE' && isOverdue(trx.dueDate, trx.returnDate)) {
                return { ...trx, status: 'OVERDUE' as const };
              }
              return trx;
            })
          );
          setWishlists(cloudWish);
          setSettings(cloudSet);

          try {
            localStorage.setItem(STORAGE_KEYS.BOOKS, JSON.stringify(mergedBooks));
            localStorage.setItem(STORAGE_KEYS.TRANSACTIONS, JSON.stringify(cloudTrx));
            localStorage.setItem(STORAGE_KEYS.WISHLISTS, JSON.stringify(cloudWish));
            localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(cloudSet));
          } catch (e) {}

          const now = new Date();
          setLastSyncedAt(now);
          setSyncStatus('synced');
          try {
            localStorage.setItem(STORAGE_KEYS.LAST_SYNC, now.toISOString());
          } catch (e) {}
        }
      }
    } catch (err) {
      console.warn('Could not sync with cloud database:', err);
      setSyncStatus('offline');
    } finally {
      setIsSyncing(false);
    }
  }, []);

  // Load from LocalStorage on initial mount, then immediately sync with Cloud
  useEffect(() => {
    try {
      const storedBooks = localStorage.getItem(STORAGE_KEYS.BOOKS);
      const storedTransactions = localStorage.getItem(STORAGE_KEYS.TRANSACTIONS);
      const storedWishlists = localStorage.getItem(STORAGE_KEYS.WISHLISTS);
      const storedSettings = localStorage.getItem(STORAGE_KEYS.SETTINGS);
      const storedAuth = localStorage.getItem(STORAGE_KEYS.AUTH);
      const storedLastSync = localStorage.getItem(STORAGE_KEYS.LAST_SYNC);

      if (storedAuth === 'true') {
        setIsAdmin(true);
      }

      if (storedLastSync) {
        setLastSyncedAt(new Date(storedLastSync));
      }

      let currentBooks: Book[] = [];
      if (storedBooks) {
        currentBooks = JSON.parse(storedBooks);
        setBooks(currentBooks);
        stateRef.current.books = currentBooks;
      } else {
        setBooks([]);
      }

      if (storedTransactions && currentBooks.length > 0) {
        const parsedTrx: BorrowTransaction[] = JSON.parse(storedTransactions);
        const bookIdSet = new Set(currentBooks.map((b) => b.id));
        const refreshedTrx = parsedTrx
          .filter((trx) => bookIdSet.has(trx.bookId))
          .map((trx) => {
            if (trx.status === 'ACTIVE' && isOverdue(trx.dueDate, trx.returnDate)) {
              return { ...trx, status: 'OVERDUE' as const };
            }
            return trx;
          });
        setTransactions(refreshedTrx);
        stateRef.current.transactions = refreshedTrx;
      } else {
        setTransactions([]);
      }

      if (storedWishlists) {
        const parsedWish = JSON.parse(storedWishlists);
        setWishlists(parsedWish);
        stateRef.current.wishlists = parsedWish;
      }

      if (storedSettings) {
        const parsed = JSON.parse(storedSettings);
        const san = sanitizeSettings(parsed);
        setSettings(san);
        stateRef.current.settings = san;
      }
    } catch (e) {
      console.warn('LocalStorage not accessible, using in-memory state.', e);
    } finally {
      setIsLoaded(true);
    }

    // Immediately trigger cloud sync
    syncWithCloud(true);
  }, [syncWithCloud]);

  // Real-time synchronization across all devices and tabs
  useEffect(() => {
    const handleImmediateSync = () => {
      syncWithCloud(true);
    };

    // 1. When user switches to tab, focuses window, or device screen turns on
    window.addEventListener('focus', handleImmediateSync);
    window.addEventListener('pageshow', handleImmediateSync);
    window.addEventListener('online', handleImmediateSync);
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'visible') {
        handleImmediateSync();
      }
    });

    // 2. Multi-tab BroadcastChannel on same device
    let bc: BroadcastChannel | null = null;
    if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
      bc = new BroadcastChannel('school_lib_realtime');
      bc.onmessage = (event) => {
        if (event.data?.type === 'SYNC_UPDATE') {
          syncWithCloud(true);
        }
      };
    }

    // 3. Ultra-fast background polling: every 1.5 seconds
    const interval = setInterval(() => {
      syncWithCloud(false);
    }, 1500);

    return () => {
      window.removeEventListener('focus', handleImmediateSync);
      window.removeEventListener('pageshow', handleImmediateSync);
      window.removeEventListener('online', handleImmediateSync);
      if (bc) {
        bc.close();
      }
      clearInterval(interval);
    };
  }, [syncWithCloud]);

  const loginAdmin = () => {
    setIsAdmin(true);
    try {
      localStorage.setItem(STORAGE_KEYS.AUTH, 'true');
    } catch (e) {
      console.warn('Error saving auth', e);
    }
  };

  const logoutAdmin = () => {
    setIsAdmin(false);
    try {
      localStorage.removeItem(STORAGE_KEYS.AUTH);
    } catch (e) {
      console.warn('Error clearing auth', e);
    }
  };

  const saveBooks = async (newBooks: Book[]) => {
    lastLocalMutationTimeRef.current = Date.now();
    stateRef.current.books = newBooks;
    setBooks(newBooks);
    try {
      localStorage.setItem(STORAGE_KEYS.BOOKS, JSON.stringify(newBooks));
    } catch (e) {
      console.warn('Error saving books', e);
    }
    await pushToCloud(newBooks, undefined, undefined, undefined);
  };

  const saveTransactions = async (newTrx: BorrowTransaction[]) => {
    lastLocalMutationTimeRef.current = Date.now();
    stateRef.current.transactions = newTrx;
    setTransactions(newTrx);
    try {
      localStorage.setItem(STORAGE_KEYS.TRANSACTIONS, JSON.stringify(newTrx));
    } catch (e) {
      console.warn('Error saving transactions', e);
    }
    await pushToCloud(undefined, newTrx, undefined, undefined);
  };

  const saveWishlists = async (newWishlists: BookWishlist[]) => {
    lastLocalMutationTimeRef.current = Date.now();
    stateRef.current.wishlists = newWishlists;
    setWishlists(newWishlists);
    try {
      localStorage.setItem(STORAGE_KEYS.WISHLISTS, JSON.stringify(newWishlists));
    } catch (e) {
      console.warn('Error saving wishlists', e);
    }
    await pushToCloud(undefined, undefined, newWishlists, undefined);
  };

  const updateSettings = async (newSettings: Partial<LibrarySettings>) => {
    lastLocalMutationTimeRef.current = Date.now();
    const updated = { ...settings, ...newSettings };
    stateRef.current.settings = updated;
    setSettings(updated);
    try {
      localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(updated));
    } catch (e) {
      console.warn('Error saving settings', e);
    }
    await pushToCloud(undefined, undefined, undefined, updated);
  };

  // Add Book: Supports custom Book ID (รหัสหนังสือ เช่น TH-001) or auto generated
  const addBook = async (data: Omit<Book, 'id' | 'createdAt' | 'totalBorrowedCount' | 'status'> & { id?: string }): Promise<Book> => {
    const currentBooks = stateRef.current.books;
    const customOrGeneratedId = data.id?.trim()
      ? data.id.trim()
      : `TH-${String(currentBooks.length + 1).padStart(3, '0')}`;

    const newBook: Book = {
      ...data,
      id: customOrGeneratedId,
      status: 'AVAILABLE',
      totalBorrowedCount: 0,
      createdAt: getTodayString(),
    };
    
    // Check if ID exists, update or prepend
    locallyDeletedBookIdsRef.current.delete(newBook.id.toLowerCase());
    const existingIdx = currentBooks.findIndex((b) => b.id.toLowerCase() === newBook.id.toLowerCase());
    let updated: Book[];
    if (existingIdx >= 0) {
      updated = currentBooks.map((b, i) => (i === existingIdx ? newBook : b));
    } else {
      updated = [newBook, ...currentBooks];
    }
    await saveBooks(updated);
    return newBook;
  };

  const updateBook = async (id: string, updatedFields: Partial<Book>) => {
    locallyDeletedBookIdsRef.current.delete(id.toLowerCase());
    const updated = stateRef.current.books.map((b) => (b.id === id ? { ...b, ...updatedFields } : b));
    await saveBooks(updated);
  };

  const deleteBook = async (id: string) => {
    lastLocalMutationTimeRef.current = Date.now();
    locallyDeletedBookIdsRef.current.add(id.toLowerCase());
    const currentBooks = stateRef.current.books;
    const currentTrx = stateRef.current.transactions;
    const updatedBooks = currentBooks.filter((b) => b.id.toLowerCase() !== id.toLowerCase());
    const updatedTrx = currentTrx.filter((t) => t.bookId.toLowerCase() !== id.toLowerCase());

    stateRef.current.books = updatedBooks;
    stateRef.current.transactions = updatedTrx;
    setBooks(updatedBooks);
    setTransactions(updatedTrx);

    try {
      localStorage.setItem(STORAGE_KEYS.BOOKS, JSON.stringify(updatedBooks));
      localStorage.setItem(STORAGE_KEYS.TRANSACTIONS, JSON.stringify(updatedTrx));
    } catch (e) {
      console.warn('Error saving books/transactions', e);
    }
    await pushToCloud(updatedBooks, updatedTrx, undefined, undefined);
  };

  // Borrow Book: Automatically toggles book status to BORROWED & calculates due date from settings
  const borrowBook = (params: BorrowParams): { success: boolean; message: string; transaction?: BorrowTransaction } => {
    const searchId = params.bookId.trim().toLowerCase();
    const book = books.find(
      (b) => b.id.toLowerCase() === searchId || b.isbn.toLowerCase() === searchId || b.title.toLowerCase() === searchId
    );

    if (!book) {
      return { success: false, message: `ไม่พบข้อมูลหนังสือรหัส "${params.bookId}" ในระบบ กรุณาตรวจสอบรหัสหนังสืออีกครั้ง` };
    }

    if (book.status === 'BORROWED') {
      return { success: false, message: `หนังสือ "${book.title}" (รหัส ${book.id}) กำลังถูกยืมอยู่ ไม่สามารถทำรายการซ้ำได้` };
    }

    const borrowDate = params.borrowDate || getTodayString();
    const borrowTime = params.borrowTime || getCurrentTimeString();

    const durationDays = params.borrower.type === 'STUDENT' ? settings.studentBorrowDays : settings.teacherBorrowDays;
    const dueDate = params.dueDate || addDays(new Date(borrowDate), durationDays);
    const dueTime = params.dueTime || '16:30 น.';

    const newTransactionId = `TRX-${new Date().getFullYear()}-${String(transactions.length + 1).padStart(3, '0')}`;
    const newTransaction: BorrowTransaction = {
      id: newTransactionId,
      bookId: book.id,
      bookTitle: book.title,
      bookCoverUrl: book.coverUrl,
      bookCategory: book.category,
      borrower: params.borrower,
      borrowDate,
      borrowTime,
      dueDate,
      dueTime,
      status: isOverdue(dueDate) ? 'OVERDUE' : 'ACTIVE',
      notes: params.notes,
    };

    const updatedBooks = books.map((b) =>
      b.id === book.id ? { ...b, status: 'BORROWED' as const, totalBorrowedCount: b.totalBorrowedCount + 1 } : b
    );

    const updatedTransactions = [newTransaction, ...transactions];

    setBooks(updatedBooks);
    setTransactions(updatedTransactions);

    try {
      localStorage.setItem(STORAGE_KEYS.BOOKS, JSON.stringify(updatedBooks));
      localStorage.setItem(STORAGE_KEYS.TRANSACTIONS, JSON.stringify(updatedTransactions));
    } catch (e) {}

    pushToCloud(updatedBooks, updatedTransactions, undefined, undefined);

    return {
      success: true,
      message: `บันทึกการยืม "${book.title}" (รหัส ${book.id}) ให้ ${params.borrower.name} เรียบร้อยแล้ว`,
      transaction: newTransaction,
    };
  };

  // Return Book: Automatically toggles book status to AVAILABLE
  const returnBook = (transactionId: string, returnDate?: string): { success: boolean; message: string } => {
    const trx = transactions.find((t) => t.id === transactionId);
    if (!trx) {
      return { success: false, message: 'ไม่พบรายการยืมนี้ในระบบ' };
    }

    if (trx.status === 'RETURNED') {
      return { success: false, message: 'หนังสือรายการนี้ถูกบันทึกคืนไปแล้ว' };
    }

    const actualReturnDate = returnDate || getTodayString();
    const actualReturnTime = getCurrentTimeString();

    const updatedTransactions = transactions.map((t) =>
      t.id === transactionId
        ? { ...t, returnDate: actualReturnDate, returnTime: actualReturnTime, status: 'RETURNED' as const }
        : t
    );

    const updatedBooks = books.map((b) => (b.id === trx.bookId ? { ...b, status: 'AVAILABLE' as const } : b));

    setTransactions(updatedTransactions);
    setBooks(updatedBooks);

    try {
      localStorage.setItem(STORAGE_KEYS.TRANSACTIONS, JSON.stringify(updatedTransactions));
      localStorage.setItem(STORAGE_KEYS.BOOKS, JSON.stringify(updatedBooks));
    } catch (e) {}

    pushToCloud(updatedBooks, updatedTransactions, undefined, undefined);

    return {
      success: true,
      message: `บันทึกการรับคืน "${trx.bookTitle}" (รหัส ${trx.bookId}) เรียบร้อยแล้ว`,
    };
  };

  // Wishlists
  const addWishlist = (item: Omit<BookWishlist, 'id' | 'createdAt' | 'status'>): BookWishlist => {
    const newWishlist: BookWishlist = {
      ...item,
      id: `WL-${String(wishlists.length + 1).padStart(3, '0')}`,
      status: 'PENDING',
      createdAt: getTodayString(),
    };
    const updated = [newWishlist, ...wishlists];
    saveWishlists(updated);
    return newWishlist;
  };

  const updateWishlistStatus = (id: string, status: WishlistStatus, librarianNotes?: string) => {
    const updated = wishlists.map((w) =>
      w.id === id
        ? {
            ...w,
            status,
            ...(librarianNotes !== undefined ? { librarianNotes } : {}),
          }
        : w
    );
    saveWishlists(updated);
  };

  const deleteWishlist = (id: string) => {
    const updated = wishlists.filter((w) => w.id !== id);
    saveWishlists(updated);
  };

  const loadSampleData = () => {
    const sampleBooks: Book[] = [
      {
        id: 'TH-001',
        title: 'วรรณคดีไทยฉบับวิเคราะห์: ลิลิตพระลอ และ มัทนะพาธา',
        author: 'ศ.ดร. รื่นฤทัย สัจจพันธุ์',
        isbn: '978-616-1234-01-1',
        category: 'วรรณคดีและวรรณกรรมไทย',
        coverUrl: 'https://images.unsplash.com/photo-1532012164546-f432f2e3edd3?w=600&auto=format&fit=crop&q=80',
        status: 'AVAILABLE',
        publishedYear: '2567',
        location: 'ตู้ภาษาไทย ชั้น 1 (TH-101)',
        description: 'วิเคราะห์คุณค่าทางวรรณศิลป์ ปรัชญา และค่านิยมในวรรณคดีเรื่องเอกของไทยสำหรับนักเรียน ม.ปลาย',
        totalBorrowedCount: 0,
        createdAt: '2026-09-01',
      },
      {
        id: 'TH-002',
        title: 'บรรทัดฐานภาษาไทย เล่ม ๑-๔: หลักไวยากรณ์และการใช้คำ',
        author: 'ราชบัณฑิตยสภา',
        isbn: '978-616-1234-02-8',
        category: 'หลักภาษาและการใช้ภาษาไทย',
        coverUrl: 'https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?w=600&auto=format&fit=crop&q=80',
        status: 'AVAILABLE',
        publishedYear: '2566',
        location: 'ตู้ภาษาไทย ชั้น 1 (TH-102)',
        description: 'คู่มือมาตรฐานหลักภาษาไทย วากยสัมพันธ์ และการสะกดคำที่ถูกต้องตามแบบแผน',
        totalBorrowedCount: 0,
        createdAt: '2026-09-01',
      },
      {
        id: 'TH-003',
        title: 'ศิลปะการประพันธ์ร้อยกรองและฉันทลักษณ์ไทย',
        author: 'อาจารย์ฐะปะนีย์ นาครทรรพ',
        isbn: '978-616-1234-03-5',
        category: 'กวีนิพนธ์ ร้อยกรอง และฉันทลักษณ์',
        coverUrl: 'https://images.unsplash.com/photo-1512820790803-83ca734da794?w=600&auto=format&fit=crop&q=80',
        status: 'AVAILABLE',
        publishedYear: '2567',
        location: 'ตู้ภาษาไทย ชั้น 2 (TH-201)',
        description: 'หลักการแต่งโคลง ฉันท์ กาพย์ กลอน และร่าย พร้อมตัวอย่างกวีนิพนธ์ชั้นครู',
        totalBorrowedCount: 0,
        createdAt: '2026-09-01',
      },
    ];
    saveBooks(sampleBooks);
  };

  const clearAllData = () => {
    setBooks([]);
    setTransactions([]);
    setWishlists([]);
    try {
      localStorage.setItem(STORAGE_KEYS.BOOKS, JSON.stringify([]));
      localStorage.setItem(STORAGE_KEYS.TRANSACTIONS, JSON.stringify([]));
      localStorage.setItem(STORAGE_KEYS.WISHLISTS, JSON.stringify([]));
    } catch (e) {}
    pushToCloud([], [], [], undefined);
  };

  // Export full JSON backup
  const exportBackup = () => {
    const backupData = {
      app: 'school-library-system',
      school: settings.schoolName,
      exportedAt: new Date().toISOString(),
      books,
      transactions,
      wishlists,
      settings,
    };
    const jsonStr = JSON.stringify(backupData, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `library_backup_${getTodayString()}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Import JSON backup
  const importBackup = async (jsonString: string): Promise<{ success: boolean; message: string }> => {
    try {
      const parsed = JSON.parse(jsonString);
      if (!parsed || (!Array.isArray(parsed.books) && !parsed.books)) {
        return { success: false, message: 'รูปแบบไฟล์สำรองไม่ถูกต้อง (ไม่พบข้อมูลหนังสือ)' };
      }

      const importedBooks: Book[] = Array.isArray(parsed.books) ? parsed.books : [];
      const rawImportedTrx: BorrowTransaction[] = Array.isArray(parsed.transactions) ? parsed.transactions : [];
      const bookIdSet = new Set(importedBooks.map((b) => b.id));
      const importedTrx = rawImportedTrx.filter((t) => bookIdSet.has(t.bookId));
      const importedWish: BookWishlist[] = Array.isArray(parsed.wishlists) ? parsed.wishlists : [];
      const importedSettings: LibrarySettings = parsed.settings
        ? { ...DEFAULT_SETTINGS, ...parsed.settings }
        : settings;

      setBooks(importedBooks);
      setTransactions(importedTrx);
      setWishlists(importedWish);
      setSettings(importedSettings);

      try {
        localStorage.setItem(STORAGE_KEYS.BOOKS, JSON.stringify(importedBooks));
        localStorage.setItem(STORAGE_KEYS.TRANSACTIONS, JSON.stringify(importedTrx));
        localStorage.setItem(STORAGE_KEYS.WISHLISTS, JSON.stringify(importedWish));
        localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(importedSettings));
      } catch (e) {}

      await pushToCloud(importedBooks, importedTrx, importedWish, importedSettings);

      return {
        success: true,
        message: `นำเข้าข้อมูลสำเร็จ! (หนังสือ ${importedBooks.length} เล่ม, ธุรกรรม ${importedTrx.length} รายการ)`,
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
  const context = useContext(LibraryContext);
  if (!context) {
    throw new Error('useLibrary must be used within a LibraryProvider');
  }
  return context;
};
