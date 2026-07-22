# MuHub Web App — แผนปรับปรุง + ขั้นตอน Deploy
จัดทำโดย เกมิ | 9 ก.ค. 2026

---

## Executive Summary

แอพ MuHub (horoscope-thai) ตอนนี้อยู่ในสภาพ "ใช้งานได้ดีบนเครื่องตัวเอง แต่ยังขึ้น cloud ตรงๆ ไม่ได้" สาเหตุหลักมี 3 จุด: (1) booking.js เรียก `http://localhost:5001` แบบ hardcode ทำให้พอขึ้นเว็บจริง ระบบจองจะพังทันที (2) ฐานข้อมูลลูกค้าเป็น Excel บน `G:\My Drive\` ซึ่ง server บน cloud มองไม่เห็น (3) มี server 2 ตัว (FastAPI port 3737 + Flask port 5001) ที่ต้องรันพร้อมกัน จุดแข็งคือเครื่องคิดดวง (ผูกดวง/ทักษา) มี browser fallback ผ่าน astronomy.browser.min.js อยู่แล้ว แปลว่า **หน้าผูกดวงสามารถ deploy เป็น static site ได้เลยวันนี้** โดยไม่ต้องมี backend

แผนที่แนะนำแบ่งเป็น 4 เฟส: เฟส 1 ขึ้น static site ฟรีบน Cloudflare Pages เพื่อให้มีลิงก์จริงใช้โปรโมทใน Facebook/IG ก่อน (ระบบจองชี้ไป LINE OA ชั่วคราว) → เฟส 2 แก้โค้ด 5 จุดที่ block การขึ้น cloud (API URL, รวม server, ย้าย Excel → SQLite หรือ Google Sheets API, secrets → environment variables, เอา QR พร้อมเพย์จริงออกจาก repo) → เฟส 3 deploy backend ขึ้น Render/Railway พร้อมต่อ LINE webhook ด้วย HTTPS URL จริง → เฟส 4 จดโดเมน + SEO + analytics เพื่อวัดผลว่าโพสต์ไหนพาคนมาผูกดวง/จองจริง

ทางเลือกประหยัดสุดคือใช้ Cloudflare Tunnel จากเครื่องตัวเอง (ฟรี, Excel บน G: ใช้ได้ต่อ) แต่ต้องเปิดเครื่องตลอด — เหมาะเป็น interim ระหว่างเฟส 1→3 ค่าใช้จ่ายเส้นทางแนะนำ: เฟส 1 ฟรี, เฟส 3 ประมาณ $5/เดือน (Railway) หรือฟรีแบบมีข้อจำกัด (Render free tier), โดเมน ~400-500 บาท/ปี

---

## 1. สถาปัตยกรรมปัจจุบัน (ที่ตรวจพบ)

| ส่วน | ไฟล์ | หน้าที่ | สถานะ |
|------|------|---------|-------|
| Frontend | index.html + 13 JS + styles.css | ผูกดวง, จองคิว, ดูดวงฟรี, มูมาร์เก็ต, มูสเปซ | ✅ ทำงานดี, PWA พร้อม (sw.js, manifest) |
| เครื่องคิดดวง | astro-calc.js → `/api/calculate` หรือ astronomy.browser.min.js | คำนวณลัคนา/สมผุส ระบบลาหิรี | ✅ มี fallback ในเบราว์เซอร์ |
| API Server | server.py (FastAPI, port 3737) | เสิร์ฟหน้าเว็บ + ephemeris API จาก CSV 242MB | ⚠️ CSV ใหญ่, รันเฉพาะเครื่องตัวเอง |
| Booking/LINE Server | muhub_excel_server.py (Flask, port 5001) | รับข้อมูลจอง + LINE webhook → เขียนลง Excel | ❌ ผูกกับ `G:\My Drive\` ใช้บน cloud ไม่ได้ |
| ข้อมูลจองฝั่งลูกค้า | booking.js → localStorage | สถานะคิวของลูกค้าแต่ละคน | ⚠️ หายถ้าเปลี่ยนเครื่อง/ล้าง cache |
| Secrets | config.json (gitignored ✅) | LINE token, API key | ⚠️ ต้องย้ายเป็น env vars ตอนขึ้น cloud |

---

## 2. แผนปรับปรุง (เรียงตามความสำคัญ)

### P1 — ต้องแก้ก่อน deploy (Blockers)

1. **API URL hardcode** — `booking.js:779` เรียก `http://localhost:5001/...` ตรงๆ
   → สร้างตัวแปร `API_BASE_URL` ใน state.js/config เดียว แล้วให้ทุกไฟล์ JS อ้างจากที่เดียว
2. **Excel บน G: drive เป็นฐานข้อมูล** — cloud server ไม่มี G: drive
   → ทางเลือก A (แนะนำ): **SQLite** — ไฟล์เดียว ไม่ต้องติดตั้งอะไรเพิ่ม, เขียน script export เป็น Excel ให้คุณดาวน์โหลดได้เหมือนเดิม
   → ทางเลือก B: **Google Sheets API** — คุณยังเปิดดูใน Drive ได้เหมือน Excel เดิม แต่ต้อง setup service account และช้ากว่า
3. **รวม 2 servers เป็น 1** — ย้าย endpoints ของ Flask (บันทึกจอง + LINE webhook) เข้า FastAPI ตัวเดียว → เหลือ 1 process, 1 port, deploy ง่าย
4. **Secrets → Environment Variables** — แก้โค้ดให้อ่าน `os.environ` ก่อน แล้ว fallback เป็น config.json (ใช้ local ได้เหมือนเดิม)
5. **payment_qr.png (QR พร้อมเพย์จริง) อยู่ที่ root และไม่ถูก gitignore** — คนอื่น clone repo ไปจะได้ QR บัญชีคุณ → เพิ่มใน .gitignore + ใช้รูป placeholder แทน (มีสำเนาใน non-github/ อยู่แล้ว)

### P2 — คุณภาพ/ความเร็ว (ทำหลัง deploy ได้)

6. **บีบอัดรูป** — blog_*.png และ mockup รวมกัน ~10MB, แปลงเป็น WebP จะลดเหลือ ~1MB → หน้าเว็บโหลดเร็วขึ้นมากบนมือถือ (ลูกค้าส่วนใหญ่มาจาก FB/IG บนมือถือ)
7. **Ephemeris CSV 242MB** — ถ้า RAM บน cloud จำกัด (Render free = 512MB) ให้แปลงเป็น SQLite แล้ว query จาก disk แทนโหลดเข้า RAM
8. **ล้าง index.html** — 2,883 บรรทัดแต่ครึ่งหนึ่งเป็นบรรทัดว่าง + inline style จำนวนมาก → ย้าย style เข้า styles.css จะแก้ไข/debug ง่ายขึ้น
9. **localStorage bookings** — เพิ่ม endpoint ให้ลูกค้าเช็คสถานะคิวจาก server ด้วย Line ID แทนพึ่ง localStorage อย่างเดียว

### P3 — Growth (ต่อยอดหลังขึ้นเว็บจริง)

10. **Analytics** — ติด Meta Pixel + GA4 เพื่อเชื่อมกับ skill `muhub-conversion-tracking` ที่มีอยู่ → รู้ว่าโพสต์ไหนพาคนมาผูกดวง/กดจองจริง
11. **SEO** — og:image ต้องเป็น absolute URL (ตอนนี้เป็น `logo.png` แชร์ลิงก์ใน FB รูปจะไม่ขึ้น), เพิ่ม sitemap.xml
12. **ความปลอดภัย** — rate limiting ที่ endpoint จอง, validate input ฝั่ง server, ตรวจ LINE signature (มี hmac อยู่แล้ว ✅)

---

## 3. ขั้นตอน Deploy (แนะนำแบบ 4 เฟส)

### เฟส 1 — Static Site ขึ้นก่อน (ฟรี, ทำได้ใน 1 วัน)
เป้าหมาย: มีลิงก์จริง `https://muhub.pages.dev` ใส่ใน bio FB/IG ได้ทันที

1. สร้าง GitHub repo (`.gitignore` ครอบคลุมอยู่แล้ว — เช็คข้อ P1.5 ก่อน push)
2. สมัคร Cloudflare Pages (ฟรี) → Connect repo → Deploy (ไม่ต้อง build config เพราะเป็น static)
3. ปรับ booking tab ชั่วคราว: ถ้าไม่มี backend ให้ปุ่มจองเปิด LINE OA `https://line.me/R/ti/p/@muhub` แทน (โค้ดปุ่ม LINE มีอยู่แล้ว)
4. หน้าผูกดวงทำงานเต็มรูปแบบผ่าน browser fallback — ตรวจว่า `astro-calc.js` fallback ทำงานเมื่อ `/api/calculate` ล้มเหลว

### เฟส 2 — แก้โค้ด Blockers (P1 ทั้ง 5 ข้อ, ~2-3 sessions กับเกมิ)
1. รวม Flask endpoints เข้า server.py (FastAPI)
2. เปลี่ยน Excel → SQLite + script export Excel รายสัปดาห์
3. ทำ `API_BASE_URL` config กลาง
4. env vars สำหรับ LINE token/keys
5. ทดสอบ local ให้ครบก่อนไปเฟส 3

### เฟส 3 — Deploy Backend + LINE Webhook

| ทางเลือก | ค่าใช้จ่าย | ข้อดี | ข้อเสีย |
|----------|-----------|-------|---------|
| **Railway** (แนะนำ) | ~$5/เดือน | ง่ายสุด, RAM พอสำหรับ ephemeris, disk ถาวร | มีค่าใช้จ่าย |
| Render free tier | ฟรี | ฟรี | sleep เมื่อไม่มีคนใช้ (ตื่นช้า ~1 นาที), RAM 512MB ต้องใช้ SQLite ephemeris |
| Cloudflare Tunnel จากเครื่องตัวเอง | ฟรี | Excel บน G: ใช้ได้ต่อ ไม่ต้องแก้อะไรมาก | ต้องเปิดเครื่องตลอด, เน็ตบ้านล่ม = เว็บล่ม |

ขั้นตอน (กรณี Railway/Render):
1. เขียน `Dockerfile` (Python 3.11 + `pip install -r requirements.txt` + แตก ephemeris zip ตอน boot — โค้ดแตก zip มีใน server.py แล้ว)
2. ตั้ง env vars: `LINE_CHANNEL_ACCESS_TOKEN`, `LINE_CHANNEL_SECRET`, `APP_API_TOKEN`
3. Deploy → ได้ URL เช่น `https://muhub.up.railway.app`
4. ไปที่ LINE Developers Console → ตั้ง Webhook URL เป็น `https://<url>/webhook` → กด Verify
5. อัพเดท `API_BASE_URL` ใน frontend → push → Cloudflare Pages rebuild อัตโนมัติ

### เฟส 4 — Domain + วัดผล
1. จดโดเมน เช่น `muhub.co` หรือ `muhub.in.th` (~400-500 บาท/ปี ที่ Cloudflare Registrar/Namecheap)
2. ชี้โดเมนเข้า Cloudflare Pages (HTTPS อัตโนมัติ)
3. ติด Meta Pixel + GA4 → เชื่อมข้อมูลเข้า conversion tracking ของ MuHub
4. อัพเดทลิงก์ใน FB/IG bio, LINE rich menu, และ CTA ท้ายโพสต์ทุกโพสต์

---

## 4. สิ่งที่เกมิช่วยทำต่อได้เลย
- เฟส 1: เตรียม repo + แก้ fallback + สร้างคำแนะนำ push ขึ้น GitHub ทีละคำสั่ง
- เฟส 2: แก้โค้ดทั้ง 5 blockers ให้ พร้อมทดสอบ
- บีบอัดรูปเป็น WebP ให้ทั้งชุด
