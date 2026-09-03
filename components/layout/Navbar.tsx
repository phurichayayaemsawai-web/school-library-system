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
  ShieldCheck
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
      name: 'ยืมด่วน (นักเรียน)',
      href: '/quick-borrow',
      icon: Zap,
      badgeColor: 'bg-amber-500 text-white',
    },
    {
      name: 'แคตตาล็อก',
      href: '/books',
      icon: BookOpen,
      badge: books.length > 0 ? books.length : undefined,
    },
    {
      name: 'รายการยืม-คืน',
      href: '/borrow-return',
      icon: ArrowLeftRight,
      badge: activeBorrowsCount > 0 ? activeBorrowsCount : undefined,
      badgeColor: 'bg-indigo-600 text-white',
    },
    {
      name: 'ประวัติ',
      href: '/borrow-return/history',
      icon: History,
    },
    {
      name: 'ครูเสนอซื้อ',
      href: '/wishlist',
      icon: Sparkles,
      badge: pendingWishlistsCount > 0 ? pendingWishlistsCount : undefined,
      badgeColor: 'bg-purple-600 text-white',
    },
    {
      name: 'สถิติ',
      href: '/dashboard',
      icon: LayoutDashboard,
    },
  ];

  return (
    <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-slate-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand Logo */}
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-indigo-500 flex items-center justify-center text-white shadow-md shadow-indigo-200 group-hover:scale-105 transition-transform">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-base sm:text-lg text-slate-900 tracking-tight">
                  {settings.schoolName || 'ห้องสมุดโรงเรียน'}
                </span>
                <span className="text-[10px] font-semibold bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded-full border border-indigo-200 hidden sm:inline">
                  v2.0
                </span>
              </div>
              <p className="text-[11px] text-slate-500 leading-none">ระบบยืม-คืนห้องสมุด</p>
            </div>
          </Link>

          {/* Desktop Nav Links */}
          <nav className="hidden lg:flex items-center gap-1">
            {navItems.map((item) => {
              const isActive = pathname === item.href;
              const Icon = item.icon;

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    'flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold transition-all',
                    isActive
                      ? 'bg-indigo-50 text-indigo-700 shadow-sm'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/80'
                  )}
                >
                  <Icon className={cn('w-4 h-4', isActive ? 'text-indigo-600' : 'text-slate-500')} />
                  <span>{item.name}</span>
                  {item.badge !== undefined && (
                    <span
                      className={cn(
                        'text-[10px] font-bold px-1.5 py-0.5 rounded-full leading-none',
                        item.badgeColor || 'bg-slate-200 text-slate-700'
                      )}
                    >
                      {item.badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>

          {/* Admin / Teacher portal trigger */}
          <div className="flex items-center gap-2">
            <Link
              href="/admin"
              className="inline-flex items-center gap-1.5 text-xs font-bold px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white transition-all shadow-sm"
            >
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>แอดมิน / ครู</span>
            </Link>

            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 rounded-xl text-slate-600 hover:bg-slate-100 focus:outline-none"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-white border-b border-slate-200 px-4 pt-2 pb-4 space-y-1 shadow-lg">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileMenuOpen(false)}
                className={cn(
                  'flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-medium',
                  isActive
                    ? 'bg-indigo-50 text-indigo-700 font-semibold'
                    : 'text-slate-600 hover:bg-slate-100'
                )}
              >
                <div className="flex items-center gap-2.5">
                  <Icon className={cn('w-4 h-4', isActive ? 'text-indigo-600' : 'text-slate-500')} />
                  <span>{item.name}</span>
                </div>
                {item.badge !== undefined && (
                  <span
                    className={cn(
                      'text-xs font-bold px-2 py-0.5 rounded-full',
                      item.badgeColor || 'bg-slate-200 text-slate-700'
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
