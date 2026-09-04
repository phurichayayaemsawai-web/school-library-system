'use client';

import React, { useState } from 'react';
import { BorrowTransaction } from '@/types';
import { useLibrary } from '@/context/LibraryContext';
import { formatThaiDate, getTodayString, isOverdue } from '@/lib/utils';
import { X, CheckCircle2, AlertTriangle, Calendar, BookOpen, GraduationCap, School } from 'lucide-react';

interface ReturnModalProps {
  transaction: BorrowTransaction | null;
  onClose: () => void;
  onSuccess?: (msg: string) => void;
}

export const ReturnModal: React.FC<ReturnModalProps> = ({ transaction, onClose, onSuccess }) => {
  const { returnBook } = useLibrary();
  const [returnDate, setReturnDate] = useState<string>(getTodayString());

  if (!transaction) return null;

  const isLate = isOverdue(transaction.dueDate, transaction.returnDate);

  const handleConfirm = () => {
    const res = returnBook(transaction.id, returnDate);
    if (res.success) {
      if (onSuccess) onSuccess(res.message);
      onClose();
    } else {
      alert(res.message);
    }
  };

  const isStudent = transaction.borrower.type === 'STUDENT';

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
      <div className="bg-white rounded-2xl sm:rounded-3xl max-w-md w-full max-h-[92vh] overflow-y-auto shadow-2xl border border-slate-100 animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between px-4 sm:px-6 py-3.5 sm:py-4 border-b border-slate-100 bg-slate-50/70 sticky top-0 backdrop-blur-md z-10">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-emerald-600 text-white shadow-xs shrink-0">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm sm:text-base font-bold text-slate-900">บันทึกรับคืนหนังสือ</h2>
              <p className="text-[11px] sm:text-xs text-slate-500">รหัสรายการ: {transaction.id}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-4 sm:p-6 space-y-3.5 sm:space-y-4">
          {/* Overdue Alert banner */}
          {isLate && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-2xl text-xs text-red-700 flex items-start gap-2.5">
              <AlertTriangle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
              <div>
                <p className="font-bold">รายการนี้เกินกำหนดส่งคืน!</p>
                <p className="text-[11px] text-red-600 mt-0.5">
                  กำหนดส่งคือวันที่ {formatThaiDate(transaction.dueDate)} กรุณาตรวจสอบสภาพหนังสือ
                </p>
              </div>
            </div>
          )}

          {/* Book Info */}
          <div className="flex gap-3 p-3 bg-slate-50 border border-slate-200 rounded-2xl">
            <img
              src={transaction.bookCoverUrl}
              alt={transaction.bookTitle}
              className="w-12 h-16 sm:w-14 sm:h-18 object-cover rounded-xl shadow-2xs bg-slate-200 shrink-0"
              onError={(e) => {
                (e.target as HTMLImageElement).src = 'https://placehold.co/100x150/e2e8f0/0369a1?text=Book';
              }}
            />
            <div className="flex-1 min-w-0">
              <span className="text-[10px] font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-md border border-blue-100 whitespace-nowrap">
                {transaction.bookId}
              </span>
              <h4 className="text-xs font-bold text-slate-800 line-clamp-2 mt-1">
                {transaction.bookTitle}
              </h4>
              <p className="text-[11px] text-slate-500 mt-0.5 truncate">{transaction.bookCategory}</p>
            </div>
          </div>

          {/* Borrower summary */}
          <div className="p-3 bg-slate-50/70 border border-slate-100 rounded-2xl space-y-1.5 text-xs">
            <div className="flex items-center justify-between text-slate-500 gap-2">
              <span className="flex items-center gap-1.5 whitespace-nowrap">
                {isStudent ? (
                  <GraduationCap className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                ) : (
                  <School className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                )}
                ผู้ยืม ({isStudent ? 'นักเรียน' : 'ครู'}):
              </span>
              <span className="font-bold text-slate-800 truncate">{transaction.borrower.name}</span>
            </div>

            {isStudent ? (
              <div className="flex items-center justify-between text-slate-500 gap-2">
                <span className="whitespace-nowrap">รหัส / ระดับชั้น:</span>
                <span className="font-medium text-slate-700 truncate">
                  {(transaction.borrower as any).studentId} • {(transaction.borrower as any).grade} (ห้อง {(transaction.borrower as any).room})
                </span>
              </div>
            ) : (
              <div className="flex items-center justify-between text-slate-500 gap-2">
                <span className="whitespace-nowrap">กลุ่มสาระฯ:</span>
                <span className="font-medium text-slate-700 truncate">
                  {(transaction.borrower as any).department}
                </span>
              </div>
            )}

            <div className="flex items-center justify-between text-slate-500 pt-1 border-t border-slate-200/60">
              <span className="whitespace-nowrap">วันที่ยืม:</span>
              <span className="text-slate-700 font-medium whitespace-nowrap">{formatThaiDate(transaction.borrowDate)}</span>
            </div>
            <div className="flex items-center justify-between text-slate-500">
              <span className="whitespace-nowrap">กำหนดส่งคืน:</span>
              <span className={`font-bold whitespace-nowrap ${isLate ? 'text-red-600' : 'text-slate-700'}`}>
                {formatThaiDate(transaction.dueDate)}
              </span>
            </div>
          </div>

          {/* Actual Return Date Selector */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1 whitespace-nowrap">
              วันที่รับคืนจริง
            </label>
            <div className="relative">
              <Calendar className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="date"
                required
                value={returnDate}
                onChange={(e) => setReturnDate(e.target.value)}
                className="w-full pl-9 pr-3 py-2 bg-white border border-slate-300 rounded-xl text-xs font-semibold focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="px-4 sm:px-6 py-3.5 sm:py-4 bg-slate-50 border-t border-slate-100 flex items-center justify-end gap-2.5 sm:gap-3 sticky bottom-0">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-xl text-xs font-semibold transition-colors"
          >
            ยกเลิก
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-md shadow-emerald-200 transition-all flex items-center gap-1.5 whitespace-nowrap"
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>ยืนยันการรับคืน</span>
          </button>
        </div>
      </div>
    </div>
  );
};
