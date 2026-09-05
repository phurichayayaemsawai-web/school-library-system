import { NextResponse } from "next/server";
import { testSupabaseConnection } from "@/lib/supabase";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { type, url, key } = body;

    if (type === "supabase") {
      if (!url || !key) {
        return NextResponse.json({
          success: false,
          message: "กรุณาระบุทั้ง Supabase URL และ Key",
        });
      }
      const res = await testSupabaseConnection({ url, key });
      return NextResponse.json(res);
    }

    if (type === "google_sheets") {
      if (!url || !url.startsWith("https://script.google.com/")) {
        return NextResponse.json({
          success: false,
          message: "URL ต้องเป็น Google Apps Script Web App ที่ขึ้นต้นด้วย https://script.google.com/",
        });
      }

      try {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 8000);
        const res = await fetch(url, {
          method: "GET",
          signal: controller.signal,
        });
        clearTimeout(timeout);

        if (res.ok) {
          return NextResponse.json({
            success: true,
            message: "เชื่อมต่อกับ Google Apps Script สำเร็จเรียบร้อย!",
          });
        } else {
          return NextResponse.json({
            success: false,
            message: `Google Sheets ตอบกลับสถานะ ${res.status}`,
          });
        }
      } catch (err: any) {
        return NextResponse.json({
          success: false,
          message: err.name === "AbortError" ? "หมดเวลาเชื่อมต่อ Google Sheets Webhook" : `เกิดข้อผิดพลาด: ${err.message}`,
        });
      }
    }

    return NextResponse.json({
      success: false,
      message: "ไม่รองรับประเภทการเชื่อมต่อที่ระบุ",
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, message: `เกิดข้อผิดพลาด: ${err.message}` },
      { status: 500 }
    );
  }
}
