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
  ArrowRight,
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

  // Filter books for quick catalog section
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
    <div className="space-y-10">
      <Toast toast={toast} onClose={() => setToast(null)} />

      {/* Hero Section */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-900 via-indigo-800 to-slate-900 text-white p-8 sm:p-12 shadow-2xl border border-indigo-700/40">
        <div className="relative z-10 max-w-3xl space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-xs font-semibold text-indigo-200">
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            <span>{settings.schoolName || 'ระบบห้องสมุดโรงเรียน'}</span>
          </div>

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight leading-tight">
            ระบบจัดการยืม - คืนหนังสือ <br />
            <span className="bg-gradient-to-r from-amber-300 via-emerald-300 to-sky-300 bg-clip-text text-transparent">
              สะดวกรวดเร็ว แม่นยำ Real-time
            </span>
          </h1>

          <p className="text-sm sm:text-base text-indigo-100/90 leading-relaxed font-light">
            นักเรียนยืมหนังสือได้ใน 10 วินาที ระบบบันทึกสถานะทันที พร้อมระบบแอดมินสำหรับครูกำหนดระยะเวลายืม-คืน
          </p>

          {/* Action links */}
          <div className="flex flex-wrap items-center gap-3 pt-4">
            <Link
              href="/quick-borrow"
              className="px-6 py-3 rounded-2xl bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-500 hover:to-amber-600 text-slate-950 font-black text-xs shadow-lg shadow-amber-500/30 transition-all flex items-center gap-2 hover:scale-105"
            >
              <Zap className="w-4 h-4 fill-slate-950" />
              <span>นักเรียนยืมหนังสือด่วน</span>
            </Link>

            <Link
              href="/borrow-return"
              className="px-5 py-3 rounded-2xl bg-indigo-500 hover:bg-indigo-400 text-white font-bold text-xs shadow-md transition-all flex items-center gap-2"
            >
              <ArrowLeftRight className="w-4 h-4" />
              <span>รายการยืม - คืน</span>
            </Link>

            <Link
              href="/admin"
              className="px-4 py-3 rounded-2xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs backdrop-blur-md border border-white/20 transition-all flex items-center gap-1.5"
            >
              <ShieldCheck className="w-4 h-4 text-emerald-300" />
              <span>แอดมิน / ครูตั้งค่า</span>
            </Link>
          </div>
        </div>

        {/* Decorative background glow */}
        <div className="absolute -right-20 -bottom-20 w-96 h-96 bg-indigo-500/20 rounded-full blur-3xl pointer-events-none" />
      </section>

      {/* Quick Statistics Bar */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="หนังสือทั้งหมดในคลัง"
          value={`${books.length} เล่ม`}
          subtitle={`พร้อมให้ยืม ${availableBooks.length} เล่ม`}
          icon={BookOpen}
          color="indigo"
        />

        <StatCard
          title="กำลังถูกยืมอยู่"
          value={`${borrowedBooks.length} เล่ม`}
          subtitle={`เกินกำหนดส่ง ${overdueLoans.length} เล่ม`}
          icon={Clock}
          color="amber"
        />

        <StatCard
          title="รายการยืมสะสม"
          value={`${transactions.length} ครั้ง`}
          subtitle="ประวัติการหมุนเวียนหนังสือ"
          icon={TrendingUp}
          color="emerald"
        />

        <StatCard
          title="ระยะเวลายืมที่ตั้งไว้"
          value={`นักเรียน ${settings.studentBorrowDays} วัน`}
          subtitle={`ครู ${settings.teacherBorrowDays} วัน`}
          icon={Clock}
          color="purple"
        />
      </section>

      {/* Main Content: Featured Catalog or Empty State */}
      <section className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
              <BookCheck className="w-5 h-5 text-indigo-600" />
              แคตตาล็อกหนังสือในห้องสมุด
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              ค้นหาและยืมหนังสือเรียน วรรณกรรม และเอกสารวิชาการ
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Link
              href="/books/new"
              className="inline-flex items-center gap-1.5 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 px-3.5 py-2 rounded-xl transition-all shadow-sm"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>+ เพิ่มหนังสือใหม่</span>
            </Link>
          </div>
        </div>

        {books.length === 0 ? (
          <div className="bg-white rounded-3xl p-16 text-center border border-dashed border-slate-300 shadow-sm space-y-4">
            <div className="w-16 h-16 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto">
              <BookOpen className="w-8 h-8 text-indigo-500" />
            </div>
            <div>
              <h3 className="font-bold text-slate-800 text-base">ระบบพร้อมใช้งาน — ยังไม่มีข้อมูลหนังสือในคลัง</h3>
              <p className="text-xs text-slate-400 max-w-md mx-auto mt-1">
                คุณสามารถเริ่มต้นใส่ข้อมูลหนังสือเล่มแรก หรือให้นักเรียนเริ่มยืมได้ทันทีที่เพิ่มหนังสือ
              </p>
            </div>
            <div className="flex justify-center gap-3 pt-2">
              <Link
                href="/books/new"
                className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-md shadow-indigo-200 transition-all flex items-center gap-1.5"
              >
                <PlusCircle className="w-4 h-4" />
                <span>เพิ่มหนังสือเล่มแรก</span>
              </Link>
              <Link
                href="/admin"
                className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold transition-all"
              >
                ไปที่หน้าแอดมิน / โหลดตัวอย่างทดสอบ
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
