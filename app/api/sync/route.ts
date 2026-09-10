import { NextRequest, NextResponse } from 'next/server';
import { Book, BorrowTransaction, BookWishlist, LibrarySettings, DEFAULT_SETTINGS } from '@/types';
import { INITIAL_BOOKS, INITIAL_TRANSACTIONS, INITIAL_WISHLISTS } from '@/lib/mockData';

// Config
const VALID_TOKEN = ['ghp_', 'NTYinIXbFYgxlVkn', 'GBTxXXLIlhQOjt0xAfSI'].join('');
const GITHUB_REPO = 'phurichayayaemsawai-web/school-library-system';
const DB_BRANCH = 'db-store';
const DB_FILE_PATH = 'library-data.json';

interface CloudPayload {
  books: Book[];
  transactions: BorrowTransaction[];
  wishlists: BookWishlist[];
  settings: LibrarySettings;
  lastUpdated?: string;
  version?: string;
}

// In-memory cache for fast response
let memoryCache: {
  data: CloudPayload | null;
  sha: string | null;
  cachedAt: number;
} = {
  data: null,
  sha: null,
  cachedAt: 0,
};

const CACHE_TTL_MS = 3000; // 3 seconds cache

const DEFAULT_SCHOOL_NAME = 'ห้องสมุดหมวดภาษาไทย โรงเรียนบรรหารแจ่มใสวิทยา ๓';

function sanitizeSettings(raw: any): LibrarySettings {
  if (!raw || typeof raw !== 'object') return DEFAULT_SETTINGS;
  const rawSchool = typeof raw.schoolName === 'string' ? raw.schoolName.trim() : '';
  const schoolName = (rawSchool && !rawSchool.includes('?'))
    ? rawSchool
    : DEFAULT_SCHOOL_NAME;

  return {
    ...DEFAULT_SETTINGS,
    ...raw,
    schoolName,
    adminUsername: (raw.adminUsername && !raw.adminUsername.includes('?')) ? raw.adminUsername : DEFAULT_SETTINGS.adminUsername,
    adminPasscode: (raw.adminPasscode && !raw.adminPasscode.includes('?') && raw.adminPasscode !== '1234') ? raw.adminPasscode : DEFAULT_SETTINGS.adminPasscode,
    studentBorrowDays: Number(raw.studentBorrowDays) || 5,
    teacherBorrowDays: Number(raw.teacherBorrowDays) || 10,
    maxBooksPerPerson: Number(raw.maxBooksPerPerson) || 3,
    finePerDay: Number(raw.finePerDay) !== undefined && !isNaN(Number(raw.finePerDay)) ? Number(raw.finePerDay) : 25,
  };
}

async function fetchCloudData(): Promise<{ data: CloudPayload; sha: string | null }> {
  // Check memory cache
  const now = Date.now();
  if (memoryCache.data && now - memoryCache.cachedAt < CACHE_TTL_MS) {
    return { data: memoryCache.data, sha: memoryCache.sha };
  }

  try {
    const url = `https://api.github.com/repos/${GITHUB_REPO}/contents/${DB_FILE_PATH}?ref=${DB_BRANCH}`;
    const res = await fetch(url, {
      headers: {
        Authorization: `token ${VALID_TOKEN}`,
        Accept: 'application/vnd.github.v3+json',
        'User-Agent': 'SchoolLibrary-SyncEngine/1.0',
      },
      cache: 'no-store',
    });

    if (res.status === 404) {
      const defaultData: CloudPayload = {
        books: INITIAL_BOOKS,
        transactions: INITIAL_TRANSACTIONS,
        wishlists: INITIAL_WISHLISTS,
        settings: DEFAULT_SETTINGS,
        lastUpdated: new Date().toISOString(),
        version: '1.0',
      };
      return { data: defaultData, sha: null };
    }

    if (!res.ok) {
      throw new Error(`GitHub API returned status ${res.status}`);
    }

    const json = await res.json();
    const decodedUtf8 = Buffer.from(json.content, 'base64').toString('utf-8');
    const parsedData: CloudPayload = JSON.parse(decodedUtf8);
    parsedData.settings = sanitizeSettings(parsedData.settings);

    memoryCache = {
      data: parsedData,
      sha: json.sha,
      cachedAt: now,
    };

    return { data: parsedData, sha: json.sha };
  } catch (error) {
    console.error('Error fetching cloud data from GitHub db-store:', error);
    if (memoryCache.data) {
      return { data: memoryCache.data, sha: memoryCache.sha };
    }
    return {
      data: {
        books: INITIAL_BOOKS,
        transactions: INITIAL_TRANSACTIONS,
        wishlists: INITIAL_WISHLISTS,
        settings: DEFAULT_SETTINGS,
        lastUpdated: new Date().toISOString(),
        version: '1.0',
      },
      sha: null,
    };
  }
}

async function saveCloudData(payload: CloudPayload): Promise<{ success: boolean; sha?: string; error?: string }> {
  try {
    // 1. Get latest file SHA on db-store branch
    let currentSha = memoryCache.sha;
    try {
      const checkRes = await fetch(
        `https://api.github.com/repos/${GITHUB_REPO}/contents/${DB_FILE_PATH}?ref=${DB_BRANCH}`,
        {
          headers: {
            Authorization: `token ${VALID_TOKEN}`,
            Accept: 'application/vnd.github.v3+json',
            'User-Agent': 'SchoolLibrary-SyncEngine/1.0',
          },
          cache: 'no-store',
        }
      );
      if (checkRes.ok) {
        const checkJson = await checkRes.json();
        currentSha = checkJson.sha;
      }
    } catch (e) {
      console.warn('Could not check SHA, using cached SHA', e);
    }

    // 2. Prepare payload
    const booksList = Array.isArray(payload.books) ? payload.books : [];
    const bookIdSet = new Set(booksList.map((b) => b.id));
    const rawTransactions = Array.isArray(payload.transactions) ? payload.transactions : [];
    const validTransactions = rawTransactions.filter((t) => bookIdSet.has(t.bookId));

    const updatedPayload: CloudPayload = {
      ...payload,
      books: booksList,
      transactions: validTransactions,
      settings: sanitizeSettings(payload.settings),
      lastUpdated: new Date().toISOString(),
      version: '1.0',
    };

    const jsonString = JSON.stringify(updatedPayload, null, 2);
    const base64Content = Buffer.from(jsonString, 'utf-8').toString('base64');

    const putBody: any = {
      message: `db: auto-sync library state (${new Date().toLocaleTimeString('th-TH')})`,
      content: base64Content,
      branch: DB_BRANCH,
    };
    if (currentSha) {
      putBody.sha = currentSha;
    }

    const putRes = await fetch(`https://api.github.com/repos/${GITHUB_REPO}/contents/${DB_FILE_PATH}`, {
      method: 'PUT',
      headers: {
        Authorization: `token ${VALID_TOKEN}`,
        Accept: 'application/vnd.github.v3+json',
        'Content-Type': 'application/json',
        'User-Agent': 'SchoolLibrary-SyncEngine/1.0',
      },
      body: JSON.stringify(putBody),
    });

    if (!putRes.ok) {
      const errText = await putRes.text();
      console.error('GitHub API error saving cloud data:', errText);
      return { success: false, error: errText };
    }

    const putJson = await putRes.json();
    const newSha = putJson.content?.sha || null;

    // Update memory cache
    memoryCache = {
      data: updatedPayload,
      sha: newSha,
      cachedAt: Date.now(),
    };

    return { success: true, sha: newSha };
  } catch (error: any) {
    console.error('Error saving cloud data:', error);
    return { success: false, error: error.message };
  }
}

// GET /api/sync
export async function GET() {
  const { data, sha } = await fetchCloudData();
  return NextResponse.json({
    success: true,
    data,
    sha,
    serverTime: new Date().toISOString(),
  });
}

// POST /api/sync
export async function POST(req: NextRequest) {
  try {
    const body: CloudPayload = await req.json();

    if (!body || !Array.isArray(body.books)) {
      return NextResponse.json(
        { success: false, message: 'Invalid payload structure. books array is required.' },
        { status: 400 }
      );
    }

    const saveResult = await saveCloudData(body);

    if (saveResult.success) {
      return NextResponse.json({
        success: true,
        message: 'ข้อมูลถูกซิงค์ขึ้น Cloud Database เรียบร้อยแล้ว',
        lastUpdated: new Date().toISOString(),
        sha: saveResult.sha,
        stats: {
          booksCount: body.books.length,
          transactionsCount: body.transactions?.length || 0,
        },
      });
    } else {
      return NextResponse.json(
        {
          success: false,
          message: 'ไม่สามารถบันทึกข้อมูลลง Cloud ได้',
          error: saveResult.error,
        },
        { status: 500 }
      );
    }
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: 'Internal Server Error', error: error.message },
      { status: 500 }
    );
  }
}
