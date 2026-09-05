-- ==============================================================================
-- สคริปต์สร้างฐานข้อมูล Supabase สำหรับระบบยืม-คืนห้องสมุดหมวดภาษาไทย
-- โรงเรียนบรรหารแจ่มใสวิทยา ๓ (Banhanjamsaiwittaya 3 School Library System)
-- คัดลอกโค้ดทั้งหมดนี้ไปวางในเมนู SQL Editor ของ Supabase แล้วกด RUN ได้ทันที
-- ==============================================================================

-- 1. ตารางหนังสือ (books)
CREATE TABLE IF NOT EXISTS public.books (
    id VARCHAR(50) PRIMARY KEY,
    title TEXT NOT NULL,
    author TEXT NOT NULL,
    category TEXT NOT NULL,
    isbn VARCHAR(50) DEFAULT '',
    cover_url TEXT DEFAULT '',
    status VARCHAR(20) DEFAULT 'AVAILABLE',
    published_year VARCHAR(10) DEFAULT '',
    location TEXT DEFAULT '',
    description TEXT DEFAULT '',
    total_borrowed_count INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. ตารางประวัติการยืม-คืน (transactions)
CREATE TABLE IF NOT EXISTS public.transactions (
    id VARCHAR(50) PRIMARY KEY,
    book_id VARCHAR(50) NOT NULL,
    book_title TEXT NOT NULL,
    book_cover_url TEXT DEFAULT '',
    book_category TEXT DEFAULT '',
    borrower JSONB NOT NULL,
    borrow_date VARCHAR(20) NOT NULL,
    borrow_time VARCHAR(20) NOT NULL,
    due_date VARCHAR(20) NOT NULL,
    due_time VARCHAR(20) NOT NULL,
    return_date VARCHAR(20),
    return_time VARCHAR(20),
    status VARCHAR(20) DEFAULT 'ACTIVE',
    notes TEXT DEFAULT '',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. ตารางรายการเสนอแนะหนังสือ (wishlists)
CREATE TABLE IF NOT EXISTS public.wishlists (
    id VARCHAR(50) PRIMARY KEY,
    book_title TEXT NOT NULL,
    author TEXT DEFAULT '',
    category TEXT DEFAULT '',
    reason TEXT DEFAULT '',
    requester_name TEXT NOT NULL,
    requester_type VARCHAR(20) NOT NULL,
    status VARCHAR(20) DEFAULT 'PENDING',
    priority VARCHAR(20) DEFAULT 'MEDIUM',
    librarian_notes TEXT DEFAULT '',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. ตารางการตั้งค่าระบบ (library_settings)
CREATE TABLE IF NOT EXISTS public.library_settings (
    id INTEGER PRIMARY KEY DEFAULT 1,
    school_name TEXT DEFAULT 'ห้องสมุดหมวดภาษาไทย โรงเรียนบรรหารแจ่มใสวิทยา ๓',
    student_borrow_days INTEGER DEFAULT 5,
    teacher_borrow_days INTEGER DEFAULT 10,
    max_books_per_person INTEGER DEFAULT 3,
    fine_per_day NUMERIC DEFAULT 25,
    admin_username TEXT DEFAULT 'thaibj3',
    admin_passcode TEXT DEFAULT '12123',
    google_sheets_webhook_url TEXT DEFAULT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==============================================================================
-- ตั้งค่านโยบายความปลอดภัย (Row Level Security - RLS) เพื่อให้แอปพลิเคชันเรียกใช้ได้
-- ==============================================================================
ALTER TABLE public.books ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wishlists ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.library_settings ENABLE ROW LEVEL SECURITY;

-- อนุญาตให้อ่านและเขียนผ่าน Anon Key (สำหรับระบบหน้าเว็บห้องสมุด)
DROP POLICY IF EXISTS "Public access for books" ON public.books;
CREATE POLICY "Public access for books" ON public.books FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Public access for transactions" ON public.transactions;
CREATE POLICY "Public access for transactions" ON public.transactions FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Public access for wishlists" ON public.wishlists;
CREATE POLICY "Public access for wishlists" ON public.wishlists FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Public access for settings" ON public.library_settings;
CREATE POLICY "Public access for settings" ON public.library_settings FOR ALL USING (true) WITH CHECK (true);

-- ==============================================================================
-- ข้อมูลเริ่มต้น (Initial Seed Data)
-- ==============================================================================

-- เพิ่มการตั้งค่าเริ่มต้น (ถ้ายังไม่มี)
INSERT INTO public.library_settings (id, school_name, student_borrow_days, teacher_borrow_days, max_books_per_person, fine_per_day, admin_username, admin_passcode)
VALUES (1, 'ห้องสมุดหมวดภาษาไทย โรงเรียนบรรหารแจ่มใสวิทยา ๓', 5, 10, 3, 25, 'thaibj3', '12123')
ON CONFLICT (id) DO NOTHING;

-- เพิ่มหนังสือตัวอย่างหมวดภาษาไทย (ถ้ายังไม่มี)
INSERT INTO public.books (id, title, author, category, isbn, cover_url, status, published_year, location, description, total_borrowed_count)
VALUES
(
    'TH-001',
    'วรรณคดีไทยฉบับวิเคราะห์: ลิลิตพระลอ และ มัทนะพาธา',
    'ศ.ดร. รื่นฤทัย สัจจพันธุ์',
    'วรรณคดีและวรรณกรรมไทย',
    '978-616-1234-01-1',
    'https://images.unsplash.com/photo-1532012164546-f432f2e3edd3?w=600&auto=format&fit=crop&q=80',
    'AVAILABLE',
    '2567',
    'ตู้ภาษาไทย ชั้น 1 (TH-101)',
    'วิเคราะห์คุณค่าทางวรรณศิลป์ ปรัชญา และค่านิยมในวรรณคดีเรื่องเอกของไทยสำหรับนักเรียน ม.ปลาย',
    0
),
(
    'TH-002',
    'บรรทัดฐานภาษาไทย เล่ม ๑-๔: หลักไวยากรณ์และการใช้คำ',
    'ราชบัณฑิตยสภา',
    'หลักภาษาและการใช้ภาษาไทย',
    '978-616-1234-02-8',
    'https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?w=600&auto=format&fit=crop&q=80',
    'AVAILABLE',
    '2566',
    'ตู้ภาษาไทย ชั้น 1 (TH-102)',
    'คู่มือมาตรฐานหลักภาษาไทย วากยสัมพันธ์ และการสะกดคำที่ถูกต้องตามแบบแผน',
    0
),
(
    'TH-003',
    'ศิลปะการประพันธ์ร้อยกรองและฉันทลักษณ์ไทย',
    'อาจารย์ฐะปะนีย์ นาครทรรพ',
    'กวีนิพนธ์ ร้อยกรอง และฉันทลักษณ์',
    '978-616-1234-03-5',
    'https://images.unsplash.com/photo-1512820790803-83ca734da794?w=600&auto=format&fit=crop&q=80',
    'AVAILABLE',
    '2567',
    'ตู้ภาษาไทย ชั้น 2 (TH-201)',
    'หลักการแต่งโคลง ฉันท์ กาพย์ กลอน และร่าย พร้อมตัวอย่างกวีนิพนธ์ชั้นครู',
    0
),
(
    'TH-004',
    'รามเกียรติ์ ฉบับร้อยแก้วสมบูรณ์',
    'พระบาทสมเด็จพระพุทธยอดฟ้าจุฬาโลกมหาราช',
    'วรรณคดีและวรรณกรรมไทย',
    '978-616-1234-04-2',
    'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=600&auto=format&fit=crop&q=80',
    'AVAILABLE',
    '2565',
    'ตู้ภาษาไทย ชั้น 1 (TH-103)',
    'มหากาพย์วรรณคดีเอกของไทย เล่าเรื่องราวสงครามระหว่างพระรามและทศกัณฐ์อย่างละเอียด เข้าใจง่าย',
    0
),
(
    'TH-005',
    'ขุนช้างขุนแผน ฉบับเรียนรู้และวิเคราะห์',
    'สุนทรภู่ และ กวีรัตนโกสินทร์',
    'วรรณคดีและวรรณกรรมไทย',
    '978-616-1234-05-9',
    'https://images.unsplash.com/photo-1515879218367-8466d910aaa4?w=600&auto=format&fit=crop&q=80',
    'AVAILABLE',
    '2566',
    'ตู้ภาษาไทย ชั้น 1 (TH-104)',
    'วรรณคดีพื้นบ้านสะท้อนวิถีชีวิต ความเชื่อ ขนบประเพณีไทย พร้อมเชิงอรรถและบทวิเคราะห์',
    0
)
ON CONFLICT (id) DO NOTHING;
