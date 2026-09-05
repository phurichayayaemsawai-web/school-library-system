"use client";
import React, { useState } from "react";
import Link from "next/link";
import { useLibrary } from "@/context/LibraryContext";
import { Toast, ToastData } from "@/components/Toast";
import { ReturnModal } from "@/components/ReturnModal";
import { StatusBadge } from "@/components/StatusBadge";
import { formatDate, getTodayString, isOverdue, getDaysRemaining } from "@/lib/utils";
import { ShieldAlert, ArrowLeft, History, Download, BookOpen, Search, User, GraduationCap, Clock, Phone, Calendar, CircleCheck, RotateCcw } from "lucide-react";
import { Transaction } from "@/types";

export default function HistoryPage() {
  const { books, transactions, isAdmin } = useLibrary();
  const [selectedReturnTrx, setSelectedReturnTrx] = useState<Transaction | null>(null);
  const [toast, setToast] = useState<ToastData | null>(null);

  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [typeFilter, setTypeFilter] = useState("ALL");

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
          กรุณาเข้าสู่ระบบแอดมินเพื่อดูประวัติการทำธุรกรรมยืม-คืนทั้งหมด
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
  const returnedCount = validTrx.filter((t) => t.status === "RETURNED").length;
  const activeCount = validTrx.filter((t) => t.status === "ACTIVE" || t.status === "OVERDUE").length;

  const filteredTransactions = validTrx.filter((trx) => {
    const q = searchQuery.toLowerCase().trim();
    const matchesSearch =
      !q ||
      trx.bookTitle.toLowerCase().includes(q) ||
      trx.id.toLowerCase().includes(q) ||
      trx.borrower.name.toLowerCase().includes(q) ||
      (trx.borrower.type === "STUDENT" &&
        (trx.borrower.studentId.includes(q) || trx.borrower.grade.toLowerCase().includes(q))) ||
      (trx.borrower.type === "TEACHER" && trx.borrower.department.toLowerCase().includes(q));

    const computedStatus =
      trx.status === "ACTIVE" && isOverdue(trx.dueDate, trx.returnDate) ? "OVERDUE" : trx.status;

    const matchesStatus =
      statusFilter === "ALL" ||
      (statusFilter === "ACTIVE" && computedStatus === "ACTIVE") ||
      (statusFilter === "OVERDUE" && computedStatus === "OVERDUE") ||
      (statusFilter === "RETURNED" && computedStatus === "RETURNED");

    const matchesType = typeFilter === "ALL" || trx.borrower.type === typeFilter;

    return matchesSearch && matchesStatus && matchesType;
  });

  const showToast = (title: string, type: ToastData["type"] = "success") => {
    setToast({
      id: Date.now().toString(),
      type,
      title,
    });
  };

  const exportCSV = () => {
    const headers = "\uFEFFรหัสรายการ,ชื่อหนังสือ,ประเภทผู้ยืม,ชื่อผู้ยืม,สังกัด/ชั้น,วันที่ยืม,กำหนดคืน,วันที่คืนจริง,สถานะ\n";
    const rows = validTrx
      .map((t) => {
        const affiliation =
          t.borrower.type === "STUDENT"
            ? `${t.borrower.grade} (${t.borrower.studentId})`
            : t.borrower.department;
        const bType = t.borrower.type === "STUDENT" ? "นักเรียน" : "ครู";
        return `"${t.id}","${t.bookTitle}","${bType}","${t.borrower.name}","${affiliation}","${t.borrowDate}","${t.dueDate}","${t.returnDate || "-"}","${t.status}"`;
      })
      .join("\n");

    const blob = new Blob([headers + rows], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.setAttribute("download", `library_transactions_${getTodayString()}.csv`);
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    showToast("ดาวน์โหลดไฟล์ประวัติการยืม-คืน (CSV) เรียบร้อยแล้ว", "success");
  };

  return (
    <div className="space-y-6">
      <Toast toast={toast} onClose={() => setToast(null)} />

      <div>
        <Link
          href="/borrow-return"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-blue-600 transition-colors mb-3"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>กลับไปยังหน้าระบบยืม-คืน</span>
        </Link>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 flex items-center gap-2.5">
              <History className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600 shrink-0" />
              <span>ประวัติการยืม - คืนหนังสือทั้งหมด</span>
            </h1>
            <p className="text-xs text-slate-500 mt-1 font-normal">
              รวมประวัติการทำธุรกรรมยืมคืนหนังสือของนักเรียนและครูทุกรายการ
            </p>
          </div>

          <button
            onClick={exportCSV}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white rounded-xl text-xs font-bold shadow-md shadow-emerald-500/20 transition-all self-start sm:self-auto whitespace-nowrap hover:scale-105 active:scale-95"
          >
            <Download className="w-4 h-4" />
            <span>ส่งออกข้อมูล (Export CSV)</span>
          </button>
        </div>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-3 gap-3 sm:gap-4">
        <div className="bg-white rounded-xl sm:rounded-2xl p-4 border border-sky-100 shadow-2xs">
          <p className="text-xs text-slate-500 truncate whitespace-nowrap">บันทึกธุรกรรมทั้งหมด</p>
          <p className="text-xl sm:text-2xl font-black text-slate-800 mt-1 truncate">
            {validTrx.length} รายการ
          </p>
        </div>
        <div className="bg-white rounded-xl sm:rounded-2xl p-4 border border-sky-100 shadow-2xs">
          <p className="text-xs text-slate-500 truncate whitespace-nowrap">คืนสมบูรณ์แล้ว</p>
          <p className="text-xl sm:text-2xl font-black text-emerald-600 mt-1 truncate">
            {returnedCount} รายการ
          </p>
        </div>
        <div className="bg-white rounded-xl sm:rounded-2xl p-4 border border-sky-100 shadow-2xs">
          <p className="text-xs text-slate-500 truncate whitespace-nowrap">ยังอยู่ระหว่างการยืม</p>
          <p className="text-xl sm:text-2xl font-black text-amber-600 mt-1 truncate">
            {activeCount} รายการ
          </p>
        </div>
      </div>

      {/* Transaction Table with Filters */}
      <div className="bg-white rounded-2xl sm:rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="p-4 sm:p-5 border-b border-slate-100 space-y-3.5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h3 className="text-sm sm:text-base font-bold text-slate-800 flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-blue-600 shrink-0" />
                <span>ประวัติการทำรายการยืม-คืนย้อนหลัง</span>
              </h3>
              <p className="text-[11px] sm:text-xs text-slate-500 mt-0.5">
                แสดง {filteredTransactions.length} จากทั้งหมด {validTrx.length} รายการ
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5 sm:gap-3">
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 shrink-0" />
              <input
                type="text"
                placeholder="ค้นหาชื่อผู้ยืม, รหัสประจำตัว, ชื่อหนังสือ..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-blue-500 focus:bg-white focus:outline-none"
              />
            </div>

            <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl">
              <button
                onClick={() => setStatusFilter("ALL")}
                className={`flex-1 py-1.5 px-1.5 text-[11px] font-semibold rounded-lg transition-all whitespace-nowrap text-center ${
                  statusFilter === "ALL" ? "bg-white text-slate-800 shadow-2xs" : "text-slate-600"
                }`}
              >
                ทั้งหมด
              </button>
              <button
                onClick={() => setStatusFilter("ACTIVE")}
                className={`flex-1 py-1.5 px-1.5 text-[11px] font-semibold rounded-lg transition-all whitespace-nowrap text-center ${
                  statusFilter === "ACTIVE" ? "bg-amber-500 text-white shadow-2xs" : "text-slate-600"
                }`}
              >
                กำลังยืม
              </button>
              <button
                onClick={() => setStatusFilter("OVERDUE")}
                className={`flex-1 py-1.5 px-1.5 text-[11px] font-semibold rounded-lg transition-all whitespace-nowrap text-center ${
                  statusFilter === "OVERDUE" ? "bg-red-600 text-white shadow-2xs" : "text-slate-600"
                }`}
              >
                เกินกำหนด
              </button>
              <button
                onClick={() => setStatusFilter("RETURNED")}
                className={`flex-1 py-1.5 px-1.5 text-[11px] font-semibold rounded-lg transition-all whitespace-nowrap text-center ${
                  statusFilter === "RETURNED" ? "bg-emerald-600 text-white shadow-2xs" : "text-slate-600"
                }`}
              >
                คืนแล้ว
              </button>
            </div>

            <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl">
              <button
                onClick={() => setTypeFilter("ALL")}
                className={`flex-1 py-1.5 px-1.5 text-[11px] font-semibold rounded-lg transition-all whitespace-nowrap text-center ${
                  typeFilter === "ALL" ? "bg-white text-slate-800 shadow-2xs" : "text-slate-600"
                }`}
              >
                ทุกประเภท
              </button>
              <button
                onClick={() => setTypeFilter("STUDENT")}
                className={`flex items-center justify-center gap-1 flex-1 py-1.5 px-1.5 text-[11px] font-semibold rounded-lg transition-all whitespace-nowrap ${
                  typeFilter === "STUDENT" ? "bg-blue-600 text-white shadow-2xs" : "text-slate-600"
                }`}
              >
                <GraduationCap className="w-3.5 h-3.5 shrink-0" />
                <span>นักเรียน</span>
              </button>
              <button
                onClick={() => setTypeFilter("TEACHER")}
                className={`flex items-center justify-center gap-1 flex-1 py-1.5 px-1.5 text-[11px] font-semibold rounded-lg transition-all whitespace-nowrap ${
                  typeFilter === "TEACHER" ? "bg-blue-600 text-white shadow-2xs" : "text-slate-600"
                }`}
              >
                <User className="w-3.5 h-3.5 shrink-0" />
                <span>ครู</span>
              </button>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-600">
            <thead className="bg-slate-50/80 text-slate-700 font-semibold border-b border-slate-200 text-[11px]">
              <tr>
                <th className="py-3 px-3.5 whitespace-nowrap">หนังสือ</th>
                <th className="py-3 px-3.5 whitespace-nowrap">ผู้ยืม / สังกัด</th>
                <th className="py-3 px-3.5 whitespace-nowrap">วันที่ยืม</th>
                <th className="py-3 px-3.5 whitespace-nowrap">กำหนดส่ง / คืนจริง</th>
                <th className="py-3 px-3.5 whitespace-nowrap">สถานะ</th>
                <th className="py-3 px-3.5 text-right whitespace-nowrap">การกระทำ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredTransactions.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-10 text-slate-400">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <Clock className="w-8 h-8 text-slate-300" />
                      <span>ไม่พบรายการข้อมูลการยืม-คืนตามเงื่อนไขที่เลือก</span>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredTransactions.map((trx) => {
                  const overdue = isOverdue(trx.dueDate, trx.returnDate);
                  const effectiveStatus = trx.returnDate ? "RETURNED" : overdue ? "OVERDUE" : "ACTIVE";
                  const daysLeft = getDaysRemaining(trx.dueDate);

                  return (
                    <tr key={trx.id} className="hover:bg-sky-50/40 transition-colors">
                      <td className="py-3 px-3.5">
                        <div className="flex items-center gap-2.5">
                          <img
                            src={trx.bookCoverUrl}
                            alt={trx.bookTitle}
                            className="w-9 h-12 sm:w-10 sm:h-14 object-cover rounded-lg shadow-2xs bg-slate-200 shrink-0"
                            onError={(e) => {
                              (e.target as HTMLImageElement).src =
                                "https://placehold.co/100x150/e2e8f0/0369a1?text=Book";
                            }}
                          />
                          <div className="min-w-0 max-w-[160px] sm:max-w-xs">
                            <span className="text-[10px] font-mono text-blue-700 font-bold bg-blue-50 px-1.5 py-0.5 rounded border border-blue-100 whitespace-nowrap">
                              {trx.bookId}
                            </span>
                            <p className="font-bold text-slate-800 text-xs truncate mt-0.5" title={trx.bookTitle}>
                              {trx.bookTitle}
                            </p>
                            <span className="text-[10px] sm:text-[11px] text-slate-400 truncate block">
                              {trx.bookCategory}
                            </span>
                          </div>
                        </div>
                      </td>

                      <td className="py-3 px-3.5">
                        <div className="space-y-0.5 min-w-0 max-w-[160px] sm:max-w-xs">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            {trx.borrower.type === "STUDENT" ? (
                              <span className="inline-flex items-center gap-1 text-[10px] font-bold bg-sky-50 text-sky-700 px-1.5 py-0.5 rounded border border-sky-200 whitespace-nowrap">
                                <GraduationCap className="w-3 h-3 shrink-0" /> นักเรียน
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 text-[10px] font-bold bg-blue-50 text-blue-700 px-1.5 py-0.5 rounded border border-blue-200 whitespace-nowrap">
                                <User className="w-3 h-3 shrink-0" /> ครู
                              </span>
                            )}
                            <span className="font-bold text-slate-800 text-xs truncate">
                              {trx.borrower.name}
                            </span>
                          </div>

                          {trx.borrower.type === "STUDENT" ? (
                            <p className="text-[10px] sm:text-[11px] text-slate-500 truncate">
                              รหัส: <strong className="text-slate-700">{trx.borrower.studentId}</strong> •{" "}
                              {trx.borrower.grade} (ห้อง {trx.borrower.room})
                            </p>
                          ) : (
                            <p className="text-[10px] sm:text-[11px] text-slate-500 truncate">
                              {trx.borrower.department}
                            </p>
                          )}

                          {trx.borrower.phone && trx.borrower.phone !== "-" && (
                            <p className="text-[10px] text-slate-400 flex items-center gap-1 whitespace-nowrap">
                              <Phone className="w-2.5 h-2.5 shrink-0" /> {trx.borrower.phone}
                            </p>
                          )}
                        </div>
                      </td>

                      <td className="py-3 px-3.5 text-slate-600 whitespace-nowrap text-xs">
                        <div className="space-y-0.5">
                          <div className="flex items-center gap-1.5">
                            <Calendar className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                            <span className="text-slate-700 font-medium">
                              {formatDate(trx.borrowDate)}
                            </span>
                          </div>
                          {trx.borrowTime && (
                            <div className="flex items-center gap-1 text-[10px] text-slate-500 font-mono">
                              <Clock className="w-2.5 h-2.5 text-slate-400 shrink-0" />
                              <span>เวลา {trx.borrowTime} น.</span>
                            </div>
                          )}
                        </div>
                      </td>

                      <td className="py-3 px-3.5 whitespace-nowrap text-xs">
                        <div className="space-y-0.5">
                          <div className="flex items-center gap-1.5">
                            <Calendar className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                            <span className={overdue && !trx.returnDate ? "font-bold text-red-600" : "text-slate-700"}>
                              {formatDate(trx.dueDate)}
                            </span>
                          </div>

                          {trx.returnDate ? (
                            <p className="text-[10px] sm:text-[11px] text-emerald-600 font-semibold flex items-center gap-1 whitespace-nowrap">
                              <CircleCheck className="w-3 h-3 shrink-0" /> คืนเมื่อ:{" "}
                              {formatDate(trx.returnDate)}{" "}
                              {trx.returnTime ? `(${trx.returnTime} น.)` : ""}
                            </p>
                          ) : (
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <span className="text-[10px] font-bold text-amber-800 bg-amber-50 px-1.5 py-0.2 rounded border border-amber-200 flex items-center gap-1">
                                <Clock className="w-2.5 h-2.5 text-amber-600 shrink-0" />
                                <span>ก่อน 16:30 น.</span>
                              </span>
                              <span
                                className={`text-[10px] font-medium whitespace-nowrap ${
                                  daysLeft < 0
                                    ? "text-red-500 font-bold"
                                    : daysLeft <= 2
                                    ? "text-amber-600"
                                    : "text-slate-400"
                                }`}
                              >
                                {daysLeft < 0 ? `เลยกำหนด ${Math.abs(daysLeft)} วัน` : `เหลืออีก ${daysLeft} วัน`}
                              </span>
                            </div>
                          )}
                        </div>
                      </td>

                      <td className="py-3 px-3.5 whitespace-nowrap">
                        <StatusBadge status={effectiveStatus} type="transaction" />
                      </td>

                      <td className="py-3 px-3.5 text-right whitespace-nowrap">
                        {trx.returnDate ? (
                          <span className="text-[11px] text-slate-400 italic whitespace-nowrap">
                            เสร็จสิ้น
                          </span>
                        ) : (
                          <button
                            onClick={() => setSelectedReturnTrx(trx)}
                            className="inline-flex items-center gap-1 px-2.5 sm:px-3 py-1.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-700 text-xs font-bold border border-emerald-200 transition-colors shadow-2xs whitespace-nowrap"
                          >
                            <RotateCcw className="w-3.5 h-3.5 shrink-0" />
                            <span>รับคืน</span>
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      <ReturnModal
        transaction={selectedReturnTrx}
        onClose={() => setSelectedReturnTrx(null)}
        onSuccess={(msg) => showToast(msg, "success")}
      />
    </div>
  );
}
