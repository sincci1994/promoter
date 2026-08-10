import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PipelineTimeline } from "@/components/pipeline-timeline";
import { JobCard, SectionHead, StatusBadge, chipClass } from "@/components/home/bits";
import { BuyerMiniForm } from "@/components/home/buyer-mini-form";
import { JobExplorer } from "@/components/home/job-explorer";
import { WorkerStrip } from "@/components/home/worker-strip";
import { SiteFooter, SiteHeader } from "@/components/site-chrome";
import { cn, won } from "@/lib/utils";
import {
  WEEKEND,
  ads,
  homeStats,
  jobHourly,
  jobOnDay,
  mockSession,
  quickFilters,
  recommendedJobs,
  urgentJobs,
  visibleJobs,
  type AdItem,
  type JobPost,
} from "@/lib/home-content";

export const metadata: Metadata = {
  title: "공고 탐색 | CAST",
  description: "모집 중인 행사 공고와 행사·광고를 한눈에 — 행사 전문 인력 플랫폼 CAST.",
};

// ?tab=buyer — 행사 담당자(Buyer) 면. 기본은 공고 탐색(Worker) 면.
export default async function HomePage({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string }>;
}) {
  const { tab } = await searchParams;
  const buyerTab = tab === "buyer";
  return (
    <div className="min-h-svh bg-background text-base text-foreground lg:text-sm">
      <SiteHeader active={buyerTab ? "buyer" : "board"} />
      {buyerTab ? <BuyerTab /> : <JobsTab />}
      <SiteFooter />
    </div>
  );
}

/* ---------------- 공고 탐색 탭 (Worker 면) ---------------- */

function JobsTab() {
  const weekendJobs = visibleJobs.filter((j) =>
    WEEKEND.days.some((d) => jobOnDay(j, d)),
  );
  const hasWeekendAvailability = mockSession.availableDays.some((d) =>
    WEEKEND.days.includes(d),
  );

  return (
    <>
      {/* 검색 히어로 — 현황 줄 + 제목·검색 인라인 + 퀵필터 */}
      <section className="border-b bg-card">
        <div className="mx-auto max-w-6xl px-4 py-6 md:px-8">
          <p className="text-xs font-medium text-orange-700 tabular-nums">
            8월 2주차 · 모집 중 공고 {homeStats.openJobs}건 · 이번 주 시작{" "}
            {homeStats.startsThisWeek}건 · 활동 프로모터{" "}
            {homeStats.activeWorkers.toLocaleString("ko-KR")}명 · 재의뢰율{" "}
            {homeStats.rehireRate}%
          </p>
          <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-3">
            <h1 className="text-lg font-semibold md:text-xl">
              일할 행사를 찾고, 함께할 사람을 만나는 곳
            </h1>
            <form className="flex min-w-[280px] flex-1 gap-2 md:max-w-xl" action="#">
              <Input
                name="q"
                placeholder="지역, 행사 유형, 역할로 검색"
                className="h-11 bg-background md:text-sm"
              />
              <Button type="submit" className="h-11 px-5">
                검색
              </Button>
            </form>
          </div>
          <div className="mt-3 flex flex-wrap gap-2">
            {quickFilters.map((label) => (
              <a key={label} href="#" className={chipClass()}>
                {label}
              </a>
            ))}
          </div>
        </div>
      </section>

      <main className="mx-auto max-w-6xl px-4 pb-4 md:px-8">
        {/* 워커 상태 스트립 = 프로필 허브 — 홈이 알림센터를 겸한다(mock 세션 로그인 상태) */}
        <WorkerStrip />

        {/* 본문 2열: 탐색(메인) + 광고·급구(aside) */}
        <div className="mt-7 grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_340px]">
          <div className="min-w-0">
            {/* AI 맞춤 추천 */}
            <section aria-label="AI 맞춤 추천">
              <SectionHead
                title={`${mockSession.name.slice(1)}님을 위한 AI 추천`}
                caption="가용일 · 선호 유형 · 등급을 반영해 매일 갱신됩니다"
              />
              <div className="mt-3 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                {recommendedJobs.map(({ job, reasons }) => (
                  <JobCard
                    key={job.id}
                    job={job}
                    rateNote={`${mockSession.grade} 기준`}
                    reasons={reasons}
                  />
                ))}
              </div>
            </section>

            {/* 이번 주말 */}
            <section className="mt-8" aria-label="이번 주말 공고">
              <SectionHead
                title={WEEKEND.label}
                caption={
                  hasWeekendAvailability
                    ? `${mockSession.name}님, 토요일(8/15)이 가용일로 등록돼 있어요`
                    : "가장 수요가 많은 주말 공고"
                }
              />
              <div className="mt-3 grid gap-3 sm:grid-cols-2">
                {weekendJobs.map((job) => (
                  <JobCard key={job.id} job={job} rateNote={`${mockSession.grade} 기준`} />
                ))}
              </div>
            </section>

            {/* 신규 공고 — 날짜·유형·거점 필터 + 목록/지도 뷰 (클라이언트) */}
            <JobExplorer />
          </div>

          <aside className="flex min-w-0 flex-col gap-5">
            {/* 행사 & 광고 */}
            <section aria-label="행사와 광고">
              <SectionHead title="행사 & 광고" caption="주목받는 캠페인" />
              <div className="mt-3 flex flex-col gap-2">
                {ads.map((item) => (
                  <AdCard key={item.id} item={item} />
                ))}
              </div>
            </section>

            {/* 마감 임박 · 급구 — 긴급 채널(불가 조건 제외 미적용, 적합도 배지로 고지) */}
            <section
              className="rounded-lg border border-orange-200 bg-gradient-to-b from-card to-orange-50 p-4 shadow-sm"
              aria-label="마감 임박과 급구 공고"
            >
              <div className="flex items-baseline justify-between gap-2">
                <h2 className="flex items-center gap-2 text-sm font-semibold">
                  <span className="animate-siren-pulse size-2 rounded-full bg-red-600" />
                  마감 임박 · 급구
                </h2>
                <span className="text-[11px] font-medium text-amber-700">
                  응답 즉시 확정
                </span>
              </div>
              <div className="mt-1.5 flex flex-col">
                {urgentJobs.map((job) => (
                  <UrgentRow key={job.id} job={job} />
                ))}
              </div>
            </section>
          </aside>
        </div>
      </main>
    </>
  );
}

function AdCard({ item }: { item: AdItem }) {
  return (
    <a href="#" className="relative block overflow-hidden rounded-lg p-3.5 text-white">
      <Image src={item.img} alt={item.title} fill sizes="340px" className="object-cover" />
      <div className="absolute inset-0 bg-black/50" />
      {item.ad && (
        <span className="absolute top-2 right-2 z-10 rounded bg-black/55 px-1.5 py-0.5 text-[10px] font-medium">
          AD
        </span>
      )}
      <div className="relative">
        <p className="text-[11px] opacity-80">{item.brand}</p>
        <p className="mt-0.5 text-sm font-semibold">{item.title}</p>
        <p className="mt-0.5 text-xs opacity-85">{item.note}</p>
      </div>
    </a>
  );
}

// 내 조건 대비 적합도 배지 — 긴급 채널은 불가 조건도 감추지 않고 라벨로 알린다
function urgentFits(job: JobPost) {
  const fits: { label: string; tone: "red" | "green" | "neutral" }[] = [];
  if (job.conditions?.some((c) => mockSession.blockedConditions.includes(c)))
    fits.push({ label: "✕ 내 불가 조건 포함", tone: "red" });
  if (mockSession.tags.includes(job.category))
    fits.push({ label: "✓ 선호 유형", tone: "green" });
  fits.push(
    mockSession.availableDays.some((d) => jobOnDay(job, d))
      ? { label: "✓ 가용일", tone: "green" }
      : { label: "가용일 아님", tone: "neutral" },
  );
  return fits;
}

function UrgentRow({ job }: { job: JobPost }) {
  const rate = jobHourly(job);
  return (
    <Link
      href={`/jobs/${job.id}`}
      className="-mx-2 flex flex-col gap-1 rounded-md border-t border-orange-200/60 px-2 py-2.5 transition-colors hover:bg-orange-100/50"
    >
      <span className="flex items-center gap-1.5">
        <span
          className={cn(
            "text-[11px] font-bold tabular-nums",
            job.critical ? "animate-siren-blink text-red-600" : "text-amber-700",
          )}
        >
          ⏱ 마감 {job.closesIn}
        </span>
        {job.urgent && <StatusBadge tone="red">급구</StatusBadge>}
        <span className="flex-1" />
        <span
          className="text-xs font-semibold tabular-nums"
          title={rate.lines.map((l) => `${l.label} ${won(l.amount)}`).join(" + ")}
        >
          {won(rate.total)}/h
        </span>
      </span>
      <span className="truncate text-[13px] font-semibold">{job.title}</span>
      <span className="truncate text-[11px] text-muted-foreground tabular-nums">
        {job.date} · {job.place} · {job.role} {job.headcount}명
      </span>
      <span className="mt-0.5 flex flex-wrap gap-1">
        {urgentFits(job).map((f) => (
          <StatusBadge key={f.label} tone={f.tone}>
            {f.label}
          </StatusBadge>
        ))}
      </span>
    </Link>
  );
}

/* ---------------- 행사 모집 탭 (Buyer 면) ---------------- */

function BuyerTab() {
  return (
    <main className="mx-auto max-w-6xl px-4 pb-4 md:px-8">
      {/* 히어로 + 견적 미니폼 */}
      <section className="mt-9" aria-label="행사 모집">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-xs font-bold tracking-widest text-orange-700">
            행사 담당자를 위한 CAST
          </p>
          <h1 className="mt-2.5 text-xl font-semibold md:text-2xl">
            조건만 입력하면 팀이 구성됩니다
          </h1>
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
            게시 후 기다리지 않습니다 — 입력 즉시 예상 후보와 견적을 확인하세요.
          </p>
        </div>
        <div className="mx-auto mt-6 max-w-2xl">
          <BuyerMiniForm />
        </div>
      </section>

      {/* 3중 안전망 */}
      <section className="mt-12" aria-label="이탈 안전망">
        <SectionHead
          title="이탈해도 행사는 멈추지 않습니다"
          caption="구해진 다음까지가 플랫폼의 일입니다"
        />
        <div className="mt-4 grid gap-4 md:grid-cols-3">
          <div className="rounded-lg border bg-card p-5 shadow-sm">
            <StatusBadge tone="amber">확인 필요</StatusBadge>
            <h3 className="mt-3 text-sm font-semibold">행사 전 자동 재확인</h3>
            <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
              D-3·D-1 확인을 자동으로 요청하고, 미응답은 위험으로 감지해 백업 후보를
              미리 찾아둡니다.
            </p>
          </div>
          <div className="rounded-lg border bg-card p-5 shadow-sm">
            <StatusBadge tone="amber">대기(Standby)</StatusBadge>
            <h3 className="mt-3 text-sm font-semibold">정원이 차도 지원은 쌓입니다</h3>
            <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
              모집을 유지하면 지원이 계속 접수됩니다. 이탈이 생기면 대기 지원자를 즉시
              승인해 재충원합니다.
            </p>
          </div>
          <div className="rounded-lg border bg-card p-5 shadow-sm">
            <StatusBadge tone="green">도착 확인</StatusBadge>
            <h3 className="mt-3 text-sm font-semibold">당일 결원은 긴급 대체</h3>
            <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
              당일 결원이 확인되면 플랫폼이 대체 인력을 탐색합니다. 성공 기준은 수락이
              아니라 현장 도착입니다.
            </p>
          </div>
        </div>
      </section>

      {/* 진행 타임라인 — 마케팅 모드 */}
      <section className="mt-12" aria-label="등록 후 진행 과정">
        <SectionHead
          title="등록 후엔 이렇게 진행됩니다"
          caption="팀 구성부터 행사 당일, 그 이후까지 한 흐름으로 관리됩니다"
        />
        <div className="mt-4 rounded-lg border bg-card p-5 shadow-sm">
          <PipelineTimeline miniatures />
        </div>
      </section>
    </main>
  );
}
