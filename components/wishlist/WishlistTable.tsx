'use client';

import React, { useState } from 'react';
import { BookWishlist, WishlistStatus, SCHOOL_DEPARTMENTS } from '@/types';
import { useLibrary } from '@/context/LibraryContext';
import { Badge } from '@/components/ui/Badge';
import { formatThaiDate, formatCurrency } from '@/lib/utils';
import { 
  Search, 
  Check, 
  X, 
  ShoppingBag, 
  Clock, 
  MessageSquare, 
  User, 
  Trash2, 
  ExternalLink,
  BookOpen
} from 'lucide-react';

interface WishlistTableProps {
  wishlists: BookWishlist[];
  isAdmin?: boolean;
}

export const WishlistTable: React.FC<WishlistTableProps> = ({ wishlists, isAdmin = true }) => {
  const { updateWishlistStatus, deleteWishlist } = useLibrary();

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | WishlistStatus>('ALL');
  const [departmentFilter, setDepartmentFilter] = useState<string>('ALL');
  
  // Note editing state
  const [editingItem, setEditingItem] = useState<BookWishlist | null>(null);
  const [noteInput, setNoteInput] = useState('');

  const filtered = wishlists.filter((item) => {
    const q = search.toLowerCase();
    const matchesSearch =
      !q ||
      item.title.toLowerCase().includes(q) ||
      item.authorPublisher.toLowerCase().includes(q) ||
      item.teacherName.toLowerCase().includes(q) ||
      item.reason.toLowerCase().includes(q);

    const matchesStatus = statusFilter === 'ALL' || item.status === statusFilter;
    const matchesDept = departmentFilter === 'ALL' || item.department === departmentFilter;

    return matchesSearch && matchesStatus && matchesDept;
  });

  const handleStatusChange = (id: string, newStatus: WishlistStatus) => {
    updateWishlistStatus(id, newStatus);
  };

  const handleSaveNote = () => {
    if (!editingItem) return;
    updateWishlistStatus(editingItem.id, editingItem.status, noteInput.trim());
    setEditingItem(null);
    setNoteInput('');
  };

  const handleDelete = (id: string, title: string) => {
    if (confirm(`คุณต้องการลบรายการเสนอซื้อ "${title}" หรือไม่?`)) {
      deleteWishlist(id);
    }
  };

  return (
    <div className="bg-white rounded-2xl sm:rounded-3xl border border-sky-100 shadow-sm overflow-hidden space-y-4">
      {/* Search & Filter Header */}
      <div className="p-4 sm:p-5 border-b border-sky-50 space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-sm sm:text-base font-bold text-slate-800 flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-blue-600 shrink-0" />
              <span>รายการเสนอสั่งซื้อหนังสือทั้งหมด</span>
            </h3>
            <p className="text-xs text-slate-500 font-normal">
              พบ {filtered.length} จากทั้งหมด {wishlists.length} รายการ
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {/* Search */}
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="ค้นหาชื่อหนังสือ, ผู้แต่ง, ครูผู้เสนอ..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-sky-50/40 border border-sky-200 rounded-xl text-xs focus:ring-2 focus:ring-blue-500 focus:bg-white focus:outline-none"
            />
          </div>

          {/* Status buttons */}
          <div className="flex items-center gap-1 bg-sky-50/70 p-1 rounded-xl border border-sky-100 overflow-x-auto">
            <button
              onClick={() => setStatusFilter('ALL')}
              className={`flex-1 py-1.5 px-2 text-[11px] font-semibold rounded-lg transition-all whitespace-nowrap ${
                statusFilter === 'ALL' ? 'bg-white text-blue-900 shadow-xs' : 'text-slate-600'
              }`}
            >
              ทั้งหมด
            </button>
            <button
              onClick={() => setStatusFilter('PENDING')}
              className={`flex-1 py-1.5 px-2 text-[11px] font-semibold rounded-lg transition-all whitespace-nowrap ${
                statusFilter === 'PENDING' ? 'bg-amber-500 text-white shadow-xs' : 'text-slate-600'
              }`}
            >
              รอตรวจ
            </button>
            <button
              onClick={() => setStatusFilter('APPROVED')}
              className={`flex-1 py-1.5 px-2 text-[11px] font-semibold rounded-lg transition-all whitespace-nowrap ${
                statusFilter === 'APPROVED' ? 'bg-blue-600 text-white shadow-xs' : 'text-slate-600'
              }`}
            >
              อนุมัติ
            </button>
            <button
              onClick={() => setStatusFilter('ORDERED')}
              className={`flex-1 py-1.5 px-2 text-[11px] font-semibold rounded-lg transition-all whitespace-nowrap ${
                statusFilter === 'ORDERED' ? 'bg-emerald-600 text-white shadow-xs' : 'text-slate-600'
              }`}
            >
              สั่งแล้ว
            </button>
          </div>

          {/* Department dropdown */}
          <div>
            <select
              value={departmentFilter}
              onChange={(e) => setDepartmentFilter(e.target.value)}
              className="w-full py-2 px-3 bg-sky-50/40 border border-sky-200 rounded-xl text-xs font-medium text-slate-700 focus:ring-2 focus:ring-blue-500 focus:outline-none cursor-pointer"
            >
              <option value="ALL">ทุกกลุ่มสาระการเรียนรู้</option>
              {SCHOOL_DEPARTMENTS.map((dept) => (
                <option key={dept} value={dept}>
                  {dept}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs text-slate-600">
          <thead className="bg-sky-50/80 text-blue-950 font-bold border-b border-sky-100 uppercase tracking-wider text-[11px]">
            <tr>
              <th className="py-3 px-4 whitespace-nowrap">หนังสือที่เสนอซื้อ</th>
              <th className="py-3 px-4 whitespace-nowrap">กลุ่มสาระฯ / ครูผู้เสนอ</th>
              <th className="py-3 px-4 whitespace-nowrap">ความเร่งด่วน / ราคาประเมิน</th>
              <th className="py-3 px-4 whitespace-nowrap">เหตุผลความจำเป็น</th>
              <th className="py-3 px-4 whitespace-nowrap">สถานะการพิจารณา</th>
              {isAdmin && <th className="py-3 px-4 text-right whitespace-nowrap">การจัดการ</th>}
            </tr>
          </thead>
          <tbody className="divide-y divide-sky-50">
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={6} className="text-center py-10 text-slate-400">
                  <Clock className="w-8 h-8 text-sky-300 mx-auto mb-2" />
                  <span>ไม่พบรายการเสนอสั่งซื้อหนังสือตามเงื่อนไข</span>
                </td>
              </tr>
            ) : (
              filtered.map((item) => {
                const totalCost = item.estimatedPrice * item.quantity;

                return (
                  <tr key={item.id} className="hover:bg-sky-50/40 transition-colors">
                    {/* Book */}
                    <td className="py-3.5 px-4 max-w-xs">
                      <div>
                        <span className="text-[10px] font-mono text-slate-400 whitespace-nowrap">
                          {item.id} • {formatThaiDate(item.createdAt)}
                        </span>
                        <h4 className="font-bold text-slate-900 text-xs mt-0.5 leading-snug">
                          {item.title}
                        </h4>
                        <p className="text-[11px] text-slate-500 truncate">
                          {item.authorPublisher}
                        </p>
                        {item.isbn && (
                          <span className="text-[10px] font-mono text-slate-400 block whitespace-nowrap">
                            ISBN: {item.isbn}
                          </span>
                        )}
                        {item.referenceUrl && (
                          <a
                            href={item.referenceUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-1 text-[10px] text-blue-600 hover:underline mt-0.5 whitespace-nowrap"
                          >
                            <ExternalLink className="w-2.5 h-2.5" /> ลิงก์อ้างอิง
                          </a>
                        )}
                      </div>
                    </td>

                    {/* Department & Teacher */}
                    <td className="py-3.5 px-4 max-w-[200px]">
                      <div className="space-y-1">
                        <span className="inline-block text-[10px] font-semibold bg-blue-50 text-blue-700 px-2 py-0.5 rounded-md border border-blue-100 whitespace-nowrap">
                          {item.department}
                        </span>
                        <div className="flex items-center gap-1 text-slate-800 font-medium">
                          <User className="w-3 h-3 text-slate-400 shrink-0" />
                          <span className="truncate">{item.teacherName}</span>
                        </div>
                        {item.teacherPhone && item.teacherPhone !== '-' && (
                          <p className="text-[10px] text-slate-400 whitespace-nowrap">โทร: {item.teacherPhone}</p>
                        )}
                      </div>
                    </td>

                    {/* Cost & Priority */}
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <div className="space-y-1">
                        <Badge status={item.priority} type="priority" />
                        <div>
                          <p className="text-xs font-bold text-slate-800">
                            {formatCurrency(totalCost)}
                          </p>
                          <p className="text-[10px] text-slate-400">
                            ({item.quantity} เล่ม @ {formatCurrency(item.estimatedPrice)})
                          </p>
                        </div>
                      </div>
                    </td>

                    {/* Reason & Librarian Note */}
                    <td className="py-3.5 px-4 max-w-xs">
                      <div className="space-y-1.5">
                        <p className="text-xs text-slate-700 leading-relaxed bg-slate-50 p-2 rounded-lg border border-slate-100">
                          {item.reason}
                        </p>
                        {item.librarianNotes && (
                          <div className="text-[11px] text-blue-800 bg-sky-50 p-1.5 rounded-lg border border-sky-100 flex items-start gap-1">
                            <MessageSquare className="w-3 h-3 text-blue-600 flex-shrink-0 mt-0.5" />
                            <span>
                              <strong>บันทึกห้องสมุด:</strong> {item.librarianNotes}
                            </span>
                          </div>
                        )}
                      </div>
                    </td>

                    {/* Status Badge */}
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <Badge status={item.status} type="wishlist" />
                    </td>

                    {/* Admin Actions */}
                    {isAdmin && (
                      <td className="py-3.5 px-4 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1">
                          {/* Approve button */}
                          {item.status !== 'APPROVED' && item.status !== 'ORDERED' && (
                            <button
                              onClick={() => handleStatusChange(item.id, 'APPROVED')}
                              title="อนุมัติการสั่งซื้อ"
                              className="p-1.5 rounded-lg bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200 transition-colors"
                            >
                              <Check className="w-3.5 h-3.5" />
                            </button>
                          )}

                          {/* Ordered button */}
                          {item.status === 'APPROVED' && (
                            <button
                              onClick={() => handleStatusChange(item.id, 'ORDERED')}
                              title="เปลี่ยนเป็นสั่งซื้อแล้ว"
                              className="p-1.5 rounded-lg bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200 transition-colors"
                            >
                              <ShoppingBag className="w-3.5 h-3.5" />
                            </button>
                          )}

                          {/* Reject button */}
                          {item.status !== 'REJECTED' && (
                            <button
                              onClick={() => handleStatusChange(item.id, 'REJECTED')}
                              title="ไม่อนุมัติ"
                              className="p-1.5 rounded-lg bg-slate-100 text-slate-500 hover:bg-rose-50 hover:text-rose-700 transition-colors"
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                          )}

                          {/* Add/Edit Librarian note */}
                          <button
                            onClick={() => {
                              setEditingItem(item);
                              setNoteInput(item.librarianNotes || '');
                            }}
                            title="เพิ่ม/แก้ไขข้อความบันทึกห้องสมุด"
                            className="p-1.5 rounded-lg bg-slate-100 text-slate-600 hover:bg-sky-50 hover:text-blue-600 transition-colors"
                          >
                            <MessageSquare className="w-3.5 h-3.5" />
                          </button>

                          {/* Delete */}
                          <button
                            onClick={() => handleDelete(item.id, item.title)}
                            title="ลบรายการ"
                            className="p-1.5 rounded-lg text-slate-400 hover:bg-red-50 hover:text-red-600 transition-colors"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    )}
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Note Editing Modal */}
      {editingItem && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-sky-100 space-y-4">
            <h3 className="text-sm font-bold text-slate-900">
              บันทึกข้อความจากฝ่ายห้องสมุด ({editingItem.title.slice(0, 30)}...)
            </h3>
            <textarea
              rows={3}
              value={noteInput}
              onChange={(e) => setNoteInput(e.target.value)}
              placeholder="เช่น อนุมัติจัดสรรในงบไตรมาส 2, อยู่ระหว่างประสานสำนักพิมพ์..."
              className="w-full p-3 bg-slate-50 border border-sky-200 rounded-xl text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setEditingItem(null)}
                className="px-3 py-1.5 text-xs text-slate-500 hover:bg-slate-100 rounded-lg"
              >
                ยกเลิก
              </button>
              <button
                onClick={handleSaveNote}
                className="px-4 py-1.5 text-xs font-bold bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                บันทึกข้อความ
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
