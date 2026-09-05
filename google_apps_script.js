/**
 * สคริปต์ Google Apps Script สำหรับระบบยืม-คืนห้องสมุด โรงเรียนบรรหารแจ่มใสวิทยา ๓
 * นำโค้ดนี้ไปวางใน Google Sheets:
 * 1. เปิด Google Sheets เปล่าใหม่
 * 2. ไปที่เมนู ส่วนขยาย (Extensions) -> Apps Script
 * 3. ลบโค้ดเดิมทั้งหมดออก แล้ววางโค้ดชุดนี้ลงไป
 * 4. กดปุ่ม "บันทึก" (รูปแผ่นดิสก์)
 * 5. กดปุ่ม "การทำให้ใช้งานได้" (Deploy) -> "การทำให้ใช้งานได้ใหม่" (New deployment)
 * 6. เลือกประเภท: เว็บแอป (Web app)
 * 7. ตั้งค่า:
 *    - ดำเนินการในฐานะ (Execute as): "ฉัน" (Me)
 *    - ผู้ที่มีสิทธิ์เข้าถึง (Who has access): "ทุกคน" (Anyone)
 * 8. กด Deploy แล้วคัดลอก "URL เว็บแอป" นำมาใส่ในหน้า แอดมิน -> ตั้งค่าระบบ
 */

function doPost(e) {
  var lock = LockService.getScriptLock();
  lock.tryLock(10000);

  try {
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var payload = JSON.parse(e.postData.contents);
    var action = payload.action;

    if (action === "sync_all" || action === "new_transaction" || action === "return_transaction") {
      // 1. จัดการชีต 'ประวัติการยืมคืน'
      var trxSheet = ss.getSheetByName("ประวัติการยืมคืน");
      if (!trxSheet) {
        trxSheet = ss.insertSheet("ประวัติการยืมคืน");
        trxSheet.appendRow([
          "รหัสรายการ",
          "สถานะ",
          "รหัสหนังสือ",
          "ชื่อหนังสือ",
          "หมวดหมู่",
          "ประเภทผู้ยืม",
          "ชื่อผู้ยืม",
          "รหัสนักเรียน/กลุ่มสาระ",
          "ระดับชั้น/ห้อง",
          "เบอร์โทรศัพท์",
          "วันที่ยืม",
          "กำหนดยืมถึง",
          "วันที่คืนจริง",
          "หมายเหตุ",
          "อัปเดตล่าสุด"
        ]);
        trxSheet.getRange(1, 1, 1, 15).setBackground("#3b82f6").setFontColor("#ffffff").setFontWeight("bold");
        trxSheet.setFrozenRows(1);
      }

      if (payload.transactions && Array.isArray(payload.transactions)) {
        // อัปเดตข้อมูลการยืมคืนทั้งหมด
        var existingData = trxSheet.getDataRange().getValues();
        var idToRowMap = {};
        for (var i = 1; i < existingData.length; i++) {
          idToRowMap[existingData[i][0]] = i + 1;
        }

        payload.transactions.forEach(function(t) {
          var b = t.borrower || {};
          var rowData = [
            t.id,
            t.status === "ACTIVE" ? "กำลังยืม" : (t.status === "OVERDUE" ? "เกินกำหนด" : "คืนแล้ว"),
            t.bookId,
            t.bookTitle,
            t.bookCategory || "",
            b.type === "STUDENT" ? "นักเรียน" : "ครู/บุคลากร",
            b.name || "",
            b.studentId || b.department || "",
            b.grade ? (b.grade + " ห้อง " + (b.room || "")) : (b.department || ""),
            b.phone || "",
            t.borrowDate + " (" + t.borrowTime + ")",
            t.dueDate + " (" + t.dueTime + ")",
            t.returnDate ? (t.returnDate + " " + (t.returnTime || "")) : "-",
            t.notes || "-",
            new Date().toLocaleString("th-TH")
          ];

          if (idToRowMap[t.id]) {
            // แก้ไขแถวเดิม
            trxSheet.getRange(idToRowMap[t.id], 1, 1, 15).setValues([rowData]);
          } else {
            // เพิ่มแถวใหม่
            trxSheet.appendRow(rowData);
          }
        });
      }

      // 2. จัดการชีต 'รายชื่อหนังสือ'
      if (payload.books && Array.isArray(payload.books)) {
        var bookSheet = ss.getSheetByName("รายชื่อหนังสือ");
        if (!bookSheet) {
          bookSheet = ss.insertSheet("รายชื่อหนังสือ");
          bookSheet.appendRow([
            "รหัสหนังสือ",
            "ชื่อหนังสือ",
            "ผู้แต่ง",
            "หมวดหมู่",
            "ISBN",
            "สถานะ",
            "ปีพิมพ์",
            "ตำแหน่งที่จัดเก็บ",
            "ยืมแล้วทั้งหมด (ครั้ง)"
          ]);
          bookSheet.getRange(1, 1, 1, 9).setBackground("#0284c7").setFontColor("#ffffff").setFontWeight("bold");
          bookSheet.setFrozenRows(1);
        }

        var existingBooks = bookSheet.getDataRange().getValues();
        var bookMap = {};
        for (var j = 1; j < existingBooks.length; j++) {
          bookMap[existingBooks[j][0]] = j + 1;
        }

        payload.books.forEach(function(bk) {
          var bRow = [
            bk.id,
            bk.title,
            bk.author,
            bk.category,
            bk.isbn || "-",
            bk.status === "AVAILABLE" ? "ว่างพร้อมยืม" : "ถูกยืมอยู่",
            bk.publishedYear || "-",
            bk.location || "-",
            bk.totalBorrowedCount || 0
          ];

          if (bookMap[bk.id]) {
            bookSheet.getRange(bookMap[bk.id], 1, 1, 9).setValues([bRow]);
          } else {
            bookSheet.appendRow(bRow);
          }
        });
      }
    }

    return ContentService.createTextOutput(JSON.stringify({
      success: true,
      message: "Synced with Google Sheets successfully"
    })).setMimeType(ContentService.MimeType.JSON);

  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({
      success: false,
      error: error.toString()
    })).setMimeType(ContentService.MimeType.JSON);

  } finally {
    lock.releaseLock();
  }
}

function doGet(e) {
  return ContentService.createTextOutput("Google Sheets Webhook for BJ3 Library is running active.");
}
