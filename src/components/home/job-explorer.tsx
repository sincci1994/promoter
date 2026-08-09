"use client";

import { useMemo, useState } from "react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  MAP_COORDS,
  STRIP_DAYS,
  dowLabel,
  isWeekendDay,
  jobOnDay,
  jobTabs,
  jobs,
  mockSession,
} from "@/lib/home-content";
import { JobCard, SectionHead, chipClass } from "./bits";

// 표시 그룹 탭 → 공고 category 매핑
const TAB_MAP: Record<string, string[]> = {
  "행사 STAFF": ["론칭 행사", "로드쇼"],
  "판촉·샘플링": ["판촉·샘플링"],
  "전시·박람회": ["전시·박람회"],
  팝업스토어: ["팝업스토어"],
  "공연·페스티벌": ["페스티벌", "쇼케이스", "콘서트"],
  "VIP·의전": ["VIP 행사"],
};

export function JobExplorer() {
  const [day, setDay] = useState<number | null>(null);
  const [tab, setTab] = useState("전체");
  const [zone, setZone] = useState<string | null>(null);

  const filtered = jobs.filter(
    (j) =>
      (day == null || jobOnDay(j, day)) &&
      (tab === "전체" || TAB_MAP[tab]?.includes(j.category)) &&
      (zone == null || j.zone === zone),
  );

  // 거점별 공고 수 — 맵 좌표가 있는 거점만 핀으로, 나머지는 각주
  const { spots, offMap } = useMemo(() => {
    const counts = new Map<string, number>();
    for (const j of jobs) counts.set(j.zone, (counts.get(j.zone) ?? 0) + 1);
    const spots = [...counts]
      .filter(([z]) => MAP_COORDS[z])
      .map(([z, count]) => ({ zone: z, count, ...MAP_COORDS[z] }));
    const offMap = [...counts].filter(([z]) => !MAP_COORDS[z]);
    return { spots, offMap };
  }, []);

  const hasFilter = day != null || tab !== "전체" || zone != null;

  const zoneButton = (s: { zone: string; count: number }) => (
    <button
      key={s.zone}
      type="button"
      onClick={() => setZone(zone === s.zone ? null : s.zone)}
      className={cn(
        "inline-flex min-h-8 items-center gap-1.5 rounded-full border bg-card px-2.5 text-xs shadow-sm transition-colors hover:border-foreground/30",
        zone === s.zone && "border-transparent bg-foreground text-background",
      )}
    >
      <span className="size-1.5 rounded-full bg-primary" />
      {s.zone}
      <span className="font-semibold tabular-nums">{s.count}</span>
    </button>
  );

  return (
    <>
      {/* 지도 구인맵 */}
      <section className="mt-10" aria-label="지도로 보는 공고">
        <SectionHead
          title="지도로 보는 공고"
          caption="거점을 선택하면 아래 공고 목록이 필터됩니다"
        />
        {/* 데스크탑: 자체 제작 수도권 개략 지도 + 핀 (지도 서비스 이미지 미사용) */}
        <div className="relative mt-4 hidden overflow-hidden rounded-lg border bg-card md:block">
          <svg viewBox="0 0 800 300" className="block h-auto w-full" aria-hidden>
            <rect width="800" height="300" className="fill-muted/60" />
            {/* 한강 */}
            <path
              d="M -10 205 C 120 185, 200 225, 320 215 C 420 207, 460 150, 560 162 C 660 174, 730 150, 810 128"
              className="fill-none stroke-card"
              strokeWidth="18"
              strokeLinecap="round"
            />
            <text x="24" y="284" className="fill-muted-foreground text-[12px]">
              수도권 개략도 — 위치는 근사치입니다
            </text>
          </svg>
          <div className="absolute inset-0">
            {spots.map((s) => (
              <div
                key={s.zone}
                className="absolute -translate-x-1/2 -translate-y-1/2"
                style={{ left: `${(s.x / 800) * 100}%`, top: `${(s.y / 300) * 100}%` }}
              >
                {zoneButton(s)}
              </div>
            ))}
          </div>
        </div>
        {/* 모바일: 같은 거점 버튼을 칩 행으로 */}
        <div className="mt-4 flex flex-wrap gap-2 md:hidden">
          {spots.map((s) => zoneButton(s))}
        </div>
        {offMap.length > 0 && (
          <p className="mt-2 text-xs text-muted-foreground">
            수도권 외:{" "}
            {offMap.map(([z, count]) => `${z} ${count}건`).join(" · ")}
          </p>
        )}
      </section>

      {/* 신규 공고 */}
      <section className="mt-10" aria-label="신규 공고">
        <SectionHead title="신규 공고" href="#" />

        {/* 주간 날짜 스트립 */}
        <div className="mt-4 flex gap-1.5 overflow-x-auto pb-1">
          {STRIP_DAYS.map((d) => {
            const count = jobs.filter((j) => jobOnDay(j, d)).length;
            const selected = day === d;
            return (
              <button
                key={d}
                type="button"
                onClick={() => setDay(selected ? null : d)}
                className={cn(
                  "flex min-h-11 w-12 shrink-0 flex-col items-center justify-center gap-0.5 rounded-lg border bg-card py-1.5 transition-colors hover:border-foreground/30",
                  selected && "border-transparent bg-foreground text-background",
                )}
              >
                <span
                  className={cn(
                    "text-[11px] leading-none",
                    isWeekendDay(d) && !selected ? "text-orange-700" : "text-muted-foreground",
                    selected && "text-background/80",
                  )}
                >
                  {dowLabel(d)}
                </span>
                <span className="text-sm leading-none font-semibold tabular-nums">{d}</span>
                <span
                  className={cn(
                    "text-[10px] leading-none tabular-nums",
                    count === 0 ? "text-muted-foreground/50" : "text-muted-foreground",
                    selected && "text-background/80",
                  )}
                >
                  {count === 0 ? "–" : `${count}건`}
                </span>
              </button>
            );
          })}
        </div>

        {/* 유형 탭 + 필터 초기화 */}
        <div className="mt-3 flex flex-wrap items-center gap-2">
          {jobTabs.map((label) => (
            <button
              key={label}
              type="button"
              onClick={() => setTab(label)}
              className={chipClass(tab === label)}
            >
              {label}
            </button>
          ))}
          {hasFilter && (
            <button
              type="button"
              onClick={() => {
                setDay(null);
                setTab("전체");
                setZone(null);
              }}
              className="text-xs text-muted-foreground underline underline-offset-2 transition-colors hover:text-foreground"
            >
              필터 초기화
            </button>
          )}
        </div>

        {/* 결과 그리드 */}
        {filtered.length > 0 ? (
          <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((job) => (
              <JobCard key={job.id} job={job} rateNote={`${mockSession.grade} 기준`} />
            ))}
          </div>
        ) : (
          <div className="mt-4 rounded-lg border bg-card p-8 text-center">
            <p className="text-sm font-medium">조건에 맞는 공고가 없어요</p>
            <p className="mt-1 text-xs text-muted-foreground">
              날짜·유형·지역 필터를 조정해 보세요
            </p>
          </div>
        )}

        <div className="mt-6 text-center">
          <Button variant="outline" asChild>
            <a href="#">공고 더 보기</a>
          </Button>
        </div>
      </section>
    </>
  );
}
