"use client";
import { useRef, useSyncExternalStore } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { hero, ringClips, site } from "@/lib/landing-content";
import { ClipMedia } from "./clip-media";

gsap.registerPlugin(useGSAP);

const TILT = (-20 * Math.PI) / 180;
const BASE_SPEED = 1 / 52; // 자동 회전: 1바퀴 52초
const WHEEL_GAIN = 0.00035; // 휠 deltaY → 회전 임펄스
const IMPULSE_DECAY = 3; // 초당 감쇠율 (exp)
const HOVER_SCALE = 1.06; // 호버 시 최종 크기 — 깊이와 무관하게 동일
const SAMPLES = 1440;

function subscribe(cb: () => void) {
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)");
  const hover = window.matchMedia("(hover: hover)");
  reduce.addEventListener("change", cb);
  hover.addEventListener("change", cb);
  return () => {
    reduce.removeEventListener("change", cb);
    hover.removeEventListener("change", cb);
  };
}

const reducedSnap = () =>
  window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const hoverSnap = () => window.matchMedia("(hover: hover)").matches;

export function RingCarousel() {
  const reduced = useSyncExternalStore(subscribe, reducedSnap, () => false);
  const hoverable = useSyncExternalStore(subscribe, hoverSnap, () => false);
  const sectionRef = useRef<HTMLElement>(null);
  const cardRefs = useRef<(HTMLDivElement | null)[]>([]);
  const dimRefs = useRef<(HTMLDivElement | null)[]>([]);
  const hoveredRef = useRef(-1);

  useGSAP(
    () => {
      const section = sectionRef.current;
      const cards = cardRefs.current.filter(Boolean) as HTMLDivElement[];
      if (!section || !cards.length) return;
      const n = cards.length;

      let a = 0;
      let b = 0;
      // 타원 위 균일 간격 배치용 호 길이 룩업 (등각 배치는 좌우 끝에서 뭉친다)
      let lut: number[] = [];
      const measure = () => {
        a = Math.min(window.innerWidth * 0.34, 560);
        b = Math.min(Math.max(window.innerHeight * 0.26, 150), 230);
        lut = [0];
        let px = a;
        let py = 0;
        let total = 0;
        for (let k = 1; k <= SAMPLES; k++) {
          const th = (k / SAMPLES) * Math.PI * 2;
          const x = a * Math.cos(th);
          const y = b * Math.sin(th);
          total += Math.hypot(x - px, y - py);
          lut.push(total);
          px = x;
          py = y;
        }
      };
      // 샘플 사이 선형 보간 — 양자화 점프 제거
      const thetaAtFraction = (f: number) => {
        const target = f * lut[SAMPLES];
        let lo = 0;
        let hi = SAMPLES;
        while (lo < hi) {
          const mid = (lo + hi) >> 1;
          if (lut[mid] < target) lo = mid + 1;
          else hi = mid;
        }
        if (lo === 0) return 0;
        const seg = lut[lo] - lut[lo - 1];
        const frac = seg > 0 ? (target - lut[lo - 1]) / seg : 0;
        return ((lo - 1 + frac) / SAMPLES) * Math.PI * 2;
      };
      measure();
      window.addEventListener("resize", measure);

      let t = 0;
      let impulse = 0;
      const hoverAmt = new Array(n).fill(0);
      const lastZ = new Array(n).fill(-1);

      const render = (dt: number) => {
        t += (BASE_SPEED + impulse) * dt;
        impulse *= Math.exp(-IMPULSE_DECAY * dt);
        const hovered = hoveredRef.current;
        for (let i = 0; i < n; i++) {
          const target = i === hovered ? 1 : 0;
          hoverAmt[i] += (target - hoverAmt[i]) * Math.min(1, dt * 9);
          const ha = hoverAmt[i];
          const frac = (((t + i / n) % 1) + 1) % 1;
          const theta = -thetaAtFraction(frac);
          const x0 = a * Math.cos(theta);
          const y0 = b * Math.sin(theta);
          const x = x0 * Math.cos(TILT) - y0 * Math.sin(TILT);
          const y = x0 * Math.sin(TILT) + y0 * Math.cos(TILT);
          const d = (Math.sin(theta) + 1) / 2;
          const depthScale = 0.55 + 0.45 * d;
          const scale = depthScale + (HOVER_SCALE - depthScale) * ha;
          const el = cards[i];
          el.style.transform = `translate3d(calc(${x}px - 50%), calc(${y}px - 50%), 0) scale(${scale})`;
          const z = ha > 0.02 ? 60 : 10 + Math.round(20 * d);
          if (z !== lastZ[i]) {
            el.style.zIndex = String(z);
            lastZ[i] = z;
          }
          const dim = dimRefs.current[i];
          if (dim) dim.style.opacity = String(0.38 * (1 - d) * (1 - ha));
        }
      };

      if (reduced) {
        render(0);
        return () => window.removeEventListener("resize", measure);
      }

      const tick = (_time: number, deltaTime: number) => {
        render(Math.min(deltaTime, 100) / 1000);
      };
      gsap.ticker.add(tick);

      // 스크롤 입력 = 회전 구동 (페이지 스크롤 없음)
      const onWheel = (e: WheelEvent) => {
        e.preventDefault();
        impulse += e.deltaY * WHEEL_GAIN;
      };
      let touchY = 0;
      const onTouchStart = (e: TouchEvent) => {
        touchY = e.touches[0].clientY;
      };
      const onTouchMove = (e: TouchEvent) => {
        e.preventDefault();
        const y = e.touches[0].clientY;
        impulse += (touchY - y) * WHEEL_GAIN * 4;
        touchY = y;
      };
      section.addEventListener("wheel", onWheel, { passive: false });
      section.addEventListener("touchstart", onTouchStart, { passive: true });
      section.addEventListener("touchmove", onTouchMove, { passive: false });

      return () => {
        window.removeEventListener("resize", measure);
        gsap.ticker.remove(tick);
        section.removeEventListener("wheel", onWheel);
        section.removeEventListener("touchstart", onTouchStart);
        section.removeEventListener("touchmove", onTouchMove);
      };
    },
    { scope: sectionRef, dependencies: [reduced] },
  );

  const setHovered = (idx: number) => {
    hoveredRef.current = idx;
    for (let i = 0; i < cardRefs.current.length; i++) {
      const card = cardRefs.current[i]?.querySelector(".ring-card");
      card?.classList.toggle("ring-gray", idx !== -1 && i !== idx);
    }
  };

  return (
    <section
      ref={sectionRef}
      id="top"
      className="relative h-svh min-h-[560px] overflow-hidden"
    >
      <div data-hero-fade className="ring absolute inset-0">
        {ringClips.map((item, i) => (
          <div
            key={item.label}
            ref={(el) => {
              cardRefs.current[i] = el;
            }}
            className="absolute top-1/2 left-1/2 w-[124px] will-change-transform sm:w-[148px] md:w-[clamp(160px,14vw,240px)]"
            onMouseEnter={() => setHovered(i)}
            onMouseLeave={() => setHovered(-1)}
          >
            <article className="ring-card relative aspect-[3/4] overflow-hidden rounded-sm">
              <ClipMedia clip={item.clip} video={hoverable && !reduced} />
              <div
                ref={(el) => {
                  dimRefs.current[i] = el;
                }}
                aria-hidden
                className="pointer-events-none absolute inset-0 bg-ink"
              />
              <span className="ring-label font-display absolute bottom-2 left-3 z-[1] text-xs font-semibold tracking-widest uppercase [text-shadow:0_1px_10px_rgb(10_10_11/0.9)] md:text-sm">
                {item.label}
              </span>
            </article>
          </div>
        ))}
      </div>

      <div className="pointer-events-none absolute inset-0 z-40 flex flex-col items-center justify-center px-6 text-center [text-shadow:0_2px_24px_rgb(10_10_11/0.9)]">
        <p
          data-hero-fade
          className="font-display mb-4 text-[11px] tracking-[0.35em] uppercase opacity-70 md:text-xs"
        >
          {hero.eyebrow}
        </p>
        <h1
          data-split-hero
          className="text-[clamp(2.2rem,6vw,5.5rem)] leading-[1.05] font-extrabold tracking-tight"
        >
          {hero.titleKo.map((line) => (
            <span key={line} className="block">
              {line}
            </span>
          ))}
        </h1>
        <p
          data-hero-fade
          className="mt-5 max-w-md text-sm leading-relaxed text-paper/70 md:text-base"
        >
          {hero.sub}
        </p>
        <div
          data-hero-fade
          className="pointer-events-auto mt-8 flex items-center gap-8"
        >
          {site.nav.map((item) => (
            <a
              key={item.label}
              href={item.href}
              className="border-b border-paper/40 pb-1 text-sm tracking-wide uppercase transition-colors hover:border-spot hover:text-spot"
            >
              {item.label}
            </a>
          ))}
        </div>
      </div>

      <div
        data-hero-fade
        className="absolute inset-x-5 bottom-5 z-40 flex items-center justify-between text-[11px] tracking-wide text-paper/50 md:inset-x-10"
      >
        <a
          href={`mailto:${site.email}`}
          className="pointer-events-auto transition-colors hover:text-paper"
        >
          {site.email}
        </a>
        <span>
          © 2026 {site.brand} — {site.tagline}
        </span>
      </div>
    </section>
  );
}
