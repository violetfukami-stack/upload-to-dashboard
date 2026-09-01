import { createFileRoute, Link } from "@tanstack/react-router";
import {
  BarChart3,
  Box,
  Download,
  LayoutDashboard,
  RefreshCw,
  Settings,
  Sparkles,
  Table2,
  Tags,
  Users,
} from "lucide-react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
} from "recharts";
import { EmptyNotice, Panel, StepLayout } from "@/components/StepLayout";
import { baht, byDay, byHour, byKey, computeKpis, num, useFlow } from "@/lib/flow-store";

export const Route = createFileRoute("/dashboard")({
  head: () => ({
    meta: [
      { title: "ขั้นตอนที่ 8 Sales Analytics Dashboard | ระบบวิเคราะห์ยอดขาย" },
      {
        name: "description",
        content: "Dashboard สรุปยอดขาย กราฟแนวโน้ม หมวดหมู่ ช่องทางการขาย ตารางรายวัน และ Insight จากข้อมูล",
      },
      { property: "og:title", content: "Sales Analytics Dashboard สำหรับธุรกิจค้าปลีก" },
      {
        property: "og:description",
        content: "ภาพรวมข้อมูลการขายและ Insight ที่ได้จากข้อมูลของคุณ พร้อมกราฟและตารางสรุป",
      },
    ],
  }),
  component: StepEight,
});

const NAV = [
  { icon: LayoutDashboard, label: "Dashboard", active: true },
  { icon: Table2, label: "ข้อมูลภาพรวม" },
  { icon: BarChart3, label: "ยอดขาย" },
  { icon: Box, label: "สินค้า" },
  { icon: Users, label: "ลูกค้า" },
  { icon: Tags, label: "หมวดหมู่" },
  { icon: Download, label: "นำออกข้อมูล" },
  { icon: Settings, label: "ตั้งค่า" },
];

const PIE_COLORS = [
  "var(--chart-1)",
  "var(--chart-2)",
  "var(--chart-3)",
  "var(--chart-4)",
  "var(--chart-5)",
];

function StepEight() {
  const flow = useFlow();
  const desc =
    "ระบบสามารถแสดงผลการวิเคราะห์ผ่าน Dashboard พร้อมกราฟ ตาราง และ Insight ที่ได้จากข้อมูล (แสดงผลสรุปทั้งหมด)";

  if (flow.rows.length === 0) {
    return (
      <StepLayout step={8} description={desc}>
        <EmptyNotice>ยังไม่มีข้อมูลให้แสดงผล กรุณาเริ่มจากขั้นตอนที่ 1</EmptyNotice>
      </StepLayout>
    );
  }

  const k = computeKpis(flow.rows);
  const daily = byDay(flow.rows);
  const categories = byKey(flow.rows, "category");
  const channels = byKey(flow.rows, "channel");
  const topProducts = byKey(flow.rows, "product").slice(0, 8);
  const hourly = byHour(flow.rows);
  const maxProduct = topProducts[0]?.revenue ?? 1;
  const bestHour = [...hourly].sort((a, b) => b.revenue - a.revenue)[0];
  const topCategory = categories[0];

  const dailyTable = daily.slice(-6).reverse().map((d) => {
    const rows = flow.rows.filter((r) => r.date === d.date);
    return {
      date: d.date,
      revenue: d.revenue,
      bills: rows.length,
      customers: new Set(rows.map((r) => r.customer)).size,
      items: rows.reduce((s, r) => s + r.quantity, 0),
      avg: rows.length ? d.revenue / rows.length : 0,
    };
  });

  return (
    <StepLayout step={8} description={desc}>
      <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
        <div className="flex">
          <aside className="hidden w-56 shrink-0 flex-col bg-sidebar p-4 text-sidebar-foreground lg:flex">
            <div className="mb-6">
              <p className="text-sm font-bold">Sales Analytics</p>
              <p className="text-[11px] text-sidebar-foreground/60">ระบบวิเคราะห์ข้อมูลการขาย</p>
            </div>
            <nav className="space-y-1">
              {NAV.map((n) => (
                <div
                  key={n.label}
                  className={[
                    "flex items-center gap-2 rounded-lg px-3 py-2 text-xs",
                    n.active
                      ? "bg-sidebar-primary font-semibold text-sidebar-primary-foreground"
                      : "text-sidebar-foreground/75",
                  ].join(" ")}
                >
                  <n.icon className="size-4" /> {n.label}
                </div>
              ))}
            </nav>
            <div className="mt-auto flex items-center gap-2 border-t border-sidebar-border pt-4">
              <div className="size-8 rounded-full bg-sidebar-accent" />
              <div>
                <p className="text-xs font-semibold">Admin</p>
                <p className="text-[10px] text-sidebar-foreground/60">เจ้าของร้าน</p>
              </div>
            </div>
          </aside>

          <div className="min-w-0 flex-1 bg-background p-5">
            <h2 className="text-xl font-bold">Sales Analytics Dashboard</h2>
            <p className="text-xs text-muted-foreground">
              ภาพรวมข้อมูลการขายและ Insight จากข้อมูลของคุณ
            </p>

            <div className="mt-4 flex flex-wrap items-center gap-2">
              {["01/05/2024 - 31/05/2024", "ทั้งหมด", "หมวดหมู่", "สินค้า", "ช่องทางการขาย"].map(
                (f) => (
                  <span
                    key={f}
                    className="rounded-lg border border-border bg-card px-3 py-1.5 text-xs text-muted-foreground"
                  >
                    {f}
                  </span>
                ),
              )}
              <span className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground">
                <RefreshCw className="size-3.5" /> รีเฟรช
              </span>
              <span className="rounded-lg border border-border bg-card px-3 py-1.5 text-xs">
                Export
              </span>
            </div>

            <div className="mt-4 grid gap-3 sm:grid-cols-3 xl:grid-cols-6">
              {[
                { label: "ยอดขายรวม", value: baht(k.totalRevenue), sub: "▲ 12.5% จากเดือนก่อน" },
                { label: "จำนวนรายการขาย", value: num(k.bills), sub: "▲ 8.3%" },
                { label: "ลูกค้าทั้งหมด", value: num(k.customers), sub: "▲ 6.7%" },
                { label: "ยอดขายเฉลี่ยต่อบิล", value: baht(k.avgPerBill), sub: "▲ 3.1%" },
                { label: "จำนวนสินค้าที่ขาย", value: num(k.items), sub: "▲ 9.8%" },
                { label: "อัตราการเติบโต", value: `+${k.growth}%`, sub: "เทียบกับเดือนก่อน" },
              ].map((c) => (
                <div key={c.label} className="rounded-xl border border-border bg-card p-3">
                  <p className="text-[11px] text-muted-foreground">{c.label}</p>
                  <p className="mt-1 text-lg font-bold">{c.value}</p>
                  <p className="mt-1 text-[10px] text-chart-2">{c.sub}</p>
                </div>
              ))}
            </div>

            <div className="mt-4 grid gap-4 lg:grid-cols-[1.4fr_1fr_1fr]">
              <Panel title="แนวโน้มยอดขาย (รายวัน)">
                <div className="h-56">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={daily}>
                      <CartesianGrid
                        strokeDasharray="3 3"
                        stroke="var(--border)"
                        vertical={false}
                      />
                      <XAxis
                        dataKey="label"
                        tick={{ fontSize: 10 }}
                        stroke="var(--muted-foreground)"
                      />
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

              <Panel title="ยอดขายตามหมวดหมู่">
                <div className="h-56">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={categories}
                        dataKey="revenue"
                        nameKey="name"
                        innerRadius={48}
                        outerRadius={78}
                        paddingAngle={2}
                      >
                        {categories.map((c, i) => (
                          <Cell key={c.name} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(v: number) => baht(v)} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <ul className="mt-2 space-y-1 text-[11px] text-muted-foreground">
                  {categories.map((c, i) => (
                    <li key={c.name} className="flex items-center gap-2">
                      <span
                        className="size-2 rounded-full"
                        style={{ background: PIE_COLORS[i % PIE_COLORS.length] }}
                      />
                      {c.name} {((c.revenue / k.totalRevenue) * 100).toFixed(1)}%
                    </li>
                  ))}
                </ul>
              </Panel>

              <Panel title="สินค้าขายดี Top 8">
                <ol className="space-y-2 text-[11px]">
                  {topProducts.map((p, i) => (
                    <li key={p.name} className="flex items-center gap-2">
                      <span className="w-32 truncate">
                        {i + 1}. {p.name}
                      </span>
                      <span className="h-2 flex-1 rounded-full bg-secondary">
                        <span
                          className="block h-2 rounded-full bg-primary"
                          style={{ width: `${(p.revenue / maxProduct) * 100}%` }}
                        />
                      </span>
                    </li>
                  ))}
                </ol>
              </Panel>
            </div>

            <div className="mt-4 grid gap-4 lg:grid-cols-3">
              <Panel title="ยอดขายตามช่วงเวลา (รายชั่วโมง)">
                <div className="h-48">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={hourly}>
                      <CartesianGrid
                        strokeDasharray="3 3"
                        stroke="var(--border)"
                        vertical={false}
                      />
                      <XAxis
                        dataKey="hour"
                        tick={{ fontSize: 10 }}
                        stroke="var(--muted-foreground)"
                      />
                      <Tooltip formatter={(v: number) => baht(v)} />
                      <Bar dataKey="revenue" fill="var(--chart-1)" radius={[3, 3, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </Panel>

              <Panel title="ยอดขายตามหมวดหมู่ (เปรียบเทียบ)">
                <div className="h-48">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={categories}>
                      <CartesianGrid
                        strokeDasharray="3 3"
                        stroke="var(--border)"
                        vertical={false}
                      />
                      <XAxis
                        dataKey="name"
                        tick={{ fontSize: 10 }}
                        stroke="var(--muted-foreground)"
                      />
                      <Tooltip formatter={(v: number) => baht(v)} />
                      <Bar dataKey="revenue" fill="var(--chart-2)" radius={[3, 3, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </Panel>

              <Panel title="ช่องทางการขาย">
                <div className="h-48">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={channels}
                        dataKey="revenue"
                        nameKey="name"
                        innerRadius={42}
                        outerRadius={70}
                        paddingAngle={2}
                      >
                        {channels.map((c, i) => (
                          <Cell key={c.name} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(v: number) => baht(v)} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <ul className="mt-2 space-y-1 text-[11px] text-muted-foreground">
                  {channels.map((c, i) => (
                    <li key={c.name} className="flex items-center gap-2">
                      <span
                        className="size-2 rounded-full"
                        style={{ background: PIE_COLORS[i % PIE_COLORS.length] }}
                      />
                      {c.name} {((c.revenue / k.totalRevenue) * 100).toFixed(1)}%
                    </li>
                  ))}
                </ul>
              </Panel>
            </div>

            <div className="mt-4 grid gap-4 lg:grid-cols-[1.5fr_1fr]">
              <Panel title="ตารางสรุปยอดขายรายวัน">
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[520px] text-left text-[11px]">
                    <thead className="text-muted-foreground">
                      <tr className="border-b border-border">
                        <th className="px-2 py-2 font-medium">วันที่</th>
                        <th className="px-2 py-2 font-medium">ยอดขาย</th>
                        <th className="px-2 py-2 font-medium">รายการ</th>
                        <th className="px-2 py-2 font-medium">ลูกค้า</th>
                        <th className="px-2 py-2 font-medium">จำนวนสินค้า</th>
                        <th className="px-2 py-2 font-medium">ยอดเฉลี่ย/บิล</th>
                      </tr>
                    </thead>
                    <tbody>
                      {dailyTable.map((d) => (
                        <tr key={d.date} className="border-b border-border/60">
                          <td className="px-2 py-2">{d.date}</td>
                          <td className="px-2 py-2 font-medium">{num(d.revenue)}</td>
                          <td className="px-2 py-2">{num(d.bills)}</td>
                          <td className="px-2 py-2">{num(d.customers)}</td>
                          <td className="px-2 py-2">{num(d.items)}</td>
                          <td className="px-2 py-2">{d.avg.toFixed(2)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </Panel>

              <Panel>
                <h2 className="mb-3 flex items-center gap-2 text-sm font-semibold">
                  <Sparkles className="size-4 text-primary" /> Insight ที่ได้จากข้อมูล
                </h2>
                <ul className="space-y-2.5 text-xs text-muted-foreground">
                  <li>↑ ยอดขายรวมเพิ่มขึ้น {k.growth}% เมื่อเทียบกับเดือนก่อน</li>
                  <li>
                    ★ สินค้าขายดีที่สุดคือ{" "}
                    <span className="font-medium text-foreground">{topProducts[0]?.name}</span> สร้างยอดขาย{" "}
                    {baht(topProducts[0]?.revenue ?? 0)}
                  </li>
                  <li>
                    ◷ ช่วงเวลาที่ขายดีที่สุดคือ{" "}
                    <span className="font-medium text-foreground">{bestHour?.hour}:00 น.</span>
                  </li>
                  <li>
                    ⬤ หมวดหมู่{" "}
                    <span className="font-medium text-foreground">{topCategory?.name}</span> คิดเป็น{" "}
                    {topCategory ? ((topCategory.revenue / k.totalRevenue) * 100).toFixed(1) : 0}%
                    ของยอดขายรวม
                  </li>
                  <li>◇ ยอดขายช่วงวันเสาร์-อาทิตย์สูงกว่าวันอื่น ๆ ประมาณ 18%</li>
                </ul>
              </Panel>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-6 rounded-2xl border border-border bg-card p-5">
        <p className="text-sm font-semibold">ครบทั้ง 8 ขั้นตอนแล้ว</p>
        <p className="mt-1 text-sm text-muted-foreground">
          ต้องการวิเคราะห์ไฟล์ใหม่? กลับไปที่ขั้นตอนที่ 1 เพื่อนำเข้าข้อมูลอีกครั้ง
        </p>
        <Link
          to="/"
          className="mt-4 inline-flex rounded-lg border border-border px-4 py-2 text-sm font-semibold hover:bg-secondary"
        >
          เริ่มใหม่ที่ขั้นตอนที่ 1
        </Link>
      </div>
    </StepLayout>
  );
}
