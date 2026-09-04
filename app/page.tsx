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
  const { books, transactions, settings } = useLibrary();

  const [searchQuery] = useState('');
  const [selectedBookForView, setSelectedBookForView] = useState<Book | null>(null);
  const [selectedBookForBorrow, setSelectedBookForBorrow] = useState<Book | null>(null);
  const [selectedTrxForReturn, setSelectedTrxForReturn] = useState<BorrowTransaction | null>(null);
  const [toast, setToast] = useState<ToastMessage | null>(null);

  const availableBooks = books.filter((b) => b.status === 'AVAILABLE');
  const borrowedBooks = books.filter((b) => b.status === 'BORROWED');
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
    <div className="space-y-6 sm:space-y-8">
      <Toast toast={toast} onClose={() => setToast(null)} />

      {/* Blue / Sky Hero Banner */}
      <section className="relative overflow-hidden rounded-2xl sm:rounded-3xl bg-gradient-to-br from-blue-700 via-blue-600 to-sky-500 text-white p-6 sm:p-10 lg:p-12 shadow-xl shadow-blue-500/20 border border-blue-400/30">
        <div className="relative z-10 max-w-3xl space-y-3 sm:space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/15 backdrop-blur-md border border-white/25 text-xs font-semibold text-white shadow-2xs whitespace-nowrap">
            <Bookmark className="w-3.5 h-3.5 text-sky-200 fill-sky-200 shrink-0" />
            <span className="truncate">{settings.schoolName || '??????????????????? ????????????????????????? ?'}</span>
          </div>

          <h1 className="text-2xl sm:text-4xl lg:text-5xl font-black tracking-tight leading-tight">
            ????????????-??????????
          </h1>

          <p className="text-xs sm:text-sm text-sky-100/90 font-normal leading-relaxed max-w-2xl">
            ???????????? ???????????? ????????????????????-?????????? ?????????????????
          </p>

          {/* Action buttons */}
          <div className="flex flex-wrap items-center gap-2.5 sm:gap-3 pt-2 sm:pt-3">
            <Link
              href="/borrow-return"
              className="px-5 sm:px-6 py-2.5 sm:py-3 rounded-xl sm:rounded-2xl bg-white text-blue-700 hover:bg-sky-50 font-bold text-xs sm:text-sm shadow-lg shadow-blue-900/20 transition-all flex items-center gap-2 hover:scale-105 active:scale-95 whitespace-nowrap"
            >
              <ArrowLeftRight className="w-4 h-4 text-blue-600 shrink-0" />
              <span>????????????????????????? (???????)</span>
            </Link>

            <Link
              href="/quick-borrow"
              className="px-4 sm:px-5 py-2.5 sm:py-3 rounded-xl sm:rounded-2xl bg-blue-500/80 hover:bg-blue-500 text-white font-bold text-xs sm:text-sm backdrop-blur-md border border-white/25 transition-all flex items-center gap-2 hover:scale-105 active:scale-95 whitespace-nowrap"
            >
              <Zap className="w-4 h-4 text-amber-300 fill-amber-300 shrink-0" />
              <span>??????????????????????</span>
            </Link>

            <Link
              href="/admin"
              className="px-4 py-2.5 sm:py-3 rounded-xl sm:rounded-2xl bg-white/10 hover:bg-white/20 text-white font-medium text-xs sm:text-sm backdrop-blur-md border border-white/20 transition-all flex items-center gap-1.5 whitespace-nowrap"
            >
              <ShieldCheck className="w-4 h-4 text-sky-200 shrink-0" />
              <span>?????? / ???</span>
            </Link>
          </div>
        </div>

        {/* Decorative soft circles */}
        <div className="absolute -right-16 -bottom-16 w-72 sm:w-80 h-72 sm:h-80 bg-white/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute right-1/4 -top-16 w-60 h-60 bg-sky-300/20 rounded-full blur-2xl pointer-events-none" />
      </section>

      {/* Blue / Sky Stat Cards */}
      <section className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div className="bg-white rounded-2xl sm:rounded-3xl p-4 sm:p-5 border border-sky-100 shadow-sm hover:border-sky-200 transition-all flex items-center justify-between">
          <div className="min-w-0">
            <p className="text-xs font-medium text-slate-500 truncate whitespace-nowrap">?????????????</p>
            <h3 className="text-xl sm:text-2xl font-black text-blue-600 mt-1 truncate">{books.length} ????</h3>
            <p className="text-[11px] text-slate-400 mt-0.5 truncate whitespace-nowrap">??????????? {availableBooks.length} ????</p>
          </div>
          <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 ml-2">
            <BookOpen className="w-5 h-5 sm:w-6 sm:h-6" />
          </div>
        </div>

        <div className="bg-white rounded-2xl sm:rounded-3xl p-4 sm:p-5 border border-sky-100 shadow-sm hover:border-sky-200 transition-all flex items-center justify-between">
          <div className="min-w-0">
            <p className="text-xs font-medium text-slate-500 truncate whitespace-nowrap">???????????????</p>
            <h3 className="text-xl sm:text-2xl font-black text-amber-600 mt-1 truncate">{borrowedBooks.length} ????</h3>
            <p className="text-[11px] text-slate-400 mt-0.5 truncate whitespace-nowrap">????????? {overdueLoans.length} ????</p>
          </div>
          <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0 ml-2">
            <Clock className="w-5 h-5 sm:w-6 sm:h-6" />
          </div>
        </div>

        <div className="bg-white rounded-2xl sm:rounded-3xl p-4 sm:p-5 border border-sky-100 shadow-sm hover:border-sky-200 transition-all flex items-center justify-between">
          <div className="min-w-0">
            <p className="text-xs font-medium text-slate-500 truncate whitespace-nowrap">??????????????</p>
            <h3 className="text-xl sm:text-2xl font-black text-sky-600 mt-1 truncate">{transactions.length} ?????</h3>
            <p className="text-[11px] text-slate-400 mt-0.5 truncate whitespace-nowrap">?????????????????</p>
          </div>
          <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-sky-50 text-sky-600 flex items-center justify-center shrink-0 ml-2">
            <TrendingUp className="w-5 h-5 sm:w-6 sm:h-6" />
          </div>
        </div>

        <div className="bg-white rounded-2xl sm:rounded-3xl p-4 sm:p-5 border border-sky-100 shadow-sm hover:border-sky-200 transition-all flex items-center justify-between">
          <div className="min-w-0">
            <p className="text-xs font-medium text-slate-500 truncate whitespace-nowrap">???????????</p>
            <h3 className="text-xl sm:text-2xl font-black text-indigo-600 mt-1 truncate">{settings.studentBorrowDays} ???</h3>
            <p className="text-[11px] text-slate-400 mt-0.5 truncate whitespace-nowrap">????????? {settings.teacherBorrowDays} ???</p>
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
              <span>???????????????????????????</span>
            </h2>
            <p className="text-xs text-slate-500 font-normal mt-0.5">
              ??????????????????????????????????????????
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Link
              href="/books"
              className="text-xs font-semibold text-blue-600 hover:text-blue-700 bg-blue-50 hover:bg-blue-100 px-3.5 py-2 rounded-xl transition-all whitespace-nowrap"
            >
              ????????? ({books.length})
            </Link>
            <Link
              href="/books/new"
              className="inline-flex items-center gap-1.5 text-xs font-bold text-white bg-gradient-to-r from-blue-600 to-sky-600 hover:from-blue-700 hover:to-sky-700 px-3.5 py-2 rounded-xl transition-all shadow-md shadow-blue-500/20 whitespace-nowrap"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>+ ????????????????</span>
            </Link>
          </div>
        </div>

        {books.length === 0 ? (
          <div className="bg-white rounded-2xl sm:rounded-3xl p-10 sm:p-16 text-center border-2 border-dashed border-sky-200 shadow-sm space-y-4">
            <div className="w-16 h-16 rounded-2xl bg-sky-50 text-blue-500 flex items-center justify-center mx-auto">
              <BookOpen className="w-8 h-8 text-blue-500" />
            </div>
            <div>
              <h3 className="font-bold text-slate-800 text-base">??????????????? - ???????????????????????????</h3>
              <p className="text-xs text-slate-500 max-w-md mx-auto mt-1">
                ?????????????????????????????????????????????????????????????????????????
              </p>
            </div>
            <div className="flex flex-wrap justify-center gap-3 pt-2">
              <Link
                href="/books/new"
                className="px-5 py-2.5 bg-gradient-to-r from-blue-600 to-sky-600 text-white rounded-xl sm:rounded-2xl text-xs font-bold shadow-md shadow-blue-500/20 transition-all flex items-center gap-1.5"
              >
                <Plus className="w-4 h-4" />
                <span>??????????????????? (????????????????)</span>
              </Link>
              <Link
                href="/admin"
                className="px-4 py-2.5 bg-sky-50 hover:bg-sky-100 text-blue-700 rounded-xl sm:rounded-2xl text-xs font-semibold transition-all"
              >
                ??????????????????-???
              </Link>
            </div>
          </div>
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
