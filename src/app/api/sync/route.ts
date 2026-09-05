import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import { SAMPLE_BOOKS, DEFAULT_SETTINGS } from "@/constants/library";
import {
  getSupabaseConfig,
  fetchSupabaseData,
  saveSupabaseData,
} from "@/lib/supabase";
import { syncToGoogleSheets } from "@/lib/googleSheets";

import os from "os";

const DATA_FILE = path.join(os.tmpdir(), "bj3_library_cache.json");

let memoryStore: any = {
  books: [],
  transactions: [],
  wishlists: [],
  settings: DEFAULT_SETTINGS,
  lastUpdated: new Date().toISOString(),
  version: "1.0",
};

function ensureDataFile() {
  try {
    const dir = path.dirname(DATA_FILE);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    if (!fs.existsSync(DATA_FILE)) {
      fs.writeFileSync(DATA_FILE, JSON.stringify(memoryStore, null, 2), "utf-8");
    }
  } catch (e) {
    // Graceful fallback for read-only environments
  }
}

function readLocalData() {
  ensureDataFile();
  try {
    if (fs.existsSync(DATA_FILE)) {
      const content = fs.readFileSync(DATA_FILE, "utf-8");
      const data = JSON.parse(content);
      if (!Array.isArray(data.books)) {
        data.books = [];
      }
      memoryStore = { ...memoryStore, ...data };
      return data;
    }
  } catch (err) {
    // fallback to memory
  }

  return memoryStore;
}

function writeLocalData(data: any) {
  memoryStore = { ...memoryStore, ...data };
  try {
    ensureDataFile();
    fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2), "utf-8");
  } catch (err) {
    // fallback to memory
  }
}

export async function GET() {
  try {
    const localData = readLocalData();
    const supabaseConfig = getSupabaseConfig({
      url: localData.settings?.supabaseUrl,
      key: localData.settings?.supabaseAnonKey,
    });

    // 1. Try fetching from Supabase if configured
    if (supabaseConfig) {
      try {
        const cloudData = await fetchSupabaseData(supabaseConfig);
        if (cloudData) {
          const books = Array.isArray(cloudData.books) ? cloudData.books : [];

          const combinedData = {
            books,
            transactions: cloudData.transactions || [],
            wishlists: cloudData.wishlists || [],
            settings: cloudData.settings ? { ...localData.settings, ...cloudData.settings } : localData.settings,
            lastUpdated: new Date().toISOString(),
            provider: "supabase",
          };

          // Cache locally
          writeLocalData(combinedData);

          return NextResponse.json({
            success: true,
            provider: "supabase",
            data: combinedData,
            serverTime: new Date().toISOString(),
          });
        }
      } catch (sbErr: any) {
        console.warn("Supabase fetch failed, falling back to local storage:", sbErr.message);
      }
    }

    // 2. Fallback to local storage
    return NextResponse.json({
      success: true,
      provider: "local",
      data: localData,
      serverTime: new Date().toISOString(),
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const currentData = readLocalData();

    const updatedData = {
      ...currentData,
      books: body.books !== undefined ? body.books : currentData.books,
      transactions: body.transactions !== undefined ? body.transactions : currentData.transactions,
      wishlists: body.wishlists !== undefined ? body.wishlists : currentData.wishlists,
      settings: body.settings !== undefined ? body.settings : currentData.settings,
      lastUpdated: new Date().toISOString(),
    };

    // Save to local file cache
    writeLocalData(updatedData);

    const supabaseConfig = getSupabaseConfig({
      url: updatedData.settings?.supabaseUrl,
      key: updatedData.settings?.supabaseAnonKey,
    });

    let syncProvider = "local";

    // 1. Save to Supabase if configured
    if (supabaseConfig) {
      try {
        await saveSupabaseData(
          {
            books: updatedData.books,
            transactions: updatedData.transactions,
            wishlists: updatedData.wishlists,
            settings: updatedData.settings,
          },
          supabaseConfig
        );
        syncProvider = "supabase";
      } catch (sbErr: any) {
        console.warn("Failed saving to Supabase:", sbErr.message);
      }
    }

    // 2. Sync to Google Sheets if Webhook URL is configured
    const gSheetUrl =
      updatedData.settings?.googleSheetsWebhookUrl ||
      process.env.GOOGLE_SHEETS_WEBHOOK_URL;

    if (gSheetUrl) {
      // Fire-and-forget or fast sync without blocking client response
      syncToGoogleSheets(gSheetUrl, {
        action: "sync_all",
        timestamp: new Date().toISOString(),
        transactions: updatedData.transactions,
        books: updatedData.books,
        settings: updatedData.settings,
      }).catch((gsErr) => {
        console.warn("Google Sheets async sync warning:", gsErr);
      });
    }

    return NextResponse.json({
      success: true,
      provider: syncProvider,
      data: updatedData,
      serverTime: new Date().toISOString(),
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message },
      { status: 500 }
    );
  }
}
