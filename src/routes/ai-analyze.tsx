import { createFileRoute } from "@tanstack/react-router";
import { Bot } from "lucide-react";
import { EmptyNotice, Panel, StepLayout } from "@/components/StepLayout";
import { useFlow } from "@/lib/flow-store";

export const Route = createFileRoute("/ai-analyze")({
  head: () => ({
    meta: [
      { title: "ขั้นตอนที่ 3 AI วิเคราะห์ความหมายของ Column | ระบบวิเคราะห์ยอดขาย" },
      {
        name: "description",
        content: "AI วิเคราะห์และระบุความหมายของข้อมูลแต่ละคอลัมน์ พร้อมคะแนนความเชื่อมั่น",
      },
      { property: "og:title", content: "ใช้ AI วิเคราะห์และระบุความหมายของข้อมูลแต่ละ Column" },
      {
        property: "og:description",
        content: "ผลการวิเคราะห์ความหมายคอลัมน์โดย AI พร้อมค่าความเชื่อมั่นแต่ละรายการ",
      },
    ],
  }),
  component: StepThree,
});

function StepThree() {
  const flow = useFlow();
  const desc = "ระบบสามารถใช้ AI วิเคราะห์และระบุความหมายของข้อมูลแต่ละ Column (เพื่อดำเนินการขั้นต่อไปคือ ข้อ 4)";

  if (flow.insights.length === 0) {
    return (
      <StepLayout step={3} description={desc}>
        <EmptyNotice>ยังไม่มีข้อมูลให้ AI วิเคราะห์ กรุณาอัปโหลดไฟล์ในขั้นตอนที่ 1 ก่อน</EmptyNotice>
      </StepLayout>
    );
  }

  return (
    <StepLayout step={3} description={desc}>
      <div className="grid gap-5 lg:grid-cols-[0.8fr_1.4fr]">
        <Panel>
          <div className="flex size-16 items-center justify-center rounded-2xl bg-accent">
            <Bot className="size-9 text-primary" />
          </div>
          <p className="mt-4 text-sm font-semibold">AI วิเคราะห์เสร็จสิ้น</p>
          <p className="mt-2 text-sm text-muted-foreground">
            AI อ่านชื่อคอลัมน์และตัวอย่างค่าในแต่ละคอลัมน์ แล้วสรุปความหมายทางธุรกิจ พร้อมประเมินค่าความเชื่อมั่น
            เพื่อใช้เสนอการ Mapping ในขั้นตอนถัดไป
          </p>
          <p className="mt-4 text-xs text-muted-foreground">
            ความเชื่อมั่นเฉลี่ย{" "}
            <span className="font-semibold text-foreground">
              {Math.round(
                flow.insights.reduce((s, i) => s + i.confidence, 0) / flow.insights.length,
              )}
              %
            </span>
          </p>
        </Panel>

        <Panel title="ตัวอย่างการวิเคราะห์โดย AI">
          <table className="w-full text-left text-sm">
            <thead className="text-xs text-muted-foreground">
              <tr className="border-b border-border">
                <th className="px-2 py-2 font-medium">Column</th>
                <th className="px-2 py-2 font-medium">ความหมายที่ AI เข้าใจ</th>
                <th className="px-2 py-2 font-medium">ความเชื่อมั่น</th>
              </tr>
            </thead>
            <tbody>
              {flow.insights.map((ins) => (
                <tr key={ins.column} className="border-b border-border/60">
                  <td className="px-2 py-2.5 font-medium">{ins.column}</td>
                  <td className="px-2 py-2.5 text-muted-foreground">{ins.meaning}</td>
                  <td className="px-2 py-2.5">
                    <div className="flex items-center gap-2">
                      <div className="h-1.5 w-24 overflow-hidden rounded-full bg-secondary">
                        <div
                          className="h-full rounded-full bg-primary"
                          style={{ width: `${ins.confidence}%` }}
                        />
                      </div>
                      <span className="text-xs font-semibold">{ins.confidence}%</span>
                    </div>
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
