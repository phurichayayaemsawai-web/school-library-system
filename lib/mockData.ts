import { Book, BorrowTransaction, BookWishlist } from '@/types';

// Default to completely clean / empty database as requested
export const INITIAL_BOOKS: Book[] = [];
export const INITIAL_TRANSACTIONS: BorrowTransaction[] = [];
export const INITIAL_WISHLISTS: BookWishlist[] = [];

// Optional sample template data (if teacher wants to load demo)
export const SAMPLE_BOOKS: Book[] = [
  {
    id: 'BK-001',
    title: 'ฟิสิกส์ ม.ปลาย เล่ม 1: การเคลื่อนที่และแรง',
    author: 'รศ.ดร.ประสิทธิ์ สุวรรณรัตน์',
    isbn: '978-616-1234-01-1',
    category: 'วิทยาศาสตร์และเทคโนโลยี',
    coverUrl: 'https://images.unsplash.com/photo-1532012164546-f432f2e3edd3?w=600&auto=format&fit=crop&q=80',
    status: 'AVAILABLE',
    publishedYear: '2567',
    location: 'ตู้ A ชั้น 1 (A1-04)',
    description: 'ตำราฟิสิกส์พื้นฐานและเข้มข้นสำหรับนักเรียนชั้นมัธยมศึกษาตอนปลาย',
    totalBorrowedCount: 0,
    createdAt: '2026-09-01',
  },
  {
    id: 'BK-002',
    title: 'แคลคูลัสเบื้องต้นสำหรับมัธยมปลายและอุดมศึกษา',
    author: 'ผศ. สมชาย เกียรติอนันต์',
    isbn: '978-616-1234-02-8',
    category: 'คณิตศาสตร์',
    coverUrl: 'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=600&auto=format&fit=crop&q=80',
    status: 'AVAILABLE',
    publishedYear: '2567',
    location: 'ตู้ B ชั้น 2 (B2-12)',
    description: 'เนื้อหาเกี่ยวกับลิมิต ความต่อเนื่อง อนุพันธ์ และการอินทิเกรต',
    totalBorrowedCount: 0,
    createdAt: '2026-09-01',
  },
  {
    id: 'BK-003',
    title: 'เรียนรู้ Python และ Machine Learning ฉบับเริ่มต้น',
    author: 'กิตติศักดิ์ พัฒนพันธุ์',
    isbn: '978-616-1234-06-6',
    category: 'วิทยาศาสตร์และเทคโนโลยี',
    coverUrl: 'https://images.unsplash.com/photo-1515879218367-8466d910aaa4?w=600&auto=format&fit=crop&q=80',
    status: 'AVAILABLE',
    publishedYear: '2567',
    location: 'ตู้ T ชั้น 1 (T1-01)',
    description: 'การเขียนโปรแกรมด้วยภาษาไพทอนเพื่อสร้างโมเดล Data Science และ AI',
    totalBorrowedCount: 0,
    createdAt: '2026-09-01',
  }
];
