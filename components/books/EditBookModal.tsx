'use client';

import React, { useState, useEffect } from 'react';
import { useLibrary } from '@/context/LibraryContext';
import { BOOK_CATEGORIES, Book } from '@/types';
import { X, BookOpen, MapPin, Hash, Calendar, Bookmark, Save, RefreshCw, AlertCircle, Image as ImageIcon, Upload } from 'lucide-react';

interface EditBookModalProps {
  book: Book | null;
  isOpen?: boolean;
  onClose: () => void;
  onSuccess?: (message: string) => void;
}

export const EditBookModal: React.FC<EditBookModalProps> = ({ book, isOpen = true, onClose, onSuccess }) => {
  const { updateBook } = useLibrary();

  const [title, setTitle] = useState('');
  const [author, setAuthor] = useState('');
  const [category, setCategory] = useState<string>(BOOK_CATEGORIES[0]);
  const [isbn, setIsbn] = useState('');
  const [publishedYear, setPublishedYear] = useState('');
  const [location, setLocation] = useState('');
  const [coverUrl, setCoverUrl] = useState('');
  const [description, setDescription] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [imageError, setImageError] = useState(false);

  useEffect(() => {
    if (book) {
      setTitle(book.title || '');
      setAuthor(book.author || '');
      setCategory(book.category || BOOK_CATEGORIES[0]);
      setIsbn(book.isbn || '');
      setPublishedYear(book.publishedYear || '');
      setLocation(book.location || '');
      setCoverUrl(book.coverUrl || '');
      setDescription(book.description || '');
      setErrorMsg(null);
      setImageError(false);
    }
  }, [book]);

  if (!book || !isOpen) return null;

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setCoverUrl(reader.result as string);
        setImageError(false);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !author.trim()) {
      setErrorMsg('กรุณากรอกชื่อหนังสือและชื่อผู้แต่ง');
      return;
    }

    setIsSaving(true);
    setErrorMsg(null);

    try {
      await updateBook(book.id, {
        title: title.trim(),
        author: author.trim(),
        category,
        isbn: isbn.trim(),
        publishedYear: publishedYear.trim(),
        location: location.trim(),
        coverUrl: coverUrl.trim(),
        description: description.trim(),
      });

      if (onSuccess) onSuccess(`แก้ไขข้อมูลหนังสือ "${title}" เรียบร้อยแล้ว`);
      onClose();
    } catch (err: any) {
      setErrorMsg(err.message || 'เกิดข้อผิดพลาดในการบันทึกข้อมูลไปยังฐานข้อมูล');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-200"
      onClick={(e) => e.target === e.currentTarget && !isSaving && onClose()}
    >
      <div className="bg-white rounded-2xl sm:rounded-3xl max-w-3xl w-full max-h-[92vh] overflow-y-auto shadow-2xl border border-slate-100 animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between px-5 sm:px-6 py-4 border-b border-slate-100 sticky top-0 bg-white/95 backdrop-blur-md z-10">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-slate-900">
                แก้ไขข้อมูลหนังสือ (รหัส: <span className="font-mono text-blue-700">{book.id}</span>)
              </h2>
              <p className="text-[11px] sm:text-xs text-slate-500">
                ปรับปรุงข้อมูลหนังสือในฐานข้อมูลกลาง ซิงค์ข้อมูลทุกเครื่องทันที
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={isSaving}
            className="p-1.5 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer disabled:opacity-50"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 sm:p-6 space-y-4">
          {errorMsg && (
            <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 font-medium flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-500 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Image Preview */}
            <div className="space-y-3">
              <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200/80 space-y-3">
                <h3 className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                  <ImageIcon className="w-4 h-4 text-blue-600 shrink-0" />
                  <span>ภาพปกหนังสือ (Preview)</span>
                </h3>

                <div className="aspect-[3/4] rounded-xl overflow-hidden bg-slate-200 shadow-inner border border-slate-300 flex items-center justify-center relative">
                  {coverUrl && !imageError ? (
                    <img
                      src={coverUrl}
                      alt="Cover Preview"
                      className="w-full h-full object-cover"
                      onError={() => setImageError(true)}
                    />
                  ) : (
                    <div className="p-4 text-center space-y-2">
                      <BookOpen className="w-10 h-10 text-slate-400 mx-auto" />
                      <span className="text-[11px] text-slate-500 font-medium block">
                        ไม่มีรูปภาพปก
                      </span>
                    </div>
                  )}
                </div>

                <div>
                  <label className="flex items-center justify-center gap-2 w-full py-2 px-3 rounded-xl border border-dashed border-sky-300 bg-sky-50/60 hover:bg-sky-50 text-blue-700 text-xs font-semibold cursor-pointer transition-colors">
                    <Upload className="w-3.5 h-3.5" />
                    <span>อัปโหลดรูปจากเครื่อง</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                    />
                  </label>
                </div>
              </div>
            </div>

            {/* Fields */}
            <div className="md:col-span-2 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                {/* Title */}
                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    ชื่อหนังสือ <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="กรอกชื่อหนังสือ"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:ring-2 focus:ring-blue-500 focus:bg-white focus:outline-none"
                  />
                </div>

                {/* Author */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    ชื่อผู้แต่ง / ผู้จัดทำ <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="กรอกชื่อผู้แต่ง"
                    value={author}
                    onChange={(e) => setAuthor(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:ring-2 focus:ring-blue-500 focus:bg-white focus:outline-none"
                  />
                </div>

                {/* Category */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    หมวดหมู่หนังสือ <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:ring-2 focus:ring-blue-500 focus:bg-white focus:outline-none cursor-pointer"
                  >
                    {BOOK_CATEGORIES.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>

                {/* ISBN */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    รหัส ISBN
                  </label>
                  <div className="relative">
                    <Hash className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      placeholder="978-616-xxx-xxx"
                      value={isbn}
                      onChange={(e) => setIsbn(e.target.value)}
                      className="w-full pl-8 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono font-medium focus:ring-2 focus:ring-blue-500 focus:bg-white focus:outline-none"
                    />
                  </div>
                </div>

                {/* Published Year */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    ปีที่พิมพ์ (พ.ศ.)
                  </label>
                  <div className="relative">
                    <Calendar className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      placeholder="2567"
                      value={publishedYear}
                      onChange={(e) => setPublishedYear(e.target.value)}
                      className="w-full pl-8 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:ring-2 focus:ring-blue-500 focus:bg-white focus:outline-none"
                    />
                  </div>
                </div>

                {/* Location */}
                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    ตำแหน่งจัดเก็บในห้องสมุด
                  </label>
                  <div className="relative">
                    <MapPin className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      placeholder="เช่น ตู้ภาษาไทย ชั้น 1 (TH-101)"
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                      className="w-full pl-8 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:ring-2 focus:ring-blue-500 focus:bg-white focus:outline-none"
                    />
                  </div>
                </div>

                {/* Cover URL */}
                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    URL รูปภาพปก (ทางเลือกเพิ่มเติม)
                  </label>
                  <input
                    type="url"
                    placeholder="https://..."
                    value={coverUrl}
                    onChange={(e) => {
                      setCoverUrl(e.target.value);
                      setImageError(false);
                    }}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:ring-2 focus:ring-blue-500 focus:bg-white focus:outline-none"
                  />
                </div>

                {/* Description */}
                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    เรื่องย่อ / รายละเอียดหนังสือ
                  </label>
                  <div className="relative">
                    <Bookmark className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-3" />
                    <textarea
                      rows={3}
                      placeholder="ระบุเนื้อหาย่อเพื่อให้นักเรียนและครูใช้ในการค้นคว้า..."
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      className="w-full pl-8 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:ring-2 focus:ring-blue-500 focus:bg-white focus:outline-none leading-relaxed"
                    />
                  </div>
                </div>
              </div>

              {/* Footer Controls */}
              <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={onClose}
                  disabled={isSaving}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors whitespace-nowrap disabled:opacity-50"
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-5 py-2.5 bg-gradient-to-r from-blue-600 to-sky-600 hover:from-blue-700 hover:to-sky-700 text-white rounded-xl text-xs font-bold shadow-md shadow-blue-500/20 transition-all flex items-center gap-2 whitespace-nowrap hover:scale-105 active:scale-95 disabled:opacity-50"
                >
                  {isSaving ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      <span>กำลังบันทึก...</span>
                    </>
                  ) : (
                    <>
                      <Save className="w-3.5 h-3.5" />
                      <span>บันทึกการแก้ไข</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
