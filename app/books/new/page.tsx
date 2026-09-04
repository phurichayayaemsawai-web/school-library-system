'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useLibrary } from '@/context/LibraryContext';
import { BOOK_CATEGORIES } from '@/types';
import { BookOpen, ArrowLeft, Image as ImageIcon, MapPin, Hash, Calendar, Bookmark, CheckCircle2, Upload, Scan, ShieldAlert } from 'lucide-react';

export default function AddBookPage() {
  const router = useRouter();
  const { addBook, books, isAdmin } = useLibrary();

  const [bookId, setBookId] = useState(`TH-${String(books.length + 1).padStart(3, '0')}`);
  const [title, setTitle] = useState('');
  const [author, setAuthor] = useState('');
  const [category, setCategory] = useState<string>(BOOK_CATEGORIES[0]); // วรรณคดีและวรรณกรรมไทย
  const [isbn, setIsbn] = useState('');
  const [publishedYear, setPublishedYear] = useState('2567');
  const [location, setLocation] = useState('ตู้ภาษาไทย ชั้น 1');
  const [coverUrl, setCoverUrl] = useState('https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=600&auto=format&fit=crop&q=80');
  const [description, setDescription] = useState('');
  const [submitted, setSubmitted] = useState(false);

  if (!isAdmin) {
    return (
      <div className="max-w-md mx-auto py-12 text-center space-y-4">
        <div className="w-16 h-16 rounded-2xl bg-amber-50 border border-amber-200 text-amber-600 flex items-center justify-center mx-auto">
          <ShieldAlert className="w-8 h-8" />
        </div>
        <h2 className="text-lg font-bold text-slate-900">หน้านี้สำหรับแอดมินหรือครูบรรณารักษ์เท่านั้น</h2>
        <p className="text-xs text-slate-500">
          กรุณาเข้าสู่ระบบแอดมินเพื่อลงทะเบียนหนังสือใหม่เข้าสู่ระบบ
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

  const sampleCovers = [
    'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=600&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1532012164546-f432f2e3edd3?w=600&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1512820790803-83ca734da794?w=600&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?w=600&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1515879218367-8466d910aaa4?w=600&auto=format&fit=crop&q=80',
  ];

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setCoverUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim() || !author.trim()) {
      alert('กรุณากรอกชื่อหนังสือและชื่อผู้แต่ง');
      return;
    }

    addBook({
      id: bookId.trim() || `TH-${String(books.length + 1).padStart(3, '0')}`,
      title: title.trim(),
      author: author.trim(),
      category,
      isbn: isbn.trim() || `978-616-${Math.floor(1000 + Math.random() * 9000)}-${Math.floor(10 + Math.random() * 90)}`,
      coverUrl: coverUrl.trim() || sampleCovers[0],
      publishedYear: publishedYear.trim() || '2567',
      location: location.trim() || 'ตู้ภาษาไทย',
      description: description.trim(),
    });

    setSubmitted(true);
    setTimeout(() => {
      router.push('/books');
    }, 1200);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Back button & Header */}
      <div>
        <Link
          href="/admin"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-blue-600 transition-colors mb-3"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>กลับไปยังระบบแอดมิน / คลังหนังสือ</span>
        </Link>
        <h1 className="text-xl sm:text-2xl font-bold text-slate-900 flex items-center gap-2.5">
          <BookOpen className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600 shrink-0" />
          <span>ลงทะเบียนหนังสือใหม่เข้าคลัง (ระบบหลังบ้านครู)</span>
        </h1>
        <p className="text-xs text-slate-500 mt-0.5 font-normal">
          กำหนดรหัสหนังสือและข้อมูลทางบรรณานุกรม เพื่อให้นักเรียนยืมด้วยรหัสได้ทันที
        </p>
      </div>

      {submitted ? (
        <div className="bg-white rounded-2xl sm:rounded-3xl p-10 sm:p-12 text-center border border-sky-100 shadow-sm space-y-3">
          <div className="w-16 h-16 rounded-2xl sm:rounded-3xl bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
            <CheckCircle2 className="w-8 h-8" />
          </div>
          <h2 className="text-base sm:text-lg font-bold text-slate-800">ลงทะเบียนหนังสือรหัส "{bookId}" เรียบร้อยแล้ว!</h2>
          <p className="text-xs text-slate-500">กำลังนำท่านไปยังหน้ารายการหนังสือ...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Left Column: Cover preview & Upload */}
          <div className="space-y-4">
            <div className="bg-white rounded-2xl sm:rounded-3xl p-5 border border-sky-100 shadow-sm space-y-3">
              <h3 className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                <ImageIcon className="w-4 h-4 text-blue-600 shrink-0" />
                <span>ภาพปกหนังสือ (Live Preview)</span>
              </h3>

              <div className="aspect-[3/4] rounded-xl sm:rounded-2xl overflow-hidden bg-slate-100 shadow-inner border border-slate-200">
                <img
                  src={coverUrl}
                  alt="Preview ปกหนังสือ"
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = 'https://placehold.co/400x600/e2e8f0/475569?text=Cover+Preview';
                  }}
                />
              </div>

              {/* Upload local file */}
              <div>
                <label className="flex items-center justify-center gap-2 w-full py-2.5 px-3 rounded-xl border border-dashed border-sky-300 bg-sky-50/50 hover:bg-sky-50 text-blue-700 text-xs font-semibold cursor-pointer transition-colors">
                  <Upload className="w-4 h-4" />
                  <span>อัปโหลดรูปจากเครื่อง</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                </label>
              </div>

              {/* Sample cover presets */}
              <div>
                <span className="text-[11px] font-semibold text-slate-500 block mb-1.5">หรือเลือกรูปตัวอย่าง:</span>
                <div className="flex gap-2 overflow-x-auto pb-1">
                  {sampleCovers.map((url, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => setCoverUrl(url)}
                      className={`w-10 h-14 rounded-lg overflow-hidden flex-shrink-0 border-2 transition-all ${
                        coverUrl === url ? 'border-blue-600 scale-105 shadow-xs' : 'border-slate-200 opacity-70 hover:opacity-100'
                      }`}
                    >
                      <img src={url} alt="preset" className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Form details */}
          <div className="md:col-span-2">
            <form onSubmit={handleSubmit} className="bg-white rounded-2xl sm:rounded-3xl p-5 sm:p-8 border border-sky-100 shadow-sm space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Book ID */}
                <div className="sm:col-span-2 p-4 bg-sky-50/70 border border-sky-200 rounded-2xl">
                  <label className="block text-xs font-bold text-blue-950 mb-1">
                    รหัสหนังสือ (Book ID / Barcode) <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <Scan className="w-4 h-4 text-blue-600 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      required
                      placeholder="เช่น TH-001, วค-01, หรือ 00123"
                      value={bookId}
                      onChange={(e) => setBookId(e.target.value)}
                      className="w-full pl-10 pr-3.5 py-2.5 bg-white border border-sky-300 rounded-xl text-xs font-mono font-bold text-blue-900 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    />
                  </div>
                  <p className="text-[11px] text-blue-700 mt-1">
                    * รหัสนี้จะใช้ให้นักเรียนนำมาบอกครู หรือใช้เครื่องยิงบาร์โค้ดบันทึกการยืมใน 1 วินาที
                  </p>
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    ชื่อหนังสือ <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="เช่น วรรณคดีไทยฉบับวิเคราะห์: ลิลิตพระลอ"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-sky-50/30 border border-sky-200 rounded-xl text-xs focus:ring-2 focus:ring-blue-500 focus:bg-white focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    ชื่อผู้แต่ง / ผู้จัดทำ <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="เช่น ศ.ดร. รื่นฤทัย หรือ ราชบัณฑิตยสภา"
                    value={author}
                    onChange={(e) => setAuthor(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-sky-50/30 border border-sky-200 rounded-xl text-xs focus:ring-2 focus:ring-blue-500 focus:bg-white focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    หมวดหมู่หนังสือ <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-sky-50/30 border border-sky-200 rounded-xl text-xs focus:ring-2 focus:ring-blue-500 focus:bg-white focus:outline-none cursor-pointer"
                  >
                    {BOOK_CATEGORIES.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    รหัส ISBN (ถ้ามี)
                  </label>
                  <div className="relative">
                    <Hash className="w-3.5 h-3.5 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      placeholder="978-616-xxx-xxx"
                      value={isbn}
                      onChange={(e) => setIsbn(e.target.value)}
                      className="w-full pl-9 pr-3.5 py-2.5 bg-sky-50/30 border border-sky-200 rounded-xl text-xs focus:ring-2 focus:ring-blue-500 focus:bg-white focus:outline-none font-mono"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    ปีที่พิมพ์ (พ.ศ.)
                  </label>
                  <div className="relative">
                    <Calendar className="w-3.5 h-3.5 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      placeholder="2567"
                      value={publishedYear}
                      onChange={(e) => setPublishedYear(e.target.value)}
                      className="w-full pl-9 pr-3.5 py-2.5 bg-sky-50/30 border border-sky-200 rounded-xl text-xs focus:ring-2 focus:ring-blue-500 focus:bg-white focus:outline-none"
                    />
                  </div>
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    ตำแหน่งจัดเก็บในห้องสมุด (ตู้ / ชั้นวาง)
                  </label>
                  <div className="relative">
                    <MapPin className="w-3.5 h-3.5 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      placeholder="เช่น ตู้ภาษาไทย ชั้น 1 (TH-101)"
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                      className="w-full pl-9 pr-3.5 py-2.5 bg-sky-50/30 border border-sky-200 rounded-xl text-xs focus:ring-2 focus:ring-blue-500 focus:bg-white focus:outline-none"
                    />
                  </div>
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    URL รูปภาพปก
                  </label>
                  <input
                    type="url"
                    placeholder="https://..."
                    value={coverUrl}
                    onChange={(e) => setCoverUrl(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-sky-50/30 border border-sky-200 rounded-xl text-xs focus:ring-2 focus:ring-blue-500 focus:bg-white focus:outline-none"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    เรื่องย่อ / คำอธิบายรายละเอียด
                  </label>
                  <div className="relative">
                    <Bookmark className="w-3.5 h-3.5 text-slate-400 absolute left-3.5 top-3" />
                    <textarea
                      rows={3}
                      placeholder="ระบุเนื้อหาย่อเพื่อให้นักเรียนและครูใช้ในการค้นคว้า..."
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      className="w-full pl-9 pr-3.5 py-2.5 bg-sky-50/30 border border-sky-200 rounded-xl text-xs focus:ring-2 focus:ring-blue-500 focus:bg-white focus:outline-none leading-relaxed"
                    />
                  </div>
                </div>
              </div>

              {/* Submit Actions */}
              <div className="pt-4 border-t border-sky-50 flex items-center justify-end gap-3">
                <Link
                  href="/admin"
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors whitespace-nowrap"
                >
                  ยกเลิก
                </Link>
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-gradient-to-r from-blue-600 to-sky-600 hover:from-blue-700 hover:to-sky-700 text-white rounded-xl text-xs font-bold shadow-md shadow-blue-500/20 transition-all flex items-center gap-2 whitespace-nowrap hover:scale-105 active:scale-95"
                >
                  <BookOpen className="w-4 h-4" />
                  <span>บันทึกหนังสือเข้าสู่ระบบ</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
