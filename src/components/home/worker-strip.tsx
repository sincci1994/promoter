"use client";

import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { EVENT_TYPES } from "@/lib/buyer-flow-content";
import {
  CONDITION_LABELS,
  MOCK_TODAY,
  mockSession,
  workerStatus,
  type JobCondition,
} from "@/lib/home-content";

// 2026-08 미니 달력 — 1일(토) 시작 오프셋 6, 31일
const CAL_OFFSET = 6;
const CAL_DAYS = 31;
const DOW = ["일", "월", "화", "수", "목", "금", "토"];

// 워커 상태 스트립 = 프로필 허브: 접힌 요약 행 → 펼침 패널(가용일 달력 + 매칭 설정) → 수정 모달
export function WorkerStrip() {
  const [open, setOpen] = useState(false);
  const [modal, setModal] = useState(false);
  const { profile } = mockSession;

  return (
    <section className="mt-5" aria-label="내 상태">
      <div
        className={cn(
          "dark overflow-hidden rounded-lg bg-background text-sm text-foreground",
          workerStatus.actionNeeded > 0 && "ring-1 ring-amber-400/40",
        )}
      >
        {/* 접힌 행: 아바타 + 요약 + 상태 항목 + 토글 */}
        <div className="flex items-start gap-3.5 px-4 py-3">
          <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-primary text-sm font-extrabold text-primary-foreground">
            {mockSession.name.charAt(1)}
          </span>
          <div className="flex min-w-0 flex-1 flex-col gap-1.5">
            <p className="flex flex-wrap items-center gap-x-2.5 gap-y-1">
              <span className="font-semibold">{mockSession.name}님</span>
              <span
                className="cursor-help font-bold text-orange-400 tabular-nums"
                title="함께 일한 사람들의 평가로 오르내리는 0~100점 공개 점수 (표기·산식 [정책])"
              >
                {mockSession.score}점
              </span>
              <span className="rounded-full border border-orange-400/50 px-1.5 py-px text-[11px] font-bold text-orange-400">
                {mockSession.grade}
              </span>
              <span className="text-xs text-muted-foreground">
                {profile.role} · {profile.basics.split(" · ").slice(0, 2).join(" · ")} ·{" "}
                {profile.regionShort} · {profile.languages.replace(" · ", "·")} · 주말
                가능 ·{" "}
                <span className="text-red-400">
                  {mockSession.blockedConditions
                    .map((c) => `${CONDITION_LABELS[c]} 불가`)
                    .join(" · ")}
                </span>
              </span>
            </p>
            <p className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[13px]">
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
              <a
                href="#"
                className="flex items-center gap-2 text-muted-foreground transition-colors hover:text-foreground"
              >
                행사 방{" "}
                <span className="font-semibold text-foreground tabular-nums">
                  {workerStatus.eventRooms.open}
                </span>
                {workerStatus.eventRooms.unread > 0 && (
                  <span className="rounded-full bg-amber-500/15 px-2 py-0.5 text-xs font-medium text-amber-400">
                    새 공지 {workerStatus.eventRooms.unread}
                  </span>
                )}
              </a>
            </p>
          </div>
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            className="w-[118px] shrink-0 self-start rounded-full border border-foreground/25 py-1 text-xs font-semibold transition-colors hover:border-orange-400 hover:text-orange-400"
          >
            {open ? "접기 ▴" : "펼치기 ▾"}
          </button>
        </div>

        {/* 펼침 패널: 가용일 달력 + 내 소개·매칭 설정 */}
        {open && (
          <div className="grid gap-5 border-t border-foreground/10 px-4 py-4 md:grid-cols-[300px_1fr]">
            <div>
              <div className="flex items-baseline justify-between">
                <span className="text-xs font-bold tracking-wide text-foreground/55">
                  8월 가용일
                </span>
                <a href="#" className="text-[11px] text-orange-400">
                  가용일 관리 ›
                </a>
              </div>
              <div className="mt-2.5 grid max-w-[280px] grid-cols-7 gap-[3px]">
                {DOW.map((d, i) => (
                  <span
                    key={d}
                    className={cn(
                      "text-center text-[10px]",
                      i === 0 || i === 6 ? "text-orange-400" : "text-muted-foreground",
                    )}
                  >
                    {d}
                  </span>
                ))}
                {Array.from({ length: CAL_OFFSET }, (_, i) => (
                  <span key={`pad-${i}`} />
                ))}
                {Array.from({ length: CAL_DAYS }, (_, i) => {
                  const d = i + 1;
                  const avail = mockSession.availableDays.includes(d);
                  const confirmed = d === mockSession.confirmedWork.day;
                  return (
                    <span
                      key={d}
                      title={
                        confirmed ? mockSession.confirmedWork.label : avail ? "가용일" : undefined
                      }
                      className={cn(
                        "flex aspect-square items-center justify-center rounded-md text-[11px] tabular-nums",
                        confirmed
                          ? "border border-green-400/55 bg-green-400/15 font-bold text-green-400"
                          : avail
                            ? "bg-primary/90 font-bold text-primary-foreground"
                            : d < MOCK_TODAY
                              ? "bg-foreground/5 text-muted-foreground/45"
                              : "bg-foreground/5 text-muted-foreground",
                      )}
                    >
                      {d}
                    </span>
                  );
                })}
              </div>
              <p className="mt-2.5 flex gap-3 text-[10.5px] text-muted-foreground">
                <span>
                  <span className="mr-1 inline-block size-2 rounded-[3px] bg-primary/90 align-middle" />
                  가용일
                </span>
                <span>
                  <span className="mr-1 inline-block size-2 rounded-[3px] border border-green-400/60 bg-green-400/25 align-middle" />
                  확정 근무
                </span>
              </p>
            </div>
            <div>
              <div className="flex items-baseline justify-between">
                <span className="text-xs font-bold tracking-wide text-foreground/55">
                  내 소개 · 매칭 설정
                </span>
                <button
                  type="button"
                  onClick={() => setModal(true)}
                  className="text-[11px] text-orange-400"
                >
                  프로필 수정 ›
                </button>
              </div>
              <dl className="mt-2.5 flex flex-col gap-2 text-[12.5px]">
                <div className="flex gap-2">
                  <dt className="w-[58px] shrink-0 text-muted-foreground">선호 유형</dt>
                  <dd className="flex flex-wrap gap-1">
                    {mockSession.tags.map((t) => (
                      <span
                        key={t}
                        className="rounded-full border border-primary/35 bg-primary/15 px-2 py-px text-[11px] text-orange-400"
                      >
                        {t}
                      </span>
                    ))}
                  </dd>
                </div>
                <div className="flex gap-2">
                  <dt className="w-[58px] shrink-0 text-muted-foreground">불가 조건</dt>
                  <dd className="flex flex-wrap gap-1">
                    {mockSession.blockedConditions.map((c) => (
                      <span
                        key={c}
                        className="rounded-full border border-red-500/35 bg-red-500/15 px-2 py-px text-[11px] text-red-400"
                      >
                        {CONDITION_LABELS[c]}
                      </span>
                    ))}
                  </dd>
                </div>
                <div className="flex gap-2">
                  <dt className="w-[58px] shrink-0 text-muted-foreground">활동 지역</dt>
                  <dd>{profile.regionDetail}</dd>
                </div>
                <div className="flex gap-2">
                  <dt className="w-[58px] shrink-0 text-muted-foreground">경력</dt>
                  <dd className="tabular-nums">
                    완료 {mockSession.completed}회 · 재의뢰 {profile.rehires}회
                  </dd>
                </div>
                <div className="flex gap-2">
                  <dt className="w-[58px] shrink-0 text-muted-foreground">자격</dt>
                  <dd>
                    {profile.certs}{" "}
                    <span className="text-muted-foreground">
                      · {profile.certsMissing} 미보유
                    </span>
                  </dd>
                </div>
                <div className="flex gap-2">
                  <dt className="w-[58px] shrink-0 text-muted-foreground">한 줄 소개</dt>
                  <dd className="leading-normal text-foreground/80">
                    &ldquo;{profile.catchphrase}&rdquo;
                  </dd>
                </div>
              </dl>
            </div>
          </div>
        )}
      </div>

      {modal && <ProfileModal onClose={() => setModal(false)} />}
    </section>
  );
}

// 포트폴리오 수정 모달 — 네이티브 <dialog>(ESC·포커스 트랩·백드롭 기본 제공)
function ProfileModal({ onClose }: { onClose: () => void }) {
  const [prefs, setPrefs] = useState<string[]>(mockSession.tags);
  const [blocks, setBlocks] = useState<JobCondition[]>(mockSession.blockedConditions);
  const { profile } = mockSession;
  const toggle = <T,>(list: T[], v: T) =>
    list.includes(v) ? list.filter((x) => x !== v) : [...list, v];

  return (
    <dialog
      ref={(el) => {
        if (el && !el.open) el.showModal();
      }}
      onClose={onClose}
      onClick={(e) => e.target === e.currentTarget && e.currentTarget.close()}
      className="m-auto max-h-[90vh] w-[calc(100vw-40px)] max-w-4xl overflow-y-auto rounded-2xl bg-card text-foreground shadow-2xl backdrop:bg-black/55 backdrop:backdrop-blur-[3px]"
    >
      <div className="sticky top-0 z-5 flex items-center gap-2.5 rounded-t-2xl border-b bg-card px-6 py-4">
        <span className="text-base font-bold">내 포트폴리오</span>
        <span className="text-xs text-muted-foreground">
          Buyer가 팀 구성 시 보게 되는 프로필입니다
        </span>
        <span className="flex-1" />
        <a href="#" className="text-xs font-semibold whitespace-nowrap text-orange-700">
          미리보기 ↗
        </a>
        <button
          type="button"
          onClick={onClose}
          aria-label="닫기"
          className="size-[30px] rounded-full bg-muted text-sm text-muted-foreground transition-colors hover:bg-border hover:text-foreground"
        >
          ✕
        </button>
      </div>

      <div className="flex flex-col gap-6 px-6 pt-5 pb-6">
        <div className="grid items-start gap-5 md:grid-cols-[340px_1fr]">
          {/* 사진 그리드 — 목업 플레이스홀더 */}
          <div>
            <div className="flex items-baseline justify-between">
              <span className="text-xs font-bold text-muted-foreground">
                사진 <span className="font-normal">— 최대 8장, 첫 장이 대표</span>
              </span>
              <span className="text-[11px] text-muted-foreground">드래그로 순서 변경</span>
            </div>
            <div className="mt-2 grid grid-cols-3 gap-2">
              <div className="relative col-span-2 row-span-2 flex aspect-3/4 items-center justify-center overflow-hidden rounded-xl bg-gradient-to-br from-secondary to-border">
                <span className="text-xs text-muted-foreground">대표 사진</span>
                <span className="absolute top-2 left-2 rounded-full bg-primary px-2 py-0.5 text-[10.5px] font-bold text-primary-foreground">
                  대표
                </span>
              </div>
              {["현장 #1", "현장 #2", "프로필 #2"].map((label) => (
                <div
                  key={label}
                  className="flex aspect-3/4 items-center justify-center rounded-lg bg-gradient-to-br from-secondary to-border"
                >
                  <span className="text-[10.5px] text-muted-foreground">{label}</span>
                </div>
              ))}
              <button
                type="button"
                className="flex aspect-3/4 flex-col items-center justify-center gap-1 rounded-lg border-[1.5px] border-dashed bg-background text-[11px] text-muted-foreground transition-colors hover:border-primary hover:text-orange-700"
              >
                <span className="text-lg">+</span>사진 추가
              </button>
            </div>
          </div>

          {/* 소개·기본 정보 */}
          <div className="flex min-w-0 flex-col gap-3.5">
            <p className="flex flex-wrap items-center gap-2.5">
              <span className="text-lg font-extrabold">{mockSession.name}</span>
              <span className="font-bold text-orange-700 tabular-nums">
                {mockSession.score}점
              </span>
              <span className="rounded-full bg-orange-100 px-2 py-px text-[11px] font-bold text-orange-700">
                {mockSession.grade}
              </span>
              <span className="text-xs text-muted-foreground">
                {profile.role} · 프로모터
              </span>
            </p>
            <label className="flex flex-col gap-1 text-[11.5px] font-semibold text-muted-foreground">
              캐치프레이즈
              <Input defaultValue={profile.catchphrase} className="h-10 font-semibold" />
            </label>
            <label className="flex flex-col gap-1 text-[11.5px] font-semibold text-muted-foreground">
              자기 소개
              <textarea
                rows={4}
                defaultValue={profile.intro}
                className="rounded-md border border-input bg-transparent p-2.5 text-sm leading-relaxed font-normal text-foreground outline-none focus:border-primary"
              />
            </label>
            <dl className="grid grid-cols-2 gap-x-3.5 gap-y-1.5 text-[12.5px]">
              {(
                [
                  ["기본", profile.basics],
                  ["지역", profile.regionDetail],
                  ["언어", profile.languages],
                  ["자격", profile.certs],
                  ["가능", profile.availableFor],
                  ["경력", `완료 ${mockSession.completed}회 · 재의뢰 ${profile.rehires}회`],
                ] as const
              ).map(([k, v]) => (
                <div key={k} className="flex gap-2">
                  <dt className="w-[52px] shrink-0 text-muted-foreground">{k}</dt>
                  <dd className="tabular-nums">{v}</dd>
                </div>
              ))}
            </dl>
            <div className="rounded-lg border bg-background px-3.5 py-3">
              <div className="flex items-baseline justify-between text-[11.5px] font-bold text-muted-foreground">
                대표 경력
                <a href="#" className="font-semibold text-orange-700">
                  + 추가
                </a>
              </div>
              <ul className="mt-2 flex flex-col gap-1.5 text-[12.5px]">
                {profile.career.map((c) => (
                  <li key={c.title}>
                    {c.title} <span className="text-muted-foreground">{c.when}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* 선호 유형·불가 조건 — 클라이언트 로컬 토글(목업, 저장 미반영) */}
        <div>
          <p className="text-[11.5px] font-semibold text-muted-foreground">선호 행사 유형</p>
          <div className="mt-2 flex flex-wrap gap-1.5">
            {EVENT_TYPES.map((t) => {
              const on = prefs.includes(t);
              return (
                <button
                  key={t}
                  type="button"
                  onClick={() => setPrefs(toggle(prefs, t))}
                  className={cn(
                    "h-[30px] rounded-full border px-3 text-xs font-semibold whitespace-nowrap transition-colors",
                    on
                      ? "border-primary bg-orange-100 text-orange-700"
                      : "bg-card text-muted-foreground hover:border-foreground/30",
                  )}
                >
                  {t}
                </button>
              );
            })}
          </div>
        </div>
        <div>
          <p className="text-[11.5px] font-semibold text-muted-foreground">
            불가 조건 <span className="font-normal">— 해당 공고는 목록에서 제외됩니다 (급구 제외)</span>
          </p>
          <div className="mt-2 flex flex-wrap gap-1.5">
            {(Object.keys(CONDITION_LABELS) as JobCondition[]).map((c) => {
              const on = blocks.includes(c);
              return (
                <button
                  key={c}
                  type="button"
                  onClick={() => setBlocks(toggle(blocks, c))}
                  className={cn(
                    "h-[30px] rounded-full border px-3 text-xs font-semibold whitespace-nowrap transition-colors",
                    on
                      ? "border-red-600/50 bg-red-100 text-red-800"
                      : "bg-card text-muted-foreground hover:border-foreground/30",
                  )}
                >
                  {on ? `✕ ${CONDITION_LABELS[c]}` : CONDITION_LABELS[c]}
                </button>
              );
            })}
          </div>
        </div>

        <div className="flex justify-end gap-2 border-t pt-4">
          <Button variant="outline" onClick={onClose}>
            취소
          </Button>
          <Button onClick={onClose}>저장</Button>
        </div>
      </div>
    </dialog>
  );
}
