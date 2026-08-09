import Link from "next/link";

import { cn, won } from "@/lib/utils";
import type { JobPost } from "@/lib/home-content";

export function SectionHead({
  title,
  caption,
  href,
}: {
  title: string;
  caption?: string;
  href?: string;
}) {
  return (
    <div className="flex items-baseline justify-between gap-4">
      <div>
        <h2 className="text-base font-semibold">{title}</h2>
        {caption && <p className="mt-0.5 text-xs text-muted-foreground">{caption}</p>}
      </div>
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

export function JobCard({ job, rateNote }: { job: JobPost; rateNote?: string }) {
  return (
    <Link
      href={`/jobs/${job.id}`}
      className="group flex flex-col gap-3 rounded-lg border bg-card p-4 shadow-sm transition-colors duration-150 hover:border-foreground/25"
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex flex-wrap items-center gap-1.5">
          <StatusBadge tone="neutral">{job.category}</StatusBadge>
          {job.urgent && <StatusBadge tone="red">급구</StatusBadge>}
          {job.isNew && <StatusBadge tone="blue">신규</StatusBadge>}
        </div>
        <span className="text-xs text-muted-foreground tabular-nums">{job.dday}</span>
      </div>
      <div>
        <h3 className="text-sm leading-snug font-semibold">{job.title}</h3>
        <p className="mt-0.5 text-xs text-muted-foreground">{job.org}</p>
      </div>
      <div className="text-xs text-muted-foreground tabular-nums">
        <p>{job.date}</p>
        <p className="mt-0.5">
          {job.place} · {job.role} {job.headcount}명
        </p>
      </div>
      <div className="mt-auto flex items-center justify-between border-t pt-3">
        <span className="text-sm font-semibold tabular-nums">
          {won(job.rate)}
          <span className="font-normal text-muted-foreground">/h</span>
          {rateNote && (
            <span className="ml-1.5 text-xs font-medium text-orange-700">{rateNote}</span>
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
