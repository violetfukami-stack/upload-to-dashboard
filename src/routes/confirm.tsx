import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Check, Pencil } from "lucide-react";
import { useState } from "react";
import { EmptyNotice, Panel, StepLayout } from "@/components/StepLayout";
import { MAPPING_TARGETS, setFlow, useFlow } from "@/lib/flow-store";

export const Route = createFileRoute("/confirm")({
  head: () => ({
    meta: [
      { title: "ขั้นตอนที่ 5 ตรวจสอบและยืนยันผล Mapping | ระบบวิเคราะห์ยอดขาย" },
      {
        name: "description",
        content: "ผู้ใช้งานตรวจสอบ แก้ไข และยืนยันผลการ mapping คอลัมน์ก่อนนำข้อมูลไปใช้วิเคราะห์",
      },
      { property: "og:title", content: "ตรวจสอบ แก้ไข และยืนยันผลการ Mapping" },
      {
        property: "og:description",
        content: "แก้ไขการจับคู่คอลัมน์ที่ AI เสนอ แล้วกดยืนยันเพื่อนำข้อมูลเข้าสู่ระบบ",
      },
    ],
  }),
  component: StepFive,
});

function StepFive() {
  const flow = useFlow();
  const navigate = useNavigate();
  const [editing, setEditing] = useState(false);
  const desc =
    "ระบบสามารถให้ผู้ใช้งานตรวจสอบ แก้ไข และยืนยันผล mapping ก่อนนำข้อมูลไปใช้ (หลังจาก AI ทำการ mapping จะส่งให้ผู้ใช้ตรวจสอบและกดยืนยัน)";

  if (flow.insights.length === 0) {
    return (
      <StepLayout step={5} description={desc}>
        <EmptyNotice>ยังไม่มีผล mapping ให้ยืนยัน กรุณาเริ่มจากขั้นตอนที่ 1</EmptyNotice>
      </StepLayout>
    );
  }

  return (
    <StepLayout
      step={5}
      description={desc}
      nextDisabled={!flow.mappingConfirmed}
      disabledHint="กรุณากด “ยืนยันและนำเข้าข้อมูล” ก่อนไปขั้นตอนถัดไป"
    >
      <Panel title="ตัวอย่างผลการ Mapping">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[560px] text-left text-sm">
            <thead className="text-xs text-muted-foreground">
              <tr className="border-b border-border">
                <th className="px-2 py-2 font-medium">Column จากไฟล์</th>
                <th className="px-2 py-2 font-medium">ความหมายที่ระบบเลือก</th>
                <th className="px-2 py-2 font-medium">สถานะ</th>
              </tr>
            </thead>
            <tbody>
              {flow.insights.map((ins, idx) => (
                <tr key={ins.column} className="border-b border-border/60">
                  <td className="px-2 py-2.5 font-medium">{ins.column}</td>
                  <td className="px-2 py-2.5">
                    {editing ? (
                      <select
                        value={ins.target}
                        onChange={(e) => {
                          const next = flow.insights.map((x, i) =>
                            i === idx ? { ...x, target: e.target.value } : x,
                          );
                          setFlow({ insights: next, mappingConfirmed: false });
                        }}
                        className="w-full rounded-md border border-border bg-background px-2 py-1.5 text-sm"
                      >
                        {MAPPING_TARGETS.map((t) => (
                          <option key={t} value={t}>
                            {t}
                          </option>
                        ))}
                      </select>
                    ) : (
                      <span className="text-muted-foreground">{ins.target}</span>
                    )}
                  </td>
                  <td className="px-2 py-2.5">
                    <Check className="size-4 text-chart-2" />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="mt-5 flex flex-wrap items-center gap-3">
          <button
            onClick={() => setEditing((v) => !v)}
            className="inline-flex items-center gap-2 rounded-lg border border-border px-4 py-2 text-sm font-medium hover:bg-secondary"
          >
            <Pencil className="size-4" /> {editing ? "เสร็จสิ้นการแก้ไข" : "แก้ไข Mapping"}
          </button>
          <button
            onClick={() => {
              setFlow({ mappingConfirmed: true });
              navigate({ to: "/prepare" });
            }}
            className="inline-flex items-center gap-2 rounded-lg bg-primary px-5 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary/90"
          >
            <Check className="size-4" /> ยืนยันและนำเข้าข้อมูล
          </button>
          {flow.mappingConfirmed ? (
            <span className="text-xs font-medium text-chart-2">ยืนยันแล้ว</span>
          ) : null}
        </div>
      </Panel>
    </StepLayout>
  );
}
