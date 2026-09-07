#!/usr/bin/env node
/*
 * ดึงไฟล์ "เมนูเฟรนไชส์" จากโปรเจกต์ต้นทาง naraipizzeria มาลงรีโปนี้
 *
 * รีโปนี้คือเมนูเฟรนไชส์ของ naraipizzeria ที่ยกออกมาเป็นเว็บเดี่ยว ไฟล์ตรรกะทั้งหมด
 * (คอมโพเนนต์ · API · ตัวอ่านฐาน · host API · เอกสาร) ตั้งใจให้ "เหมือนต้นทางทุกตัวอักษร"
 * จะได้ดึงของใหม่มาทับได้เลยโดยไม่ต้องแก้มือและไม่มี conflict
 *
 * ของที่เป็นของรีโปนี้เองและไม่เคยถูกทับ: pages/index.js (โครงหน้า+เมนูซ้าย) ·
 * tailwind.config.js + styles/globals.css (CI เขียว) · host-server/server.js · README.md
 *
 *   node scripts/sync-franchise.mjs check   ดูว่าตอนนี้ตามหลังต้นทางอยู่ไหม (ไม่แก้ไฟล์)
 *   node scripts/sync-franchise.mjs pull    ดึงของใหม่มาทับ แล้วอัปเดต .franchise-sync.json
 *
 * ตั้ง UPSTREAM_REF=<branch|tag|sha> เพื่อดึงจากจุดอื่นแทน main ได้
 */
import { readFile, writeFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import path from 'node:path';

const UPSTREAM = 'nookmagazineDev/naraipizzeria';
const REF = process.env.UPSTREAM_REF || 'main';
const STAMP = '.franchise-sync.json';

/* ไฟล์ที่ยกมาจากต้นทางแบบไม่แก้อะไรเลย — เพิ่มไฟล์ใหม่ที่นี่ที่เดียว */
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

const raw = (file, ref = REF) =>
  `https://raw.githubusercontent.com/${UPSTREAM}/${ref}/${file}`;

async function get(url) {
  const res = await fetch(url, { headers: { 'user-agent': 'goodfood-sync' } });
  if (!res.ok) throw new Error(`โหลด ${url} ไม่ได้ (HTTP ${res.status})`);
  return res.text();
}

/** commit ล่าสุดของ ref ที่กำลังดึง — เก็บไว้ใน .franchise-sync.json ให้ตามรอยได้ว่าตรงกับต้นทางจุดไหน */
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
  return { sha: json.sha, date: json.commit?.committer?.date || '', message: (json.commit?.message || '').split('\n')[0] };
}

/* ── เมนูซ้ายของรีโปนี้เขียนเอง ถ้าต้นทางเพิ่ม/ลบหน้าย่อย ต้องมีคนไปแก้ pages/index.js ──
   ตัวเทียบนี้จึงเตือนให้รู้ตัว แทนที่จะปล่อยให้หน้าย่อยใหม่หายไปเงียบ ๆ */
const block = (src, re) => (src.match(re) || [])[1] || '';
const quoted = (s) => [...s.matchAll(/'([^']+)'/g)].map((x) => x[1]);
/* ฝั่งเรา MENU มีทั้ง key/label/title ในบรรทัดเดียว — เอาเฉพาะ key ไม่งั้นชื่อเมนูภาษาไทยจะปนมา */
const keys = (s) => [...s.matchAll(/\bkey:\s*'([^']+)'/g)].map((x) => x[1]);

async function compareTabs() {
  const theirs = quoted(block(await get(raw('pages/index.js')), /FRANCHISE_TABS\s*=\s*\[([^\]]*)\]/));
  const ours = keys(block(await readFile('pages/index.js', 'utf8'), /const MENU = \[([\s\S]*?)\n\];/));
  if (!theirs.length) return null;
  const missing = theirs.filter((t) => !ours.includes(t));
  const extra = ours.filter((t) => !theirs.includes(t));
  return { theirs, ours, missing, extra };
}

async function run() {
  const mode = process.argv[2] || 'check';
  if (!['check', 'pull'].includes(mode)) {
    console.error('ใช้: node scripts/sync-franchise.mjs [check|pull]');
    process.exit(2);
  }

  const changed = [];
  const same = [];

  for (const file of SHARED) {
    const theirs = await get(raw(file));
    const ours = existsSync(file) ? await readFile(file, 'utf8') : null;
    if (ours === theirs) { same.push(file); continue; }
    changed.push(file);
    if (mode === 'pull') await writeFile(file, theirs, 'utf8');
  }

  const head = await upstreamSha();
  console.log(`ต้นทาง: ${UPSTREAM}@${REF}${head ? ` (${head.sha.slice(0, 7)} — ${head.message})` : ' (ถาม commit ล่าสุดไม่ได้ — ติดเพดานคำขอของ GitHub API ไฟล์ยังดึงมาครบตามปกติ)'}`);
  console.log(`ตรงกันอยู่แล้ว ${same.length} ไฟล์`);

  if (changed.length) {
    console.log(`${mode === 'pull' ? 'ดึงมาทับแล้ว' : 'ตามหลังต้นทาง'} ${changed.length} ไฟล์:`);
    for (const f of changed) console.log(`  - ${f}`);
  } else {
    console.log('ไม่มีอะไรต้องดึง — ตรงกับต้นทางทุกไฟล์');
  }

  const tabs = await compareTabs();
  if (tabs && (tabs.missing.length || tabs.extra.length)) {
    console.log('\n⚠️  รายการหน้าย่อยไม่ตรงกับต้นทาง — ต้องไปแก้ MENU ใน pages/index.js เอง');
    if (tabs.missing.length) console.log(`   ต้นทางมีแต่รีโปนี้ยังไม่มี: ${tabs.missing.join(', ')}`);
    if (tabs.extra.length) console.log(`   รีโปนี้มีแต่ต้นทางไม่มีแล้ว: ${tabs.extra.join(', ')}`);
  }

  if (mode === 'pull' && changed.length) {
    await writeFile(STAMP, `${JSON.stringify({
      upstream: UPSTREAM,
      ref: REF,
      commit: head?.sha || null,
      commitDate: head?.date || null,
      syncedAt: new Date().toISOString(),
      files: SHARED,
    }, null, 2)}\n`, 'utf8');
    console.log(`\nอัปเดต ${STAMP} แล้ว — อย่าลืม npm run build ก่อน commit`);
  }

  // check: ตามหลังอยู่ = exit 1 เพื่อให้ CI จับได้
  if (mode === 'check' && changed.length) process.exit(1);
}

run().catch((err) => {
  console.error('sync ล้มเหลว:', err.message);
  process.exit(2);
});
