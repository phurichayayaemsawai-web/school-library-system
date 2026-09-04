'use client';

import React, { useState } from 'react';
import { BorrowTransaction } from '@/types';
import { Badge } from '@/components/ui/Badge';
import { formatThaiDate, isOverdue, getDaysRemaining } from '@/lib/utils';
import { 
  Search, 
  RotateCcw, 
  GraduationCap, 
  UserCheck, 
  Calendar, 
  Phone, 
  Clock, 
  CheckCircle2, 
  BookOpen 
} from 'lucide-react';

interface TransactionTableProps {
  transactions: BorrowTransaction[];
  onReturnClick?: (trx) => void;
  title?: string;
  showFilters?: boolean;
}

export const TransactionTable: React.FC<TransactionTableProps> = ({
  transactions,
  onReturnClick,
  title,
  showFilters = true,
}) => {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'ACTIVE' | 'OVERDUE' | 'RETURNED'>('ALL');
  const [borrowerTypeFilter, setBorrowerTypeFilter] = useState<'ALL' | 'STUDENT' | 'TEACHER'>('ALL');

  // Filter transactions
  const filtered = transactions.filter((trx) => {
    // Search matching
    const q = search.toLowerCase().trim();
    const matchesSearch =
      !q ||
      trx.bookTitle.toLowerCase().includes(q) ||
      trx.id.toLowerCase().includes(q) ||
      trx.borrower.name.toLowerCase().includes(q) ||
      (trx.borrower.type === 'STUDENT' && (trx.borrower.studentId.includes(q) || trx.borrower.grade.toLowerCase().includes(q))) ||
      (trx.borrower.type === 'TEACHER' && trx.borrower.department.toLowerCase().includes(q));

    // Status matching
    const currentStatus = trx.status === 'ACTIVE' && isOverdue(trx.dueDate, trx.returnDate) ? 'OVERDUE' : trx.status;
    const matchesStatus =
      statusFilter === 'ALL' ||
      (statusFilter === 'ACTIVE' && currentStatus === 'ACTIVE') ||
      (statusFilter === 'OVERDUE' && currentStatus === 'OVERDUE') ||
      (statusFilter === 'RETURNED' && currentStatus === 'RETURNED');

    // Borrower type matching
    const matchesType = borrowerTypeFilter === 'ALL' || trx.borrower.type === borrowerTypeFilter;

    return matchesSearch && matchesStatus && matchesType;
  });

  return (
    <div className="bg-white rounded-2xl sm:rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
      {/* Table Header & Controls */}
      <div className="p-4 sm:p-5 border-b border-slate-100 space-y-3.5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h3 className="text-sm sm:text-base font-bold text-slate-800 flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-blue-600 shrink-0" />
              <span>{title || 'รายการยืม-คืนหนังสือ'}</span>
            </h3>
            <p className="text-[11px] sm:text-xs text-slate-500 mt-0.5">
              แสดง {filtered.length} จากทั้งหมด {transactions.length} รายการ
            </p>
          </div>
        </div>

        {showFilters && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5 sm:gap-3">
            {/* Search Input */}
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 shrink-0" />
              <input
                type="text"
                placeholder="ค้นหาชื่อผู้ยืม, รหัสประจำตัว, ชื่อหนังสือ..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-blue-500 focus:bg-white focus:outline-none"
              />
            </div>

            {/* Status Filter */}
            <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl">
              <button
                onClick={() => setStatusFilter('ALL')}
                className={`flex-1 py-1.5 px-1.5 text-[11px] font-semibold rounded-lg transition-all whitespace-nowrap text-center ${
                  statusFilter === 'ALL' ? 'bg-white text-slate-800 shadow-2xs' : 'text-slate-600'
                }`}
              >
                ทั้งหมด
              </button>
              <button
                onClick={() => setStatusFilter('ACTIVE')}
                className={`flex-1 py-1.5 px-1.5 text-[11px] font-semibold rounded-lg transition-all whitespace-nowrap text-center ${
                  statusFilter === 'ACTIVE' ? 'bg-amber-500 text-white shadow-2xs' : 'text-slate-600'
                }`}
              >
                กำลังยืม
              </button>
              <button
                onClick={() => setStatusFilter('OVERDUE')}
                className={`flex-1 py-1.5 px-1.5 text-[11px] font-semibold rounded-lg transition-all whitespace-nowrap text-center ${
                  statusFilter === 'OVERDUE' ? 'bg-red-600 text-white shadow-2xs' : 'text-slate-600'
                }`}
              >
                เกินกำหนด
              </button>
              <button
                onClick={() => setStatusFilter('RETURNED')}
                className={`flex-1 py-1.5 px-1.5 text-[11px] font-semibold rounded-lg transition-all whitespace-nowrap text-center ${
                  statusFilter === 'RETURNED' ? 'bg-emerald-600 text-white shadow-2xs' : 'text-slate-600'
                }`}
              >
                คืนแล้ว
              </button>
            </div>

            {/* Borrower Type Filter */}
            <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl">
              <button
                onClick={() => setBorrowerTypeFilter('ALL')}
                className={`flex-1 py-1.5 px-1.5 text-[11px] font-semibold rounded-lg transition-all whitespace-nowrap text-center ${
                  borrowerTypeFilter === 'ALL' ? 'bg-white text-slate-800 shadow-2xs' : 'text-slate-600'
                }`}
              >
                ทุกประเภท
              </button>
              <button
                onClick={() => setBorrowerTypeFilter('STUDENT')}
                className={`flex items-center justify-center gap-1 flex-1 py-1.5 px-1.5 text-[11px] font-semibold rounded-lg transition-all whitespace-nowrap ${
                  borrowerTypeFilter === 'STUDENT' ? 'bg-blue-600 text-white shadow-2xs' : 'text-slate-600'
                }`}
              >
                <GraduationCap className="w-3.5 h-3.5 shrink-0" />
                <span>นักเรียน</span>
              </button>
              <button
                onClick={() => setBorrowerTypeFilter('TEACHER')}
                className={`flex items-center justify-center gap-1 flex-1 py-1.5 px-1.5 text-[11px] font-semibold rounded-lg transition-all whitespace-nowrap ${
                  borrowerTypeFilter === 'TEACHER' ? 'bg-blue-600 text-white shadow-2xs' : 'text-slate-600'
                }`}
              >
                <UserCheck className="w-3.5 h-3.5 shrink-0" />
                <span>ครู</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Table Content */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs text-slate-600">
          <thead className="bg-slate-50/80 text-slate-700 font-semibold border-b border-slate-200 text-[11px]">
            <tr>
              <th className="py-3 px-3.5 whitespace-nowrap">หนังสือ</th>
              <th className="py-3 px-3.5 whitespace-nowrap">ผู้ยืม / สังกัด</th>
              <th className="py-3 px-3.5 whitespace-nowrap">วันที่ยืม</th>
              <th className="py-3 px-3.5 whitespace-nowrap">กำหนดส่ง / คืนจริง</th>
              <th className="py-3 px-3.5 whitespace-nowrap">สถานะ</th>
              <th className="py-3 px-3.5 text-right whitespace-nowrap">การกระทำ</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={6} className="text-center py-10 text-slate-400">
                  <div className="flex flex-col items-center justify-center gap-2">
                    <Clock className="w-8 h-8 text-slate-300" />
                    <span>ไม่พบรายการข้อมูลการยืม-คืนตามเงื่อนไขที่เลือก</span>
                  </div>
                </td>
              </tr>
            ) : (
              filtered.map((trx) => {
                const late = isOverdue(trx.dueDate, trx.returnDate);
                const currentStatus = trx.returnDate ? 'RETURNED' : late ? 'OVERDUE' : 'ACTIVE';
                const daysRemain = getDaysRemaining(trx.dueDate);

                return (
                  <tr key={trx.id} className="hover:bg-sky-50/40 transition-colors">
                    {/* Book */}
                    <td className="py-3 px-3.5">
                      <div className="flex items-center gap-2.5">
                        <img
                          src={trx.bookCoverUrl}
                          alt={trx.bookTitle}
                          className="w-9 h-12 sm:w-10 sm:h-14 object-cover rounded-lg shadow-2xs bg-slate-200 shrink-0"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = 'https://placehold.co/100x150/e2e8f0/0369a1?text=Book';
                          }}
                        />
                        <div className="min-w-0 max-w-[160px] sm:max-w-xs">
                          <span className="text-[10px] font-mono text-blue-700 font-bold bg-blue-50 px-1.5 py-0.5 rounded border border-blue-100 whitespace-nowrap">
                            {trx.bookId}
                          </span>
                          <p className="font-bold text-slate-800 text-xs truncate mt-0.5" title={trx.bookTitle}>
                            {trx.bookTitle}
                          </p>
                          <span className="text-[10px] sm:text-[11px] text-slate-400 truncate block">{trx.bookCategory}</span>
                        </div>
                      </div>
                    </td>

                    {/* Borrower */}
                    <td className="py-3 px-3.5">
                      <div className="space-y-0.5 min-w-0 max-w-[160px] sm:max-w-xs">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          {trx.borrower.type === 'STUDENT' ? (
                            <span className="inline-flex items-center gap-1 text-[10px] font-bold bg-sky-50 text-sky-700 px-1.5 py-0.5 rounded border border-sky-200 whitespace-nowrap">
                              <GraduationCap className="w-3 h-3 shrink-0" /> นักเรียน
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-[10px] font-bold bg-blue-50 text-blue-700 px-1.5 py-0.5 rounded border border-blue-200 whitespace-nowrap">
                              <UserCheck className="w-3 h-3 shrink-0" /> ครู
                            </span>
                          )}
                          <span className="font-bold text-slate-800 text-xs truncate">{trx.borrower.name}</span>
                        </div>

                        {trx.borrower.type === 'STUDENT' ? (
                          <p className="text-[10px] sm:text-[11px] text-slate-500 truncate">
                            รหัส: <strong className="text-slate-700">{trx.borrower.studentId}</strong> • {trx.borrower.grade} (ห้อง {trx.borrower.room})
                          </p>
                        ) : (
                          <p className="text-[10px] sm:text-[11px] text-slate-500 truncate">
                            {trx.borrower.department}
                          </p>
                        )}

                        {trx.borrower.phone && trx.borrower.phone !== '-' && (
                          <p className="text-[10px] text-slate-400 flex items-center gap-1 whitespace-nowrap">
                            <Phone className="w-2.5 h-2.5 shrink-0" /> {trx.borrower.phone}
                          </p>
                        )}
                      </div>
                    </td>

                    {/* Borrow Date */}
                    <td className="py-3 px-3.5 text-slate-600 whitespace-nowrap text-xs">
                      {formatThaiDate(trx.borrowDate)}
                    </td>

                    {/* Due Date & Return Date */}
                    <td className="py-3 px-3.5 whitespace-nowrap text-xs">
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-1.5">
                          <Calendar className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          <span className={late && !trx.returnDate ? 'font-bold text-red-600' : 'text-slate-700'}>
                            {formatThaiDate(trx.dueDate)}
                          </span>
                        </div>

                        {trx.returnDate ? (
                          <p className="text-[10px] sm:text-[11px] text-emerald-600 font-semibold flex items-center gap-1 whitespace-nowrap">
                            <CheckCircle2 className="w-3 h-3 shrink-0" /> คืนเมื่อ: {formatThaiDate(trx.returnDate)}
                          </p>
                        ) : (
                          <p className={`text-[10px] font-medium whitespace-nowrap ${daysRemain < 0 ? 'text-red-500 font-bold' : daysRemain <= 2 ? 'text-amber-600' : 'text-slate-400'}`}>
                            {daysRemain < 0 ? `เลยกำหนด ${Math.abs(daysRemain)} วัน` : `เหลืออีก ${daysRemain} วัน`}
                          </p>
                        )}
                      </div>
                    </td>

                    {/* Status Badge */}
                    <td className="py-3 px-3.5 whitespace-nowrap">
                      <Badge status={currentStatus} type="transaction" />
                    </td>

                    {/* Action */}
                    <td className="py-3 px-3.5 text-right whitespace-nowrap">
                      {!trx.returnDate ? (
                        <button
                          onClick={() => onReturnClick && onReturnClick(trx)}
                          className="inline-flex items-center gap-1 px-2.5 sm:px-3 py-1.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-700 text-xs font-bold border border-emerald-200 transition-colors shadow-2xs whitespace-nowrap"
                        >
                          <RotateCcw className="w-3.5 h-3.5 shrink-0" />
                          <span>รับคืน</span>
                        </button>
                      ) : (
                        <span className="text-[11px] text-slate-400 italic whitespace-nowrap">เสร็จสิ้น</span>
                      )}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
