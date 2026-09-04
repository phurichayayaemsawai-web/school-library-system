'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useLibrary } from '@/context/LibraryContext';
import { TeacherBorrowDesk } from '@/components/borrow/TeacherBorrowDesk';
import { TransactionTable } from '@/components/borrow/TransactionTable';
import { ReturnModal } from '@/components/borrow/ReturnModal';
import { StatCard } from '@/components/ui/StatCard';
import { Toast, ToastMessage } from '@/components/ui/Toast';
import { BorrowTransaction } from '@/types';
import { 
  ArrowLeftRight, 
  BookOpen, 
  Clock, 
  AlertTriangle, 
  CheckCircle2, 
  History,
  ShieldCheck
} from 'lucide-react';

export default function BorrowReturnPage() {
  const { books, transactions, settings } = useLibrary();

  const [selectedTrxForReturn, setSelectedTrxForReturn] = useState<BorrowTransaction | null>(null);
  const [toast, setToast] = useState<ToastMessage | null>(null);

  const availableBooks = books.filter((b) => b.status === 'AVAILABLE');
  const activeLoans = transactions.filter((t) => t.status === 'ACTIVE' || t.status === 'OVERDUE');
  const overdueLoans = transactions.filter((t) => t.status === 'OVERDUE');
  const returnedLoans = transactions.filter((t) => t.status === 'RETURNED');

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

      {/* Header & Quick Action Buttons */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 flex items-center gap-2.5">
            <ArrowLeftRight className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600 shrink-0" />
            <span>ระบบการยืม - คืนหนังสือ</span>
          </h1>
          <p className="text-xs text-slate-500 mt-1 font-normal truncate">
            {settings.schoolName || 'ห้องสมุดหมวดภาษาไทย โรงเรียนบรรหารแจ่มใสวิทยา ๓'}
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          <Link
            href="/borrow-return/history"
            className="px-3.5 sm:px-4 py-2 sm:py-2.5 bg-sky-50 hover:bg-sky-100 text-blue-700 rounded-xl text-xs font-semibold transition-colors flex items-center gap-1.5 border border-sky-200 whitespace-nowrap"
          >
            <History className="w-4 h-4 text-blue-600" />
            <span>ดูประวัติยืม-คืนทั้งหมด</span>
          </Link>

          <Link
            href="/admin"
            className="px-3.5 sm:px-4 py-2 sm:py-2.5 bg-blue-700 hover:bg-blue-800 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shadow-md shadow-blue-500/20 whitespace-nowrap"
          >
            <ShieldCheck className="w-4 h-4 text-sky-200" />
            <span>ตั้งค่าระยะเวลายืม ({settings.studentBorrowDays} วัน)</span>
          </Link>
        </div>
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

      {/* Overdue Warning Alert banner if any */}
      {overdueLoans.length > 0 && (
        <div className="bg-rose-50 border border-rose-200 rounded-2xl p-4 flex items-start gap-3 text-xs text-rose-800 animate-pulse">
          <AlertTriangle className="w-5 h-5 text-rose-600 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <h4 className="font-bold text-rose-900">
              แจ้งเตือน: มีหนังสือเกินกำหนดส่งคืนจำนวน {overdueLoans.length} รายการ!
            </h4>
            <p className="mt-0.5 text-rose-700 leading-relaxed">
              กรุณาตรวจสอบรายชื่อผู้ยืมในตารางด้านล่างและประสานงานติดต่อเพื่อนำส่งคืนห้องสมุด
            </p>
          </div>
        </div>
      )}

      {/* Active Transactions Table */}
      <div className="space-y-3">
        <TransactionTable
          transactions={transactions}
          onReturnClick={(trx) => setSelectedTrxForReturn(trx)}
          title="รายการหนังสือที่กำลังถูกยืมในขณะนี้"
          showFilters={true}
        />
      </div>

      {/* Return Modal */}
      <ReturnModal
        transaction={selectedTrxForReturn}
        onClose={() => setSelectedTrxForReturn(null)}
        onSuccess={(msg) => showToast(msg, 'success')}
      />
    </div>
  );
}
