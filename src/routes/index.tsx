import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { FileSpreadsheet, UploadCloud, Sparkles } from "lucide-react";
import { useRef, useState } from "react";
import { Panel, StepLayout } from "@/components/StepLayout";
import { generateDemoRows, loadDataset, loadParsedTable, useFlow } from "@/lib/flow-store";
import { isAcceptedSpreadsheet, parseUploadedFile } from "@/lib/parse-file";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "ขั้นตอนที่ 1 นำเข้าไฟล์ยอดขาย | ระบบวิเคราะห์ข้อมูลยอดขาย" },
      {
        name: "description",
        content:
          "นำเข้าข้อมูลยอดขายจากไฟล์ CSV หรือ Excel ขนาดไม่เกิน 30 MB เพื่อเริ่มวิเคราะห์ข้อมูลค้าปลีก 8 ขั้นตอน",
      },
      { property: "og:title", content: "นำเข้าข้อมูลยอดขายจากไฟล์ CSV / Excel" },
      {
        property: "og:description",
        content: "เริ่มต้นวิเคราะห์ยอดขายค้าปลีกด้วย Data Analytics ตั้งแต่นำเข้าไฟล์ถึง Dashboard",
      },
    ],
  }),
  component: StepOne,
});

const MAX = 30 * 1024 * 1024;

function StepOne() {
  const flow = useFlow();
  const navigate = useNavigate();
  const inputRef = useRef<HTMLInputElement>(null);
  const [drag, setDrag] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const handleFile = async (file: File) => {
    setError(null);
    if (file.size > MAX) {
      setError("ไฟล์มีขนาดเกิน 30 MB กรุณาแบ่งไฟล์ก่อนนำเข้า");
      return;
    }
    if (!isAcceptedSpreadsheet(file.name)) {
      setError("รองรับเฉพาะไฟล์ .csv, .xlsx และ .xls");
      return;
    }

    setBusy(true);
    try {
      const table = await parseUploadedFile(file);
      loadParsedTable(file.name, file.size, table);
      navigate({ to: "/preview" });
    } catch (err) {
      setError(err instanceof Error ? err.message : "อ่านไฟล์ไม่สำเร็จ กรุณาตรวจสอบรูปแบบไฟล์");
    } finally {
      setBusy(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  };

  return (
    <StepLayout
      step={1}
      description="ระบบสามารถนำเข้าข้อมูลยอดขายจากไฟล์ CSV/Excel ที่ผู้ใช้งานจัดเตรียม"
      nextDisabled={flow.previewRows.length === 0 && flow.rows.length === 0}
      disabledHint="กรุณาอัปโหลดไฟล์ หรือใช้ข้อมูลตัวอย่างก่อนไปขั้นตอนถัดไป"
    >
      <div className="grid gap-5 lg:grid-cols-[1fr_1.2fr]">
        <div className="space-y-4">
          <Panel title="ข้อกำหนดของไฟล์">
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>• รูปแบบไฟล์: .csv, .xlsx, .xls</li>
              <li>• ขนาดไม่เกิน 30 MB หรือประมาณ 100,000 แถว</li>
              <li>
                • คอลัมน์ที่แนะนำ: Date, Product, Category, Quantity, Revenue, Channel, Customer
              </li>
            </ul>
            <div className="mt-4 flex gap-3">
              <span className="flex items-center gap-2 rounded-lg bg-secondary px-3 py-2 text-xs font-semibold">
                <FileSpreadsheet className="size-4 text-chart-2" /> XLSX
              </span>
              <span className="flex items-center gap-2 rounded-lg bg-secondary px-3 py-2 text-xs font-semibold">
                <FileSpreadsheet className="size-4 text-primary" /> CSV
              </span>
            </div>
          </Panel>

          <Panel title="ยังไม่มีไฟล์?">
            <p className="text-sm text-muted-foreground">
              ใช้ชุดข้อมูลตัวอย่างยอดขายร้านค้าปลีก เดือนพฤษภาคม 2024 เพื่อดูผลลัพธ์ทุกขั้นตอน
            </p>
            <button
              onClick={() => {
                loadDataset("sample-sales-2024-05.csv", 1_284_000, generateDemoRows());
                navigate({ to: "/preview" });
              }}
              className="mt-4 inline-flex items-center gap-2 rounded-lg border border-border px-4 py-2 text-sm font-semibold transition-colors hover:bg-secondary"
            >
              <Sparkles className="size-4 text-primary" /> ใช้ข้อมูลตัวอย่าง
            </button>
          </Panel>
        </div>

        <Panel>
          <div
            onDragOver={(e) => {
              e.preventDefault();
              setDrag(true);
            }}
            onDragLeave={() => setDrag(false)}
            onDrop={(e) => {
              e.preventDefault();
              setDrag(false);
              const file = e.dataTransfer.files?.[0];
              if (file) void handleFile(file);
            }}
            className={[
              "flex h-full min-h-72 flex-col items-center justify-center rounded-xl border-2 border-dashed p-8 text-center transition-colors",
              drag ? "border-primary bg-accent" : "border-border bg-secondary/40",
            ].join(" ")}
          >
            <UploadCloud className="size-12 text-primary" />
            <p className="mt-4 text-base font-semibold">Drag &amp; Drop ไฟล์ยอดขายที่นี่</p>
            <p className="mt-1 text-sm text-muted-foreground">หรือเลือกไฟล์จากเครื่องของคุณ</p>
            <button
              disabled={busy}
              onClick={() => inputRef.current?.click()}
              className="mt-5 rounded-lg bg-primary px-6 py-2.5 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-60"
            >
              {busy ? "กำลังอ่านไฟล์..." : "Upload"}
            </button>
            <input
              ref={inputRef}
              type="file"
              accept=".csv,.xlsx,.xls,application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,text/csv"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) void handleFile(file);
              }}
            />
            {error ? <p className="mt-4 text-sm text-destructive">{error}</p> : null}
            {flow.fileName ? (
              <p className="mt-4 text-sm text-muted-foreground">
                ไฟล์ล่าสุด: <span className="font-medium text-foreground">{flow.fileName}</span> (
                {(flow.previewRows.length || flow.rows.length).toLocaleString()} แถว)
              </p>
            ) : null}
          </div>
        </Panel>
      </div>
    </StepLayout>
  );
}
