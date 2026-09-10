'use client';

import React, { useState } from 'react';
import { useLibrary } from '@/context/LibraryContext';
import { BOOK_CATEGORIES, Book } from '@/types';
import { X, BookOpen, MapPin, Hash, Calendar, Bookmark, PlusCircle, CheckCircle2, Scan } from 'lucide-react';

interface AddBookModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (message: string) => void;
}

export const AddBookModal: React.FC<AddBookModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const { addBook, books } = useLibrary();

  const [bookId, setBookId] = useState(`TH-${String(books.length + 1).padStart(3, '0')}`);
  const [title, setTitle] = useState('');
  const [author, setAuthor] = useState('');
  const [category, setCategory] = useState<string>(BOOK_CATEGORIES[0]);
  const [isbn, setIsbn] = useState('');
  const [publishedYear, setPublishedYear] = useState('2567');
  const [location, setLocation] = useState('ตู้ภาษาไทย ชั้น 1');
  const [coverUrl, setCoverUrl] = useState('https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=600&auto=format&fit=crop&q=80');
  const [description, setDescription] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  // Update default book ID when books count changes
  React.useEffect(() => {
    if (isOpen) {
      setBookId(`TH-${String(books.length + 1).padStart(3, '0')}`);
    }
  }, [isOpen, books.length]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim() || !author.trim()) {
      alert('กรุณากรอกชื่อหนังสือและชื่อผู้แต่ง');
      return;
    }

    setIsSaving(true);
    try {
      const added = await addBook({
        id: bookId.trim() || `TH-${String(books.length + 1).padStart(3, '0')}`,
        title: title.trim(),
        author: author.trim(),
        category,
        isbn: isbn.trim() || `978-616-${Math.floor(1000 + Math.random() * 9000)}-${Math.floor(10 + Math.random() * 90)}`,
        coverUrl: coverUrl.trim() || 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=600&auto=format&fit=crop&q=80',
        publishedYear: publishedYear.trim() || '2567',
        location: location.trim() || 'ตู้ภาษาไทย ชั้น 1',
        description: description.trim(),
      });

      onSuccess(`เพิ่มหนังสือ "${added.title}" (รหัส ${added.id}) เรียบร้อยแล้ว`);
      // Reset form
      setTitle('');
      setAuthor('');
      setDescription('');
      setIsSaving(false);
      onClose();
    } catch (err) {
      console.error(err);
      alert('เกิดข้อผิดพลาดในการบันทึกหนังสือ');
      setIsSaving(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-200"
      onClick={(e) => {
        if (e.target === e.currentTarget && !isSaving) {
          onClose();
        }
      }}
    >
      <div className="bg-white rounded-2xl sm:rounded-3xl max-w-2xl w-full max-h-[92vh] overflow-y-auto shadow-2xl border border-slate-100">
        {/* Header */}
        <div className="flex items-center justify-between px-5 sm:px-6 py-4 border-b border-sky-100 sticky top-0 bg-white/95 backdrop-blur-md z-10">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <PlusCircle className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm sm:text-base font-bold text-slate-900">
                เพิ่มหนังสือใหม่เข้าสู่ระบบ
              </h2>
              <p className="text-[11px] text-slate-500">
                กรอกข้อมูลหนังสือเพื่อบันทึกและซิงค์ข้อมูลกับทุกอุปกรณ์
              </p>
            </div>
          </div>
          <button
            type="button"
            disabled={isSaving}
            onClick={onClose}
            className="p-1.5 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-5 sm:p-6 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            {/* Book ID */}
            <div className="sm:col-span-2 p-3 bg-sky-50/70 border border-sky-200 rounded-xl">
              <label className="block text-xs font-bold text-blue-950 mb-1">
                รหัสหนังสือ (Book ID / Barcode) <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Scan className="w-4 h-4 text-blue-600 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  required
                  placeholder="เช่น TH-001"
                  value={bookId}
                  onChange={(e) => setBookId(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 bg-white border border-sky-300 rounded-lg text-xs font-mono font-bold text-blue-900 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>
            </div>

            {/* Title */}
            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                ชื่อหนังสือ <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                placeholder="เช่น วรรณคดีไทยฉบับวิเคราะห์"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-3 py-2 bg-sky-50/30 border border-sky-200 rounded-xl text-xs focus:ring-2 focus:ring-blue-500 focus:bg-white focus:outline-none font-medium"
              />
            </div>

            {/* Author */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                ชื่อผู้แต่ง / ผู้จัดทำ <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                placeholder="เช่น ศ.ดร. รื่นฤทัย"
                value={author}
                onChange={(e) => setAuthor(e.target.value)}
                className="w-full px-3 py-2 bg-sky-50/30 border border-sky-200 rounded-xl text-xs focus:ring-2 focus:ring-blue-500 focus:bg-white focus:outline-none font-medium"
              />
            </div>

            {/* Category */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                หมวดหมู่ <span className="text-red-500">*</span>
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-3 py-2 bg-sky-50/30 border border-sky-200 rounded-xl text-xs focus:ring-2 focus:ring-blue-500 focus:bg-white focus:outline-none font-medium cursor-pointer"
              >
                {BOOK_CATEGORIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>

            {/* ISBN */}
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                รหัส ISBN (ถ้ามี)
              </label>
              <div className="relative">
                <Hash className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="978-616-xxx-xxx"
                  value={isbn}
                  onChange={(e) => setIsbn(e.target.value)}
                  className="w-full pl-8 pr-3 py-2 bg-sky-50/30 border border-sky-200 rounded-xl text-xs font-mono focus:ring-2 focus:ring-blue-500 focus:bg-white focus:outline-none"
                />
              </div>
            </div>

            {/* Published Year */}
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                ปีที่พิมพ์ (พ.ศ.)
              </label>
              <div className="relative">
                <Calendar className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="2567"
                  value={publishedYear}
                  onChange={(e) => setPublishedYear(e.target.value)}
                  className="w-full pl-8 pr-3 py-2 bg-sky-50/30 border border-sky-200 rounded-xl text-xs focus:ring-2 focus:ring-blue-500 focus:bg-white focus:outline-none"
                />
              </div>
            </div>

            {/* Location */}
            <div className="sm:col-span-2">
              <label className="block text-xs font-medium text-slate-700 mb-1">
                ตำแหน่งจัดเก็บในห้องสมุด (ตู้ / ชั้นวาง)
              </label>
              <div className="relative">
                <MapPin className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="เช่น ตู้ภาษาไทย ชั้น 1 (TH-101)"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="w-full pl-8 pr-3 py-2 bg-sky-50/30 border border-sky-200 rounded-xl text-xs focus:ring-2 focus:ring-blue-500 focus:bg-white focus:outline-none"
                />
              </div>
            </div>

            {/* Cover URL */}
            <div className="sm:col-span-2">
              <label className="block text-xs font-medium text-slate-700 mb-1">
                URL รูปภาพหน้าปก
              </label>
              <input
                type="url"
                placeholder="https://..."
                value={coverUrl}
                onChange={(e) => setCoverUrl(e.target.value)}
                className="w-full px-3 py-2 bg-sky-50/30 border border-sky-200 rounded-xl text-xs focus:ring-2 focus:ring-blue-500 focus:bg-white focus:outline-none"
              />
            </div>

            {/* Description */}
            <div className="sm:col-span-2">
              <label className="block text-xs font-medium text-slate-700 mb-1">
                คำอธิบาย / เรื่องย่อ
              </label>
              <textarea
                rows={2}
                placeholder="ระบุเรื่องย่อ..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full px-3 py-2 bg-sky-50/30 border border-sky-200 rounded-xl text-xs focus:ring-2 focus:ring-blue-500 focus:bg-white focus:outline-none"
              />
            </div>
          </div>

          {/* Footer Actions */}
          <div className="pt-4 border-t border-sky-100 flex items-center justify-end gap-2.5">
            <button
              type="button"
              disabled={isSaving}
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
            >
              ยกเลิก
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="px-5 py-2 bg-gradient-to-r from-blue-600 to-sky-600 hover:from-blue-700 hover:to-sky-700 text-white rounded-xl text-xs font-bold shadow-md shadow-blue-500/20 transition-all flex items-center gap-1.5 hover:scale-105 active:scale-95 disabled:opacity-50"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>{isSaving ? 'กำลังบันทึกและซิงค์...' : 'บันทึกหนังสือ'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
