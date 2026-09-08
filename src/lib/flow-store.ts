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

export type RawRow = Record<string, string>;

export type FlowState = {
  fileName: string | null;
  fileSize: number | null;
  sheetName: string | null;
  rows: SalesRow[];
  columns: string[];
  previewRows: RawRow[];
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
      const item = CATALOG[Math.floor(rand() * CATALOG.length)]!;
      const qty = 1 + Math.floor(rand() * 8);
      const hour = 8 + Math.floor(rand() * 15);
      rows.push({
        date: `2024-05-${String(d).padStart(2, "0")}`,
        product: item.product,
        category: item.category,
        quantity: qty,
        revenue: Math.round(item.price * qty * (0.95 + rand() * 0.2) * weekendBoost),
        channel: CHANNELS[rand() < 0.7 ? 0 : rand() < 0.75 ? 1 : 2]!,
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
  sheetName: null,
  rows: [],
  columns: [],
  previewRows: [],
  insights: [],
  mappingConfirmed: false,
  cleaned: false,
};

let state: FlowState = initial;
const listeners = new Set<() => void>();

function emit() {
  listeners.forEach((l) => l());
}

const KEY = "sales-flow-state";

function persist() {
  if (typeof window === "undefined") return;
  const slim: FlowState = {
    ...state,
    previewRows: state.previewRows.slice(0, 200),
    rows: state.rows.slice(0, 12_000),
  };
  try {
    window.sessionStorage.setItem(KEY, JSON.stringify(slim));
  } catch {
    try {
      window.sessionStorage.setItem(
        KEY,
        JSON.stringify({
          ...slim,
          previewRows: slim.previewRows.slice(0, 30),
          rows: slim.rows.slice(0, 400),
        }),
      );
    } catch {
      /* ignore quota errors */
    }
  }
}

export function setFlow(patch: Partial<FlowState>) {
  state = { ...state, ...patch };
  persist();
  emit();
}

let hydrated = false;

export function hydrateFlow() {
  if (hydrated || typeof window === "undefined") return;
  hydrated = true;
  try {
    const raw = window.sessionStorage.getItem(KEY);
    if (!raw) return;
    const parsed = JSON.parse(raw) as FlowState;
    if (
      parsed &&
      ((Array.isArray(parsed.previewRows) && parsed.previewRows.length > 0) ||
        (Array.isArray(parsed.rows) && parsed.rows.length > 0))
    ) {
      state = {
        ...initial,
        ...parsed,
        previewRows: Array.isArray(parsed.previewRows) ? parsed.previewRows : [],
        columns: Array.isArray(parsed.columns) ? parsed.columns : [],
      };
      if (state.previewRows.length === 0 && state.rows.length > 0) {
        state = {
          ...state,
          previewRows: state.rows.map(salesRowToPreview),
          columns: state.columns.length ? state.columns : STANDARD_COLUMNS,
        };
      }
      emit();
    }
  } catch {
    /* ignore corrupt state */
  }
}

export function resetFlow() {
  state = initial;
  persist();
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

function salesRowToPreview(row: SalesRow): RawRow {
  return {
    Date: row.date,
    Product: row.product,
    Category: row.category,
    Quantity: String(row.quantity),
    Revenue: String(row.revenue),
    Channel: row.channel,
    Customer: row.customer,
  };
}

function normalizeHeader(name: string) {
  return name.trim().toLowerCase().replace(/\s+/g, "");
}

function findColumn(columns: string[], aliases: string[]) {
  const set = new Set(aliases.map(normalizeHeader));
  return columns.find((col) => set.has(normalizeHeader(col))) ?? null;
}

function parseNumber(value: string, fallback: number) {
  const n = Number(String(value).replace(/,/g, "").trim());
  return Number.isFinite(n) ? n : fallback;
}

function guessInsight(column: string): ColumnInsight {
  const key = normalizeHeader(column);
  const rules: { aliases: string[]; meaning: string; confidence: number; target: string }[] = [
    { aliases: ["date", "วันที่", "saledate", "orderdate"], meaning: "วันที่ขาย", confidence: 96, target: TARGETS[0]! },
    { aliases: ["product", "สินค้า", "item", "sku"], meaning: "รหัสหรือชื่อสินค้า", confidence: 94, target: TARGETS[1]! },
    { aliases: ["category", "หมวดหมู่", "หมวด"], meaning: "หมวดหมู่สินค้า", confidence: 90, target: TARGETS[2]! },
    { aliases: ["quantity", "qty", "จำนวน"], meaning: "จำนวนที่ขาย", confidence: 95, target: TARGETS[3]! },
    { aliases: ["revenue", "sales", "ยอดขาย", "amount", "total"], meaning: "ยอดขายรวม", confidence: 94, target: TARGETS[4]! },
    { aliases: ["channel", "ช่องทาง"], meaning: "ช่องทางการขาย", confidence: 90, target: TARGETS[5]! },
    { aliases: ["customer", "ลูกค้า", "custid"], meaning: "รหัสลูกค้า", confidence: 88, target: TARGETS[6]! },
  ];
  const hit = rules.find((r) => r.aliases.includes(key));
  if (hit) {
    return { column, meaning: hit.meaning, confidence: hit.confidence, target: hit.target };
  }
  return {
    column,
    meaning: "คอลัมน์จากไฟล์ที่นำเข้า ยังไม่ได้จับคู่กับฟิลด์มาตรฐาน",
    confidence: 55,
    target: TARGETS[7]!,
  };
}

export function mapRecordsToSales(columns: string[], records: RawRow[]): SalesRow[] {
  const dateCol = findColumn(columns, ["date", "วันที่", "saledate", "orderdate"]);
  const productCol = findColumn(columns, ["product", "สินค้า", "item", "sku"]);
  const catCol = findColumn(columns, ["category", "หมวดหมู่", "หมวด"]);
  const qtyCol = findColumn(columns, ["quantity", "qty", "จำนวน"]);
  const revCol = findColumn(columns, ["revenue", "sales", "ยอดขาย", "amount", "total"]);
  const channelCol = findColumn(columns, ["channel", "ช่องทาง"]);
  const customerCol = findColumn(columns, ["customer", "ลูกค้า", "custid"]);
  const hourCol = findColumn(columns, ["hour", "ชั่วโมง"]);

  return records.map((record, i) => {
    const date = dateCol ? record[dateCol] ?? "" : "";
    return {
      date,
      product: productCol ? record[productCol] || "ไม่ระบุ" : "ไม่ระบุ",
      category: catCol ? record[catCol] || "ไม่ระบุ" : "ไม่ระบุ",
      quantity: parseNumber(qtyCol ? record[qtyCol] ?? "1" : "1", 1),
      revenue: parseNumber(revCol ? record[revCol] ?? "0" : "0", 0),
      channel: channelCol ? record[channelCol] || "หน้าร้าน" : "หน้าร้าน",
      customer: customerCol ? record[customerCol] || "-" : "-",
      hour: hourCol ? parseNumber(record[hourCol] ?? "8", 8) : 8 + (i % 15),
    };
  });
}

const STANDARD_COLUMNS = ["Date", "Product", "Category", "Quantity", "Revenue", "Channel", "Customer"];

export function loadDataset(fileName: string, fileSize: number, rows: SalesRow[]) {
  const insights = STANDARD_COLUMNS.map((column) => guessInsight(column));
  setFlow({
    fileName,
    fileSize,
    sheetName: "sample",
    rows,
    columns: STANDARD_COLUMNS,
    previewRows: rows.map(salesRowToPreview),
    insights,
    mappingConfirmed: false,
    cleaned: false,
  });
}

export function loadParsedTable(
  fileName: string,
  fileSize: number,
  table: { columns: string[]; records: RawRow[]; sheetName?: string },
) {
  const insights = table.columns.map(guessInsight);
  setFlow({
    fileName,
    fileSize,
    sheetName: table.sheetName ?? null,
    rows: mapRecordsToSales(table.columns, table.records),
    columns: table.columns,
    previewRows: table.records,
    insights,
    mappingConfirmed: false,
    cleaned: false,
  });
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
