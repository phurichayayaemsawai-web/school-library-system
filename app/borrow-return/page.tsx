'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useLibrary } from '@/context/LibraryContext';
import { TeacherBorrowDesk } from '@/components/borrow/TeacherBorrowDesk';
import { StatCard } from '@/components/ui/StatCard';
import { Toast, ToastMessage } from '@/components/ui/Toast';
import { 
  ArrowLeftRight, 
  BookOpen, 
  Clock, 
  AlertTriangle, 
  CheckCircle2, 
  ShieldAlert
} from 'lucide-react';

export default function BorrowReturnPage() {
  const { books, transactions, settings, isAdmin } = useLibrary();
  const [toast, setToast] = useState<ToastMessage | null>(null);

  if (!isAdmin) {
    return (
      <div className="max-w-md mx-auto py-12 text-center space-y-4">
        <div className="w-16 h-16 rounded-2xl bg-amber-50 border border-amber-200 text-amber-600 flex items-center justify-center mx-auto">
          <ShieldAlert className="w-8 h-8" />
        </div>
        <h2 className="text-lg font-bold text-slate-900">หน้านี้สำหรับแอดมินหรือครูบรรณารักษ์เท่านั้น</h2>
        <p className="text-xs text-slate-500">
          กรุณาเข้าสู่ระบบแอดมินเพื่อใช้งานเคาน์เตอร์บันทึกการยืม-คืนหนังสือ
        </p>
        <Link
          href="/admin"
          className="inline-block px-5 py-2.5 bg-gradient-to-r from-blue-600 to-sky-600 text-white font-bold rounded-xl text-xs shadow-md shadow-blue-500/20 hover:scale-105 transition-all"
        >
          เข้าสู่ระบบแอดมิน
        </Link>
      </div>
    );
  }

  const bookIdSet = new Set(books.map((b) => b.id));
  const validTransactions = transactions.filter((t) => bookIdSet.has(t.bookId));

  const availableBooks = books.filter((b) => b.status === 'AVAILABLE');
  const activeLoans = validTransactions.filter((t) => t.status === 'ACTIVE' || t.status === 'OVERDUE');
  const overdueLoans = validTransactions.filter((t) => t.status === 'OVERDUE');
  const returnedLoans = validTransactions.filter((t) => t.status === 'RETURNED');

  const studentLoansCount = activeLoans.filter((t) => t.borrower.type === 'STUDENT').length;
  const teacherLoansCount = activeLoans.filter((t) => t.borrower.type === 'TEACHER').length;

  const showToast = (title: string, type: 'success' | 'error' | 'info' = 'success') => {
    setToast({
      id: Date.now().toString(),
      type,
      title,
    });
  };

  return (
    <div className="space-y-6 sm:space-y-8">
      <Toast toast={toast} onClose={() => setToast(null)} />

      {/* Header */}
      <div>
        <h1 className="text-xl sm:text-2xl font-bold text-slate-900 flex items-center gap-2.5">
          <ArrowLeftRight className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600 shrink-0" />
          <span>ระบบการยืม - คืนหนังสือ</span>
        </h1>
        <p className="text-xs text-slate-500 mt-1 font-normal truncate">
          {settings.schoolName || 'ห้องสมุดหมวดภาษาไทย โรงเรียนบรรหารแจ่มใสวิทยา ๓'}
        </p>
      </div>

      {/* Teacher Barcode / Book ID Borrow Desk */}
      <TeacherBorrowDesk onSuccess={(msg) => showToast(msg, 'success')} />

      {/* Stats Bar */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <StatCard
          title="รายการที่กำลังยืมอยู่"
          value={`${activeLoans.length} เล่ม`}
          subtitle={`นักเรียน ${studentLoansCount} • ครู ${teacherLoansCount}`}
          icon={Clock}
          color="blue"
        />

        <StatCard
          title="รายการเกินกำหนดส่ง"
          value={`${overdueLoans.length} เล่ม`}
          subtitle="ต้องการการติดตามทวงถาม"
          icon={AlertTriangle}
          color="rose"
        />

        <StatCard
          title="รับคืนแล้วทั้งหมด"
          value={`${returnedLoans.length} ครั้ง`}
          subtitle="ประวัติการส่งคืนสมบูรณ์"
          icon={CheckCircle2}
          color="emerald"
        />

        <StatCard
          title="หนังสือพร้อมให้ยืม"
          value={`${availableBooks.length} เล่ม`}
          subtitle={`จากคลังทั้งหมด ${books.length} เล่ม`}
          icon={BookOpen}
          color="sky"
        />
      </div>
    </div>
  );
}
