'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useLibrary } from '@/context/LibraryContext';
import { Book, BorrowerType, STUDENT_GRADES, SCHOOL_DEPARTMENTS } from '@/types';
import { formatThaiDate, getTodayString, addDays } from '@/lib/utils';
import { 
  Scan, 
  BookOpen, 
  GraduationCap, 
  UserCheck, 
  CheckCircle2, 
  AlertCircle, 
  Calendar, 
  Hash, 
  Phone, 
  School, 
  ArrowRight,
  PlusCircle,
  Heart
} from 'lucide-react';

interface TeacherBorrowDeskProps {
  onSuccess?: (msg: string) => void;
}

export const TeacherBorrowDesk: React.FC<TeacherBorrowDeskProps> = ({ onSuccess }) => {
  const { books, borrowBook, settings } = useLibrary();

  // Book search / barcode input
  const [bookIdInput, setBookIdInput] = useState('');
  const [matchedBook, setMatchedBook] = useState<Book | null>(null);

  // Borrower info
  const [borrowerType, setBorrowerType] = useState<BorrowerType>('STUDENT');
  const [studentName, setStudentName] = useState('');
  const [studentId, setStudentId] = useState('');
  const [studentGrade, setStudentGrade] = useState<string>(STUDENT_GRADES[0]); // ม.1
  const [studentRoom, setStudentRoom] = useState('1');
  const [studentPhone, setStudentPhone] = useState('');

  const [teacherName, setTeacherName] = useState('');
  const [teacherDepartment, setTeacherDepartment] = useState<string>(SCHOOL_DEPARTMENTS[0]); // ภาษาไทย
  const [teacherPhone, setTeacherPhone] = useState('');

  // Dates & Notes
  const [borrowDate, setBorrowDate] = useState<string>(getTodayString());
  const [dueDate, setDueDate] = useState<string>('');
  const [notes, setNotes] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [successInfo, setSuccessInfo] = useState<{
    bookTitle: string;
    borrowerName: string;
    dueDate: string;
  } | null>(null);

  // Auto-calculate default due date based on user type & settings
  useEffect(() => {
    const today = new Date(borrowDate || getTodayString());
    const days = borrowerType === 'STUDENT' ? settings.studentBorrowDays : settings.teacherBorrowDays;
    setDueDate(addDays(today, days));
  }, [borrowerType, borrowDate, settings]);

  // Live lookup book whenever bookIdInput changes
  useEffect(() => {
    setError(null);
    const query = bookIdInput.trim().toLowerCase();
    if (!query) {
      setMatchedBook(null);
      return;
    }

    const found = books.find(
      (b) => b.id.toLowerCase() === query || b.isbn.toLowerCase() === query || b.title.toLowerCase() === query
    );

    if (found) {
      setMatchedBook(found);
    } else {
      setMatchedBook(null);
    }
  }, [bookIdInput, books]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessInfo(null);

    if (!matchedBook) {
      setError(`ไม่พบข้อมูลหนังสือรหัส "${bookIdInput}" ในระบบ กรุณาตรวจสอบรหัสหนังสือหรือเพิ่มหนังสือเข้าระบบก่อน`);
      return;
    }

    if (matchedBook.status === 'BORROWED') {
      setError(`หนังสือ "${matchedBook.title}" (รหัส ${matchedBook.id}) กำลังถูกยืมอยู่ ไม่สามารถทำรายการซ้ำได้`);
      return;
    }

    let borrowerData;
    if (borrowerType === 'STUDENT') {
      if (!studentName.trim() || !studentId.trim()) {
        setError('กรุณากรอกชื่อ-นามสกุล และเลขประจำตัวนักเรียน');
        return;
      }
      borrowerData = {
        type: 'STUDENT' as const,
        name: studentName.trim(),
        studentId: studentId.trim(),
        grade: studentGrade,
        room: studentRoom.trim() || '1',
        phone: studentPhone.trim() || '-',
      };
    } else {
      if (!teacherName.trim()) {
        setError('กรุณากรอกชื่อครูผู้ยืม');
        return;
      }
      borrowerData = {
        type: 'TEACHER' as const,
        name: teacherName.trim(),
        department: teacherDepartment,
        phone: teacherPhone.trim() || '-',
      };
    }

    const res = borrowBook({
      bookId: matchedBook.id,
      borrower: borrowerData,
      borrowDate,
      dueDate,
      notes: notes.trim(),
    });

    if (res.success) {
      setSuccessInfo({
        bookTitle: matchedBook.title,
        borrowerName: borrowerData.name,
        dueDate: dueDate,
      });

      if (onSuccess) onSuccess(res.message);

      // Reset form fields
      setBookIdInput('');
      setMatchedBook(null);
      setStudentName('');
      setStudentId('');
      setTeacherName('');
      setNotes('');
    } else {
      setError(res.message);
    }
  };

  return (
    <div className="bg-white rounded-3xl p-6 sm:p-8 border border-pink-100 shadow-xl shadow-pink-100/50 space-y-6">
      {/* Desk Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-pink-50 pb-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-pink-500 to-rose-400 text-white flex items-center justify-center shadow-md shadow-pink-200">
            <Scan className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <h2 className="text-base sm:text-lg font-bold text-slate-900">
                เคาน์เตอร์ครูบันทึกการยืมหนังสือ (ใส่รหัสหนังสือ)
              </h2>
              <Heart className="w-3.5 h-3.5 text-pink-500 fill-pink-500" />
            </div>
            <p className="text-xs text-pink-700 font-medium">
              ระบบการจัดการการยืมคืนหนังสือของห้องสมุดหมวดภาษาไทย
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href="/admin"
            className="text-xs font-bold text-pink-700 hover:text-pink-900 bg-pink-50 hover:bg-pink-100 px-3.5 py-2 rounded-2xl transition-colors border border-pink-100"
          >
            ⚙️ ตั้งค่าระยะเวลายืม ({settings.studentBorrowDays} วัน)
          </Link>
        </div>
      </div>

      {/* Success Notification Banner */}
      {successInfo && (
        <div className="p-4 bg-emerald-50 border border-emerald-300 rounded-2xl flex items-center justify-between gap-3 animate-in fade-in">
          <div className="flex items-center gap-3">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
            <div className="text-xs text-emerald-900">
              <span className="font-bold">บันทึกการยืมสำเร็จ!</span> หนังสือ <strong>"{successInfo.bookTitle}"</strong> ให้แก่ <strong>{successInfo.borrowerName}</strong> (กำหนดส่ง: {formatThaiDate(successInfo.dueDate)})
            </div>
          </div>
          <button
            onClick={() => setSuccessInfo(null)}
            className="text-xs font-semibold text-emerald-700 hover:underline"
          >
            ปิด
          </button>
        </div>
      )}

      {/* Error Banner */}
      {error && (
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl flex items-start gap-3 text-xs text-rose-700">
          <AlertCircle className="w-4 h-4 text-rose-500 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="font-bold">{error}</p>
            {!matchedBook && bookIdInput && (
              <div className="mt-1">
                <Link
                  href="/books/new"
                  className="font-bold text-pink-600 hover:underline inline-flex items-center gap-1"
                >
                  <PlusCircle className="w-3.5 h-3.5" /> คลิกที่นี่เพื่อเพิ่มหนังสือรหัส "{bookIdInput}" เข้าระบบหลังบ้าน
                </Link>
              </div>
            )}
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Step 1: Book ID Lookup */}
        <div className="p-5 bg-pink-50/50 border border-pink-100 rounded-2xl space-y-3">
          <label className="block text-xs font-bold text-pink-950 uppercase tracking-wider">
            ขั้นตอนที่ 1: ใส่รหัสหนังสือที่นักเรียนนำมา (Book ID / Barcode) <span className="text-pink-600">*</span>
          </label>
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Scan className="w-4 h-4 text-pink-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                required
                placeholder="พิมพ์รหัสหนังสือ เช่น TH-001, วค-01..."
                value={bookIdInput}
                onChange={(e) => setBookIdInput(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-white border border-pink-200 rounded-2xl text-sm font-mono font-bold focus:ring-2 focus:ring-pink-400 focus:outline-none text-slate-800 placeholder:font-normal shadow-2xs"
              />
            </div>
            {books.length > 0 && (
              <select
                onChange={(e) => setBookIdInput(e.target.value)}
                value={matchedBook ? matchedBook.id : ''}
                className="py-2.5 px-3 bg-white border border-pink-200 rounded-2xl text-xs font-medium text-slate-700 cursor-pointer focus:ring-2 focus:ring-pink-400 shadow-2xs"
              >
                <option value="">-- หรือเลือกจากรายชื่อหนังสือ --</option>
                {books.map((b) => (
                  <option key={b.id} value={b.id}>
                    [{b.id}] {b.title.slice(0, 35)}... ({b.status === 'AVAILABLE' ? 'ยืมได้' : 'ถูกยืมอยู่'})
                  </option>
                ))}
              </select>
            )}
          </div>

          {/* Book live preview box */}
          {matchedBook ? (
            <div className="p-3.5 bg-white border border-pink-200 rounded-2xl flex items-center gap-3 shadow-sm animate-in fade-in">
              <img
                src={matchedBook.coverUrl}
                alt={matchedBook.title}
                className="w-12 h-16 object-cover rounded-xl shadow-xs bg-slate-100 flex-shrink-0"
              />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-mono font-bold text-pink-700 bg-pink-50 px-2 py-0.5 rounded border border-pink-200">
                    รหัส: {matchedBook.id}
                  </span>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    matchedBook.status === 'AVAILABLE' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-rose-50 text-rose-700 border border-rose-200'
                  }`}>
                    {matchedBook.status === 'AVAILABLE' ? '✓ พร้อมให้ยืม' : '✗ กำลังถูกยืมอยู่'}
                  </span>
                </div>
                <h4 className="text-xs font-bold text-slate-800 truncate mt-1">{matchedBook.title}</h4>
                <p className="text-[11px] text-slate-500 truncate">
                  ผู้แต่ง: {matchedBook.author} | หมวด: {matchedBook.category} {matchedBook.location && `| ตำแหน่ง: ${matchedBook.location}`}
                </p>
              </div>
            </div>
          ) : bookIdInput.trim() ? (
            <p className="text-xs text-pink-500 italic">กำลังค้นหารหัสหนังสือ "{bookIdInput}" ในระบบ...</p>
          ) : (
            <p className="text-[11px] text-slate-400">
              * สามารถพิมพ์รหัสหนังสือ หรือใช้เครื่องยิงบาร์โค้ดสแกนรหัสที่ติดบนปกหนังสือได้ทันที
            </p>
          )}
        </div>

        {/* Step 2: Borrower Info */}
        <div className="space-y-4">
          <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider">
            ขั้นตอนที่ 2: ระบุข้อมูลผู้ยืมหนังสือ
          </label>

          {/* Borrower Type Selector */}
          <div className="grid grid-cols-2 gap-3 max-w-sm">
            <button
              type="button"
              onClick={() => setBorrowerType('STUDENT')}
              className={`py-2 px-3 rounded-2xl border text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                borrowerType === 'STUDENT'
                  ? 'border-pink-500 bg-pink-50 text-pink-700 shadow-xs ring-2 ring-pink-400/20'
                  : 'border-slate-200 bg-white text-slate-600 hover:bg-pink-50/50'
              }`}
            >
              <GraduationCap className="w-4 h-4" />
              <span>1) นักเรียน</span>
            </button>

            <button
              type="button"
              onClick={() => setBorrowerType('TEACHER')}
              className={`py-2 px-3 rounded-2xl border text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                borrowerType === 'TEACHER'
                  ? 'border-pink-500 bg-pink-50 text-pink-700 shadow-xs ring-2 ring-pink-400/20'
                  : 'border-slate-200 bg-white text-slate-600 hover:bg-pink-50/50'
              }`}
            >
              <UserCheck className="w-4 h-4" />
              <span>2) ครู / บุคลากร</span>
            </button>
          </div>

          {/* Student Form */}
          {borrowerType === 'STUDENT' ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 p-4 bg-pink-50/30 rounded-2xl border border-pink-100">
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                  เลขประจำตัวนักเรียน <span className="text-pink-600">*</span>
                </label>
                <div className="relative">
                  <Hash className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    placeholder="เช่น 54201"
                    value={studentId}
                    onChange={(e) => setStudentId(e.target.value)}
                    className="w-full pl-8 pr-3 py-2 bg-white border border-pink-200 rounded-xl text-xs font-mono font-bold focus:ring-2 focus:ring-pink-400 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                  ชื่อ-นามสกุล นักเรียน <span className="text-pink-600">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="เช่น นาย กิตติศักดิ์ ใจดี"
                  value={studentName}
                  onChange={(e) => setStudentName(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-pink-200 rounded-xl text-xs font-medium focus:ring-2 focus:ring-pink-400 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">ระดับชั้น</label>
                <select
                  value={studentGrade}
                  onChange={(e) => setStudentGrade(e.target.value)}
                  className="w-full px-2 py-2 bg-white border border-pink-200 rounded-xl text-xs focus:ring-2 focus:ring-pink-400 focus:outline-none cursor-pointer"
                >
                  {STUDENT_GRADES.map((g) => (
                    <option key={g} value={g}>{g}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">ห้อง / เบอร์โทร</label>
                <div className="grid grid-cols-2 gap-1.5">
                  <input
                    type="text"
                    placeholder="ห้อง 1"
                    value={studentRoom}
                    onChange={(e) => setStudentRoom(e.target.value)}
                    className="w-full px-2 py-2 bg-white border border-pink-200 rounded-xl text-xs text-center font-bold"
                  />
                  <input
                    type="tel"
                    placeholder="08x-xxx"
                    value={studentPhone}
                    onChange={(e) => setStudentPhone(e.target.value)}
                    className="w-full px-2 py-2 bg-white border border-pink-200 rounded-xl text-xs"
                  />
                </div>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-4 bg-pink-50/30 rounded-2xl border border-pink-100">
              <div className="sm:col-span-2">
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                  ชื่อ-นามสกุล ครูผู้ยืม <span className="text-pink-600">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="เช่น ครูสมหมาย สุขใจ"
                  value={teacherName}
                  onChange={(e) => setTeacherName(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-pink-200 rounded-xl text-xs font-medium focus:ring-2 focus:ring-pink-400 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">กลุ่มสาระการเรียนรู้</label>
                <select
                  value={teacherDepartment}
                  onChange={(e) => setTeacherDepartment(e.target.value)}
                  className="w-full px-2 py-2 bg-white border border-pink-200 rounded-xl text-xs focus:ring-2 focus:ring-pink-400 focus:outline-none cursor-pointer"
                >
                  {SCHOOL_DEPARTMENTS.map((d) => (
                    <option key={d} value={d}>{d}</option>
                  ))}
                </select>
              </div>
            </div>
          )}
        </div>

        {/* Step 3: Due date preview & Submit */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-pink-100">
          <div className="flex items-center gap-2 text-xs text-slate-600">
            <Calendar className="w-4 h-4 text-pink-500" />
            <span>วันที่ยืม: <strong>{formatThaiDate(borrowDate)}</strong></span>
            <span>• กำหนดส่งคืน: <strong className="text-pink-700">{formatThaiDate(dueDate)}</strong> ({borrowerType === 'STUDENT' ? settings.studentBorrowDays : settings.teacherBorrowDays} วัน)</span>
          </div>

          <button
            type="submit"
            className="w-full sm:w-auto px-8 py-3 bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 text-white rounded-2xl text-xs font-bold shadow-md shadow-pink-200 transition-all flex items-center justify-center gap-2"
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>บันทึกการยืมหนังสือเข้าระบบ</span>
          </button>
        </div>
      </form>
    </div>
  );
};
