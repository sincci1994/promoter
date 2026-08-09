"use client";

import { useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";

import { StatusBadge } from "@/components/home/bits";
import { PipelineTimeline } from "@/components/pipeline-timeline";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  CERTS,
  CERT_PREMIUM,
  EVENT_TYPES,
  GRADE_ORDER,
  GRADE_RATES,
  candidates,
  matchCandidates,
  roleRate,
  type Candidate,
  type Cert,
  type Grade,
} from "@/lib/buyer-flow-content";
import { dowLabel } from "@/lib/home-content";
import { cn, won } from "@/lib/utils";

const STEP_LABELS = ["기본 정보", "역할 구성", "모집 방식", "팀 초안"];
const REGIONS = ["서울", "경기·인천", "부산"];
const ROLE_PRESETS = ["행사 도우미", "리셉션", "부스 운영", "브랜드 앰배서더", "VIP 응대"];

type RoleDraft = {
  id: number;
  name: string;
  headcount: number;
  minGrade: Grade;
  requiredCerts: Cert[];
  openPosting: boolean;
};

const byId = new Map(candidates.map((c) => [c.id, c]));
const selectClass =
  "h-11 rounded-md border border-input bg-transparent px-2.5 md:h-9 md:text-sm";

export function PostFlow() {
  const params = useSearchParams();
  const [step, setStep] = useState(1);
  const [title, setTitle] = useState("");
  const [type, setType] = useState(() =>
    EVENT_TYPES.includes(params.get("type") ?? "") ? params.get("type")! : "팝업스토어",
  );
  const [day, setDay] = useState(() => {
    const d = Number(params.get("day"));
    return d >= 9 && d <= 31 ? d : 22;
  });
  const [startH, setStartH] = useState(10);
  const [endH, setEndH] = useState(18);
  const [region, setRegion] = useState("서울");
  const [place, setPlace] = useState("");
  const [roles, setRoles] = useState<RoleDraft[]>(() => [
    {
      id: 1,
      name: "행사 도우미",
      headcount: Math.min(Math.max(Number(params.get("n")) || 4, 1), 20),
      minGrade: "P1",
      requiredCerts: [],
      openPosting: false,
    },
  ]);
  const [publishing, setPublishing] = useState(false);
  const [published, setPublished] = useState(false);
  const [team, setTeam] = useState<Record<number, string[]>>({});
  const [swapTarget, setSwapTarget] = useState<{ roleId: number; candId: string } | null>(
    null,
  );
  const [requested, setRequested] = useState(false);

  const hours = Math.max(1, endH - startH);
  const eventName = title.trim() || `${type} 행사`;
  const dateLabel = `8/${day}(${dowLabel(day)}) ${startH}:00–${endH}:00`;

  const availableNow = matchCandidates({ day, region }).length;
  const roleMatches = (r: RoleDraft) =>
    matchCandidates({ day, region, minGrade: r.minGrade, requiredCerts: r.requiredCerts });

  // 발행 전 견적(최소 등급 가정) / 발행 후 견적(배정 후보의 실제 등급)
  const draftTotal = roles.reduce(
    (sum, r) => sum + r.headcount * hours * roleRate(r.minGrade, r.requiredCerts),
    0,
  );
  const candidateRate = (c: Candidate, r: RoleDraft) =>
    GRADE_RATES[c.grade] + r.requiredCerts.length * CERT_PREMIUM;
  const teamTotal = roles.reduce(
    (sum, r) =>
      sum +
      (team[r.id] ?? []).reduce(
        (s, id) => s + candidateRate(byId.get(id)!, r) * hours,
        0,
      ),
    0,
  );

  const assignedIds = useMemo(
    () => new Set(Object.values(team).flat()),
    [team],
  );

  const updateRole = (id: number, patch: Partial<RoleDraft>) =>
    setRoles((rs) => rs.map((r) => (r.id === id ? { ...r, ...patch } : r)));

  const publish = () => {
    setPublishing(true);
    // 추천 구성 연출 — 실제 계산은 즉시 가능하지만 "구성 중" 순간을 보여준다
    setTimeout(() => {
      const used = new Set<string>();
      const t: Record<number, string[]> = {};
      for (const r of roles) {
        const pool = roleMatches(r)
          .filter((c) => !used.has(c.id))
          .sort(
            (a, b) =>
              GRADE_ORDER.indexOf(b.grade) - GRADE_ORDER.indexOf(a.grade) ||
              b.completed - a.completed,
          );
        t[r.id] = pool.slice(0, r.headcount).map((c) => c.id);
        for (const id of t[r.id]) used.add(id);
      }
      setTeam(t);
      setPublishing(false);
      setPublished(true);
      setStep(4);
    }, 1200);
  };

  const swapCandidate = (roleId: number, oldId: string, newId: string) => {
    setTeam((t) => ({
      ...t,
      [roleId]: t[roleId].map((id) => (id === oldId ? newId : id)),
    }));
    setSwapTarget(null);
  };

  const swapRole = swapTarget ? roles.find((r) => r.id === swapTarget.roleId) : null;
  const swapAlternatives = swapRole
    ? roleMatches(swapRole)
        .filter((c) => !assignedIds.has(c.id))
        .sort(
          (a, b) =>
            GRADE_ORDER.indexOf(b.grade) - GRADE_ORDER.indexOf(a.grade) ||
            b.completed - a.completed,
        )
        .slice(0, 3)
    : [];

  return (
    <main className="mx-auto max-w-6xl px-4 pb-28 md:px-8 lg:pb-8">
      <div className="py-8">
        <h1 className="text-xl font-semibold">공고 등록</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          조건을 입력하는 동안 매칭 가능한 후보가 실시간으로 보입니다 — 게시 후 기다리는
          방식이 아닙니다.
        </p>
      </div>

      {/* 스텝퍼 */}
      <ol className="flex flex-wrap items-center gap-2 text-xs">
        {STEP_LABELS.map((label, i) => {
          const n = i + 1;
          return (
            <li key={label} className="flex items-center gap-2">
              <span
                className={cn(
                  "flex items-center gap-1.5 rounded-full border bg-card px-2.5 py-1",
                  step === n && "border-transparent bg-foreground font-medium text-background",
                  step > n && "text-muted-foreground",
                )}
              >
                <span className="tabular-nums">{step > n ? "✓" : n}</span>
                {label}
              </span>
              {n < 4 && <span className="text-muted-foreground/50">—</span>}
            </li>
          );
        })}
      </ol>

      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        {/* 좌: 스텝 콘텐츠 */}
        <div className="lg:col-span-2">
          {step === 1 && (
            <section className="space-y-4 rounded-lg border bg-card p-5 shadow-sm">
              <Field label="행사명">
                <Input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="예: 성수 팝업스토어 오픈런 운영"
                />
              </Field>
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="행사 유형">
                  <select
                    value={type}
                    onChange={(e) => setType(e.target.value)}
                    className={cn(selectClass, "w-full")}
                  >
                    {EVENT_TYPES.map((t) => (
                      <option key={t}>{t}</option>
                    ))}
                  </select>
                </Field>
                <Field label="일자 (2026년 8월)">
                  <Input
                    type="date"
                    value={`2026-08-${String(day).padStart(2, "0")}`}
                    min="2026-08-09"
                    max="2026-08-31"
                    onChange={(e) => {
                      const d = Number(e.target.value.slice(8));
                      if (d >= 9 && d <= 31) setDay(d);
                    }}
                  />
                </Field>
                <Field label="근무 시간">
                  <div className="flex items-center gap-2">
                    <select
                      value={startH}
                      onChange={(e) => setStartH(Number(e.target.value))}
                      className={cn(selectClass, "flex-1")}
                      aria-label="시작 시각"
                    >
                      {Array.from({ length: 16 }, (_, i) => i + 6).map((h) => (
                        <option key={h} value={h}>{`${h}:00`}</option>
                      ))}
                    </select>
                    <span className="text-muted-foreground">–</span>
                    <select
                      value={endH}
                      onChange={(e) => setEndH(Number(e.target.value))}
                      className={cn(selectClass, "flex-1")}
                      aria-label="종료 시각"
                    >
                      {Array.from({ length: 17 }, (_, i) => i + 7).map((h) => (
                        <option key={h} value={h}>{`${h}:00`}</option>
                      ))}
                    </select>
                  </div>
                </Field>
                <Field label="지역">
                  <select
                    value={region}
                    onChange={(e) => setRegion(e.target.value)}
                    className={cn(selectClass, "w-full")}
                  >
                    {REGIONS.map((r) => (
                      <option key={r}>{r}</option>
                    ))}
                  </select>
                </Field>
              </div>
              <Field label="장소">
                <Input
                  value={place}
                  onChange={(e) => setPlace(e.target.value)}
                  placeholder="예: 코엑스 A홀"
                />
              </Field>
            </section>
          )}

          {step === 2 && (
            <section className="space-y-4">
              {roles.map((r) => {
                const matches = roleMatches(r);
                const rate = roleRate(r.minGrade, r.requiredCerts);
                const narrow = matches.length < r.headcount * 2 && r.requiredCerts.length > 0;
                const relaxed = narrow
                  ? matchCandidates({
                      day,
                      region,
                      minGrade: r.minGrade,
                      requiredCerts: r.requiredCerts.slice(0, -1),
                    }).length
                  : 0;
                return (
                  <div key={r.id} className="rounded-lg border bg-card p-5 shadow-sm">
                    <div className="grid gap-4 sm:grid-cols-3">
                      <Field label="역할 이름">
                        <Input
                          value={r.name}
                          onChange={(e) => updateRole(r.id, { name: e.target.value })}
                          list={`role-presets-${r.id}`}
                        />
                        <datalist id={`role-presets-${r.id}`}>
                          {ROLE_PRESETS.map((p) => (
                            <option key={p} value={p} />
                          ))}
                        </datalist>
                      </Field>
                      <Field label="인원">
                        <Input
                          type="number"
                          min={1}
                          max={20}
                          value={r.headcount}
                          onChange={(e) =>
                            updateRole(r.id, {
                              headcount: Math.min(Math.max(Number(e.target.value) || 1, 1), 20),
                            })
                          }
                        />
                      </Field>
                      <Field label="최소 등급">
                        <select
                          value={r.minGrade}
                          onChange={(e) => updateRole(r.id, { minGrade: e.target.value as Grade })}
                          className={cn(selectClass, "w-full")}
                        >
                          {GRADE_ORDER.map((g) => (
                            <option key={g} value={g}>
                              {g} · {won(GRADE_RATES[g])}/h
                            </option>
                          ))}
                        </select>
                      </Field>
                    </div>
                    <div className="mt-4">
                      <p className="text-xs font-medium text-muted-foreground">
                        필수 자격 (자격당 +{won(CERT_PREMIUM)}/h)
                      </p>
                      <div className="mt-2 flex flex-wrap gap-1.5">
                        {CERTS.map((cert) => {
                          const on = r.requiredCerts.includes(cert);
                          return (
                            <button
                              key={cert}
                              type="button"
                              onClick={() =>
                                updateRole(r.id, {
                                  requiredCerts: on
                                    ? r.requiredCerts.filter((c) => c !== cert)
                                    : [...r.requiredCerts, cert],
                                })
                              }
                              className={cn(
                                "rounded-full border bg-card px-2.5 py-1 text-xs transition-colors hover:bg-accent",
                                on && "border-transparent bg-foreground font-medium text-background hover:bg-foreground",
                              )}
                            >
                              {cert}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                    {/* 핵심 아하 1 — 조건이 후보 수·단가에 즉시 반응 */}
                    <div className="mt-4 flex flex-wrap items-center justify-between gap-2 border-t pt-3 text-sm">
                      <p className="tabular-nums">
                        조건 충족 후보{" "}
                        <span className={cn("font-semibold", matches.length < r.headcount ? "text-red-600" : "text-orange-700")}>
                          {matches.length}명
                        </span>{" "}
                        · 예상 <span className="font-semibold">{won(rate)}/h</span>
                      </p>
                      {roles.length > 1 && (
                        <button
                          type="button"
                          onClick={() => setRoles((rs) => rs.filter((x) => x.id !== r.id))}
                          className="text-xs text-muted-foreground underline underline-offset-2 hover:text-foreground"
                        >
                          역할 삭제
                        </button>
                      )}
                    </div>
                    {narrow && (
                      <p className="mt-2 rounded-md bg-amber-100 px-3 py-2 text-xs text-amber-800">
                        조건이 좁아요 — &lsquo;{r.requiredCerts.at(-1)}&rsquo;을(를) 우대
                        조건으로 바꾸면 후보 {relaxed}명
                      </p>
                    )}
                  </div>
                );
              })}
              {roles.length < 4 && (
                <Button
                  variant="outline"
                  onClick={() =>
                    setRoles((rs) => [
                      ...rs,
                      {
                        id: Math.max(...rs.map((r) => r.id)) + 1,
                        name: ROLE_PRESETS[rs.length % ROLE_PRESETS.length],
                        headcount: 2,
                        minGrade: "P1",
                        requiredCerts: [],
                        openPosting: false,
                      },
                    ])
                  }
                >
                  + 역할 추가
                </Button>
              )}
            </section>
          )}

          {step === 3 && (
            <section className="space-y-4">
              <div className="rounded-lg border bg-card p-5 shadow-sm">
                <div className="flex items-center justify-between gap-2">
                  <div>
                    <h3 className="text-sm font-semibold">추천 팀 받기</h3>
                    <p className="mt-0.5 text-xs text-muted-foreground">
                      기본 경로 — 발행 즉시 조건에 맞는 팀 초안이 구성됩니다.
                    </p>
                  </div>
                  <StatusBadge tone="green">기본</StatusBadge>
                </div>
              </div>
              <div className="rounded-lg border bg-card p-5 shadow-sm">
                <h3 className="text-sm font-semibold">공개 모집도 함께 열기 (역할별 선택)</h3>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  공고를 게시하면 프로모터가 직접 지원합니다 — 승인해야만 계약이 됩니다.
                </p>
                <div className="mt-3 space-y-2">
                  {roles.map((r) => (
                    <label
                      key={r.id}
                      className="flex cursor-pointer items-center justify-between gap-2 rounded-md border px-3 py-2.5"
                    >
                      <span className="text-sm">
                        {r.name}{" "}
                        <span className="text-xs text-muted-foreground tabular-nums">
                          {r.headcount}명 · {won(roleRate(r.minGrade, r.requiredCerts))}/h
                        </span>
                      </span>
                      <input
                        type="checkbox"
                        checked={r.openPosting}
                        onChange={(e) => updateRole(r.id, { openPosting: e.target.checked })}
                        className="size-4 accent-primary"
                      />
                    </label>
                  ))}
                </div>
                {roles.some((r) => r.openPosting) && (
                  <div className="mt-4">
                    <p className="text-xs font-medium text-muted-foreground">
                      공고는 이렇게 노출됩니다
                    </p>
                    {(() => {
                      const r = roles.find((x) => x.openPosting)!;
                      return (
                        <div className="mt-2 max-w-sm rounded-lg border bg-background p-4">
                          <div className="flex items-start justify-between gap-2">
                            <StatusBadge tone="neutral">{type}</StatusBadge>
                            <span className="text-xs text-muted-foreground tabular-nums">
                              D-{Math.max(day - 9, 0)}
                            </span>
                          </div>
                          <h3 className="mt-2 text-sm font-semibold">{eventName}</h3>
                          <p className="mt-1 text-xs text-muted-foreground tabular-nums">
                            {dateLabel} · {place.trim() || region} · {r.name} {r.headcount}명
                          </p>
                          <p className="mt-2 border-t pt-2 text-sm font-semibold tabular-nums">
                            {won(roleRate(r.minGrade, r.requiredCerts))}
                            <span className="font-normal text-muted-foreground">/h</span>
                          </p>
                        </div>
                      );
                    })()}
                  </div>
                )}
                <p className="mt-4 rounded-md bg-amber-100 px-3 py-2 text-xs leading-relaxed text-amber-800">
                  첫 요청 발송 또는 공개 게시 후에는 일시·장소·역할 조건을 바꿀 수 없어요 —
                  프로모터가 보고 수락·지원한 조건을 보호합니다.
                </p>
              </div>
            </section>
          )}

          {step === 4 && published && (
            <section>
              <div className="rounded-lg border bg-card p-5 shadow-sm">
                <StatusBadge tone="green">팀 초안 완성</StatusBadge>
                <h2 className="mt-2 text-lg font-semibold">
                  &lsquo;{eventName}&rsquo; 팀 초안이 준비됐어요
                </h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  검토 후 요청만 보내면 됩니다 — 후보를 교체해도 견적이 즉시 갱신됩니다.
                </p>
              </div>
              <div className="mt-4 space-y-6">
                {roles.map((r) => {
                  const ids = team[r.id] ?? [];
                  const missing = r.headcount - ids.length;
                  return (
                    <div key={r.id}>
                      <div className="flex items-baseline justify-between">
                        <h3 className="text-sm font-semibold">
                          {r.name}{" "}
                          <span className="font-normal text-muted-foreground tabular-nums">
                            {ids.length}/{r.headcount}명
                          </span>
                        </h3>
                        {r.openPosting && <StatusBadge tone="blue">공개 모집 중</StatusBadge>}
                      </div>
                      <div className="mt-2 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                        {ids.map((id) => {
                          const c = byId.get(id)!;
                          return (
                            <div key={id} className="rounded-lg border bg-card p-3 shadow-sm">
                              <div className="flex items-center gap-2.5">
                                <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-muted text-sm font-semibold">
                                  {c.name[0]}
                                </span>
                                <div className="min-w-0">
                                  <p className="truncate text-sm font-semibold">
                                    {c.name}
                                    <span className="ml-1.5 rounded bg-muted px-1 py-0.5 text-[10px] font-medium text-muted-foreground">
                                      {c.grade}
                                    </span>
                                  </p>
                                  <p className="text-xs text-muted-foreground tabular-nums">
                                    완료 {c.completed}회 · 재의뢰 {c.rehired}회
                                  </p>
                                </div>
                              </div>
                              {c.certs.length > 0 && (
                                <p className="mt-2 text-[11px] text-muted-foreground">
                                  {c.certs.join(" · ")}
                                </p>
                              )}
                              <div className="mt-2 flex items-center justify-between border-t pt-2">
                                <span className="text-sm font-semibold tabular-nums">
                                  {won(candidateRate(c, r))}
                                  <span className="font-normal text-muted-foreground">/h</span>
                                </span>
                                <Button
                                  variant="outline"
                                  size="xs"
                                  onClick={() => setSwapTarget({ roleId: r.id, candId: id })}
                                >
                                  교체
                                </Button>
                              </div>
                            </div>
                          );
                        })}
                        {missing > 0 && (
                          <div className="flex flex-col items-start justify-center gap-1.5 rounded-lg border border-dashed bg-amber-50 p-3">
                            <StatusBadge tone="amber">후보 부족 {missing}자리</StatusBadge>
                            <p className="text-xs text-amber-800">
                              조건을 완화하거나 공개 모집으로 지원을 받아 채울 수 있어요.
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* 다음에 일어날 일 */}
              <div className="mt-8 rounded-lg border bg-card p-5 shadow-sm">
                <h3 className="text-sm font-semibold">다음에 일어날 일</h3>
                <ol className="mt-3 space-y-2 text-sm">
                  {[
                    ["지금", "팀 초안 검토 · 후보 교체", true],
                    ["요청 발송", "프로모터 수락 대기 — 기한 내 미응답이면 대안 후보를 다시 추천해요", requested],
                    ["전원 확정", "D-3·D-1 확인이 자동으로 예약됩니다", false],
                    ["행사 당일", "출결이 기록되고, 결원은 즉시 대체 탐색", false],
                    ["행사 후", "리뷰 작성 · 예상 금액 내역 확인", false],
                  ].map(([label, copy, active], i) => (
                    <li key={i} className="flex gap-2.5">
                      <span
                        className={cn(
                          "mt-0.5 flex size-4 shrink-0 items-center justify-center rounded-full border text-[10px]",
                          active
                            ? "border-transparent bg-primary text-primary-foreground"
                            : "text-muted-foreground",
                        )}
                      >
                        {active ? "✓" : i + 1}
                      </span>
                      <p className={cn(!active && "text-muted-foreground")}>
                        <span className="font-medium text-foreground">{label as string}</span>{" "}
                        — {copy as string}
                      </p>
                    </li>
                  ))}
                </ol>
              </div>
              <div className="mt-6 rounded-lg border bg-card p-5 shadow-sm">
                <PipelineTimeline current={requested ? 2 : 1} />
              </div>
            </section>
          )}
        </div>

        {/* 우: 라이브 패널 */}
        <aside className="hidden lg:block">
          <div className="sticky top-20 rounded-lg border bg-card p-5 shadow-sm">
            <p className="text-xs font-medium text-muted-foreground">실시간 매칭 미리보기</p>
            <p className="mt-2 text-sm tabular-nums">
              {dateLabel} · {region}
            </p>
            <p className="mt-1 text-sm tabular-nums">
              가용 등록 프로모터{" "}
              <span className="font-semibold text-orange-700">{availableNow}명</span>
            </p>
            <p className="mt-0.5 text-[11px] text-muted-foreground">
              가용 일정 등록 기준 · 시연용 가상 데이터
            </p>
            {roles.length > 0 && step >= 2 && (
              <div className="mt-4 space-y-1.5 border-t pt-3 text-xs tabular-nums">
                {roles.map((r) => (
                  <p key={r.id} className="flex justify-between gap-2">
                    <span className="truncate text-muted-foreground">
                      {r.name} {r.headcount}명
                    </span>
                    <span>
                      후보 {roleMatches(r).length} · {won(roleRate(r.minGrade, r.requiredCerts))}/h
                    </span>
                  </p>
                ))}
              </div>
            )}
            <div className="mt-4 border-t pt-3">
              <p className="flex items-baseline justify-between">
                <span className="text-xs text-muted-foreground">
                  {published ? "현재 팀 견적" : "예상 총액"}
                </span>
                <span className="text-lg font-semibold tabular-nums">
                  {won(published ? teamTotal : draftTotal)}
                </span>
              </p>
              <p className="mt-0.5 text-right text-[11px] text-muted-foreground tabular-nums">
                {hours}시간 기준{published ? "" : " · 최소 등급 가정"}
              </p>
              <QuoteDialog
                roles={roles}
                team={team}
                hours={hours}
                published={published}
                candidateRate={candidateRate}
              />
            </div>
            <div className="mt-4">
              <StepNav
                step={step}
                published={published}
                publishing={publishing}
                requested={requested}
                onPrev={() => setStep((s) => Math.max(1, s - 1))}
                onNext={() => setStep((s) => Math.min(3, s + 1))}
                onPublish={publish}
                onRequest={() => setRequested(true)}
              />
            </div>
          </div>
        </aside>
      </div>

      {/* 모바일 하단 고정 바 */}
      <div className="fixed inset-x-0 bottom-0 z-40 border-t bg-card p-3 lg:hidden">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-3">
          <p className="text-sm tabular-nums">
            후보 <span className="font-semibold text-orange-700">{availableNow}</span> ·{" "}
            <span className="font-semibold">{won(published ? teamTotal : draftTotal)}</span>
          </p>
          <StepNav
            compact
            step={step}
            published={published}
            publishing={publishing}
            requested={requested}
            onPrev={() => setStep((s) => Math.max(1, s - 1))}
            onNext={() => setStep((s) => Math.min(3, s + 1))}
            onPublish={publish}
            onRequest={() => setRequested(true)}
          />
        </div>
      </div>

      {/* 교체 시트 */}
      <Sheet open={swapTarget != null} onOpenChange={(o) => !o && setSwapTarget(null)}>
        <SheetContent side="right" className="w-full sm:max-w-md">
          <SheetHeader>
            <SheetTitle>후보 교체</SheetTitle>
        </SheetHeader>
          {swapTarget && swapRole && (
            <div className="space-y-3 px-4 pb-6">
              <p className="text-xs text-muted-foreground">
                {swapRole.name} · 현재: {byId.get(swapTarget.candId)?.name} (
                {byId.get(swapTarget.candId)?.grade})
              </p>
              {swapAlternatives.length === 0 && (
                <p className="rounded-md bg-muted px-3 py-2 text-sm text-muted-foreground">
                  교체 가능한 대안 후보가 없어요 — 조건을 완화해 보세요.
                </p>
              )}
              {swapAlternatives.map((c) => (
                <div key={c.id} className="rounded-lg border p-3">
                  <div className="flex items-center gap-2.5">
                    <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-muted text-sm font-semibold">
                      {c.name[0]}
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-semibold">
                        {c.name}
                        <span className="ml-1.5 rounded bg-muted px-1 py-0.5 text-[10px] font-medium text-muted-foreground">
                          {c.grade}
                        </span>
                      </p>
                      <p className="text-xs text-muted-foreground tabular-nums">
                        완료 {c.completed}회 · 재의뢰 {c.rehired}회
                        {c.certs.length > 0 && ` · ${c.certs.join(" · ")}`}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-semibold tabular-nums">
                        {won(candidateRate(c, swapRole))}/h
                      </p>
                      <Button
                        size="xs"
                        className="mt-1"
                        onClick={() => swapCandidate(swapTarget.roleId, swapTarget.candId, c.id)}
                      >
                        이 후보로 교체
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </SheetContent>
      </Sheet>
    </main>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs font-medium text-muted-foreground">{label}</span>
      {children}
    </label>
  );
}

function StepNav({
  step,
  published,
  publishing,
  requested,
  compact,
  onPrev,
  onNext,
  onPublish,
  onRequest,
}: {
  step: number;
  published: boolean;
  publishing: boolean;
  requested: boolean;
  compact?: boolean;
  onPrev: () => void;
  onNext: () => void;
  onPublish: () => void;
  onRequest: () => void;
}) {
  if (step === 4 && published) {
    return requested ? (
      <p className={cn("text-xs font-medium text-green-700", !compact && "text-center")}>
        요청을 보냈어요 — 수락 알림을 기다립니다 (목업 시연)
      </p>
    ) : (
      <Button className={cn(!compact && "w-full")} onClick={onRequest}>
        이 팀으로 요청 보내기
      </Button>
    );
  }
  return (
    <div className={cn("flex gap-2", !compact && "w-full")}>
      {step > 1 && (
        <Button variant="outline" onClick={onPrev} disabled={publishing}>
          이전
        </Button>
      )}
      {step < 3 ? (
        <Button className={cn(!compact && "flex-1")} onClick={onNext}>
          다음
        </Button>
      ) : (
        <Button className={cn(!compact && "flex-1")} onClick={onPublish} disabled={publishing}>
          {publishing ? "추천 팀 구성 중…" : "발행하고 팀 초안 받기"}
        </Button>
      )}
    </div>
  );
}

function QuoteDialog({
  roles,
  team,
  hours,
  published,
  candidateRate,
}: {
  roles: RoleDraft[];
  team: Record<number, string[]>;
  hours: number;
  published: boolean;
  candidateRate: (c: Candidate, r: RoleDraft) => number;
}) {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <button className="mt-1 w-full text-right text-xs text-muted-foreground underline underline-offset-2 transition-colors hover:text-foreground">
          산출 근거 보기
        </button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>견적 산출 근거</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 text-sm">
          {roles.map((r) => {
            const certLine =
              r.requiredCerts.length > 0
                ? ` (+자격 ${won(r.requiredCerts.length * CERT_PREMIUM)}/h)`
                : "";
            return (
              <div key={r.id}>
                <p className="font-medium">{r.name}</p>
                {published ? (
                  (team[r.id] ?? []).map((id) => {
                    const c = byId.get(id)!;
                    return (
                      <p key={id} className="flex justify-between text-xs text-muted-foreground tabular-nums">
                        <span>
                          {c.name} · {c.grade} {won(GRADE_RATES[c.grade])}
                          {certLine} × {hours}h
                        </span>
                        <span>{won(candidateRate(c, r) * hours)}</span>
                      </p>
                    );
                  })
                ) : (
                  <p className="flex justify-between text-xs text-muted-foreground tabular-nums">
                    <span>
                      {r.minGrade} 기준 {won(roleRate(r.minGrade, r.requiredCerts))}/h ×{" "}
                      {hours}h × {r.headcount}명
                    </span>
                    <span>{won(roleRate(r.minGrade, r.requiredCerts) * hours * r.headcount)}</span>
                  </p>
                )}
              </div>
            );
          })}
          <div className="border-t pt-3 text-xs leading-relaxed text-muted-foreground">
            <p>표시 금액은 예상 금액입니다 — 정산 금액이 아니에요.</p>
            <p>요청·승인 시점 금액으로 동결되어 이후 변동이 없습니다.</p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
