"use client";
import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Library, Zap, BookOpen, ArrowLeftRight, History, Settings, RefreshCw, ShieldCheck, X, Menu } from "lucide-react";
import { useLibrary } from "@/context/LibraryContext";
import { cn } from "@/lib/utils";

export const Navbar: React.FC = () => {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const {
    books,
    transactions,
    settings,
    isAdmin,
    logoutAdmin,
    syncStatus,
    syncProvider,
    isSyncing,
    syncWithCloud,
  } = useLibrary();

  const validBookIds = new Set(books.map((b) => b.id));
  const activeTrxCount = transactions
    .filter((t) => validBookIds.has(t.bookId))
    .filter((t) => t.status === "ACTIVE" || t.status === "OVERDUE").length;

  const navItems = [
    { name: "หน้าแรก", href: "/", icon: Library, showFor: "all" },
    {
      name: "ยืมหนังสือ",
      href: "/quick-borrow",
      icon: Zap,
      badgeColor: "bg-amber-500 text-white",
      showFor: "userOnly",
    },
    {
      name: "แคตตาล็อก",
      href: "/books",
      icon: BookOpen,
      badge: books.length > 0 ? books.length : undefined,
      badgeColor: "bg-blue-100 text-blue-800",
      showFor: "all",
    },
    {
      name: "รายการยืม-คืน",
      href: "/borrow-return",
      icon: ArrowLeftRight,
      badge: activeTrxCount > 0 ? activeTrxCount : undefined,
      badgeColor: "bg-blue-600 text-white",
      showFor: "adminOnly",
    },
    {
      name: "ประวัติ",
      href: "/borrow-return/history",
      icon: History,
      showFor: "adminOnly",
    },
    {
      name: "ตั้งค่าระบบ",
      href: "/admin",
      icon: Settings,
      showFor: "adminOnly",
    },
  ].filter((item) => {
    if (item.showFor === "adminOnly") return isAdmin;
    if (item.showFor === "userOnly") return !isAdmin;
    return true;
  });

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-sky-100 shadow-xs">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-2">
          {/* Logo & School Name */}
          <Link
            href="/"
            className="flex items-center gap-2.5 sm:gap-3 group min-w-0 max-w-[240px] sm:max-w-md lg:max-w-none"
          >
            <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl sm:rounded-2xl bg-white border border-sky-100 p-1 flex items-center justify-center shadow-md shadow-blue-200/50 group-hover:scale-105 transition-transform shrink-0 overflow-hidden">
              <img
                src="/school-logo.png"
                alt="ตราประจำโรงเรียนบรรหารแจ่มใสวิทยา ๓"
                className="w-full h-full object-contain"
              />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-xs sm:text-sm lg:text-base text-slate-900 tracking-tight truncate whitespace-nowrap">
                  {settings.schoolName || "ห้องสมุดหมวดภาษาไทย โรงเรียนบรรหารแจ่มใสวิทยา ๓"}
                </span>
              </div>
              <p className="text-[10px] sm:text-[11px] text-sky-700 font-medium leading-tight truncate whitespace-nowrap">
                ระบบบริหารจัดการยืม-คืนหนังสือหมวดภาษาไทย
              </p>
            </div>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden xl:flex items-center gap-1">
            {navItems.map((item) => {
              const active = pathname === item.href;
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-semibold transition-all whitespace-nowrap",
                    active
                      ? "bg-blue-50 text-blue-700 font-bold shadow-2xs border border-blue-200/70"
                      : "text-slate-600 hover:text-blue-700 hover:bg-sky-50/70"
                  )}
                >
                  <Icon className={cn("w-3.5 h-3.5 shrink-0", active ? "text-blue-600" : "text-slate-400")} />
                  <span>{item.name}</span>
                  {item.badge !== undefined && (
                    <span
                      className={cn(
                        "text-[10px] font-bold px-1.5 py-0.5 rounded-full leading-none shrink-0",
                        item.badgeColor || "bg-blue-100 text-blue-800"
                      )}
                    >
                      {item.badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>

          {/* Right actions */}
          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            {isAdmin ? (
              <>
                <div
                  className={cn(
                    "hidden md:inline-flex items-center gap-1.5 text-[11px] font-semibold px-2.5 py-1 rounded-full border transition-all whitespace-nowrap shadow-2xs",
                    syncProvider === "supabase"
                      ? "bg-emerald-50 text-emerald-700 border-emerald-200/80"
                      : syncStatus === "synced"
                      ? "bg-blue-50 text-blue-700 border-blue-200"
                      : "bg-amber-50 text-amber-700 border-amber-200"
                  )}
                >
                  {isSyncing ? (
                    <RefreshCw className="w-3 h-3 text-blue-600 animate-spin shrink-0" />
                  ) : syncProvider === "supabase" ? (
                    <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
                  ) : syncStatus === "synced" ? (
                    <span className="w-2 h-2 rounded-full bg-blue-500 shrink-0" />
                  ) : (
                    <span className="w-2 h-2 rounded-full bg-amber-500 shrink-0" />
                  )}
                  <span>
                    {isSyncing
                      ? "กำลังซิงค์..."
                      : syncProvider === "supabase"
                      ? "Supabase คลาวด์"
                      : syncStatus === "synced"
                      ? "ซิงค์ข้อมูลแล้ว"
                      : "ออฟไลน์"}
                  </span>
                </div>

                <button
                  onClick={() => syncWithCloud(true)}
                  disabled={isSyncing}
                  title="กดเพื่อซิงค์ข้อมูลให้ตรงกันทุกอุปกรณ์"
                  className="inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 sm:px-3 py-1.5 sm:py-2 rounded-xl bg-sky-50 hover:bg-sky-100 active:bg-sky-200 text-blue-700 border border-sky-200 transition-colors shadow-2xs whitespace-nowrap"
                >
                  <RefreshCw className={cn("w-3.5 h-3.5 shrink-0", isSyncing && "animate-spin text-blue-600")} />
                  <span>ซิงค์ข้อมูล</span>
                </button>

                <div className="flex items-center gap-1.5">
                  <div className="inline-flex items-center gap-1 sm:gap-1.5 text-xs font-bold px-2.5 sm:px-3.5 py-1.5 sm:py-2 rounded-xl sm:rounded-2xl bg-gradient-to-r from-blue-600 to-sky-500 text-white shadow-sm shadow-blue-300/40 select-none whitespace-nowrap cursor-default">
                    <ShieldCheck className="w-3.5 h-3.5 text-sky-100 shrink-0" />
                    <span>แอดมิน</span>
                  </div>
                  <button
                    onClick={logoutAdmin}
                    className="text-xs font-medium text-slate-500 hover:text-rose-600 px-2 py-1.5 rounded-xl hover:bg-rose-50 transition-colors whitespace-nowrap"
                    title="ออกจากระบบแอดมิน"
                  >
                    ออกจากระบบ
                  </button>
                </div>
              </>
            ) : (
              <Link
                href="/admin"
                className="inline-flex items-center gap-1 sm:gap-1.5 text-xs font-bold px-2.5 sm:px-3.5 py-1.5 sm:py-2 rounded-xl sm:rounded-2xl bg-gradient-to-r from-blue-600 to-sky-500 hover:from-blue-700 hover:to-sky-600 text-white transition-all shadow-sm shadow-blue-300/40 whitespace-nowrap"
              >
                <ShieldCheck className="w-3.5 h-3.5 text-sky-100 shrink-0" />
                <span>เข้าสู่ระบบแอดมิน</span>
              </Link>
            )}

            {/* Mobile Hamburger */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="xl:hidden p-2 rounded-xl text-slate-700 hover:text-blue-700 hover:bg-sky-50 focus:outline-none"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5 sm:w-6 sm:h-6" /> : <Menu className="w-5 h-5 sm:w-6 sm:h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="xl:hidden bg-white/98 backdrop-blur-md border-b border-sky-100 px-4 pt-2 pb-4 space-y-1 shadow-lg animate-in slide-in-from-top-2 duration-200">
          {navItems.map((item) => {
            const active = pathname === item.href;
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileMenuOpen(false)}
                className={cn(
                  "flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-medium transition-colors",
                  active
                    ? "bg-blue-50 text-blue-700 font-bold border border-blue-100"
                    : "text-slate-700 hover:bg-sky-50/60"
                )}
              >
                <div className="flex items-center gap-2.5">
                  <Icon className={cn("w-4 h-4 shrink-0", active ? "text-blue-600" : "text-slate-400")} />
                  <span className="whitespace-nowrap">{item.name}</span>
                </div>
                {item.badge !== undefined && (
                  <span
                    className={cn(
                      "text-xs font-bold px-2 py-0.5 rounded-full shrink-0",
                      item.badgeColor || "bg-blue-100 text-blue-800"
                    )}
                  >
                    {item.badge}
                  </span>
                )}
              </Link>
            );
          })}
        </div>
      )}
    </header>
  );
};
