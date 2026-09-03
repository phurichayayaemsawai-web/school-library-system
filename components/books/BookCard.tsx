'use client';

import React from 'react';
import { Book } from '@/types';
import { Badge } from '@/ui/Badge';
import { BookOpen, User, MapPin, Hash, ArrowUpRight } from 'lucide-react';

interface BookCardProps {
  book: Book;
  onBorrow?: (book: Book) => void;
  onView?: (book: Book) => void;
}

export const BookCard: React.FC<BookCardProps> = ({ book, onBorrow, onView }) => {
  return (
    <div className="group bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm hover:shadow-md transition-all duration-300 flex flex-col hover:-translate-y-1">
      {/* Cover Image Container */}
      <div 
        className="relative aspect-[3/4] w-full overflow-hidden bg-slate-100 cursor-pointer"
        onClick={() => onView && onView(book)}
      >
        <img
          src={book.coverUrl || 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=600&auto=format&fit=crop&q=80'}
          alt={book.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          onError={(e) => {
            // Fallback placeholder image
            (e.target as HTMLImageElement).src = 'https://placehold.co/400x600/e2e8f0/475569?text=' + encodeURIComponent(book.title.slice(0, 12));
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-4">
          <span className="text-xs text-white font-medium flex items-center gap-1">
            คลิกเพื่อดูรายละเอียด <ArrowUpRight className="w-3.5 h-3.5" />
          </span>
        </div>
        <div className="absolute top-3 right-3">
          <Badge status={book.status} type="book" />
        </div>
        <div className="absolute top-3 left-3">
          <span className="text-[10px] font-mono font-semibold bg-slate-900/80 text-white px-2 py-0.5 rounded-md backdrop-blur-xs">
            {book.id}
          </span>
        </div>
      </div>

      {/* Book Content */}
      <div className="p-4 flex-1 flex flex-col justify-between">
        <div>
          <span className="text-xs font-medium text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-md inline-block mb-2">
            {book.category}
          </span>

          <h3 
            className="font-bold text-slate-800 text-base leading-snug line-clamp-2 hover:text-indigo-600 transition-colors cursor-pointer"
            onClick={() => onView && onView(book)}
            title={book.title}
          >
            {book.title}
          </h3>

          <div className="mt-2 space-y-1 text-xs text-slate-500">
            <div className="flex items-center gap-1.5 truncate">
              <User className="w-3.5 h-3.5 flex-shrink-0 text-slate-400" />
              <span className="truncate">{book.author}</span>
            </div>
            {book.location && (
              <div className="flex items-center gap-1.5 text-slate-500">
                <MapPin className="w-3.5 h-3.5 flex-shrink-0 text-slate-400" />
                <span className="truncate">{book.location}</span>
              </div>
            )}
            {book.isbn && (
              <div className="flex items-center gap-1.5 font-mono text-[11px] text-slate-400">
                <Hash className="w-3 h-3 flex-shrink-0" />
                <span className="truncate">ISBN: {book.isbn}</span>
              </div>
            )}
          </div>
        </div>

        {/* Footer info & action */}
        <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
          <span className="text-[11px] text-slate-400">
            ยืมแล้ว {book.totalBorrowedCount} ครั้ง
          </span>

          {book.status === 'AVAILABLE' ? (
            <button
              onClick={() => onBorrow && onBorrow(book)}
              className="px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-medium shadow-sm hover:shadow transition-all flex items-center gap-1.5"
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span>ยืมเล่มนี้</span>
            </button>
          ) : (
            <span className="text-xs font-medium text-rose-600 bg-rose-50 px-2.5 py-1 rounded-lg border border-rose-100">
              กำลังถูกยืม
            </span>
          )}
        </div>
      </div>
    </div>
  );
};
