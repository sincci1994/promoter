"use client";
import { useRef, useState } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { SplitText } from "gsap/SplitText";
import { site } from "@/lib/landing-content";

gsap.registerPlugin(useGSAP, SplitText);

const SEEN_KEY = "cast-opened";

export function Opening() {
  const overlayRef = useRef<HTMLDivElement>(null);
  const counterRef = useRef<HTMLSpanElement>(null);
  const [done, setDone] = useState(false);

  useGSAP(() => {
    const overlay = overlayRef.current;
    const seen = sessionStorage.getItem(SEEN_KEY) === "1";
    const mm = gsap.matchMedia();

    mm.add("(prefers-reduced-motion: reduce)", () => {
      setDone(true);
    });

    mm.add("(prefers-reduced-motion: no-preference)", () => {
      const fadeEls = gsap.utils.toArray<HTMLElement>("[data-hero-fade]");
      gsap.set(fadeEls, { autoAlpha: 0, y: 16 });

      let split: SplitText | undefined;
      let cancelled = false;
      const tl = gsap.timeline({
        paused: true,
        onComplete: () => {
          sessionStorage.setItem(SEEN_KEY, "1");
          setDone(true);
        },
      });

      document.fonts.ready.then(() => {
        if (cancelled) return;
        split = SplitText.create("[data-split-hero]", {
          type: "lines",
          mask: "lines",
        });
        gsap.set(split.lines, { yPercent: 110 });

        if (!seen && overlay) {
          const counter = { v: 0 };
          tl.to(counter, {
            v: 100,
            duration: 1.4,
            ease: "power2.inOut",
            onUpdate: () => {
              if (counterRef.current) {
                counterRef.current.textContent = String(
                  Math.round(counter.v),
                ).padStart(3, "0");
              }
            },
          }).to(
            overlay,
            { yPercent: -100, duration: 0.9, ease: "expo.inOut" },
            "+=0.15",
          );
        } else if (overlay) {
          gsap.set(overlay, { autoAlpha: 0 });
        }

        tl.to(
          split.lines,
          { yPercent: 0, duration: 0.9, ease: "expo.out", stagger: 0.09 },
          seen ? 0 : "-=0.45",
        ).to(
          fadeEls,
          { autoAlpha: 1, y: 0, duration: 0.7, ease: "power2.out", stagger: 0.08 },
          "-=0.55",
        );
        tl.play();
      });

      return () => {
        cancelled = true;
        tl.kill();
        split?.revert();
      };
    });
  });

  if (done) return null;

  return (
    <div
      ref={overlayRef}
      data-opening
      aria-hidden
      className="fixed inset-0 z-[100] flex items-center justify-center bg-ink"
    >
      <noscript>
        <style>{`[data-opening]{display:none}`}</style>
      </noscript>
      <span className="font-display text-sm font-semibold tracking-[0.5em] uppercase opacity-60">
        {site.brand}
      </span>
      <span
        ref={counterRef}
        className="font-display absolute right-6 bottom-5 text-7xl font-semibold tabular-nums opacity-90 md:right-10 md:bottom-8 md:text-8xl"
      >
        000
      </span>
    </div>
  );
}
