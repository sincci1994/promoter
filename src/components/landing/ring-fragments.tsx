"use client";
import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import gsap from "gsap";
import type { RingItem } from "@/lib/landing-content";

export function RingFragments({ item }: { item: RingItem | null }) {
  const rootRef = useRef<HTMLDivElement>(null);
  // 퇴장 애니메이션 동안 마지막 콘텐츠 유지 (렌더 중 파생 상태 패턴)
  const [last, setLast] = useState<RingItem | null>(null);
  if (item && item !== last) setLast(item);
  const show = item !== null;
  const data = item ?? last;

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    if (show) {
      // 카드 사이를 빠르게 스칠 때 깜빡임 방지용 등장 지연
      const call = gsap.delayedCall(0.12, () => {
        gsap.to(root, { autoAlpha: 1, duration: 0.2, overwrite: "auto" });
        gsap.fromTo(
          root.querySelectorAll("[data-frag]"),
          { autoAlpha: 0, y: 18 },
          {
            autoAlpha: 1,
            y: 0,
            duration: 0.45,
            ease: "expo.out",
            stagger: 0.05,
            overwrite: "auto",
          },
        );
      });
      return () => {
        call.kill();
      };
    }
    // 마우스를 치워도 잠시 머문 뒤 부드럽게 퇴장 (재호버 시 cleanup이 취소)
    const call = gsap.delayedCall(0.6, () => {
      gsap.to(root, { autoAlpha: 0, duration: 0.5, overwrite: "auto" });
    });
    return () => {
      call.kill();
    };
  }, [show, data]);

  return (
    <div
      ref={rootRef}
      aria-hidden
      className="pointer-events-none absolute top-1/2 right-[4vw] z-[55] hidden w-[24vw] max-w-[360px] min-w-[240px] -translate-y-1/2 opacity-0 [text-shadow:0_1px_16px_rgb(10_10_11/0.9)] md:block"
    >
      {data && (
        <>
          <p
            data-frag
            className="font-display text-[11px] tracking-[0.3em] uppercase opacity-60"
          >
            {data.label}
          </p>
          <h3 data-frag className="mt-1 text-2xl font-bold tracking-tight">
            {data.frag.titleKo}
          </h3>
          <p data-frag className="mt-2 text-sm leading-relaxed text-paper/70">
            {data.frag.note}
          </p>
          <ul data-frag className="mt-4">
            {data.frag.records.map((rec) => (
              <li
                key={rec.name}
                className="flex items-baseline gap-3 border-t border-paper/15 py-2 text-[13px]"
              >
                <span className="font-display text-spot shrink-0 text-xs font-semibold">
                  {rec.year}
                </span>
                <span className="min-w-0 flex-1 truncate text-paper/85">
                  {rec.name}
                </span>
                <span className="shrink-0 text-xs text-paper/50">
                  {rec.size}
                </span>
              </li>
            ))}
          </ul>
          <div data-frag className="mt-3 flex flex-wrap gap-1.5">
            {data.frag.roles.map((role) => (
              <span
                key={role}
                className="rounded-full border border-paper/25 bg-ink/50 px-2.5 py-0.5 text-[11px] tracking-wide text-paper/85"
              >
                {role}
              </span>
            ))}
          </div>
          <div className="relative mt-5 aspect-[4/3]">
            <Image
              data-frag
              src={data.frag.snaps[0]}
              alt=""
              width={640}
              height={800}
              draggable={false}
              className="absolute top-0 left-0 w-[54%] -rotate-[5deg] rounded-sm shadow-2xl shadow-black/60 select-none"
            />
            {data.frag.snaps[1] && (
              <Image
                data-frag
                src={data.frag.snaps[1]}
                alt=""
                width={640}
                height={800}
                draggable={false}
                className="absolute top-[14%] right-0 w-[46%] rotate-[4deg] rounded-sm shadow-2xl shadow-black/60 select-none"
              />
            )}
          </div>
        </>
      )}
    </div>
  );
}
