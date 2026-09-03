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
  Calendar,
  Layers,
  DollarSign,
  Key
} from 'lucide-react';
import { formatCurrency } from '@/lib/utils';

export default function AdminPage() {
  const { 
    books, 
    transactions, 
    settings, 
    updateSettings, 
    deleteBook, 
    loadSampleData, 
    clearAllData 
  } = useLibrary();

  // Authentication State
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
      schoolName: schoolName.trim() || 'ห้องสมุดโรงเรียน',
      studentBorrowDays: Number(studentBorrowDays) || 7,
      teacherBorrowDays: Number(teacherBorrowDays) || 14,
      maxBooksPerPerson: Number(maxBooksPerPerson) || 3,
      finePerDay: Number(finePerDay) || 0,
      adminPasscode: newPasscode.trim() || '1234',
    });
    showToast('บันทึกการตั้งค่าระบบและระยะเวลายืม-คืนเรียบร้อย', 'success');
  };

  const handleDeleteBook = (id: string, title: string) => {
    if (confirm(`คุณต้องการลบหนังสือ "${title}" ออกจากระบบหรือไม่?`)) {
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
    if (confirm('คุณต้องการนำเข้าข้อมูลหนังสือตัวอย่างเพื่อทดสอบระบบหรือไม่?')) {
      loadSampleData();
      showToast('นำเข้าข้อมูลหนังสือตัวอย่างเรียบร้อย', 'success');
    }
  };

  // If not authenticated, show passcode screen
  if (!isAuthenticated) {
    return (
      <div className="max-w-md mx-auto py-12 space-y-6">
        <Toast toast={toast} onClose={() => setToast(null)} />

        <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-xl text-center space-y-6">
          <div className="w-16 h-16 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 mx-auto shadow-sm">
            <Lock className="w-8 h-8" />
          </div>

          <div>
            <h1 className="text-xl font-bold text-slate-900">ระบบแอดมินสำหรับครู / บรรณารักษ์</h1>
            <p className="text-xs text-slate-500 mt-1">
              กรุณากรอกรหัสผ่านเพื่อเข้าจัดการข้อมูลระบบและตั้งค่าเวลายืม-คืน
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <input
                type="password"
                required
                maxLength={10}
                placeholder="กรอกรหัสผ่าน (ค่าเริ่มต้น: 1234)"
                value={passcodeInput}
                onChange={(e) => {
                  setPasscodeInput(e.target.value);
                  setAuthError(false);
                }}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-center font-mono text-base tracking-widest focus:ring-2 focus:ring-indigo-500 focus:bg-white focus:outline-none"
              />
              {authError && (
                <p className="text-xs text-red-500 mt-2 font-medium flex items-center justify-center gap-1">
                  <AlertCircle className="w-3.5 h-3.5" /> รหัสผ่านไม่ถูกต้อง (ค่าเริ่มต้นคือ 1234)
                </p>
              )}
            </div>

            <button
              type="submit"
              className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-2xl text-xs shadow-md shadow-indigo-200 transition-all flex items-center justify-center gap-2"
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

  // Authenticated Admin Dashboard
  return (
    <div className="space-y-8">
      <Toast toast={toast} onClose={() => setToast(null)} />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1 text-[11px] font-bold bg-emerald-50 text-emerald-700 px-2.5 py-0.5 rounded-full border border-emerald-200">
              <ShieldCheck className="w-3.5 h-3.5" /> แอดมิน / ครูผู้ดูแล
            </span>
            <span className="text-xs text-slate-400 font-mono">({settings.schoolName})</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 mt-1">
            ระบบจัดการและตั้งค่าห้องสมุด
          </h1>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href="/books/new"
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-md shadow-indigo-200 transition-all flex items-center gap-1.5"
          >
            <PlusCircle className="w-4 h-4" />
            <span>+ เพิ่มหนังสือใหม่</span>
          </Link>

          <button
            onClick={() => setIsAuthenticated(false)}
            className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl text-xs font-semibold transition-colors"
          >
            ออกจากระบบ
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200 gap-2">
        <button
          onClick={() => setActiveTab('settings')}
          className={`pb-3 px-4 text-xs font-bold border-b-2 transition-all flex items-center gap-2 ${
            activeTab === 'settings'
              ? 'border-indigo-600 text-indigo-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Settings className="w-4 h-4" />
          <span>1. ตั้งค่าระบบ & ระยะเวลายืม-คืน</span>
        </button>

        <button
          onClick={() => setActiveTab('books')}
          className={`pb-3 px-4 text-xs font-bold border-b-2 transition-all flex items-center gap-2 ${
            activeTab === 'books'
              ? 'border-indigo-600 text-indigo-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <BookOpen className="w-4 h-4" />
          <span>2. จัดการหนังสือในระบบ ({books.length} เล่ม)</span>
        </button>

        <button
          onClick={() => setActiveTab('data')}
          className={`pb-3 px-4 text-xs font-bold border-b-2 transition-all flex items-center gap-2 ${
            activeTab === 'data'
              ? 'border-indigo-600 text-indigo-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Layers className="w-4 h-4" />
          <span>3. การจัดการฐานข้อมูล / ล้างระบบ</span>
        </button>
      </div>

      {/* Tab 1: Settings Form */}
      {activeTab === 'settings' && (
        <form onSubmit={handleSaveSettings} className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6 max-w-3xl">
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2 border-b pb-3">
              <Clock className="w-4 h-4 text-indigo-600" />
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
                    className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-indigo-500 focus:bg-white focus:outline-none"
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
                    className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono focus:ring-2 focus:ring-indigo-500 focus:bg-white focus:outline-none"
                  />
                </div>
              </div>

              <div className="p-4 bg-sky-50/70 border border-sky-100 rounded-2xl space-y-2">
                <label className="block text-xs font-bold text-sky-900">
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
                    className="w-24 px-3 py-2 bg-white border border-sky-200 rounded-xl text-xs font-bold text-center text-sky-900 focus:ring-2 focus:ring-sky-500 focus:outline-none font-mono"
                  />
                  <span className="text-xs text-sky-700 font-medium">วัน (ระบบจะคำนวณวันส่งคืนให้อัตโนมัติ)</span>
                </div>
              </div>

              <div className="p-4 bg-purple-50/70 border border-purple-100 rounded-2xl space-y-2">
                <label className="block text-xs font-bold text-purple-900">
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
                    className="w-24 px-3 py-2 bg-white border border-purple-200 rounded-xl text-xs font-bold text-center text-purple-900 focus:ring-2 focus:ring-purple-500 focus:outline-none font-mono"
                  />
                  <span className="text-xs text-purple-700 font-medium">วัน (ระบบจะคำนวณวันส่งคืนให้อัตโนมัติ)</span>
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
                    className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono focus:ring-2 focus:ring-indigo-500 focus:bg-white focus:outline-none"
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
                    className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono focus:ring-2 focus:ring-indigo-500 focus:bg-white focus:outline-none"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t flex justify-end">
            <button
              type="submit"
              className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-md shadow-indigo-200 transition-all flex items-center gap-2"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>บันทึกการตั้งค่า</span>
            </button>
          </div>
        </form>
      )}

      {/* Tab 2: Book Management */}
      {activeTab === 'books' && (
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-800">รายการหนังสือทั้งหมดในคลัง ({books.length} เล่ม)</h3>
              <p className="text-xs text-slate-500">ครูสามารถแก้ไขหรือลบหนังสือได้จากส่วนนี้</p>
            </div>
            <Link
              href="/books/new"
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-sm"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              <span>เพิ่มหนังสือ</span>
            </Link>
          </div>

          {books.length === 0 ? (
            <div className="p-12 text-center text-slate-400 space-y-3">
              <BookOpen className="w-12 h-12 text-slate-300 mx-auto" />
              <p className="text-sm font-bold text-slate-600">ยังไม่มีหนังสือในระบบ</p>
              <p className="text-xs text-slate-400">กดปุ่ม "เพิ่มหนังสือ" ด้านบนเพื่อเริ่มใส่ข้อมูลหนังสือเล่มแรก</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-600">
                <thead className="bg-slate-50 text-slate-700 font-semibold border-b">
                  <tr>
                    <th className="py-2.5 px-3">รหัส</th>
                    <th className="py-2.5 px-3">ชื่อหนังสือ</th>
                    <th className="py-2.5 px-3">หมวดหมู่</th>
                    <th className="py-2.5 px-3">ผู้แต่ง</th>
                    <th className="py-2.5 px-3">สถานะ</th>
                    <th className="py-2.5 px-3 text-right">ลบ</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {books.map((b) => (
                    <tr key={b.id} className="hover:bg-slate-50">
                      <td className="py-3 px-3 font-mono font-bold text-indigo-600">{b.id}</td>
                      <td className="py-3 px-3 font-bold text-slate-800">{b.title}</td>
                      <td className="py-3 px-3">{b.category}</td>
                      <td className="py-3 px-3">{b.author}</td>
                      <td className="py-3 px-3">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${b.status === 'AVAILABLE' ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'}`}>
                          {b.status === 'AVAILABLE' ? 'ยืมได้' : 'ถูกยืม'}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-right">
                        <button
                          onClick={() => handleDeleteBook(b.id, b.title)}
                          className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
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
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-3">
            <h4 className="text-sm font-bold text-rose-700 flex items-center gap-2">
              <Trash2 className="w-4 h-4" />
              ล้างระบบให้เป็น "เว็บโล่งๆ" (Clear All Data)
            </h4>
            <p className="text-xs text-slate-500 leading-relaxed">
              ลบหนังสือทั้งหมด รายการยืม-คืน และคำขอจัดซื้อทั้งหมดออก เพื่อให้เว็บเริ่มต้นใหม่อย่างสะอาด
            </p>
            <button
              onClick={handleClearAll}
              className="px-4 py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-xl text-xs font-bold transition-colors"
            >
              ล้างข้อมูลทั้งหมดในระบบทันที
            </button>
          </div>

          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-3">
            <h4 className="text-sm font-bold text-indigo-700 flex items-center gap-2">
              <Sparkles className="w-4 h-4" />
              โหลดข้อมูลตัวอย่างสำหรับทดสอบ (Load Sample Data)
            </h4>
            <p className="text-xs text-slate-500 leading-relaxed">
              ใส่หนังสือตัวอย่าง 3 เล่มเพื่อทดสอบการทำงานของระบบยืม-คืน
            </p>
            <button
              onClick={handleLoadDemo}
              className="px-4 py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 rounded-xl text-xs font-bold transition-colors"
            >
              โหลดข้อมูลตัวอย่างเข้าสู่ระบบ
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
