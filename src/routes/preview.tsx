import { createFileRoute } from "@tanstack/react-router";
import { EmptyNotice, Panel, StepLayout } from "@/components/StepLayout";
import { num, useFlow } from "@/lib/flow-store";
import { inferColumnType } from "@/lib/parse-file";

export const Route = createFileRoute("/preview")({
  head: () => ({
    meta: [
      { title: "ขั้นตอนที่ 2 ตัวอย่างและโครงสร้างข้อมูล | ระบบวิเคราะห์ยอดขาย" },
      {
        name: "description",
        content: "ดูตัวอย่างข้อมูล (Preview) และโครงสร้างคอลัมน์พร้อมชนิดข้อมูลของไฟล์ยอดขายที่นำเข้า",
      },
      { property: "og:title", content: "ตัวอย่างและโครงสร้างของข้อมูลที่นำเข้า" },
      {
        property: "og:description",
        content: "ตรวจสอบตัวอย่างแถวข้อมูลและชนิดข้อมูลแต่ละคอลัมน์ก่อนให้ AI วิเคราะห์",
      },
    ],
  }),
  component: StepTwo,
});

function StepTwo() {
  const flow = useFlow();
  const columns = flow.columns;
  const previewRows = flow.previewRows.length > 0 ? flow.previewRows : [];

  if (previewRows.length === 0 && flow.rows.length === 0) {
    return (
      <StepLayout step={2} description="ระบบสามารถแสดงตัวอย่างและโครงสร้างของข้อมูลที่นำเข้าได้">
        <EmptyNotice>ยังไม่มีข้อมูลนำเข้า กรุณาอัปโหลดไฟล์ในขั้นตอนที่ 1 ก่อน</EmptyNotice>
      </StepLayout>
    );
  }

  const sample = previewRows.slice(0, 12);

  return (
    <StepLayout
      step={2}
      description="ระบบสามารถแสดงตัวอย่างและโครงสร้างของข้อมูลที่นำเข้าได้ (แสดงหลังจากนำเข้าข้อมูลและกดยืนยัน)"
    >
      <div className="mb-5 grid gap-3 sm:grid-cols-3">
        <Panel>
          <p className="text-xs text-muted-foreground">ไฟล์</p>
          <p className="mt-1 truncate text-sm font-semibold">{flow.fileName}</p>
          {flow.sheetName ? (
            <p className="mt-1 text-xs text-muted-foreground">ชีท: {flow.sheetName}</p>
          ) : null}
        </Panel>
        <Panel>
          <p className="text-xs text-muted-foreground">จำนวนแถว</p>
          <p className="mt-1 text-sm font-semibold">{num(previewRows.length)} แถว</p>
        </Panel>
        <Panel>
          <p className="text-xs text-muted-foreground">จำนวนคอลัมน์</p>
          <p className="mt-1 text-sm font-semibold">{columns.length} คอลัมน์</p>
        </Panel>
      </div>

      <div className="grid gap-5 lg:grid-cols-[1.6fr_1fr]">
        <Panel title="ตัวอย่างข้อมูล (Preview)">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="text-muted-foreground">
                <tr className="border-b border-border">
                  {columns.map((c) => (
                    <th key={c} className="whitespace-nowrap px-2 py-2 font-medium">
                      {c}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {sample.map((r, i) => (
                  <tr key={i} className="border-b border-border/60">
                    {columns.map((c) => (
                      <td key={c} className="whitespace-nowrap px-2 py-2">
                        {r[c] ?? ""}
                      </td>
                    ))}
                  </tr>
                ))}
                {previewRows.length > sample.length ? (
                  <tr>
                    <td className="px-2 py-2 text-muted-foreground" colSpan={columns.length}>
                      ... อีก {num(previewRows.length - sample.length)} แถว
                    </td>
                  </tr>
                ) : null}
              </tbody>
            </table>
          </div>
        </Panel>

        <Panel title="โครงสร้างข้อมูล (Structure)">
          <table className="w-full text-left text-xs">
            <thead className="text-muted-foreground">
              <tr className="border-b border-border">
                <th className="px-2 py-2 font-medium">Column</th>
                <th className="px-2 py-2 font-medium">Data Type</th>
              </tr>
            </thead>
            <tbody>
              {columns.map((c) => (
                <tr key={c} className="border-b border-border/60">
                  <td className="px-2 py-2 font-medium">{c}</td>
                  <td className="px-2 py-2 text-muted-foreground">
                    {inferColumnType(previewRows.map((row) => row[c] ?? ""))}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Panel>
      </div>
    </StepLayout>
  );
}
