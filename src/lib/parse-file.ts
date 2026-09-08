import * as XLSX from "xlsx";

export type ParsedTable = {
  columns: string[];
  records: Record<string, string>[];
  sheetName: string;
};

const MAX_ROWS = 100_000;
const ACCEPTED = /\.(csv|xlsx|xls)$/i;

export function isAcceptedSpreadsheet(fileName: string) {
  return ACCEPTED.test(fileName);
}

function cellToString(value: unknown): string {
  if (value == null) return "";
  if (value instanceof Date && !Number.isNaN(value.getTime())) {
    const y = value.getFullYear();
    const m = String(value.getMonth() + 1).padStart(2, "0");
    const d = String(value.getDate()).padStart(2, "0");
    return `${y}-${m}-${d}`;
  }
  return String(value).trim();
}

function decodeCsvText(buffer: ArrayBuffer): string {
  const utf8 = new TextDecoder("utf-8", { fatal: false }).decode(buffer).replace(/^\uFEFF/, "");
  if (utf8.includes("\uFFFD")) {
    try {
      return new TextDecoder("windows-874").decode(buffer);
    } catch {
      return utf8;
    }
  }
  return utf8;
}

function tableFromSheet(sheet: XLSX.WorkSheet, sheetName: string): ParsedTable {
  const matrix = XLSX.utils.sheet_to_json<(string | number | boolean | Date | null)[]>(sheet, {
    header: 1,
    raw: false,
    defval: "",
    blankrows: false,
  });

  if (matrix.length === 0) {
    throw new Error("ไม่พบข้อมูลในไฟล์ หรือชีทว่าง");
  }

  const headerRow = (matrix[0] ?? []).map((cell, i) => {
    const label = cellToString(cell);
    return label || `Column_${i + 1}`;
  });

  const seen = new Map<string, number>();
  const columns = headerRow.map((name) => {
    const count = seen.get(name) ?? 0;
    seen.set(name, count + 1);
    return count === 0 ? name : `${name}_${count + 1}`;
  });

  const records: Record<string, string>[] = [];
  for (const row of matrix.slice(1)) {
    if (!Array.isArray(row) || row.every((cell) => cellToString(cell) === "")) continue;
    const record: Record<string, string> = {};
    columns.forEach((col, i) => {
      record[col] = cellToString(row[i]);
    });
    records.push(record);
    if (records.length >= MAX_ROWS) break;
  }

  if (records.length === 0) {
    throw new Error("ไม่พบแถวข้อมูลหลังหัวคอลัมน์");
  }

  return { columns, records, sheetName };
}

export async function parseUploadedFile(file: File): Promise<ParsedTable> {
  if (!isAcceptedSpreadsheet(file.name)) {
    throw new Error("รองรับเฉพาะไฟล์ .csv, .xlsx และ .xls");
  }

  const buffer = await file.arrayBuffer();
  const isCsv = /\.csv$/i.test(file.name);

  const workbook = isCsv
    ? XLSX.read(decodeCsvText(buffer), { type: "string", raw: false })
    : XLSX.read(buffer, { type: "array", cellDates: true, raw: false });

  const sheetName = workbook.SheetNames[0];
  if (!sheetName) {
    throw new Error("ไม่พบชีทในไฟล์");
  }

  const sheet = workbook.Sheets[sheetName];
  if (!sheet) {
    throw new Error("ไม่สามารถอ่านชีทแรกของไฟล์ได้");
  }

  return tableFromSheet(sheet, sheetName);
}

export function inferColumnType(values: string[]): string {
  const sample = values.map((v) => v.trim()).filter(Boolean).slice(0, 40);
  if (sample.length === 0) return "Text";

  const dateLike = /^\d{4}[-/]\d{1,2}[-/]\d{1,2}/;
  const excelDate = /^\d{1,2}[-/]\d{1,2}[-/]\d{2,4}/;
  if (sample.every((v) => dateLike.test(v) || excelDate.test(v) || !Number.isNaN(Date.parse(v)))) {
    return "Date";
  }

  const numeric = sample.filter((v) => /^-?\d+(\.\d+)?$/.test(v.replace(/,/g, "")));
  if (numeric.length / sample.length >= 0.8) return "Number";

  return "Text";
}
