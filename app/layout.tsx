import type { Metadata } from 'next';
import './globals.css';
import { LibraryProvider } from '@/context/LibraryContext';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';

export const metadata: Metadata = {
  title: 'ระบบการจัดการยืม-คืนหนังสือสำหรับโรงเรียน | School Library Management System',
  description: 'ระบบยืม-คืนหนังสืออัจฉริยะสำหรับโรงเรียน แยกประเภทนักเรียนและครู พร้อมระบบ Book Procurement Wishlist สำหรับเสนอสั่งซื้อหนังสือใหม่',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="th">
      <body className="flex flex-col min-h-screen bg-slate-50 text-slate-900 selection:bg-indigo-500 selection:text-white antialiased">
        <LibraryProvider>
          <Navbar />
          <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {children}
          </main>
          <Footer />
        </LibraryProvider>
      </body>
    </html>
  );
}
