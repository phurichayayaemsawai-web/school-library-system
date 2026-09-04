'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useLibrary } from '@/context/LibraryContext';
import { BookCard } from '@/components/books/BookCard';
import { BookModal } from '@/components/books/BookModal';
import { BorrowModal } from '@/components/borrow/BorrowModal';
import { ReturnModal } from '@/components/borrow/ReturnModal';
import { Toast, ToastMessage } from '@/components/ui/Toast';
import { Book, BorrowTransaction } from '@/types';
import { 
  BookOpen, 
  ArrowLeftRight, 
  BookCheck, 
  Clock, 
  TrendingUp, 
  Zap, 
  ShieldCheck, 
  Bookmark,
  Plus
} from 'lucide-react';

export default function HomePage() {
  const { books, transactions, settings, isAdmin } = useLibrary();

  const [searchQuery] = useState('');
  const [selectedBookForView, setSelectedBookForView] = useState<Book | null>(null);
  const [selectedBookForBorrow, setSelectedBookForBorrow] = useState<Book | null>(null);
  const [selectedTrxForReturn, setSelectedTrxForReturn] = useState<BorrowTransaction | null>(null);
  const [toast, setToast] = useState<ToastMessage | null>(null);

  const availableBooks = books.filter((b) => b.status === 'AVAILABLE');
  const borrowedBooks = books.filter((b) => b.status === 'BORROWED');
  const overdueLoans = transactions.filter((t) => t.status === 'OVERDUE');
  const returnedLoans = transactions.filter((t) => t.status === 'RETURNED');

  // Filter books for catalog
  const displayedBooks = books
    .filter((b) => {
      const q = searchQuery.toLowerCase().trim();
      if (!q) return true;
      return (
        b.title.toLowerCase().includes(q) ||
        b.author.toLowerCase().includes(q) ||
        b.category.toLowerCase().includes(q) ||
        b.id.toLowerCase().includes(q)
      );
    })
    .slice(0, 6);

  const showToast = (title: string, type: 'success' | 'error' | 'info' = 'success', description?: string) => {
    setToast({
      id: Date.now().toString(),
      type,
      title,
      description,
    });
  };

  return (
    <div className="space-y-6 sm:space-y-8">
      <Toast toast={toast} onClose={() => setToast(null)} />

      {/* Blue / Sky Hero Banner */}
      <section className="relative overflow-hidden rounded-2xl sm:rounded-3xl bg-gradient-to-br from-blue-700 via-blue-600 to-sky-500 text-white p-6 sm:p-10 lg:p-12 shadow-xl shadow-blue-500/20 border border-blue-400/30">
        <div className="relative z-10 max-w-3xl space-y-3 sm:space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/15 backdrop-blur-md border border-white/25 text-xs font-semibold text-white shadow-2xs whitespace-nowrap">
            <Bookmark className="w-3.5 h-3.5 text-sky-200 fill-sky-200 shrink-0" />
            <span className="truncate">{settings.schoolName || 'ห้องสมุดหมวดภาษาไทย โรงเรียนบรรหารแจ่มใสวิทยา ๓'}</span>
          </div>

          <h1 className="text-2xl sm:text-4xl lg:text-5xl font-black tracking-tight leading-tight">
            บันทึกการยืม-คืนหนังสือ
          </h1>

          <p className="text-xs sm:text-sm text-sky-100/90 font-normal leading-relaxed max-w-2xl">
            ค้นหาหนังสือ ตรวจสอบสถานะ และติดตามกำหนดการยืม-คืนหนังสือ ของนักเรียนและครู
          </p>
        </div>

        {/* Decorative soft circles */}
        <div className="absolute -right-16 -bottom-16 w-72 sm:w-80 h-72 sm:h-80 bg-white/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute right-1/4 -top-16 w-60 h-60 bg-sky-300/20 rounded-full blur-2xl pointer-events-none" />
      </section>

      {/* Stat Cards: 4 cards for Admin (including ยืมสะสมทั้งหมด), 3 cards for Normal user */}
      <section className={`grid grid-cols-1 ${isAdmin ? 'sm:grid-cols-2 lg:grid-cols-4' : 'sm:grid-cols-3'} gap-3 sm:gap-4`}>
        {/* Card 1: หนังสือในคลัง */}
        <div className="bg-white rounded-2xl sm:rounded-3xl p-4 sm:p-5 border border-sky-100 shadow-sm hover:border-sky-200 transition-all flex items-center justify-between">
          <div className="min-w-0">
            <p className="text-xs font-medium text-slate-500 truncate whitespace-nowrap">หนังสือในคลัง</p>
            <h3 className="text-xl sm:text-2xl font-black text-blue-600 mt-1 truncate">{books.length} เล่ม</h3>
            <p className="text-[11px] text-slate-400 mt-0.5 truncate whitespace-nowrap">พร้อมให้ยืม {availableBooks.length} เล่ม</p>
          </div>
          <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 ml-2">
            <BookOpen className="w-5 h-5 sm:w-6 sm:h-6" />
          </div>
        </div>

        {/* Card 2: กำลังถูกยืม */}
        <div className="bg-white rounded-2xl sm:rounded-3xl p-4 sm:p-5 border border-sky-100 shadow-sm hover:border-sky-200 transition-all flex items-center justify-between">
          <div className="min-w-0">
            <p className="text-xs font-medium text-slate-500 truncate whitespace-nowrap">กำลังถูกยืมอยู่</p>
            <h3 className="text-xl sm:text-2xl font-black text-amber-600 mt-1 truncate">{borrowedBooks.length} เล่ม</h3>
            <p className="text-[11px] text-slate-400 mt-0.5 truncate whitespace-nowrap">เกินกำหนด {overdueLoans.length} เล่ม</p>
          </div>
          <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0 ml-2">
            <Clock className="w-5 h-5 sm:w-6 sm:h-6" />
          </div>
        </div>

        {/* Card 3: ยืมสะสมทั้งหมด (แสดงเฉพาะเมื่อเข้าสู่ระบบแอดมิน) */}
        {isAdmin && (
          <div className="bg-white rounded-2xl sm:rounded-3xl p-4 sm:p-5 border border-sky-100 shadow-sm hover:border-sky-200 transition-all flex items-center justify-between animate-in fade-in">
            <div className="min-w-0">
              <p className="text-xs font-medium text-slate-500 truncate whitespace-nowrap">ยืมสะสมทั้งหมด</p>
              <h3 className="text-xl sm:text-2xl font-black text-emerald-600 mt-1 truncate">{transactions.length} ครั้ง</h3>
              <p className="text-[11px] text-slate-400 mt-0.5 truncate whitespace-nowrap">คืนสำเร็จ {returnedLoans.length} ครั้ง</p>
            </div>
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0 ml-2">
              <TrendingUp className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>
          </div>
        )}

        {/* Card 4: ระยะเวลายืม (สำหรับครู 10 วัน สำหรับนักเรียน 5 วัน) */}
        <div className="bg-white rounded-2xl sm:rounded-3xl p-4 sm:p-5 border border-sky-100 shadow-sm hover:border-sky-200 transition-all flex items-center justify-between">
          <div className="min-w-0 space-y-1">
            <p className="text-xs font-medium text-slate-500 truncate whitespace-nowrap">ระยะเวลายืม</p>
            <div className="space-y-0.5">
              <p className="text-xs sm:text-sm font-bold text-slate-800 truncate whitespace-nowrap">
                สำหรับนักเรียน <span className="text-blue-600 font-black">5 วัน</span>
              </p>
              <p className="text-xs sm:text-sm font-bold text-slate-800 truncate whitespace-nowrap">
                สำหรับครู <span className="text-indigo-600 font-black">10 วัน</span>
              </p>
            </div>
          </div>
          <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0 ml-2">
            <Bookmark className="w-5 h-5 sm:w-6 sm:h-6" />
          </div>
        </div>
      </section>

      {/* Book Catalog Section */}
      <section className="space-y-4 sm:space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-lg sm:text-xl font-bold text-slate-900 flex items-center gap-2">
              <BookCheck className="w-5 h-5 text-blue-600 shrink-0" />
              <span>แคตตาล็อกหนังสือหมวดภาษาไทย</span>
            </h2>
            <p className="text-xs text-slate-500 font-normal mt-0.5">
              แสดงหนังสือแนะนำและหนังสือล่าสุดในห้องสมุด
            </p>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <Link
              href="/books"
              className="text-xs font-semibold text-blue-600 hover:text-blue-700 bg-blue-50 hover:bg-blue-100 px-3.5 py-2 rounded-xl transition-all whitespace-nowrap"
            >
              ดูทั้งหมด ({books.length})
            </Link>

            {isAdmin && (
              <Link
                href="/books/new"
                className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-gradient-to-r from-blue-600 to-sky-600 hover:from-blue-700 hover:to-sky-700 text-white rounded-xl text-xs font-bold shadow-md shadow-blue-500/20 transition-all whitespace-nowrap hover:scale-105 active:scale-95"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>+ เพิ่มหนังสือใหม่</span>
              </Link>
            )}
          </div>
        </div>

        {books.length === 0 ? (
          isAdmin ? (
            /* Admin Empty State (With Setup & Add Buttons) */
            <div className="bg-white rounded-2xl sm:rounded-3xl p-8 sm:p-12 text-center border-2 border-dashed border-sky-200 shadow-sm space-y-5">
              <div className="w-16 h-16 rounded-2xl bg-sky-50 text-blue-500 flex items-center justify-center mx-auto">
                <BookOpen className="w-8 h-8 text-blue-500" />
              </div>
              <div className="space-y-1.5">
                <h3 className="font-bold text-slate-800 text-base sm:text-lg">
                  ยังไม่มีข้อมูลของหนังสือในคลัง
                </h3>
                <p className="text-xs sm:text-sm text-slate-500 max-w-md mx-auto">
                  คุณสามารถเริ่มต้นด้วยการลงทะเบียนหนังสือเล่มแรก และกำหนดรหัสหนังสือสำหรับใช้ในระบบห้องสมุด
                </p>
              </div>
              <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
                <Link
                  href="/books/new"
                  className="px-5 py-2.5 bg-gradient-to-r from-blue-600 to-sky-600 hover:from-blue-700 hover:to-sky-700 text-white rounded-xl text-xs font-bold shadow-md shadow-blue-500/20 transition-all flex items-center gap-1.5 whitespace-nowrap hover:scale-105 active:scale-95"
                >
                  <Plus className="w-4 h-4" />
                  <span>+ เพิ่มหนังสือเล่มแรก (กำหนดรหัสหนังสือ)</span>
                </Link>
                <Link
                  href="/admin"
                  className="px-5 py-2.5 bg-sky-50 hover:bg-sky-100 text-blue-700 border border-sky-200 rounded-xl text-xs font-semibold transition-all whitespace-nowrap"
                >
                  ตั้งค่าระยะเวลายืม-คืน
                </Link>
              </div>
            </div>
          ) : (
            /* Regular User Empty State */
            <div className="bg-white rounded-2xl sm:rounded-3xl p-10 sm:p-16 text-center border-2 border-dashed border-sky-200 shadow-sm space-y-4">
              <div className="w-16 h-16 rounded-2xl bg-sky-50 text-blue-500 flex items-center justify-center mx-auto">
                <BookOpen className="w-8 h-8 text-blue-500" />
              </div>
              <div className="space-y-1">
                <h3 className="font-bold text-slate-800 text-base sm:text-lg">
                  ยังไม่มีข้อมูลของหนังสือในคลัง
                </h3>
                <p className="text-xs sm:text-sm text-slate-500 max-w-md mx-auto">
                  ผู้ดูแลระบบจะใส่ข้อมูลของหนังสือเข้ามาในภายหลัง
                </p>
              </div>
            </div>
          )
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 sm:gap-4">
            {displayedBooks.map((book) => (
              <BookCard
                key={book.id}
                book={book}
                onView={(b) => setSelectedBookForView(b)}
                onBorrow={(b) => setSelectedBookForBorrow(b)}
              />
            ))}
          </div>
        )}
      </section>

      {/* Modals */}
      <BookModal
        book={selectedBookForView}
        onClose={() => setSelectedBookForView(null)}
        onBorrow={(b) => setSelectedBookForBorrow(b)}
      />

      <BorrowModal
        book={selectedBookForBorrow}
        onClose={() => setSelectedBookForBorrow(null)}
        onSuccess={(msg) => showToast(msg, 'success')}
      />

      <ReturnModal
        transaction={selectedTrxForReturn}
        onClose={() => setSelectedTrxForReturn(null)}
        onSuccess={(msg) => showToast(msg, 'success')}
      />
    </div>
  );
}
