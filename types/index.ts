export type BookStatus = 'AVAILABLE' | 'BORROWED';

export type BorrowerType = 'STUDENT' | 'TEACHER';

export interface StudentBorrower {
  type: 'STUDENT';
  name: string;
  studentId: string;
  grade: string;
  room: string;
  phone: string;
}

export interface TeacherBorrower {
  type: 'TEACHER';
  name: string;
  department: string;
  phone: string;
}

export type Borrower = StudentBorrower | TeacherBorrower;

export interface Book {
  id: string; // รหัสหนังสือ เช่น TH-001, วค-01, BK-001
  title: string;
  author: string;
  isbn: string;
  category: string;
  coverUrl: string;
  status: BookStatus;
  publishedYear?: string;
  location?: string;
  description?: string;
  totalBorrowedCount: number;
  createdAt: string;
}

export type TransactionStatus = 'ACTIVE' | 'RETURNED' | 'OVERDUE';

export interface BorrowTransaction {
  id: string;
  bookId: string;
  bookTitle: string;
  bookCoverUrl: string;
  bookCategory: string;
  borrower: Borrower;
  borrowDate: string; // YYYY-MM-DD
  dueDate: string;    // YYYY-MM-DD
  returnDate?: string; // YYYY-MM-DD
  status: TransactionStatus;
  notes?: string;
}

export type WishlistStatus = 'PENDING' | 'APPROVED' | 'REJECTED' | 'ORDERED';
export type WishlistPriority = 'NORMAL' | 'MEDIUM' | 'HIGH' | 'URGENT';

export interface BookWishlist {
  id: string;
  title: string;
  authorPublisher: string;
  department: string;
  reason: string;
  estimatedPrice: number;
  quantity: number;
  teacherName: string;
  teacherPhone: string;
  priority: WishlistPriority;
  status: WishlistStatus;
  librarianNotes?: string;
  createdAt: string;
  isbn?: string;
  referenceUrl?: string;
}

export interface LibrarySettings {
  schoolName: string;
  studentBorrowDays: number;
  teacherBorrowDays: number;
  maxBooksPerPerson: number;
  finePerDay: number;
  adminUsername: string;
  adminPasscode: string;
}

export const DEFAULT_SETTINGS: LibrarySettings = {
  schoolName: 'ห้องสมุดหมวดภาษาไทย โรงเรียนบรรหารแจ่มใสวิทยา ๓',
  studentBorrowDays: 7,
  teacherBorrowDays: 14,
  maxBooksPerPerson: 3,
  finePerDay: 5,
  adminUsername: 'thaibj3',
  adminPasscode: '12123',
};

// Thai Language & General Categories tailored for the Thai Department Library
export const BOOK_CATEGORIES = [
  'วรรณคดีและวรรณกรรมไทย',
  'หลักภาษาและการใช้ภาษาไทย',
  'วรรณกรรมเยาวชนและนิยายไทย',
  'กวีนิพนธ์ ร้อยกรอง และฉันทลักษณ์',
  'การอ่าน การเขียน และการพูดเพื่อการสื่อสาร',
  'นิทานพื้นบ้าน วรรณกรรมท้องถิ่น และตำนาน',
  'พจนานุกรมและสารานุกรมภาษาไทย',
  'ภาษา ศิลปวัฒนธรรม และประวัติศาสตร์ไทย',
  'วิทยาศาสตร์และเทคโนโลยี',
  'คณิตศาสตร์',
  'ภาษาต่างประเทศ',
  'สังคมศึกษา ศาสนา และวัฒนธรรม',
  'ความรู้ทั่วไปและการพัฒนาตนเอง'
] as const;

export const SCHOOL_DEPARTMENTS = [
  'กลุ่มสาระการเรียนรู้ภาษาไทย',
  'กลุ่มสาระการเรียนรู้วิทยาศาสตร์และเทคโนโลยี',
  'กลุ่มสาระการเรียนรู้คณิตศาสตร์',
  'กลุ่มสาระการเรียนรู้ภาษาต่างประเทศ',
  'กลุ่มสาระการเรียนรู้สังคมศึกษา ศาสนา และวัฒนธรรม',
  'กลุ่มสาระการเรียนรู้สุขศึกษาและพลศึกษา',
  'กลุ่มสาระการเรียนรู้ศิลปะ',
  'กลุ่มสาระการเรียนรู้การงานอาชีพ',
  'งานแนะแนว',
  'ฝ่ายบริหารวิชาการ'
] as const;

export const STUDENT_GRADES = [
  'มัธยมศึกษาปีที่ 1 (ม.1)',
  'มัธยมศึกษาปีที่ 2 (ม.2)',
  'มัธยมศึกษาปีที่ 3 (ม.3)',
  'มัธยมศึกษาปีที่ 4 (ม.4)',
  'มัธยมศึกษาปีที่ 5 (ม.5)',
  'มัธยมศึกษาปีที่ 6 (ม.6)',
  'ประถมศึกษาปีที่ 1 (ป.1)',
  'ประถมศึกษาปีที่ 2 (ป.2)',
  'ประถมศึกษาปีที่ 3 (ป.3)',
  'ประถมศึกษาปีที่ 4 (ป.4)',
  'ประถมศึกษาปีที่ 5 (ป.5)',
  'ประถมศึกษาปีที่ 6 (ป.6)'
] as const;
