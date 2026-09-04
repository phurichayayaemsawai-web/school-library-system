'use client';

import React, { useState } from 'react';
import { useLibrary } from '@/context/LibraryContext';
import { SCHOOL_DEPARTMENTS, WishlistPriority } from '@/types';
import { Sparkles, BookOpen, User, Phone, DollarSign, Layers, Link as LinkIcon, FileText, CheckCircle2 } from 'lucide-react';

interface WishlistFormProps {
  onSuccess?: (msg: string) => void;
}

export const WishlistForm: React.FC<WishlistFormProps> = ({ onSuccess }) => {
  const { addWishlist } = useLibrary();

  const [title, setTitle] = useState('');
  const [authorPublisher, setAuthorPublisher] = useState('');
  const [department, setDepartment] = useState<string>(SCHOOL_DEPARTMENTS[0]);
  const [teacherName, setTeacherName] = useState('');
  const [teacherPhone, setTeacherPhone] = useState('');
  const [estimatedPrice, setEstimatedPrice] = useState<string>('350');
  const [quantity, setQuantity] = useState<number>(2);
  const [priority, setPriority] = useState<WishlistPriority>('MEDIUM');
  const [reason, setReason] = useState('');
  const [isbn, setIsbn] = useState('');
  const [referenceUrl, setReferenceUrl] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim() || !teacherName.trim() || !reason.trim()) {
      alert('กรุณากรอกข้อมูลที่จำเป็น (ชื่อหนังสือ, ชื่อครูผู้เสนอ, และเหตุผลความจำเป็น)');
      return;
    }

    addWishlist({
      title: title.trim(),
      authorPublisher: authorPublisher.trim() || 'ไม่ระบุสำนักพิมพ์',
      department,
      teacherName: teacherName.trim(),
      teacherPhone: teacherPhone.trim() || '-',
      estimatedPrice: parseFloat(estimatedPrice) || 0,
      quantity: Number(quantity) || 1,
      priority,
      reason: reason.trim(),
      isbn: isbn.trim() || undefined,
      referenceUrl: referenceUrl.trim() || undefined,
    });

    setSubmitted(true);
    if (onSuccess) onSuccess(`ส่งคำขอเสนอสั่งซื้อหนังสือ "${title}" เรียบร้อยแล้ว`);

    // Reset form after short delay
    setTimeout(() => {
      setTitle('');
      setAuthorPublisher('');
      setReason('');
      setIsbn('');
      setReferenceUrl('');
      setSubmitted(false);
    }, 2500);
  };

  return (
    <div className="bg-white rounded-2xl sm:rounded-3xl p-5 sm:p-8 border border-sky-100 shadow-sm">
      <div className="flex items-center gap-3 pb-5 border-b border-sky-50">
        <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-gradient-to-tr from-blue-600 to-sky-500 flex items-center justify-center text-white shadow-md shadow-blue-500/20 shrink-0">
          <Sparkles className="w-5 h-5 sm:w-6 sm:h-6" />
        </div>
        <div>
          <h2 className="text-base sm:text-lg font-bold text-slate-900">
            แบบฟอร์มเสนอสั่งซื้อหนังสือใหม่ (สำหรับครู)
          </h2>
          <p className="text-xs text-slate-500 font-normal">
            Book Procurement Wishlist - เสนอแนะรายการหนังสือเพื่อพัฒนาแหล่งเรียนรู้ของโรงเรียน
          </p>
        </div>
      </div>

      {submitted ? (
        <div className="py-12 flex flex-col items-center justify-center text-center space-y-3 animate-in fade-in zoom-in-95">
          <div className="w-16 h-16 rounded-2xl sm:rounded-3xl bg-emerald-100 text-emerald-600 flex items-center justify-center shadow-sm">
            <CheckCircle2 className="w-8 h-8" />
          </div>
          <h3 className="text-base font-bold text-slate-800">ส่งคำขอเสนอสั่งซื้อหนังสือเรียบร้อยแล้ว!</h3>
          <p className="text-xs text-slate-500 max-w-md">
            รายการหนังสือจะถูกส่งต่อไปยัง Dashboard ของฝ่ายห้องสมุดเพื่อพิจารณาจัดสรรงบประมาณต่อไป
          </p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="mt-5 space-y-5">
          {/* Section 1: Book Info */}
          <div className="space-y-4">
            <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
              <BookOpen className="w-4 h-4 text-blue-600 shrink-0" />
              <span>1. ข้อมูลหนังสือที่ต้องการเสนอซื้อ</span>
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2">
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  ชื่อหนังสือที่ต้องการสั่งซื้อ <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="เช่น Generative AI and Prompt Engineering for High School"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-sky-50/30 border border-sky-200 rounded-xl text-xs focus:ring-2 focus:ring-blue-500 focus:bg-white focus:outline-none text-slate-800"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  ผู้แต่ง / สำนักพิมพ์
                </label>
                <input
                  type="text"
                  placeholder="เช่น O'Reilly Media / ดร. สมชาย"
                  value={authorPublisher}
                  onChange={(e) => setAuthorPublisher(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-sky-50/30 border border-sky-200 rounded-xl text-xs focus:ring-2 focus:ring-blue-500 focus:bg-white focus:outline-none text-slate-800"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  กลุ่มสาระการเรียนรู้ที่เกี่ยวข้อง <span className="text-red-500">*</span>
                </label>
                <select
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-sky-50/30 border border-sky-200 rounded-xl text-xs focus:ring-2 focus:ring-blue-500 focus:bg-white focus:outline-none text-slate-800 cursor-pointer"
                >
                  {SCHOOL_DEPARTMENTS.map((dept) => (
                    <option key={dept} value={dept}>
                      {dept}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  ราคาประเมินต่อเล่ม (บาท)
                </label>
                <div className="relative">
                  <DollarSign className="w-3.5 h-3.5 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="number"
                    min="0"
                    step="1"
                    placeholder="350"
                    value={estimatedPrice}
                    onChange={(e) => setEstimatedPrice(e.target.value)}
                    className="w-full pl-9 pr-3.5 py-2.5 bg-sky-50/30 border border-sky-200 rounded-xl text-xs focus:ring-2 focus:ring-blue-500 focus:bg-white focus:outline-none text-slate-800 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  จำนวนเล่มที่ต้องการเสนอซื้อ
                </label>
                <div className="relative">
                  <Layers className="w-3.5 h-3.5 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="number"
                    min="1"
                    max="20"
                    value={quantity}
                    onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
                    className="w-full pl-9 pr-3.5 py-2.5 bg-sky-50/30 border border-sky-200 rounded-xl text-xs focus:ring-2 focus:ring-blue-500 focus:bg-white focus:outline-none text-slate-800 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  ระดับความสำคัญ / ความเร่งด่วน
                </label>
                <select
                  value={priority}
                  onChange={(e) => setPriority(e.target.value as WishlistPriority)}
                  className="w-full px-3.5 py-2.5 bg-sky-50/30 border border-sky-200 rounded-xl text-xs focus:ring-2 focus:ring-blue-500 focus:bg-white focus:outline-none text-slate-800 cursor-pointer"
                >
                  <option value="URGENT">ด่วนที่สุด (จำเป็นต้องใช้ทันที)</option>
                  <option value="HIGH">สำคัญมาก (มีแผนการสอนรองรับ)</option>
                  <option value="MEDIUM">ปานกลาง (เสริมหลักสูตร)</option>
                  <option value="NORMAL">ทั่วไป (อ่านเสริมความรู้)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  ISBN หรือ ลิงก์อ้างอิง (ถ้ามี)
                </label>
                <div className="relative">
                  <LinkIcon className="w-3.5 h-3.5 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="978-xxx-xxx หรือ https://..."
                    value={isbn || referenceUrl}
                    onChange={(e) => {
                      if (e.target.value.startsWith('http')) {
                        setReferenceUrl(e.target.value);
                      } else {
                        setIsbn(e.target.value);
                      }
                    }}
                    className="w-full pl-9 pr-3.5 py-2.5 bg-sky-50/30 border border-sky-200 rounded-xl text-xs focus:ring-2 focus:ring-blue-500 focus:bg-white focus:outline-none text-slate-800"
                  />
                </div>
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  เหตุผลและความจำเป็นในการสั่งซื้อ <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <FileText className="w-3.5 h-3.5 text-slate-400 absolute left-3.5 top-3" />
                  <textarea
                    required
                    rows={3}
                    placeholder="ระบุวัตถุประสงค์ เช่น เพื่อใช้ประกอบการทำโครงงาน ม.5, ใช้ติว สอวน., หรือไม่มีในห้องสมุด..."
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    className="w-full pl-9 pr-3.5 py-2.5 bg-sky-50/30 border border-sky-200 rounded-xl text-xs focus:ring-2 focus:ring-blue-500 focus:bg-white focus:outline-none text-slate-800 leading-relaxed"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Section 2: Teacher Contact */}
          <div className="pt-4 border-t border-sky-50 space-y-4">
            <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
              <User className="w-4 h-4 text-blue-600 shrink-0" />
              <span>2. ข้อมูลครูผู้เสนอรายการ</span>
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  ชื่อ-นามสกุล ครูผู้เสนอ <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="เช่น ครูอนุชา กิตติพงศ์"
                  value={teacherName}
                  onChange={(e) => setTeacherName(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-sky-50/30 border border-sky-200 rounded-xl text-xs focus:ring-2 focus:ring-blue-500 focus:bg-white focus:outline-none text-slate-800"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  เบอร์โทรศัพท์ติดต่อ
                </label>
                <div className="relative">
                  <Phone className="w-3.5 h-3.5 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="tel"
                    placeholder="08x-xxx-xxxx"
                    value={teacherPhone}
                    onChange={(e) => setTeacherPhone(e.target.value)}
                    className="w-full pl-9 pr-3.5 py-2.5 bg-sky-50/30 border border-sky-200 rounded-xl text-xs focus:ring-2 focus:ring-blue-500 focus:bg-white focus:outline-none text-slate-800"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Submit button */}
          <div className="pt-4 border-t border-sky-50 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div className="text-xs text-slate-500">
              งบประมาณประเมินรวม: <strong className="text-blue-600 font-bold">{(parseFloat(estimatedPrice) || 0) * quantity} บาท</strong>
            </div>
            <button
              type="submit"
              className="w-full sm:w-auto px-6 py-2.5 bg-gradient-to-r from-blue-600 to-sky-600 hover:from-blue-700 hover:to-sky-700 text-white rounded-xl text-xs font-bold shadow-md shadow-blue-500/20 transition-all flex items-center justify-center gap-2 whitespace-nowrap hover:scale-105 active:scale-95"
            >
              <Sparkles className="w-4 h-4" />
              <span>ส่งรายการเสนอสั่งซื้อ</span>
            </button>
          </div>
        </form>
      )}
    </div>
  );
};
