'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useLibrary } from '@/context/LibraryContext';
import { TransactionTable } from '@/components/borrow/TransactionTable';
import { ReturnModal } from '@/components/borrow/ReturnModal';
import { Toast, ToastMessage } from '@/components/ui/Toast';
import { BorrowTransaction } from '@/types';
import { History, ArrowLeft, Download, ShieldAlert } from 'lucide-react';

export default function HistoryPage() {
  const { transactions, isAdmin } = useLibrary();
  const [selectedTrxForReturn, setSelectedTrxForReturn] = useState<BorrowTransaction | null>(null);
  const [toast, setToast] = useState<ToastMessage | null>(null);

  if (!isAdmin) {
    return (
      <div className="max-w-md mx-auto py-12 text-center space-y-4">
        <div className="w-16 h-16 rounded-2xl bg-amber-50 border border-amber-200 text-amber-600 flex items-center justify-center mx-auto">
          <ShieldAlert className="w-8 h-8" />
        </div>
        <h2 className="text-lg font-bold text-slate-900">หน้านี้สำหรับแอดมินหรือครูบรรณารักษ์เท่านั้น</h2>
        <p className="text-xs text-slate-500">
          กรุณาเข้าสู่ระบบแอดมินเพื่อดูประวัติการทำธุรกรรมยืม-คืนทั้งหมด
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

  const returnedCount = transactions.filter((t) => t.status === 'RETURNED').length;
  const activeCount = transactions.filter((t) => t.status === 'ACTIVE' || t.status === 'OVERDUE').length;

  const showToast = (title: string, type: 'success' | 'error' | 'info' = 'success') => {
    setToast({
      id: Date.now().toString(),
      type,
      title,
    });
  };

  const handleExportCSV = () => {
    // Generate simple CSV from transactions
    const headers = 'รหัสรายการ,ชื่อหนังสือ,ประเภทผู้ยืม,ชื่อผู้ยืม,สังกัด/ชั้น,วันที่ยืม,กำหนดคืน,วันที่คืนจริง,สถานะ\n';
    const rows = transactions.map((t) => {
      const borrowerSub = t.borrower.type === 'STUDENT' ? `${t.borrower.grade} (${t.borrower.studentId})` : t.borrower.department;
      return `"${t.id}","${t.bookTitle}","${t.borrower.type === 'STUDENT' ? 'นักเรียน' : 'ครู'}","${t.borrower.name}","${borrowerSub}","${t.borrowDate}","${t.dueDate}","${t.returnDate || '-'}","${t.status}"`;
    }).join('\n');

    const blob = new Blob(['\uFEFF' + headers + rows], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `library_transactions_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    showToast('ดาวน์โหลดไฟล์ประวัติการยืม-คืน (CSV) เรียบร้อยแล้ว', 'success');
  };

  return (
    <div className="space-y-6">
      <Toast toast={toast} onClose={() => setToast(null)} />

      {/* Header */}
      <div>
        <Link
          href="/borrow-return"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-blue-600 transition-colors mb-3"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>กลับไปยังหน้าระบบยืม-คืน</span>
        </Link>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 flex items-center gap-2.5">
              <History className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600 shrink-0" />
              <span>ประวัติการยืม - คืนหนังสือทั้งหมด</span>
            </h1>
            <p className="text-xs text-slate-500 mt-1 font-normal">
              รวมประวัติการทำธุรกรรมยืมคืนหนังสือของนักเรียนและครูทุกรายการ
            </p>
          </div>

          <button
            onClick={handleExportCSV}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white rounded-xl text-xs font-bold shadow-md shadow-emerald-500/20 transition-all self-start sm:self-auto whitespace-nowrap hover:scale-105 active:scale-95"
          >
            <Download className="w-4 h-4" />
            <span>ส่งออกข้อมูล (Export CSV)</span>
          </button>
        </div>
      </div>

      {/* Summary info banner */}
      <div className="grid grid-cols-3 gap-3 sm:gap-4">
        <div className="bg-white rounded-xl sm:rounded-2xl p-4 border border-sky-100 shadow-2xs">
          <p className="text-xs text-slate-500 truncate whitespace-nowrap">บันทึกธุรกรรมทั้งหมด</p>
          <p className="text-xl sm:text-2xl font-black text-slate-800 mt-1 truncate">{transactions.length} รายการ</p>
        </div>
        <div className="bg-white rounded-xl sm:rounded-2xl p-4 border border-sky-100 shadow-2xs">
          <p className="text-xs text-slate-500 truncate whitespace-nowrap">คืนสมบูรณ์แล้ว</p>
          <p className="text-xl sm:text-2xl font-black text-emerald-600 mt-1 truncate">{returnedCount} รายการ</p>
        </div>
        <div className="bg-white rounded-xl sm:rounded-2xl p-4 border border-sky-100 shadow-2xs">
          <p className="text-xs text-slate-500 truncate whitespace-nowrap">ยังอยู่ระหว่างการยืม</p>
          <p className="text-xl sm:text-2xl font-black text-amber-600 mt-1 truncate">{activeCount} รายการ</p>
        </div>
      </div>

      {/* Full Transaction Table */}
      <TransactionTable
        transactions={transactions}
        onReturnClick={(trx) => setSelectedTrxForReturn(trx)}
        title="ประวัติการทำรายการยืม-คืนย้อนหลัง"
        showFilters={true}
      />

      {/* Return Modal */}
      <ReturnModal
        transaction={selectedTrxForReturn}
        onClose={() => setSelectedTrxForReturn(null)}
        onSuccess={(msg) => showToast(msg, 'success')}
      />
    </div>
  );
}
