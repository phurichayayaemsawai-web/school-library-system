import React, { useState } from "react";
import { Transaction } from "@/types";
import { useLibrary } from "@/context/LibraryContext";
import { formatDate, getTodayString, isOverdue } from "@/lib/utils";
import { CircleCheck, X, TriangleAlert, GraduationCap, School, Calendar, RotateCcw } from "lucide-react";

interface ReturnModalProps {
  transaction: Transaction | null;
  onClose: () => void;
  onSuccess?: (message: string) => void;
}

export const ReturnModal: React.FC<ReturnModalProps> = ({
  transaction,
  onClose,
  onSuccess,
}) => {
  const { returnBook } = useLibrary();
  const [returnDate, setReturnDate] = useState(getTodayString());

  if (!transaction) return null;

  const overdue = isOverdue(transaction.dueDate, transaction.returnDate);
  const isStudent = transaction.borrower.type === "STUDENT";

  const handleConfirmReturn = () => {
    const result = returnBook(transaction.id, returnDate);
    if (result.success) {
      if (onSuccess) onSuccess(result.message);
      onClose();
    } else {
      alert(result.message);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="bg-white rounded-2xl sm:rounded-3xl max-w-md w-full max-h-[92vh] overflow-y-auto shadow-2xl border border-slate-100 animate-in fade-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between px-4 sm:px-6 py-3.5 sm:py-4 border-b border-slate-100 bg-slate-50/70 sticky top-0 backdrop-blur-md z-10">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-emerald-600 text-white shadow-xs shrink-0">
              <CircleCheck className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm sm:text-base font-bold text-slate-900">
                บันทึกรับคืนหนังสือ
              </h2>
              <p className="text-[11px] sm:text-xs text-slate-500">
                รหัสรายการ: {transaction.id}
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

        <div className="p-4 sm:p-6 space-y-3.5 sm:space-y-4">
          {overdue && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-2xl text-xs text-red-700 flex items-start gap-2.5">
              <TriangleAlert className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
              <div>
                <p className="font-bold">รายการนี้เกินกำหนดส่งคืน!</p>
                <p className="text-[11px] text-red-600 mt-0.5">
                  กำหนดส่งคือวันที่ {formatDate(transaction.dueDate)} กรุณาตรวจสอบสภาพหนังสือ
                </p>
              </div>
            </div>
          )}

          <div className="flex gap-3 p-3 bg-slate-50 border border-slate-200 rounded-2xl">
            <img
              src={transaction.bookCoverUrl}
              alt={transaction.bookTitle}
              className="w-12 h-16 sm:w-14 sm:h-18 object-cover rounded-xl shadow-2xs bg-slate-200 shrink-0"
              onError={(e) => {
                (e.target as HTMLImageElement).src =
                  "https://placehold.co/100x150/e2e8f0/0369a1?text=Book";
              }}
            />
            <div className="flex-1 min-w-0">
              <span className="text-[10px] font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-md border border-blue-100 whitespace-nowrap">
                {transaction.bookId}
              </span>
              <h4 className="text-xs font-bold text-slate-800 line-clamp-2 mt-1">
                {transaction.bookTitle}
              </h4>
              <p className="text-[11px] text-slate-500 mt-0.5 truncate">
                {transaction.bookCategory}
              </p>
            </div>
          </div>

          <div className="p-3 bg-slate-50/70 border border-slate-100 rounded-2xl space-y-1.5 text-xs">
            <div className="flex items-center justify-between text-slate-500 gap-2">
              <span className="flex items-center gap-1.5 whitespace-nowrap">
                {isStudent ? (
                  <GraduationCap className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                ) : (
                  <School className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                )}
                ผู้ยืม ({isStudent ? "นักเรียน" : "ครู"}):
              </span>
              <span className="font-bold text-slate-800 truncate">
                {transaction.borrower.name}
              </span>
            </div>

            {isStudent && "studentId" in transaction.borrower ? (
              <div className="flex items-center justify-between text-slate-500 gap-2">
                <span className="whitespace-nowrap">รหัส / ระดับชั้น:</span>
                <span className="font-medium text-slate-700 truncate">
                  {transaction.borrower.studentId} • {transaction.borrower.grade} (ห้อง {transaction.borrower.room})
                </span>
              </div>
            ) : (
              <div className="flex items-center justify-between text-slate-500 gap-2">
                <span className="whitespace-nowrap">กลุ่มสาระฯ:</span>
                <span className="font-medium text-slate-700 truncate">
                  {"department" in transaction.borrower ? transaction.borrower.department : "-"}
                </span>
              </div>
            )}

            <div className="flex items-center justify-between text-slate-500 pt-1 border-t border-slate-200/60">
              <span className="whitespace-nowrap">วันที่ยืม:</span>
              <span className="text-slate-700 font-medium whitespace-nowrap">
                {formatDate(transaction.borrowDate)}{" "}
                {transaction.borrowTime ? `(${transaction.borrowTime} น.)` : ""}
              </span>
            </div>

            <div className="flex items-center justify-between text-slate-500">
              <span className="whitespace-nowrap">กำหนดส่งคืน:</span>
              <span className={`font-bold whitespace-nowrap ${overdue ? "text-red-600" : "text-slate-700"}`}>
                {formatDate(transaction.dueDate)}{" "}
                <span className="text-amber-700 font-semibold text-[11px]">(ก่อน 16:30 น.)</span>
              </span>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1 whitespace-nowrap">
              วันที่รับคืนจริง
            </label>
            <div className="relative">
              <Calendar className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="date"
                required
                value={returnDate}
                onChange={(e) => setReturnDate(e.target.value)}
                className="w-full pl-9 pr-3 py-2 bg-white border border-slate-300 rounded-xl text-xs font-semibold focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              />
            </div>
          </div>
        </div>

        <div className="px-4 sm:px-6 py-3.5 sm:py-4 bg-slate-50 border-t border-slate-100 flex items-center justify-end gap-2.5 sm:gap-3 sticky bottom-0">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-xl text-xs font-semibold transition-colors"
          >
            ยกเลิก
          </button>
          <button
            type="button"
            onClick={handleConfirmReturn}
            className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-md shadow-emerald-200 transition-all flex items-center gap-1.5 whitespace-nowrap"
          >
            <CircleCheck className="w-4 h-4" />
            <span>ยืนยันการรับคืน</span>
          </button>
        </div>
      </div>
    </div>
  );
};
