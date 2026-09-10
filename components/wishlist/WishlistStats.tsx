'use client';

import React from 'react';
import { BookWishlist } from '@/types';
import { formatCurrency } from '@/lib/utils';
import { StatCard } from '@/components/ui/StatCard';
import { Sparkles, DollarSign, Clock, CheckCircle2, School } from 'lucide-react';

interface WishlistStatsProps {
  wishlists: BookWishlist[];
}

export const WishlistStats: React.FC<WishlistStatsProps> = ({ wishlists }) => {
  const totalRequests = wishlists.length;
  const pendingCount = wishlists.filter((w) => w.status === 'PENDING').length;
  const approvedCount = wishlists.filter((w) => w.status === 'APPROVED' || w.status === 'ORDERED').length;

  const totalBudget = wishlists.reduce((sum, item) => sum + item.estimatedPrice * item.quantity, 0);
  const approvedBudget = wishlists
    .filter((w) => w.status === 'APPROVED' || w.status === 'ORDERED')
    .reduce((sum, item) => sum + item.estimatedPrice * item.quantity, 0);

  // Group by department
  const departmentCounts: Record<string, { count: number; totalCost: number }> = {};
  wishlists.forEach((w) => {
    if (!departmentCounts[w.department]) {
      departmentCounts[w.department] = { count: 0, totalCost: 0 };
    }
    departmentCounts[w.department].count += w.quantity;
    departmentCounts[w.department].totalCost += w.estimatedPrice * w.quantity;
  });

  const departmentList = Object.entries(departmentCounts).sort((a, b) => b[1].totalCost - a[1].totalCost);

  return (
    <div className="space-y-6">
      {/* 4 Overview Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <StatCard
          title="คำขอเสนอซื้อทั้งหมด"
          value={`${totalRequests} รายการ`}
          subtitle="จากคณะครูทุกกลุ่มสาระฯ"
          icon={Sparkles}
          color="blue"
        />

        <StatCard
          title="รอพิจารณางบประมาณ"
          value={`${pendingCount} รายการ`}
          subtitle="ต้องการการตรวจสอบจากห้องสมุด"
          icon={Clock}
          color="amber"
        />

        <StatCard
          title="อนุมัติ & สั่งซื้อแล้ว"
          value={`${approvedCount} รายการ`}
          subtitle="พร้อมดำเนินการจัดซื้อเข้าห้องสมุด"
          icon={CheckCircle2}
          color="emerald"
        />

        <StatCard
          title="งบประมาณเสนอซื้อรวม"
          value={formatCurrency(totalBudget)}
          subtitle={`อนุมัติแล้ว ${formatCurrency(approvedBudget)}`}
          icon={DollarSign}
          color="sky"
        />
      </div>

      {/* Department Breakdown Card */}
      <div className="bg-white rounded-2xl sm:rounded-3xl p-5 sm:p-6 border border-sky-100 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <School className="w-5 h-5 text-blue-600 shrink-0" />
            <h4 className="font-bold text-slate-800 text-xs sm:text-sm">
              สัดส่วนการขอจัดซื้อจำแนกตามกลุ่มสาระการเรียนรู้
            </h4>
          </div>
          <span className="text-xs text-slate-400 whitespace-nowrap">เรียงตามงบประมาณที่ขอ</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4 pt-2">
          {departmentList.length === 0 ? (
            <p className="text-xs text-slate-400 py-4 col-span-2 text-center">ยังไม่มีข้อมูลการขอสั่งซื้อ</p>
          ) : (
            departmentList.map(([dept, data]) => {
              const percentage = totalBudget > 0 ? Math.round((data.totalCost / totalBudget) * 100) : 0;

              return (
                <div key={dept} className="p-3 sm:p-3.5 bg-slate-50 rounded-xl border border-slate-100 space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <span className="text-xs font-bold text-slate-800 line-clamp-1">{dept}</span>
                    <span className="text-xs font-mono font-bold text-blue-600 whitespace-nowrap">
                      {formatCurrency(data.totalCost)}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-slate-500">
                    <span className="whitespace-nowrap">จำนวน {data.count} เล่ม</span>
                    <span className="whitespace-nowrap">{percentage}% ของงบรวม</span>
                  </div>

                  {/* Progress bar */}
                  <div className="w-full h-1.5 bg-slate-200 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-blue-600 rounded-full transition-all duration-500"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
