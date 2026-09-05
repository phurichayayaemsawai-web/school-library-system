import type { Metadata } from "next";
import "./globals.css";
import { LibraryProvider } from "@/context/LibraryContext";
import { Navbar } from "@/components/Navbar";

export const metadata: Metadata = {
  title: "ห้องสมุดหมวดภาษาไทย โรงเรียนบรรหารแจ่มใสวิทยา ๓ | ระบบยืม-คืนหนังสือ",
  description:
    "ระบบยืม-คืนหนังสือออนไลน์ ห้องสมุดหมวดภาษาไทย โรงเรียนบรรหารแจ่มใสวิทยา ๓ บันทึกด้วยรหัสหนังสือ กำหนดระยะเวลายืม และระบบแอดมินสำหรับครู",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="th">
      <body className="flex flex-col min-h-screen bg-slate-50 text-slate-900 selection:bg-sky-500 selection:text-white antialiased">
        <LibraryProvider>
          <Navbar />
          <main className="flex-1 w-full max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-5 sm:py-8">
            {children}
          </main>
        </LibraryProvider>
      </body>
    </html>
  );
}
