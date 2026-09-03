import React from 'react';
import { BookStatus, TransactionStatus, WishlistStatus, WishlistPriority } from '@/types';
import { cn } from '@/lib/utils';
import { CheckCircle2, Clock, AlertTriangle, XCircle, ShoppingBag, BookmarkCheck } from 'lucide-react';

interface BadgeProps {
  status?: BookStatus | TransactionStatus | WishlistStatus | WishlistPriority | string;
  type?: 'book' | 'transaction' | 'wishlist' | 'priority' | 'department' | 'custom';
  className?: string;
  children?: React.ReactNode;
}

export const Badge: React.FC<BadgeProps> = ({
  status,
  type = 'book',
  className,
  children,
}) => {
  if (children) {
    return (
      <span
        className={cn(
          'inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-800 border border-slate-200',
          className
        )}
      >
        {children}
      </span>
    );
  }

  // Book Status Badge
  if (type === 'book' || status === 'AVAILABLE' || status === 'BORROWED') {
    if (status === 'AVAILABLE') {
      return (
        <span
          className={cn(
            'inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200',
            className
          )}
        >
          <CheckCircle2 className="w-3.5 h-3.5" />
          ยืมได้ (Available)
        </span>
      );
    }
    return (
      <span
        className={cn(
          'inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200',
          className
        )}
      >
        <Clock className="w-3.5 h-3.5" />
        ถูกยืมอยู่ (Borrowed)
      </span>
    );
  }

  // Transaction Status Badge
  if (type === 'transaction') {
    if (status === 'ACTIVE') {
      return (
        <span
          className={cn(
            'inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200',
            className
          )}
        >
          <Clock className="w-3.5 h-3.5" />
          กำลังยืม
        </span>
      );
    }
    if (status === 'RETURNED') {
      return (
        <span
          className={cn(
            'inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200',
            className
          )}
        >
          <CheckCircle2 className="w-3.5 h-3.5" />
          คืนแล้ว
        </span>
      );
    }
    if (status === 'OVERDUE') {
      return (
        <span
          className={cn(
            'inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-red-50 text-red-700 border border-red-300 animate-pulse',
            className
          )}
        >
          <AlertTriangle className="w-3.5 h-3.5" />
          เกินกำหนดส่ง
        </span>
      );
    }
  }

  // Wishlist Status Badge
  if (type === 'wishlist') {
    if (status === 'PENDING') {
      return (
        <span
          className={cn(
            'inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200',
            className
          )}
        >
          <Clock className="w-3.5 h-3.5" />
          รอพิจารณา
        </span>
      );
    }
    if (status === 'APPROVED') {
      return (
        <span
          className={cn(
            'inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200',
            className
          )}
        >
          <BookmarkCheck className="w-3.5 h-3.5" />
          อนุมัติแล้ว
        </span>
      );
    }
    if (status === 'ORDERED') {
      return (
        <span
          className={cn(
            'inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200',
            className
          )}
        >
          <ShoppingBag className="w-3.5 h-3.5" />
          สั่งซื้อแล้ว
        </span>
      );
    }
    if (status === 'REJECTED') {
      return (
        <span
          className={cn(
            'inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-600 border border-slate-200',
            className
          )}
        >
          <XCircle className="w-3.5 h-3.5" />
          ไม่อนุมัติ
        </span>
      );
    }
  }

  // Priority Badge
  if (type === 'priority') {
    if (status === 'URGENT') {
      return (
        <span
          className={cn(
            'inline-flex items-center px-2 py-0.5 rounded text-xs font-bold bg-red-100 text-red-800',
            className
          )}
        >
          ด่วนที่สุด
        </span>
      );
    }
    if (status === 'HIGH') {
      return (
        <span
          className={cn(
            'inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-orange-100 text-orange-800',
            className
          )}
        >
          สำคัญมาก
        </span>
      );
    }
    if (status === 'MEDIUM') {
      return (
        <span
          className={cn(
            'inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800',
            className
          )}
        >
          ปานกลาง
        </span>
      );
    }
    return (
      <span
        className={cn(
          'inline-flex items-center px-2 py-0.5 rounded text-xs font-normal bg-slate-100 text-slate-700',
          className
        )}
      >
        ทั่วไป
      </span>
    );
  }

  return (
    <span
      className={cn(
        'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-800 border border-slate-200',
        className
      )}
    >
      {status}
    </span>
  );
};
