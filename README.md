# ระบบการจัดการยืม-คืนหนังสือสำหรับโรงเรียน (School Library Management System)

เว็บแอปพลิเคชันระบบบริหารจัดการห้องสมุดโรงเรียนแบบอัตโนมัติ พัฒนาด้วย **Next.js 14+ (App Router)** ร่วมกับ **Tailwind CSS** และ **TypeScript** รองรับการทำงานแบบเต็มรูปแบบ ทั้งการจัดการแคตตาล็อกหนังสือ, ระบบยืม-คืนอัตโนมัติที่แยกประเภทผู้ยืมระหว่าง **นักเรียน** และ **ครู**, ระบบเสนอสั่งซื้อหนังสือใหม่ (**Book Procurement Wishlist**) สำหรับครู พร้อมหน้า Dashboard วิเคราะห์งบประมาณสำหรับฝ่ายห้องสมุด

---

## 🌟 ฟีเจอร์หลักของระบบ (Key Features)

### 1. การจัดการข้อมูลหนังสือ (Book Catalog & Management)
- **ข้อมูลหนังสือละเอียด**: ชื่อหนังสือ, ผู้แต่ง/คณะผู้จัดทำ, หมวดหมู่วิชา, เลข ISBN, ปีที่พิมพ์, ตำแหน่งจัดเก็บในห้องสมุด (ตู้/ชั้นวาง), เรื่องย่อ, และสถิติจำนวนครั้งที่ถูกยืม
- **ภาพปกหนังสือ**: รองรับทั้ง URL รูปภาพภายนอก, การอัปโหลดรูปตัวอย่างจากเครื่อง (Upload Preview), และระบบภาพปกสำรองอัตโนมัติ (Fallback Placeholder)
- **ระบบค้นหาและตัวกรองแบบ Real-time**: ค้นหาตามชื่อหนังสือ, ผู้แต่ง, ISBN หรือรหัสหนังสือ และเลือกกรองตามกลุ่มหมวดหมู่วิชา หรือสถานะความพร้อมของหนังสือ
- **สถานะของหนังสือ**:
  - `AVAILABLE` (ยืมได้): หนังสือพร้อมให้บริการ
  - `BORROWED` (อยู่ระหว่างการยืม): หนังสือมีผู้ยืมไปแล้ว ไม่สามารถทำรายการซ้ำได้

### 2. ระบบการยืม-คืนหนังสืออัจฉริยะ (Smart Borrow-Return System)
- **การเปลี่ยนสถานะอัตโนมัติ (Automatic Status Transition)**:
  - เมื่อทำรายการยืม $\rightarrow$ สถานะหนังสือจะเปลี่ยนเป็น `BORROWED` ทันที และเพิ่มสถิติการยืม
  - เมื่อทำรายการรับคืน $\rightarrow$ สถานะหนังสือจะกลับเป็น `AVAILABLE` ทันที และบันทึกวันที่คืนจริง
- **รองรับประเภทผู้ยืม 2 กลุ่มแยกจากกันอย่างชัดเจน**:
  1. **นักเรียน (Student)**: บันทึกชื่อ-นามสกุล, เลขประจำตัวนักเรียน, ระดับชั้น (ป.1 - ม.6), ห้องเรียน, เบอร์โทรศัพท์ (ระยะเวลายืมมาตรฐาน 7 วัน)
  2. **ครู / บุคลากร (Teacher)**: บันทึกชื่อ-นามสกุล, กลุ่มสาระการเรียนรู้ (8 กลุ่มสาระฯ + งานแนะแนว/บริหาร), เบอร์โทรศัพท์ (ระยะเวลายืมมาตรฐาน 14 วัน)
- **ระบบติดตามการส่งคืนและรายการเกินกำหนด (Overdue Tracker)**:
  - คำนวณวันคงเหลืออัตโนมัติ
  - แจ้งเตือนสถานะ `OVERDUE` พร้อมป้ายเตือนสีแดงกระพริบเมื่อเลยกำหนดส่ง
- **ประวัติการยืม-คืน & การส่งออกข้อมูล**: บันทึกประวัติธุรกรรมครบถ้วน และสามารถ Export เป็นไฟล์ `.csv` ได้ทันที

### 3. ระบบครูเสนอสั่งซื้อหนังสือใหม่ (Book Procurement Wishlist)
- **แบบฟอร์มเสนอสั่งซื้อสำหรับครู**:
  - ชื่อหนังสือ, ผู้แต่ง / สำนักพิมพ์, เลข ISBN หรือลิงก์อ้างอิง
  - กลุ่มสาระการเรียนรู้ที่เกี่ยวข้อง, ระดับความเร่งด่วน (`ด่วนที่สุด`, `สำคัญมาก`, `ปานกลาง`, `ทั่วไป`)
  - เหตุผลความจำเป็นในการสั่งซื้อ (ประกอบการสอน/ทำโครงงาน/ติวโอลิมปิก)
  - ราคาประเมินต่อเล่ม และจำนวนเล่มที่ต้องการ
- **Librarian Procurement Dashboard (ฝ่ายห้องสมุด)**:
  - สรุปภาพรวมงบประมาณที่ขอจัดซื้อทั้งหมด และงบที่ได้รับการอนุมัติแล้ว
  - กราฟแท่งแสดงสัดส่วนความต้องการหนังสือจำแนกตามกลุ่มสาระการเรียนรู้
  - เวิร์กโฟลว์ปรับสถานะ: `รอพิจารณา (PENDING)` $\rightarrow$ `อนุมัติแล้ว (APPROVED)` $\rightarrow$ `สั่งซื้อแล้ว (ORDERED)` หรือ `ไม่อนุมัติ (REJECTED)`
  - ระบบบันทึกข้อความจากบรรณารักษ์ (Librarian Notes)
  - ฟังก์ชันพิมพ์รายงาน (Print) และดาวน์โหลดรายงานสรุปเป็น CSV สำหรับเสนอคณะกรรมการจัดซื้อ

### 4. แดชบอร์ดสถิติห้องสมุด (Library Intelligence Dashboard)
- รายงาน 5 อันดับหนังสือยอดนิยมที่มีการยืมมากที่สุด
- สัดส่วนการกระจายตัวของทรัพยากรหนังสือตามหมวดหมู่วิชา
- สัดส่วนผู้ใช้บริการระหว่างนักเรียนและครู

---

## 🏗️ โครงสร้างโปรเจกต์ (Project Architecture)

```
school-library-system/
├── app/
│   ├── layout.tsx                     # Root Layout + Providers + Navbar + Footer
│   ├── page.tsx                       # หน้าแรก: Hero Portal, หนังสือแนะนำ, สถิติยืมคืนด่วน
│   ├── globals.css                    # Tailwind Directives, Fonts & Styles
│   ├── books/
│   │   ├── page.tsx                   # หน้ารายการหนังสือทั้งหมด พร้อมตัวกรองและโมดอลยืม
│   │   └── new/page.tsx               # หน้าเพิ่มหนังสือใหม่ + Live Cover Preview
│   ├── borrow-return/
│   │   ├── page.tsx                   # หน้าปฏิบัติการยืม-คืน + รายการค้างส่ง
│   │   └── history/page.tsx           # หน้าประวัติการยืม-คืนย้อนหลัง + Export CSV
│   ├── wishlist/
│   │   ├── page.tsx                   # หน้าแบบฟอร์มครูเสนอซื้อหนังสือใหม่
│   │   └── dashboard/page.tsx         # หน้า Dashboard วิเคราะห์จัดซื้อสำหรับฝ่ายห้องสมุด
│   └── dashboard/
│       └── page.tsx                   # หน้าแดชบอร์ดสถิติภาพรวมคลังหนังสือ
├── components/
│   ├── layout/
│   │   ├── Navbar.tsx                 # เมนูหลัก พร้อม Badge แจ้งเตือนแบบ Real-time
│   │   └── Footer.tsx                 # ข้อมูลระบบ, ลิงก์ด่วน และปุ่ม Reset Mock Data
│   ├── books/
│   │   ├── BookCard.tsx               # การ์ดแสดงผลหนังสือพร้อมปุ่มยืมด่วน
│   │   ├── BookModal.tsx              # โมดอลแสดงรายละเอียดหนังสือแบบเจาะลึก
│   │   └── BookFilter.tsx             # แถบค้นหาและตัวกรองหมวดหมู่/สถานะ
│   ├── borrow/
│   │   ├── BorrowModal.tsx            # ฟอร์มบันทึกการยืม (แยกฟิลด์ Student vs Teacher)
│   │   ├── ReturnModal.tsx            # โมดอลบันทึกการรับคืนหนังสือและวันที่คืนจริง
│   │   └── TransactionTable.tsx       # ตารางรายการยืม-คืนพร้อมป้ายสถานะและปุ่มรับคืน
│   ├── wishlist/
│   │   ├── WishlistForm.tsx           # ฟอร์มเสนอสั่งซื้อหนังสือของครู
│   │   ├── WishlistTable.tsx          # ตารางรายการเสนอซื้อและปุ่มเปลี่ยนสถานะ
│   │   └── WishlistStats.tsx          # การ์ดสรุปงบประมาณและสถิติรายกลุ่มสาระ
│   └── ui/
│       ├── StatCard.tsx               # การ์ดแสดงผลตัวเลขสถิติและไอคอน
│       ├── Badge.tsx                  # ป้ายแสดงสถานะสีต่างๆ
│       └── Toast.tsx                  # ระบบแจ้งเตือน Toast notification
├── types/
│   └── index.ts                       # TypeScript Data Types & Enums
├── lib/
│   ├── mockData.ts                    # ข้อมูลจำลองภาษาไทยคุณภาพสูง (พร้อมใช้งานทันที)
│   ├── utils.ts                       # ฟังก์ชันจัดการวันที่ภาษาไทย, แปลงค่าเงิน, คำนวณวันล่าช้า
│   └── storage.ts                     # LocalStorage persistence logic
├── context/
│   └── LibraryContext.tsx             # Context Provider จัดการ State และ State Transitions
├── package.json                       # Dependencies & Scripts
├── tsconfig.json                      # TypeScript Settings
├── tailwind.config.ts                 # Tailwind Theme Configuration
├── postcss.config.mjs                 # PostCSS Configuration
├── next.config.mjs                    # Next.js Configuration
├── vercel.json                        # Vercel Deployment Configuration
└── README.md                          # คู่มือระบบและเอกสารประกอบการใช้งาน
```

---

## 🗄️ โครงสร้างฐานข้อมูล (Database Schema & TypeScript Types)

### 1. Model: หนังสือ (Book)
```typescript
type BookStatus = 'AVAILABLE' | 'BORROWED';

interface Book {
  id: string;                 // รหัสหนังสือ เช่น BK-001
  title: string;              // ชื่อหนังสือ
  author: string;             // ผู้แต่ง / ผู้จัดทำ
  isbn: string;               // รหัส ISBN
  category: string;           // หมวดหมู่วิชา
  coverUrl: string;           // URL ภาพปก
  status: BookStatus;         // AVAILABLE หรือ BORROWED
  publishedYear?: string;     // ปีที่พิมพ์ (พ.ศ.)
  location?: string;          // ตำแหน่งจัดเก็บ เช่น ตู้ A ชั้น 1
  description?: string;       // เรื่องย่อ / รายละเอียด
  totalBorrowedCount: number; // สถิติจำนวนครั้งที่ถูกยืม
  createdAt: string;          // วันที่บันทึกเข้าระบบ
}
```

### 2. Model: ผู้ยืม (Borrower - นักเรียน vs ครู)
```typescript
interface StudentBorrower {
  type: 'STUDENT';
  name: string;               // ชื่อ-นามสกุล นักเรียน
  studentId: string;          // เลขประจำตัวนักเรียน
  grade: string;              // ระดับชั้น เช่น มัธยมศึกษาปีที่ 4 (ม.4)
  room: string;               // ห้องเรียน เช่น 1, 2
  phone: string;              // เบอร์โทรศัพท์
}

interface TeacherBorrower {
  type: 'TEACHER';
  name: string;               // ชื่อ-นามสกุล ครู
  department: string;         // กลุ่มสาระการเรียนรู้
  phone: string;              // เบอร์โทรศัพท์
}

type Borrower = StudentBorrower | TeacherBorrower;
```

### 3. Model: รายการยืม-คืน (BorrowTransaction)
```typescript
type TransactionStatus = 'ACTIVE' | 'RETURNED' | 'OVERDUE';

interface BorrowTransaction {
  id: string;                 // รหัสธุรกรรม เช่น TRX-2024-001
  bookId: string;             // รหัสหนังสือที่ยืม
  bookTitle: string;          // ชื่อหนังสือ
  bookCoverUrl: string;       // ภาพปก
  bookCategory: string;       // หมวดหมู่
  borrower: Borrower;         // ข้อมูลผู้ยืม (Student หรือ Teacher)
  borrowDate: string;         // วันที่ยืม (YYYY-MM-DD)
  dueDate: string;            // กำหนดวันส่งคืน (YYYY-MM-DD)
  returnDate?: string;        // วันที่ส่งคืนจริง (YYYY-MM-DD)
  status: TransactionStatus;  // ACTIVE, RETURNED หรือ OVERDUE
  notes?: string;             // หมายเหตุ / วัตถุประสงค์
}
```

### 4. Model: รายการเสนอซื้อหนังสือ (BookWishlist)
```typescript
type WishlistStatus = 'PENDING' | 'APPROVED' | 'REJECTED' | 'ORDERED';
type WishlistPriority = 'NORMAL' | 'MEDIUM' | 'HIGH' | 'URGENT';

interface BookWishlist {
  id: string;                 // รหัสคำขอ เช่น WL-001
  title: string;              // ชื่อหนังสือที่เสนอซื้อ
  authorPublisher: string;    // ผู้แต่ง / สำนักพิมพ์
  department: string;         // กลุ่มสาระการเรียนรู้
  reason: string;             // เหตุผลและความจำเป็น
  estimatedPrice: number;     // ราคาประเมินต่อเล่ม (บาท)
  quantity: number;           // จำนวนเล่ม
  teacherName: string;        // ชื่อครูผู้เสนอ
  teacherPhone: string;       // เบอร์โทรติดต่อ
  priority: WishlistPriority; // ความเร่งด่วน
  status: WishlistStatus;     // สถานะการพิจารณา
  librarianNotes?: string;    // บันทึกข้อความจากฝ่ายห้องสมุด
  createdAt: string;          // วันที่ส่งคำขอ
  isbn?: string;              // ISBN (ถ้ามี)
  referenceUrl?: string;      // ลิงก์อ้างอิง (ถ้ามี)
}
```

---

## 🔄 เวิร์กโฟลว์การทำงานของระบบ (Workflows)

```
[ผู้ใช้งานเข้าสู่ระบบ]
       │
       ├──> 📚 แคตตาล็อกหนังสือ ──> ค้นหา / กรอง ──> [กดขอยืมหนังสือ]
       │                                                   │
       │                                                   ▼
       │                                     ┌───────────────────────────┐
       │                                     │ เลือกระหว่าง นักเรียน / ครู │
       │                                     └─────────────┬─────────────┘
       │                                                   │
       │                    ┌──────────────────────────────┴──────────────────────────────┐
       │                    ▼                                                             ▼
       │          [1. กรอกข้อมูลนักเรียน]                                       [2. กรอกข้อมูลครู]
       │     (ชื่อ, รหัส นร., ชั้น, ห้อง, เบอร์โทร)                         (ชื่อ, กลุ่มสาระฯ, เบอร์โทร)
       │     (กำหนดคืนอัตโนมัติ: +7 วัน)                                   (กำหนดคืนอัตโนมัติ: +14 วัน)
       │                    │                                                             │
       │                    └──────────────────────────────┬──────────────────────────────┘
       │                                                   ▼
       │                                   [บันทึกรายการยืมหนังสือ]
       │                                                   │
       │               ┌───────────────────────────────────┴───────────────────────────────────┐
       │               ▼                                                                       ▼
       │   หนังสือเปลี่ยนสถานะเป็น                                                  สร้าง BorrowTransaction
       │        "BORROWED"                                                          สถานะเป็น "ACTIVE"
       │               │                                                                       │
       │               └───────────────────────────────────┬───────────────────────────────────┘
       │                                                   ▼
       │                                      [เมื่อผู้ยืมนำหนังสือมาส่งคืน]
       │                                                   │
       │                                                   ▼
       │                                         [กดปุ่ม "รับคืนหนังสือ"]
       │                                                   │
       │               ┌───────────────────────────────────┴───────────────────────────────────┐
       │               ▼                                                                       ▼
       │   หนังสือเปลี่ยนสถานะกลับเป็น                                                อัปเดต Transaction
       │        "AVAILABLE"                                                        สถานะเป็น "RETURNED"
       │
       │
       └──> 💡 ครูเสนอซื้อหนังสือ (Wishlist) ──> กรอกแบบฟอร์ม ──> สถานะ: PENDING (รอพิจารณา)
                                                                        │
                                                                        ▼
                                                       [ฝ่ายห้องสมุดเข้าดู Dashboard]
                                                                        │
                                       ┌────────────────────────────────┴────────────────────────────────┐
                                       ▼                                                                 ▼
                               [อนุมัติงบประมาณ]                                                  [บันทึกข้อความ/ไม่อนุมัติ]
                             (สถานะ: APPROVED/ORDERED)                                            (สถานะ: REJECTED)
```

---

## 🚀 ขั้นตอนการติดตั้งและรันใช้งานในเครื่อง (Local Setup)

### ความต้องการของระบบ (Prerequisites)
- [Node.js](https://nodejs.org/) เวอร์ชัน 18.18.0 หรือสูงกว่า
- ตัวจัดการแพ็กเกจ: `npm`, `yarn`, `pnpm` หรือ `bun`

### 1. ติดตั้ง Dependencies
```bash
npm install
# หรือ
yarn install
# หรือ
pnpm install
```

### 2. รันระบบในโหมด Development
```bash
npm run dev
```
เปิดเบราว์เซอร์แล้วไปที่: [http://localhost:3000](http://localhost:3000)

### 3. ทดสอบการ Build สำหรับ Production
```bash
npm run build
npm run start
```

---

## ☁️ การนำขึ้น GitHub และทำการ Deploy บน Vercel

โปรเจกต์ได้รับการกำหนดค่าไฟล์ `vercel.json` และ Next.js Standalone Build ไว้อย่างสมบูรณ์ พร้อมนำขึ้น Vercel ได้ทันทีโดยไม่ต้องตั้งค่าเพิ่มเติม:

### ขั้นตอนการ Deploy บน Vercel:
1. อัปโหลดโค้ดโปรเจกต์ขึ้น **GitHub Repository**
2. ไปที่ [Vercel Dashboard](https://vercel.com/dashboard) แล้วคลิก **"Add New Project"**
3. เลือก Repository ที่ต้องการจาก GitHub
4. ในส่วน **Framework Preset** เลือก **Next.js** (ระบบจะตรวจพบอัตโนมัติ)
5. คลิก **"Deploy"** ระบบจะทำการ Build และสร้าง URL ใช้งานจริงให้ทันที

---

## 📄 ลิขสิทธิ์และการพัฒนาต่อยอด (License & Extensibility)
- ระบบถูกออกแบบโดยใช้สถาปัตยกรรมแบบแยกส่วน (Modular Component Architecture) สามารถเชื่อมต่อกับฐานข้อมูลจริง เช่น **PostgreSQL / Supabase / Prisma ORM** หรือระบบ Authentication เช่น **NextAuth.js / Supabase Auth** ได้อย่างสะดวก
- พัฒนาขึ้นเพื่อเป็นแหล่งเรียนรู้และระบบต้นแบบการบริหารจัดการห้องสมุดสถานศึกษาในประเทศไทย
