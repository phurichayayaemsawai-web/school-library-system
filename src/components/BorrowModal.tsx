import React, { useState, useEffect } from "react";
import { Book, Borrower } from "@/types";
import { useLibrary } from "@/context/LibraryContext";
import { GRADE_LEVELS, TEACHER_DEPARTMENTS } from "@/constants/library";
import { getTodayString, getCurrentTime, addDays } from "@/lib/utils";
import { BookOpen, X, CircleAlert, GraduationCap, UserCheck, Hash, Calendar } from "lucide-react";

interface BorrowModalProps {
  book: Book | null;
  onClose: () => void;
  onSuccess?: (message: string) => void;
}

export const BorrowModal: React.FC<BorrowModalProps> = ({
  book,
  onClose,
  onSuccess,
}) => {
  const { borrowBook, books, settings } = useLibrary();

  const [selectedBookId, setSelectedBookId] = useState<string>(book?.id || "");
  const [borrowerType, setBorrowerType] = useState<"STUDENT" | "TEACHER">("STUDENT");

  // Student form state
  const [studentName, setStudentName] = useState("");
  const [studentId, setStudentId] = useState("");
  const [grade, setGrade] = useState(GRADE_LEVELS[6] || "มัธยมศึกษาปีที่ 1 (ม.1)");
  const [room, setRoom] = useState("1");
  const [studentPhone, setStudentPhone] = useState("");

  // Teacher form state
  const [teacherName, setTeacherName] = useState("");
  const [department, setDepartment] = useState(TEACHER_DEPARTMENTS[0]);
  const [teacherPhone, setTeacherPhone] = useState("");

  // Date state
  const [borrowDate, setBorrowDate] = useState(getTodayString());
  const [dueDate, setDueDate] = useState(
    addDays(new Date(), settings.studentBorrowDays || 5)
  );
  const [notes, setNotes] = useState("");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    if (book) {
      setSelectedBookId(book.id);
    } else {
      setSelectedBookId("");
    }
    setErrorMessage(null);
  }, [book]);

  useEffect(() => {
    const bDate = new Date(borrowDate || getTodayString());
    const days =
      borrowerType === "STUDENT"
        ? settings.studentBorrowDays || 5
        : settings.teacherBorrowDays || 10;
    setDueDate(addDays(bDate, days));
  }, [borrowerType, borrowDate, settings]);

  if (!book) return null;

  const currentBook = books.find((b) => b.id === (selectedBookId || book.id)) || book;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!currentBook) {
      setErrorMessage("กรุณาเลือกหนังสือที่ต้องการยืม");
      return;
    }

    if (currentBook.status === "BORROWED") {
      setErrorMessage("หนังสือเล่มนี้กำลังถูกยืมอยู่ ไม่สามารถทำรายการได้");
      return;
    }

    let borrower: Borrower;
    if (borrowerType === "STUDENT") {
      if (!studentName.trim() || !studentId.trim()) {
        setErrorMessage("กรุณากรอกชื่อ-นามสกุล และเลขประจำตัวนักเรียน");
        return;
      }
      borrower = {
        type: "STUDENT",
        name: studentName.trim(),
        studentId: studentId.trim(),
        grade,
        room: room.trim() || "1",
        phone: studentPhone.trim() || "-",
      };
    } else {
      if (!teacherName.trim()) {
        setErrorMessage("กรุณากรอกชื่อ-นามสกุลครูผู้ยืม");
        return;
      }
      borrower = {
        type: "TEACHER",
        name: teacherName.trim(),
        department,
        phone: teacherPhone.trim() || "-",
      };
    }

    const borrowTime = getCurrentTime();
    const result = borrowBook({
      bookId: currentBook.id,
      borrower,
      borrowDate,
      borrowTime,
      dueDate,
      dueTime: "16:30 น.",
      notes: notes.trim(),
    });

    if (result.success) {
      if (onSuccess) onSuccess(result.message);
      onClose();
    } else {
      setErrorMessage(result.message);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="bg-white rounded-2xl sm:rounded-3xl max-w-xl w-full max-h-[92vh] overflow-y-auto shadow-2xl border border-slate-100 animate-in fade-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between px-4 sm:px-6 py-3.5 sm:py-4 border-b border-slate-100 bg-slate-50/70 sticky top-0 backdrop-blur-md z-10">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-blue-600 text-white shadow-xs shrink-0">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm sm:text-base font-bold text-slate-900">
                บันทึกการยืมหนังสือ
              </h2>
              <p className="text-[11px] sm:text-xs text-slate-500">
                กรอกข้อมูลผู้ยืมและกำหนดวันส่งคืน
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-4 sm:space-y-5">
          {errorMessage && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 flex items-center gap-2">
              <CircleAlert className="w-4 h-4 text-red-500 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {currentBook && (
            <div className="flex items-center gap-3 p-3 bg-blue-50/70 border border-blue-100 rounded-2xl">
              <img
                src={currentBook.coverUrl}
                alt={currentBook.title}
                className="w-10 h-14 sm:w-12 sm:h-16 object-cover rounded-lg shadow-2xs bg-slate-200 shrink-0"
                onError={(e) => {
                  (e.target as HTMLImageElement).src =
                    "https://placehold.co/100x150/e2e8f0/0369a1?text=Book";
                }}
              />
              <div className="flex-1 min-w-0">
                <span className="text-[10px] font-semibold text-blue-700 bg-white px-2 py-0.5 rounded-md shadow-2xs border border-blue-100 whitespace-nowrap">
                  {currentBook.id} • {currentBook.category}
                </span>
                <h4 className="text-xs font-bold text-slate-800 truncate mt-1">
                  {currentBook.title}
                </h4>
                <p className="text-[11px] text-slate-500 truncate">
                  ผู้แต่ง: {currentBook.author}
                </p>
              </div>
            </div>
          )}

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              ประเภทผู้ยืมหนังสือ
            </label>
            <div className="grid grid-cols-2 gap-2.5 sm:gap-3">
              <button
                type="button"
                onClick={() => setBorrowerType("STUDENT")}
                className={`flex items-center justify-center gap-1.5 sm:gap-2 py-2.5 sm:py-3 px-3 rounded-xl border text-xs font-bold transition-all whitespace-nowrap ${
                  borrowerType === "STUDENT"
                    ? "border-blue-600 bg-blue-50 text-blue-700 shadow-2xs ring-2 ring-blue-500/20"
                    : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
                }`}
              >
                <GraduationCap className="w-4 h-4 shrink-0" />
                <span>1) นักเรียน</span>
              </button>
              <button
                type="button"
                onClick={() => setBorrowerType("TEACHER")}
                className={`flex items-center justify-center gap-1.5 sm:gap-2 py-2.5 sm:py-3 px-3 rounded-xl border text-xs font-bold transition-all whitespace-nowrap ${
                  borrowerType === "TEACHER"
                    ? "border-blue-600 bg-blue-50 text-blue-700 shadow-2xs ring-2 ring-blue-500/20"
                    : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
                }`}
              >
                <UserCheck className="w-4 h-4 shrink-0" />
                <span>2) ครู / บุคลากร</span>
              </button>
            </div>
          </div>

          {borrowerType === "STUDENT" ? (
            <div className="space-y-3 p-3.5 sm:p-4 bg-slate-50 rounded-2xl border border-slate-200">
              <h4 className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                <GraduationCap className="w-4 h-4 text-blue-600" />
                ข้อมูลนักเรียนผู้ยืม
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 sm:gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1 whitespace-nowrap">
                    ชื่อ-นามสกุลนักเรียน <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="เช่น ด.ช. ธนภัทร สุขเกษม"
                    value={studentName}
                    onChange={(e) => setStudentName(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1 whitespace-nowrap">
                    เลขประจำตัวนักเรียน <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <Hash className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      required
                      placeholder="เช่น 54201"
                      value={studentId}
                      onChange={(e) => setStudentId(e.target.value)}
                      className="w-full pl-8 pr-3 py-2 bg-white border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1 whitespace-nowrap">
                    ระดับชั้น <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={grade}
                    onChange={(e) => setGrade(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none cursor-pointer"
                  >
                    {GRADE_LEVELS.map((g) => (
                      <option key={g} value={g}>
                        {g}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1 whitespace-nowrap">
                      ห้อง
                    </label>
                    <input
                      type="text"
                      placeholder="เช่น 1, 2"
                      value={room}
                      onChange={(e) => setRoom(e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1 whitespace-nowrap">
                      เบอร์โทรศัพท์
                    </label>
                    <input
                      type="tel"
                      placeholder="08x-xxx-xxxx"
                      value={studentPhone}
                      onChange={(e) => setStudentPhone(e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    />
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-3 p-3.5 sm:p-4 bg-slate-50 rounded-2xl border border-slate-200">
              <h4 className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                <UserCheck className="w-4 h-4 text-blue-600" />
                ข้อมูลครูผู้ยืม
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 sm:gap-3">
                <div className="sm:col-span-2">
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1 whitespace-nowrap">
                    ชื่อ-นามสกุล ครูผู้สอน <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="เช่น ครูนภาลัย วงศ์วิริยะ"
                    value={teacherName}
                    onChange={(e) => setTeacherName(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1 whitespace-nowrap">
                    กลุ่มสาระการเรียนรู้ <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={department}
                    onChange={(e) => setDepartment(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none cursor-pointer"
                  >
                    {TEACHER_DEPARTMENTS.map((d) => (
                      <option key={d} value={d}>
                        {d}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1 whitespace-nowrap">
                    เบอร์โทรศัพท์ติดต่อ
                  </label>
                  <input
                    type="tel"
                    placeholder="08x-xxx-xxxx"
                    value={teacherPhone}
                    onChange={(e) => setTeacherPhone(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 sm:gap-3">
            <div>
              <label className="block text-[11px] font-semibold text-slate-600 mb-1 whitespace-nowrap">
                วันที่ยืม <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Calendar className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="date"
                  required
                  value={borrowDate}
                  onChange={(e) => setBorrowDate(e.target.value)}
                  className="w-full pl-8 pr-3 py-2 bg-white border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-slate-600 mb-1 whitespace-nowrap">
                กำหนดวันส่งคืน (ก่อน 16:30 น.) <span className="text-red-500">*</span>
                <span className="text-[10px] text-blue-600 ml-1">
                  ({borrowerType === "TEACHER" ? `${settings.teacherBorrowDays || 10} วัน` : `${settings.studentBorrowDays || 5} วัน`})
                </span>
              </label>
              <div className="relative">
                <Calendar className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="date"
                  required
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  className="w-full pl-8 pr-3 py-2 bg-white border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>
            </div>
            <div className="sm:col-span-2">
              <label className="block text-[11px] font-semibold text-slate-600 mb-1 whitespace-nowrap">
                หมายเหตุ / วัตถุประสงค์การยืม (ไม่บังคับ)
              </label>
              <input
                type="text"
                placeholder="เช่น ยืมเพื่อทำรายงานกลุ่ม, เตรียมแผนการสอน"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>
          </div>

          <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2.5 sm:gap-3 sticky bottom-0 bg-white">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-xl text-xs font-semibold transition-colors"
            >
              ยกเลิก
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-md shadow-blue-200 transition-all flex items-center gap-1.5 whitespace-nowrap"
            >
              <BookOpen className="w-4 h-4" />
              <span>ยืนยันการยืมหนังสือ</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
