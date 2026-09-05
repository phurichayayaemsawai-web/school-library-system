import { Book, Transaction, LibrarySettings } from "@/types";

export interface GoogleSheetsSyncPayload {
  action: "sync_all" | "new_transaction" | "return_transaction";
  timestamp: string;
  transactions?: Transaction[];
  books?: Book[];
  settings?: LibrarySettings;
  data?: any;
}

export async function syncToGoogleSheets(
  webhookUrl: string,
  payload: GoogleSheetsSyncPayload
): Promise<{ success: boolean; message: string }> {
  if (!webhookUrl || !webhookUrl.startsWith("http")) {
    return { success: false, message: "URL ของ Google Sheets Webhook ไม่ถูกต้อง" };
  }

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 8000);

    const res = await fetch(webhookUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!res.ok) {
      return {
        success: false,
        message: `Google Sheets ตอบกลับสถานะ ${res.status}`,
      };
    }

    return {
      success: true,
      message: "ซิงค์ข้อมูลกับ Google Sheets สำเร็จเรียบร้อย",
    };
  } catch (err: any) {
    console.warn("Google Sheets Webhook sync error:", err);
    return {
      success: false,
      message: err.name === "AbortError" ? "หมดเวลาเชื่อมต่อ Google Sheets" : err.message,
    };
  }
}
