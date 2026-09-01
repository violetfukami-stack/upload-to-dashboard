import { createFileRoute } from "@tanstack/react-router";
import { CircleCheck } from "lucide-react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
} from "recharts";
import { EmptyNotice, Panel, StepLayout } from "@/components/StepLayout";
import { baht, byDay, byKey, computeKpis, num, useFlow } from "@/lib/flow-store";

export const Route = createFileRoute("/kpi")({
  head: () => ({
    meta: [
      { title: "ขั้นตอนที่ 7 คำนวณตัวชี้วัดยอดขาย (KPI) | ระบบวิเคราะห์ยอดขาย" },
      {
        name: "description",
        content: "คำนวณตัวชี้วัดค้าปลีก เช่น ยอดขายรวม ยอดเฉลี่ยต่อบิล สินค้าขายดี และอัตราการเติบโต",
      },
      { property: "og:title", content: "วิเคราะห์ข้อมูลยอดขายและคำนวณตัวชี้วัดธุรกิจค้าปลีก" },
      {
        property: "og:description",
        content: "KPI ที่คำนวณจากข้อมูลจริงในไฟล์ พร้อมกราฟแนวโน้มและสินค้าขายดี",
      },
    ],
  }),
  component: StepSeven,
});

const KPI_LIST = [
  "ยอดขายรวม",
  "ยอดขายเฉลี่ยต่อบิล",
  "จำนวนรายการขาย",
  "สินค้าขายดีที่สุด",
  "หมวดหมู่ที่ทำรายได้สูงสุด",
  "ยอดขายรายวัน / รายเดือน",
  "อัตราการเติบโต (%)",
  "ลูกค้าซื้อซ้ำ (ถ้ามีข้อมูล)",
];

function StepSeven() {
  const flow = useFlow();
  const desc = "ระบบสามารถวิเคราะห์ข้อมูลยอดขายและคำนวณตัวชี้วัดที่เกี่ยวข้องกับธุรกิจค้าปลีก";

  if (flow.rows.length === 0) {
    return (
      <StepLayout step={7} description={desc}>
        <EmptyNotice>ยังไม่มีข้อมูลให้วิเคราะห์ กรุณาเริ่มจากขั้นตอนที่ 1</EmptyNotice>
      </StepLayout>
    );
  }

  const k = computeKpis(flow.rows);
  const daily = byDay(flow.rows);
  const topProducts = byKey(flow.rows, "product").slice(0, 5);

  return (
    <StepLayout step={7} description={desc} nextLabel="ดู Dashboard (ขั้นตอนที่ 8)">
      <div className="grid gap-5 lg:grid-cols-[0.9fr_1.5fr]">
        <Panel title="ตัวอย่างตัวชี้วัด (KPI)">
          <ul className="space-y-2.5">
            {KPI_LIST.map((k2) => (
              <li key={k2} className="flex items-center gap-2 text-sm">
                <CircleCheck className="size-4 shrink-0 text-primary" /> {k2}
              </li>
            ))}
          </ul>
        </Panel>

        <div className="space-y-5">
          <div className="grid gap-3 sm:grid-cols-3">
            {[
              { label: "ยอดขายรวม", value: baht(k.totalRevenue) },
              { label: "จำนวนรายการขาย", value: num(k.bills) },
              { label: "ยอดขายเฉลี่ยต่อบิล", value: baht(k.avgPerBill) },
              { label: "จำนวนสินค้าที่ขาย", value: num(k.items) },
              { label: "ลูกค้าทั้งหมด", value: num(k.customers) },
              { label: "อัตราการเติบโต", value: `+${k.growth}%` },
            ].map((c) => (
              <Panel key={c.label}>
                <p className="text-xs text-muted-foreground">{c.label}</p>
                <p className="mt-1 text-xl font-bold">{c.value}</p>
              </Panel>
            ))}
          </div>

          <Panel title="แนวโน้มยอดขายรายวัน">
            <div className="h-52">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={daily}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                  <XAxis dataKey="label" tick={{ fontSize: 11 }} stroke="var(--muted-foreground)" />
                  <Tooltip formatter={(v: number) => baht(v)} />
                  <Line
                    type="monotone"
                    dataKey="revenue"
                    stroke="var(--chart-1)"
                    strokeWidth={2}
                    dot={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </Panel>

          <Panel title="สินค้าขายดีที่สุด 5 อันดับ">
            <div className="h-52">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={topProducts}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                  <XAxis dataKey="name" tick={{ fontSize: 10 }} stroke="var(--muted-foreground)" />
                  <Tooltip formatter={(v: number) => baht(v)} />
                  <Bar dataKey="revenue" fill="var(--chart-1)" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Panel>
        </div>
      </div>
    </StepLayout>
  );
}
