'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  BookOpen, 
  ArrowLeftRight, 
  Sparkles, 
  LayoutDashboard, 
  Menu, 
  X, 
  Library, 
  History, 
  Zap, 
  ShieldCheck,
  GraduationCap
} from 'lucide-react';
import { useLibrary } from '@/context/LibraryContext';
import { cn } from '@/lib/utils';

export const Navbar: React.FC = () => {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { books, transactions, wishlists, settings } = useLibrary();

  const activeBorrowsCount = transactions.filter((t) => t.status === 'ACTIVE' || t.status === 'OVERDUE').length;
  const pendingWishlistsCount = wishlists.filter((w) => w.status === 'PENDING').length;

  const navItems = [
    {
      name: 'หน้าแรก',
      href: '/',
      icon: Library,
    },
    {
      name: 'ยืมหนังสือ',
      href: '/quick-borrow',
      icon: Zap,
      badgeColor: 'bg-amber-500 text-white',
    },
    {
      name: 'แคตตาล็อก',
      href: '/books',
      icon: BookOpen,
      badge: books.length > 0 ? books.length : undefined,
      badgeColor: 'bg-blue-100 text-blue-800',
    },
    {
      name: 'รายการยืม-คืน',
      href: '/borrow-return',
      icon: ArrowLeftRight,
      badge: activeBorrowsCount > 0 ? activeBorrowsCount : undefined,
      badgeColor: 'bg-blue-600 text-white',
    },
    {
      name: 'ประวัติ',
      href: '/borrow-return/history',
      icon: History,
    },
    {
      name: 'สถิติ',
      href: '/dashboard',
      icon: LayoutDashboard,
    },
  ];

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-sky-100 shadow-xs">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-2">
          {/* Brand Logo */}
          <Link href="/" className="flex items-center gap-2.5 sm:gap-3 group min-w-0 max-w-[240px] sm:max-w-md lg:max-w-none">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl sm:rounded-2xl bg-gradient-to-tr from-blue-600 via-blue-500 to-sky-400 flex items-center justify-center text-white shadow-md shadow-blue-200/60 group-hover:scale-105 transition-transform shrink-0">
              <BookOpen className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-xs sm:text-sm lg:text-base text-slate-900 tracking-tight truncate whitespace-nowrap">
                  {settings.schoolName || 'ห้องสมุดหมวดภาษาไทย โรงเรียนบรรหารแจ่มใสวิทยา ๓'}
                </span>
              </div>
              <p className="text-[10px] sm:text-[11px] text-sky-700 font-medium leading-tight truncate whitespace-nowrap">
                ระบบบริหารจัดการยืม-คืนหนังสือหมวดภาษาไทย
              </p>
            </div>
          </Link>

          {/* Desktop Nav Links */}
          <nav className="hidden xl:flex items-center gap-1">
            {navItems.map((item) => {
              const isActive = pathname === item.href;
              const Icon = item.icon;

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    'flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-semibold transition-all whitespace-nowrap',
                    isActive
                      ? 'bg-blue-50 text-blue-700 font-bold shadow-2xs border border-blue-200/70'
                      : 'text-slate-600 hover:text-blue-700 hover:bg-sky-50/70'
                  )}
                >
                  <Icon className={cn('w-3.5 h-3.5 shrink-0', isActive ? 'text-blue-600' : 'text-slate-400')} />
                  <span>{item.name}</span>
                  {item.badge !== undefined && (
                    <span
                      className={cn(
                        'text-[10px] font-bold px-1.5 py-0.5 rounded-full leading-none shrink-0',
                        item.badgeColor || 'bg-blue-100 text-blue-800'
                      )}
                    >
                      {item.badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>

          {/* Right Action & Menu */}
          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            <Link
              href="/admin"
              className="inline-flex items-center gap-1 sm:gap-1.5 text-xs font-bold px-2.5 sm:px-3.5 py-2 rounded-xl sm:rounded-2xl bg-gradient-to-r from-blue-600 to-sky-500 hover:from-blue-700 hover:to-sky-600 text-white transition-all shadow-sm shadow-blue-300/40 whitespace-nowrap"
            >
              <ShieldCheck className="w-3.5 h-3.5 text-sky-100 shrink-0" />
              <span>แอดมิน</span>
            </Link>

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

      {/* Mobile & Tablet Drawer */}
      {mobileMenuOpen && (
        <div className="xl:hidden bg-white/98 backdrop-blur-md border-b border-sky-100 px-4 pt-2 pb-4 space-y-1 shadow-lg animate-in slide-in-from-top-2 duration-200">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileMenuOpen(false)}
                className={cn(
                  'flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-medium transition-colors',
                  isActive
                    ? 'bg-blue-50 text-blue-700 font-bold border border-blue-100'
                    : 'text-slate-700 hover:bg-sky-50/60'
                )}
              >
                <div className="flex items-center gap-2.5">
                  <Icon className={cn('w-4 h-4 shrink-0', isActive ? 'text-blue-600' : 'text-slate-400')} />
                  <span className="whitespace-nowrap">{item.name}</span>
                </div>
                {item.badge !== undefined && (
                  <span
                    className={cn(
                      'text-xs font-bold px-2 py-0.5 rounded-full shrink-0',
                      item.badgeColor || 'bg-blue-100 text-blue-800'
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
