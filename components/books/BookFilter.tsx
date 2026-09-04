'use client';

import React from 'react';
import { Search, Filter, BookCheck, Clock } from 'lucide-react';
import { BOOK_CATEGORIES, BookStatus } from '@/types';

interface BookFilterProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  selectedCategory: string;
  onCategoryChange: (category: string) => void;
  statusFilter: 'ALL' | BookStatus;
  onStatusFilterChange: (status: 'ALL' | BookStatus) => void;
  totalResults: number;
}

export const BookFilter: React.FC<BookFilterProps> = ({
  searchQuery,
  onSearchChange,
  selectedCategory,
  onCategoryChange,
  statusFilter,
  onStatusFilterChange,
  totalResults,
}) => {
  return (
    <div className="bg-white rounded-2xl sm:rounded-3xl p-4 sm:p-5 border border-slate-200/80 shadow-xs space-y-3.5">
      {/* Top row: Search bar & Status toggle */}
      <div className="flex flex-col sm:flex-row gap-2.5 sm:gap-3 items-stretch sm:items-center justify-between">
        {/* Search input */}
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 shrink-0" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="ค้นหาชื่อหนังสือ, ผู้แต่ง, ISBN หรือรหัส..."
            className="w-full pl-10 pr-12 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all text-slate-800 placeholder-slate-400"
          />
          {searchQuery && (
            <button
              onClick={() => onSearchChange('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-semibold text-slate-400 hover:text-slate-600 bg-slate-200/60 px-1.5 py-0.5 rounded"
            >
              ล้าง
            </button>
          )}
        </div>

        {/* Status filters */}
        <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-xl shrink-0">
          <button
            onClick={() => onStatusFilterChange('ALL')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all whitespace-nowrap ${
              statusFilter === 'ALL'
                ? 'bg-white text-slate-900 shadow-2xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            ทั้งหมด
          </button>
          <button
            onClick={() => onStatusFilterChange('AVAILABLE')}
            className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all whitespace-nowrap ${
              statusFilter === 'AVAILABLE'
                ? 'bg-emerald-600 text-white shadow-2xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <BookCheck className="w-3.5 h-3.5 shrink-0" />
            <span>ยืมได้</span>
          </button>
          <button
            onClick={() => onStatusFilterChange('BORROWED')}
            className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all whitespace-nowrap ${
              statusFilter === 'BORROWED'
                ? 'bg-rose-600 text-white shadow-2xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Clock className="w-3.5 h-3.5 shrink-0" />
            <span>ถูกยืม</span>
          </button>
        </div>
      </div>

      {/* Category selector */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2.5 pt-2.5 border-t border-slate-100">
        <div className="flex items-center gap-2 flex-wrap w-full sm:w-auto">
          <span className="text-xs font-semibold text-slate-500 flex items-center gap-1 whitespace-nowrap">
            <Filter className="w-3.5 h-3.5 text-blue-600 shrink-0" /> หมวดหมู่:
          </span>
          <select
            value={selectedCategory}
            onChange={(e) => onCategoryChange(e.target.value)}
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
          พบหนังสือทั้งหมด <strong className="text-blue-600 font-bold">{totalResults}</strong> เล่ม
        </div>
      </div>
    </div>
  );
};
