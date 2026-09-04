'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useLibrary } from '@/context/LibraryContext';
import { Toast, ToastMessage } from '@/components/ui/Toast';
import { STUDENT_GRADES, SCHOOL_DEPARTMENTS, BorrowerType } from '@/types';
import { formatThaiDate, addDays, getTodayString, getCurrentTimeString } from '@/lib/utils';
import { 
  BookOpen, 
  GraduationCap, 
  Hash, 
  CheckCircle2, 
  ArrowRight, 
  Search,
  Bookmark,
  UserCheck,
  Phone,
  Building2,
  Check,
  Clock,
  Calendar,
  AlertTriangle
} from 'lucide-react';

export default function QuickBorrowPage() {
  const { books, borrowBook, settings, isAdmin } = useLibrary();

  // Borrower role switcher: STUDENT (5 days) vs TEACHER (10 days)
  const [borrowerType, setBorrowerType] = useState<BorrowerType>('STUDENT');

  // Live time ticker
  const [currentTime, setCurrentTime] = useState<string>(getCurrentTimeString());

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(getCurrentTimeString());
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  // Student form fields
  const [studentId, setStudentId] = useState('');
  const [studentName, setStudentName] = useState('');
  const [grade, setGrade] = useState<string>(STUDENT_GRADES[0]); // ม.1
  const [room, setRoom] = useState('1');
  const [phone, setPhone] = useState('');

  // Teacher form fields
  const [teacherName, setTeacherName] = useState('');
  const [department, setDepartment] = useState<string>(SCHOOL_DEPARTMENTS[0]);
  const [teacherPhone, setTeacherPhone] = useState('');

  // Book selection state
  const [selectedBookId, setSelectedBookId] = useState('');
  const [searchBookQuery, setSearchBookQuery] = useState('');

  const [toast, setToast] = useState<ToastMessage | null>(null);
  const [lastBorrowed, setLastBorrowed] = useState<{
    bookTitle: string;
    borrowerName: string;
    borrowDate: string;
    borrowTime: string;
    dueDate: string;
    trxId: string;
    days: number;
  } | null>(null);

  const availableBooks = books.filter((b) => b.status === 'AVAILABLE');

  const filteredAvailableBooks = availableBooks.filter((b) => {
    if (!searchBookQuery.trim()) return true;
    const q = searchBookQuery.toLowerCase().trim();
    return (
      b.title.toLowerCase().includes(q) ||
      b.id.toLowerCase().includes(q) ||
      b.author.toLowerCase().includes(q) ||
      b.category.toLowerCase().includes(q)
    );
  });

  // Selected book object for Live Cover Preview
  const selectedBook = books.find((b) => b.id === selectedBookId);

  const today = getTodayString();
  const loanDays = borrowerType === 'STUDENT' ? (settings.studentBorrowDays || 5) : (settings.teacherBorrowDays || 10);
  const calculatedDueDate = addDays(new Date(today), loanDays);

  const showToast = (title: string, type: 'success' | 'error' | 'info' = 'success', description?: string) => {
    setToast({
      id: Date.now().toString(),
      type,
      title,
      description,
    });
  };

  const handleBorrowSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (borrowerType === 'STUDENT') {
      if (!studentId.trim() || !studentName.trim()) {
        showToast('กรุณากรอกเลขประจำตัวนักเรียนและชื่อ-นามสกุล', 'error');
        return;
      }
    } else {
      if (!teacherName.trim()) {
        showToast('กรุณากรอกชื่อ-นามสกุลครู / บุคลากร', 'error');
        return;
      }
    }

    if (!selectedBookId || !selectedBook) {
      showToast('กรุณาค้นหาและเลือกหนังสือที่ต้องการยืม', 'error');
      return;
    }

    const borrowTimeNow = getCurrentTimeString();

    const borrowerData = borrowerType === 'STUDENT'
      ? {
          type: 'STUDENT' as const,
          name: studentName.trim(),
          studentId: studentId.trim(),
          grade,
          room: room.trim() || '1',
          phone: phone.trim() || '-',
        }
      : {
          type: 'TEACHER' as const,
          name: teacherName.trim(),
          department,
          phone: teacherPhone.trim() || '-',
        };

    const result = borrowBook({
      bookId: selectedBook.id,
      borrower: borrowerData,
      borrowDate: today,
      borrowTime: borrowTimeNow,
      dueDate: calculatedDueDate,
      dueTime: '16:30 น.',
      notes: `ยืมผ่านหน้าทำรายการยืมหนังสือ (${borrowerType === 'STUDENT' ? 'นักเรียน 5 วัน' : 'ครู 10 วัน'})`,
    });

    if (result.success && result.transaction) {
      setLastBorrowed({
        bookTitle: selectedBook.title,
        borrowerName: borrowerType === 'STUDENT' ? studentName.trim() : teacherName.trim(),
        borrowDate: today,
        borrowTime: borrowTimeNow,
        dueDate: calculatedDueDate,
        trxId: result.transaction.id,
        days: loanDays,
      });

      showToast(
        result.message, 
        'success', 
        `ยืมวันที่ ${formatThaiDate(today)} (${borrowTimeNow} น.) • กำหนดส่งคืนภายในวันที่ ${formatThaiDate(calculatedDueDate)} ก่อนเวลา 16:30 น.`
      );

      // Reset book selection
      setSelectedBookId('');
      setSearchBookQuery('');
    } else {
      showToast(result.message, 'error');
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-5 sm:space-y-6">
      <Toast toast={toast} onClose={() => setToast(null)} />

      {/* Header Banner */}
      <div className="bg-gradient-to-r from-blue-700 via-blue-600 to-sky-500 rounded-2xl sm:rounded-3xl p-6 sm:p-8 text-white shadow-xl shadow-blue-500/20 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border border-blue-400/30">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/15 backdrop-blur-md text-xs font-semibold text-white mb-1 shadow-2xs whitespace-nowrap">
            <Bookmark className="w-3.5 h-3.5 text-sky-200 fill-sky-200 shrink-0" />
            <span>Thai Language library</span>
          </div>
          <h1 className="text-xl sm:text-3xl font-black tracking-tight">
            ทำรายการยืมหนังสือ
          </h1>
          <p className="text-xs sm:text-sm text-sky-100/90 font-normal">
            ค้นหาและบันทึกการยืมหนังสือของห้องสมุดหมวดภาษาไทย
          </p>
        </div>

        <div className="bg-white/15 backdrop-blur-md px-4 py-3 rounded-xl sm:rounded-2xl border border-white/25 text-center flex-shrink-0 self-stretch sm:self-auto">
          <span className="text-[11px] text-sky-100 block whitespace-nowrap">ระยะเวลายืมตามระเบียบ</span>
          <span className="text-lg font-black text-white">5-10 วัน</span>
        </div>
      </div>

      {/* Real-time Borrow & Due Time Information Card */}
      <div className="bg-gradient-to-r from-blue-50/90 via-sky-50/90 to-indigo-50/90 border-2 border-blue-300 rounded-2xl sm:rounded-3xl p-4 sm:p-5 shadow-sm space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
          {/* 1. วันที่ยืมและเวลาปัจจุบัน */}
          <div className="flex items-center gap-3 bg-white/90 backdrop-blur-xs p-3.5 rounded-xl sm:rounded-2xl border border-blue-100 shadow-2xs">
            <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center shrink-0 shadow-xs">
              <Clock className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <span className="text-[11px] font-semibold text-slate-500 block truncate">วันที่ยืม & เวลาปัจจุบันที่ทำรายการ</span>
              <p className="text-xs sm:text-sm font-bold text-slate-900 truncate">
                {formatThaiDate(today)} <span className="text-blue-600 font-mono font-black ml-1">เวลา {currentTime} น.</span>
              </p>
            </div>
          </div>

          {/* 2. กำหนดส่งคืนและเวลาปิดรับ */}
          <div className="flex items-center gap-3 bg-white/90 backdrop-blur-xs p-3.5 rounded-xl sm:rounded-2xl border border-indigo-100 shadow-2xs">
            <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center shrink-0 shadow-xs">
              <Calendar className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <span className="text-[11px] font-semibold text-slate-500 block truncate">
                กำหนดส่งคืน ({borrowerType === 'STUDENT' ? 'นักเรียน 5 วัน' : 'ครู 10 วัน'})
              </span>
              <p className="text-xs sm:text-sm font-bold text-indigo-950 truncate">
                ภายในวันที่ <strong className="text-indigo-600 font-black">{formatThaiDate(calculatedDueDate)}</strong>
              </p>
            </div>
          </div>
        </div>

        {/* Highlighted Warning condition bar */}
        <div className="flex items-center gap-2 bg-amber-100/90 text-amber-950 px-3.5 py-2.5 rounded-xl sm:rounded-2xl border border-amber-300 text-xs font-bold">
          <AlertTriangle className="w-4 h-4 text-amber-700 shrink-0" />
          <span>⏰ ข้อกำหนดการส่งคืน: <strong>ต้องคืนภายในวันที่กำหนดก่อนเวลา 16:30 น.</strong> ณ ห้องสมุดหมวดภาษาไทย</span>
        </div>
      </div>

      {/* Success Notification Banner from last borrow */}
      {lastBorrowed && (
        <div className="p-4 sm:p-5 bg-emerald-50 border-2 border-emerald-400 rounded-2xl sm:rounded-3xl shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 animate-in fade-in zoom-in-95">
          <div className="flex items-start gap-3">
            <div className="p-2.5 bg-emerald-600 text-white rounded-xl sm:rounded-2xl shrink-0">
              <CheckCircle2 className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>
            <div className="space-y-0.5">
              <h3 className="text-xs sm:text-sm font-bold text-emerald-950">
                ทำรายการยืมหนังสือสำเร็จเรียบร้อย!
              </h3>
              <p className="text-xs text-emerald-800">
                ผู้ยืม: <strong>{lastBorrowed.borrowerName}</strong> | หนังสือ: <strong>"{lastBorrowed.bookTitle}"</strong>
              </p>
              <p className="text-xs text-emerald-700 font-medium">
                📅 วันที่ยืม: <strong>{formatThaiDate(lastBorrowed.borrowDate)}</strong> เวลา <strong>{lastBorrowed.borrowTime} น.</strong>
              </p>
              <p className="text-xs text-emerald-950 font-bold">
                ⏰ กำหนดส่งคืน: <strong>{formatThaiDate(lastBorrowed.dueDate)} ก่อนเวลา 16:30 น.</strong> (ระยะเวลา {lastBorrowed.days} วัน | รหัส: {lastBorrowed.trxId})
              </p>
            </div>
          </div>

          <Link
            href="/"
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shadow-sm whitespace-nowrap self-end sm:self-auto"
          >
            <span>กลับหน้าแรก</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      )}

      {/* Main Borrow Form */}
      <form onSubmit={handleBorrowSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
        {/* Left: Borrower Info */}
        <div className="bg-white rounded-2xl sm:rounded-3xl p-5 sm:p-6 border border-sky-100 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-sky-50 pb-3 gap-2">
            <h3 className="text-xs sm:text-sm font-bold text-slate-800 flex items-center gap-2">
              <UserCheck className="w-4 h-4 text-blue-600 shrink-0" />
              <span>1. ข้อมูลผู้ยืม</span>
            </h3>

            {/* Borrower Type Switcher */}
            <div className="inline-flex p-0.5 bg-sky-50 border border-sky-200 rounded-xl text-xs font-bold">
              <button
                type="button"
                onClick={() => setBorrowerType('STUDENT')}
                className={`px-3 py-1 rounded-lg transition-all flex items-center gap-1 ${
                  borrowerType === 'STUDENT'
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'text-slate-600 hover:text-blue-600'
                }`}
              >
                <GraduationCap className="w-3.5 h-3.5 shrink-0" />
                <span>นักเรียน (5 วัน)</span>
              </button>
              <button
                type="button"
                onClick={() => setBorrowerType('TEACHER')}
                className={`px-3 py-1 rounded-lg transition-all flex items-center gap-1 ${
                  borrowerType === 'TEACHER'
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'text-slate-600 hover:text-indigo-600'
                }`}
              >
                <Bookmark className="w-3.5 h-3.5 shrink-0" />
                <span>ครู (10 วัน)</span>
              </button>
            </div>
          </div>

          {/* Student Fields */}
          {borrowerType === 'STUDENT' ? (
            <div className="space-y-3 animate-in fade-in duration-150">
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  เลขประจำตัวนักเรียน <span className="text-blue-600">*</span>
                </label>
                <div className="relative">
                  <Hash className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    placeholder="เช่น 22581"
                    value={studentId}
                    onChange={(e) => setStudentId(e.target.value)}
                    className="w-full pl-9 pr-3 py-2.5 bg-sky-50/40 border border-sky-200 rounded-xl text-xs font-mono font-bold placeholder:text-slate-400 placeholder:font-normal focus:ring-2 focus:ring-blue-400 focus:bg-white focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  ชื่อ-นามสกุล นักเรียน <span className="text-blue-600">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="เช่น ด.ช. ธนภัทร สุขเกษม"
                  value={studentName}
                  onChange={(e) => setStudentName(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-sky-50/40 border border-sky-200 rounded-xl text-xs font-medium placeholder:text-slate-400 focus:ring-2 focus:ring-blue-400 focus:bg-white focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1 whitespace-nowrap">ระดับชั้น</label>
                  <select
                    value={grade}
                    onChange={(e) => setGrade(e.target.value)}
                    className="w-full px-2.5 py-2.5 bg-sky-50/40 border border-sky-200 rounded-xl text-xs font-medium focus:ring-2 focus:ring-blue-400 focus:bg-white focus:outline-none cursor-pointer"
                  >
                    {STUDENT_GRADES.map((g) => (
                      <option key={g} value={g}>{g}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1 whitespace-nowrap">ห้องเรียน</label>
                  <input
                    type="text"
                    placeholder="เช่น 1, 2"
                    value={room}
                    onChange={(e) => setRoom(e.target.value)}
                    className="w-full px-3 py-2.5 bg-sky-50/40 border border-sky-200 rounded-xl text-xs text-center font-bold placeholder:text-slate-400 focus:ring-2 focus:ring-blue-400 focus:bg-white focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1 whitespace-nowrap">เบอร์โทรศัพท์ (ถ้ามี)</label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="tel"
                    placeholder="08x-xxx-xxxx"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full pl-9 pr-3 py-2.5 bg-sky-50/40 border border-sky-200 rounded-xl text-xs placeholder:text-slate-400 focus:ring-2 focus:ring-blue-400 focus:bg-white focus:outline-none"
                  />
                </div>
              </div>
            </div>
          ) : (
            /* Teacher Fields */
            <div className="space-y-3 animate-in fade-in duration-150">
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  ชื่อ-นามสกุล ครู / บุคลากร <span className="text-indigo-600">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="เช่น ครูสมศรี มณีวรรณ"
                  value={teacherName}
                  onChange={(e) => setTeacherName(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-indigo-50/30 border border-indigo-200 rounded-xl text-xs font-medium placeholder:text-slate-400 focus:ring-2 focus:ring-indigo-400 focus:bg-white focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  กลุ่มสาระการเรียนรู้ / แผนกงาน
                </label>
                <div className="relative">
                  <Building2 className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <select
                    value={department}
                    onChange={(e) => setDepartment(e.target.value)}
                    className="w-full pl-9 pr-3 py-2.5 bg-indigo-50/30 border border-indigo-200 rounded-xl text-xs font-medium focus:ring-2 focus:ring-indigo-400 focus:bg-white focus:outline-none cursor-pointer"
                  >
                    {SCHOOL_DEPARTMENTS.map((dept) => (
                      <option key={dept} value={dept}>{dept}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1 whitespace-nowrap">เบอร์โทรศัพท์ติดต่อ</label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="tel"
                    placeholder="08x-xxx-xxxx"
                    value={teacherPhone}
                    onChange={(e) => setTeacherPhone(e.target.value)}
                    className="w-full pl-9 pr-3 py-2.5 bg-indigo-50/30 border border-indigo-200 rounded-xl text-xs placeholder:text-slate-400 focus:ring-2 focus:ring-indigo-400 focus:bg-white focus:outline-none"
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Right: Book Selection & Live Cover Preview */}
        <div className="bg-white rounded-2xl sm:rounded-3xl p-5 sm:p-6 border border-sky-100 shadow-sm space-y-4 flex flex-col justify-between">
          <div className="space-y-3">
            <h3 className="text-xs sm:text-sm font-bold text-slate-800 flex items-center gap-2 border-b border-sky-50 pb-3">
              <BookOpen className="w-4 h-4 text-blue-600 shrink-0" />
              <span>2. ค้นหาและเลือกหนังสือที่ต้องการยืม</span>
            </h3>

            {/* Book search input */}
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="ค้นหาชื่อหนังสือ หรือรหัสหนังสือ เช่น TH-001..."
                value={searchBookQuery}
                onChange={(e) => {
                  setSearchBookQuery(e.target.value);
                  const exact = availableBooks.find((b) => b.id.toLowerCase() === e.target.value.toLowerCase().trim());
                  if (exact) {
                    setSelectedBookId(exact.id);
                  }
                }}
                className="w-full pl-9 pr-3 py-2.5 bg-sky-50/30 border border-sky-200 rounded-xl text-xs font-medium placeholder:text-slate-400 focus:ring-2 focus:ring-blue-400 focus:bg-white focus:outline-none"
              />
            </div>

            {/* Live Book Cover Preview Card */}
            {selectedBook ? (
              <div className="p-3.5 bg-gradient-to-r from-blue-50/80 to-sky-50/80 border-2 border-blue-400 rounded-2xl shadow-sm flex items-center gap-3.5 animate-in fade-in zoom-in-95">
                <div className="w-16 h-22 bg-slate-200 rounded-xl overflow-hidden shadow-md flex-shrink-0 border border-sky-200">
                  <img
                    src={selectedBook.coverUrl}
                    alt={selectedBook.title}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=600&auto=format&fit=crop&q=80';
                    }}
                  />
                </div>
                <div className="min-w-0 flex-1 space-y-1">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="text-[10px] font-mono font-bold text-blue-700 bg-blue-100 px-2 py-0.5 rounded-md">
                      {selectedBook.id}
                    </span>
                    <span className="text-[10px] text-slate-500 font-medium truncate">
                      {selectedBook.category}
                    </span>
                  </div>
                  <h4 className="text-xs sm:text-sm font-bold text-slate-900 line-clamp-2">
                    {selectedBook.title}
                  </h4>
                  <p className="text-[11px] text-slate-600 truncate">
                    ผู้แต่ง: {selectedBook.author}
                  </p>
                  {selectedBook.location && (
                    <p className="text-[10px] text-sky-700 font-medium truncate">
                      📍 ตำแหน่ง: {selectedBook.location}
                    </p>
                  )}
                </div>
                <div className="w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center shrink-0 shadow-xs">
                  <Check className="w-3.5 h-3.5" />
                </div>
              </div>
            ) : null}

            {/* Available Books List */}
            {availableBooks.length === 0 ? (
              isAdmin ? (
                <div className="p-6 text-center bg-sky-50/30 rounded-2xl border border-dashed border-sky-200 text-slate-500 text-xs space-y-3">
                  <BookOpen className="w-8 h-8 text-sky-400 mx-auto" />
                  <div className="space-y-0.5">
                    <p className="font-bold text-slate-700">ยังไม่มีหนังสือที่พร้อมให้ยืมในระบบ</p>
                    <p className="text-xs text-slate-400">คุณสามารถไปที่หน้าจัดการเพื่อลงทะเบียนหนังสือใหม่</p>
                  </div>
                  <Link
                    href="/books/new"
                    className="inline-flex items-center gap-1.5 px-4 py-2 bg-gradient-to-r from-blue-600 to-sky-600 text-white rounded-xl text-xs font-bold shadow-sm transition-all hover:scale-105 active:scale-95"
                  >
                    <span>+ เพิ่มหนังสือใหม่</span>
                  </Link>
                </div>
              ) : (
                <div className="p-6 text-center bg-sky-50/30 rounded-2xl border border-dashed border-sky-200 text-slate-400 text-xs space-y-2">
                  <BookOpen className="w-8 h-8 text-sky-400 mx-auto" />
                  <p className="font-bold text-slate-600">ยังไม่มีข้อมูลของหนังสือในคลัง</p>
                  <p className="text-xs text-slate-400">ผู้ดูแลระบบจะใส่ข้อมูลของหนังสือเข้ามาในภายหลัง</p>
                </div>
              )
            ) : (
              <div className="max-h-48 overflow-y-auto space-y-2 pr-1">
                {filteredAvailableBooks.map((book) => (
                  <div
                    key={book.id}
                    onClick={() => setSelectedBookId(book.id)}
                    className={`p-2.5 rounded-xl sm:rounded-2xl border cursor-pointer transition-all flex items-center gap-3 ${
                      selectedBookId === book.id
                        ? 'border-blue-500 bg-blue-50/90 ring-2 ring-blue-400/20 shadow-xs'
                        : 'border-sky-100 bg-white hover:bg-sky-50/40'
                    }`}
                  >
                    <div className="w-9 h-12 bg-slate-200 rounded-lg overflow-hidden flex-shrink-0 shadow-2xs">
                      <img
                        src={book.coverUrl}
                        alt={book.title}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=600&auto=format&fit=crop&q=80';
                        }}
                      />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1">
                        <span className="text-[10px] font-mono font-bold text-blue-700 bg-blue-100 px-1.5 py-0.2 rounded whitespace-nowrap">
                          {book.id}
                        </span>
                        <span className="text-[10px] text-slate-400 truncate">{book.category}</span>
                      </div>
                      <h4 className="text-xs font-bold text-slate-800 truncate mt-0.5">{book.title}</h4>
                      <p className="text-[11px] text-slate-500 truncate">{book.author}</p>
                    </div>
                    <div className="w-5 h-5 rounded-full border border-sky-300 flex items-center justify-center flex-shrink-0">
                      {selectedBookId === book.id && <div className="w-3 h-3 rounded-full bg-blue-600" />}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Submit Button & Due Date Reminder */}
          <div className="pt-3 border-t border-sky-50 space-y-2.5">
            <div className="p-2.5 bg-blue-50/80 border border-blue-200 rounded-xl text-[11px] text-slate-700 flex flex-col sm:flex-row sm:items-center justify-between gap-1.5 font-medium">
              <span className="flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                <span>ยืม: <strong>{formatThaiDate(today)}</strong> ({currentTime} น.)</span>
              </span>
              <span className="text-blue-900 font-bold flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                <span>ส่งคืน: <strong>{formatThaiDate(calculatedDueDate)}</strong> (ก่อน 16:30 น.)</span>
              </span>
            </div>

            <button
              type="submit"
              disabled={availableBooks.length === 0 || !selectedBookId}
              className="w-full py-3 bg-gradient-to-r from-blue-600 to-sky-600 hover:from-blue-700 hover:to-sky-700 text-white font-bold rounded-xl sm:rounded-2xl text-xs sm:text-sm shadow-md shadow-blue-500/20 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed hover:scale-[1.02] active:scale-95 whitespace-nowrap"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>ยืนยันการยืมหนังสือ</span>
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
