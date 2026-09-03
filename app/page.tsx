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
  GraduationCap, 
  UserCheck, 
  ArrowRight
} from 'lucide-react';

export default function HomePage() {
  const { books, transactions, wishlists } = useLibrary();

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
            <span>ระบบห้องสมุดโรงเรียนยุคใหม่ 2567-2569</span>
          </div>

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight leading-tight">
            ระบบจัดการยืม - คืนหนังสือ <br />
            <span className="bg-gradient-to-r from-amber-300 via-emerald-300 to-sky-300 bg-clip-text text-transparent">
              สำหรับโรงเรียนและคณะครู
            </span>
          </h1>

          <p className="text-sm sm:text-base text-indigo-100/90 leading-relaxed font-light">
            บันทึกการยืม-คืนสะดวกรวดเร็ว รองรับข้อมูลนักเรียนและครูแยกประเภทอย่างชัดเจน
            พร้อมระบบให้ครูร่วมเสนอจัดซื้อหนังสือใหม่เข้าห้องสมุด
          </p>

          {/* Quick search inside hero */}
          <div className="pt-2">
            <div className="relative max-w-xl">
              <Search className="w-5 h-5 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="ค้นหาชื่อหนังสือ, ผู้แต่ง, หรือหมวดหมู่..."
                className="w-full pl-12 pr-4 py-3.5 bg-white text-slate-900 rounded-2xl shadow-lg text-sm focus:outline-none focus:ring-4 focus:ring-indigo-400/40 font-medium placeholder-slate-400"
              />
            </div>
          </div>

          {/* Action links */}
          <div className="flex flex-wrap items-center gap-3 pt-4">
            <Link
              href="/borrow-return"
              className="px-5 py-2.5 rounded-xl bg-indigo-500 hover:bg-indigo-400 text-white font-bold text-xs shadow-lg transition-all flex items-center gap-2"
            >
              <ArrowLeftRight className="w-4 h-4" />
              <span>ทำรายการ ยืม-คืน หนังสือ</span>
            </Link>

            <Link
              href="/wishlist"
              className="px-5 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs backdrop-blur-md border border-white/20 transition-all flex items-center gap-2"
            >
              <Sparkles className="w-4 h-4 text-amber-300" />
              <span>ครูเสนอสั่งซื้อหนังสือ</span>
            </Link>

            <Link
              href="/books/new"
              className="px-4 py-2.5 rounded-xl bg-slate-800/80 hover:bg-slate-800 text-slate-200 font-semibold text-xs border border-slate-700 transition-all flex items-center gap-1.5"
            >
              <PlusCircle className="w-4 h-4" />
              <span>เพิ่มหนังสือใหม่</span>
            </Link>
          </div>
        </div>

        {/* Decorative background glow */}
        <div className="absolute -right-20 -bottom-20 w-96 h-96 bg-indigo-500/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute right-1/4 -top-20 w-80 h-80 bg-purple-500/20 rounded-full blur-3xl pointer-events-none" />
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
          subtitle={`ค้างส่งเกินกำหนด ${overdueLoans.length} เล่ม`}
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
          title="คำขอเสนอซื้อ (ครู)"
          value={`${wishlists.length} เล่ม`}
          subtitle="รอการพิจารณาจัดซื้อ"
          icon={Sparkles}
          color="purple"
        />
      </section>

      {/* Main Content: Featured Catalog */}
      <section className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
              <BookCheck className="w-5 h-5 text-indigo-600" />
              แคตตาล็อกหนังสือแนะนำ
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              ค้นหาและยืมหนังสือเรียน วรรณกรรม และเอกสารวิชาการ
            </p>
          </div>

          <Link
            href="/books"
            className="inline-flex items-center gap-1 text-xs font-bold text-indigo-600 hover:text-indigo-800 bg-indigo-50 hover:bg-indigo-100 px-3.5 py-2 rounded-xl transition-colors self-start sm:self-auto"
          >
            <span>ดูหนังสือทั้งหมด ({books.length})</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {displayedBooks.length === 0 ? (
          <div className="bg-white rounded-3xl p-12 text-center border border-slate-200 shadow-sm space-y-3">
            <BookOpen className="w-10 h-10 text-slate-300 mx-auto" />
            <h3 className="font-bold text-slate-700 text-sm">ไม่พบหนังสือที่ตรงกับคำค้นหา</h3>
            <p className="text-xs text-slate-400">ลองเปลี่ยนคำค้นหา หรือกดดูแคตตาล็อกทั้งหมด</p>
            <button
              onClick={() => setSearchQuery('')}
              className="px-4 py-2 bg-indigo-50 text-indigo-600 rounded-xl text-xs font-semibold"
            >
              ล้างคำค้นหา
            </button>
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

      {/* Active Loans & Quick Return Overview */}
      <section className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <ArrowLeftRight className="w-5 h-5 text-indigo-600" />
              รายการหนังสือที่กำลังถูกยืม ({activeLoans.length} รายการ)
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              ตรวจสอบสถานะและบันทึกการรับคืนหนังสือ
            </p>
          </div>

          <Link
            href="/borrow-return"
            className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 flex items-center gap-1 self-start sm:self-auto"
          >
            <span>เข้าสู่หน้าระบบ ยืม-คืน เต็มรูปแบบ</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {activeLoans.length === 0 ? (
          <div className="text-center py-8 text-slate-400 text-xs">
            ไม่มีหนังสือที่อยู่ระหว่างการยืมในขณะนี้
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {activeLoans.slice(0, 3).map((trx) => (
              <div
                key={trx.id}
                className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col justify-between gap-3"
              >
                <div className="flex items-start gap-3">
                  <img
                    src={trx.bookCoverUrl}
                    alt={trx.bookTitle}
                    className="w-12 h-16 object-cover rounded-lg bg-slate-200 shadow-xs flex-shrink-0"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = 'https://placehold.co/100x150/e2e8f0/475569?text=Book';
                    }}
                  />
                  <div className="min-w-0 flex-1">
                    <span className="text-[10px] font-mono font-bold text-indigo-600 bg-indigo-50 px-1.5 py-0.5 rounded">
                      {trx.bookId}
                    </span>
                    <h4 className="text-xs font-bold text-slate-800 truncate mt-1">
                      {trx.bookTitle}
                    </h4>
                    <p className="text-[11px] text-slate-500 mt-0.5 flex items-center gap-1">
                      {trx.borrower.type === 'STUDENT' ? (
                        <GraduationCap className="w-3 h-3 text-sky-600" />
                      ) : (
                        <UserCheck className="w-3 h-3 text-purple-600" />
                      )}
                      <span className="truncate">{trx.borrower.name}</span>
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-slate-200/80 text-xs">
                  <span className="text-[11px] text-slate-500">
                    กำหนดคืน: <strong className="text-slate-700">{trx.dueDate}</strong>
                  </span>
                  <button
                    onClick={() => setSelectedTrxForReturn(trx)}
                    className="px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold transition-colors shadow-xs"
                  >
                    รับคืน
                  </button>
                </div>
              </div>
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
