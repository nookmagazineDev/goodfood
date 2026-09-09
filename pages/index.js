import React, { useEffect, useState } from 'react';
import Head from 'next/head';
import {
  Store, LayoutDashboard, FileText, Receipt, TrendingUp, Layers, DollarSign,
  ChevronDown, ChevronRight, Menu, X, Settings,
} from 'lucide-react';
import Franchise from '../components/Franchise';

/*
 * GOODFOOD — รายงานร้านเฟรนไชส์
 *
 * ยกเฉพาะ "เมนูเฟรนไชส์" ออกมาจากโปรเจกต์ naraipizzeria (NARAI OFFICE) ให้เป็นเว็บของตัวเอง
 * เมนูอื่นของโปรเจกต์เดิม (ACC · สต๊อก · HR · QC/RD · จัดซื้อ · AI) ไม่ได้เอามาด้วย
 *
 * ข้อมูลมาจากฐาน "Aoringo" บน SQL Server ผ่าน /api/franchise ซึ่งลองต่อ SQL ตรงก่อน
 * แล้วถอยไป host API ให้เอง (ดู lib/aoringoSource.js และ docs/franchise-aoringo.md)
 *
 * หกหน้าย่อยใช้คอมโพเนนต์ <Franchise/> ตัวเดียวกัน เปลี่ยนแค่ prop view เพื่อให้ข้อมูล
 * ที่โหลดไว้ไม่หายตอนสลับเมนู (ถ้าแยกเป็นคนละ element React จะถอดของเก่าทิ้งแล้ว state หาย)
 */

const MENU = [
  { key: 'fcDashboard', label: 'แดชบอร์ด',           title: 'เฟรนไชส์ — แดชบอร์ด',           icon: LayoutDashboard },
  { key: 'fcReport',    label: 'รายงานยอดขาย',       title: 'เฟรนไชส์ — รายงานยอดขาย',       icon: FileText },
  { key: 'fcDaily',     label: 'ยอดขายรายวัน',       title: 'เฟรนไชส์ — ยอดขายรายวัน',       icon: Receipt },
  { key: 'fcSales',     label: 'รายการขาย',          title: 'เฟรนไชส์ — รายการขาย',          icon: TrendingUp },
  { key: 'fcDetail',    label: 'รายละเอียดการขาย',   title: 'เฟรนไชส์ — รายละเอียดการขาย',   icon: Layers },
  { key: 'fcExpense',   label: 'รายจ่าย',            title: 'เฟรนไชส์ — รายจ่าย',            icon: DollarSign },
  // หน้าของ goodfood เอง ต้นทางไม่มี — ตั้งชื่อเรียกสาขาและติ๊กว่าสาขาไหนเป็นสาขาเทส
  { key: 'fcBranch',    label: 'ตั้งค่าสาขา',        title: 'เฟรนไชส์ — ตั้งค่าสาขา',        icon: Settings },
];

const TAB_STORAGE_KEY = 'goodfood.activeTab';

export default function App() {
  const [isMounted, setIsMounted] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [menuOpen, setMenuOpen] = useState(true);
  const [activeTab, setActiveTab] = useState('fcDashboard');

  // เปิดหน้าเดิมที่ค้างไว้ — อ่านหลัง mount เท่านั้น ไม่งั้น HTML ฝั่งเซิร์ฟเวอร์กับฝั่งเบราว์เซอร์ไม่ตรงกัน
  useEffect(() => {
    setIsMounted(true);
    try {
      const saved = window.localStorage.getItem(TAB_STORAGE_KEY);
      if (saved && MENU.some((m) => m.key === saved)) setActiveTab(saved);
    } catch { /* เบราว์เซอร์ปิด storage ไว้ ก็เริ่มที่แดชบอร์ดตามเดิม */ }
    if (window.innerWidth < 768) setSidebarOpen(false);
  }, []);

  const go = (key) => {
    setActiveTab(key);
    try { window.localStorage.setItem(TAB_STORAGE_KEY, key); } catch { /* ไม่ต้องจำก็ใช้งานได้ */ }
    if (typeof window !== 'undefined' && window.innerWidth < 768) setSidebarOpen(false);
  };

  const current = MENU.find((m) => m.key === activeTab) || MENU[0];
  const CurrentIcon = current.icon;

  return (
    <>
      <Head>
        <title>GOODFOOD — รายงานร้านเฟรนไชส์</title>
        <meta name="description" content="รายงานยอดขาย · ยอดขายรายวัน · รายการขาย · รายละเอียดการขาย · รายจ่าย ของร้านเฟรนไชส์" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="theme-color" content="#059669" />
        <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
      </Head>

      <div className="flex h-screen overflow-hidden bg-slate-50">
        {/* ── ม่านดำตอนเปิดเมนูบนมือถือ ── */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 bg-slate-900/50 z-20 md:hidden no-print"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* ── SIDEBAR (CI เขียว) ── */}
        <aside
          className={`${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
            fixed md:static inset-y-0 left-0 z-30 w-64 flex-shrink-0
            bg-brand-950 text-slate-200 flex flex-col
            transition-transform duration-200 md:translate-x-0 no-print`}
        >
          <div className="flex items-center justify-between gap-3 px-5 py-5 border-b border-brand-900">
            <div className="flex items-center gap-3 min-w-0">
              <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-brand-600 flex-shrink-0">
                <Store size={20} className="text-white" />
              </div>
              <div className="min-w-0">
                <p className="text-base font-bold text-white leading-tight truncate">GOODFOOD</p>
                <p className="text-[11px] text-brand-300 truncate">รายงานร้านเฟรนไชส์</p>
              </div>
            </div>
            <button
              className="md:hidden text-brand-300 hover:text-white"
              onClick={() => setSidebarOpen(false)}
              aria-label="ปิดเมนู"
            >
              <X size={20} />
            </button>
          </div>

          <nav className="flex-1 overflow-y-auto px-3 py-4">
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className={`flex items-center justify-between w-full px-4 py-3 rounded-lg text-sm font-semibold transition-colors ${
                menuOpen ? 'bg-brand-900 text-brand-100' : 'hover:bg-brand-900/60 text-brand-300 hover:text-brand-100'
              }`}
            >
              <div className="flex items-center gap-3">
                <Store size={18} className="text-brand-400" />
                <span>เฟรนไชส์</span>
              </div>
              {menuOpen ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
            </button>

            {menuOpen && (
              <div className="pl-4 space-y-1.5 mt-1 border-l border-brand-800/70 ml-6">
                {MENU.map(({ key, label, icon: Icon }) => (
                  <button
                    key={key}
                    onClick={() => go(key)}
                    className={`flex items-center gap-3 w-full px-4 py-2.5 rounded-lg text-xs font-medium transition-colors ${
                      isMounted && activeTab === key
                        ? 'bg-brand-600 text-white'
                        : 'hover:bg-brand-900/60 text-brand-200/70 hover:text-brand-100'
                    }`}
                  >
                    <Icon size={16} />
                    <span>{label}</span>
                  </button>
                ))}
              </div>
            )}
          </nav>

          <div className="px-5 py-4 border-t border-brand-900 text-[10px] leading-relaxed text-brand-300/80">
            ข้อมูลจากฐาน Aoringo ผ่าน <span className="font-mono">/api/franchise</span>
            <br />อ่านอย่างเดียว ไม่มีการเขียนกลับ
          </div>
        </aside>

        {/* ── ส่วนเนื้อหา ── */}
        <div className="flex-1 flex flex-col overflow-hidden">
          <header className="flex items-center justify-between gap-4 px-6 py-4 bg-white border-b border-brand-100 flex-shrink-0 no-print">
            <div className="flex items-center gap-4 min-w-0">
              <button
                className="md:hidden text-slate-600 hover:text-brand-700"
                onClick={() => setSidebarOpen(true)}
                aria-label="เปิดเมนู"
              >
                <Menu size={24} />
              </button>
              <h1 className="text-lg font-bold text-slate-800 flex items-center gap-2 truncate">
                <CurrentIcon size={20} className="text-brand-600 flex-shrink-0" />
                <span className="truncate">{current.title}</span>
              </h1>
            </div>
            <div className="hidden sm:flex items-center gap-2 text-xs font-semibold text-brand-700 bg-brand-50 px-3 py-1.5 rounded-full flex-shrink-0">
              <Store size={14} />
              <span>ร้านเฟรนไชส์</span>
            </div>
          </header>

          <div className="flex-1 overflow-y-auto p-6 print-reset">
            {/* เรนเดอร์ element เดียวสำหรับทั้ง 6 เมนู เปลี่ยนแค่ prop view —
                ข้อมูลที่โหลดไว้จะได้ไม่หายตอนสลับหน้าย่อย (ไม่งั้นต้องกดค้นหาใหม่ทุกครั้ง) */}
            <Franchise view={activeTab} />
          </div>
        </div>
      </div>
    </>
  );
}
