'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
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

interface LibraryContextType {
  books: Book[];
  transactions: BorrowTransaction[];
  wishlists: BookWishlist[];
  settings: LibrarySettings;
  updateSettings: (newSettings: Partial<LibrarySettings>) => void;
  addBook: (book: Omit<Book, 'id' | 'createdAt' | 'totalBorrowedCount' | 'status'> & { id?: string }) => Book;
  updateBook: (id: string, book: Partial<Book>) => void;
  deleteBook: (id: string) => void;
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
}

const LibraryContext = createContext<LibraryContextType | undefined>(undefined);

const STORAGE_KEYS = {
  BOOKS: 'school_lib_books_thai_v3',
  TRANSACTIONS: 'school_lib_trx_thai_v3',
  WISHLISTS: 'school_lib_wish_thai_v3',
  SETTINGS: 'school_lib_settings_thai_v3',
  AUTH: 'school_lib_admin_auth_v3',
};

export const LibraryProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [books, setBooks] = useState<Book[]>(INITIAL_BOOKS);
  const [transactions, setTransactions] = useState<BorrowTransaction[]>(INITIAL_TRANSACTIONS);
  const [wishlists, setWishlists] = useState<BookWishlist[]>(INITIAL_WISHLISTS);
  const [settings, setSettings] = useState<LibrarySettings>(DEFAULT_SETTINGS);
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const [isLoaded, setIsLoaded] = useState<boolean>(false);

  // Load from LocalStorage on mount
  useEffect(() => {
    try {
      const storedBooks = localStorage.getItem(STORAGE_KEYS.BOOKS);
      const storedTransactions = localStorage.getItem(STORAGE_KEYS.TRANSACTIONS);
      const storedWishlists = localStorage.getItem(STORAGE_KEYS.WISHLISTS);
      const storedSettings = localStorage.getItem(STORAGE_KEYS.SETTINGS);
      const storedAuth = localStorage.getItem(STORAGE_KEYS.AUTH);

      if (storedAuth === 'true') {
        setIsAdmin(true);
      }

      if (storedBooks) {
        setBooks(JSON.parse(storedBooks));
      } else {
        localStorage.setItem(STORAGE_KEYS.BOOKS, JSON.stringify(INITIAL_BOOKS));
      }

      if (storedTransactions) {
        const parsedTrx: BorrowTransaction[] = JSON.parse(storedTransactions);
        const refreshedTrx = parsedTrx.map((trx) => {
          if (trx.status === 'ACTIVE' && isOverdue(trx.dueDate, trx.returnDate)) {
            return { ...trx, status: 'OVERDUE' as const };
          }
          return trx;
        });
        setTransactions(refreshedTrx);
      } else {
        localStorage.setItem(STORAGE_KEYS.TRANSACTIONS, JSON.stringify(INITIAL_TRANSACTIONS));
      }

      if (storedWishlists) {
        setWishlists(JSON.parse(storedWishlists));
      } else {
        localStorage.setItem(STORAGE_KEYS.WISHLISTS, JSON.stringify(INITIAL_WISHLISTS));
      }

      if (storedSettings) {
        const parsed = JSON.parse(storedSettings);
        setSettings({
          ...DEFAULT_SETTINGS,
          ...parsed,
          adminUsername: parsed.adminUsername || DEFAULT_SETTINGS.adminUsername,
          adminPasscode: (parsed.adminPasscode === '1234' || !parsed.adminPasscode) ? DEFAULT_SETTINGS.adminPasscode : parsed.adminPasscode,
        });
      } else {
        localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(DEFAULT_SETTINGS));
      }
    } catch (e) {
      console.warn('LocalStorage not accessible, using in-memory state.', e);
    } finally {
      setIsLoaded(true);
    }
  }, []);

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

  const saveBooks = (newBooks: Book[]) => {
    setBooks(newBooks);
    try {
      localStorage.setItem(STORAGE_KEYS.BOOKS, JSON.stringify(newBooks));
    } catch (e) {
      console.warn('Error saving books', e);
    }
  };

  const saveTransactions = (newTrx: BorrowTransaction[]) => {
    setTransactions(newTrx);
    try {
      localStorage.setItem(STORAGE_KEYS.TRANSACTIONS, JSON.stringify(newTrx));
    } catch (e) {
      console.warn('Error saving transactions', e);
    }
  };

  const saveWishlists = (newWishlists: BookWishlist[]) => {
    setWishlists(newWishlists);
    try {
      localStorage.setItem(STORAGE_KEYS.WISHLISTS, JSON.stringify(newWishlists));
    } catch (e) {
      console.warn('Error saving wishlists', e);
    }
  };

  const updateSettings = (newSettings: Partial<LibrarySettings>) => {
    const updated = { ...settings, ...newSettings };
    setSettings(updated);
    try {
      localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(updated));
    } catch (e) {
      console.warn('Error saving settings', e);
    }
  };

  // Add Book: Supports custom Book ID (รหัสหนังสือ เช่น TH-001) or auto generated
  const addBook = (data: Omit<Book, 'id' | 'createdAt' | 'totalBorrowedCount' | 'status'> & { id?: string }): Book => {
    const customOrGeneratedId = data.id?.trim() 
      ? data.id.trim() 
      : `TH-${String(books.length + 1).padStart(3, '0')}`;

    const newBook: Book = {
      ...data,
      id: customOrGeneratedId,
      status: 'AVAILABLE',
      totalBorrowedCount: 0,
      createdAt: getTodayString(),
    };
    const updated = [newBook, ...books];
    saveBooks(updated);
    return newBook;
  };

  const updateBook = (id: string, updatedFields: Partial<Book>) => {
    const updated = books.map((b) => (b.id === id ? { ...b, ...updatedFields } : b));
    saveBooks(updated);
  };

  const deleteBook = (id: string) => {
    const updated = books.filter((b) => b.id !== id);
    saveBooks(updated);
  };

  // Borrow Book: Automatically toggles book status to BORROWED & calculates due date from settings
  const borrowBook = (params: BorrowParams): { success: boolean; message: string; transaction?: BorrowTransaction } => {
    // Find book by case-insensitive ID or ISBN or Title
    const searchId = params.bookId.trim().toLowerCase();
    const book = books.find((b) => b.id.toLowerCase() === searchId || b.isbn.toLowerCase() === searchId || b.title.toLowerCase() === searchId);
    
    if (!book) {
      return { success: false, message: `ไม่พบข้อมูลหนังสือรหัส "${params.bookId}" ในระบบ กรุณาตรวจสอบรหัสหนังสืออีกครั้ง` };
    }

    if (book.status === 'BORROWED') {
      return { success: false, message: `หนังสือ "${book.title}" (รหัส ${book.id}) กำลังถูกยืมอยู่ ไม่สามารถทำรายการซ้ำได้` };
    }

    const borrowDate = params.borrowDate || getTodayString();
    const borrowTime = params.borrowTime || getCurrentTimeString();
    
    // Calculate due date based on user type and configured settings
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
      b.id === book.id
        ? { ...b, status: 'BORROWED' as const, totalBorrowedCount: b.totalBorrowedCount + 1 }
        : b
    );

    saveBooks(updatedBooks);
    saveTransactions([newTransaction, ...transactions]);

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

    const updatedBooks = books.map((b) =>
      b.id === trx.bookId ? { ...b, status: 'AVAILABLE' as const } : b
    );

    saveTransactions(updatedTransactions);
    saveBooks(updatedBooks);

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
    saveBooks([
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
      }
    ]);
  };

  const clearAllData = () => {
    saveBooks([]);
    saveTransactions([]);
    saveWishlists([]);
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
