'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useLibrary } from '@/context/LibraryContext';
import { BookCard } from '@/components/books/BookCard';
import { BookModal } from '@/components/books/BookModal';
import { BookFilter } from '@/components/books/BookFilter';
import { BorrowModal } from '@/components/borrow/BorrowModal';
import { Toast, ToastMessage } from '@/components/ui/Toast';
import { Book, BookStatus } from '@/types';
import { BookOpen, PlusCircle } from 'lucide-react';

export default function BooksPage() {
  const { books } = useLibrary();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState<'ALL' | BookStatus>('ALL');

  const [selectedBookForView, setSelectedBookForView] = useState<Book | null>(null);
  const [selectedBookForBorrow, setSelectedBookForBorrow] = useState<Book | null>(null);
  const [toast, setToast] = useState<ToastMessage | null>(null);

  // Filter books
  const filteredBooks = books.filter((book) => {
    const q = searchQuery.toLowerCase().trim();
    const matchesQuery =
      !q ||
      book.title.toLowerCase().includes(q) ||
      book.author.toLowerCase().includes(q) ||
      book.isbn.toLowerCase().includes(q) ||
      book.id.toLowerCase().includes(q);

    const matchesCategory = selectedCategory === 'ALL' || book.category === selectedCategory;
    const matchesStatus = statusFilter === 'ALL' || book.status === statusFilter;

    return matchesQuery && matchesCategory && matchesStatus;
  });

  const showToast = (title: string, type: 'success' | 'error' | 'info' = 'success') => {
    setToast({
      id: Date.now().toString(),
      type,
      title,
    });
  };

  return (
    <div className="space-y-6">
      <Toast toast={toast} onClose={() => setToast(null)} />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 flex items-center gap-2.5">
            <BookOpen className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600 shrink-0" />
            <span>แคตตาล็อกหนังสือห้องสมุด</span>
          </h1>
          <p className="text-xs text-slate-500 mt-1 font-normal">
            ค้นหา ตรวจสอบสถานะการยืม และทำรายการยืมหนังสือออนไลน์
          </p>
        </div>

        <Link
          href="/books/new"
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-blue-600 to-sky-600 hover:from-blue-700 hover:to-sky-700 text-white rounded-xl text-xs font-bold shadow-md shadow-blue-500/20 transition-all self-start sm:self-auto whitespace-nowrap hover:scale-105 active:scale-95"
        >
          <PlusCircle className="w-4 h-4" />
          <span>เพิ่มหนังสือใหม่</span>
        </Link>
      </div>

      {/* Filter Component */}
      <BookFilter
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        selectedCategory={selectedCategory}
        onCategoryChange={setSelectedCategory}
        statusFilter={statusFilter}
        onStatusFilterChange={setStatusFilter}
        totalResults={filteredBooks.length}
      />

      {/* Book Grid */}
      {filteredBooks.length === 0 ? (
        <div className="bg-white rounded-2xl sm:rounded-3xl p-10 sm:p-16 text-center border border-sky-100 shadow-sm space-y-3">
          <BookOpen className="w-12 h-12 text-sky-300 mx-auto" />
          <h3 className="font-bold text-slate-700 text-base">ไม่พบหนังสือที่ตรงกับเงื่อนไขการค้นหา</h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            ลองปรับเปลี่ยนคำค้นหา เปลี่ยนหมวดหมู่ หรือกดปุ่มล้างตัวกรองด้านบน
          </p>
          <button
            onClick={() => {
              setSearchQuery('');
              setSelectedCategory('ALL');
              setStatusFilter('ALL');
            }}
            className="px-4 py-2 bg-sky-50 text-blue-700 rounded-xl text-xs font-semibold hover:bg-sky-100 transition-colors"
          >
            ล้างตัวกรองทั้งหมด
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 sm:gap-4">
          {filteredBooks.map((book) => (
            <BookCard
              key={book.id}
              book={book}
              onView={(b) => setSelectedBookForView(b)}
              onBorrow={(b) => setSelectedBookForBorrow(b)}
            />
          ))}
        </div>
      )}

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
    </div>
  );
}
