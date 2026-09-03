'use client';

import React from 'react';
import Link from 'next/link';
import { BookOpen, RefreshCw, Heart, School, ShieldCheck } from 'lucide-react';
import { useLibrary } from '@/context/LibraryContext';

export const Footer: React.FC = () => {
  const { resetToDefaultData } = useLibrary();

  const handleReset = () => {
    if (confirm('คุณต้องการรีเซ็ตข้อมูลทั้งหมดกลับเป็นค่าเริ่มต้นของระบบ (Mock Data) หรือไม่? ข้อมูลที่เพิ่มใหม่จะถูกล้าง')) {
      resetToDefaultData();
      alert('รีเซ็ตข้อมูลระบบกลับสู่ค่าเริ่มต้นเรียบร้อยแล้ว');
      window.location.reload();
    }
  };

  return (
    <footer className="bg-slate-900 text-slate-400 mt-20 border-t border-slate-800 text-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Col 1: System info */}
          <div className="md:col-span-2 space-y-3">
            <div className="flex items-center gap-2.5 text-white font-bold text-lg">
              <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white">
                <BookOpen className="w-4 h-4" />
              </div>
              <span>ระบบบริหารจัดการห้องสมุดโรงเรียน</span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed max-w-md">
              School Library Management System - ระบบยืม-คืนหนังสืออัจฉริยะ 
              รองรับข้อมูลนักเรียนและครูแยกประเภทอย่างชัดเจน พร้อมระบบเสนอสั่งซื้อหนังสือใหม่ (Book Procurement Wishlist) 
              สำหรับครูผู้สอนเพื่อยกระดับแหล่งเรียนรู้ของโรงเรียน
            </p>
            <div className="flex items-center gap-2 text-xs text-slate-500 pt-2">
              <School className="w-4 h-4 text-slate-400" />
              <span>กลุ่มงานวิชาการและเทคโนโลยีสารสนเทศเพื่อการศึกษา</span>
            </div>
          </div>

          {/* Col 2: Quick Links */}
          <div className="space-y-3">
            <h4 className="text-white font-semibold text-xs tracking-wider uppercase">เมนูด่วน</h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link href="/books" className="hover:text-indigo-400 transition-colors">
                  แคตตาล็อกหนังสือทั้งหมด
                </Link>
              </li>
              <li>
                <Link href="/borrow-return" className="hover:text-indigo-400 transition-colors">
                  รายการยืมและคืนหนังสือ
                </Link>
              </li>
              <li>
                <Link href="/wishlist" className="hover:text-indigo-400 transition-colors">
                  แบบฟอร์มครูเสนอซื้อหนังสือ
                </Link>
              </li>
              <li>
                <Link href="/wishlist/dashboard" className="hover:text-indigo-400 transition-colors">
                  ฝ่ายห้องสมุดวิเคราะห์จัดซื้อ
                </Link>
              </li>
              <li>
                <Link href="/dashboard" className="hover:text-indigo-400 transition-colors">
                  สถิติและรายงานห้องสมุด
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 3: System Utilities & Reset */}
          <div className="space-y-3">
            <h4 className="text-white font-semibold text-xs tracking-wider uppercase">การจัดการระบบ</h4>
            <p className="text-xs text-slate-400">
              ข้อมูลถูกจัดเก็บบนเบราว์เซอร์อัตโนมัติ (LocalStorage Persistence) สามารถทดสอบฟังก์ชันได้เต็มรูปแบบ
            </p>
            <button
              onClick={handleReset}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium transition-colors border border-slate-700"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>รีเซ็ต Mock Data ตัวอย่าง</span>
            </button>
            <div className="flex items-center gap-1.5 text-[11px] text-emerald-400 pt-1">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Next.js 14 + Tailwind CSS + TypeScript</span>
            </div>
          </div>
        </div>

        <div className="border-t border-slate-800 mt-8 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <p>© 2026 School Library Management System. All rights reserved.</p>
          <p className="flex items-center gap-1">
            พัฒนาด้วย <Heart className="w-3 h-3 text-rose-500 fill-rose-500" /> เพื่อการศึกษาและโรงเรียนไทย
          </p>
        </div>
      </div>
    </footer>
  );
};
