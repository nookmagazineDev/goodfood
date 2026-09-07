// ════════════════════════════════════════════════════════════
//  GOODFOOD host API — ตัวกลางระหว่างเว็บกับ SQL Server ฐาน "Aoringo"
//
//  รันบนเครื่องที่มองเห็น SQL Server ได้ (ปกติคือเครื่องออฟฟิศ) แล้วเปิดออกเน็ตผ่าน tunnel
//  เว็บบน Vercel จะใช้ทางนี้เมื่อ "ต่อ SQL ตรง" ไปไม่ถึง (ที่ร้านเปิดไฟร์วอลล์ให้เฉพาะ IP ในไทย)
//
//  endpoint (อ่านอย่างเดียว — เมนูนี้ไม่มีฝั่งเขียน จึงไม่ต้องมีกุญแจ):
//    GET /aoringo/ping                                     ต่อฐานได้ไหม + จับคู่ตารางได้อะไรบ้าง
//    GET /aoringo/schema                                   ตาราง/คอลัมน์ทั้งหมดที่จับคู่ได้
//    GET /aoringo/sales?start=YYYY-MM-DD&end=YYYY-MM-DD    บิลขาย
//    GET /aoringo/detail?start=…&end=…                     รายการสินค้าในบิล
//    GET /aoringo/expense?start=…&end=…                    รายจ่าย
//    GET /ping                                             เช็กว่า API ยังมีชีวิต
//
//  *** ไม่มี API key — ใครเข้าถึง URL ได้ก็ดึงข้อมูลได้ อย่าเปิดออกเน็ตโดยไม่มีทางกันหน้าบ้าน ***
// ════════════════════════════════════════════════════════════
const express = require('express');
const cors = require('cors');
const compression = require('compression');   // บีบ JSON ด้วย gzip → ส่งผ่าน tunnel เร็วขึ้นมาก
const { mountAoringo } = require('./aoringo-db');

const app = express();
app.use(compression());   // ต้องมาก่อน route
app.use(cors());

const PORT = Number(process.env.PORT) || 14365;

app.get('/ping', (req, res) => res.json({ status: 'success', data: { ok: true, at: new Date().toISOString() } }));

mountAoringo(app);

app.listen(PORT, () => console.log(`🚀 GOODFOOD host API รันที่ port ${PORT}`));
