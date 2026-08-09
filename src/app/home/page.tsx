import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PipelineTimeline } from "@/components/pipeline-timeline";
import { JobCard, SectionHead, StatusBadge, chipClass } from "@/components/home/bits";
import { BuyerMiniForm } from "@/components/home/buyer-mini-form";
import { JobExplorer } from "@/components/home/job-explorer";
import { SiteFooter, SiteHeader } from "@/components/site-chrome";
import { cn, won } from "@/lib/utils";
import {
  WEEKEND,
  ads,
  homeStats,
  jobs,
  mockSession,
  quickFilters,
  urgentJobs,
  workerStatus,
  type AdItem,
  type JobPost,
} from "@/lib/home-content";

export const metadata: Metadata = {
  title: "홈 | CAST",
  description: "모집 중인 행사 공고와 행사·광고를 한눈에 — 행사 전문 인력 플랫폼 CAST.",
};

export default function HomePage() {
  const weekendJobs = jobs.filter((j) => WEEKEND.days.includes(j.startDay));
  const hasWeekendAvailability = mockSession.availableDays.some((d) =>
    WEEKEND.days.includes(d),
  );

  return (
    <div className="min-h-svh bg-background text-base text-foreground lg:text-sm">
      <SiteHeader active="board" />

      {/* 검색 히어로 */}
      <section className="border-b bg-card">
        <div className="mx-auto max-w-6xl px-4 py-8 md:px-8 md:py-12">
          <p className="text-xs font-medium text-orange-700 tabular-nums">
            8월 2주차 · 모집 중 공고 {homeStats.openJobs}건 · 이번 주 시작{" "}
            {homeStats.startsThisWeek}건 · 활동 프로모터{" "}
            {homeStats.activeWorkers.toLocaleString("ko-KR")}명 · 재의뢰율{" "}
            {homeStats.rehireRate}%
          </p>
          <h1 className="mt-2 text-xl font-semibold md:text-2xl">
            일할 행사를 찾고, 함께할 사람을 만나는 곳
          </h1>
          <form className="mt-5 flex max-w-2xl gap-2" action="#">
            <Input
              name="q"
              placeholder="지역, 행사 유형, 역할로 검색"
              className="h-11 bg-background md:text-sm"
            />
            <Button type="submit" className="h-11 px-6">
              검색
            </Button>
          </form>
          <div className="mt-4 flex flex-wrap gap-2">
            {quickFilters.map((label) => (
              <a key={label} href="#" className={chipClass()}>
                {label}
              </a>
            ))}
          </div>
        </div>
      </section>

      <main className="mx-auto max-w-6xl px-4 pb-4 md:px-8">
        {/* 워커 상태 스트립 — 홈이 알림센터를 겸한다(mock 세션 로그인 상태) */}
        <section className="mt-6" aria-label="내 상태">
          <div
            className={cn(
              "dark flex flex-wrap items-center gap-x-5 gap-y-2 rounded-lg bg-background px-4 py-3 text-sm text-foreground",
              workerStatus.actionNeeded > 0 && "ring-1 ring-amber-400/40",
            )}
          >
            <span className="font-semibold">{mockSession.name}님</span>
            <a href="#" className="flex items-center gap-2">
              <span className="rounded-full bg-amber-500/15 px-2.5 py-0.5 text-xs font-medium text-amber-400">
                응답 필요 {workerStatus.actionNeeded}
              </span>
              <span className="text-xs text-amber-400 tabular-nums">
                {workerStatus.actionExpiresIn} 남음
              </span>
            </a>
            <a href="#" className="text-muted-foreground transition-colors hover:text-foreground">
              검토 중 <span className="font-semibold text-foreground tabular-nums">{workerStatus.reviewing}</span>
            </a>
            <a href="#" className="text-muted-foreground transition-colors hover:text-foreground">
              대기 <span className="font-semibold text-foreground tabular-nums">{workerStatus.standby}</span>
            </a>
            <a href="#" className="text-muted-foreground transition-colors hover:text-foreground">
              이번 주 확정 근무{" "}
              <span className="font-semibold text-foreground tabular-nums">
                {workerStatus.confirmedThisWeek}
              </span>
            </a>
          </div>
        </section>

        {/* 행사 & 광고 */}
        <section className="mt-10" aria-label="행사와 광고">
          <SectionHead title="행사 & 광고" caption="지금 주목받는 행사와 브랜드 캠페인" />
          <div className="mt-4 flex snap-x snap-mandatory gap-4 overflow-x-auto pb-2">
            {ads.map((item) => (
              <AdCard key={item.id} item={item} />
            ))}
          </div>
        </section>

        {/* 마감 임박 · 급구 */}
        <section className="mt-10" aria-label="마감 임박과 급구 공고">
          <SectionHead title="마감 임박 · 급구" caption="지금 응답하면 바로 확정되는 자리" />
          <div className="mt-4 flex snap-x snap-mandatory gap-4 overflow-x-auto pb-2">
            {urgentJobs.map((job) => (
              <UrgentCard key={job.id} job={job} />
            ))}
          </div>
        </section>

        {/* 이번 주말 한눈에 */}
        <section className="mt-10" aria-label="이번 주말 공고">
          <SectionHead
            title={WEEKEND.label}
            caption={
              hasWeekendAvailability
                ? `${mockSession.name}님, 토요일(8/15)이 가용일로 등록돼 있어요`
                : "가장 수요가 많은 주말 공고"
            }
          />
          <div className="mt-4 flex snap-x snap-mandatory gap-4 overflow-x-auto pb-2">
            {weekendJobs.map((job) => (
              <div key={job.id} className="w-72 shrink-0 snap-start">
                <JobCard job={job} rateNote={`${mockSession.grade} 기준`} />
              </div>
            ))}
          </div>
        </section>

        {/* 지도 구인맵 + 신규 공고 (클라이언트 필터) */}
        <JobExplorer />

        {/* 양방향 CTA */}
        <section className="mt-12 grid gap-4 lg:grid-cols-2" aria-label="시작하기">
          <div className="dark rounded-lg bg-background p-6 text-foreground">
            <h2 className="text-base font-semibold">일할 준비가 되셨나요?</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              프로필과 가용 일정을 등록하면 나에게 맞는 행사 요청과 공고를 받아볼 수
              있어요.
            </p>
            <Button className="mt-4" asChild>
              <a href="#">프로모터로 시작하기</a>
            </Button>
          </div>
          <BuyerMiniForm />
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

      <SiteFooter />
    </div>
  );
}

function AdCard({ item }: { item: AdItem }) {
  return (
    <a
      href="#"
      className="relative block aspect-video w-72 shrink-0 snap-start overflow-hidden rounded-lg md:w-80"
    >
      <Image
        src={item.img}
        alt={item.title}
        fill
        sizes="320px"
        className="object-cover"
      />
      <div className="absolute inset-0 scrim-b" />
      {item.ad && (
        <span className="absolute top-2 right-2 rounded bg-black/55 px-1.5 py-0.5 text-[10px] font-medium text-white">
          AD
        </span>
      )}
      <div className="absolute inset-x-0 bottom-0 p-4 text-white">
        <p className="text-xs opacity-80">{item.brand}</p>
        <p className="mt-0.5 text-sm font-semibold">{item.title}</p>
        <p className="mt-0.5 text-xs opacity-80">{item.note}</p>
      </div>
    </a>
  );
}

function UrgentCard({ job }: { job: JobPost }) {
  return (
    <Link
      href={`/jobs/${job.id}`}
      className="flex w-64 shrink-0 snap-start flex-col gap-2 rounded-lg border bg-card p-4 shadow-sm transition-colors duration-150 hover:border-foreground/25"
    >
      <div className="flex items-center justify-between gap-2">
        <span
          className={cn(
            "text-xs font-medium tabular-nums",
            job.critical ? "text-red-600" : "text-amber-700",
          )}
        >
          마감 {job.closesIn}
        </span>
        {job.urgent && <StatusBadge tone="red">급구</StatusBadge>}
      </div>
      <h3 className="text-sm leading-snug font-semibold">{job.title}</h3>
      <div className="text-xs text-muted-foreground tabular-nums">
        <p>{job.date}</p>
        <p className="mt-0.5">
          {job.place} · {job.role} {job.headcount}명
        </p>
      </div>
      <p className="mt-auto border-t pt-2 text-sm font-semibold tabular-nums">
        {won(job.rate)}
        <span className="font-normal text-muted-foreground">/h</span>
      </p>
    </Link>
  );
}
