export type BookStatus = 'AVAILABLE' | 'BORROWED';

export type BorrowerType = 'STUDENT' | 'TEACHER';

export interface StudentBorrower {
  type: 'STUDENT';
  name: string;
  studentId: string;
  grade: string;
  room: string;
  phone?: string;
}

export interface TeacherBorrower {
  type: 'TEACHER';
  name: string;
  department: string;
  phone?: string;
}

export type Borrower = StudentBorrower | TeacherBorrower;

export interface Book {
  id: string;
  title: string;
  author: string;
  category: string;
  isbn: string;
  coverUrl: string;
  status: BookStatus;
  publishedYear: string;
  location: string;
  description: string;
  totalBorrowedCount: number;
  createdAt: string;
}

export type TransactionStatus = 'ACTIVE' | 'OVERDUE' | 'RETURNED';

export interface Transaction {
  id: string;
  bookId: string;
  bookTitle: string;
  bookCoverUrl: string;
  bookCategory: string;
  borrower: Borrower;
  borrowDate: string;
  borrowTime: string;
  dueDate: string;
  dueTime: string;
  returnDate?: string;
  returnTime?: string;
  status: TransactionStatus;
  notes?: string;
}

export type WishlistStatus = 'PENDING' | 'APPROVED' | 'ORDERED' | 'REJECTED';
export type WishlistPriority = 'URGENT' | 'HIGH' | 'MEDIUM' | 'LOW';

export interface Wishlist {
  id: string;
  bookTitle: string;
  author?: string;
  category?: string;
  reason?: string;
  requesterName: string;
  requesterType: BorrowerType;
  status: WishlistStatus;
  priority?: WishlistPriority;
  librarianNotes?: string;
  createdAt: string;
}

export interface LibrarySettings {
  schoolName: string;
  studentBorrowDays: number;
  teacherBorrowDays: number;
  maxBooksPerPerson: number;
  finePerDay: number;
  adminUsername: string;
  adminPasscode: string;
  googleSheetsWebhookUrl?: string;
  supabaseUrl?: string;
  supabaseAnonKey?: string;
}

export type SyncStatus = 'synced' | 'syncing' | 'offline' | 'error';
