"use client";
import React, { useState } from "react";
import Link from "next/link";
import { useLibrary } from "@/context/LibraryContext";
import { BookCard } from "@/components/BookCard";
import { BookModal } from "@/components/BookModal";
import { BorrowModal } from "@/components/BorrowModal";
import { Toast, ToastData } from "@/components/Toast";
import { BookOpen, Search, Plus, Filter, BookCheck, Clock } from "lucide-react";
import { BOOK_CATEGORIES } from "@/constants/library";
import { Book } from "@/types";

export default function BooksPage() {
  const { books, isAdmin, deleteBook } = useLibrary();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("ALL");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [viewBook, setViewBook] = useState<Book | null>(null);
  const [borrowBook, setBorrowBook] = useState<Book | null>(null);
  const [toast, setToast] = useState<ToastData | null>(null);

  const filteredBooks = books.filter((book) => {
    const q = searchQuery.toLowerCase().trim();
    const matchesSearch =
      !q ||
      book.title.toLowerCase().includes(q) ||
      book.author.toLowerCase().includes(q) ||
      book.isbn.toLowerCase().includes(q) ||
      book.id.toLowerCase().includes(q);

    const matchesCategory = selectedCategory === "ALL" || book.category === selectedCategory;
    const matchesStatus = statusFilter === "ALL" || book.status === statusFilter;

    return matchesSearch && matchesCategory && matchesStatus;
  });

  const showToast = (title: string, type: ToastData["type"] = "success") => {
    setToast({
      id: Date.now().toString(),
      type,
      title,
    });
  };

  return (
    <div className="space-y-6">
      <Toast toast={toast} onClose={() => setToast(null)} />

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

        {isAdmin && (
          <Link
            href="/books/new"
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-blue-600 to-sky-600 hover:from-blue-700 hover:to-sky-700 text-white rounded-xl text-xs font-bold shadow-md shadow-blue-500/20 transition-all self-start sm:self-auto whitespace-nowrap hover:scale-105 active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span>เพิ่มหนังสือใหม่</span>
          </Link>
        )}
      </div>

      {/* Filter Bar */}
      <div className="bg-white rounded-2xl sm:rounded-3xl p-4 sm:p-5 border border-slate-200/80 shadow-xs space-y-3.5">
        <div className="flex flex-col sm:flex-row gap-2.5 sm:gap-3 items-stretch sm:items-center justify-between">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 shrink-0" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="ค้นหาชื่อหนังสือ, ผู้แต่ง, ISBN หรือรหัส..."
              className="w-full pl-10 pr-12 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all text-slate-800 placeholder-slate-400"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-semibold text-slate-400 hover:text-slate-600 bg-slate-200/60 px-1.5 py-0.5 rounded"
              >
                ล้าง
              </button>
            )}
          </div>

          <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-xl shrink-0">
            <button
              onClick={() => setStatusFilter("ALL")}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all whitespace-nowrap ${
                statusFilter === "ALL" ? "bg-white text-slate-900 shadow-2xs" : "text-slate-600 hover:text-slate-900"
              }`}
            >
              ทั้งหมด
            </button>
            <button
              onClick={() => setStatusFilter("AVAILABLE")}
              className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all whitespace-nowrap ${
                statusFilter === "AVAILABLE" ? "bg-emerald-600 text-white shadow-2xs" : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <BookCheck className="w-3.5 h-3.5 shrink-0" />
              <span>ยืมได้</span>
            </button>
            <button
              onClick={() => setStatusFilter("BORROWED")}
              className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all whitespace-nowrap ${
                statusFilter === "BORROWED" ? "bg-rose-600 text-white shadow-2xs" : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <Clock className="w-3.5 h-3.5 shrink-0" />
              <span>ถูกยืม</span>
            </button>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2.5 pt-2.5 border-t border-slate-100">
          <div className="flex items-center gap-2 flex-wrap w-full sm:w-auto">
            <span className="text-xs font-semibold text-slate-500 flex items-center gap-1 whitespace-nowrap">
              <Filter className="w-3.5 h-3.5 text-blue-600 shrink-0" /> หมวดหมู่:
            </span>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="text-xs py-1.5 px-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium cursor-pointer max-w-full"
            >
              <option value="ALL">ทุกหมวดหมู่ ({BOOK_CATEGORIES.length} หมวด)</option>
              {BOOK_CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          <div className="text-xs text-slate-500 whitespace-nowrap">
            พบหนังสือทั้งหมด <strong className="text-blue-600 font-bold">{filteredBooks.length}</strong> เล่ม
          </div>
        </div>
      </div>

      {/* Book Grid */}
      {books.length === 0 ? (
        isAdmin ? (
          <div className="bg-white rounded-2xl sm:rounded-3xl p-10 sm:p-16 text-center border-2 border-dashed border-sky-200 shadow-sm space-y-4">
            <div className="w-16 h-16 rounded-2xl bg-sky-50 text-blue-500 flex items-center justify-center mx-auto">
              <BookOpen className="w-8 h-8 text-blue-500" />
            </div>
            <div className="space-y-1">
              <h3 className="font-bold text-slate-800 text-base sm:text-lg">
                ยังไม่มีข้อมูลของหนังสือในคลัง
              </h3>
              <p className="text-xs sm:text-sm text-slate-500 max-w-md mx-auto">
                คุณสามารถเริ่มต้นด้วยการลงทะเบียนหนังสือเล่มแรก และกำหนดรหัสหนังสือสำหรับใช้ในระบบห้องสมุด
              </p>
            </div>
            <div className="pt-2">
              <Link
                href="/books/new"
                className="inline-flex items-center gap-1.5 px-5 py-2.5 bg-gradient-to-r from-blue-600 to-sky-600 hover:from-blue-700 hover:to-sky-700 text-white rounded-xl text-xs font-bold shadow-md shadow-blue-500/20 transition-all hover:scale-105 active:scale-95 whitespace-nowrap"
              >
                <Plus className="w-4 h-4" />
                <span>+ เพิ่มหนังสือเล่มแรก (กำหนดรหัสหนังสือ)</span>
              </Link>
            </div>
          </div>
        ) : (
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
      ) : filteredBooks.length === 0 ? (
        <div className="bg-white rounded-2xl sm:rounded-3xl p-10 sm:p-16 text-center border border-sky-100 shadow-sm space-y-3">
          <BookOpen className="w-12 h-12 text-sky-300 mx-auto" />
          <h3 className="font-bold text-slate-700 text-base">ไม่พบหนังสือที่ตรงกับเงื่อนไขการค้นหา</h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            ลองปรับเปลี่ยนคำค้นหา เปลี่ยนหมวดหมู่ หรือกดปุ่มล้างตัวกรองด้านบน
          </p>
          <button
            onClick={() => {
              setSearchQuery("");
              setSelectedCategory("ALL");
              setStatusFilter("ALL");
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
              onView={(b) => setViewBook(b)}
              onBorrow={(b) => setBorrowBook(b)}
              onDelete={(b) => {
                deleteBook(b.id);
                showToast(`ลบหนังสือ "${b.title}" เรียบร้อยแล้ว`, "info");
              }}
            />
          ))}
        </div>
      )}

      {/* Modals */}
      <BookModal
        book={viewBook}
        onClose={() => setViewBook(null)}
        onBorrow={(b) => setBorrowBook(b)}
        onDelete={(b) => {
          deleteBook(b.id);
          showToast(`ลบหนังสือ "${b.title}" เรียบร้อยแล้ว`, "info");
        }}
      />

      <BorrowModal
        book={borrowBook}
        onClose={() => setBorrowBook(null)}
        onSuccess={(msg) => showToast(msg, "success")}
      />
    </div>
  );
}
