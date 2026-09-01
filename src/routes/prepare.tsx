import { createFileRoute } from "@tanstack/react-router";
import { CalendarCog, Database, FileSearch, Filter } from "lucide-react";
import { EmptyNotice, Panel, StepLayout } from "@/components/StepLayout";
import { num, setFlow, useFlow } from "@/lib/flow-store";

export const Route = createFileRoute("/prepare")({
  head: () => ({
    meta: [
      { title: "ขั้นตอนที่ 6 ตรวจสอบและเตรียมข้อมูล | ระบบวิเคราะห์ยอดขาย" },
      {
        name: "description",
        content: "ตรวจสอบข้อมูลผิดพลาด ค่าว่าง ข้อมูลซ้ำ ปรับรูปแบบวันที่และตัวเลขให้พร้อมวิเคราะห์",
      },
      { property: "og:title", content: "ตรวจสอบและเตรียมข้อมูลให้พร้อมสำหรับการวิเคราะห์" },
      {
        property: "og:description",
        content: "กระบวนการทำความสะอาดข้อมูลยอดขาย 4 ขั้น ก่อนคำนวณตัวชี้วัดธุรกิจค้าปลีก",
      },
    ],
  }),
  component: StepSix,
});

const STAGES = [
  {
    icon: FileSearch,
    title: "ตรวจสอบ",
    detail: "ข้อมูลผิดพลาด ค่าว่าง ข้อมูลซ้ำ",
  },
  {
    icon: CalendarCog,
    title: "ปรับรูปแบบข้อมูล",
    detail: "วันที่ ตัวเลข รูปแบบมาตรฐาน",
  },
  {
    icon: Filter,
    title: "จัดการข้อมูล",
    detail: "ลบข้อมูลซ้ำ เติมค่าที่เหมาะสม",
  },
  {
    icon: Database,
    title: "ข้อมูลพร้อมใช้",
    detail: "สำหรับการวิเคราะห์",
  },
];

function StepSix() {
  const flow = useFlow();
  const desc = "ระบบสามารถตรวจสอบและเตรียมข้อมูลให้อยู่ในรูปแบบที่เหมาะสมสำหรับการวิเคราะห์";

  if (flow.rows.length === 0) {
    return (
      <StepLayout step={6} description={desc}>
        <EmptyNotice>ยังไม่มีข้อมูลให้เตรียม กรุณาเริ่มจากขั้นตอนที่ 1</EmptyNotice>
      </StepLayout>
    );
  }

  const emptyValues = flow.rows.filter((r) => !r.category || !r.product).length;
  const duplicates = flow.rows.length - new Set(flow.rows.map((r) => JSON.stringify(r))).size;

  return (
    <StepLayout step={6} description={desc}>
      <Panel title="กระบวนการเตรียมข้อมูล">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {STAGES.map((s, i) => (
            <div key={s.title} className="rounded-xl border border-border bg-secondary/40 p-4">
              <div className="flex size-11 items-center justify-center rounded-lg bg-card">
                <s.icon className="size-5 text-primary" />
              </div>
              <p className="mt-3 text-sm font-semibold">
                {i + 1}. {s.title}
              </p>
              <p className="mt-1 text-xs text-muted-foreground">{s.detail}</p>
            </div>
          ))}
        </div>
      </Panel>

      <div className="mt-5 grid gap-4 sm:grid-cols-4">
        <Panel>
          <p className="text-xs text-muted-foreground">แถวข้อมูลทั้งหมด</p>
          <p className="mt-1 text-xl font-bold">{num(flow.rows.length)}</p>
        </Panel>
        <Panel>
          <p className="text-xs text-muted-foreground">ค่าว่างที่ตรวจพบ</p>
          <p className="mt-1 text-xl font-bold">{num(emptyValues)}</p>
        </Panel>
        <Panel>
          <p className="text-xs text-muted-foreground">แถวซ้ำที่ตรวจพบ</p>
          <p className="mt-1 text-xl font-bold">{num(duplicates)}</p>
        </Panel>
        <Panel>
          <p className="text-xs text-muted-foreground">สถานะ</p>
          <p className="mt-1 text-xl font-bold text-chart-2">
            {flow.cleaned ? "พร้อมใช้" : "รอดำเนินการ"}
          </p>
        </Panel>
      </div>

      <button
        onClick={() => setFlow({ cleaned: true })}
        className="mt-5 rounded-lg bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground hover:bg-primary/90"
      >
        เริ่มทำความสะอาดข้อมูล
      </button>
    </StepLayout>
  );
}
