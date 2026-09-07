# host API (ทางถอย)

เว็บ GOODFOOD อ่านฐาน `Aoringo` สองทาง — ลองต่อ SQL ตรงจากเซิร์ฟเวอร์เว็บก่อน
ต่อไม่ติดค่อยถอยมาเรียก API ตัวนี้ (ดู `lib/aoringoSource.js`)

ที่ร้านมักเปิดไฟร์วอลล์ให้เฉพาะ IP ในไทย เว็บที่ deploy อยู่ต่างประเทศจึงต่อตรงไม่ติดเป็นปกติ
แต่เครื่องออฟฟิศที่รัน API ตัวนี้ต่อ SQL แบบ localhost ได้ แล้วเปิดออกเน็ตผ่าน tunnel ขาออก

## รัน

```bash
cd host-server
npm install
node server.js          # ค่าเริ่มต้น port 14365 (ตั้ง PORT ทับได้)
```

เช็กว่าใช้ได้ไหม:

```bash
curl http://localhost:14365/ping             # API มีชีวิตไหม
curl http://localhost:14365/aoringo/ping     # ต่อฐาน Aoringo ได้ไหม + จับคู่ตารางได้อะไรบ้าง
```

## ตั้งค่าเชื่อมต่อ (environment variable — ห้ามฝังรหัสผ่านลงไฟล์ที่ขึ้น git)

| env | ค่าเริ่มต้น |
|---|---|
| `AORINGO_DB_SERVER` | `localhost\SQLEXPRESS` |
| `AORINGO_DB_PORT` | `1433` (ไม่ใช้เมื่อระบุ named instance) |
| `AORINGO_DB_NAME` | `Aoringo` |
| `AORINGO_DB_USER` / `AORINGO_DB_PASSWORD` | ไม่ตั้ง → ใช้ `QCRD_DB_*` → `DB_*` |
| `PORT` | `14365` |

เปิดออกเน็ตด้วย tunnel ตัวไหนก็ได้ (ngrok / cloudflared) แล้วเอา URL ไปตั้งเป็น
`AORINGO_API_BASE` ที่ฝั่งเว็บ

หลัง `git pull` ต้องรีสตาร์ทก่อน endpoint ใหม่ถึงจะโผล่ — `node` ถือโค้ดเวอร์ชันตอนที่มันเริ่ม
