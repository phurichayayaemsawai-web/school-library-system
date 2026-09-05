import { Book, Transaction, Wishlist, LibrarySettings } from "@/types";

export interface SupabaseConfig {
  url: string;
  key: string;
}

export function getSupabaseConfig(override?: { url?: string; key?: string }): SupabaseConfig | null {
  const url =
    override?.url ||
    process.env.SUPABASE_URL ||
    process.env.NEXT_PUBLIC_SUPABASE_URL ||
    "";
  const key =
    override?.key ||
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    process.env.SUPABASE_ANON_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
    "";

  if (!url || !key) return null;

  return {
    url: url.replace(/\/+$/, ""),
    key: key.trim(),
  };
}

// Convert Book object to Supabase row
export function bookToRow(b: Book) {
  return {
    id: b.id,
    title: b.title,
    author: b.author,
    category: b.category,
    isbn: b.isbn || "",
    cover_url: b.coverUrl || "",
    status: b.status || "AVAILABLE",
    published_year: b.publishedYear || "",
    location: b.location || "",
    description: b.description || "",
    total_borrowed_count: b.totalBorrowedCount || 0,
    created_at: b.createdAt || new Date().toISOString(),
  };
}

// Convert Supabase row to Book object
export function rowToBook(r: any): Book {
  return {
    id: r.id,
    title: r.title,
    author: r.author,
    category: r.category,
    isbn: r.isbn || "",
    coverUrl: r.cover_url || "",
    status: r.status || "AVAILABLE",
    publishedYear: r.published_year || "",
    location: r.location || "",
    description: r.description || "",
    totalBorrowedCount: Number(r.total_borrowed_count) || 0,
    createdAt: r.created_at || new Date().toISOString(),
  };
}

// Convert Transaction object to Supabase row
export function transactionToRow(t: Transaction) {
  return {
    id: t.id,
    book_id: t.bookId,
    book_title: t.bookTitle,
    book_cover_url: t.bookCoverUrl || "",
    book_category: t.bookCategory || "",
    borrower: t.borrower,
    borrow_date: t.borrowDate,
    borrow_time: t.borrowTime,
    due_date: t.dueDate,
    due_time: t.dueTime,
    return_date: t.returnDate || null,
    return_time: t.returnTime || null,
    status: t.status,
    notes: t.notes || "",
  };
}

// Convert Supabase row to Transaction object
export function rowToTransaction(r: any): Transaction {
  return {
    id: r.id,
    bookId: r.book_id,
    bookTitle: r.book_title,
    bookCoverUrl: r.book_cover_url || "",
    bookCategory: r.book_category || "",
    borrower: typeof r.borrower === "string" ? JSON.parse(r.borrower) : r.borrower,
    borrowDate: r.borrow_date,
    borrowTime: r.borrow_time,
    dueDate: r.due_date,
    dueTime: r.due_time,
    returnDate: r.return_date || undefined,
    returnTime: r.return_time || undefined,
    status: r.status,
    notes: r.notes || undefined,
  };
}

// Convert Wishlist object to Supabase row
export function wishlistToRow(w: Wishlist) {
  return {
    id: w.id,
    book_title: w.bookTitle,
    author: w.author || "",
    category: w.category || "",
    reason: w.reason || "",
    requester_name: w.requesterName,
    requester_type: w.requesterType,
    status: w.status,
    priority: w.priority || "MEDIUM",
    librarian_notes: w.librarianNotes || "",
    created_at: w.createdAt || new Date().toISOString(),
  };
}

// Convert Supabase row to Wishlist object
export function rowToWishlist(r: any): Wishlist {
  return {
    id: r.id,
    bookTitle: r.book_title,
    author: r.author || undefined,
    category: r.category || undefined,
    reason: r.reason || undefined,
    requesterName: r.requester_name,
    requesterType: r.requester_type,
    status: r.status,
    priority: r.priority || "MEDIUM",
    librarianNotes: r.librarian_notes || undefined,
    createdAt: r.created_at || new Date().toISOString(),
  };
}

// Convert Settings to row
export function settingsToRow(s: LibrarySettings) {
  return {
    id: 1,
    school_name: s.schoolName,
    student_borrow_days: s.studentBorrowDays,
    teacher_borrow_days: s.teacherBorrowDays,
    max_books_per_person: s.maxBooksPerPerson,
    fine_per_day: s.finePerDay,
    admin_username: s.adminUsername,
    admin_passcode: s.adminPasscode,
    google_sheets_webhook_url: s.googleSheetsWebhookUrl || null,
    updated_at: new Date().toISOString(),
  };
}

// Convert row to Settings
export function rowToSettings(r: any): Partial<LibrarySettings> {
  return {
    schoolName: r.school_name,
    studentBorrowDays: Number(r.student_borrow_days) || 5,
    teacherBorrowDays: Number(r.teacher_borrow_days) || 10,
    maxBooksPerPerson: Number(r.max_books_per_person) || 3,
    finePerDay: Number(r.fine_per_day) || 25,
    adminUsername: r.admin_username || "thaibj3",
    adminPasscode: r.admin_passcode || "12123",
    googleSheetsWebhookUrl: r.google_sheets_webhook_url || undefined,
  };
}

// Helper: HTTP Request to Supabase REST API
async function supabaseFetch(
  config: SupabaseConfig,
  endpoint: string,
  method: string = "GET",
  body?: any,
  prefer?: string
) {
  const headers: Record<string, string> = {
    apikey: config.key,
    Authorization: `Bearer ${config.key}`,
    "Content-Type": "application/json",
  };

  if (prefer) {
    headers["Prefer"] = prefer;
  }

  const url = `${config.url}/rest/v1/${endpoint}`;
  const res = await fetch(url, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
    cache: "no-store",
  });

  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(`Supabase error [${res.status}]: ${errorText}`);
  }

  if (res.status === 204) return null;
  return await res.json();
}

// Test Connection
export async function testSupabaseConnection(config?: { url?: string; key?: string }): Promise<{ success: boolean; message: string }> {
  const cfg = getSupabaseConfig(config);
  if (!cfg) {
    return { success: false, message: "กรุณาระบุ Supabase URL และ Key ให้ครบถ้วน" };
  }

  try {
    // Try to query books table with limit 1
    await supabaseFetch(cfg, "books?select=id&limit=1");
    return { success: true, message: "เชื่อมต่อกับฐานข้อมูล Supabase สำเร็จเรียบร้อย!" };
  } catch (err: any) {
    return {
      success: false,
      message: `ไม่สามารถเชื่อมต่อได้: ${err.message}`,
    };
  }
}

// Fetch all data from Supabase
export async function fetchSupabaseData(configOverride?: { url?: string; key?: string }) {
  const cfg = getSupabaseConfig(configOverride);
  if (!cfg) return null;

  try {
    const [booksRes, trxRes, wishRes, setRes] = await Promise.all([
      supabaseFetch(cfg, "books?select=*&order=created_at.desc"),
      supabaseFetch(cfg, "transactions?select=*&order=created_at.desc"),
      supabaseFetch(cfg, "wishlists?select=*&order=created_at.desc"),
      supabaseFetch(cfg, "library_settings?select=*&limit=1"),
    ]);

    const books: Book[] = Array.isArray(booksRes) ? booksRes.map(rowToBook) : [];
    const transactions: Transaction[] = Array.isArray(trxRes) ? trxRes.map(rowToTransaction) : [];
    const wishlists: Wishlist[] = Array.isArray(wishRes) ? wishRes.map(rowToWishlist) : [];
    const settings = Array.isArray(setRes) && setRes.length > 0 ? rowToSettings(setRes[0]) : null;

    return {
      books,
      transactions,
      wishlists,
      settings,
    };
  } catch (err) {
    console.error("Supabase fetch failed:", err);
    throw err;
  }
}

// Save or Upsert data into Supabase
export async function saveSupabaseData(
  data: {
    books?: Book[];
    transactions?: Transaction[];
    wishlists?: Wishlist[];
    settings?: LibrarySettings;
  },
  configOverride?: { url?: string; key?: string }
) {
  const cfg = getSupabaseConfig(configOverride);
  if (!cfg) return null;

  const tasks: Promise<any>[] = [];

  // Upsert books
  if (data.books && data.books.length > 0) {
    const rows = data.books.map(bookToRow);
    tasks.push(
      supabaseFetch(cfg, "books", "POST", rows, "resolution=merge-duplicates")
    );
  }

  // Upsert transactions
  if (data.transactions && data.transactions.length > 0) {
    const rows = data.transactions.map(transactionToRow);
    tasks.push(
      supabaseFetch(cfg, "transactions", "POST", rows, "resolution=merge-duplicates")
    );
  }

  // Upsert wishlists
  if (data.wishlists && data.wishlists.length > 0) {
    const rows = data.wishlists.map(wishlistToRow);
    tasks.push(
      supabaseFetch(cfg, "wishlists", "POST", rows, "resolution=merge-duplicates")
    );
  }

  // Upsert settings
  if (data.settings) {
    const row = settingsToRow(data.settings);
    tasks.push(
      supabaseFetch(cfg, "library_settings", "POST", [row], "resolution=merge-duplicates")
    );
  }

  await Promise.all(tasks);
  return true;
}
