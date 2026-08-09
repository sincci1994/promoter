import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { StatusBadge } from "@/components/home/bits";
import { ApplyDock } from "@/components/jobs/apply-dock";
import { SiteFooter, SiteHeader } from "@/components/site-chrome";
import { GRADE_NAMES, GRADE_ORDER, GRADE_RATES } from "@/lib/buyer-flow-content";
import { jobs, mockSession, urgentJobs, type JobPost } from "@/lib/home-content";
import { cn, won } from "@/lib/utils";

const allJobs = [...urgentJobs, ...jobs];
const findJob = (id: string) => allJobs.find((j) => j.id === id);

export function generateStaticParams() {
  return allJobs.map((j) => ({ id: j.id }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const job = findJob((await params).id);
  return { title: job ? `${job.title} | CAST` : "공고 | CAST" };
}

export default async function JobDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const job = findJob((await params).id);
  if (!job) notFound();

  return (
    <div className="min-h-svh bg-background text-base text-foreground lg:text-sm">
      <SiteHeader active="board" />
      <main className="mx-auto max-w-6xl px-4 pb-28 md:px-8 lg:pb-8">
        <div className="py-6">
          <Link
            href="/home"
            className="text-xs text-muted-foreground transition-colors hover:text-foreground"
          >
            ← 공고 목록
          </Link>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          <div className="space-y-6 lg:col-span-2">
            {/* 헤더 */}
            <section className="rounded-lg border bg-card p-5 shadow-sm md:p-6">
              <div className="flex flex-wrap items-center gap-1.5">
                <StatusBadge tone="neutral">{job.category}</StatusBadge>
                {job.urgent && <StatusBadge tone="red">급구</StatusBadge>}
                {job.isNew && <StatusBadge tone="blue">신규</StatusBadge>}
                {job.standby && <StatusBadge tone="amber">정원 충족 · 대기 지원</StatusBadge>}
                <span className="ml-auto text-xs text-muted-foreground tabular-nums">
                  {job.dday ?? (job.closesIn ? `마감 ${job.closesIn}` : "")}
                </span>
              </div>
              <h1 className="mt-3 text-lg font-semibold md:text-xl">{job.title}</h1>
              <p className="mt-1 text-sm text-muted-foreground">{job.org}</p>
              <dl className="mt-4 grid gap-x-6 gap-y-2 text-sm sm:grid-cols-2">
                <div className="flex gap-2">
                  <dt className="w-14 shrink-0 text-muted-foreground">일시</dt>
                  <dd className="tabular-nums">{job.date}</dd>
                </div>
                <div className="flex gap-2">
                  <dt className="w-14 shrink-0 text-muted-foreground">장소</dt>
                  <dd>{job.place}</dd>
                </div>
                <div className="flex gap-2">
                  <dt className="w-14 shrink-0 text-muted-foreground">역할</dt>
                  <dd>
                    {job.role} {job.headcount}명 모집
                  </dd>
                </div>
                <div className="flex gap-2">
                  <dt className="w-14 shrink-0 text-muted-foreground">모집</dt>
                  <dd>
                    {job.standby ? (
                      <span className="font-medium text-amber-700">
                        정원 충족 — 대기 지원 접수 중
                      </span>
                    ) : (
                      <span className="font-medium text-green-700 tabular-nums">
                        잔여 {job.remaining ?? job.headcount}자리
                      </span>
                    )}
                  </dd>
                </div>
              </dl>
              {job.standby && (
                <p className="mt-3 rounded-md bg-amber-100 px-3 py-2 text-xs leading-relaxed text-amber-800">
                  정원이 찼지만 모집이 유지되고 있어요 — 이탈이 생기면 대기 지원자가 즉시
                  승인될 수 있습니다.
                </p>
              )}
            </section>

            {/* 단가 */}
            <section className="rounded-lg border bg-card p-5 shadow-sm md:p-6">
              <h2 className="text-base font-semibold">단가</h2>
              <p className="mt-2 text-2xl font-semibold tabular-nums">
                {won(job.rate)}
                <span className="text-sm font-normal text-muted-foreground">/h</span>
                <span className="ml-2 text-xs font-medium text-orange-700">
                  {mockSession.grade} 기준
                </span>
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                지금 보신 금액이 지원 기록에 남고, 승인 시점 금액으로 동결됩니다.
              </p>
              <div className="mt-4 overflow-x-auto">
                <table className="w-full text-xs tabular-nums">
                  <thead>
                    <tr className="border-b text-left text-muted-foreground">
                      <th className="py-1.5 font-medium">등급</th>
                      <th className="py-1.5 font-medium">의미</th>
                      <th className="py-1.5 text-right font-medium">기본 단가</th>
                    </tr>
                  </thead>
                  <tbody>
                    {GRADE_ORDER.map((g) => (
                      <tr
                        key={g}
                        className={cn(
                          "border-b last:border-0",
                          g === mockSession.grade && "bg-orange-50 font-medium",
                        )}
                      >
                        <td className="py-1.5">
                          {g}
                          {g === mockSession.grade && (
                            <span className="ml-1.5 text-[10px] text-orange-700">내 등급</span>
                          )}
                        </td>
                        <td className="py-1.5 text-muted-foreground">{GRADE_NAMES[g]}</td>
                        <td className="py-1.5 text-right">{won(GRADE_RATES[g])}/h</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <p className="mt-2 text-[11px] text-muted-foreground">
                등급별 기본 단가(정책 가설) — 역할·자격·행사 조건에 따라 가산이 붙습니다.
                좋은 근무 이력이 등급 산정에 반영돼요.
              </p>
            </section>

            {/* 근무 안내 */}
            <section className="rounded-lg border bg-card p-5 shadow-sm md:p-6">
              <h2 className="text-base font-semibold">근무 안내</h2>
              <ul className="mt-3 space-y-1.5 text-sm text-muted-foreground">
                <li>· 행사 유형: {job.category}</li>
                <li>· 담당 업무: {job.role} — 상세 업무는 확정 후 행사 안내에서 공지됩니다</li>
                <li>· 집합 장소·복장·담당자 연락은 확정 후 플랫폼 안내로 전달돼요</li>
              </ul>
            </section>

            {/* 같은 행사의 다른 역할 (I10 — 복수 Role 지원) */}
            {job.otherRoles && (
              <section className="rounded-lg border bg-card p-5 shadow-sm md:p-6">
                <h2 className="text-base font-semibold">이 행사의 다른 역할</h2>
                <div className="mt-3 space-y-2">
                  {job.otherRoles.map((r) => (
                    <div
                      key={r.name}
                      className="flex items-center justify-between rounded-md border px-3 py-2.5 text-sm"
                    >
                      <span>{r.name}</span>
                      <span className="text-muted-foreground tabular-nums">
                        {won(r.rate)}/h · 잔여 {r.remaining}
                      </span>
                    </div>
                  ))}
                </div>
                <p className="mt-2 text-[11px] text-muted-foreground">
                  같은 행사의 여러 역할에 동시에 지원할 수 있어요 — 한 역할이 먼저 승인되면
                  나머지 지원은 자동으로 마감됩니다.
                </p>
              </section>
            )}

            {/* 안심 요소 */}
            <section className="rounded-lg border bg-card p-5 shadow-sm md:p-6">
              <h2 className="text-base font-semibold">지원 전에 알아두세요</h2>
              <ul className="mt-3 space-y-1.5 text-sm text-muted-foreground">
                <li>· 지원은 사전 동의예요 — 승인되면 별도 수락 없이 바로 확정됩니다</li>
                <li>· 승인 전까지는 언제든 철회할 수 있어요</li>
                <li>· 다른 확정 근무와 시간이 겹치면 승인되지 않아요 (지원은 가능)</li>
              </ul>
            </section>
          </div>

          {/* 지원 독 (데스크탑 우측 레일 + 모바일 하단 바 + 시트) */}
          <ApplyDock job={job as JobPost} />
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
