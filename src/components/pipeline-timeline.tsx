import { cn } from "@/lib/utils";

// 행사 진행 파이프라인 — 마이크로카피는 도메인이 실제 지원하는 것만 말한다(§5~6, §12~13)
const STEPS = [
  { label: "팀 구성", copy: "조건에 맞는 팀 초안을 받고 후보를 교체합니다" },
  { label: "요청·확정", copy: "수락 시점 금액이 동결되고, 전원 확정 시 팀이 잠깁니다" },
  { label: "D-3·D-1 확인", copy: "행사 전 자동 재확인 — 미응답은 위험으로 감지해 백업을 미리 찾습니다" },
  { label: "당일 출결", copy: "현장 리더가 체크인·아웃을 기록합니다" },
  { label: "결원 대체", copy: "대기 지원자 즉시 투입 또는 긴급 탐색 — 도착까지 추적합니다" },
  { label: "리뷰·기록", copy: "상호 평가가 남고, 다음 추천의 재료가 됩니다" },
] as const;

// 마케팅 모드에서 "말이 아니라 화면"임을 보여주는 미니어처 (스텝 3·4·5)
const MINIS: Record<number, React.ReactNode> = {
  2: (
    <div className="rounded-md border bg-card p-2 text-[11px]">
      <p>내일 행사입니다.</p>
      <span className="mt-1 inline-block rounded bg-primary px-1.5 py-0.5 font-medium text-primary-foreground">
        최종 확인
      </span>
    </div>
  ),
  3: (
    <div className="space-y-1 rounded-md border bg-card p-2 text-[11px] tabular-nums">
      <p className="text-green-700">09:52 체크인 ✓</p>
      <p className="text-amber-700">10:12 지각 12분</p>
    </div>
  ),
  4: (
    <div className="rounded-md border bg-card p-2 text-[11px] tabular-nums">
      <p>결원 감지 10:05</p>
      <p>대체 매칭 10:18</p>
      <p className="text-green-700">현장 도착 11:02 ✓</p>
    </div>
  ),
};

export function PipelineTimeline({
  current,
  miniatures,
}: {
  current?: number; // 1-based 현재 단계 — 없으면 마케팅 모드
  miniatures?: boolean;
}) {
  return (
    <ol className="grid gap-4 sm:grid-cols-3 lg:grid-cols-6">
      {STEPS.map((step, i) => {
        const n = i + 1;
        const done = current != null && n < current;
        const active = current === n;
        return (
          <li key={step.label} className="flex flex-col gap-1.5">
            <span
              className={cn(
                "inline-flex size-6 items-center justify-center rounded-full border text-xs font-semibold tabular-nums",
                active && "border-transparent bg-primary text-primary-foreground",
                done && "border-transparent bg-muted text-muted-foreground",
                current != null && !active && !done && "text-muted-foreground",
              )}
            >
              {done ? "✓" : n}
            </span>
            <p
              className={cn(
                "text-sm font-semibold",
                current != null && !active && "text-muted-foreground",
              )}
            >
              {step.label}
            </p>
            <p className="text-xs leading-relaxed text-muted-foreground">{step.copy}</p>
            {miniatures && MINIS[i] && <div className="mt-1">{MINIS[i]}</div>}
          </li>
        );
      })}
    </ol>
  );
}
