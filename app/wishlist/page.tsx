'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useLibrary } from '@/context/LibraryContext';
import { WishlistForm } from '@/components/wishlist/WishlistForm';
import { WishlistTable } from '@/components/wishlist/WishlistTable';
import { Toast, ToastMessage } from '@/components/ui/Toast';
import { Sparkles, LayoutDashboard, CheckCircle2, BookOpen, School, ArrowRight } from 'lucide-react';

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
    <div className="space-y-8">
      <Toast toast={toast} onClose={() => setToast(null)} />

      {/* Header Banner */}
      <div className="bg-gradient-to-r from-purple-900 via-indigo-900 to-slate-900 rounded-3xl p-8 text-white shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6 border border-purple-800/40">
        <div className="space-y-2 max-w-2xl">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-500/20 text-purple-200 border border-purple-400/30 text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            <span>Book Procurement Wishlist System</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
            ระบบเสนอสั่งซื้อหนังสือใหม่สำหรับครู
          </h1>
          <p className="text-xs sm:text-sm text-purple-100/80 leading-relaxed font-light">
            ครูทุกกลุ่มสาระการเรียนรู้สามารถเสนอแนะหนังสือ ตำราเรียน 
            และสื่อการสอนที่จำเป็น เพื่อให้ฝ่ายห้องสมุดจัดสรรงบประมาณจัดซื้อเข้าคลังต่อไป
          </p>
        </div>

        <Link
          href="/wishlist/dashboard"
          className="px-5 py-3 rounded-2xl bg-white text-purple-950 font-bold text-xs shadow-lg hover:bg-purple-50 transition-all flex items-center gap-2 flex-shrink-0"
        >
          <LayoutDashboard className="w-4 h-4 text-indigo-600" />
          <span>แดชบอร์ดวิเคราะห์จัดซื้อ (ห้องสมุด)</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      {/* Main Grid: Form + Instructions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left 2 Cols: Form */}
        <div className="lg:col-span-2">
          <WishlistForm onSuccess={(msg) => showToast(msg, 'success')} />
        </div>

        {/* Right 1 Col: Guidelines & Summary */}
        <div className="space-y-6">
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4">
            <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
              <School className="w-4 h-4 text-indigo-600" />
              เกณฑ์การพิจารณาจัดซื้อหนังสือ
            </h3>

            <ul className="space-y-3 text-xs text-slate-600 leading-relaxed">
              <li className="flex items-start gap-2">
                <span className="w-5 h-5 rounded-full bg-indigo-50 text-indigo-700 font-bold flex items-center justify-center flex-shrink-0 text-[10px] mt-0.5">
                  1
                </span>
                <span>เป็นหนังสือหรือสื่อที่สอดคล้องกับหลักสูตรสถานศึกษา และแผนการจัดการเรียนรู้</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="w-5 h-5 rounded-full bg-indigo-50 text-indigo-700 font-bold flex items-center justify-center flex-shrink-0 text-[10px] mt-0.5">
                  2
                </span>
                <span>ไม่มีอยู่ในคลังหนังสือห้องสมุด หรือมีจำนวนไม่เพียงพอต่อความต้องการของนักเรียน</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="w-5 h-5 rounded-full bg-indigo-50 text-indigo-700 font-bold flex items-center justify-center flex-shrink-0 text-[10px] mt-0.5">
                  3
                </span>
                <span>มีรายละเอียดสำนักพิมพ์ ราคาประเมิน และเหตุผลความจำเป็นที่ชัดเจน</span>
              </li>
            </ul>

            <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-semibold">
              <span className="text-slate-500">รอพิจารณา:</span>
              <span className="text-amber-600">{pendingCount} รายการ</span>
            </div>
            <div className="flex items-center justify-between text-xs font-semibold">
              <span className="text-slate-500">อนุมัติแล้ว:</span>
              <span className="text-emerald-600">{approvedCount} รายการ</span>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Wishlist Requests Table */}
      <div className="space-y-4 pt-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-indigo-600" />
              รายการหนังสือที่ครูได้เสนอแนะไว้ ({wishlists.length} รายการ)
            </h3>
            <p className="text-xs text-slate-500">
              ติดตามสถานะการพิจารณาและข้อความบันทึกจากฝ่ายห้องสมุด
            </p>
          </div>
        </div>

        <WishlistTable wishlists={wishlists} isAdmin={false} />
      </div>
    </div>
  );
}
