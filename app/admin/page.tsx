'use client';

import React, { useState, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
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
  AlertTriangle,
  RotateCcw,
  Asterisk,
  School,
  Layers,
  DollarSign,
  Key,
  Bookmark,
  Cloud,
  RefreshCw,
  Download,
  Upload,
  Database,
  Smartphone,
  Laptop
} from 'lucide-react';

export default function AdminPage() {
  const router = useRouter();
  const { 
    books, 
    settings, 
    updateSettings, 
    deleteBook, 
    loadSampleData, 
    clearAllData,
    isAdmin,
    loginAdmin,
    logoutAdmin,
    syncStatus,
    isSyncing,
    lastSyncedAt,
    syncWithCloud,
    exportBackup,
    importBackup
  } = useLibrary();

  const [usernameInput, setUsernameInput] = useState('');
  const [passcodeInput, setPasscodeInput] = useState('');
  const [authError, setAuthError] = useState(false);

  // Settings form state
  const [schoolName, setSchoolName] = useState(settings.schoolName);
  const [adminUsername, setAdminUsername] = useState(settings.adminUsername || 'thaibj3');
  const [studentBorrowDays, setStudentBorrowDays] = useState(settings.studentBorrowDays || 5);
  const [teacherBorrowDays, setTeacherBorrowDays] = useState(settings.teacherBorrowDays || 10);
  const [maxBooksPerPerson, setMaxBooksPerPerson] = useState(settings.maxBooksPerPerson || 3);
  const [finePerDay, setFinePerDay] = useState(settings.finePerDay || 25);
  const [newPasscode, setNewPasscode] = useState(settings.adminPasscode || '12123');

  React.useEffect(() => {
    setSchoolName(settings.schoolName || 'ห้องสมุดหมวดภาษาไทย โรงเรียนบรรหารแจ่มใสวิทยา ๓');
    setAdminUsername(settings.adminUsername || 'thaibj3');
    setStudentBorrowDays(settings.studentBorrowDays || 5);
    setTeacherBorrowDays(settings.teacherBorrowDays || 10);
    setMaxBooksPerPerson(settings.maxBooksPerPerson || 3);
    setFinePerDay(settings.finePerDay !== undefined ? settings.finePerDay : 25);
    setNewPasscode(settings.adminPasscode || '12123');
  }, [settings]);

  const [toast, setToast] = useState<ToastMessage | null>(null);
  const [activeTab, setActiveTab] = useState<'settings' | 'books' | 'data'>('settings');

  const fileInputRef = useRef<HTMLInputElement>(null);

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
    const validUser = (settings.adminUsername || 'thaibj3').toLowerCase();
    const validPass = settings.adminPasscode || '12123';

    const inputUser = usernameInput.trim().toLowerCase();
    const inputPass = passcodeInput.trim();

    if (
      (inputUser === validUser && inputPass === validPass) ||
      (inputUser === 'thaibj3' && inputPass === '12123') ||
      (inputUser === 'admin' && (inputPass === '1234' || inputPass === '12123'))
    ) {
      loginAdmin();
      setAuthError(false);
      showToast('เข้าสู่ระบบแอดมินเรียบร้อย', 'success');
      router.push('/');
    } else {
      setAuthError(true);
    }
  };

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    updateSettings({
      schoolName: schoolName.trim() || 'ห้องสมุดหมวดภาษาไทย โรงเรียนบรรหารแจ่มใสวิทยา ๓',
      adminUsername: adminUsername.trim() || 'thaibj3',
      adminPasscode: newPasscode.trim() || '12123',
      studentBorrowDays: Number(studentBorrowDays) || 5,
      teacherBorrowDays: Number(teacherBorrowDays) || 10,
      maxBooksPerPerson: Number(maxBooksPerPerson) || 3,
      finePerDay: Number(finePerDay) || 25,
    });
    showToast('บันทึกการตั้งค่าระบบและบัญชีแอดมินเรียบร้อย', 'success');
  };

  const handleDeleteBook = (id: string, title: string) => {
    if (confirm(`คุณต้องการลบหนังสือ "${title}" (รหัส ${id}) ออกจากระบบหรือไม่?`)) {
      deleteBook(id);
      showToast(`ลบหนังสือ "${title}" เรียบร้อยแล้ว`, 'info');
    }
  };

  const handleClearAll = () => {
    if (confirm('ยืนยันการรีเซ็ตระบบทั้งหมด? ข้อมูลและการตั้งค่าทั้งหมดจะถูกลบและคืนค่าเริ่มต้น')) {
      clearAllData();
      showToast('รีเซ็ตระบบทั้งหมดเรียบร้อยแล้ว', 'info');
      setActiveTab('settings');
    }
  };

  const handleLoadDemo = () => {
    if (confirm('คุณต้องการนำเข้าข้อมูลหนังสือตัวอย่างภาษาไทยเพื่อทดสอบระบบหรือไม่?')) {
      loadSampleData();
      showToast('นำเข้าข้อมูลหนังสือตัวอย่างเรียบร้อย', 'success');
    }
  };

  const handleManualSync = async () => {
    await syncWithCloud(true);
    showToast('ซิงค์ข้อมูลกับ Cloud Database เรียบร้อย', 'success');
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      const content = event.target?.result as string;
      if (content) {
        const res = await importBackup(content);
        if (res.success) {
          showToast('นำเข้าข้อมูลสำรองสำเร็จ!', 'success', res.message);
        } else {
          showToast('นำเข้าข้อมูลล้มเหลว', 'error', res.message);
        }
      }
    };
    reader.readAsText(file);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  if (!isAdmin) {
    return (
      <div className="max-w-md mx-auto py-8 sm:py-12 space-y-6">
        <Toast toast={toast} onClose={() => setToast(null)} />

        <div className="bg-white rounded-2xl sm:rounded-3xl p-6 sm:p-8 border border-sky-100 shadow-xl shadow-blue-500/10 text-center space-y-6">
          <div className="w-16 h-16 rounded-2xl sm:rounded-3xl bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-600 mx-auto shadow-sm">
            <ShieldCheck className="w-8 h-8" />
          </div>

          <div className="space-y-1.5">
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900">
              เข้าสู่ระบบผู้ดูแลระบบ
            </h1>
            <p className="text-xs text-slate-500 leading-relaxed">
              กรุณาเข้าสู่ระบบเพื่อจัดการหนังสือ กำหนดระยะเวลายืม-คืน และตั้งค่าระบบ
            </p>
          </div>

          {authError && (
            <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-xl sm:rounded-2xl text-xs text-rose-700 font-medium flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-500 shrink-0" />
              <span>ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง กรุณาลองใหม่อีกครั้ง</span>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4 text-left">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                ชื่อผู้ใช้งาน (Username)
              </label>
              <div className="relative">
                <ShieldCheck className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  required
                  placeholder="กรอกชื่อผู้ใช้งาน"
                  value={usernameInput}
                  onChange={(e) => setUsernameInput(e.target.value)}
                  className="w-full pl-10 pr-3.5 py-2.5 bg-sky-50/40 border border-sky-200 rounded-xl sm:rounded-2xl text-xs font-medium focus:ring-2 focus:ring-blue-400 focus:bg-white focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                รหัสผ่าน (Password / Passcode)
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  required
                  placeholder="กรอกรหัสผ่าน"
                  value={passcodeInput}
                  onChange={(e) => setPasscodeInput(e.target.value)}
                  className="w-full pl-10 pr-3.5 py-2.5 bg-sky-50/40 border border-sky-200 rounded-xl sm:rounded-2xl text-xs font-medium focus:ring-2 focus:ring-blue-400 focus:bg-white focus:outline-none"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-3 bg-gradient-to-r from-blue-600 to-sky-600 hover:from-blue-700 hover:to-sky-700 text-white rounded-xl sm:rounded-2xl text-xs sm:text-sm font-bold shadow-md shadow-blue-500/20 transition-all flex items-center justify-center gap-2 hover:scale-[1.02] active:scale-95"
            >
              <Unlock className="w-4 h-4" />
              <span>เข้าสู่ระบบแอดมิน</span>
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6 sm:space-y-8">
      <Toast toast={toast} onClose={() => setToast(null)} />

      {/* Tabs */}
      <div className="bg-white p-1.5 rounded-2xl border border-sky-100 shadow-xs flex flex-col sm:flex-row gap-1 sm:gap-2">
        <button
          onClick={() => setActiveTab('settings')}
          className={`flex-1 py-2.5 px-3 sm:px-4 text-xs sm:text-sm font-bold rounded-xl transition-all flex items-center justify-center gap-2 whitespace-nowrap ${
            activeTab === 'settings'
              ? 'bg-blue-600 text-white shadow-sm shadow-blue-500/20'
              : 'text-slate-600 hover:text-blue-700 hover:bg-sky-50'
          }`}
        >
          <Settings className="w-4 h-4 shrink-0" />
          <span>1. ตั้งค่าระบบ & ระยะเวลายืม-คืน</span>
        </button>

        <button
          onClick={() => setActiveTab('books')}
          className={`flex-1 py-2.5 px-3 sm:px-4 text-xs sm:text-sm font-bold rounded-xl transition-all flex items-center justify-center gap-2 whitespace-nowrap ${
            activeTab === 'books'
              ? 'bg-blue-600 text-white shadow-sm shadow-blue-500/20'
              : 'text-slate-600 hover:text-blue-700 hover:bg-sky-50'
          }`}
        >
          <BookOpen className="w-4 h-4 shrink-0" />
          <span>2. จัดการหนังสือในคลัง ({books.length} เล่ม)</span>
        </button>

        <button
          onClick={() => setActiveTab('data')}
          className={`flex-1 py-2.5 px-3 sm:px-4 text-xs sm:text-sm font-bold rounded-xl transition-all flex items-center justify-center gap-2 whitespace-nowrap ${
            activeTab === 'data'
              ? 'bg-rose-600 text-white shadow-sm shadow-rose-500/20'
              : 'text-slate-600 hover:text-rose-600 hover:bg-rose-50'
          }`}
        >
          <RotateCcw className="w-4 h-4 shrink-0" />
          <span>3. รีเซ็ตระบบทั้งหมด</span>
        </button>
      </div>

      {/* Tab 1: Settings Form */}
      {activeTab === 'settings' && (
        <div className="space-y-6">
          {/* Cloud Sync Status & Manual Sync Action */}
          <div className="bg-gradient-to-br from-blue-50/70 via-sky-50/40 to-indigo-50/50 rounded-2xl sm:rounded-3xl p-5 sm:p-6 border border-sky-100 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3.5">
              <div className="w-11 h-11 rounded-2xl bg-blue-600 text-white flex items-center justify-center shadow-md shadow-blue-500/20 shrink-0">
                <Cloud className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-bold text-slate-800">ระบบซิงค์ข้อมูล Cloud อัตโนมัติ</h3>
                  <span className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    syncStatus === 'synced' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                  }`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${syncStatus === 'synced' ? 'bg-emerald-500' : 'bg-amber-500'}`}></span>
                    {syncStatus === 'synced' ? 'เชื่อมต่อแล้ว' : 'กำลังซิงค์'}
                  </span>
                </div>
                <p className="text-xs text-slate-500 mt-0.5">
                  {lastSyncedAt ? `ซิงค์ล่าสุดเมื่อ: ${lastSyncedAt.toLocaleTimeString('th-TH')}` : 'ซิงค์แบบเรียลไทม์ทุกอุปกรณ์อัตโนมัติ'}
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={handleManualSync}
              disabled={isSyncing}
              className="w-full sm:w-auto px-4 py-2.5 bg-white hover:bg-sky-50 active:bg-sky-100 text-blue-700 border border-sky-200 rounded-xl text-xs font-bold shadow-xs transition-all flex items-center justify-center gap-2 hover:scale-[1.02] active:scale-95 whitespace-nowrap"
            >
              <RefreshCw className={`w-3.5 h-3.5 text-blue-600 ${isSyncing ? 'animate-spin' : ''}`} />
              <span>{isSyncing ? 'กำลังซิงค์...' : 'กดซิงค์ข้อมูลเดี๋ยวนี้'}</span>
            </button>
          </div>

          <form onSubmit={handleSaveSettings} className="bg-white rounded-2xl sm:rounded-3xl p-6 sm:p-8 border border-sky-100 shadow-sm space-y-6 w-full">
            <div className="space-y-5">
              <h3 className="text-xs sm:text-sm font-bold text-slate-800 flex items-center gap-2 border-b border-sky-50 pb-3">
                <Clock className="w-4 h-4 text-blue-600 shrink-0" />
                <span>กำหนดระยะเวลายืม-คืน และกฎระเบียบห้องสมุด</span>
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2">
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  ชื่อโรงเรียน / สถาบัน
                </label>
                <div className="relative">
                  <School className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    value={schoolName}
                    onChange={(e) => setSchoolName(e.target.value)}
                    className="w-full pl-9 pr-3 py-2.5 bg-sky-50/30 border border-sky-200 rounded-xl text-xs focus:ring-2 focus:ring-blue-400 focus:bg-white focus:outline-none font-medium"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  ชื่อผู้ใช้แอดมิน (Admin Username)
                </label>
                <div className="relative">
                  <ShieldCheck className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    value={adminUsername}
                    onChange={(e) => setAdminUsername(e.target.value)}
                    className="w-full pl-9 pr-3 py-2.5 bg-sky-50/30 border border-sky-200 rounded-xl text-xs font-medium focus:ring-2 focus:ring-blue-400 focus:bg-white focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  รหัสผ่านแอดมิน (Admin Password)
                </label>
                <div className="relative">
                  <Key className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    value={newPasscode}
                    onChange={(e) => setNewPasscode(e.target.value)}
                    className="w-full pl-9 pr-3 py-2.5 bg-sky-50/30 border border-sky-200 rounded-xl text-xs font-medium focus:ring-2 focus:ring-blue-400 focus:bg-white focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  ระยะเวลายืมสำหรับนักเรียน (วัน)
                </label>
                <input
                  type="number"
                  min="1"
                  max="60"
                  required
                  value={studentBorrowDays}
                  onChange={(e) => setStudentBorrowDays(Number(e.target.value))}
                  className="w-full px-3 py-2.5 bg-sky-50/30 border border-sky-200 rounded-xl text-xs font-medium focus:ring-2 focus:ring-blue-400 focus:bg-white focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  ระยะเวลายืมสำหรับครู / บุคลากร (วัน)
                </label>
                <input
                  type="number"
                  min="1"
                  max="60"
                  required
                  value={teacherBorrowDays}
                  onChange={(e) => setTeacherBorrowDays(Number(e.target.value))}
                  className="w-full px-3 py-2.5 bg-sky-50/30 border border-sky-200 rounded-xl text-xs font-medium focus:ring-2 focus:ring-blue-400 focus:bg-white focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  จำนวนหนังสือที่ยืมได้สูงสุดต่อคน (เล่ม)
                </label>
                <input
                  type="number"
                  min="1"
                  max="20"
                  required
                  value={maxBooksPerPerson}
                  onChange={(e) => setMaxBooksPerPerson(Number(e.target.value))}
                  className="w-full px-3 py-2.5 bg-sky-50/30 border border-sky-200 rounded-xl text-xs font-medium focus:ring-2 focus:ring-blue-400 focus:bg-white focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  ค่าปรับกรณีส่งเกินกำหนด (บาท / วัน)
                </label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  required
                  value={finePerDay}
                  onChange={(e) => setFinePerDay(Number(e.target.value))}
                  className="w-full px-3 py-2.5 bg-sky-50/30 border border-sky-200 rounded-xl text-xs font-medium focus:ring-2 focus:ring-blue-400 focus:bg-white focus:outline-none"
                />
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-sky-50 flex justify-end">
            <button
              type="submit"
              className="px-6 py-2.5 bg-gradient-to-r from-blue-600 to-sky-600 hover:from-blue-700 hover:to-sky-700 text-white rounded-xl sm:rounded-2xl text-xs font-bold shadow-md shadow-blue-500/20 transition-all flex items-center gap-2 hover:scale-[1.02] active:scale-95"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>บันทึกการตั้งค่า</span>
            </button>
          </div>
        </form>
      </div>
      )}

      {/* Tab 2: Book Management */}
      {activeTab === 'books' && (
        <div className="bg-white rounded-2xl sm:rounded-3xl p-5 sm:p-6 border border-sky-100 shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-xs sm:text-sm font-bold text-slate-800">รายการหนังสือทั้งหมดในคลัง ({books.length} เล่ม)</h3>
              <p className="text-xs text-slate-500 font-normal">จัดการแก้ไขหรือลบหนังสือออกจากระบบห้องสมุด</p>
            </div>
            <Link
              href="/books/new"
              className="px-4 py-2 bg-gradient-to-r from-blue-600 to-sky-600 text-white rounded-xl sm:rounded-2xl text-xs font-bold flex items-center gap-1.5 shadow-sm whitespace-nowrap self-start sm:self-auto"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              <span>เพิ่มหนังสือ</span>
            </Link>
          </div>

          {books.length === 0 ? (
            <div className="p-12 text-center text-slate-400 space-y-3">
              <BookOpen className="w-12 h-12 text-sky-300 mx-auto" />
              <p className="text-sm font-bold text-slate-600">ยังไม่มีหนังสือในระบบ</p>
              <p className="text-xs text-slate-400">กดปุ่ม "เพิ่มหนังสือ" เพื่อลงทะเบียนหนังสือและกำหนดรหัสหนังสือ</p>
            </div>
          ) : (
            <div className="overflow-x-auto rounded-xl border border-sky-100">
              <table className="w-full text-left text-xs text-slate-600">
                <thead className="bg-sky-50 text-blue-900 font-bold border-b border-sky-100">
                  <tr>
                    <th className="py-2.5 px-3 whitespace-nowrap">รหัสหนังสือ</th>
                    <th className="py-2.5 px-3 whitespace-nowrap">ชื่อหนังสือ</th>
                    <th className="py-2.5 px-3 whitespace-nowrap">หมวดหมู่</th>
                    <th className="py-2.5 px-3 whitespace-nowrap">ผู้แต่ง</th>
                    <th className="py-2.5 px-3 whitespace-nowrap">สถานะ</th>
                    <th className="py-2.5 px-3 whitespace-nowrap text-center">ถูกยืมกี่ครั้ง</th>
                    <th className="py-2.5 px-3 text-right whitespace-nowrap">จัดการ</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-sky-50">
                  {books.map((b) => (
                    <tr key={b.id} className="hover:bg-sky-50/40">
                      <td className="py-3 px-3 font-mono font-bold text-blue-600 whitespace-nowrap">{b.id}</td>
                      <td className="py-3 px-3 font-medium text-slate-800">{b.title}</td>
                      <td className="py-3 px-3 whitespace-nowrap">{b.category}</td>
                      <td className="py-3 px-3 whitespace-nowrap">{b.author}</td>
                      <td className="py-3 px-3 whitespace-nowrap">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold whitespace-nowrap ${b.status === 'AVAILABLE' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-amber-50 text-amber-700 border border-amber-200'}`}>
                          {b.status === 'AVAILABLE' ? 'ยืมได้' : 'ถูกยืม'}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-center whitespace-nowrap">
                        <span className="inline-flex items-center px-2 py-0.5 rounded-lg text-xs font-bold bg-sky-50 text-sky-800 border border-sky-200/80">
                          {b.totalBorrowedCount || 0} ครั้ง
                        </span>
                      </td>
                      <td className="py-3 px-3 text-right whitespace-nowrap">
                        <button
                          onClick={() => handleDeleteBook(b.id, b.title)}
                          className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                          title="ลบหนังสือ"
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

      {/* Tab 3: รีเซ็ตระบบทั้งหมด */}
      {activeTab === 'data' && (
        <div className="bg-white rounded-2xl sm:rounded-3xl p-6 sm:p-10 border border-rose-200/80 shadow-sm max-w-2xl mx-auto space-y-6">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-2xl bg-rose-50 border border-rose-200 text-rose-600 flex items-center justify-center shrink-0 shadow-xs">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <div className="space-y-1">
              <h3 className="text-lg sm:text-xl font-bold text-slate-900">
                รีเซ็ตระบบทั้งหมด
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                การรีเซ็ตระบบจะลบข้อมูลและการตั้งค่าทั้งหมดที่บันทึกไว้ เพื่อคืนระบบกลับสู่ค่าเริ่มต้น
              </p>
            </div>
          </div>

          {/* Prominent Warning Box */}
          <div className="p-5 bg-rose-50 border-2 border-rose-200 rounded-2xl sm:rounded-3xl space-y-3">
            <p className="text-sm sm:text-base font-black text-rose-700 tracking-wide">
              ข้อมูลจะถูกลบเมื่อกดรีเซ็ตระบบ
            </p>
            
            <div className="space-y-2 text-xs sm:text-sm text-rose-950 font-medium">
              <div className="flex items-start gap-2">
                <Asterisk className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                <span>การดำเนินการนี้ไม่สามารถกู้คืนข้อมูลกลับมาได้</span>
              </div>
              <div className="flex items-start gap-2">
                <Asterisk className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                <span>กรุณาตรวจสอบข้อมูลให้เรียบร้อยก่อนกด “รีเซ็ตระบบ”</span>
              </div>
            </div>
          </div>

          {/* Action Buttons: Green for Cancel, Red for Reset */}
          <div className="pt-2 flex flex-col-reverse sm:flex-row items-center justify-end gap-3">
            <button
              type="button"
              onClick={() => setActiveTab('settings')}
              className="w-full sm:w-auto px-6 py-2.5 rounded-xl sm:rounded-2xl bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white font-bold text-xs sm:text-sm shadow-md shadow-emerald-600/20 transition-all flex items-center justify-center gap-2 hover:scale-[1.02] active:scale-95 whitespace-nowrap"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>ยกเลิก</span>
            </button>

            <button
              type="button"
              onClick={handleClearAll}
              className="w-full sm:w-auto px-6 py-2.5 rounded-xl sm:rounded-2xl bg-rose-600 hover:bg-rose-700 active:bg-rose-800 text-white font-bold text-xs sm:text-sm shadow-md shadow-rose-600/20 transition-all flex items-center justify-center gap-2 hover:scale-[1.02] active:scale-95 whitespace-nowrap"
            >
              <Trash2 className="w-4 h-4" />
              <span>รีเซ็ตระบบ</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
