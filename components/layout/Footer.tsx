'use client';

import React from 'react';
import Link from 'next/link';
import { BookOpen, School, ShieldCheck } from 'lucide-react';
import { useLibrary } from '@/context/LibraryContext';

export const Footer: React.FC = () => {
  const { clearAllData, settings } = useLibrary();

  const handleReset = () => {
    if (confirm('คุณต้องการล้างข้อมูลระบบทั้งหมดให้เป็น "เว็บโล่งๆ" หรือไม่?')) {
      clearAllData();
      alert('ล้างข้อมูลระบบทั้งหมดเรียบร้อยแล้ว');
      window.location.reload();
    }
  };

  return (
    <footer className="bg-slate-900 text-slate-400 mt-16 sm:mt-20 border-t border-slate-800 text-xs sm:text-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Col 1: System info */}
          <div className="md:col-span-2 space-y-3">
            <div className="flex items-center gap-2.5 text-white font-bold text-base sm:text-lg">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-blue-600 to-sky-500 flex items-center justify-center text-white shrink-0">
                <BookOpen className="w-4 h-4" />
              </div>
              <span className="truncate">{settings.schoolName || 'ห้องสมุดหมวดภาษาไทย โรงเรียนบรรหารแจ่มใสวิทยา ๓'}</span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed max-w-md">
              ระบบบริหารจัดการยืม-คืนหนังสือหมวดภาษาไทยและคลังหนังสือสถานศึกษา 
              บันทึกการยืมรวดเร็วด้วยรหัสหนังสือ/บาร์โค้ด รองรับข้อมูลนักเรียนและครู 
              พร้อมระบบกำหนดระยะเวลายืม-คืนของโรงเรียนบรรหารแจ่มใสวิทยา ๓
            </p>
            <div className="flex items-center gap-2 text-xs text-slate-400 pt-1">
              <School className="w-4 h-4 text-sky-400 shrink-0" />
              <span className="truncate">กลุ่มสาระการเรียนรู้ภาษาไทย โรงเรียนบรรหารแจ่มใสวิทยา ๓</span>
            </div>
          </div>

          {/* Col 2: Quick Links */}
          <div className="space-y-3">
            <h4 className="text-white font-semibold text-xs tracking-wider uppercase">เมนูด่วน</h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link href="/quick-borrow" className="hover:text-sky-400 transition-colors">
                  ยืมหนังสือ
                </Link>
              </li>
              <li>
                <Link href="/borrow-return" className="hover:text-sky-400 transition-colors">
                  เคาน์เตอร์บันทึกการยืม-คืน
                </Link>
              </li>
              <li>
                <Link href="/books" className="hover:text-sky-400 transition-colors">
                  แคตตาล็อกหนังสือหมวดภาษาไทย
                </Link>
              </li>
              <li>
                <Link href="/dashboard" className="hover:text-sky-400 transition-colors">
                  สถิติภาพรวมห้องสมุด
                </Link>
              </li>
              <li>
                <Link href="/admin" className="hover:text-sky-400 transition-colors">
                  ระบบแอดมิน / ตั้งค่าระบบ
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 3: System Utilities */}
          <div className="space-y-3">
            <h4 className="text-white font-semibold text-xs tracking-wider uppercase">การจัดการระบบ</h4>
            <p className="text-xs text-slate-400">
              กำหนดระยะเวลายืมปัจจุบัน: นักเรียน {settings.studentBorrowDays} วัน / ครู {settings.teacherBorrowDays} วัน
            </p>
            <div className="flex flex-col gap-2 pt-1">
              <Link
                href="/admin"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium transition-colors border border-slate-700 w-fit"
              >
                <ShieldCheck className="w-3.5 h-3.5 text-sky-400" />
                <span>เข้าสู่ระบบแอดมิน (thaibj3)</span>
              </Link>
            </div>
          </div>
        </div>

        <div className="border-t border-slate-800 mt-8 pt-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500">
          <p className="text-center sm:text-left">© 2026 ห้องสมุดหมวดภาษาไทย โรงเรียนบรรหารแจ่มใสวิทยา ๓. All rights reserved.</p>
          <p className="flex items-center gap-1 text-center sm:text-right">
            ระบบบริการยืม-คืนหนังสือเพื่อการศึกษาภาษาไทย
          </p>
        </div>
      </div>
    </footer>
  );
};
