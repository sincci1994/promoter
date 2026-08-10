"use client";

import { useState } from "react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  CONDITION_LABELS,
  METRO_PINS,
  REGION_PINS,
  STRIP_DAYS,
  ZONES,
  dowLabel,
  excludedCount,
  isWeekendDay,
  jobOnDay,
  jobTabs,
  mockSession,
  urgentJobs,
  visibleJobs,
} from "@/lib/home-content";
import { JobCard, chipClass } from "./bits";

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
  const [alertOn, setAlertOn] = useState(false);
  const [view, setView] = useState<"list" | "map">("list");

  const inTab = (category: string) =>
    tab === "전체" || !!TAB_MAP[tab]?.includes(category);

  const filtered = visibleJobs.filter(
    (j) =>
      (day == null || jobOnDay(j, day)) &&
      inTab(j.category) &&
      (zone == null || j.zone === zone),
  );

  // 거점별 건수 — 급구 포함(긴급 채널도 분포에 노출), 날짜·유형 필터 반영
  const zoneCounts = new Map<string, number>();
  for (const j of [...urgentJobs, ...visibleJobs]) {
    if ((day == null || jobOnDay(j, day)) && inTab(j.category))
      zoneCounts.set(j.zone, (zoneCounts.get(j.zone) ?? 0) + 1);
  }
  const metroTotal = Object.keys(METRO_PINS).reduce(
    (t, z) => t + (zoneCounts.get(z) ?? 0),
    0,
  );

  const hasFilter = day != null || tab !== "전체" || zone != null;

  const zoneButton = (z: string, className?: string) => {
    const on = zone === z;
    return (
      <button
        key={z}
        type="button"
        onClick={() => setZone(on ? null : z)}
        className={cn(
          "inline-flex min-h-8 items-center gap-1.5 rounded-full border bg-card px-2.5 text-xs shadow-sm transition-colors hover:border-foreground/30",
          on && "border-transparent bg-foreground text-background",
          className,
        )}
      >
        <span className="size-1.5 rounded-full bg-primary" />
        {z}
        <span className="font-semibold tabular-nums">{zoneCounts.get(z) ?? 0}</span>
      </button>
    );
  };

  return (
    <section className="mt-8" aria-label="신규 공고">
      {/* 헤더: 제목 + 목록/지도 토글 + 알림 옵트인 */}
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 className="text-base font-semibold">신규 공고</h2>
        <span className="flex flex-wrap items-center gap-2">
          <span className="inline-flex gap-0.5 rounded-full border bg-card p-0.5">
            {(["list", "map"] as const).map((v) => (
              <button
                key={v}
                type="button"
                onClick={() => setView(v)}
                className={cn(
                  "rounded-full px-3 py-1 text-xs font-medium transition-colors",
                  view === v
                    ? "bg-foreground text-background"
                    : "text-muted-foreground hover:text-foreground",
                )}
              >
                {v === "list" ? "목록" : "지도"}
              </button>
            ))}
          </span>
          <button
            type="button"
            onClick={() => setAlertOn((v) => !v)}
            className={cn(
              "shrink-0 rounded-full border bg-card px-3 py-1.5 text-xs font-medium transition-colors hover:border-foreground/30",
              alertOn && "border-transparent bg-foreground text-background",
            )}
          >
            {alertOn ? "알림 신청됨 ✓ · 가용일·지역 기준" : "새 공고 알림 받기"}
          </button>
        </span>
      </div>

      {/* 주간 날짜 스트립 — 하단 바 = 내 가용일 */}
      <div className="mt-3 flex gap-1.5 overflow-x-auto pb-1">
        {STRIP_DAYS.map((d) => {
          const count = visibleJobs.filter((j) => jobOnDay(j, d)).length;
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
              <span
                className={cn(
                  "h-[3px] w-3.5 rounded-full",
                  mockSession.availableDays.includes(d)
                    ? selected
                      ? "bg-orange-400"
                      : "bg-primary"
                    : "bg-transparent",
                )}
              />
            </button>
          );
        })}
      </div>
      <p className="text-[11px] text-muted-foreground">
        <span className="mr-1.5 inline-block h-[3px] w-3.5 rounded-full bg-primary align-middle" />
        내 가용일
      </p>

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

      {/* 목록 뷰: 거점 핀 칩 행 */}
      {view === "list" && (
        <div className="mt-2.5 flex flex-wrap items-center gap-1.5">
          {ZONES.map((z) => zoneButton(z))}
        </div>
      )}

      {/* 지도 뷰: 전국 개략도 + 수도권 확대 (자체 SVG — 지도 서비스 이미지 미사용) */}
      {view === "map" && (
        <div className="mt-2.5 rounded-lg border bg-card p-4 shadow-sm">
          <div className="flex flex-wrap items-baseline justify-between gap-2">
            <span className="text-[13px] font-semibold">
              {day != null ? `8/${day} 기준 공고 분포` : "전체 기간 공고 분포"}
            </span>
            <span className="text-[11px] text-muted-foreground">
              자체 개략도 — 위치는 근사치 · 거점을 누르면 목록이 필터됩니다
            </span>
          </div>
          <div className="mt-3 grid gap-4 md:grid-cols-[1fr_1.25fr]">
            {/* 전국 개략도 + 광역 핀 */}
            <div className="relative">
              <svg viewBox="0 0 400 520" className="block h-auto w-full" aria-hidden>
                <path
                  d="M 90 55 C 110 40, 130 30, 152 26 C 175 30, 195 40, 212 46 C 245 52, 275 55, 300 62 C 322 105, 340 160, 337 225 C 334 285, 322 350, 306 420 C 288 448, 255 445, 222 456 C 190 468, 158 458, 128 466 C 104 452, 98 420, 92 388 C 82 348, 94 315, 84 278 C 74 240, 90 205, 82 168 C 76 130, 84 90, 90 55 Z"
                  className="fill-muted stroke-border"
                  strokeWidth="1.5"
                />
                <ellipse
                  cx="150"
                  cy="500"
                  rx="36"
                  ry="14"
                  className="fill-muted stroke-border"
                  strokeWidth="1.5"
                />
              </svg>
              <span className="absolute top-[17%] left-[26%] inline-flex -translate-x-1/2 -translate-y-1/2 items-center gap-1.5 rounded-full border-[1.5px] border-primary bg-orange-100 px-2.5 py-1 text-xs font-bold whitespace-nowrap text-orange-700 shadow-sm">
                <span className="size-1.5 rounded-full bg-primary" />
                수도권 <span className="tabular-nums">{metroTotal}건</span>
              </span>
              {Object.entries(REGION_PINS).map(([z, pos]) => {
                const n = zoneCounts.get(z) ?? 0;
                const on = zone === z;
                return (
                  <button
                    key={z}
                    type="button"
                    disabled={n === 0}
                    onClick={() => setZone(on ? null : z)}
                    style={{ left: `${pos.x}%`, top: `${pos.y}%` }}
                    className={cn(
                      "absolute inline-flex -translate-x-1/2 -translate-y-1/2 items-center gap-1 rounded-full border px-2 py-0.5 text-[11px] whitespace-nowrap",
                      on
                        ? "border-transparent bg-foreground text-background"
                        : n > 0
                          ? "bg-card transition-colors hover:border-foreground/30"
                          : "border-transparent text-muted-foreground/60",
                    )}
                  >
                    <span
                      className={cn(
                        "size-1 rounded-full",
                        n > 0 ? "bg-primary" : "bg-muted-foreground/40",
                      )}
                    />
                    {z}{" "}
                    <span className="font-semibold tabular-nums">{n > 0 ? n : "–"}</span>
                  </button>
                );
              })}
            </div>
            {/* 수도권 확대 + 거점 핀 */}
            <div>
              <div className="relative overflow-hidden rounded-lg border">
                <svg viewBox="0 0 800 420" className="block h-auto w-full" aria-hidden>
                  <rect width="800" height="420" className="fill-muted/60" />
                  <path
                    d="M -10 287 C 120 259, 200 315, 320 301 C 420 290, 460 210, 560 227 C 660 244, 730 210, 810 179"
                    className="fill-none stroke-card"
                    strokeWidth="22"
                    strokeLinecap="round"
                  />
                </svg>
                <span className="absolute right-3 bottom-2 text-[11px] text-muted-foreground">
                  수도권 확대
                </span>
                {Object.entries(METRO_PINS).map(([z, pos]) => (
                  <div
                    key={z}
                    className="absolute -translate-x-1/2 -translate-y-1/2"
                    style={{ left: `${pos.x}%`, top: `${pos.y}%` }}
                  >
                    {zoneButton(z, "min-h-0 px-2 py-0.5 text-[11px]")}
                  </div>
                ))}
              </div>
              <p className="mt-2 text-[11px] text-muted-foreground">
                수도권 거점은 확대 지도에서 선택하세요. 공고가 없는 지역은 흐리게
                표시됩니다.
              </p>
            </div>
          </div>
        </div>
      )}

      {excludedCount > 0 && (
        <p className="mt-3 text-xs text-muted-foreground">
          내 불가 조건(
          {mockSession.blockedConditions.map((c) => CONDITION_LABELS[c]).join(" · ")})에
          해당하는 공고 {excludedCount}건은 표시하지 않았어요 ·{" "}
          <a
            href="#"
            className="underline underline-offset-2 transition-colors hover:text-foreground"
          >
            불가 조건 설정
          </a>
        </p>
      )}

      {/* 결과 그리드 */}
      {filtered.length > 0 ? (
        <div className="mt-3 grid grid-cols-[repeat(auto-fill,minmax(250px,1fr))] gap-3">
          {filtered.map((job) => (
            <JobCard key={job.id} job={job} rateNote={`${mockSession.grade} 기준`} />
          ))}
        </div>
      ) : (
        <div className="mt-3 rounded-lg border border-dashed bg-card p-10 text-center">
          <p className="text-sm font-medium">조건에 맞는 공고가 없어요</p>
          <p className="mt-1 text-xs text-muted-foreground">
            날짜·유형·지역 필터를 조정해 보세요
          </p>
        </div>
      )}

      <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
        <p className="text-xs text-muted-foreground">
          단가는 내 등급 기본단가에 역할 자격·행사 조건 가산을 더한 세전 금액이에요 —
          3.3% 원천징수 후 지급됩니다.
        </p>
        <Button variant="outline" size="sm" asChild>
          <a href="#">공고 더 보기</a>
        </Button>
      </div>
    </section>
  );
}
