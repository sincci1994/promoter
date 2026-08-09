"use client";

import { useEffect, useRef, useState } from "react";

import { StatusBadge } from "@/components/home/bits";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { mockSession, type JobPost } from "@/lib/home-content";
import { won } from "@/lib/utils";

const ONCE_KEY = "cast_applied_once"; // 첫 지원에만 교육적 풀 시트를 보여주기 위한 플래그

export function ApplyDock({ job }: { job: JobPost }) {
  const [open, setOpen] = useState(false);
  const [fullMode, setFullMode] = useState(false);
  const [applied, setApplied] = useState(false);
  const [toast, setToast] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => () => {
    if (timer.current) clearTimeout(timer.current);
  }, []);

  // 시간 겹침 소프트 경고 — 하드 검사(I6)는 승인 시점이므로 지원은 막지 않는다
  const overlap =
    job.startDay <= mockSession.confirmedWork.day &&
    mockSession.confirmedWork.day <= (job.endDay ?? job.startDay);
  const applyLabel = job.standby ? "대기 지원하기" : "지원하기";
  const appliedLabel = job.standby ? "대기 지원 접수됨" : "검토 대기";

  const openSheet = () => {
    setFullMode(!localStorage.getItem(ONCE_KEY));
    setOpen(true);
  };
  const apply = () => {
    localStorage.setItem(ONCE_KEY, "1");
    setApplied(true);
    setOpen(false);
    setToast(true);
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => setToast(false), 6000);
  };
  const withdraw = () => {
    setApplied(false);
    setToast(false);
  };

  const appliedState = (
    <div className="space-y-2">
      <StatusBadge tone="amber">{appliedLabel}</StatusBadge>
      <p className="text-xs text-muted-foreground">
        승인 전까지 철회할 수 있어요 — 결과는 알림톡으로 안내해 드려요.
      </p>
      <Button variant="outline" size="sm" onClick={withdraw}>
        지원 철회
      </Button>
    </div>
  );

  return (
    <>
      {/* 데스크탑 우측 레일 */}
      <aside className="hidden lg:block">
        <div className="sticky top-20 rounded-lg border bg-card p-5 shadow-sm">
          <p className="text-2xl font-semibold tabular-nums">
            {won(job.rate)}
            <span className="text-sm font-normal text-muted-foreground">/h</span>
            <span className="ml-2 text-xs font-medium text-orange-700">
              {mockSession.grade} 기준
            </span>
          </p>
          <p className="mt-1 text-xs text-muted-foreground tabular-nums">
            {job.date} · {job.role} {job.headcount}명
          </p>
          <div className="mt-4">
            {applied ? (
              appliedState
            ) : (
              <>
                <Button className="w-full" onClick={openSheet}>
                  {applyLabel}
                </Button>
                <p className="mt-2 text-center text-[11px] text-muted-foreground">
                  입력할 것 없이 프로필로 바로 지원돼요
                </p>
              </>
            )}
          </div>
        </div>
      </aside>

      {/* 모바일 하단 고정 바 */}
      <div className="fixed inset-x-0 bottom-0 z-40 border-t bg-card p-3 lg:hidden">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-3">
          <p className="text-sm font-semibold tabular-nums">
            {won(job.rate)}
            <span className="font-normal text-muted-foreground">/h</span>
            <span className="ml-1.5 text-xs font-medium text-orange-700">
              {mockSession.grade} 기준
            </span>
          </p>
          {applied ? (
            <div className="flex items-center gap-2">
              <StatusBadge tone="amber">{appliedLabel}</StatusBadge>
              <Button variant="outline" size="sm" onClick={withdraw}>
                철회
              </Button>
            </div>
          ) : (
            <Button className="h-11 px-6" onClick={openSheet}>
              {applyLabel}
            </Button>
          )}
        </div>
      </div>

      {/* 지원 시트 — 첫 지원은 교육적 풀 시트, 이후 축약 */}
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent
          side="bottom"
          className="inset-x-0 mx-auto w-full rounded-t-lg sm:max-w-md"
        >
          <SheetHeader>
            <SheetTitle className="truncate pr-6">{job.title}</SheetTitle>
          </SheetHeader>
          <div className="space-y-4 px-4 pb-6">
            {fullMode && (
              <>
                <div className="rounded-lg border bg-background p-3">
                  <p className="text-xs font-medium text-muted-foreground">
                    Buyer에게 이렇게 보여요
                  </p>
                  <div className="mt-2 flex items-center gap-2.5">
                    <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-muted text-sm font-semibold">
                      {mockSession.name[0]}
                    </span>
                    <div>
                      <p className="text-sm font-semibold">
                        {mockSession.name}
                        <span className="ml-1.5 rounded bg-muted px-1 py-0.5 text-[10px] font-medium text-muted-foreground">
                          {mockSession.grade}
                        </span>
                      </p>
                      <p className="text-xs text-muted-foreground tabular-nums">
                        {mockSession.region} · 완료 {mockSession.completed}회 ·{" "}
                        {mockSession.tags.join(" · ")}
                      </p>
                    </div>
                  </div>
                </div>
                <div className="rounded-md bg-muted px-3 py-2.5 text-xs leading-relaxed text-muted-foreground">
                  지원은 <span className="font-medium text-foreground">사전 동의</span>예요
                  — Buyer가 승인하면 별도 수락 없이 바로 확정됩니다. 게시된 일시·장소·조건은
                  변경되지 않아요.
                </div>
                <p className="text-xs font-medium text-green-700">
                  ✓ 지원 요건 충족 — 최소 등급 P1 · 필수 자격 없음
                </p>
              </>
            )}

            <dl className="space-y-1.5 text-sm">
              <div className="flex gap-2">
                <dt className="w-12 shrink-0 text-muted-foreground">일시</dt>
                <dd className="tabular-nums">{job.date}</dd>
              </div>
              <div className="flex gap-2">
                <dt className="w-12 shrink-0 text-muted-foreground">장소</dt>
                <dd>{job.place}</dd>
              </div>
              <div className="flex gap-2">
                <dt className="w-12 shrink-0 text-muted-foreground">역할</dt>
                <dd>
                  {job.role} · {won(job.rate)}/h
                  <span className="ml-1 text-xs text-orange-700">{mockSession.grade} 기준</span>
                </dd>
              </div>
            </dl>
            <p className="text-[11px] leading-relaxed text-muted-foreground">
              지금 보신 금액이 지원 기록에 남고, 승인 시점 금액으로 동결됩니다.
            </p>

            {overlap && (
              <p className="rounded-md bg-amber-100 px-3 py-2 text-xs leading-relaxed text-amber-800">
                확정 근무와 시간이 겹쳐요 — {mockSession.confirmedWork.label}. 겹친 상태로는
                승인되지 않아요.
              </p>
            )}
            {job.standby && (
              <p className="rounded-md bg-amber-100 px-3 py-2 text-xs leading-relaxed text-amber-800">
                정원이 찬 공고예요 — 자리가 나면 대기 지원자 중에서 승인될 수 있어요.
              </p>
            )}

            <Button className="h-11 w-full" onClick={apply}>
              {applyLabel}
            </Button>
            <p className="text-center text-[11px] text-muted-foreground">
              승인 전까지 철회할 수 있어요 · 승인되면 바로 확정돼요
            </p>
          </div>
        </SheetContent>
      </Sheet>

      {/* 지원 완료 토스트 (undo) */}
      {toast && applied && (
        <div className="fixed inset-x-0 bottom-20 z-50 flex justify-center px-4 lg:bottom-6">
          <div className="dark flex items-center gap-3 rounded-full bg-background py-2 pr-2 pl-4 text-sm text-foreground shadow-lg">
            지원 완료 — {appliedLabel}
            <Button variant="outline" size="sm" onClick={withdraw}>
              철회
            </Button>
          </div>
        </div>
      )}
    </>
  );
}
