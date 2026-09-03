'use client';

import React from 'react';
import Link from 'next/link';
import { useLibrary } from '@/context/LibraryContext';
import { StatCard } from '@/components/ui/StatCard';
import { formatThaiDate } from '@/lib/utils';
import { 
  LayoutDashboard, 
  BookOpen, 
  ArrowLeftRight, 
  Sparkles, 
  Clock, 
  AlertTriangle, 
  TrendingUp, 
  GraduationCap, 
  UserCheck, 
  PieChart, 
  Bookmark,
  ArrowRight
} from 'lucide-react';

export default function LibraryDashboardPage() {
  const { books, transactions, wishlists } = useLibrary();

  const availableBooks = books.filter((b) => b.status === 'AVAILABLE');
  const borrowedBooks = books.filter((b) => b.status === 'BORROWED');
  const activeLoans = transactions.filter((t) => t.status === 'ACTIVE' || t.status === 'OVERDUE');
  const overdueLoans = transactions.filter((t) => t.status === 'OVERDUE');
  const returnedLoans = transactions.filter((t) => t.status === 'RETURNED');

  const studentLoansCount = transactions.filter((t) => t.borrower.type === 'STUDENT').length;
  const teacherLoansCount = transactions.filter((t) => t.borrower.type === 'TEACHER').length;

  // Top borrowed books
  const topBooks = [...books].sort((a, b) => b.totalBorrowedCount - a.totalBorrowedCount).slice(0, 5);

  // Category counts
  const categoryCounts: Record<string, number> = {};
  books.forEach((b) => {
    categoryCounts[b.category] = (categoryCounts[b.category] || 0) + 1;
  });
  const categoryList = Object.entries(categoryCounts).sort((a, b) => b[1] - a[1]);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2.5">
            <LayoutDashboard className="w-6 h-6 text-indigo-600" />
            แดชบอร์ดภาพรวมสถิติห้องสมุด (Library Intelligence)
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            สรุปข้อมูลสถิติทรัพยากรหนังสือ อัตราการยืม-คืน และความต้องการหนังสือของโรงเรียน
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href="/borrow-return"
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-md shadow-indigo-200 transition-all flex items-center gap-1.5"
          >
            <ArrowLeftRight className="w-4 h-4" />
            <span>ไปที่ระบบยืม-คืน</span>
          </Link>
        </div>
      </div>

      {/* 4 Main Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="จำนวนหนังสือทั้งหมด"
          value={`${books.length} เล่ม`}
          subtitle={`ยืมได้ ${availableBooks.length} • ถูกยืม ${borrowedBooks.length}`}
          icon={BookOpen}
          color="indigo"
        />

        <StatCard
          title="อัตราการยืมในระบบ"
          value={`${Math.round((borrowedBooks.length / (books.length || 1)) * 100)}%`}
          subtitle={`กำลังยืม ${activeLoans.length} เล่ม`}
          icon={TrendingUp}
          color="blue"
        />

        <StatCard
          title="รายการเกินกำหนดส่ง"
          value={`${overdueLoans.length} รายการ`}
          subtitle="ต้องการการติดตามทวงคืน"
          icon={AlertTriangle}
          color="rose"
        />

        <StatCard
          title="รายการเสนอซื้อ (ครู)"
          value={`${wishlists.length} รายการ`}
          subtitle={`อนุมัติแล้ว ${wishlists.filter((w) => w.status === 'APPROVED' || w.status === 'ORDERED').length} รายการ`}
          icon={Sparkles}
          color="purple"
        />
      </div>

      {/* Mid Section: Top Books & Category Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left: Top 5 Most Borrowed Books */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-indigo-600" />
              5 อันดับหนังสือยอดนิยม (ยืมบ่อยที่สุด)
            </h3>
            <span className="text-xs text-slate-400">สถิติสะสม</span>
          </div>

          <div className="space-y-3">
            {topBooks.map((book, idx) => (
              <div
                key={book.id}
                className="flex items-center gap-3 p-3 bg-slate-50 hover:bg-indigo-50/50 rounded-2xl border border-slate-100 transition-colors"
              >
                <div
                  className={`w-7 h-7 rounded-xl flex items-center justify-center font-bold text-xs flex-shrink-0 ${
                    idx === 0
                      ? 'bg-amber-100 text-amber-800'
                      : idx === 1
                      ? 'bg-slate-200 text-slate-700'
                      : idx === 2
                      ? 'bg-orange-100 text-orange-800'
                      : 'bg-slate-100 text-slate-500'
                  }`}
                >
                  {idx + 1}
                </div>

                <img
                  src={book.coverUrl}
                  alt={book.title}
                  className="w-10 h-14 object-cover rounded-lg bg-slate-200 shadow-2xs flex-shrink-0"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = 'https://placehold.co/100x150/e2e8f0/475569?text=Book';
                  }}
                />

                <div className="min-w-0 flex-1">
                  <h4 className="text-xs font-bold text-slate-800 truncate">{book.title}</h4>
                  <p className="text-[11px] text-slate-500 truncate">{book.author} • {book.category}</p>
                </div>

                <div className="text-right flex-shrink-0">
                  <span className="text-xs font-bold text-indigo-600">{book.totalBorrowedCount}</span>
                  <span className="text-[10px] text-slate-400 block">ครั้ง</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right: Category Distribution */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
              <PieChart className="w-4 h-4 text-indigo-600" />
              การกระจายตัวของหนังสือตามหมวดหมู่วิชา
            </h3>
            <span className="text-xs text-slate-400">{categoryList.length} หมวดหมู่</span>
          </div>

          <div className="space-y-3 pt-1">
            {categoryList.slice(0, 6).map(([cat, count]) => {
              const percentage = Math.round((count / (books.length || 1)) * 100);

              return (
                <div key={cat} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-slate-700 truncate max-w-xs">{cat}</span>
                    <span className="font-mono text-slate-500">
                      {count} เล่ม ({percentage}%)
                    </span>
                  </div>
                  <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-indigo-500 to-indigo-600 rounded-full"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Bottom Row: Borrower Types Statistics & Quick Actions */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        {/* Borrower Type ratio */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4">
          <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
            <GraduationCap className="w-4 h-4 text-indigo-600" />
            สัดส่วนผู้ใช้บริการยืมหนังสือ
          </h3>

          <div className="grid grid-cols-2 gap-4 pt-2">
            <div className="p-4 bg-sky-50/80 rounded-2xl border border-sky-100 text-center space-y-1">
              <GraduationCap className="w-6 h-6 text-sky-600 mx-auto" />
              <p className="text-xs text-sky-800 font-semibold">กลุ่มนักเรียน</p>
              <h4 className="text-2xl font-black text-sky-950">{studentLoansCount} ครั้ง</h4>
              <p className="text-[10px] text-sky-600">ยืมเฉลี่ย 7 วัน/ครั้ง</p>
            </div>

            <div className="p-4 bg-purple-50/80 rounded-2xl border border-purple-100 text-center space-y-1">
              <UserCheck className="w-6 h-6 text-purple-600 mx-auto" />
              <p className="text-xs text-purple-800 font-semibold">กลุ่มครู / บุคลากร</p>
              <h4 className="text-2xl font-black text-purple-950">{teacherLoansCount} ครั้ง</h4>
              <p className="text-[10px] text-purple-600">ยืมเฉลี่ย 14 วัน/ครั้ง</p>
            </div>
          </div>
        </div>

        {/* Quick Links & Shortcuts */}
        <div className="bg-gradient-to-br from-indigo-50 via-slate-50 to-purple-50 rounded-3xl p-6 border border-indigo-100 shadow-sm flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Bookmark className="w-4 h-4 text-indigo-600" />
              การเข้าถึงระบบด่วน
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              ลิงก์ไปยังโมดูลหลักของระบบห้องสมุดโรงเรียน
            </p>
          </div>

          <div className="grid grid-cols-2 gap-2.5 pt-4">
            <Link
              href="/books/new"
              className="p-3 bg-white hover:bg-indigo-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 transition-colors flex items-center justify-between"
            >
              <span>+ เพิ่มหนังสือใหม่</span>
              <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
            </Link>

            <Link
              href="/borrow-return"
              className="p-3 bg-white hover:bg-indigo-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 transition-colors flex items-center justify-between"
            >
              <span>ทำรายการยืม-คืน</span>
              <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
            </Link>

            <Link
              href="/wishlist"
              className="p-3 bg-white hover:bg-indigo-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 transition-colors flex items-center justify-between"
            >
              <span>ครูเสนอซื้อหนังสือ</span>
              <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
            </Link>

            <Link
              href="/wishlist/dashboard"
              className="p-3 bg-white hover:bg-indigo-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 transition-colors flex items-center justify-between"
            >
              <span>วิเคราะห์จัดซื้อ</span>
              <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
