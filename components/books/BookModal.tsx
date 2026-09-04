'use client';

import React from 'react';
import { Book } from '@/types';
import { Badge } from '@/components/ui/Badge';
import { X, BookOpen, MapPin, Calendar, Hash, User, Bookmark } from 'lucide-react';

interface BookModalProps {
  book: Book | null;
  onClose: () => void;
  onBorrow: (book: Book) => void;
}

export const BookModal: React.FC<BookModalProps> = ({ book, onClose, onBorrow }) => {
  if (!book) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
      <div className="bg-white rounded-2xl sm:rounded-3xl max-w-2xl w-full max-h-[92vh] overflow-y-auto shadow-2xl border border-slate-100 animate-in fade-in zoom-in-95 duration-200">
        {/* Header bar */}
        <div className="flex items-center justify-between px-4 sm:px-6 py-3.5 sm:py-4 border-b border-slate-100 sticky top-0 bg-white/95 backdrop-blur-md z-10">
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono font-bold bg-blue-50 text-blue-700 px-2.5 py-1 rounded-lg border border-blue-100 whitespace-nowrap">
              รหัส: {book.id}
            </span>
            <Badge status={book.status} type="book" />
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content body */}
        <div className="p-4 sm:p-6 md:p-8">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 sm:gap-6">
            {/* Left: Book Cover */}
            <div className="aspect-[3/4] max-w-[200px] sm:max-w-none mx-auto sm:mx-0 w-full rounded-2xl overflow-hidden bg-slate-100 shadow-md">
              <img
                src={book.coverUrl || 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=600&auto=format&fit=crop&q=80'}
                alt={book.title}
                className="w-full h-full object-cover"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = 'https://placehold.co/400x600/e2e8f0/0369a1?text=' + encodeURIComponent(book.title.slice(0, 12));
                }}
              />
            </div>

            {/* Right: Book Details */}
            <div className="sm:col-span-2 space-y-4">
              <div>
                <span className="text-xs font-semibold text-blue-700 bg-blue-50 px-2.5 py-1 rounded-full border border-blue-100 inline-block">
                  {book.category}
                </span>
                <h2 className="text-lg sm:text-xl font-bold text-slate-900 mt-2 leading-snug">
                  {book.title}
                </h2>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 sm:gap-3 text-xs sm:text-sm">
                <div className="flex items-center gap-2 text-slate-700">
                  <User className="w-4 h-4 text-blue-500 shrink-0" />
                  <span className="text-slate-500 text-xs">ผู้แต่ง:</span>
                  <span className="font-medium truncate">{book.author}</span>
                </div>

                {book.publishedYear && (
                  <div className="flex items-center gap-2 text-slate-700">
                    <Calendar className="w-4 h-4 text-blue-500 shrink-0" />
                    <span className="text-slate-500 text-xs">ปีพิมพ์:</span>
                    <span className="font-medium">{book.publishedYear}</span>
                  </div>
                )}

                {book.location && (
                  <div className="flex items-center gap-2 text-slate-700">
                    <MapPin className="w-4 h-4 text-blue-500 shrink-0" />
                    <span className="text-slate-500 text-xs">ตำแหน่ง:</span>
                    <span className="font-medium truncate">{book.location}</span>
                  </div>
                )}

                {book.isbn && (
                  <div className="flex items-center gap-2 text-slate-700 font-mono">
                    <Hash className="w-4 h-4 text-blue-500 shrink-0" />
                    <span className="text-slate-500 text-xs">ISBN:</span>
                    <span className="font-medium text-xs truncate">{book.isbn}</span>
                  </div>
                )}
              </div>

              {/* Description */}
              <div className="bg-slate-50 rounded-2xl p-3.5 sm:p-4 border border-slate-100 text-xs leading-relaxed text-slate-600">
                <p className="font-semibold text-slate-700 mb-1 flex items-center gap-1.5">
                  <Bookmark className="w-3.5 h-3.5 text-blue-600" />
                  เรื่องย่อ / รายละเอียดเนื้อหา:
                </p>
                <p>{book.description || 'ไม่มีคำอธิบายเพิ่มเติมสำหรับหนังสือเล่มนี้'}</p>
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center justify-between text-xs text-slate-500 pt-1 gap-1">
                <span>สถิติการยืมทั้งหมด: <strong className="text-slate-800">{book.totalBorrowedCount}</strong> ครั้ง</span>
                <span>วันที่เพิ่มเข้าระบบ: {book.createdAt}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="px-4 sm:px-6 py-3.5 sm:py-4 bg-slate-50 border-t border-slate-100 flex items-center justify-end gap-2.5 sm:gap-3 sticky bottom-0">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-200/70 text-xs sm:text-sm font-medium transition-colors"
          >
            ปิดหน้าต่าง
          </button>
          {book.status === 'AVAILABLE' ? (
            <button
              onClick={() => {
                onClose();
                onBorrow(book);
              }}
              className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs sm:text-sm font-semibold shadow-md shadow-blue-200 transition-all flex items-center gap-2 whitespace-nowrap"
            >
              <BookOpen className="w-4 h-4" />
              <span>ทำรายการยืมหนังสือ</span>
            </button>
          ) : (
            <button
              disabled
              className="px-4 py-2.5 rounded-xl bg-slate-200 text-slate-400 text-xs sm:text-sm font-medium cursor-not-allowed whitespace-nowrap"
            >
              หนังสือเล่มนี้กำลังถูกยืมอยู่
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
