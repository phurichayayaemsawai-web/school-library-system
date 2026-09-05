import React from "react";
import { cn } from "@/lib/utils";
import { CircleCheck, Clock, TriangleAlert, CircleX, BookmarkCheck, ShoppingBag } from "lucide-react";

interface StatusBadgeProps {
  status: string;
  type?: "book" | "transaction" | "wishlist" | "priority";
  className?: string;
  children?: React.ReactNode;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({
  status,
  type = "book",
  className,
  children,
}) => {
  if (children) {
    return (
      <span
        className={cn(
          "inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-800 border border-slate-200 whitespace-nowrap",
          className
        )}
      >
        {children}
      </span>
    );
  }

  if (type === "book" || status === "AVAILABLE" || status === "BORROWED") {
    if (status === "AVAILABLE") {
      return (
        <span
          className={cn(
            "inline-flex items-center gap-1 px-2.5 py-0.5 sm:py-1 rounded-full text-[11px] sm:text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 shadow-2xs whitespace-nowrap",
            className
          )}
        >
          <CircleCheck className="w-3 h-3 sm:w-3.5 sm:h-3.5 shrink-0" />
          <span>ยืมได้ (Available)</span>
        </span>
      );
    }
    return (
      <span
        className={cn(
          "inline-flex items-center gap-1 px-2.5 py-0.5 sm:py-1 rounded-full text-[11px] sm:text-xs font-bold bg-rose-50 text-rose-700 border border-rose-200 shadow-2xs whitespace-nowrap",
          className
        )}
      >
        <Clock className="w-3 h-3 sm:w-3.5 sm:h-3.5 shrink-0" />
        <span>ถูกยืมอยู่ (Borrowed)</span>
      </span>
    );
  }

  if (type === "transaction") {
    if (status === "ACTIVE") {
      return (
        <span
          className={cn(
            "inline-flex items-center gap-1 px-2.5 py-0.5 sm:py-1 rounded-full text-[11px] sm:text-xs font-bold bg-amber-50 text-amber-700 border border-amber-200 shadow-2xs whitespace-nowrap",
            className
          )}
        >
          <Clock className="w-3 h-3 sm:w-3.5 sm:h-3.5 shrink-0" />
          <span>กำลังยืม</span>
        </span>
      );
    }
    if (status === "RETURNED") {
      return (
        <span
          className={cn(
            "inline-flex items-center gap-1 px-2.5 py-0.5 sm:py-1 rounded-full text-[11px] sm:text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 shadow-2xs whitespace-nowrap",
            className
          )}
        >
          <CircleCheck className="w-3 h-3 sm:w-3.5 sm:h-3.5 shrink-0" />
          <span>คืนแล้ว</span>
        </span>
      );
    }
    if (status === "OVERDUE") {
      return (
        <span
          className={cn(
            "inline-flex items-center gap-1 px-2.5 py-0.5 sm:py-1 rounded-full text-[11px] sm:text-xs font-bold bg-red-50 text-red-700 border border-red-300 shadow-2xs animate-pulse whitespace-nowrap",
            className
          )}
        >
          <TriangleAlert className="w-3 h-3 sm:w-3.5 sm:h-3.5 shrink-0" />
          <span>เกินกำหนดส่ง</span>
        </span>
      );
    }
  }

  if (type === "wishlist") {
    if (status === "PENDING") {
      return (
        <span
          className={cn(
            "inline-flex items-center gap-1 px-2.5 py-0.5 sm:py-1 rounded-full text-[11px] sm:text-xs font-bold bg-amber-50 text-amber-700 border border-amber-200 shadow-2xs whitespace-nowrap",
            className
          )}
        >
          <Clock className="w-3 h-3 sm:w-3.5 sm:h-3.5 shrink-0" />
          <span>รอพิจารณา</span>
        </span>
      );
    }
    if (status === "APPROVED") {
      return (
        <span
          className={cn(
            "inline-flex items-center gap-1 px-2.5 py-0.5 sm:py-1 rounded-full text-[11px] sm:text-xs font-bold bg-blue-50 text-blue-700 border border-blue-200 shadow-2xs whitespace-nowrap",
            className
          )}
        >
          <BookmarkCheck className="w-3 h-3 sm:w-3.5 sm:h-3.5 shrink-0" />
          <span>อนุมัติแล้ว</span>
        </span>
      );
    }
    if (status === "ORDERED") {
      return (
        <span
          className={cn(
            "inline-flex items-center gap-1 px-2.5 py-0.5 sm:py-1 rounded-full text-[11px] sm:text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 shadow-2xs whitespace-nowrap",
            className
          )}
        >
          <ShoppingBag className="w-3 h-3 sm:w-3.5 sm:h-3.5 shrink-0" />
          <span>สั่งซื้อแล้ว</span>
        </span>
      );
    }
    if (status === "REJECTED") {
      return (
        <span
          className={cn(
            "inline-flex items-center gap-1 px-2.5 py-0.5 sm:py-1 rounded-full text-[11px] sm:text-xs font-bold bg-slate-100 text-slate-600 border border-slate-200 shadow-2xs whitespace-nowrap",
            className
          )}
        >
          <CircleX className="w-3 h-3 sm:w-3.5 sm:h-3.5 shrink-0" />
          <span>ไม่อนุมัติ</span>
        </span>
      );
    }
  }

  if (type === "priority") {
    if (status === "URGENT") {
      return (
        <span
          className={cn(
            "inline-flex items-center px-2 py-0.5 rounded text-[11px] font-bold bg-red-100 text-red-800 whitespace-nowrap",
            className
          )}
        >
          ด่วนที่สุด
        </span>
      );
    }
    if (status === "HIGH") {
      return (
        <span
          className={cn(
            "inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold bg-orange-100 text-orange-800 whitespace-nowrap",
            className
          )}
        >
          สำคัญมาก
        </span>
      );
    }
    if (status === "MEDIUM") {
      return (
        <span
          className={cn(
            "inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium bg-blue-100 text-blue-800 whitespace-nowrap",
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
          "inline-flex items-center px-2 py-0.5 rounded text-[11px] font-normal bg-slate-100 text-slate-700 whitespace-nowrap",
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
        "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-800 border border-slate-200 whitespace-nowrap",
        className
      )}
    >
      {status}
    </span>
  );
};
