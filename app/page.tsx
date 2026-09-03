'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useLibrary } from '@/context/LibraryContext';
import { BookCard } from '@/components/books/BookCard';
import { BookModal } from '@/components/books/BookModal';
import { BorrowModal } from '@/components/borrow/BorrowModal';
import { ReturnModal } from '@/components/borrow/ReturnModal';
import { StatCard } from '@/components/ui/StatCard';
import { Toast, ToastMessage } from '@/components/ui/Toast';
import { Book, BorrowTransaction } from '@/types';
import { 
  BookOpen, 
  ArrowLeftRight, 
  Sparkles, 
  BookCheck, 
  Clock, 
  Search, 
  PlusCircle, 
  TrendingUp, 
  Zap, 
  ShieldCheck, 
  Heart,
  Plus
} from 'lucide-react';

export default function HomePage() {
  const { books, transactions, wishlists, settings } = useLibrary();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedBookForView, setSelectedBookForView] = useState<Book | null>(null);
  const [selectedBookForBorrow, setSelectedBookForBorrow] = useState<Book | null>(null);
  const [selectedTrxForReturn, setSelectedTrxForReturn] = useState<BorrowTransaction | null>(null);
  const [toast, setToast] = useState<ToastMessage | null>(null);

  const availableBooks = books.filter((b) => b.status === 'AVAILABLE');
  const borrowedBooks = books.filter((b) => b.status === 'BORROWED');
  const activeLoans = transactions.filter((t) => t.status === 'ACTIVE' || t.status === 'OVERDUE');
  const overdueLoans = transactions.filter((t) => t.status === 'OVERDUE');

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
    <div className="space-y-8">
      <Toast toast={toast} onClose={() => setToast(null)} />

      {/* Cute Pink Hero Banner */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-pink-500 via-rose-400 to-pink-400 text-white p-8 sm:p-12 shadow-xl shadow-pink-200/50 border border-pink-200">
        <div className="relative z-10 max-w-3xl space-y-3">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-white/20 backdrop-blur-md border border-white/30 text-xs font-bold text-white shadow-2xs">
            <Heart className="w-3.5 h-3.5 text-pink-100 fill-pink-100" />
            <span>{settings.schoolName || 'ห้องสมุดหมวดภาษาไทย โรงเรียนบรรหารแจ่มใสวิทยา ๓'}</span>
          </div>

          <h1 className="text-2xl sm:text-4xl lg:text-5xl font-black tracking-tight leading-tight">
            ระบบการจัดการการยืมคืนหนังสือ <br />
            <span className="text-white drop-shadow-xs">
              ของห้องสมุดหมวดภาษาไทย
            </span>
          </h1>

          <p className="text-xs sm:text-sm text-pink-50 font-medium leading-relaxed pt-1">
            ระบบการจัดการการยืมคืนหนังสือของห้องสมุดหมวดภาษาไทย
          </p>

          {/* Action buttons */}
          <div className="flex flex-wrap items-center gap-3 pt-3">
            <Link
              href="/borrow-return"
              className="px-6 py-3 rounded-2xl bg-white text-pink-600 hover:bg-pink-50 font-bold text-xs shadow-lg shadow-pink-600/20 transition-all flex items-center gap-2 hover:scale-105"
            >
              <ArrowLeftRight className="w-4 h-4 text-pink-500" />
              <span>เคาน์เตอร์ครูบันทึกการยืม (ใส่รหัส)</span>
            </Link>

            <Link
              href="/quick-borrow"
              className="px-5 py-3 rounded-2xl bg-pink-600/80 hover:bg-pink-600 text-white font-bold text-xs backdrop-blur-md border border-white/30 transition-all flex items-center gap-2"
            >
              <Zap className="w-4 h-4 text-amber-200 fill-amber-200" />
              <span>นักเรียนยืมหนังสือด่วน</span>
            </Link>

            <Link
              href="/admin"
              className="px-4 py-3 rounded-2xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs backdrop-blur-md border border-white/20 transition-all flex items-center gap-1.5"
            >
              <ShieldCheck className="w-4 h-4 text-pink-100" />
              <span>แอดมิน / ครู</span>
            </Link>
          </div>
        </div>

        {/* Decorative soft circles */}
        <div className="absolute -right-16 -bottom-16 w-80 h-80 bg-white/15 rounded-full blur-2xl pointer-events-none" />
        <div className="absolute right-1/3 -top-16 w-64 h-64 bg-pink-300/30 rounded-full blur-2xl pointer-events-none" />
      </section>

      {/* Cute Pink Stat Cards */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-3xl p-5 border border-pink-100 shadow-sm shadow-pink-100 flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500">หนังสือในคลัง</p>
            <h3 className="text-2xl font-black text-pink-600 mt-1">{books.length} เล่ม</h3>
            <p className="text-[11px] text-slate-400 mt-0.5">พร้อมให้ยืม {availableBooks.length} เล่ม</p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-pink-50 text-pink-500 flex items-center justify-center">
            <BookOpen className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white rounded-3xl p-5 border border-pink-100 shadow-sm shadow-pink-100 flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500">กำลังถูกยืมอยู่</p>
            <h3 className="text-2xl font-black text-rose-600 mt-1">{borrowedBooks.length} เล่ม</h3>
            <p className="text-[11px] text-slate-400 mt-0.5">เกินกำหนด {overdueLoans.length} เล่ม</p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-500 flex items-center justify-center">
            <Clock className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white rounded-3xl p-5 border border-pink-100 shadow-sm shadow-pink-100 flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500">ยืมสะสมทั้งหมด</p>
            <h3 className="text-2xl font-black text-pink-700 mt-1">{transactions.length} ครั้ง</h3>
            <p className="text-[11px] text-slate-400 mt-0.5">สถิติการยืมในระบบ</p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-pink-50 text-pink-600 flex items-center justify-center">
            <TrendingUp className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white rounded-3xl p-5 border border-pink-100 shadow-sm shadow-pink-100 flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500">ระยะเวลายืม</p>
            <h3 className="text-2xl font-black text-pink-600 mt-1">{settings.studentBorrowDays} วัน</h3>
            <p className="text-[11px] text-slate-400 mt-0.5">ครูยืมได้ {settings.teacherBorrowDays} วัน</p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-pink-50 text-pink-500 flex items-center justify-center">
            <Heart className="w-6 h-6" />
          </div>
        </div>
      </section>

      {/* Book Catalog Section or Clean State */}
      <section className="space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
              <BookCheck className="w-5 h-5 text-pink-500" />
              แคตตาล็อกหนังสือหมวดภาษาไทย
            </h2>
            <p className="text-xs text-pink-700 font-medium mt-0.5">
              ระบบการจัดการการยืมคืนหนังสือของห้องสมุดหมวดภาษาไทย
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Link
              href="/books/new"
              className="inline-flex items-center gap-1.5 text-xs font-bold text-white bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 px-4 py-2.5 rounded-2xl transition-all shadow-md shadow-pink-200"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>+ เพิ่มหนังสือใหม่</span>
            </Link>
          </div>
        </div>

        {books.length === 0 ? (
          <div className="bg-white rounded-3xl p-16 text-center border-2 border-dashed border-pink-200 shadow-sm space-y-4">
            <div className="w-16 h-16 rounded-2xl bg-pink-50 text-pink-500 flex items-center justify-center mx-auto">
              <BookOpen className="w-8 h-8 text-pink-400" />
            </div>
            <div>
              <h3 className="font-bold text-slate-800 text-base">ระบบพร้อมใช้งาน — ยังไม่มีข้อมูลหนังสือในคลัง</h3>
              <p className="text-xs text-slate-400 max-w-md mx-auto mt-1">
                คุณครูสามารถเริ่มต้นใส่รหัสหนังสือและข้อมูลหนังสือเล่มแรกเข้าระบบได้ทันที
              </p>
            </div>
            <div className="flex justify-center gap-3 pt-2">
              <Link
                href="/books/new"
                className="px-5 py-2.5 bg-gradient-to-r from-pink-500 to-rose-500 text-white rounded-2xl text-xs font-bold shadow-md shadow-pink-200 transition-all flex items-center gap-1.5"
              >
                <PlusCircle className="w-4 h-4" />
                <span>เพิ่มหนังสือเล่มแรก (กำหนดรหัสหนังสือ)</span>
              </Link>
              <Link
                href="/admin"
                className="px-4 py-2.5 bg-pink-50 hover:bg-pink-100 text-pink-700 rounded-2xl text-xs font-semibold transition-all"
              >
                ตั้งค่าระยะเวลายืม-คืน
              </Link>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
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
