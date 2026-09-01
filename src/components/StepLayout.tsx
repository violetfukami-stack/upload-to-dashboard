import { Link } from "@tanstack/react-router";
import { Check, ChevronLeft, ChevronRight } from "lucide-react";
import type { ReactNode } from "react";

export const STEPS = [
  { n: 1, to: "/", title: "นำเข้าข้อมูลยอดขายจากไฟล์ CSV / Excel", short: "นำเข้าไฟล์" },
  { n: 2, to: "/preview", title: "แสดงตัวอย่างและโครงสร้างของข้อมูลที่นำเข้าได้", short: "ตัวอย่างข้อมูล" },
  { n: 3, to: "/ai-analyze", title: "ใช้ AI วิเคราะห์และระบุความหมายของข้อมูลแต่ละ Column", short: "AI วิเคราะห์" },
  { n: 4, to: "/mapping", title: "เสนอการ Mapping ข้อมูลให้สอดคล้องกับโครงสร้างที่ระบบกำหนด", short: "เสนอ Mapping" },
  { n: 5, to: "/confirm", title: "ตรวจสอบ แก้ไข และยืนยันผลการ Mapping", short: "ยืนยัน Mapping" },
  { n: 6, to: "/prepare", title: "ตรวจสอบและเตรียมข้อมูลให้พร้อมสำหรับการวิเคราะห์", short: "เตรียมข้อมูล" },
  { n: 7, to: "/kpi", title: "วิเคราะห์ข้อมูลยอดขายและคำนวณตัวชี้วัดของธุรกิจค้าปลีก", short: "คำนวณ KPI" },
  { n: 8, to: "/dashboard", title: "แสดงผลการวิเคราะห์ผ่าน Dashboard พร้อมกราฟ ตาราง และ Insight", short: "Dashboard" },
] as const;

export function StepLayout({
  step,
  description,
  children,
  nextLabel,
  nextTo,
  nextDisabled,
  disabledHint,
}: {
  step: number;
  description: string;
  children: ReactNode;
  nextLabel?: string;
  nextTo?: string;
  nextDisabled?: boolean;
  disabledHint?: string;
}) {
  const current = STEPS[step - 1]!;
  const prev = STEPS[step - 2];
  const next = STEPS[step];

  return (
    <div className="min-h-screen">
      <header className="border-b border-border bg-card">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-5 py-4">
          <div>
            <p className="text-lg font-semibold">ระบบวิเคราะห์ข้อมูลยอดขาย</p>
            <p className="text-xs text-muted-foreground">
              สำหรับธุรกิจค้าปลีกด้วย Data Analytics
            </p>
          </div>
          <span className="rounded-full bg-accent px-3 py-1 text-xs font-medium text-accent-foreground">
            ขั้นตอน {step} / 8
          </span>
        </div>
      </header>

      <nav className="border-b border-border bg-card/60">
        <ol className="mx-auto flex max-w-6xl gap-1 overflow-x-auto px-5 py-3">
          {STEPS.map((s) => {
            const done = s.n < step;
            const active = s.n === step;
            return (
              <li key={s.n} className="shrink-0">
                <Link
                  to={s.to}
                  className={[
                    "flex items-center gap-2 rounded-full px-3 py-1.5 text-xs transition-colors",
                    active
                      ? "bg-primary text-primary-foreground"
                      : done
                        ? "bg-accent text-accent-foreground"
                        : "text-muted-foreground hover:bg-secondary",
                  ].join(" ")}
                >
                  <span
                    className={[
                      "flex size-5 items-center justify-center rounded-full text-[10px] font-semibold",
                      active ? "bg-primary-foreground/20" : "bg-secondary",
                    ].join(" ")}
                  >
                    {done ? <Check className="size-3" /> : s.n}
                  </span>
                  {s.short}
                </Link>
              </li>
            );
          })}
        </ol>
      </nav>

      <main className="mx-auto max-w-6xl px-5 py-8">
        <div className="flex items-start gap-4">
          <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary text-lg font-bold text-primary-foreground">
            {step}
          </span>
          <div>
            <h1 className="text-2xl font-bold text-foreground">{current.title}</h1>
            <p className="mt-1 text-sm text-muted-foreground">{description}</p>
          </div>
        </div>

        <div className="mt-7">{children}</div>

        <div className="mt-10 flex flex-wrap items-center justify-between gap-3 border-t border-border pt-5">
          {prev ? (
            <Link
              to={prev.to}
              className="inline-flex items-center gap-1 rounded-lg border border-border bg-card px-4 py-2 text-sm font-medium transition-colors hover:bg-secondary"
            >
              <ChevronLeft className="size-4" /> ขั้นตอนที่ {prev.n}
            </Link>
          ) : (
            <span />
          )}

          {next || nextTo ? (
            nextDisabled ? (
              <span className="text-xs text-muted-foreground">
                {disabledHint ?? "กรุณาทำขั้นตอนนี้ให้เสร็จก่อนไปต่อ"}
              </span>
            ) : (
              <Link
                to={nextTo ?? next!.to}
                className="inline-flex items-center gap-1 rounded-lg bg-primary px-5 py-2 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
              >
                {nextLabel ?? `ถัดไป: ${next!.short}`} <ChevronRight className="size-4" />
              </Link>
            )
          ) : null}
        </div>
      </main>
    </div>
  );
}

export function Panel({
  title,
  children,
  className,
}: {
  title?: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section
      className={[
        "rounded-2xl border border-border bg-card p-5 shadow-sm shadow-foreground/5",
        className ?? "",
      ].join(" ")}
    >
      {title ? <h2 className="mb-4 text-sm font-semibold text-foreground">{title}</h2> : null}
      {children}
    </section>
  );
}

export function EmptyNotice({ children }: { children: ReactNode }) {
  return (
    <Panel>
      <p className="text-sm text-muted-foreground">{children}</p>
      <Link
        to="/"
        className="mt-4 inline-flex rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary/90"
      >
        กลับไปขั้นตอนที่ 1
      </Link>
    </Panel>
  );
}
