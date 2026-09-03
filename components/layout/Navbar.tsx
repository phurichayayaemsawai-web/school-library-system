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
  Heart
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
      badgeColor: 'bg-pink-500 text-white',
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
      badgeColor: 'bg-pink-600 text-white',
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
      badgeColor: 'bg-rose-500 text-white',
    },
    {
      name: 'สถิติ',
      href: '/dashboard',
      icon: LayoutDashboard,
    },
  ];

  return (
    <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-pink-100 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand Logo */}
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-pink-500 to-rose-400 flex items-center justify-center text-white shadow-md shadow-pink-200 group-hover:scale-105 transition-transform">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-sm sm:text-base text-slate-900 tracking-tight">
                  {settings.schoolName || 'ห้องสมุดหมวดภาษาไทย โรงเรียนบรรหารแจ่มใสวิทยา ๓'}
                </span>
                <Heart className="w-3.5 h-3.5 text-pink-500 fill-pink-500 hidden sm:inline animate-pulse" />
              </div>
              <p className="text-[11px] text-pink-700 font-medium leading-none">
                ระบบการจัดการการยืมคืนหนังสือของห้องสมุดหมวดภาษาไทย
              </p>
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
                    'flex items-center gap-1.5 px-3 py-2 rounded-2xl text-xs font-semibold transition-all',
                    isActive
                      ? 'bg-pink-100 text-pink-800 font-bold shadow-xs'
                      : 'text-slate-600 hover:text-pink-700 hover:bg-pink-50/80'
                  )}
                >
                  <Icon className={cn('w-4 h-4', isActive ? 'text-pink-600' : 'text-slate-400')} />
                  <span>{item.name}</span>
                  {item.badge !== undefined && (
                    <span
                      className={cn(
                        'text-[10px] font-bold px-1.5 py-0.5 rounded-full leading-none',
                        item.badgeColor || 'bg-pink-200 text-pink-800'
                      )}
                    >
                      {item.badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>

          {/* Admin Button */}
          <div className="flex items-center gap-2">
            <Link
              href="/admin"
              className="inline-flex items-center gap-1.5 text-xs font-bold px-3.5 py-2 rounded-2xl bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 text-white transition-all shadow-sm shadow-pink-200"
            >
              <ShieldCheck className="w-3.5 h-3.5 text-pink-100" />
              <span>แอดมิน / ครู</span>
            </Link>

            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 rounded-2xl text-pink-700 hover:bg-pink-50 focus:outline-none"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-white/95 backdrop-blur-md border-b border-pink-100 px-4 pt-2 pb-4 space-y-1 shadow-lg">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileMenuOpen(false)}
                className={cn(
                  'flex items-center justify-between px-3 py-2.5 rounded-2xl text-sm font-medium',
                  isActive
                    ? 'bg-pink-100 text-pink-800 font-bold'
                    : 'text-slate-700 hover:bg-pink-50'
                )}
              >
                <div className="flex items-center gap-2.5">
                  <Icon className={cn('w-4 h-4', isActive ? 'text-pink-600' : 'text-slate-400')} />
                  <span>{item.name}</span>
                </div>
                {item.badge !== undefined && (
                  <span
                    className={cn(
                      'text-xs font-bold px-2 py-0.5 rounded-full',
                      item.badgeColor || 'bg-pink-200 text-pink-800'
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
