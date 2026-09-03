'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useLibrary } from '@/context/LibraryContext';
import { WishlistTable } from '@/components/wishlist/WishlistTable';
import { WishlistStats } from '@/components/wishlist/WishlistStats';
import { Toast, ToastMessage } from '@/components/ui/Toast';
import { 
  ClipboardList, 
  ArrowLeft, 
  Download, 
  Plus, 
  Sparkles, 
  CheckCircle2, 
  Printer 
} from 'lucide-react';
import { formatCurrency } from '@/lib/utils';

export default function WishlistDashboardPage() {
  const { wishlists } = useLibrary();
  const [toast, setToast] = useState<ToastMessage | null>(null);

  const showToast = (title: string, type: 'success' | 'error' | 'info' = 'success') => {
    setToast({
      id: Date.now().toString(),
      type,
      title,
    });
  };

  const handleExportReport = () => {
    const headers = 'รหัส,ชื่อหนังสือ,ผู้แต่ง/สำนักพิมพ์,กลุ่มสาระฯ,ครูผู้เสนอ,ราคาต่อเล่ม,จำนวน,ราคารวม,ความเร่งด่วน,สถานะ,เหตุผลความจำเป็น\n';
    const rows = wishlists.map((w) => {
      const total = w.estimatedPrice * w.quantity;
      return `"${w.id}","${w.title}","${w.authorPublisher}","${w.department}","${w.teacherName}",${w.estimatedPrice},${w.quantity},${total},"${w.priority}","${w.status}","${w.reason.replace(/"/g, '""')}"`;
    }).join('\n');

    const blob = new Blob(['\uFEFF' + headers + rows], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `book_procurement_wishlist_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    showToast('ดาวน์โหลดรายงานสรุปการจัดซื้อหนังสือ (CSV) สำเร็จ', 'success');
  };

  return (
    <div className="space-y-8">
      <Toast toast={toast} onClose={() => setToast(null)} />

      {/* Header */}
      <div>
        <Link
          href="/wishlist"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-indigo-600 transition-colors mb-3"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>กลับไปยังแบบฟอร์มเสนอสั่งซื้อ</span>
        </Link>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2.5">
              <ClipboardList className="w-6 h-6 text-indigo-600" />
              แดชบอร์ดวิเคราะห์การจัดซื้อหนังสือ (สำหรับฝ่ายห้องสมุด)
            </h1>
            <p className="text-xs text-slate-500 mt-1">
              ฐานข้อมูลวิเคราะห์รายการหนังสือที่ควรสั่งซื้อเพิ่ม พร้อมระบบอนุมัติงบประมาณรายกลุ่มสาระการเรียนรู้
            </p>
          </div>

          <div className="flex items-center gap-2.5 flex-wrap">
            <button
              onClick={() => window.print()}
              className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold transition-colors flex items-center gap-1.5 border border-slate-200"
            >
              <Printer className="w-4 h-4 text-slate-500" />
              <span>พิมพ์รายงาน</span>
            </button>

            <button
              onClick={handleExportReport}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-md shadow-emerald-200 transition-all flex items-center gap-1.5"
            >
              <Download className="w-4 h-4" />
              <span>ส่งออก CSV รายงานจัดซื้อ</span>
            </button>

            <Link
              href="/wishlist"
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-md shadow-indigo-200 transition-all flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" />
              <span>เพิ่มคำขอใหม่</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Analytics & Budget Breakdown */}
      <WishlistStats wishlists={wishlists} />

      {/* Detailed Wishlist Management Table (Admin mode enabled) */}
      <div className="space-y-3">
        <WishlistTable wishlists={wishlists} isAdmin={true} />
      </div>
    </div>
  );
}
