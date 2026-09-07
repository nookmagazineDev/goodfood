# GOODFOOD — รายงานร้านเฟรนไชส์

เว็บรายงานร้านเฟรนไชส์ ยกเฉพาะ **เมนู "เฟรนไชส์"** ออกมาจากโปรเจกต์
[naraipizzeria](https://github.com/nookmagazineDev/naraipizzeria) ให้เป็นเว็บของตัวเอง
เมนูอื่นของโปรเจกต์เดิม (ACC · สต๊อก · HR · QC/RD · จัดซื้อ · AI) ไม่ได้เอามาด้วย

**CI เป็นโทนเขียว** — ตั้งไว้ที่ `tailwind.config.js` (`brand.50` … `brand.950`) กับ `styles/globals.css`
เปลี่ยนสีทั้งเว็บได้จากสองไฟล์นี้

## หน้าจอ

| หน้าย่อย | เห็นอะไร |
|---|---|
| แดชบอร์ด | ยอดขายรวม · จำนวนบิล · จำนวนลูกค้า · รายจ่าย · กราฟยอดขายรายวัน · ช่องทางชำระเงิน · เมนูขายดี 10 อันดับ |
| รายงานยอดขาย | ตารางรายบิล + ดูบิล + ประวัติโต๊ะ |
| ยอดขายรายวัน | Dine-in / Take-Home / Delivery · Service Charge · ส่วนลด · Net/Vat/Gross · ช่องทางชำระ · รายจ่ายของวัน |
| รายการขาย | รายบิล (วันที่ · เลขที่บิล · โต๊ะ · ชำระโดย · แคชเชียร์ · ส่วนลด · VAT · ยอดบิล) |
| รายละเอียดการขาย | รายไอเทม — สรุปตามเมนู หรือ รายบรรทัด |
| รายจ่าย | รายการรายจ่าย + สรุปเทียบยอดขาย |

ทุกหน้ามีช่องค้นหาและปุ่มส่งออก Excel · ทั้ง 6 หน้าใช้ข้อมูลชุดเดียวกัน โหลดครั้งเดียวแล้วสลับได้เลย

## รัน

```bash
npm install
npm run dev      # http://localhost:3000
```

build/deploy:

```bash
npm run build && npm start
```

## ข้อมูลมาจากไหน

ฐาน **`Aoringo`** บน SQL Server — ลองต่อ SQL ตรงก่อน ต่อไม่ติดค่อยถอยไป host API
ที่รันบนเครื่องออฟฟิศ รายละเอียดทั้งหมด (โครงตาราง · การจับคู่คอลัมน์ · env ที่ต้องตั้ง ·
วิธีไล่ปัญหา) อยู่ที่ [`docs/franchise-aoringo.md`](docs/franchise-aoringo.md)

ต่อฐานไม่ได้ให้เปิด `/api/franchise?view=diag` — บอกว่าขาไหนพังและต้องแก้ตรงไหน

## ลิงก์กับโปรเจกต์ต้นทาง

รีโปนี้คือ "เมนูเฟรนไชส์" ของ [naraipizzeria](https://github.com/nookmagazineDev/naraipizzeria)
ที่ยกออกมาเป็นเว็บเดี่ยว **ต้นทางคือเจ้าของตรรกะ** ของเมนูนี้ ที่นี่ตามหลังไป

ไฟล์แบ่งเป็นสองกอง:

| กอง | ไฟล์ | ใครแก้ |
|---|---|---|
| **ยกมาจากต้นทาง** (เหมือนกันทุกตัวอักษร) | `components/Franchise.jsx` · `pages/api/franchise.js` · `lib/aoringo*.js/.mjs` · `lib/directRoute.js` · `host-server/aoringo-db.js` · `docs/franchise-aoringo.md` | แก้ที่ต้นทาง แล้ว sync ลงมา |
| **ของรีโปนี้เอง** (ไม่เคยถูกทับ) | `pages/index.js` · `tailwind.config.js` · `styles/globals.css` · `host-server/server.js` · `README.md` | แก้ที่นี่ได้เลย |

ที่ต้องเหมือนกันทุกตัวอักษรเพราะเวลา sync จะได้ทับลงไปตรง ๆ ไม่มี conflict ให้ต้องนั่งแก้มือ
ส่วน CI เขียวกับโครงหน้าอยู่คนละไฟล์อยู่แล้ว จึงไม่โดนทับ

`.franchise-sync.json` บอกว่าตอนนี้ตรงกับต้นทาง commit ไหน

### อัปเดตจากต้นทาง (naraipizzeria → goodfood)

อัตโนมัติอยู่แล้ว — `.github/workflows/sync-franchise.yml` เช็กทุกเช้า (08:00 เวลาไทย)
ถ้าต้นทางมีของใหม่จะ **เปิด PR** ทิ้งไว้ให้รีวิว (build ผ่านแล้วถึงจะเปิด ไม่ merge ให้เอง)
กดสั่งเองได้ที่แท็บ **Actions → sync เมนูเฟรนไชส์จากต้นทาง → Run workflow**

สั่งจากเครื่องตัวเองก็ได้:

```bash
node scripts/sync-franchise.mjs check   # ตามหลังต้นทางอยู่ไหม (ไม่แก้ไฟล์ · ตามหลัง = exit 1)
node scripts/sync-franchise.mjs pull    # ดึงของใหม่มาทับ
```

เพิ่มไฟล์ที่ต้อง sync ได้ที่ตัวแปร `SHARED` ใน `scripts/sync-franchise.mjs` ที่เดียว

### ถ้าต้นทางเพิ่มหน้าย่อยใหม่

เมนูซ้ายของรีโปนี้เขียนเอง (`MENU` ใน `pages/index.js`) หน้าย่อยใหม่จึงไม่โผล่เอง
สคริปต์เทียบรายการหน้าย่อยกับต้นทางให้ทุกครั้ง เจอไม่ตรงจะเตือนใน log ว่าต้องไปเพิ่มตัวไหน

### แก้ที่ goodfood แล้วอยากส่งกลับต้นทาง (goodfood → naraipizzeria)

ทำอัตโนมัติไม่ได้ และไม่ควรทำ — sync สองทางพร้อมกันจะทับกันไปมาจนไล่ไม่ออกว่าเวอร์ชันไหนถูก
**ให้แก้ที่ต้นทางเป็นหลัก** แล้วปล่อยให้ไหลลงมาเอง

ถ้าเผลอแก้ที่นี่ไปแล้ว เอากลับไปต้นทางแบบนี้:

```bash
node scripts/sync-franchise.mjs check          # ดูว่าไฟล์ไหนไม่ตรง
git diff <commit-ก่อนแก้> -- components/Franchise.jsx > /tmp/fix.patch
# แล้วเอา patch ไป apply ที่ naraipizzeria เปิด PR ตามปกติ
```

พอ PR ฝั่งต้นทาง merge แล้ว รอบ sync รอบถัดไปจะเห็นว่าตรงกันเอง ไม่ทับงานของคุณ

## โครงไฟล์

```
pages/index.js            โครงหน้า (เมนูซ้าย + หัวเว็บ) — สลับ 6 หน้าย่อยด้วย prop view
pages/api/franchise.js    API ของหน้าเว็บ (all | sales | detail | expense | schema | diag)
components/Franchise.jsx  ทั้ง 6 หน้าย่อยอยู่ในคอมโพเนนต์เดียว
lib/aoringoSource.js      เลือกทาง: ต่อ SQL ตรง → ถอยไป host API
lib/aoringoPool.js        ต่อ SQL Server ตรง
lib/aoringoSql.mjs        ตรรกะจับคู่ตาราง/คอลัมน์ + คำสั่ง SQL (ใช้ร่วมทั้งสองทาง)
lib/directRoute.js        ตัวรู้จำ error แบบ "ไปไม่ถึงเครื่อง" + จำว่าเพิ่งต่อไม่ติด
host-server/              host API ทางถอย (รันบนเครื่องที่มองเห็น SQL Server)
scripts/sync-franchise.mjs  ดึงเมนูเฟรนไชส์จากต้นทางมาอัปเดต (check | pull)
.franchise-sync.json      ตอนนี้ตรงกับต้นทาง commit ไหน
```
