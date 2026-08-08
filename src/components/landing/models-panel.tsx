"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import gsap from "gsap";
import { models } from "@/lib/landing-content";

export function ModelsPanel() {
  const [open, setOpen] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);
  const backdropRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const sync = () => {
      if (window.location.hash === "#models") setOpen(true);
    };
    sync();
    window.addEventListener("hashchange", sync);
    return () => window.removeEventListener("hashchange", sync);
  }, []);

  const requestClose = useCallback(() => {
    history.replaceState(
      null,
      "",
      window.location.pathname + window.location.search,
    );
    const panel = panelRef.current;
    if (!panel) {
      setOpen(false);
      return;
    }
    gsap.to(backdropRef.current, { autoAlpha: 0, duration: 0.35 });
    gsap.to(panel, {
      xPercent: 100,
      x: 0,
      duration: 0.4,
      ease: "expo.in",
      onComplete: () => setOpen(false),
    });
  }, []);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") requestClose();
    };
    window.addEventListener("keydown", onKey);

    const panel = panelRef.current;
    const backdrop = backdropRef.current;
    if (panel && backdrop) {
      gsap.fromTo(backdrop, { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.35 });
      gsap.fromTo(
        panel,
        { xPercent: 100, x: 0 },
        { xPercent: 0, x: 0, duration: 0.55, ease: "expo.out" },
      );
      gsap.fromTo(
        panel.querySelectorAll("[data-model]"),
        { autoAlpha: 0, y: 24 },
        {
          autoAlpha: 1,
          y: 0,
          duration: 0.5,
          ease: "expo.out",
          stagger: 0.05,
          delay: 0.2,
        },
      );
    }
    return () => window.removeEventListener("keydown", onKey);
  }, [open, requestClose]);

  if (!open) return null;

  return (
    <>
      <div
        ref={backdropRef}
        onClick={requestClose}
        className="fixed inset-0 z-[69] bg-black/55 opacity-0"
      />
      <div
        ref={panelRef}
        role="dialog"
        aria-label="소속 프로모터 화보"
        className="bg-ink-soft fixed inset-y-0 right-0 z-[70] w-[min(92vw,480px)] overflow-y-auto border-l border-line px-6 pt-6 pb-10 md:px-8"
        style={{ transform: "translateX(100%)" }}
      >
        <div className="flex items-start justify-between">
          <div>
            <p className="font-display text-xs tracking-[0.35em] uppercase opacity-60">
              Models
            </p>
            <h2 className="mt-1 text-2xl font-bold tracking-tight">
              소속 프로모터
            </h2>
          </div>
          <button
            onClick={requestClose}
            aria-label="닫기"
            className="font-display -mr-1 cursor-pointer p-2 text-xl leading-none opacity-70 transition-opacity hover:opacity-100"
          >
            ✕
          </button>
        </div>

        <div className="mt-6 grid grid-cols-2 gap-x-3 gap-y-6">
          {models.map((m, i) => (
            <figure
              key={m.name}
              data-model
              className={i % 2 === 1 ? "translate-y-6" : undefined}
            >
              <div className="relative aspect-[4/5] overflow-hidden rounded-sm">
                <Image
                  src={m.photo}
                  alt={`${m.name} 프로필 화보`}
                  width={640}
                  height={800}
                  draggable={false}
                  className="h-full w-full object-cover transition-transform duration-500 hover:scale-[1.04] select-none"
                />
              </div>
              <figcaption className="mt-2 flex items-baseline justify-between">
                <span className="text-sm font-bold">{m.name}</span>
                <span className="text-[11px] text-paper/55">{m.tag}</span>
              </figcaption>
            </figure>
          ))}
        </div>
      </div>
    </>
  );
}
