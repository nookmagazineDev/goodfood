#!/usr/bin/env node
/*
 * ดึงไฟล์ "เมนูเฟรนไชส์" จากโปรเจกต์ต้นทาง naraipizzeria มาลงรีโปนี้
 *
 * รีโปนี้คือเมนูเฟรนไชส์ของ naraipizzeria ที่ยกออกมาเป็นเว็บเดี่ยว ไฟล์ตรรกะทั้งหมด
 * (คอมโพเนนต์ · API · ตัวอ่านฐาน · host API · เอกสาร) ตั้งใจให้เหมือนต้นทาง
 * จะได้ดึงของใหม่มาทับได้เลยโดยไม่ต้องแก้มือและไม่มี conflict
 *
 * ของที่เป็นของรีโปนี้เองและไม่เคยถูกทับ: pages/index.js (โครงหน้า+เมนูซ้าย) ·
 * tailwind.config.js + styles/globals.css (CI เขียว) · host-server/server.js · README.md
 *
 * เจอบั๊กที่ต้นทางยังไม่ได้แก้ ให้เก็บเป็นไฟล์ .patch ไว้ใน patches/ สคริปต์นี้จะ apply ทับ
 * ให้ทุกครั้งหลังดึงของใหม่ ของที่แก้ไว้จึงไม่หายตอน sync — และควรส่ง patch เดียวกันนั้น
 * ไปเปิด PR ที่ต้นทางด้วย วันไหนต้นทาง merge แล้ว patch จะ apply ไม่ผ่าน สคริปต์จะบอกให้ลบทิ้ง
 *
 * เป้าหมายที่ไฟล์ควรเป็น = "ต้นทางล่าสุด + patch ทั้งหมด" ทั้งสองโหมดเทียบกับตัวนี้
 *
 *   node scripts/sync-franchise.mjs check   ตรงกับเป้าหมายไหม (ไม่แก้ไฟล์ · ไม่ตรง = exit 1)
 *   node scripts/sync-franchise.mjs pull    เขียนไฟล์ให้ตรงกับเป้าหมาย
 *
 * ตั้ง UPSTREAM_REF=<branch|tag|sha> เพื่อดึงจากจุดอื่นแทน main ได้
 */
import { readFile, writeFile, readdir, mkdtemp, mkdir, rm } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { tmpdir } from 'node:os';
import path from 'node:path';

const UPSTREAM = 'nookmagazineDev/naraipizzeria';
const REF = process.env.UPSTREAM_REF || 'main';
const STAMP = '.franchise-sync.json';
const PATCH_DIR = 'patches';

/* ไฟล์ที่ยกมาจากต้นทาง — เพิ่มไฟล์ใหม่ที่นี่ที่เดียว */
const SHARED = [
  'components/Franchise.jsx',
  'pages/api/franchise.js',
  'lib/aoringoSource.js',
  'lib/aoringoPool.js',
  'lib/aoringoSql.mjs',
  'lib/directRoute.js',
  'host-server/aoringo-db.js',
  'docs/franchise-aoringo.md',
];

const raw = (file) => `https://raw.githubusercontent.com/${UPSTREAM}/${REF}/${file}`;

async function get(url) {
  const res = await fetch(url, { headers: { 'user-agent': 'goodfood-sync' } });
  if (!res.ok) throw new Error(`โหลด ${url} ไม่ได้ (HTTP ${res.status})`);
  return res.text();
}

/** commit ล่าสุดของ ref ที่กำลังดึง — เก็บไว้ใน .franchise-sync.json ให้ตามรอยได้ */
async function upstreamSha() {
  const res = await fetch(`https://api.github.com/repos/${UPSTREAM}/commits/${REF}`, {
    headers: {
      accept: 'application/vnd.github+json',
      'user-agent': 'goodfood-sync',
      // ใน GitHub Actions ใส่ token ให้ด้วยจะได้ไม่ติดเพดานคำขอแบบไม่ล็อกอิน
      ...(process.env.GITHUB_TOKEN ? { authorization: `Bearer ${process.env.GITHUB_TOKEN}` } : {}),
    },
  });
  if (!res.ok) return null;   // ถามไม่ได้ก็ไม่เป็นไร ไฟล์ยังดึงมาได้อยู่
  const json = await res.json();
  return {
    sha: json.sha,
    date: json.commit?.committer?.date || '',
    message: (json.commit?.message || '').split('\n')[0],
  };
}

const patchList = async () =>
  (existsSync(PATCH_DIR) ? (await readdir(PATCH_DIR)) : []).filter((f) => f.endsWith('.patch')).sort();

/**
 * สร้าง "เป้าหมาย" ในโฟลเดอร์ชั่วคราว = ไฟล์ต้นทางล่าสุด + patch ทั้งหมด
 * ทำในที่ชั่วคราวเพื่อให้โหมด check ไม่แตะไฟล์จริงเลย และ pull ก็ได้ผลลัพธ์เดียวกันเป๊ะ
 */
async function buildTarget(patches) {
  const dir = await mkdtemp(path.join(tmpdir(), 'franchise-sync-'));
  for (const file of SHARED) {
    const dest = path.join(dir, file);
    await mkdir(path.dirname(dest), { recursive: true });
    await writeFile(dest, await get(raw(file)), 'utf8');
  }
  // git apply ใช้นอก git repo ได้ (กลายเป็นตัว apply patch ธรรมดา) จึงรันในโฟลเดอร์ชั่วคราวได้เลย
  const failed = [];
  for (const f of patches) {
    try {
      execFileSync('git', ['apply', path.resolve(PATCH_DIR, f)], { cwd: dir, stdio: 'pipe' });
    } catch (err) {
      failed.push({ file: f, why: (err.stderr?.toString() || err.message).trim().split('\n')[0] });
    }
  }
  return { dir, failed };
}

/* ── เมนูซ้ายของรีโปนี้เขียนเอง ถ้าต้นทางเพิ่ม/ลบหน้าย่อย ต้องมีคนไปแก้ pages/index.js ──
   ตัวเทียบนี้จึงเตือนให้รู้ตัว แทนที่จะปล่อยให้หน้าย่อยใหม่หายไปเงียบ ๆ */
const block = (src, re) => (src.match(re) || [])[1] || '';
const quoted = (s) => [...s.matchAll(/'([^']+)'/g)].map((x) => x[1]);
/* ฝั่งเรา MENU มีทั้ง key/label/title ในบรรทัดเดียว — เอาเฉพาะ key ไม่งั้นชื่อเมนูภาษาไทยจะปนมา */
const keys = (s) => [...s.matchAll(/\bkey:\s*'([^']+)'/g)].map((x) => x[1]);

/* หน้าย่อยที่รีโปนี้ทำเพิ่มเอง ต้นทางไม่มี — ไม่ต้องเตือนว่า "ต้นทางไม่มีแล้ว" */
const OWN_TABS = ['fcBranch'];

async function compareTabs() {
  const theirs = quoted(block(await get(raw('pages/index.js')), /FRANCHISE_TABS\s*=\s*\[([^\]]*)\]/));
  const ours = keys(block(await readFile('pages/index.js', 'utf8'), /const MENU = \[([\s\S]*?)\n\];/));
  if (!theirs.length) return null;
  return {
    missing: theirs.filter((t) => !ours.includes(t)),
    extra: ours.filter((t) => !theirs.includes(t) && !OWN_TABS.includes(t)),
  };
}

async function run() {
  const mode = process.argv[2] || 'check';
  if (!['check', 'pull'].includes(mode)) {
    console.error('ใช้: node scripts/sync-franchise.mjs [check|pull]');
    process.exit(2);
  }

  const patches = await patchList();
  const { dir, failed } = await buildTarget(patches);
  const head = await upstreamSha();

  const behind = [];
  try {
    for (const file of SHARED) {
      const target = await readFile(path.join(dir, file), 'utf8');
      const ours = existsSync(file) ? await readFile(file, 'utf8') : null;
      if (ours === target) continue;
      behind.push(file);
      if (mode === 'pull') await writeFile(file, target, 'utf8');
    }
  } finally {
    await rm(dir, { recursive: true, force: true });
  }

  console.log(`ต้นทาง: ${UPSTREAM}@${REF}${head
    ? ` (${head.sha.slice(0, 7)} — ${head.message})`
    : ' (ถาม commit ล่าสุดไม่ได้ — ติดเพดานคำขอของ GitHub API ไฟล์ยังดึงมาครบตามปกติ)'}`);

  if (patches.length) {
    console.log(`patch ที่รีโปนี้แก้ทับต้นทางไว้ ${patches.length} ไฟล์:`);
    for (const f of patches) {
      const bad = failed.find((x) => x.file === f);
      console.log(bad ? `  ✗ ${f} — apply ไม่ผ่าน (${bad.why})` : `  ✓ ${f}`);
    }
  }

  console.log(`ตรงกับต้นทาง+patch อยู่แล้ว ${SHARED.length - behind.length}/${SHARED.length} ไฟล์`);
  if (behind.length) {
    console.log(`${mode === 'pull' ? 'เขียนใหม่แล้ว' : 'ยังไม่ตรง'} ${behind.length} ไฟล์:`);
    for (const f of behind) console.log(`  - ${f}`);
  }

  if (failed.length) {
    console.log('\n⚠️  patch ข้างบน apply ไม่ผ่าน — ปกติแปลว่าต้นทางแก้เรื่องเดียวกันไปแล้ว');
    console.log('   ไปดูโค้ดต้นทางว่าแก้ตรงกันไหม ถ้าใช่ลบไฟล์ patch ทิ้งได้เลย');
    console.log('   (ตอนนี้ไฟล์ที่เกี่ยวข้องถูกเขียนเป็นของต้นทางเปล่า ๆ ยังไม่มี patch ทับ)');
  }

  const tabs = await compareTabs();
  if (tabs && (tabs.missing.length || tabs.extra.length)) {
    console.log('\n⚠️  รายการหน้าย่อยไม่ตรงกับต้นทาง — ต้องไปแก้ MENU ใน pages/index.js เอง');
    if (tabs.missing.length) console.log(`   ต้นทางมีแต่รีโปนี้ยังไม่มี: ${tabs.missing.join(', ')}`);
    if (tabs.extra.length) console.log(`   รีโปนี้มีแต่ต้นทางไม่มีแล้ว: ${tabs.extra.join(', ')}`);
  }

  if (mode === 'pull' && behind.length) {
    await writeFile(STAMP, `${JSON.stringify({
      upstream: UPSTREAM,
      ref: REF,
      commit: head?.sha || null,
      commitDate: head?.date || null,
      syncedAt: new Date().toISOString(),
      files: SHARED,
      patches,
    }, null, 2)}\n`, 'utf8');
    console.log(`\nอัปเดต ${STAMP} แล้ว — อย่าลืม npm run build ก่อน commit`);
  }

  // ยังไม่ตรงกับเป้าหมาย (check) หรือ patch หลุด = exit 1 เพื่อให้ CI จับได้
  if ((mode === 'check' && behind.length) || failed.length) process.exit(1);
}

run().catch((err) => {
  console.error('sync ล้มเหลว:', err.message);
  process.exit(2);
});
