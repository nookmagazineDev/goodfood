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
| **ยกมาจากต้นทาง** (เหมือนกันทุกตัวอักษร) | `components/Franchise.jsx` · `pages/api/franchise.js` · `lib/aoringo*.js/.mjs` · `lib/directRoute.js` · `host-server/aoringo-db.js` · `docs/franchise-aoringo.md` | แก้ที่ต้นทาง แล้ว sync ลงมา (จำเป็นต้องแก้ที่นี่ ใช้ `patches/`) |
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

### แก้บั๊กในไฟล์ของต้นทาง — `patches/`

ไฟล์กองแรกถูกทับทุกครั้งที่ sync ถ้าแก้ตรง ๆ ของที่แก้จะหาย จึงเก็บเป็นไฟล์ `.patch` ไว้ใน
`patches/` แทน สคริปต์ sync จะ apply ทับให้เสมอหลังดึงของใหม่มา ("เป้าหมาย" ของไฟล์
คือ **ต้นทางล่าสุด + patch ทั้งหมด** ทั้งโหมด `check` และ `pull` เทียบกับตัวนี้)

```bash
# แก้ไฟล์ตามปกติ แล้วเก็บเป็น patch
git diff components/Franchise.jsx > patches/0002-ชื่อสั้น ๆ.patch
git checkout components/Franchise.jsx   # คืนไฟล์ให้เป็นของต้นทาง
node scripts/sync-franchise.mjs pull    # แล้วให้สคริปต์ apply ให้ (พิสูจน์ว่า patch ใช้ได้จริง)
```

ตั้งชื่อขึ้นต้นด้วยตัวเลขเพื่อคุมลำดับการ apply

**patch ที่มีอยู่ตอนนี้**

| ไฟล์ | แก้อะไร |
|---|---|
| `0001-daily-type-columns-before-vat.patch` | คอลัมน์ Dine-in / Take-Home / Delivery ในหน้า "ยอดขายรายวัน" ให้เป็นยอด**ก่อน VAT** ผลรวมสามช่องจะเท่ากับ Net Sales พอดี — ตรงกับตาราง "ยอดรายวัน" ของเมนู ACC ที่ต้นทางใช้ (`net = billTotal - vat` แล้ว `netSales = dineIn + takeHome + delivery`) ของเดิมบวกยอดรวม VAT เข้าไป สามช่องเลยไปเท่ากับ Gross Sales แทน |
| `0002-daily-voucher-discount-column.patch` | เพิ่มคอลัมน์ **Voucher** ต่อจากช่อง "ส่วนลด" ในหน้า "ยอดขายรายวัน" — ส่วนลดของบิลที่มีคำว่า voucher/คูปอง ถูกแยกมาอยู่ช่องนี้ **ไม่นับซ้ำในช่อง "ส่วนลด"** (สองช่องบวกกัน = ส่วนลดทั้งหมด) กดตัวเลขดูบิลเบื้องหลังได้ |
| `0003-daily-pos-payment-columns.patch` | ช่องทางจ่ายที่ POS เพิ่มใหม่แล้วฝั่ง SQL ไม่มีถังรองรับ (เดิมยอดหายไปเงียบ ๆ) ตั้งเป็น **คอลัมน์ตามชื่อที่ POS บันทึกมาจริง** ในหน้า "ยอดขายรายวัน" และในกราฟช่องทางการชำระเงินบนแดชบอร์ด · Total Sales จึงเท่ากับ Gross Sales เสมอ · เกิน 12 ชื่อยุบส่วนเกินเป็น "อื่นๆ" |

patch ทุกไฟล์ควรส่งไปเปิด PR ที่ต้นทางด้วย — ไฟล์ใน `patches/` apply กับรีโป naraipizzeria
ได้ตรง ๆ เพราะไฟล์กองแรกเหมือนกันทุกตัวอักษร:

```bash
cd /path/to/naraipizzeria
git apply /path/to/goodfood/patches/0001-daily-type-columns-before-vat.patch
```

พอต้นทาง merge แล้ว patch จะ apply ไม่ผ่าน สคริปต์จะขึ้นเตือนพร้อมบอกให้ลบไฟล์ patch ทิ้ง
(และ workflow จะ fail ให้เห็น ไม่ปล่อยผ่านเงียบ ๆ)

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
patches/                  ที่รีโปนี้แก้ทับของต้นทางไว้ — apply ทับให้ทุกครั้งหลัง sync
.franchise-sync.json      ตอนนี้ตรงกับต้นทาง commit ไหน + มี patch อะไรบ้าง
```
