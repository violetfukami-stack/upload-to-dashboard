import { createFileRoute } from "@tanstack/react-router";
import { ArrowRight, Sparkles } from "lucide-react";
import { EmptyNotice, Panel, StepLayout } from "@/components/StepLayout";
import { useFlow } from "@/lib/flow-store";

export const Route = createFileRoute("/mapping")({
  head: () => ({
    meta: [
      { title: "ขั้นตอนที่ 4 เสนอการ Mapping ข้อมูล | ระบบวิเคราะห์ยอดขาย" },
      {
        name: "description",
        content: "ระบบเสนอการ mapping คอลัมน์จากไฟล์ผู้ใช้ให้สอดคล้องกับโครงสร้างข้อมูลที่ระบบกำหนด",
      },
      { property: "og:title", content: "เสนอการ Mapping ข้อมูลให้สอดคล้องกับโครงสร้างของระบบ" },
      {
        property: "og:description",
        content: "จับคู่คอลัมน์จากไฟล์กับฟิลด์มาตรฐานของระบบด้วยผลวิเคราะห์จาก AI",
      },
    ],
  }),
  component: StepFour,
});

function StepFour() {
  const flow = useFlow();
  const desc = "ระบบสามารถเสนอการ mapping ข้อมูลให้สอดคล้องกับโครงสร้างข้อมูลที่ระบบกำหนด (ตามที่ระบบเข้าใจ)";

  if (flow.insights.length === 0) {
    return (
      <StepLayout step={4} description={desc}>
        <EmptyNotice>ยังไม่มีผลวิเคราะห์ กรุณาเริ่มจากขั้นตอนที่ 1</EmptyNotice>
      </StepLayout>
    );
  }

  return (
    <StepLayout step={4} description={desc}>
      <Panel>
        <div className="grid items-center gap-4 md:grid-cols-[1fr_auto_1fr]">
          <div className="space-y-2">
            <p className="text-xs font-semibold text-muted-foreground">Column จากไฟล์ของผู้ใช้</p>
            {flow.insights.map((ins) => (
              <div
                key={ins.column}
                className="rounded-lg border border-border bg-secondary/50 px-3 py-2.5 text-sm font-medium"
              >
                {ins.column}
              </div>
            ))}
          </div>

          <div className="flex flex-col items-center gap-2 px-2">
            <div className="flex size-12 items-center justify-center rounded-full bg-primary text-primary-foreground">
              <Sparkles className="size-5" />
            </div>
            <span className="text-xs font-semibold text-primary">AI Mapping</span>
            <ArrowRight className="size-5 text-muted-foreground" />
          </div>

          <div className="space-y-2">
            <p className="text-xs font-semibold text-muted-foreground">โครงสร้างข้อมูลที่ระบบกำหนด</p>
            {flow.insights.map((ins) => (
              <div
                key={ins.column}
                className="flex items-center justify-between rounded-lg border border-primary/30 bg-accent px-3 py-2.5 text-sm font-medium text-accent-foreground"
              >
                {ins.target}
                <span className="text-xs font-semibold">{ins.confidence}%</span>
              </div>
            ))}
          </div>
        </div>
      </Panel>
    </StepLayout>
  );
}
