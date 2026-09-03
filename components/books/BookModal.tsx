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
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-2xl w-full overflow-hidden shadow-2xl border border-slate-100 animate-in fade-in zoom-in-95 duration-200">
        {/* Header bar */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono font-bold bg-indigo-50 text-indigo-700 px-2.5 py-1 rounded-lg">
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
        <div className="p-6 md:p-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Left: Book Cover */}
            <div className="aspect-[3/4] rounded-2xl overflow-hidden bg-slate-100 shadow-md">
              <img
                src={book.coverUrl || 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=600&auto=format&fit=crop&q=80'}
                alt={book.title}
                className="w-full h-full object-cover"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = 'https://placehold.co/400x600/e2e8f0/475569?text=' + encodeURIComponent(book.title.slice(0, 12));
                }}
              />
            </div>

            {/* Right: Book Details */}
            <div className="md:col-span-2 space-y-4">
              <div>
                <span className="text-xs font-semibold text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-full">
                  {book.category}
                </span>
                <h2 className="text-xl font-bold text-slate-900 mt-2 leading-snug">
                  {book.title}
                </h2>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                <div className="flex items-center gap-2 text-slate-700">
                  <User className="w-4 h-4 text-indigo-500 flex-shrink-0" />
                  <span className="text-slate-500 text-xs">ผู้แต่ง:</span>
                  <span className="font-medium truncate">{book.author}</span>
                </div>

                {book.publishedYear && (
                  <div className="flex items-center gap-2 text-slate-700">
                    <Calendar className="w-4 h-4 text-indigo-500 flex-shrink-0" />
                    <span className="text-slate-500 text-xs">ปีพิมพ์:</span>
                    <span className="font-medium">{book.publishedYear}</span>
                  </div>
                )}

                {book.location && (
                  <div className="flex items-center gap-2 text-slate-700">
                    <MapPin className="w-4 h-4 text-indigo-500 flex-shrink-0" />
                    <span className="text-slate-500 text-xs">ตำแหน่ง:</span>
                    <span className="font-medium">{book.location}</span>
                  </div>
                )}

                {book.isbn && (
                  <div className="flex items-center gap-2 text-slate-700 font-mono">
                    <Hash className="w-4 h-4 text-indigo-500 flex-shrink-0" />
                    <span className="text-slate-500 text-xs">ISBN:</span>
                    <span className="font-medium text-xs">{book.isbn}</span>
                  </div>
                )}
              </div>

              {/* Description */}
              <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100 text-xs leading-relaxed text-slate-600">
                <p className="font-semibold text-slate-700 mb-1 flex items-center gap-1.5">
                  <Bookmark className="w-3.5 h-3.5 text-indigo-600" />
                  เรื่องย่อ / รายละเอียดเนื้อหา:
                </p>
                <p>{book.description || 'ไม่มีคำอธิบายเพิ่มเติมสำหรับหนังสือเล่มนี้'}</p>
              </div>

              <div className="flex items-center justify-between text-xs text-slate-500 pt-1">
                <span>สถิติการยืมทั้งหมด: <strong className="text-slate-800">{book.totalBorrowedCount}</strong> ครั้ง</span>
                <span>วันที่เพิ่มเข้าระบบ: {book.createdAt}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex items-center justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-200/70 text-sm font-medium transition-colors"
          >
            ปิดหน้าต่าง
          </button>
          {book.status === 'AVAILABLE' ? (
            <button
              onClick={() => {
                onClose();
                onBorrow(book);
              }}
              className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold shadow-md shadow-indigo-200 transition-all flex items-center gap-2"
            >
              <BookOpen className="w-4 h-4" />
              <span>ทำรายการยืมหนังสือ</span>
            </button>
          ) : (
            <button
              disabled
              className="px-5 py-2 rounded-xl bg-slate-300 text-slate-500 text-sm font-medium cursor-not-allowed"
            >
              หนังสือเล่มนี้กำลังถูกยืมอยู่
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
