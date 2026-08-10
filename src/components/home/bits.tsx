import Link from "next/link";

import { cn, won } from "@/lib/utils";
import { CONDITION_LABELS, jobHourly, type JobPost } from "@/lib/home-content";

export function SectionHead({
  title,
  caption,
  href,
  action,
}: {
  title: string;
  caption?: string;
  href?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex items-baseline justify-between gap-4">
      <div>
        <h2 className="text-base font-semibold">{title}</h2>
        {caption && <p className="mt-0.5 text-xs text-muted-foreground">{caption}</p>}
      </div>
      {action}
      {href && (
        <a
          href={href}
          className="shrink-0 text-xs text-muted-foreground transition-colors hover:text-foreground"
        >
          전체 보기 →
        </a>
      )}
    </div>
  );
}

export function chipClass(active?: boolean) {
  return cn(
    "inline-flex h-11 items-center rounded-full border bg-card px-4 transition-colors hover:bg-accent md:h-8 md:text-sm",
    active &&
      "border-transparent bg-foreground font-medium text-background hover:bg-foreground",
  );
}

export function StatusBadge({
  tone,
  children,
}: {
  tone: "amber" | "blue" | "red" | "green" | "neutral";
  children: React.ReactNode;
}) {
  const tones = {
    amber: "bg-amber-100 text-amber-800",
    blue: "bg-blue-100 text-blue-800",
    red: "bg-red-100 text-red-800",
    green: "bg-green-100 text-green-800",
    neutral: "border text-muted-foreground",
  };
  return (
    <span className={cn("rounded-full px-2 py-0.5 text-xs font-medium", tones[tone])}>
      {children}
    </span>
  );
}

// reasons가 있으면 AI 추천 변형 — 배지행이 추천 사유 칩으로 바뀌고 오렌지 강조 보더
export function JobCard({
  job,
  rateNote,
  reasons,
}: {
  job: JobPost;
  rateNote?: string;
  reasons?: string[];
}) {
  const rate = jobHourly(job);
  return (
    <Link
      href={`/jobs/${job.id}`}
      className={cn(
        "group flex flex-col gap-3 rounded-lg border bg-card p-4 shadow-sm transition-colors duration-150 hover:border-foreground/25",
        reasons && "border-orange-200 hover:border-primary",
      )}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex flex-wrap items-center gap-1.5">
          {reasons ? (
            reasons.map((r) => (
              <span
                key={r}
                className="rounded-full bg-orange-100 px-2 py-0.5 text-[11px] font-medium text-orange-700"
              >
                ✓ {r}
              </span>
            ))
          ) : (
            <>
              <StatusBadge tone="neutral">{job.category}</StatusBadge>
              {job.urgent && <StatusBadge tone="red">급구</StatusBadge>}
              {job.isNew && <StatusBadge tone="blue">신규</StatusBadge>}
              {job.conditions?.map((c) => (
                <StatusBadge key={c} tone="neutral">
                  {CONDITION_LABELS[c]}
                </StatusBadge>
              ))}
            </>
          )}
        </div>
        <span className="text-xs text-muted-foreground tabular-nums">{job.dday}</span>
      </div>
      <div>
        <h3 className="text-sm leading-snug font-semibold">{job.title}</h3>
        <p className="mt-0.5 text-xs text-muted-foreground">
          {reasons ? `${job.org} · ${job.category}` : job.org}
        </p>
      </div>
      <div className="text-xs text-muted-foreground tabular-nums">
        <p>{job.date}</p>
        <p className="mt-0.5">
          {job.place} · {job.role} {job.headcount}명
        </p>
      </div>
      <div className="mt-auto flex items-center justify-between border-t pt-3">
        <span
          className="text-sm font-semibold tabular-nums"
          title={rate.lines.map((l) => `${l.label} ${won(l.amount)}`).join(" + ")}
        >
          {won(rate.total)}
          <span className="font-normal text-muted-foreground">/h</span>
          {rateNote && (
            <span className="ml-1.5 text-xs font-medium text-orange-700">
              {rateNote}
              {rate.lines.length > 1 && " · 가산 포함"}
            </span>
          )}
        </span>
        {job.standby ? (
          <StatusBadge tone="amber">정원 충족 · 대기 지원</StatusBadge>
        ) : (
          <span className="text-xs font-medium text-green-700 tabular-nums">
            잔여 {job.remaining}자리
          </span>
        )}
      </div>
    </Link>
  );
}
