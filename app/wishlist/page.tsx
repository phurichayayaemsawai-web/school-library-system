'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useLibrary } from '@/context/LibraryContext';
import { WishlistForm } from '@/components/wishlist/WishlistForm';
import { WishlistTable } from '@/components/wishlist/WishlistTable';
import { Toast, ToastMessage } from '@/components/ui/Toast';
import { Sparkles, LayoutDashboard, BookOpen, School, ArrowRight } from 'lucide-react';

export default function WishlistPage() {
  const { wishlists } = useLibrary();
  const [toast, setToast] = useState<ToastMessage | null>(null);

  const pendingCount = wishlists.filter((w) => w.status === 'PENDING').length;
  const approvedCount = wishlists.filter((w) => w.status === 'APPROVED' || w.status === 'ORDERED').length;

  const showToast = (title: string, type: 'success' | 'error' | 'info' = 'success') => {
    setToast({
      id: Date.now().toString(),
      type,
      title,
    });
  };

  return (
    <div className="space-y-6 sm:space-y-8">
      <Toast toast={toast} onClose={() => setToast(null)} />

      {/* Header Banner */}
      <div className="bg-gradient-to-r from-blue-700 via-blue-600 to-sky-500 rounded-2xl sm:rounded-3xl p-6 sm:p-8 text-white shadow-xl shadow-blue-500/20 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 border border-blue-400/30">
        <div className="space-y-2 max-w-2xl">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/15 text-sky-100 border border-white/25 text-xs font-semibold whitespace-nowrap">
            <Sparkles className="w-3.5 h-3.5 text-amber-300 shrink-0" />
            <span>Book Procurement Wishlist System</span>
          </div>
          <h1 className="text-xl sm:text-3xl font-black tracking-tight">
            ระบบเสนอสั่งซื้อหนังสือใหม่สำหรับครู
          </h1>
          <p className="text-xs sm:text-sm text-sky-100/90 leading-relaxed font-normal">
            ครูทุกกลุ่มสาระการเรียนรู้สามารถเสนอแนะหนังสือ ตำราเรียน 
            และสื่อการสอนที่จำเป็น เพื่อให้ฝ่ายห้องสมุดจัดสรรงบประมาณจัดซื้อเข้าคลังต่อไป
          </p>
        </div>

        <Link
          href="/wishlist/dashboard"
          className="px-5 py-3 rounded-xl sm:rounded-2xl bg-white text-blue-800 font-bold text-xs sm:text-sm shadow-lg hover:bg-sky-50 transition-all flex items-center gap-2 shrink-0 whitespace-nowrap hover:scale-105 active:scale-95"
        >
          <LayoutDashboard className="w-4 h-4 text-blue-600" />
          <span>แดชบอร์ดวิเคราะห์จัดซื้อ (ห้องสมุด)</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      {/* Main Grid: Form + Instructions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Form */}
        <div className="lg:col-span-2">
          <WishlistForm onSuccess={(msg) => showToast(msg, 'success')} />
        </div>

        {/* Right 1 Col: Guidelines & Summary */}
        <div className="space-y-6">
          <div className="bg-white rounded-2xl sm:rounded-3xl p-5 sm:p-6 border border-sky-100 shadow-sm space-y-4">
            <h3 className="text-xs sm:text-sm font-bold text-slate-800 flex items-center gap-2">
              <School className="w-4 h-4 text-blue-600 shrink-0" />
              <span>เกณฑ์การพิจารณาจัดซื้อหนังสือ</span>
            </h3>

            <ul className="space-y-3 text-xs text-slate-600 leading-relaxed">
              <li className="flex items-start gap-2">
                <span className="w-5 h-5 rounded-full bg-blue-50 text-blue-700 font-bold flex items-center justify-center shrink-0 text-[10px] mt-0.5">
                  1
                </span>
                <span>เป็นหนังสือหรือสื่อที่สอดคล้องกับหลักสูตรสถานศึกษา และแผนการจัดการเรียนรู้</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="w-5 h-5 rounded-full bg-blue-50 text-blue-700 font-bold flex items-center justify-center shrink-0 text-[10px] mt-0.5">
                  2
                </span>
                <span>ไม่มีอยู่ในคลังหนังสือห้องสมุด หรือมีจำนวนไม่เพียงพอต่อความต้องการของนักเรียน</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="w-5 h-5 rounded-full bg-blue-50 text-blue-700 font-bold flex items-center justify-center shrink-0 text-[10px] mt-0.5">
                  3
                </span>
                <span>มีรายละเอียดสำนักพิมพ์ ราคาประเมิน และเหตุผลความจำเป็นที่ชัดเจน</span>
              </li>
            </ul>

            <div className="pt-3 border-t border-sky-50 flex items-center justify-between text-xs font-semibold">
              <span className="text-slate-500 whitespace-nowrap">รอพิจารณา:</span>
              <span className="text-amber-600">{pendingCount} รายการ</span>
            </div>
            <div className="flex items-center justify-between text-xs font-semibold">
              <span className="text-slate-500 whitespace-nowrap">อนุมัติแล้ว:</span>
              <span className="text-emerald-600">{approvedCount} รายการ</span>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Wishlist Requests Table */}
      <div className="space-y-4 pt-2">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base sm:text-lg font-bold text-slate-900 flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-blue-600 shrink-0" />
              <span>รายการหนังสือที่ครูได้เสนอแนะไว้ ({wishlists.length} รายการ)</span>
            </h3>
            <p className="text-xs text-slate-500 font-normal">
              ติดตามสถานะการพิจารณาและข้อความบันทึกจากฝ่ายห้องสมุด
            </p>
          </div>
        </div>

        <WishlistTable wishlists={wishlists} isAdmin={false} />
      </div>
    </div>
  );
}
