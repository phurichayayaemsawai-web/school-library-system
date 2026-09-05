"use client";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useLibrary } from "@/context/LibraryContext";
import { GRADE_LEVELS, ROOM_NUMBERS, TEACHER_DEPARTMENTS } from "@/constants/library";
import { formatDate, getCurrentTime, getTodayString, addDays } from "@/lib/utils";
import { StatCard } from "@/components/StatCard";
import { Toast, ToastData } from "@/components/Toast";
import { ReturnModal } from "@/components/ReturnModal";
import { BookOpen, CircleCheck, CircleAlert, CirclePlus, GraduationCap, UserCheck, Hash, Clock, Calendar, TriangleAlert, ShieldAlert, ArrowLeftRight, RotateCcw } from "lucide-react";
import { Borrower, Transaction } from "@/types";

function BorrowCounter({ onSuccess }: { onSuccess: (msg: string) => void }) {
  const { books, borrowBook, settings } = useLibrary();

  const [bookQuery, setBookQuery] = useState("");
  const [matchedBook, setMatchedBook] = useState<any>(null);
  const [currentTime, setCurrentTime] = useState(getCurrentTime());

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(getCurrentTime()), 5000);
    return () => clearInterval(timer);
  }, []);

  const [borrowerType, setBorrowerType] = useState<"STUDENT" | "TEACHER">("STUDENT");
  const [studentName, setStudentName] = useState("");
  const [studentId, setStudentId] = useState("");
  const [grade, setGrade] = useState("");
  const [room, setRoom] = useState("");
  const [studentPhone, setStudentPhone] = useState("");

  const [teacherName, setTeacherName] = useState("");
  const [department, setDepartment] = useState(TEACHER_DEPARTMENTS[0]);
  const [teacherPhone, setTeacherPhone] = useState("");

  const [borrowDate, setBorrowDate] = useState(getTodayString());
  const [dueDate, setDueDate] = useState("");
  const [notes, setNotes] = useState("");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successInfo, setSuccessInfo] = useState<any>(null);

  useEffect(() => {
    const bDate = new Date(borrowDate || getTodayString());
    const days = borrowerType === "STUDENT" ? settings.studentBorrowDays : settings.teacherBorrowDays;
    setDueDate(addDays(bDate, days));
  }, [borrowerType, borrowDate, settings]);

  useEffect(() => {
    setErrorMsg(null);
    const q = bookQuery.trim().toLowerCase();
    if (!q) {
      setMatchedBook(null);
      return;
    }
    const exact = books.find((b) => b.id.toLowerCase() === q || b.isbn.toLowerCase() === q);
    if (exact) {
      setMatchedBook(exact);
      return;
    }
    const fuzzy = books.find(
      (b) =>
        b.title.toLowerCase().includes(q) ||
        (b.author && b.author.toLowerCase().includes(q)) ||
        (b.isbn && b.isbn.toLowerCase().includes(q)) ||
        b.id.toLowerCase().includes(q)
    );
    setMatchedBook(fuzzy || null);
  }, [bookQuery, books]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessInfo(null);

    if (!matchedBook) {
      setErrorMsg(`ไม่พบข้อมูลหนังสือรหัส "${bookQuery}" ในระบบ กรุณาตรวจสอบรหัสหนังสือหรือเพิ่มหนังสือเข้าระบบก่อน`);
      return;
    }

    if (matchedBook.status === "BORROWED") {
      setErrorMsg(`หนังสือ "${matchedBook.title}" (รหัส ${matchedBook.id}) กำลังถูกยืมอยู่ ไม่สามารถทำรายการซ้ำได้`);
      return;
    }

    let borrower: Borrower;
    if (borrowerType === "STUDENT") {
      if (!studentName.trim() || !studentId.trim()) {
        setErrorMsg("กรุณากรอกชื่อ-นามสกุล และเลขประจำตัวนักเรียน");
        return;
      }
      if (!grade.trim()) {
        setErrorMsg("กรุณาเลือกระดับชั้น (มัธยมศึกษาปีที่ 1 - 6)");
        return;
      }
      if (!room.trim()) {
        setErrorMsg("กรุณาเลือกห้องเรียน (ห้อง 1 - 15)");
        return;
      }
      borrower = {
        type: "STUDENT",
        name: studentName.trim(),
        studentId: studentId.trim(),
        grade: grade.trim(),
        room: room.trim(),
        phone: studentPhone.trim() || "-",
      };
    } else {
      if (!teacherName.trim()) {
        setErrorMsg("กรุณากรอกชื่อครูผู้ยืม");
        return;
      }
      borrower = {
        type: "TEACHER",
        name: teacherName.trim(),
        department,
        phone: teacherPhone.trim() || "-",
      };
    }

    const time = getCurrentTime();
    const res = borrowBook({
      bookId: matchedBook.id,
      borrower,
      borrowDate,
      borrowTime: time,
      dueDate,
      dueTime: "16:30 น.",
      notes: notes.trim(),
    });

    if (res.success) {
      setSuccessInfo({
        bookTitle: matchedBook.title,
        borrowerName: borrower.name,
        borrowDate,
        borrowTime: time,
        dueDate,
      });
      if (onSuccess) onSuccess(res.message);
      setBookQuery("");
      setMatchedBook(null);
      setStudentName("");
      setStudentId("");
      setTeacherName("");
      setNotes("");
    } else {
      setErrorMsg(res.message);
    }
  };

  return (
    <div className="bg-white rounded-2xl sm:rounded-3xl p-4 sm:p-6 lg:p-8 border border-sky-100 shadow-soft space-y-5 sm:space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-sky-50 pb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-gradient-to-tr from-blue-600 via-blue-500 to-sky-400 text-white flex items-center justify-center shadow-md shadow-blue-200/70 shrink-0">
            <BookOpen className="w-5 h-5 sm:w-6 sm:h-6" />
          </div>
          <div>
            <h2 className="text-sm sm:text-base lg:text-lg font-bold text-slate-900">
              เคาน์เตอร์ครูบันทึกการยืมหนังสือ
            </h2>
            <p className="text-[11px] sm:text-xs text-sky-700 font-medium">
              ระบบบันทึกการยืมด้วยรหัสหนังสือ
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href="/admin"
            className="text-xs font-bold text-blue-700 hover:text-blue-900 bg-blue-50 hover:bg-blue-100 px-3 py-1.5 sm:px-3.5 sm:py-2 rounded-xl sm:rounded-2xl transition-colors border border-blue-200/60 whitespace-nowrap"
          >
            ⚙️ ระยะเวลายืม ({settings.studentBorrowDays} วัน)
          </Link>
        </div>
      </div>

      {successInfo && (
        <div className="p-3.5 sm:p-4 bg-emerald-50 border border-emerald-300 rounded-2xl flex items-center justify-between gap-3 animate-in fade-in">
          <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
            <CircleCheck className="w-5 h-5 text-emerald-600 shrink-0" />
            <div className="text-xs text-emerald-900">
              <span className="font-bold">บันทึกการยืมสำเร็จ!</span> หนังสือ{" "}
              <strong>"{successInfo.bookTitle}"</strong> ให้แก่{" "}
              <strong>{successInfo.borrowerName}</strong>
              <span className="block sm:inline sm:ml-1 text-emerald-800">
                (ยืมเมื่อ: {formatDate(successInfo.borrowDate)} {successInfo.borrowTime} น. • กำหนดส่ง:{" "}
                <strong>{formatDate(successInfo.dueDate)} ก่อนเวลา 16:30 น.</strong>)
              </span>
            </div>
          </div>
          <button
            onClick={() => setSuccessInfo(null)}
            className="text-xs font-semibold text-emerald-700 hover:underline shrink-0"
          >
            ปิด
          </button>
        </div>
      )}

      {errorMsg && (
        <div className="p-3.5 sm:p-4 bg-rose-50 border border-rose-200 rounded-2xl flex items-start gap-3 text-xs text-rose-700">
          <CircleAlert className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
          <div className="flex-1 min-w-0">
            <p className="font-bold">{errorMsg}</p>
            {!matchedBook && bookQuery && (
              <div className="mt-1">
                <Link
                  href="/books/new"
                  className="font-bold text-blue-600 hover:underline inline-flex items-center gap-1"
                >
                  <CirclePlus className="w-3.5 h-3.5" />
                  คลิกที่นี่เพื่อเพิ่มหนังสือรหัส "{bookQuery}" เข้าระบบ
                </Link>
              </div>
            )}
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5 sm:space-y-6">
        {/* Step 1: Book Query */}
        <div className="p-4 sm:p-5 bg-sky-50/50 border border-sky-100 rounded-2xl sm:rounded-3xl space-y-3">
          <label className="block text-xs font-bold text-sky-950 uppercase tracking-wider">
            ขั้นตอนที่ 1: ใส่รหัสหนังสือ, ชื่อหนังสือ, รหัส ISBN, ชื่อผู้แต่ง <span className="text-blue-600">*</span>
          </label>
          <div className="flex flex-col sm:flex-row gap-2.5 sm:gap-3">
            <div className="relative flex-1">
              <BookOpen className="w-4 h-4 text-sky-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                required
                placeholder="เช่น TH-001, วรรณคดี, 978-616-..., หรือยิงบาร์โค้ด"
                value={bookQuery}
                onChange={(e) => setBookQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 sm:py-3 bg-white border border-sky-200 rounded-xl sm:rounded-2xl text-xs sm:text-sm font-mono font-bold focus:ring-2 focus:ring-blue-500 focus:outline-none text-slate-800 placeholder:font-normal shadow-2xs"
              />
            </div>
            {books.length > 0 && (
              <select
                onChange={(e) => setBookQuery(e.target.value)}
                value={matchedBook ? matchedBook.id : ""}
                className="py-2.5 px-3 bg-white border border-sky-200 rounded-xl sm:rounded-2xl text-xs font-medium text-slate-700 cursor-pointer focus:ring-2 focus:ring-blue-500 shadow-2xs max-w-full sm:max-w-xs truncate"
              >
                <option value="">-- หรือเลือกจากรายการหนังสือ --</option>
                {books.map((b) => (
                  <option key={b.id} value={b.id}>
                    [{b.id}] {b.title.slice(0, 30)}... ({b.status === "AVAILABLE" ? "ยืมได้" : "ถูกยืม"})
                  </option>
                ))}
              </select>
            )}
          </div>

          {matchedBook ? (
            <div className="p-3 sm:p-3.5 bg-white border border-sky-200 rounded-2xl flex items-center gap-3 shadow-2xs animate-in fade-in">
              <img
                src={matchedBook.coverUrl}
                alt={matchedBook.title}
                className="w-10 h-14 sm:w-12 sm:h-16 object-cover rounded-xl shadow-xs bg-slate-100 shrink-0"
              />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="text-[10px] font-mono font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200 whitespace-nowrap">
                    รหัส: {matchedBook.id}
                  </span>
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full whitespace-nowrap ${
                      matchedBook.status === "AVAILABLE"
                        ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                        : "bg-rose-50 text-rose-700 border border-rose-200"
                    }`}
                  >
                    {matchedBook.status === "AVAILABLE" ? "✓ ยืมได้" : "✗ ถูกยืมอยู่"}
                  </span>
                  <span className="text-[10px] font-bold text-sky-800 bg-sky-50 px-2 py-0.5 rounded-md border border-sky-200 whitespace-nowrap">
                    ยืมแล้ว {matchedBook.totalBorrowedCount || 0} ครั้ง
                  </span>
                </div>
                <h4 className="text-xs font-bold text-slate-800 truncate mt-1">
                  {matchedBook.title}
                </h4>
                <p className="text-[11px] text-slate-500 truncate">
                  ผู้แต่ง: {matchedBook.author} | หมวด: {matchedBook.category}{" "}
                  {matchedBook.location && `| ${matchedBook.location}`}
                </p>
              </div>
            </div>
          ) : bookQuery.trim() ? (
            <p className="text-xs text-sky-600 italic">
              กำลังค้นหาข้อมูลหนังสือ "{bookQuery}" ในระบบ...
            </p>
          ) : (
            <p className="text-[11px] text-slate-400">
              * สามารถค้นหาด้วยรหัสหนังสือ, ชื่อหนังสือ, รหัส ISBN หรือชื่อผู้แต่ง
            </p>
          )}
        </div>

        {/* Step 2: Borrower Information */}
        <div className="space-y-3.5">
          <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider">
            ขั้นตอนที่ 2: ระบุข้อมูลผู้ยืมหนังสือ
          </label>
          <div className="grid grid-cols-2 gap-2.5 sm:gap-3 max-w-sm">
            <button
              type="button"
              onClick={() => setBorrowerType("STUDENT")}
              className={`py-2 px-3 rounded-xl sm:rounded-2xl border text-xs font-bold transition-all flex items-center justify-center gap-1.5 whitespace-nowrap ${
                borrowerType === "STUDENT"
                  ? "border-blue-600 bg-blue-50 text-blue-700 shadow-2xs ring-2 ring-blue-400/20"
                  : "border-slate-200 bg-white text-slate-600 hover:bg-sky-50/50"
              }`}
            >
              <GraduationCap className="w-4 h-4 shrink-0" />
              <span>1) นักเรียน</span>
            </button>
            <button
              type="button"
              onClick={() => setBorrowerType("TEACHER")}
              className={`py-2 px-3 rounded-xl sm:rounded-2xl border text-xs font-bold transition-all flex items-center justify-center gap-1.5 whitespace-nowrap ${
                borrowerType === "TEACHER"
                  ? "border-blue-600 bg-blue-50 text-blue-700 shadow-2xs ring-2 ring-blue-400/20"
                  : "border-slate-200 bg-white text-slate-600 hover:bg-sky-50/50"
              }`}
            >
              <UserCheck className="w-4 h-4 shrink-0" />
              <span>2) ครู / บุคลากร</span>
            </button>
          </div>

          {borrowerType === "STUDENT" ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 p-4 bg-sky-50/30 rounded-2xl border border-sky-100">
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1 whitespace-nowrap">
                  เลขประจำตัวนักเรียน <span className="text-blue-600">*</span>
                </label>
                <div className="relative">
                  <Hash className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    placeholder="เช่น 54201"
                    value={studentId}
                    onChange={(e) => setStudentId(e.target.value)}
                    className="w-full pl-8 pr-3 py-2 bg-white border border-sky-200 rounded-xl text-xs font-mono font-bold focus:ring-2 focus:ring-blue-400 focus:outline-none"
                  />
                </div>
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1 whitespace-nowrap">
                  ชื่อ-นามสกุล นักเรียน <span className="text-blue-600">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="เช่น นาย กิตติศักดิ์ ใจดี"
                  value={studentName}
                  onChange={(e) => setStudentName(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-sky-200 rounded-xl text-xs font-medium focus:ring-2 focus:ring-blue-400 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1 whitespace-nowrap">
                  ระดับชั้น <span className="text-rose-500">*</span>
                </label>
                <select
                  required
                  value={grade}
                  onChange={(e) => setGrade(e.target.value)}
                  className={`w-full px-2.5 py-2 bg-white border rounded-xl text-xs font-medium focus:ring-2 focus:ring-blue-400 focus:outline-none cursor-pointer ${
                    !grade ? "border-amber-300 text-slate-500" : "border-sky-200 text-slate-800"
                  }`}
                >
                  <option value="" disabled>
                    -- เลือกระดับชั้น (ม.1-ม.6) --
                  </option>
                  {GRADE_LEVELS.map((g) => (
                    <option key={g} value={g}>
                      {g}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1 whitespace-nowrap">
                  ห้อง <span className="text-rose-500">*</span> / เบอร์โทร
                </label>
                <div className="grid grid-cols-2 gap-1.5">
                  <select
                    required
                    value={room}
                    onChange={(e) => setRoom(e.target.value)}
                    className={`w-full px-1.5 py-2 bg-white border rounded-xl text-xs font-bold text-center focus:ring-2 focus:ring-blue-400 focus:outline-none cursor-pointer ${
                      !room ? "border-amber-300 text-slate-500" : "border-sky-200 text-blue-700"
                    }`}
                  >
                    <option value="" disabled>
                      -- ห้อง --
                    </option>
                    {ROOM_NUMBERS.map((r) => (
                      <option key={r} value={r}>
                        ห้อง {r}
                      </option>
                    ))}
                  </select>
                  <input
                    type="tel"
                    placeholder="08x-xxx"
                    value={studentPhone}
                    onChange={(e) => setStudentPhone(e.target.value)}
                    className="w-full px-2 py-2 bg-white border border-sky-200 rounded-xl text-xs"
                  />
                </div>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-4 bg-sky-50/30 rounded-2xl border border-sky-100">
              <div className="sm:col-span-2">
                <label className="block text-[11px] font-semibold text-slate-600 mb-1 whitespace-nowrap">
                  ชื่อ-นามสกุล ครูผู้ยืม <span className="text-blue-600">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="เช่น ครูสมหมาย สุขใจ"
                  value={teacherName}
                  onChange={(e) => setTeacherName(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-sky-200 rounded-xl text-xs font-medium focus:ring-2 focus:ring-blue-400 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1 whitespace-nowrap">
                  กลุ่มสาระการเรียนรู้
                </label>
                <select
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                  className="w-full px-2 py-2 bg-white border border-sky-200 rounded-xl text-xs focus:ring-2 focus:ring-blue-400 focus:outline-none cursor-pointer"
                >
                  {TEACHER_DEPARTMENTS.map((d) => (
                    <option key={d} value={d}>
                      {d}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          )}
        </div>

        {/* Date and Submit */}
        <div className="space-y-3 pt-4 border-t border-sky-100">
          <div className="p-3 bg-sky-50/70 border border-sky-200 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-2 text-xs text-slate-700">
              <div className="flex items-center gap-1.5 bg-white px-2.5 py-1 rounded-lg border border-sky-100 shadow-2xs">
                <Clock className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                <span>
                  วันที่ยืม: <strong>{formatDate(borrowDate)}</strong>{" "}
                  <span className="text-blue-600 font-bold font-mono">({currentTime} น.)</span>
                </span>
              </div>
              <div className="flex items-center gap-1.5 bg-white px-2.5 py-1 rounded-lg border border-sky-100 shadow-2xs">
                <Calendar className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                <span>
                  กำหนดส่งคืน: <strong className="text-blue-700">{formatDate(dueDate)}</strong>{" "}
                  <span className="text-amber-700 font-bold font-mono">ก่อน 16:30 น.</span> (
                  {borrowerType === "STUDENT" ? settings.studentBorrowDays : settings.teacherBorrowDays} วัน)
                </span>
              </div>
            </div>

            <div className="text-[11px] text-amber-800 font-bold bg-amber-50 px-2.5 py-1 rounded-lg border border-amber-200 inline-flex items-center gap-1 whitespace-nowrap self-start md:self-auto">
              <TriangleAlert className="w-3.5 h-3.5 text-amber-600 shrink-0" />
              <span>⏰ ต้องคืนภายในวันที่กำหนดก่อนเวลา 16:30 น.</span>
            </div>
          </div>

          <div className="flex items-center justify-end">
            <button
              type="submit"
              className="w-full sm:w-auto px-6 sm:px-8 py-3 bg-gradient-to-r from-blue-600 to-sky-500 hover:from-blue-700 hover:to-sky-600 text-white rounded-xl sm:rounded-2xl text-xs font-bold shadow-md shadow-blue-200/80 transition-all flex items-center justify-center gap-2 whitespace-nowrap hover:scale-[1.02] active:scale-95"
            >
              <CircleCheck className="w-4 h-4" />
              <span>บันทึกการยืมหนังสือเข้าระบบ</span>
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}

export default function BorrowReturnPage() {
  const { books, transactions, settings, isAdmin } = useLibrary();
  const [toast, setToast] = useState<ToastData | null>(null);
  const [activeTab, setActiveTab] = useState<"borrow" | "return">("borrow");
  const [returnSearch, setReturnSearch] = useState("");
  const [selectedReturnTrx, setSelectedReturnTrx] = useState<Transaction | null>(null);

  if (!isAdmin) {
    return (
      <div className="max-w-md mx-auto py-12 text-center space-y-4">
        <div className="w-16 h-16 rounded-2xl bg-amber-50 border border-amber-200 text-amber-600 flex items-center justify-center mx-auto">
          <ShieldAlert className="w-8 h-8" />
        </div>
        <h2 className="text-lg font-bold text-slate-900">
          หน้านี้สำหรับแอดมินหรือครูบรรณารักษ์เท่านั้น
        </h2>
        <p className="text-xs text-slate-500">
          กรุณาเข้าสู่ระบบแอดมินเพื่อใช้งานเคาน์เตอร์บันทึกการยืม-คืนหนังสือ
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

  const validBookIds = new Set(books.map((b) => b.id));
  const validTrx = transactions.filter((t) => validBookIds.has(t.bookId));
  const availableBooks = books.filter((b) => b.status === "AVAILABLE");
  const activeTrx = validTrx.filter((t) => t.status === "ACTIVE" || t.status === "OVERDUE");
  const overdueTrx = validTrx.filter((t) => t.status === "OVERDUE");
  const returnedTrx = validTrx.filter((t) => t.status === "RETURNED");

  const studentCount = activeTrx.filter((t) => t.borrower.type === "STUDENT").length;
  const teacherCount = activeTrx.filter((t) => t.borrower.type === "TEACHER").length;

  const showToast = (title: string, type: ToastData["type"] = "success") => {
    setToast({
      id: Date.now().toString(),
      type,
      title,
    });
  };

  const filteredReturnTrx = activeTrx.filter((t) => {
    if (!returnSearch.trim()) return true;
    const q = returnSearch.toLowerCase().trim();
    return (
      t.bookTitle.toLowerCase().includes(q) ||
      t.bookId.toLowerCase().includes(q) ||
      t.borrower.name.toLowerCase().includes(q) ||
      (t.borrower.type === "STUDENT" && t.borrower.studentId.includes(q))
    );
  });

  return (
    <div className="space-y-6 sm:space-y-8">
      <Toast toast={toast} onClose={() => setToast(null)} />

      <div>
        <h1 className="text-xl sm:text-2xl font-bold text-slate-900 flex items-center gap-2.5">
          <ArrowLeftRight className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600 shrink-0" />
          <span>ระบบการยืม - คืนหนังสือ</span>
        </h1>
        <p className="text-xs text-slate-500 mt-1 font-normal truncate">
          {settings.schoolName || "ห้องสมุดหมวดภาษาไทย โรงเรียนบรรหารแจ่มใสวิทยา ๓"}
        </p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-sky-100 pb-2">
        <button
          onClick={() => setActiveTab("borrow")}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
            activeTab === "borrow"
              ? "bg-blue-600 text-white shadow-xs"
              : "text-slate-600 hover:bg-sky-50"
          }`}
        >
          <BookOpen className="w-4 h-4" />
          <span>ยืมหนังสือ (เคาน์เตอร์ยืม)</span>
        </button>
        <button
          onClick={() => setActiveTab("return")}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
            activeTab === "return"
              ? "bg-emerald-600 text-white shadow-xs"
              : "text-slate-600 hover:bg-emerald-50"
          }`}
        >
          <RotateCcw className="w-4 h-4" />
          <span>รับคืนหนังสือ ({activeTrx.length} เล่ม)</span>
        </button>
      </div>

      {activeTab === "borrow" ? (
        <BorrowCounter onSuccess={(msg) => showToast(msg, "success")} />
      ) : (
        <div className="bg-white rounded-2xl sm:rounded-3xl p-4 sm:p-6 lg:p-8 border border-sky-100 shadow-soft space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h2 className="text-base font-bold text-slate-800 flex items-center gap-2">
                <RotateCcw className="w-5 h-5 text-emerald-600" />
                <span>เคาน์เตอร์รับคืนหนังสือด่วน</span>
              </h2>
              <p className="text-xs text-slate-500">
                สแกนหรือค้นหารหัสหนังสือเพื่อบันทึกรับคืนทันที
              </p>
            </div>
            <input
              type="text"
              placeholder="ค้นหารหัสหนังสือ, ชื่อหนังสือ, ชื่อผู้ยืม เพื่อรับคืน..."
              value={returnSearch}
              onChange={(e) => setReturnSearch(e.target.value)}
              className="px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs w-full sm:w-72 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          {filteredReturnTrx.length === 0 ? (
            <div className="p-8 text-center text-slate-400 space-y-2">
              <CircleCheck className="w-10 h-10 text-emerald-300 mx-auto" />
              <p className="font-bold text-slate-600">ไม่มีหนังสือที่รอรับคืนในขณะนี้</p>
            </div>
          ) : (
            <div className="divide-y divide-slate-100 border border-slate-100 rounded-2xl overflow-hidden">
              {filteredReturnTrx.map((t) => (
                <div
                  key={t.id}
                  className="p-3.5 sm:p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 hover:bg-sky-50/30 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <img
                      src={t.bookCoverUrl}
                      alt={t.bookTitle}
                      className="w-10 h-14 object-cover rounded-lg bg-slate-100 shrink-0"
                    />
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-mono font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded">
                          {t.bookId}
                        </span>
                        <h4 className="text-xs sm:text-sm font-bold text-slate-900">
                          {t.bookTitle}
                        </h4>
                      </div>
                      <p className="text-xs text-slate-500 mt-0.5">
                        ผู้ยืม: <strong className="text-slate-700">{t.borrower.name}</strong> (
                        {t.borrower.type === "STUDENT"
                          ? `นักเรียน ${t.borrower.grade}`
                          : "ครู"}
                        ) • กำหนดคืน: <strong className="text-indigo-600">{formatDate(t.dueDate)}</strong>
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => setSelectedReturnTrx(t)}
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-all shadow-xs flex items-center gap-1.5 whitespace-nowrap self-end sm:self-auto"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>บันทึกรับคืน</span>
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <StatCard
          title="รายการที่กำลังยืมอยู่"
          value={`${activeTrx.length} เล่ม`}
          subtitle={`นักเรียน ${studentCount} • ครู ${teacherCount}`}
          icon={Clock}
          color="blue"
        />
        <StatCard
          title="รายการเกินกำหนดส่ง"
          value={`${overdueTrx.length} เล่ม`}
          subtitle="ต้องการการติดตามทวงถาม"
          icon={TriangleAlert}
          color="rose"
        />
        <StatCard
          title="รับคืนแล้วทั้งหมด"
          value={`${returnedTrx.length} ครั้ง`}
          subtitle="ประวัติการส่งคืนสมบูรณ์"
          icon={CircleCheck}
          color="emerald"
        />
        <StatCard
          title="หนังสือพร้อมให้ยืม"
          value={`${availableBooks.length} เล่ม`}
          subtitle={`จากคลังทั้งหมด ${books.length} เล่ม`}
          icon={BookOpen}
          color="sky"
        />
      </div>

      <ReturnModal
        transaction={selectedReturnTrx}
        onClose={() => setSelectedReturnTrx(null)}
        onSuccess={(msg) => showToast(msg, "success")}
      />
    </div>
  );
}
