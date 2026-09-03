'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { Book, BorrowTransaction, BookWishlist, Borrower, WishlistStatus } from '@/types';
import { INITIAL_BOOKS, INITIAL_TRANSACTIONS, INITIAL_WISHLISTS } from '@/lib/mockData';
import { getTodayString, isOverdue } from '@/lib/utils';

interface BorrowParams {
  bookId: string;
  borrower: Borrower;
  borrowDate: string;
  dueDate: string;
  notes?: string;
}

interface LibraryContextType {
  books: Book[];
  transactions: BorrowTransaction[];
  wishlists: BookWishlist[];
  addBook: (book: Omit<Book, 'id' | 'createdAt' | 'totalBorrowedCount' | 'status'>) => Book;
  updateBook: (id: string, book: Partial<Book>) => void;
  deleteBook: (id: string) => void;
  borrowBook: (params: BorrowParams) => { success: boolean; message: string; transaction?: BorrowTransaction };
  returnBook: (transactionId: string, returnDate?: string) => { success: boolean; message: string };
  addWishlist: (item: Omit<BookWishlist, 'id' | 'createdAt' | 'status'>) => BookWishlist;
  updateWishlistStatus: (id: string, status: WishlistStatus, librarianNotes?: string) => void;
  deleteWishlist: (id: string) => void;
  resetToDefaultData: () => void;
  isLoaded: boolean;
}

const LibraryContext = createContext<LibraryContextType | undefined>(undefined);

const STORAGE_KEYS = {
  BOOKS: 'school_library_books_v1',
  TRANSACTIONS: 'school_library_transactions_v1',
  WISHLISTS: 'school_library_wishlists_v1',
};

export const LibraryProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [books, setBooks] = useState<Book[]>(INITIAL_BOOKS);
  const [transactions, setTransactions] = useState<BorrowTransaction[]>(INITIAL_TRANSACTIONS);
  const [wishlists, setWishlists] = useState<BookWishlist[]>(INITIAL_WISHLISTS);
  const [isLoaded, setIsLoaded] = useState<boolean>(false);

  // Load from LocalStorage on mount
  useEffect(() => {
    try {
      const storedBooks = localStorage.getItem(STORAGE_KEYS.BOOKS);
      const storedTransactions = localStorage.getItem(STORAGE_KEYS.TRANSACTIONS);
      const storedWishlists = localStorage.getItem(STORAGE_KEYS.WISHLISTS);

      if (storedBooks) {
        setBooks(JSON.parse(storedBooks));
      } else {
        localStorage.setItem(STORAGE_KEYS.BOOKS, JSON.stringify(INITIAL_BOOKS));
      }

      if (storedTransactions) {
        const parsedTrx: BorrowTransaction[] = JSON.parse(storedTransactions);
        // Refresh overdue status
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
    } catch (e) {
      console.warn('LocalStorage not accessible, using in-memory state.', e);
    } finally {
      setIsLoaded(true);
    }
  }, []);

  // Save changes to LocalStorage
  const saveBooks = (newBooks: Book[]) => {
    setBooks(newBooks);
    try {
      localStorage.setItem(STORAGE_KEYS.BOOKS, JSON.stringify(newBooks));
    } catch (e) {
      console.warn('Error saving books to LocalStorage', e);
    }
  };

  const saveTransactions = (newTrx: BorrowTransaction[]) => {
    setTransactions(newTrx);
    try {
      localStorage.setItem(STORAGE_KEYS.TRANSACTIONS, JSON.stringify(newTrx));
    } catch (e) {
      console.warn('Error saving transactions to LocalStorage', e);
    }
  };

  const saveWishlists = (newWishlists: BookWishlist[]) => {
    setWishlists(newWishlists);
    try {
      localStorage.setItem(STORAGE_KEYS.WISHLISTS, JSON.stringify(newWishlists));
    } catch (e) {
      console.warn('Error saving wishlists to LocalStorage', e);
    }
  };

  // Add Book
  const addBook = (data: Omit<Book, 'id' | 'createdAt' | 'totalBorrowedCount' | 'status'>): Book => {
    const newBook: Book = {
      ...data,
      id: `BK-${String(books.length + 1).padStart(3, '0')}`,
      status: 'AVAILABLE',
      totalBorrowedCount: 0,
      createdAt: getTodayString(),
    };
    const updated = [newBook, ...books];
    saveBooks(updated);
    return newBook;
  };

  // Update Book
  const updateBook = (id: string, updatedFields: Partial<Book>) => {
    const updated = books.map((b) => (b.id === id ? { ...b, ...updatedFields } : b));
    saveBooks(updated);
  };

  // Delete Book
  const deleteBook = (id: string) => {
    const updated = books.filter((b) => b.id !== id);
    saveBooks(updated);
  };

  // Borrow Book: Automatically change book status to BORROWED & create transaction
  const borrowBook = (params: BorrowParams): { success: boolean; message: string; transaction?: BorrowTransaction } => {
    const book = books.find((b) => b.id === params.bookId);
    if (!book) {
      return { success: false, message: 'ไม่พบข้อมูลหนังสือในระบบ' };
    }

    if (book.status === 'BORROWED') {
      return { success: false, message: 'หนังสือเล่มนี้กำลังถูกยืมอยู่ ไม่สามารถทำรายการได้' };
    }

    const newTransactionId = `TRX-${new Date().getFullYear()}-${String(transactions.length + 1).padStart(3, '0')}`;
    const newTransaction: BorrowTransaction = {
      id: newTransactionId,
      bookId: book.id,
      bookTitle: book.title,
      bookCoverUrl: book.coverUrl,
      bookCategory: book.category,
      borrower: params.borrower,
      borrowDate: params.borrowDate || getTodayString(),
      dueDate: params.dueDate,
      status: isOverdue(params.dueDate) ? 'OVERDUE' : 'ACTIVE',
      notes: params.notes,
    };

    // Update book status to BORROWED & increment borrow count
    const updatedBooks = books.map((b) =>
      b.id === book.id
        ? { ...b, status: 'BORROWED' as const, totalBorrowedCount: b.totalBorrowedCount + 1 }
        : b
    );

    saveBooks(updatedBooks);
    saveTransactions([newTransaction, ...transactions]);

    return {
      success: true,
      message: `บันทึกการยืม "${book.title}" สำเร็จ`,
      transaction: newTransaction,
    };
  };

  // Return Book: Automatically change book status to AVAILABLE & update transaction
  const returnBook = (transactionId: string, returnDate?: string): { success: boolean; message: string } => {
    const trx = transactions.find((t) => t.id === transactionId);
    if (!trx) {
      return { success: false, message: 'ไม่พบรายการยืมนี้ในระบบ' };
    }

    if (trx.status === 'RETURNED') {
      return { success: false, message: 'หนังสือรายการนี้ถูกบันทึกคืนไปแล้ว' };
    }

    const actualReturnDate = returnDate || getTodayString();

    // Update transaction
    const updatedTransactions = transactions.map((t) =>
      t.id === transactionId
        ? { ...t, returnDate: actualReturnDate, status: 'RETURNED' as const }
        : t
    );

    // Update book status to AVAILABLE
    const updatedBooks = books.map((b) =>
      b.id === trx.bookId ? { ...b, status: 'AVAILABLE' as const } : b
    );

    saveTransactions(updatedTransactions);
    saveBooks(updatedBooks);

    return {
      success: true,
      message: `บันทึกการรับคืน "${trx.bookTitle}" เรียบร้อยแล้ว`,
    };
  };

  // Wishlist Actions
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

  const resetToDefaultData = () => {
    saveBooks(INITIAL_BOOKS);
    saveTransactions(INITIAL_TRANSACTIONS);
    saveWishlists(INITIAL_WISHLISTS);
  };

  return (
    <LibraryContext.Provider
      value={{
        books,
        transactions,
        wishlists,
        addBook,
        updateBook,
        deleteBook,
        borrowBook,
        returnBook,
        addWishlist,
        updateWishlistStatus,
        deleteWishlist,
        resetToDefaultData,
        isLoaded,
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
