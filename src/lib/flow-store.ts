import { useSyncExternalStore } from "react";

export type SalesRow = {
  date: string;
  product: string;
  category: string;
  quantity: number;
  revenue: number;
  channel: string;
  customer: string;
  hour: number;
};

export type ColumnInsight = {
  column: string;
  meaning: string;
  confidence: number;
  target: string;
};

export type FlowState = {
  fileName: string | null;
  fileSize: number | null;
  rows: SalesRow[];
  columns: string[];
  insights: ColumnInsight[];
  mappingConfirmed: boolean;
  cleaned: boolean;
};

const TARGETS = [
  "วันที่ขาย (Sale Date)",
  "รหัส/ชื่อสินค้า (Product)",
  "หมวดหมู่สินค้า (Category)",
  "จำนวน (Quantity)",
  "ยอดขาย (Sales Revenue)",
  "ช่องทางการขาย (Channel)",
  "ลูกค้า (Customer)",
  "ไม่ใช้ข้อมูลนี้",
];

export const MAPPING_TARGETS = TARGETS;

const CATALOG = [
  { product: "น้ำดื่ม 600 ml", category: "เครื่องดื่ม", price: 12 },
  { product: "ขนมปังโฮลวีต", category: "ขนม", price: 35 },
  { product: "นม UHT 250 ml", category: "เครื่องดื่ม", price: 14 },
  { product: "ข้าวสาร 5 kg", category: "อาหาร", price: 185 },
  { product: "น้ำผลไม้ 1 ลิตร", category: "เครื่องดื่ม", price: 49 },
  { product: "ผงซักฟอก", category: "ของใช้", price: 79 },
  { product: "โยเกิร์ต", category: "อาหาร", price: 22 },
  { product: "กาแฟ 3 in 1", category: "เครื่องดื่ม", price: 65 },
  { product: "กระดาษทิชชู่", category: "ของใช้", price: 45 },
  { product: "บะหมี่กึ่งสำเร็จรูป", category: "อาหาร", price: 6 },
];

const CHANNELS = ["หน้าร้าน", "ออนไลน์", "เดลิเวอรี่"];

function mulberry(seed: number) {
  return () => {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function generateDemoRows(): SalesRow[] {
  const rand = mulberry(20240501);
  const rows: SalesRow[] = [];
  for (let d = 1; d <= 31; d++) {
    const day = new Date(Date.UTC(2024, 4, d));
    const weekendBoost = day.getUTCDay() === 0 || day.getUTCDay() === 6 ? 1.18 : 1;
    const perDay = Math.round(28 + rand() * 14 * weekendBoost);
    for (let i = 0; i < perDay; i++) {
      const item = CATALOG[Math.floor(rand() * CATALOG.length)];
      const qty = 1 + Math.floor(rand() * 8);
      const hour = 8 + Math.floor(rand() * 15);
      rows.push({
        date: `2024-05-${String(d).padStart(2, "0")}`,
        product: item.product,
        category: item.category,
        quantity: qty,
        revenue: Math.round(item.price * qty * (0.95 + rand() * 0.2) * weekendBoost),
        channel: CHANNELS[rand() < 0.7 ? 0 : rand() < 0.75 ? 1 : 2],
        customer: `C${1000 + Math.floor(rand() * 900)}`,
        hour,
      });
    }
  }
  return rows;
}

const initial: FlowState = {
  fileName: null,
  fileSize: null,
  rows: [],
  columns: [],
  insights: [],
  mappingConfirmed: false,
  cleaned: false,
};

let state: FlowState = initial;
const listeners = new Set<() => void>();

function emit() {
  listeners.forEach((l) => l());
}

export function setFlow(patch: Partial<FlowState>) {
  state = { ...state, ...patch };
  emit();
}

export function resetFlow() {
  state = initial;
  emit();
}

export function useFlow(): FlowState {
  return useSyncExternalStore(
    (cb) => {
      listeners.add(cb);
      return () => listeners.delete(cb);
    },
    () => state,
    () => initial,
  );
}

export function loadDataset(fileName: string, fileSize: number, rows: SalesRow[]) {
  const columns = ["Date", "Product", "Category", "Quantity", "Revenue", "Channel", "Customer"];
  const insights: ColumnInsight[] = [
    { column: "Date", meaning: "วันที่ขาย", confidence: 98, target: TARGETS[0] },
    { column: "Product", meaning: "รหัสหรือชื่อสินค้า", confidence: 95, target: TARGETS[1] },
    { column: "Category", meaning: "หมวดหมู่สินค้า", confidence: 90, target: TARGETS[2] },
    { column: "Quantity", meaning: "จำนวนที่ขาย", confidence: 97, target: TARGETS[3] },
    { column: "Revenue", meaning: "ยอดขายรวม", confidence: 96, target: TARGETS[4] },
    { column: "Channel", meaning: "ช่องทางการขาย", confidence: 92, target: TARGETS[5] },
    { column: "Customer", meaning: "รหัสลูกค้า", confidence: 88, target: TARGETS[6] },
  ];
  setFlow({ fileName, fileSize, rows, columns, insights, mappingConfirmed: false, cleaned: false });
}

export function parseCsv(text: string): SalesRow[] {
  const lines = text.trim().split(/\r?\n/);
  if (lines.length < 2) return [];
  const header = lines[0].split(",").map((h) => h.trim().toLowerCase());
  const idx = (names: string[]) => header.findIndex((h) => names.includes(h));
  const iDate = idx(["date", "วันที่", "saledate"]);
  const iProduct = idx(["product", "สินค้า", "item"]);
  const iCat = idx(["category", "หมวดหมู่"]);
  const iQty = idx(["quantity", "qty", "จำนวน"]);
  const iRev = idx(["revenue", "sales", "ยอดขาย", "amount"]);
  const iChannel = idx(["channel", "ช่องทาง"]);
  const iCustomer = idx(["customer", "ลูกค้า"]);
  const rows: SalesRow[] = [];
  for (const line of lines.slice(1)) {
    const c = line.split(",");
    const date = (iDate >= 0 ? c[iDate] : "").trim();
    if (!date) continue;
    rows.push({
      date,
      product: (iProduct >= 0 ? c[iProduct] : "ไม่ระบุ").trim(),
      category: (iCat >= 0 ? c[iCat] : "ไม่ระบุ").trim(),
      quantity: Number(iQty >= 0 ? c[iQty] : 1) || 1,
      revenue: Number(iRev >= 0 ? c[iRev] : 0) || 0,
      channel: (iChannel >= 0 ? c[iChannel] : "หน้าร้าน").trim(),
      customer: (iCustomer >= 0 ? c[iCustomer] : "-").trim(),
      hour: 8 + (rows.length % 15),
    });
  }
  return rows;
}

export const baht = (n: number) => "฿" + Math.round(n).toLocaleString("en-US");
export const num = (n: number) => Math.round(n).toLocaleString("en-US");

export function computeKpis(rows: SalesRow[]) {
  const totalRevenue = rows.reduce((s, r) => s + r.revenue, 0);
  const bills = rows.length;
  const customers = new Set(rows.map((r) => r.customer)).size;
  const items = rows.reduce((s, r) => s + r.quantity, 0);
  const products = new Set(rows.map((r) => r.product)).size;
  return {
    totalRevenue,
    bills,
    customers,
    items,
    products,
    avgPerBill: bills ? totalRevenue / bills : 0,
    growth: 12.5,
  };
}

export function byDay(rows: SalesRow[]) {
  const map = new Map<string, number>();
  rows.forEach((r) => map.set(r.date, (map.get(r.date) ?? 0) + r.revenue));
  return [...map.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([date, revenue]) => ({ date, label: date.slice(8), revenue }));
}

export function byKey(rows: SalesRow[], key: "category" | "product" | "channel") {
  const map = new Map<string, number>();
  rows.forEach((r) => map.set(r[key], (map.get(r[key]) ?? 0) + r.revenue));
  return [...map.entries()]
    .map(([name, revenue]) => ({ name, revenue }))
    .sort((a, b) => b.revenue - a.revenue);
}

export function byHour(rows: SalesRow[]) {
  const map = new Map<number, number>();
  rows.forEach((r) => map.set(r.hour, (map.get(r.hour) ?? 0) + r.revenue));
  return [...map.entries()]
    .sort(([a], [b]) => a - b)
    .map(([hour, revenue]) => ({ hour: String(hour).padStart(2, "0"), revenue }));
}
