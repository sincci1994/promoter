"use client";

import { useState } from "react";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { won } from "@/lib/utils";
import { EVENT_TYPES, GRADE_RATES, matchCandidates } from "@/lib/buyer-flow-content";

// 입력 즉시 후보 수·최저 견적이 반응 — 데이터만 가상, 계산은 진짜(buyer-flow-content 풀 필터)
export function BuyerMiniForm() {
  const [type, setType] = useState("팝업스토어");
  const [dateStr, setDateStr] = useState("2026-08-22");
  const [headcount, setHeadcount] = useState(6);

  // 목업 풀은 2026-08 기준 — 그 외 날짜는 날짜 필터 없이 집계
  const day = dateStr.startsWith("2026-08-") ? Number(dateStr.slice(8)) : null;
  const available = matchCandidates({ day }).length;
  const minTotal = headcount * 8 * GRADE_RATES.P1;

  return (
    <div className="rounded-lg border bg-card p-6 shadow-sm">
      <div className="grid gap-2.5 sm:grid-cols-[1.2fr_1fr_0.8fr]">
        <label className="flex flex-col gap-1.5 text-xs font-medium text-muted-foreground">
          행사 유형
          <select
            value={type}
            onChange={(e) => setType(e.target.value)}
            className="h-11 rounded-md border border-input bg-transparent px-2.5 text-base text-foreground md:h-10 md:text-sm"
          >
            {EVENT_TYPES.map((t) => (
              <option key={t}>{t}</option>
            ))}
          </select>
        </label>
        <label className="flex flex-col gap-1.5 text-xs font-medium text-muted-foreground">
          날짜
          <Input
            type="date"
            value={dateStr}
            min="2026-08-09"
            max="2026-08-31"
            onChange={(e) => setDateStr(e.target.value)}
            className="h-11 text-foreground md:h-10"
          />
        </label>
        <label className="flex flex-col gap-1.5 text-xs font-medium text-muted-foreground">
          인원
          <Input
            type="number"
            value={headcount}
            min={1}
            max={50}
            onChange={(e) => setHeadcount(Math.max(1, Number(e.target.value) || 1))}
            className="h-11 text-foreground md:h-10"
          />
        </label>
      </div>
      <p className="mt-3.5 rounded-md border border-orange-200 bg-orange-50 px-3.5 py-3 text-sm tabular-nums">
        이 날짜 가용 등록 후보{" "}
        <span className="font-semibold text-orange-700">{available}명</span> · 예상{" "}
        <span className="font-semibold">{won(minTotal)}</span>
        <span className="text-xs text-muted-foreground"> 부터 (8시간·기본 등급 기준)</span>
      </p>
      <Button className="mt-3.5 h-11 w-full" asChild>
        <Link href={`/post?type=${encodeURIComponent(type)}&day=${day ?? ""}&n=${headcount}`}>
          이 조건으로 공고 등록 →
        </Link>
      </Button>
    </div>
  );
}
