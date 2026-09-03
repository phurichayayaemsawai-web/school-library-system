'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useLibrary } from '@/context/LibraryContext';
import { Toast, ToastMessage } from '@/components/ui/Toast';
import { STUDENT_GRADES } from '@/types';
import { formatThaiDate, addDays, getTodayString } from '@/lib/utils';
import { 
  Zap, 
  BookOpen, 
  GraduationCap, 
  Hash, 
  CheckCircle2, 
  ArrowRight, 
  Search,
  Heart
} from 'lucide-react';

export default function QuickBorrowPage() {
  const { books, borrowBook, settings } = useLibrary();

  const [studentId, setStudentId] = useState('');
  const [studentName, setStudentName] = useState('');
  const [grade, setGrade] = useState<string>(STUDENT_GRADES[0]); // ม.1
  const [room, setRoom] = useState('1');
  const [phone, setPhone] = useState('');
  const [selectedBookId, setSelectedBookId] = useState('');
  const [searchBookQuery, setSearchBookQuery] = useState('');

  const [toast, setToast] = useState<ToastMessage | null>(null);
  const [lastBorrowed, setLastBorrowed] = useState<{
    bookTitle: string;
    studentName: string;
    dueDate: string;
    trxId: string;
  } | null>(null);

  const availableBooks = books.filter((b) => b.status === 'AVAILABLE');

  const filteredAvailableBooks = availableBooks.filter((b) => {
    if (!searchBookQuery.trim()) return true;
    const q = searchBookQuery.toLowerCase();
    return b.title.toLowerCase().includes(q) || b.id.toLowerCase().includes(q) || b.author.toLowerCase().includes(q);
  });

  const showToast = (title: string, type: 'success' | 'error' | 'info' = 'success', description?: string) => {
    setToast({
      id: Date.now().toString(),
      type,
      title,
      description,
    });
  };

  const handleQuickBorrow = (e: React.FormEvent) => {
    e.preventDefault();

    if (!studentId.trim() || !studentName.trim()) {
      showToast('กรุณากรอกรหัสนักเรียนและชื่อ-นามสกุล', 'error');
      return;
    }

    if (!selectedBookId) {
      showToast('กรุณาเลือกหนังสือที่ต้องการยืม', 'error');
      return;
    }

    const selectedBook = books.find((b) => b.id === selectedBookId);
    if (!selectedBook) {
      showToast('ไม่พบหนังสือที่เลือก', 'error');
      return;
    }

    const today = getTodayString();
    const calculatedDueDate = addDays(new Date(today), settings.studentBorrowDays);

    const result = borrowBook({
      bookId: selectedBook.id,
      borrower: {
        type: 'STUDENT',
        name: studentName.trim(),
        studentId: studentId.trim(),
        grade,
        room: room.trim() || '1',
        phone: phone.trim() || '-',
      },
      borrowDate: today,
      dueDate: calculatedDueDate,
      notes: 'ยืมผ่านระบบยืมด่วน (Quick Borrow Station)',
    });

    if (result.success && result.transaction) {
      setLastBorrowed({
        bookTitle: selectedBook.title,
        studentName: studentName.trim(),
        dueDate: calculatedDueDate,
        trxId: result.transaction.id,
      });

      showToast(result.message, 'success', `กำหนดส่งคืนภายในวันที่ ${formatThaiDate(calculatedDueDate)}`);

      setSelectedBookId('');
      setSearchBookQuery('');
    } else {
      showToast(result.message, 'error');
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <Toast toast={toast} onClose={() => setToast(null)} />

      {/* Header Banner */}
      <div className="bg-gradient-to-r from-pink-500 via-rose-400 to-pink-400 rounded-3xl p-6 sm:p-8 text-white shadow-xl shadow-pink-200/50 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border border-pink-200">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-xs font-bold text-white mb-1 shadow-2xs">
            <Heart className="w-3.5 h-3.5 text-pink-100 fill-pink-100" />
            <span>Fast Borrow Kiosk</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
            ระบบยืมหนังสือด่วนสำหรับนักเรียน
          </h1>
          <p className="text-xs sm:text-sm text-pink-50 font-medium">
            ระบบการจัดการการยืมคืนหนังสือของห้องสมุดหมวดภาษาไทย
          </p>
        </div>

        <div className="bg-white/20 backdrop-blur-md px-4 py-3 rounded-2xl border border-white/30 text-center flex-shrink-0">
          <span className="text-[11px] text-pink-100 block">ระยะเวลายืมตามระเบียบ</span>
          <span className="text-lg font-black text-white">{settings.studentBorrowDays} วัน</span>
        </div>
      </div>

      {/* Success Notification Banner from last borrow */}
      {lastBorrowed && (
        <div className="p-5 bg-emerald-50 border-2 border-emerald-400 rounded-3xl shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 animate-in fade-in zoom-in-95">
          <div className="flex items-start gap-3">
            <div className="p-2.5 bg-emerald-600 text-white rounded-2xl">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-emerald-950">
                ยืมหนังสือสำเร็จแล้ว! ข้อมูลขึ้นในระบบเรียบร้อย
              </h3>
              <p className="text-xs text-emerald-800 mt-0.5">
                ผู้ยืม: <strong>{lastBorrowed.studentName}</strong> | หนังสือ: <strong>"{lastBorrowed.bookTitle}"</strong>
              </p>
              <p className="text-xs text-emerald-700 mt-0.5 font-medium">
                📅 กำหนดส่งคืน: <strong>{formatThaiDate(lastBorrowed.dueDate)}</strong> (รหัสรายการ: {lastBorrowed.trxId})
              </p>
            </div>
          </div>

          <Link
            href="/borrow-return"
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shadow-sm whitespace-nowrap"
          >
            <span>ดูรายการในระบบยืม-คืน</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      )}

      {/* Main Borrow Form */}
      <form onSubmit={handleQuickBorrow} className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Left: Student Info */}
        <div className="bg-white rounded-3xl p-6 border border-pink-100 shadow-sm space-y-4">
          <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2 border-b border-pink-50 pb-3">
            <GraduationCap className="w-4 h-4 text-pink-500" />
            1. ข้อมูลนักเรียนผู้ยืม
          </h3>

          <div className="space-y-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                เลขประจำตัวนักเรียน <span className="text-pink-600">*</span>
              </label>
              <div className="relative">
                <Hash className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  required
                  placeholder="เช่น 54201"
                  value={studentId}
                  onChange={(e) => setStudentId(e.target.value)}
                  className="w-full pl-9 pr-3 py-2.5 bg-pink-50/40 border border-pink-200 rounded-2xl text-xs font-mono font-bold focus:ring-2 focus:ring-pink-400 focus:bg-white focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                ชื่อ-นามสกุล นักเรียน <span className="text-pink-600">*</span>
              </label>
              <input
                type="text"
                required
                placeholder="เช่น ด.ช. ธนภัทร สุขเกษม"
                value={studentName}
                onChange={(e) => setStudentName(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-pink-50/40 border border-pink-200 rounded-2xl text-xs font-medium focus:ring-2 focus:ring-pink-400 focus:bg-white focus:outline-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">ระดับชั้น</label>
                <select
                  value={grade}
                  onChange={(e) => setGrade(e.target.value)}
                  className="w-full px-2.5 py-2.5 bg-pink-50/40 border border-pink-200 rounded-2xl text-xs font-medium focus:ring-2 focus:ring-pink-400 focus:bg-white focus:outline-none cursor-pointer"
                >
                  {STUDENT_GRADES.map((g) => (
                    <option key={g} value={g}>{g}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">ห้องเรียน</label>
                <input
                  type="text"
                  placeholder="เช่น 1, 2"
                  value={room}
                  onChange={(e) => setRoom(e.target.value)}
                  className="w-full px-3 py-2.5 bg-pink-50/40 border border-pink-200 rounded-2xl text-xs text-center font-bold focus:ring-2 focus:ring-pink-400 focus:bg-white focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">เบอร์โทรศัพท์ (ถ้ามี)</label>
              <input
                type="tel"
                placeholder="08x-xxx-xxxx"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-pink-50/40 border border-pink-200 rounded-2xl text-xs focus:ring-2 focus:ring-pink-400 focus:bg-white focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* Right: Book Selection */}
        <div className="bg-white rounded-3xl p-6 border border-pink-100 shadow-sm space-y-4 flex flex-col justify-between">
          <div className="space-y-3">
            <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2 border-b border-pink-50 pb-3">
              <BookOpen className="w-4 h-4 text-pink-500" />
              2. เลือกหนังสือที่ต้องการยืม
            </h3>

            {/* Book search input */}
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="ค้นหาชื่อหนังสือ หรือรหัสหนังสือ..."
                value={searchBookQuery}
                onChange={(e) => setSearchBookQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-2 bg-pink-50/30 border border-pink-200 rounded-2xl text-xs focus:ring-2 focus:ring-pink-400 focus:bg-white focus:outline-none"
              />
            </div>

            {/* Available Books List */}
            {availableBooks.length === 0 ? (
              <div className="p-8 text-center bg-pink-50/30 rounded-2xl border border-dashed border-pink-200 text-slate-400 text-xs space-y-2">
                <BookOpen className="w-8 h-8 text-pink-300 mx-auto" />
                <p className="font-bold text-slate-600">ยังไม่มีหนังสือที่พร้อมให้ยืมในคลัง</p>
                <Link href="/books/new" className="text-pink-600 font-bold hover:underline inline-block text-[11px]">
                  + ให้คุณครูเพิ่มหนังสือใหม่เข้าระบบ
                </Link>
              </div>
            ) : (
              <div className="max-h-56 overflow-y-auto space-y-2 pr-1">
                {filteredAvailableBooks.map((book) => (
                  <div
                    key={book.id}
                    onClick={() => setSelectedBookId(book.id)}
                    className={`p-3 rounded-2xl border cursor-pointer transition-all flex items-center gap-3 ${
                      selectedBookId === book.id
                        ? 'border-pink-500 bg-pink-50/80 ring-2 ring-pink-400/20 shadow-xs'
                        : 'border-pink-100 bg-white hover:bg-pink-50/40'
                    }`}
                  >
                    <div className="w-8 h-11 bg-slate-200 rounded-lg overflow-hidden flex-shrink-0">
                      <img src={book.coverUrl} alt={book.title} className="w-full h-full object-cover" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1">
                        <span className="text-[10px] font-mono font-bold text-pink-700 bg-pink-100 px-1.5 py-0.2 rounded">
                          {book.id}
                        </span>
                        <span className="text-[10px] text-slate-400 truncate">{book.category}</span>
                      </div>
                      <h4 className="text-xs font-bold text-slate-800 truncate mt-0.5">{book.title}</h4>
                      <p className="text-[11px] text-slate-500 truncate">{book.author}</p>
                    </div>
                    <div className="w-5 h-5 rounded-full border border-pink-300 flex items-center justify-center flex-shrink-0">
                      {selectedBookId === book.id && <div className="w-3 h-3 rounded-full bg-pink-500" />}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Submit Button */}
          <div className="pt-3 border-t border-pink-50">
            <button
              type="submit"
              disabled={availableBooks.length === 0}
              className="w-full py-3.5 bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 text-white font-bold rounded-2xl text-xs shadow-lg shadow-pink-200 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Heart className="w-4 h-4 text-pink-100 fill-pink-100" />
              <span>กดยืนยันการยืมทันที (Fast Borrow)</span>
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
