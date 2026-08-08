# H0. 공개 랜딩 — 재현 프롬프트

> **용도**: 이 문서 하나만 프롬프트로 입력하면 현재 랜딩(`src/app/(marketing)/`)을 동일하게 재현할 수 있도록, 코드에 흩어진 모든 값을 추출한 스펙이다. 앱 화면 규약([\_common.md](_common.md))과는 무관 — 랜딩은 별도 무드다. 소스: `src/components/landing/*` 6파일, `src/lib/landing-content.ts`, `src/app/globals.css`.

## 목표·전제

아래 스펙대로 **원페이지 시네마틱 다크 랜딩**을 구현하라 (cipher.tv 무드).

- **페이지 스크롤 없음** — 뷰포트 1스크린 고정(`h-svh overflow-hidden`, 섹션 `min-h-[560px]`). 스크롤/스와이프 입력은 링 캐러셀 회전으로 소비된다.
- 기술: Next.js App Router + Tailwind CSS v4(CSS-first `@theme`) + GSAP(+SplitText, `@gsap/react`의 `useGSAP`). `gsap.ticker.lagSmoothing(0)` 설정(백그라운드 탭 복귀 시 크롤 방지).
- 구성은 셋뿐: ① 오프닝 프리로더 → ② 링 캐러셀 히어로(+호버 프래그먼트) → ③ 고정 헤더·하단 바.

## 디자인 토큰

| 토큰 | 값 | 용도 |
|---|---|---|
| `ink` | `#0a0a0b` | 배경 니어블랙 |
| `ink-soft` | `#131315` | 시트·서브 표면 |
| `paper` | `#f4f2ee` | 텍스트 웜 오프화이트 |
| `muted` | `#8b8a86` | 보조 텍스트 |
| `line` | `#26262a` | 보더 |
| `spot` | `#ff5c28` | 오렌지 액센트 — **페이지에서 유일한 채도** |

- `::selection` = spot 배경 + ink 텍스트.
- 중간톤은 토큰 추가 대신 **투명도 변형**으로: `text-paper/70·60·50`, `border-paper/15·25·40`, `bg-ink/50` 등.
- 폰트: **Pretendard Variable**(weight 45–920, 한글 본문 = `font-sans`, 폴백 Apple SD Gothic Neo) + **Clash Display Variable**(weight 200–700, `font-display` — 영문 라벨·숫자·워드마크 전용, 폴백 Pretendard). 로컬 woff2, `display: swap`. 미보유 시 Clash Display는 Fontshare 무료 배포(임시 대체: Space Grotesk).

## 레이아웃 3층

**헤더** — `fixed` 상단 z-50, **`mix-blend-difference`**(배경 밝기에 따라 자동 반전), `px-5 py-5 md:px-10`.
좌: `CAST` 워드마크(`#top` 앵커, Clash `text-xl font-semibold tracking-widest uppercase`) / 우: `행사 문의`(mailto, `text-sm tracking-wide opacity-80` hover 100).

**히어로 중앙 오버레이** — 절대배치 z-40, 중앙 정렬 세로 컬럼, `pointer-events-none`(CTA만 auto), 전체 `text-shadow: 0 2px 24px rgb(10 10 11 / 0.9)`:

1. eyebrow `EVENT WORKFORCE PLATFORM` — Clash `text-[11px] md:text-xs tracking-[0.35em] uppercase opacity-70`
2. h1 `무대를 완성하는` / `사람들` 2줄 — `text-[clamp(2.2rem,6vw,5.5rem)] leading-[1.05] font-extrabold tracking-tight`
3. sub `검증된 프로모터 팀을 추천받고, 예약부터 현장 운영까지 한 흐름으로.` — `mt-5 max-w-md text-sm md:text-base text-paper/70`
4. 통계 3개 — `mt-6 gap-6 md:gap-8`, 숫자 Clash `text-xl md:text-2xl font-semibold` + 접미사(`text-sm text-paper/60`) + 라벨(`text-[11px] text-paper/50`): **128건 누적 프로젝트 · 1,840명 누적 파견 · 87% 재의뢰율**
5. CTA `행사 문의` — `mt-8 text-sm uppercase tracking-wide`, 밑줄 `border-b border-paper/40 pb-1`, hover 시 보더·텍스트 spot

**하단 바** — absolute `inset-x-5 md:inset-x-10 bottom-5` z-40, `text-[11px] tracking-wide text-paper/50`: 좌 `hello@cast.example`(mailto, hover paper) / 우 `© 2026 CAST — 행사 전문 인력 플랫폼`.

## 링 캐러셀

**기하**
- 12장 세로 `aspect-[3/4]` 카드, 폭 `124px → sm:148px → md:clamp(160px,14vw,240px)`, `rounded-sm`, 중앙 앵커(translate -50%).
- 타원 궤도: 반경 `a = min(뷰포트폭 × 0.34, 560px)`, `b = clamp(150px, 뷰포트높이 × 0.26, 230px)`, 화면 중앙 기준 **−20° 틸트**.
- **호 길이 기준 균일 간격 — 등각 배치 금지**(타원 좌우 끝에서 카드가 뭉친다). 구현: 둘레를 1440 샘플의 호 길이 LUT로 만들고, 이진탐색 + 선형보간으로 진행률→각도 변환. 리사이즈 시 재계산.
- 깊이: `d = (sinθ + 1) / 2`로 스케일 `0.55 + 0.45d`, 뒤쪽 카드에 `bg-ink` 딤 오버레이 `opacity = 0.38 × (1 − d)`(호버 시 0으로), z-index `10 + round(20d)`.

**운동**
- 자동 회전 **1바퀴 52초**, GSAP ticker(rAF) 구동, 프레임 델타 100ms 클램프.
- 휠: `preventDefault` 후 `임펄스 += deltaY × 0.00035`, 임펄스는 초당 `exp(−3t)` 감쇠. 터치 드래그 동일(감도 ×4).
- 호버: 해당 카드 스케일 **1.06**(깊이 무관 동일 크기)·z-60, **나머지 11장 전부 `grayscale(1)`**(CSS transition 0.4s ease). 호버 보간은 지수 스무딩(초당 계수 9)으로 부드럽게.
- 카드 미디어: 기본 poster 이미지, **호버 시에만 video 재생**(hover 가능 기기 && 모션 감소 아님). 모바일(hover 불가)은 탭 = 프래그먼트 토글, video 없이 poster만.
- 카드 라벨: 좌하단 `bottom-2 left-3`, Clash `text-xs md:text-sm font-semibold tracking-widest uppercase` + `text-shadow: 0 1px 10px rgb(10 10 11 / 0.9)`.

## 호버 프래그먼트 패널

호버(모바일: 탭)된 카드의 실적 조각 정보. `aria-hidden`(장식). 모션 감소 시 아예 렌더하지 않음.

- **데스크탑**: 우측 `right-[4vw]` 세로 중앙(`top-1/2 -translate-y-1/2`), 폭 `24vw`(min 240 / max 360px), **배경 투명**(가독은 `text-shadow: 0 1px 16px`), pointer-events 없음, z-55.
- **모바일**: 하단 시트 — `fixed inset-x-0 bottom-0` z-62, `rounded-t-xl border-t border-line bg-ink-soft/95`, `max-h-[46svh] overflow-y-auto px-5 pt-4 pb-6`, 우상단 ✕ 닫기(Clash, `md:hidden`).
- 콘텐츠 순서: ① 카테고리 라벨(Clash `text-[11px] tracking-[0.3em] uppercase opacity-60`) ② 한글 제목(`text-2xl font-bold tracking-tight`) ③ 한 줄 note(`text-sm text-paper/70`) ④ 실적 리스트 — 행마다 `border-t border-paper/15 py-2 text-[13px]`, **연도(Clash `text-xs` spot)** · 행사명(`text-paper/85` truncate) · 규모(`text-xs text-paper/50`) ⑤ 역할 pill — `rounded-full border border-paper/25 bg-ink/50 px-2.5 py-0.5 text-[11px] text-paper/85` ⑥ 스냅 사진 2장 — 데스크탑은 `aspect-[4/3]` 영역에 겹침 배치(1장 좌상 폭 54% **−5° 회전**, 2장 우측 폭 46% **+4° 회전**, `shadow-2xl shadow-black/60`), 모바일은 가로 나란히 `h-24`.
- 타이밍: **등장 0.12s 지연**(카드 사이를 빠르게 스칠 때 깜빡임 방지) → 컨테이너 0.2s 페이드 + 항목 `y:18→0` expo.out 0.45s stagger 0.05. **퇴장 0.6s 지연** → 0.5s 페이드(그 사이 재호버하면 취소). 퇴장 중에도 마지막 콘텐츠 유지(빈 패널 금지).

## 오프닝 시퀀스

풀스크린 `bg-ink` 오버레이 z-100. 중앙 `CAST`(Clash `text-sm font-semibold tracking-[0.5em] uppercase opacity-60`), 우하단 카운터(`right-6 bottom-5 md:right-10 md:bottom-8`, Clash `text-7xl md:text-8xl font-semibold tabular-nums opacity-90`).

| # | 단계 | duration / ease |
|---|---|---|
| 1 | 카운터 `000`→`100`(3자리 0 패딩) | 1.4s power2.inOut |
| 2 | +0.15s 대기 → 오버레이 `yPercent:-100` 위로 걷힘 | 0.9s expo.inOut |
| 3 | h1 라인 마스크 리빌(SplitText `lines`+mask, `yPercent:110→0`) — 2와 0.45s 겹침 | 0.9s expo.out, stagger 0.09 |
| 4 | 나머지 요소(링·eyebrow·sub·통계·CTA·하단 바) `y:16` 페이드업 — 3과 0.55s 겹침 | 0.7s power2.out, stagger 0.08 |

- `sessionStorage("cast-opened")`로 **세션당 1회**. 재방문은 오버레이 즉시 숨기고 3–4단계만 실행.
- SplitText는 **폰트 로드 완료 후**(`document.fonts.ready`) 실행 — FOUT 줄바꿈 오차 방지.
- 모션 감소 설정 시 오프닝 전체 스킵, 모든 요소 즉시 표시. noscript 시 오버레이 `display:none`.

## 카피·콘텐츠 전문

> 전부 **가상 목업**(실존 브랜드·실적 아님) — 공개 전 실데이터 교체. 코드에서는 `src/lib/landing-content.ts` 한 파일에 모아 교체 지점을 일원화한다.

- 브랜드 `CAST` / 태그라인 `행사 전문 인력 플랫폼` / 이메일 `hello@cast.example`
- 메타 title `CAST — 행사 전문 인력 플랫폼`, description `행사 조건을 입력하면 검증된 프로모터 팀을 추천하고, 예약부터 현장 운영과 긴급 대체 투입까지 하나의 흐름으로 관리합니다.`

12개 카테고리(표 순서 = 궤도 배치 순서 = 미디어 파일 순서):

| 라벨 | hue | 제목 | note | 역할 | 실적 |
|---|---|---|---|---|---|
| STAGE | 16 | 무대 운영 | 리허설부터 철수까지, 무대 뒤를 지키는 팀. | 무대 진행, 운영 스태프, 리더 | 2025 여의도 신차 발표 무대 · 운영 8명 / 2024 코엑스 시상식 무대 · 운영 11명 |
| POP-UP | 24 | 팝업스토어 | 첫인사부터 계산대까지, 브랜드 경험을 접객으로. | 리셉션, 브랜드 앰배서더, 진열·재고 | 2025 성수 뷰티 팝업 4주 운영 · 스태프 12명 / 2025 한남 패션 팝업 · 스태프 6명 |
| RUNWAY | 45 | 런웨이 · 쇼 | 쇼의 템포를 아는 사람들로 백스테이지를 채웁니다. | 모델, 피팅 스태프, 백스테이지 | 2025 DDP 컬렉션 쇼 백스테이지 · 스태프 14명 / 2024 강남 편집숍 트렁크쇼 · 모델 8명 |
| EXPO | 205 | 전시 · 박람회 | 부스 운영과 리드 수집까지, 훈련된 팀이 갑니다. | 부스 운영, 제품 데모, 안내, 영어 응대 | 2025 킨텍스 산업 박람회 부스 · 운영 22명 / 2025 코엑스 IT 전시 부스 · 데모 9명 |
| FESTIVAL | 215 | 페스티벌 | 수만 인파 속에서도 흐트러지지 않는 운영. | 게이트, 안내, 운영 스태프, 리더 | 2024 난지 뮤직 페스티벌 게이트 · 스태프 35명 / 2024 잠실 푸드 페스티벌 · 안내 18명 |
| SHOWCASE | 300 | 쇼케이스 | 무대와 객석 사이의 모든 순간을 케어합니다. | 진행 보조, 아티스트 케어, 안내 | 2025 홍대 아티스트 쇼케이스 · 진행 7명 / 2024 성수 리스닝 파티 · 케어 5명 |
| LAUNCH | 350 | 론칭 행사 | 미디어와 VIP 앞에 서는 정예 구성. | VIP 응대, MC, 제품 데모 | 2025 청담 플래그십 론칭 · VIP 응대 10명 / 2024 한강 신제품 미디어데이 · 정예 12명 |
| BRAND DAY | 18 | 브랜드 데이 | 브랜드의 톤을 입은 사람들이 하루를 만듭니다. | 브랜드 앰배서더, 체험 부스, 샘플링 | 2025 잠실 스포츠 브랜드 데이 · 앰배서더 16명 / 2024 광화문 코스메틱 체험존 · 스태프 9명 |
| ROADSHOW | 265 | 로드쇼 | 도시를 옮겨 다녀도 품질은 그대로. | 현장 안내, 샘플링, 운영 스태프 | 2025 전국 5개 도시 시승 로드쇼 · 회차당 12명 / 2024 부산·대구 순회 판촉 · 스태프 10명 |
| VIP | 340 | VIP 행사 | 이름과 취향을 기억하는 응대가 격을 만듭니다. | VIP 응대, 리셉션, 통역 | 2025 청담 갤러리 VIP 프리뷰 · 응대 6명 / 2024 호텔 연말 갈라 디너 · 응대 14명 |
| CONCERT | 285 | 콘서트 | 입장부터 퇴장까지, 관객 동선을 설계합니다. | 게이트, 객석 안내, 안전 스태프 | 2024 고척돔 콘서트 게이트 · 안내 40명 / 2024 올림픽홀 팬미팅 · 스태프 24명 |
| PROMOTION | 170 | 프로모션 | 지나가는 발걸음을 멈추게 하는 현장 판촉. | 샘플링, 판촉, 행사 안내 | 2025 코엑스몰 샘플링 프로모션 · 판촉 15명 / 2024 타임스퀘어 런칭 판촉 · 스태프 8명 |

## 미디어 규칙

- 카드당 `/media/{이름}.mp4` + `/media/{이름}-poster.jpg`(3:4 세로). 이름 순서: `hero-01, ring-popup, talent-04, ring-expo, hero-02, ring-showcase, case-launch, ring-brand, case-festival, ring-vip, hero-03, ring-promo`.
- 프래그먼트 스냅: 카테고리별 `/media/snap-{slug}.jpg` 1장 + 다른 카테고리 poster 1장 재사용(정확한 쌍은 `landing-content.ts`).
- **미디어 미보유 시 placeholder**: `linear-gradient(160deg, hsl(H 42% 17%) 0%, hsl(H+40 48% 9%) 45%, #0a0a0b 100%)` — H는 위 표의 hue. video→poster→그라디언트 3단 폴백.
- video 속성: `muted loop playsInline preload="none" disablePictureInPicture` + `aria-label`(장면 설명). IntersectionObserver로 화면 밖 일시정지.

## 접근성·폴백

- `prefers-reduced-motion`: 오프닝 스킵, 링 회전 정지(정적 1프레임 배치), video 미재생(poster만), 프래그먼트 미렌더, grayscale transition 제거. 미디어쿼리 변경을 구독해 런타임 전환도 반영.
- 터치 기기: 카드 탭 = 프래그먼트 시트 토글(재탭·✕로 닫기).
- 상태 유지: 프리로더 1회 노출은 `sessionStorage`(탭 단위), 새로고침 시 재생 안 함.
