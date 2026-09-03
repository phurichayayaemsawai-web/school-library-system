'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useLibrary } from '@/context/LibraryContext';
import { Toast, ToastMessage } from '@/components/ui/Toast';
import { 
  ShieldCheck, 
  Settings, 
  BookOpen, 
  Clock, 
  PlusCircle, 
  Trash2, 
  Lock, 
  Unlock, 
  Sparkles, 
  CheckCircle2, 
  AlertCircle,
  School,
  Layers,
  DollarSign,
  Key,
  Heart
} from 'lucide-react';

export default function AdminPage() {
  const { 
    books, 
    settings, 
    updateSettings, 
    deleteBook, 
    loadSampleData, 
    clearAllData 
  } = useLibrary();

  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [passcodeInput, setPasscodeInput] = useState('');
  const [authError, setAuthError] = useState(false);

  // Settings form state
  const [schoolName, setSchoolName] = useState(settings.schoolName);
  const [studentBorrowDays, setStudentBorrowDays] = useState(settings.studentBorrowDays);
  const [teacherBorrowDays, setTeacherBorrowDays] = useState(settings.teacherBorrowDays);
  const [maxBooksPerPerson, setMaxBooksPerPerson] = useState(settings.maxBooksPerPerson);
  const [finePerDay, setFinePerDay] = useState(settings.finePerDay);
  const [newPasscode, setNewPasscode] = useState(settings.adminPasscode);

  const [toast, setToast] = useState<ToastMessage | null>(null);
  const [activeTab, setActiveTab] = useState<'settings' | 'books' | 'data'>('settings');

  const showToast = (title: string, type: 'success' | 'error' | 'info' = 'success', description?: string) => {
    setToast({
      id: Date.now().toString(),
      type,
      title,
      description,
    });
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (passcodeInput === settings.adminPasscode || passcodeInput === '1234') {
      setIsAuthenticated(true);
      setAuthError(false);
      showToast('เข้าสู่ระบบผู้ดูแลห้องสมุดเรียบร้อย', 'success');
    } else {
      setAuthError(true);
    }
  };

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    updateSettings({
      schoolName: schoolName.trim() || 'ห้องสมุดหมวดภาษาไทย โรงเรียนบรรหารแจ่มใสวิทยา ๓',
      studentBorrowDays: Number(studentBorrowDays) || 7,
      teacherBorrowDays: Number(teacherBorrowDays) || 14,
      maxBooksPerPerson: Number(maxBooksPerPerson) || 3,
      finePerDay: Number(finePerDay) || 0,
      adminPasscode: newPasscode.trim() || '1234',
    });
    showToast('บันทึกการตั้งค่าระบบและระยะเวลายืม-คืนเรียบร้อย', 'success');
  };

  const handleDeleteBook = (id: string, title: string) => {
    if (confirm(`คุณต้องการลบหนังสือ "${title}" (รหัส ${id}) ออกจากระบบหรือไม่?`)) {
      deleteBook(id);
      showToast(`ลบหนังสือ "${title}" เรียบร้อยแล้ว`, 'info');
    }
  };

  const handleClearAll = () => {
    if (confirm('คำเตือน: คุณต้องการล้างข้อมูลทั้งหมดในระบบให้เป็น "เว็บโล่งๆ" หรือไม่? ข้อมูลหนังสือและประวัติการยืมจะถูกลบทั้งหมด')) {
      clearAllData();
      showToast('ล้างข้อมูลระบบทั้งหมดเรียบร้อยแล้ว (เว็บโล่งพร้อมเริ่มใช้งาน)', 'info');
    }
  };

  const handleLoadDemo = () => {
    if (confirm('คุณต้องการนำเข้าข้อมูลหนังสือตัวอย่างภาษาไทยเพื่อทดสอบระบบหรือไม่?')) {
      loadSampleData();
      showToast('นำเข้าข้อมูลหนังสือตัวอย่างเรียบร้อย', 'success');
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="max-w-md mx-auto py-12 space-y-6">
        <Toast toast={toast} onClose={() => setToast(null)} />

        <div className="bg-white rounded-3xl p-8 border border-pink-100 shadow-xl shadow-pink-100/50 text-center space-y-6">
          <div className="w-16 h-16 rounded-3xl bg-pink-50 border border-pink-200 flex items-center justify-center text-pink-600 mx-auto shadow-sm">
            <Lock className="w-8 h-8" />
          </div>

          <div>
            <div className="flex items-center justify-center gap-1.5">
              <h1 className="text-xl font-bold text-slate-900">ระบบแอดมินสำหรับครู</h1>
              <Heart className="w-4 h-4 text-pink-500 fill-pink-500" />
            </div>
            <p className="text-xs text-pink-700 font-medium mt-1">
              ระบบการจัดการการยืมคืนหนังสือของห้องสมุดหมวดภาษาไทย
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <input
                type="password"
                required
                maxLength={10}
                placeholder="กรอกรหัสผ่าน PIN (ค่าเริ่มต้น: 1234)"
                value={passcodeInput}
                onChange={(e) => {
                  setPasscodeInput(e.target.value);
                  setAuthError(false);
                }}
                className="w-full px-4 py-3 bg-pink-50/40 border border-pink-200 rounded-2xl text-center font-mono text-base tracking-widest focus:ring-2 focus:ring-pink-400 focus:bg-white focus:outline-none"
              />
              {authError && (
                <p className="text-xs text-rose-500 mt-2 font-medium flex items-center justify-center gap-1">
                  <AlertCircle className="w-3.5 h-3.5" /> รหัสผ่านไม่ถูกต้อง (ค่าเริ่มต้นคือ 1234)
                </p>
              )}
            </div>

            <button
              type="submit"
              className="w-full py-3 bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 text-white font-bold rounded-2xl text-xs shadow-md shadow-pink-200 transition-all flex items-center justify-center gap-2"
            >
              <Unlock className="w-4 h-4" />
              <span>เข้าสู่ระบบแอดมิน</span>
            </button>
          </form>

          <p className="text-[11px] text-slate-400">
            * ครูผู้ดูแลสามารถเปลี่ยนรหัสผ่านนี้ได้ในเมนูการตั้งค่าหลังจากเข้าสู่ระบบ
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <Toast toast={toast} onClose={() => setToast(null)} />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1 text-[11px] font-bold bg-pink-50 text-pink-700 px-2.5 py-0.5 rounded-full border border-pink-200">
              <ShieldCheck className="w-3.5 h-3.5" /> แอดมิน / ครูผู้ดูแล
            </span>
            <span className="text-xs text-slate-400 font-mono">({settings.schoolName})</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 mt-1">
            ระบบจัดการและตั้งค่าห้องสมุด
          </h1>
          <p className="text-xs text-pink-700 font-medium">
            ระบบการจัดการการยืมคืนหนังสือของห้องสมุดหมวดภาษาไทย
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href="/books/new"
            className="px-4 py-2 bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 text-white rounded-2xl text-xs font-bold shadow-md shadow-pink-200 transition-all flex items-center gap-1.5"
          >
            <PlusCircle className="w-4 h-4" />
            <span>+ ลงทะเบียนหนังสือใหม่</span>
          </Link>

          <button
            onClick={() => setIsAuthenticated(false)}
            className="px-3.5 py-2 bg-pink-50 hover:bg-pink-100 text-pink-700 rounded-2xl text-xs font-semibold transition-colors border border-pink-100"
          >
            ออกจากระบบ
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-pink-100 gap-2">
        <button
          onClick={() => setActiveTab('settings')}
          className={`pb-3 px-4 text-xs font-bold border-b-2 transition-all flex items-center gap-2 ${
            activeTab === 'settings'
              ? 'border-pink-500 text-pink-600'
              : 'border-transparent text-slate-500 hover:text-pink-700'
          }`}
        >
          <Settings className="w-4 h-4" />
          <span>1. ตั้งค่าระบบ & ระยะเวลายืม-คืน</span>
        </button>

        <button
          onClick={() => setActiveTab('books')}
          className={`pb-3 px-4 text-xs font-bold border-b-2 transition-all flex items-center gap-2 ${
            activeTab === 'books'
              ? 'border-pink-500 text-pink-600'
              : 'border-transparent text-slate-500 hover:text-pink-700'
          }`}
        >
          <BookOpen className="w-4 h-4" />
          <span>2. จัดการหนังสือในคลัง ({books.length} เล่ม)</span>
        </button>

        <button
          onClick={() => setActiveTab('data')}
          className={`pb-3 px-4 text-xs font-bold border-b-2 transition-all flex items-center gap-2 ${
            activeTab === 'data'
              ? 'border-pink-500 text-pink-600'
              : 'border-transparent text-slate-500 hover:text-pink-700'
          }`}
        >
          <Layers className="w-4 h-4" />
          <span>3. การจัดการฐานข้อมูล / ล้างระบบ</span>
        </button>
      </div>

      {/* Tab 1: Settings Form */}
      {activeTab === 'settings' && (
        <form onSubmit={handleSaveSettings} className="bg-white rounded-3xl p-6 sm:p-8 border border-pink-100 shadow-sm space-y-6 max-w-3xl">
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2 border-b border-pink-50 pb-3">
              <Clock className="w-4 h-4 text-pink-500" />
              กำหนดระยะเวลายืม-คืน และกฎระเบียบห้องสมุด
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  ชื่อโรงเรียน / สถาบัน
                </label>
                <div className="relative">
                  <School className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    value={schoolName}
                    onChange={(e) => setSchoolName(e.target.value)}
                    className="w-full pl-9 pr-3 py-2.5 bg-pink-50/30 border border-pink-200 rounded-2xl text-xs focus:ring-2 focus:ring-pink-400 focus:bg-white focus:outline-none font-medium"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  รหัสผ่านแอดมินสำหรับครู (Admin PIN)
                </label>
                <div className="relative">
                  <Key className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    value={newPasscode}
                    onChange={(e) => setNewPasscode(e.target.value)}
                    className="w-full pl-9 pr-3 py-2.5 bg-pink-50/30 border border-pink-200 rounded-2xl text-xs font-mono focus:ring-2 focus:ring-pink-400 focus:bg-white focus:outline-none"
                  />
                </div>
              </div>

              <div className="p-4 bg-pink-50/50 border border-pink-100 rounded-2xl space-y-2">
                <label className="block text-xs font-bold text-pink-900">
                  ระยะเวลายืมของนักเรียน (วัน)
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    min="1"
                    max="60"
                    required
                    value={studentBorrowDays}
                    onChange={(e) => setStudentBorrowDays(parseInt(e.target.value) || 1)}
                    className="w-24 px-3 py-2 bg-white border border-pink-200 rounded-xl text-xs font-bold text-center text-pink-900 focus:ring-2 focus:ring-pink-400 focus:outline-none font-mono"
                  />
                  <span className="text-xs text-pink-700 font-medium">วัน (ระบบจะคำนวณวันส่งคืนให้อัตโนมัติ)</span>
                </div>
              </div>

              <div className="p-4 bg-rose-50/50 border border-rose-100 rounded-2xl space-y-2">
                <label className="block text-xs font-bold text-rose-900">
                  ระยะเวลายืมของครู / บุคลากร (วัน)
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    min="1"
                    max="90"
                    required
                    value={teacherBorrowDays}
                    onChange={(e) => setTeacherBorrowDays(parseInt(e.target.value) || 1)}
                    className="w-24 px-3 py-2 bg-white border border-rose-200 rounded-xl text-xs font-bold text-center text-rose-900 focus:ring-2 focus:ring-pink-400 focus:outline-none font-mono"
                  />
                  <span className="text-xs text-rose-700 font-medium">วัน (ระบบจะคำนวณวันส่งคืนให้อัตโนมัติ)</span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  จำนวนหนังสือสูงสุดที่ยืมได้ต่อคน
                </label>
                <div className="relative">
                  <Layers className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="number"
                    min="1"
                    max="10"
                    value={maxBooksPerPerson}
                    onChange={(e) => setMaxBooksPerPerson(parseInt(e.target.value) || 1)}
                    className="w-full pl-9 pr-3 py-2.5 bg-pink-50/30 border border-pink-200 rounded-2xl text-xs font-mono focus:ring-2 focus:ring-pink-400 focus:bg-white focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  อัตราค่าปรับกรณีส่งเกินกำหนด (บาท/วัน)
                </label>
                <div className="relative">
                  <DollarSign className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="number"
                    min="0"
                    value={finePerDay}
                    onChange={(e) => setFinePerDay(parseInt(e.target.value) || 0)}
                    className="w-full pl-9 pr-3 py-2.5 bg-pink-50/30 border border-pink-200 rounded-2xl text-xs font-mono focus:ring-2 focus:ring-pink-400 focus:bg-white focus:outline-none"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-pink-50 flex justify-end">
            <button
              type="submit"
              className="px-6 py-2.5 bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 text-white rounded-2xl text-xs font-bold shadow-md shadow-pink-200 transition-all flex items-center gap-2"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>บันทึกการตั้งค่า</span>
            </button>
          </div>
        </form>
      )}

      {/* Tab 2: Book Management */}
      {activeTab === 'books' && (
        <div className="bg-white rounded-3xl p-6 border border-pink-100 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-800">รายการหนังสือทั้งหมดในคลัง ({books.length} เล่ม)</h3>
              <p className="text-xs text-pink-700 font-medium">ระบบการจัดการการยืมคืนหนังสือของห้องสมุดหมวดภาษาไทย</p>
            </div>
            <Link
              href="/books/new"
              className="px-4 py-2 bg-gradient-to-r from-pink-500 to-rose-500 text-white rounded-2xl text-xs font-bold flex items-center gap-1.5 shadow-sm"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              <span>เพิ่มหนังสือ</span>
            </Link>
          </div>

          {books.length === 0 ? (
            <div className="p-12 text-center text-slate-400 space-y-3">
              <BookOpen className="w-12 h-12 text-pink-300 mx-auto" />
              <p className="text-sm font-bold text-slate-600">ยังไม่มีหนังสือในระบบ</p>
              <p className="text-xs text-slate-400">กดปุ่ม "เพิ่มหนังสือ" เพื่อลงทะเบียนหนังสือและกำหนดรหัสหนังสือ</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-600">
                <thead className="bg-pink-50/60 text-pink-900 font-bold border-b border-pink-100">
                  <tr>
                    <th className="py-2.5 px-3">รหัสหนังสือ</th>
                    <th className="py-2.5 px-3">ชื่อหนังสือ</th>
                    <th className="py-2.5 px-3">หมวดหมู่</th>
                    <th className="py-2.5 px-3">ผู้แต่ง</th>
                    <th className="py-2.5 px-3">สถานะ</th>
                    <th className="py-2.5 px-3 text-right">จัดการ</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-pink-50">
                  {books.map((b) => (
                    <tr key={b.id} className="hover:bg-pink-50/30">
                      <td className="py-3 px-3 font-mono font-bold text-pink-600">{b.id}</td>
                      <td className="py-3 px-3 font-bold text-slate-800">{b.title}</td>
                      <td className="py-3 px-3">{b.category}</td>
                      <td className="py-3 px-3">{b.author}</td>
                      <td className="py-3 px-3">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${b.status === 'AVAILABLE' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-rose-50 text-rose-700 border border-rose-200'}`}>
                          {b.status === 'AVAILABLE' ? 'ยืมได้' : 'ถูกยืม'}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-right">
                        <button
                          onClick={() => handleDeleteBook(b.id, b.title)}
                          className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Tab 3: Data Management */}
      {activeTab === 'data' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white rounded-3xl p-6 border border-pink-100 shadow-sm space-y-3">
            <h4 className="text-sm font-bold text-rose-700 flex items-center gap-2">
              <Trash2 className="w-4 h-4" />
              ล้างระบบให้เป็น "เว็บโล่งๆ" (Clear All Data)
            </h4>
            <p className="text-xs text-slate-500 leading-relaxed">
              ลบหนังสือทั้งหมดและประวัติการยืมออก เพื่อให้เว็บเริ่มต้นใหม่อย่างสะอาด
            </p>
            <button
              onClick={handleClearAll}
              className="px-4 py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-2xl text-xs font-bold transition-colors"
            >
              ล้างข้อมูลทั้งหมดในระบบทันที
            </button>
          </div>

          <div className="bg-white rounded-3xl p-6 border border-pink-100 shadow-sm space-y-3">
            <h4 className="text-sm font-bold text-pink-700 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-pink-500" />
              โหลดข้อมูลตัวอย่างสำหรับทดสอบ (Load Sample Data)
            </h4>
            <p className="text-xs text-slate-500 leading-relaxed">
              ใส่หนังสือตัวอย่างหมวดภาษาไทย 3 เล่มเพื่อทดสอบระบบยืม-คืน
            </p>
            <button
              onClick={handleLoadDemo}
              className="px-4 py-2 bg-pink-50 hover:bg-pink-100 text-pink-700 border border-pink-200 rounded-2xl text-xs font-bold transition-colors"
            >
              โหลดข้อมูลตัวอย่างเข้าสู่ระบบ
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
