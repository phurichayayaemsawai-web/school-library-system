'use client';

import React, { useState } from 'react';
import { BorrowTransaction } from '@/types';
import { Badge } from '@/components/ui/Badge';
import { formatThaiDate, isOverdue, getDaysRemaining } from '@/lib/utils';
import { 
  Search, 
  Filter, 
  RotateCcw, 
  GraduationCap, 
  UserCheck, 
  Calendar, 
  Phone, 
  AlertTriangle,
  Clock,
  CheckCircle2,
  BookOpen
} from 'lucide-react';

interface TransactionTableProps {
  transactions: BorrowTransaction[];
  onReturnClick?: (trx: BorrowTransaction) => void;
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
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
      {/* Table Header & Controls */}
      <div className="p-5 border-b border-slate-200 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-base font-bold text-slate-800 flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-indigo-600" />
              {title || 'รายการยืม-คืนหนังสือ'}
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              แสดงข้อมูลทั้งหมด {filtered.length} รายการ (จากทั้งหมด {transactions.length} รายการ)
            </p>
          </div>
        </div>

        {showFilters && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {/* Search Input */}
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="ค้นหาชื่อผู้ยืม, รหัสประจำตัว, ชื่อหนังสือ..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-indigo-500 focus:bg-white focus:outline-none"
              />
            </div>

            {/* Status Filter */}
            <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl">
              <button
                onClick={() => setStatusFilter('ALL')}
                className={`flex-1 py-1.5 px-2 text-[11px] font-semibold rounded-lg transition-all ${
                  statusFilter === 'ALL' ? 'bg-white text-slate-800 shadow-2xs' : 'text-slate-600'
                }`}
              >
                ทั้งหมด
              </button>
              <button
                onClick={() => setStatusFilter('ACTIVE')}
                className={`flex-1 py-1.5 px-2 text-[11px] font-semibold rounded-lg transition-all ${
                  statusFilter === 'ACTIVE' ? 'bg-amber-500 text-white shadow-2xs' : 'text-slate-600'
                }`}
              >
                กำลังยืม
              </button>
              <button
                onClick={() => setStatusFilter('OVERDUE')}
                className={`flex-1 py-1.5 px-2 text-[11px] font-semibold rounded-lg transition-all ${
                  statusFilter === 'OVERDUE' ? 'bg-red-600 text-white shadow-2xs' : 'text-slate-600'
                }`}
              >
                เกินกำหนด
              </button>
              <button
                onClick={() => setStatusFilter('RETURNED')}
                className={`flex-1 py-1.5 px-2 text-[11px] font-semibold rounded-lg transition-all ${
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
                className={`flex-1 py-1.5 px-2 text-[11px] font-semibold rounded-lg transition-all ${
                  borrowerTypeFilter === 'ALL' ? 'bg-white text-slate-800 shadow-2xs' : 'text-slate-600'
                }`}
              >
                ทุกประเภท
              </button>
              <button
                onClick={() => setBorrowerTypeFilter('STUDENT')}
                className={`flex items-center justify-center gap-1 flex-1 py-1.5 px-2 text-[11px] font-semibold rounded-lg transition-all ${
                  borrowerTypeFilter === 'STUDENT' ? 'bg-indigo-600 text-white shadow-2xs' : 'text-slate-600'
                }`}
              >
                <GraduationCap className="w-3.5 h-3.5" /> นักเรียน
              </button>
              <button
                onClick={() => setBorrowerTypeFilter('TEACHER')}
                className={`flex items-center justify-center gap-1 flex-1 py-1.5 px-2 text-[11px] font-semibold rounded-lg transition-all ${
                  borrowerTypeFilter === 'TEACHER' ? 'bg-indigo-600 text-white shadow-2xs' : 'text-slate-600'
                }`}
              >
                <UserCheck className="w-3.5 h-3.5" /> ครู
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Table Content */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs text-slate-600">
          <thead className="bg-slate-50 text-slate-700 font-semibold border-b border-slate-200 uppercase tracking-wider text-[11px]">
            <tr>
              <th className="py-3 px-4">หนังสือ</th>
              <th className="py-3 px-4">ผู้ยืม / สังกัด</th>
              <th className="py-3 px-4">วันที่ยืม</th>
              <th className="py-3 px-4">กำหนดส่ง / คืนจริง</th>
              <th className="py-3 px-4">สถานะ</th>
              <th className="py-3 px-4 text-right">การกระทำ</th>
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
                  <tr key={trx.id} className="hover:bg-slate-50/80 transition-colors">
                    {/* Book */}
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={trx.bookCoverUrl}
                          alt={trx.bookTitle}
                          className="w-10 h-14 object-cover rounded-lg shadow-2xs bg-slate-200 flex-shrink-0"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = 'https://placehold.co/100x150/e2e8f0/475569?text=Book';
                          }}
                        />
                        <div className="min-w-0 max-w-xs">
                          <span className="text-[10px] font-mono text-indigo-600 font-bold bg-indigo-50 px-1.5 py-0.5 rounded">
                            {trx.bookId}
                          </span>
                          <p className="font-bold text-slate-800 text-xs truncate mt-0.5" title={trx.bookTitle}>
                            {trx.bookTitle}
                          </p>
                          <span className="text-[11px] text-slate-400">{trx.bookCategory}</span>
                        </div>
                      </div>
                    </td>

                    {/* Borrower */}
                    <td className="py-3.5 px-4">
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-1.5">
                          {trx.borrower.type === 'STUDENT' ? (
                            <span className="inline-flex items-center gap-1 text-[10px] font-bold bg-sky-50 text-sky-700 px-1.5 py-0.5 rounded border border-sky-200">
                              <GraduationCap className="w-3 h-3" /> นักเรียน
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-[10px] font-bold bg-purple-50 text-purple-700 px-1.5 py-0.5 rounded border border-purple-200">
                              <UserCheck className="w-3 h-3" /> ครู
                            </span>
                          )}
                          <span className="font-bold text-slate-800">{trx.borrower.name}</span>
                        </div>

                        {trx.borrower.type === 'STUDENT' ? (
                          <p className="text-[11px] text-slate-500">
                            รหัส: <strong className="text-slate-700">{trx.borrower.studentId}</strong> • {trx.borrower.grade} (ห้อง {trx.borrower.room})
                          </p>
                        ) : (
                          <p className="text-[11px] text-slate-500 truncate max-w-xs">
                            {trx.borrower.department}
                          </p>
                        )}

                        {trx.borrower.phone && trx.borrower.phone !== '-' && (
                          <p className="text-[10px] text-slate-400 flex items-center gap-1">
                            <Phone className="w-2.5 h-2.5" /> {trx.borrower.phone}
                          </p>
                        )}
                      </div>
                    </td>

                    {/* Borrow Date */}
                    <td className="py-3.5 px-4 text-slate-600 whitespace-nowrap">
                      {formatThaiDate(trx.borrowDate)}
                    </td>

                    {/* Due Date & Return Date */}
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-1.5">
                          <Calendar className="w-3.5 h-3.5 text-slate-400" />
                          <span className={late && !trx.returnDate ? 'font-bold text-red-600' : 'text-slate-700'}>
                            {formatThaiDate(trx.dueDate)}
                          </span>
                        </div>

                        {trx.returnDate ? (
                          <p className="text-[11px] text-emerald-600 font-semibold flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3" /> คืนเมื่อ: {formatThaiDate(trx.returnDate)}
                          </p>
                        ) : (
                          <p className={`text-[10px] font-medium ${daysRemain < 0 ? 'text-red-500 font-bold' : daysRemain <= 2 ? 'text-amber-600' : 'text-slate-400'}`}>
                            {daysRemain < 0 ? `เลยกำหนด ${Math.abs(daysRemain)} วัน` : `เหลืออีก ${daysRemain} วัน`}
                          </p>
                        )}
                      </div>
                    </td>

                    {/* Status Badge */}
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <Badge status={currentStatus} type="transaction" />
                    </td>

                    {/* Action */}
                    <td className="py-3.5 px-4 text-right whitespace-nowrap">
                      {!trx.returnDate ? (
                        <button
                          onClick={() => onReturnClick && onReturnClick(trx)}
                          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-700 text-xs font-bold border border-emerald-200 transition-colors shadow-2xs"
                        >
                          <RotateCcw className="w-3.5 h-3.5" />
                          <span>รับคืน</span>
                        </button>
                      ) : (
                        <span className="text-[11px] text-slate-400 italic">เสร็จสิ้น</span>
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
