# HOME. 내부 홈 — 재현 프롬프트

> **용도**: 이 문서 하나만 프롬프트로 입력하면 현재 `/home`을 동일하게 재현할 수 있도록, 코드에 흩어진 모든 값을 추출한 스펙이다. **UI/UX 개편의 기준 문서** — 여기서 레이아웃·무드를 바꾼 뒤 코드에 반영한다(하단 "개편 가드레일"의 도메인 불변만 지키면 나머지는 전부 바꿔도 된다). 소스: `src/app/home/page.tsx`, `src/components/home/*` 4파일(bits·worker-strip·job-explorer·buyer-mini-form), `src/lib/home-content.ts`·`buyer-flow-content.ts`, 공용 `site-chrome.tsx`·`pipeline-timeline.tsx`, `src/app/globals.css`. [공통 규약](_common.md) 적용.
> **상태**: 목업 구현됨(2026-08-11 — Claude Design `CAST Home` 개편 반영: **공고 탐색·행사 모집 양면 탭**, 본문 2열(탐색+aside), AI 맞춤 추천, 목록/지도 뷰 토글, 평판 점수 92점(구 온도), 급구 적합도 배지, **상태 스트립 = 프로필 허브**(펼침 패널+포트폴리오 모달)). 데이터 전부 가상, 필터·견적·단가·추천은 실제 클라이언트 계산.

## 목표·전제

**공개 구인보드 스타일의 라이트 앱 화면** (참고 모델: 사람인·알바몬·잡코리아 메인 — 랜딩의 시네마틱 다크와 별개 무드). 양방향 플랫폼의 단일 관문을 **한 URL의 양면 탭**으로 나눈다: 기본 면(`/home`)은 Worker의 공고 탐색(pull), `?tab=buyer` 면은 Buyer의 행사 모집 진입. 인앱 알림센터가 없는 결정에 따라 **공고 탐색 면이 로그인 Worker의 상태 표면(알림센터 역할)을 겸한다**.

- 기술: Next.js App Router — 탭 분기는 서버(`await searchParams`, `/home`은 동적 렌더), 필터 상태는 `JobExplorer`·`BuyerMiniForm` 두 클라이언트 컴포넌트에만 격리. Tailwind v4(CSS-first `@theme`) + shadcn/ui new-york.
- 반응형·모바일 퍼스트: 터치 타깃 `h-11`(44px) → `md:h-8~10` 축소, 본문 `text-base lg:text-sm`. 캐러셀 없음 — 메인 열은 그리드, aside는 `lg` 미만에서 메인 아래로 쌓인다.
- 페이지 골격(공고 탐색 면): 헤더(sticky) → 검색 히어로(`border-b bg-card`) → `main.mx-auto.max-w-6xl.px-4.md:px-8` 안에 상태 스트립(`mt-5`) → **본문 2열** `mt-7 grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_340px]`(메인: AI 추천 → 주말 → 신규 공고 / aside: 행사&광고 → 급구) → 푸터. 메인 열 섹션 간격 `mt-8`.
- 행사 모집 면: 헤더 → `main` 안에 센터 히어로+미니폼(`mt-9`) → 안전망(`mt-12`) → 타임라인(`mt-12`) → 푸터.

## 디자인 토큰 (시맨틱 — 앱 화면은 이것만 사용)

| 토큰 | 라이트 | `.dark` 아일랜드 | 용도 |
|---|---|---|---|
| `background` | `#f4f2ee` 웜 페이퍼 | `#0a0a0b` | 페이지 바닥 / 다크 카드 바닥 |
| `foreground` | `#0a0a0b` | `#f4f2ee` | 본문 |
| `card` | `#ffffff` | `#131315` | 카드·헤더·히어로 표면 |
| `muted` / `muted-foreground` | `#eceae4` / `#6b6a66` | `#1a1a1e` / `#8b8a86` | 서브 표면·지도 바닥 / 보조 텍스트 |
| `primary` | `#ff5c28` (fg `#0a0a0b`) | 동일 | 버튼·핀 도트·가용일 바·GNB 활성 언더라인 |
| `border`·`input` | `#e2dfd8` | `#26262a` | 보더 |
| `ring` | `#ff5c28` | 동일 | 포커스 |

- 다크는 전역 토글이 아니라 **`className="dark"` 래퍼로 섹션 단위 반전**(③ 상태 스트립). `dark:` 접두 유틸리티는 쓰지 않는다.
- 강조색: `text-orange-700` = 라이트 표면 강조 텍스트(히어로 현황·단가 배지·주말 요일·추천 사유 칩·후보 수) / 다크 아일랜드에서는 `orange-400`(점수·관리 링크)·`amber-400`(주의). 오렌지 표면: `orange-100` 추천 사유 칩·수도권 배지, `orange-200` 추천 카드·급구 패널 보더, `orange-50` 견적 박스·급구 패널 그라데이션 끝. 상태색: `amber` 대기·주의, `red-600` critical 마감·급구·사이렌, `green` 잔여·적합, `blue` 신규.
- 애니메이션(globals.css, `prefers-reduced-motion` 시 해제): `.animate-siren-pulse` 사이렌 도트 박스섀도 펄스 1.6s / `.animate-siren-blink` critical 카운트다운 점멸 1.1s.
- 폰트: Pretendard Variable(`font-sans`) + Clash Display(`font-display` — CAST 워드마크 전용). 카드 관용구: `rounded-lg border bg-card p-4~6 shadow-sm`, hover `hover:border-foreground/25`. 숫자 `tabular-nums`.

## 공용 컴포넌트

- **StatusBadge** `rounded-full px-2 py-0.5 text-xs font-medium` — 톤: `amber` · `blue` · `red` · `green`(bg-*-100/text-*-800) · `neutral`(border/text-muted-foreground)
- **chipClass(active)** `inline-flex h-11 items-center rounded-full border bg-card px-4 hover:bg-accent md:h-8 md:text-sm`; active → `border-transparent bg-foreground font-medium text-background`
- **SectionHead** `flex items-baseline justify-between`: h2 `text-base font-semibold` + caption `text-xs muted` / 우측 `action` 슬롯 또는 href "전체 보기 →"
- **JobCard**(⑤⑥⑦ 공용, `/jobs/{id}` 링크, 세로 4단 `gap-3 p-4`):
  1. 배지행 `justify-between`: 좌 = 카테고리(neutral) · 급구(red) · 신규(blue) · 조건 칩(neutral) / 우 = D-day(`text-xs muted tabular-nums`)
  2. 제목 `text-sm font-semibold leading-snug` + 주최 `text-xs muted`
  3. 일시 / 장소 · 역할 n명 `text-xs muted tabular-nums`
  4. 하단 `mt-auto border-t pt-3 justify-between`: **단가** `₩{jobHourly 합계}/h` + rateNote `text-xs orange-700` = `P2 기준`(+가산 있으면 ` · 가산 포함`), `title` 툴팁에 가산 내역 / 우 = standby면 amber `정원 충족 · 대기 지원`, 아니면 `잔여 n자리`(green)
  - **`reasons` prop = AI 추천 변형**: 보더 `border-orange-200 hover:border-primary`, 배지행이 추천 사유 칩(`bg-orange-100 text-orange-700 text-[11px]`, `✓ 가용일 일치` 형식)으로 교체, 주최 줄이 `주최 · 카테고리`로

## 공고 탐색 면 (`/home` 기본) — 섹션별 스펙

### ① 공용 헤더 — `SiteHeader active="board"|"buyer"`
`sticky top-0 z-40 border-b bg-card`, 내부 `flex gap-6 px-5 py-3.5 md:px-10`. 좌: `CAST` 워드마크(Clash, → `/home`) / GNB(`text-sm tracking-wide`): 소개(`/`, md+) · **공고(`/home`)** · **행사 모집(`/home?tab=buyer`)** · 기업 서비스(`#`, md+) — 공고·행사 모집은 홈 양면 탭이라 **모바일에도 노출**, 활성 항목은 `font-medium` + **primary 인셋 언더라인**(`[box-shadow:inset_0_-2px_0_var(--color-primary)]`) / 우: 로그인(ghost sm, `#`) + 공고 등록(primary sm, → `/post`).

### ② 검색 히어로 — 컴팩트 인라인
`border-b bg-card`, 내부 `py-6`.
- 현황 줄(`text-xs font-medium text-orange-700 tabular-nums`): `8월 2주차 · 모집 중 공고 128건 · 이번 주 시작 42건 · 활동 프로모터 1,840명 · 재의뢰율 87%`
- **h1 + 검색 폼 인라인**(`mt-3 flex flex-wrap items-center gap-x-4`): h1 `text-lg md:text-xl font-semibold` `일할 행사를 찾고, 함께할 사람을 만나는 곳` + 폼 `flex-1 min-w-[280px] md:max-w-xl`(Input `지역, 행사 유형, 역할로 검색` + 검색 버튼 — 미동작 `action="#"`)
- 퀵필터 칩 7개(`mt-3`, chipClass, `#`): 서울 · 경기·인천 · 이번 주말 · 급구 · 전시·박람회 · 팝업스토어 · 페스티벌

### ③ 워커 상태 스트립 = 프로필 허브 — 다크 아일랜드, 홈의 알림센터 (`WorkerStrip` 클라이언트)
`mt-5`, `aria-label="내 상태"`. 컨테이너 `dark rounded-lg bg-background text-sm overflow-hidden`, 응답 필요>0이면 `ring-1 ring-amber-400/40`. 상태 2개: `open`(펼침 패널) · `modal`(포트폴리오 수정).

**접힌 행**(`flex items-start gap-3.5 px-4 py-3`): **아바타**(`size-9 rounded-full bg-primary`, 이름 2번째 글자 "지") + 2줄 요약 + 우측 **`펼치기 ▾`/`접기 ▴` 토글**(`w-[118px] rounded-full border`, hover orange-400):
1. 1줄: `김지수님` · **`92점`**(평판 점수 — `text-orange-400 cursor-help`, 툴팁 "0~100점 공개 점수", `[정책]`) · **`P2` 배지**(`border-orange-400/50 text-orange-400`) · 프로필 요약(`text-xs muted`) `행사 스태프 · 여성 · 25세 · 서울·경기 · 한국어·영어 · 주말 가능 · `**`야외 불가`**(`text-red-400` — blockedConditions 파생)
2. 2줄 상태 항목(전부 `#`, 숫자만 `font-semibold text-foreground`): amber 배지 `응답 필요 1`+`2시간 12분 남음` · `검토 중 2` · `대기 1` · `이번 주 확정 근무 1` · `행사 방 1`+amber `새 공지 2`

**펼침 패널**(`border-t border-foreground/10`, `md:grid-cols-[300px_1fr]`):
- 좌 **8월 가용일 달력** + `가용일 관리 ›`(orange-400, `#`): 7열 미니 달력(`max-w-[280px]`, 헤더 일~토 — 주말 orange-400), 2026-08-01(토) 오프셋 6 + 31일. 셀(`aspect-square rounded-md text-[11px]`): 가용일(15·20·21) `bg-primary/90 font-bold` / **확정 근무(16)** `border-green-400/55 bg-green-400/15 text-green-400`(툴팁 = confirmedWork.label) / 지난날(<9) 흐림 / 나머지 `bg-foreground/5`. 아래 범례: 가용일(주황) · 확정 근무(초록)
- 우 **내 소개 · 매칭 설정** + `프로필 수정 ›`(→ 모달): dl 6행(라벨 `w-[58px]` muted) — 선호 유형(orange 틴트 칩) / 불가 조건(red 틴트 칩) / 활동 지역 `서울 전역 · 경기 남부` / 경력 `완료 12회 · 재의뢰 4회` / 자격 `영어 회화 · VIP 의전 미보유` / 한 줄 소개 인용

**포트폴리오 수정 모달** — 네이티브 `<dialog>`(ESC·포커스 트랩·백드롭 기본 제공, `showModal()` ref — open 가드), `max-w-4xl max-h-[90vh] rounded-2xl bg-card`, `backdrop:bg-black/55 + blur`, 백드롭 클릭 닫힘:
- sticky 헤더: `내 포트폴리오` + 캡션 `Buyer가 팀 구성 시 보게 되는 프로필입니다` + `미리보기 ↗`(`#`) + ✕
- 본문 `md:grid-cols-[340px_1fr]`: 좌 **사진 그리드**(3열 — 대표 `col/row-span-2 aspect-3/4` + 그라디언트 플레이스홀더 3장 + `+ 사진 추가` 대시드, 캡션 `최대 8장, 첫 장이 대표`/`드래그로 순서 변경`) / 우 이름·92점·P2 배지·`행사 스태프 · 프로모터` + **캐치프레이즈 Input** + **자기 소개 textarea**(defaultValue — 미저장) + 기본 정보 dl 2열(기본 `여성 · 25세 · 168cm`·지역·언어·자격·가능 `주말 · 야간`·경력) + **대표 경력** 박스(3건 + `+ 추가`)
- **선호 행사 유형 칩**(EVENT_TYPES 9종, 토글 — on `border-primary bg-orange-100 text-orange-700`) / **불가 조건 칩**(5종, on `✕ 야외` red, 캡션 `해당 공고는 목록에서 제외됩니다 (급구 제외)`) — 둘 다 클라이언트 로컬(저장 미반영)
- 푸터: `취소` outline / `저장` primary — 둘 다 닫기만(목업, 디자인의 저장 토스트는 생략)

### ④ 본문 2열 레이아웃
`mt-7 grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_340px]` — 메인 열(⑤⑥⑦, `min-w-0`) + aside(⑧, `flex flex-col gap-5 min-w-0`). `lg` 미만은 메인 아래로 aside가 쌓인다.

### ⑤ AI 맞춤 추천 — 메인 열 (로그인 전용)
SectionHead `지수님을 위한 AI 추천`(이름은 성 뗀 `name.slice(1)`) / `가용일 · 선호 유형 · 등급을 반영해 매일 갱신됩니다`. 그리드 `sm:grid-cols-2 xl:grid-cols-3`, JobCard `reasons` 변형.
- **추천 규칙**(`recommendedJobs` — 규칙 기반 목업, 실추천 모델로 교체 예정): visibleJobs 대상 가중치 = 가용일 겹침 2 + 선호 유형(태그) 2 + 신규 1, **점수 ≥ 2만, 상위 3건**. 사유 칩 = 해당 근거(`가용일 일치`·`선호 유형`·`신규`). 현재 결과: j-1(5점) · j-2(4점) · j-3(3점)

### ⑥ 이번 주말 — 메인 열
SectionHead title `이번 주말 8/15(토)–8/16(일)`, caption 분기: 가용일(15·20·21)∩주말 있으면 `김지수님, 토요일(8/15)이 가용일로 등록돼 있어요`(현재) / 없으면 `가장 수요가 많은 주말 공고`. 필터: 15·16에 걸치는 공고(`jobOnDay` 다일정 포함) ∧ 불가 조건 제외 → j-1·j-5. 그리드 `sm:grid-cols-2` JobCard.

### ⑦ 신규 공고 — 메인 열, 홈의 코어 (`JobExplorer` 클라이언트)
`mt-8`. 상태 5개: day·tab·zone(AND 결합 필터) + alertOn + **view(`list`|`map`)**.
- **헤더 행**(`justify-between`): h2 `신규 공고` / 우측 = **목록·지도 세그먼트 토글**(`rounded-full border bg-card p-0.5`, 활성 `bg-foreground text-background`) + **알림 옵트인 토글**(off `새 공고 알림 받기` → on `알림 신청됨 ✓ · 가용일·지역 기준`) — 클라이언트 로컬, 묶음·채널 `[정책]`
- **주간 날짜 스트립**(14일, 8/9~8/22): 버튼 `w-12 min-h-11 rounded-lg border bg-card` 세로 4줄 = 요일(주말 orange-700) / 일자 / 건수(불가 조건 제외 후, 0이면 `–`) / **가용일 바**(`h-[3px] w-3.5 rounded-full bg-primary` — 내 가용일만, 선택 시 orange-400). 스트립 아래 범례 `— 내 가용일`(`text-[11px] muted`). 탭=날짜 필터(재클릭 해제)
- **유형 탭** 7개(chipClass): 전체 · 행사 STAFF · 판촉·샘플링 · 전시·박람회 · 팝업스토어 · 공연·페스티벌 · VIP·의전 (표시 탭→category 매핑: 행사 STAFF=[론칭 행사, 로드쇼] · 공연·페스티벌=[페스티벌, 쇼케이스, 콘서트] · VIP·의전=[VIP 행사] · 나머지 1:1). 필터 활성 시 `필터 초기화` 텍스트 버튼
- **거점 건수 집계**(`zoneCounts`): **급구 4건 포함**(긴급 채널도 분포에 노출) + visibleJobs, **day·tab 필터 반영** — 핀을 누르기 전 남은 필터 조건 기준으로 갱신된다
- **목록 뷰**: 거점 칩 행 8개(`ZONES` 순서: 킨텍스 · 홍대·상암 · 여의도 · 고척 · 성수·한남 · 코엑스·청담 · 잠실 · 부산) — `rounded-full border bg-card min-h-8 text-xs` + primary 도트 + 건수, 선택 시 `bg-foreground text-background`, 재클릭 해제
- **지도 뷰**(자체 SVG — 지도 서비스 이미지 미사용, 약관): 카드 안 캡션 행(`{day ? '8/{day} 기준' : '전체 기간'} 공고 분포` / `자체 개략도 — 위치는 근사치 · 거점을 누르면 목록이 필터됩니다`) + `md:grid-cols-[1fr_1.25fr]` 2분할:
  - **전국 개략도**(viewBox `0 0 400 520`, 한반도 실루엣 path + 제주 ellipse, `fill-muted stroke-border`): **수도권 총계 배지**(위치 26%,17% — `border-primary bg-orange-100 text-orange-700`, 클릭 불가 라벨) + 광역 핀 6개(`REGION_PINS` %: 강원 63,20 · 대전·충청 38,42 · 대구 65,54 · 광주·전남 32,74 · 부산 76,81 · 제주 37,96) — 건수 0이면 흐림·`–`·disabled
  - **수도권 확대**(viewBox `0 0 800 420`, `fill-muted/60` + 한강 path `stroke-card` 22 round, 우하단 `수도권 확대` 캡션): 거점 핀 7개(`METRO_PINS` %: 킨텍스 12,20 · 홍대·상암 28,46 · 여의도 38,74 · 고척 20,90 · 성수·한남 58,36 · 코엑스·청담 66,70 · 잠실 85,50). 아래 안내 `수도권 거점은 확대 지도에서 선택하세요. 공고가 없는 지역은 흐리게 표시됩니다.`
- **불가 조건 캡션**(제외>0일 때): `내 불가 조건(야외)에 해당하는 공고 2건은 표시하지 않았어요 · 불가 조건 설정`(밑줄 `#`)
- 결과 그리드 `grid-cols-[repeat(auto-fill,minmax(250px,1fr))] gap-3` JobCard / 없으면 빈 상태 카드(`border-dashed`, `조건에 맞는 공고가 없어요` / `날짜·유형·지역 필터를 조정해 보세요`)
- 하단 행(`justify-between`): **세전 각주** `단가는 내 등급 기본단가에 역할 자격·행사 조건 가산을 더한 세전 금액이에요 — 3.3% 원천징수 후 지급됩니다.` + `공고 더 보기` outline sm 버튼(`#`)

### ⑧ aside (340px) — 행사&광고 + 마감 임박·급구
- **행사 & 광고**: SectionHead `행사 & 광고` / `주목받는 캠페인`. 세로 스택(`gap-2`) AdCard: `relative rounded-lg p-3.5 text-white` + 이미지 fill cover + `bg-black/50` 딤 + 유료 우상단 `AD` 배지(`bg-black/55 text-[10px]`) + brand(`text-[11px]`)/title(`text-sm font-semibold`)/note(`text-xs`). 4건: 글로우랩 뷰티 위크 팝업(AD) · 킨텍스 산업 박람회 2026(AD) · 한강 나이트 페스티벌 · 신차 론칭 미디어데이(AD)
- **마감 임박 · 급구** — 긴급 채널 패널(불가 조건 제외 **미적용**, 대신 적합도 배지로 고지): 컨테이너 `rounded-lg border border-orange-200 bg-gradient-to-b from-card to-orange-50 p-4`. 헤더: h2 `마감 임박 · 급구` + **사이렌 도트**(`size-2 bg-red-600 animate-siren-pulse`) / 우측 `응답 즉시 확정`(`text-[11px] amber-700`). 행(UrgentRow, `/jobs/{id}`, `border-t border-orange-200/60`, hover `bg-orange-100/50`):
  1. `⏱ 마감 {closesIn}`(`text-[11px] font-bold`, critical → `text-red-600 animate-siren-blink` / 이상 amber-700) + 급구(red 배지) + 우측 단가 `₩n/h`(툴팁 내역)
  2. 제목(truncate) / 3. 일시 · 장소 · 역할 n명(truncate)
  4. **적합도 배지**(`urgentFits` — 내 조건 대비): 불가 조건 포함 시 `✕ 내 불가 조건 포함`(red) · 선호 유형이면 `✓ 선호 유형`(green) · 가용일 겹치면 `✓ 가용일`(green) 아니면 `가용일 아님`(neutral)

## 행사 모집 면 (`/home?tab=buyer`) — 섹션별 스펙

### ⑨ 히어로 + 견적 미니폼 (`BuyerMiniForm`)
`mt-9`, 센터 정렬 `max-w-2xl`: 아이브로 `행사 담당자를 위한 CAST`(`text-xs font-bold tracking-widest orange-700`) / h1 `조건만 입력하면 팀이 구성됩니다` / 서브 `게시 후 기다리지 않습니다 — 입력 즉시 예상 후보와 견적을 확인하세요.`
미니폼 카드(`p-6`): **라벨 필드 3개**(`sm:grid-cols-[1.2fr_1fr_0.8fr]`, 라벨 `text-xs font-medium muted`): 행사 유형 select(9종) · 날짜(date, 2026-08-09~31, 기본 8/22) · 인원(number 1~50, 기본 6) → **견적 박스**(`border-orange-200 bg-orange-50 rounded-md`): `이 날짜 가용 등록 후보 {n}명(orange-700) · 예상 ₩960,000 부터 (8시간·기본 등급 기준)` — 후보 100명 결정적 풀 가용일 필터, 견적 = 인원×8h×P1(20,000) → 풀폭 CTA `이 조건으로 공고 등록 →`(`h-11 w-full`, → `/post?type&day&n` 값 이관)

### ⑩ 3중 안전망 — 3열 카드
`mt-12`, SectionHead `이탈해도 행사는 멈추지 않습니다` / `구해진 다음까지가 플랫폼의 일입니다`.

| 배지 | 제목 | 카피 |
|---|---|---|
| amber `확인 필요` | 행사 전 자동 재확인 | D-3·D-1 확인을 자동으로 요청하고, 미응답은 위험으로 감지해 백업 후보를 미리 찾아둡니다. |
| amber `대기(Standby)` | 정원이 차도 지원은 쌓입니다 | 모집을 유지하면 지원이 계속 접수됩니다. 이탈이 생기면 대기 지원자를 즉시 승인해 재충원합니다. |
| green `도착 확인` | 당일 결원은 긴급 대체 | 당일 결원이 확인되면 플랫폼이 대체 인력을 탐색합니다. 성공 기준은 수락이 아니라 현장 도착입니다. |

### ⑪ 진행 타임라인 — 마케팅 모드(공용 `PipelineTimeline miniatures`)
`mt-12`, SectionHead `등록 후엔 이렇게 진행됩니다` / `팀 구성부터 행사 당일, 그 이후까지 한 흐름으로 관리됩니다`. 카드 안 6스텝(`sm:3 lg:6열`): ① 팀 구성 ② 요청·확정 ③ D-3·D-1 확인 ④ 당일 출결 ⑤ 결원 대체 ⑥ 리뷰·기록 — 카피·스텝 3·4·5 미니어처(D-1 확인 버튼 / 체크인 로그 / 결원→대체→도착 타임스탬프)는 `pipeline-timeline.tsx` 그대로.

### ⑫ 푸터 — `SiteFooter`
`mt-16 border-t bg-card`, `text-xs muted`: CAST 워드마크 + `행사 전문 인력 플랫폼` / 소개(`/`)·이용약관·개인정보처리방침·문의(`mailto:hello@cast.example`) / `© 2026 CAST`.

## 데이터 모델·실계산 규칙 (`home-content.ts` = 프로토 스키마)

- **행사 특성 조건 축** `JobCondition`(통제 어휘 — Event/EventRole 귀속은 ERD 미결, 02 §10): `outdoor 야외 +1,000` · `night 야간 +2,000` · `harsh 열악 환경 +2,000` · `shift2 2교대 +1,000` · `shift3 3교대 +2,000` (수치는 정책 가설)
- **단가 실계산** `jobHourly(job, grade=내 등급)` — D6 결정 6("게시 단가는 열람자 Grade 기준 계산 표시")의 재현. 라인 합성: 등급 기본(P1 20,000 / P2 22,000 / P3 24,000 / P4 27,000) + 역할 필수 자격 ×2,000 + 조건 가산 + urgent면 긴급 +6,000. **전부 세전.** 카드 총액 + 툴팁 내역, 상세 화면([JOB](job-detail.md))은 라인아이템 표
- **탐색 표면 파생**(모듈 상수 — mock 세션 기준): `visibleJobs` = 불가 조건 하드 제외(현재 j-4·j-8 2건), `excludedCount`, `recommendedJobs`(⑤ 규칙) — 적용 표면 ⑤⑥⑦(그리드·건수·주말), **미적용 ⑧ 급구**(긴급 채널 — 열린 결정, 적합도 배지로 대체 고지)
- **mock 세션**: 김지수 · P2 · 서울 · 완료 12회 · 태그[팝업스토어, 전시·박람회] · 가용일 15·20·21 · **평판 점수 92점**(0~100 공개 지표, 구 온도 — 표기·산식 `[정책]`) · 확정 근무 1건(8/16 — 지원 겹침 경고 시연용) · **profile**(포트폴리오 — ③ 패널·모달 시연): 행사 스태프 / 여성·25세·168cm / 서울 전역·경기 남부 / 한국어·영어 / 주말·야간 / 자격 영어 회화(VIP 의전 미보유) / 재의뢰 4회 / 캐치프레이즈·자기 소개·대표 경력 3건
- **workerStatus**: 응답 필요 1(2시간 12분) · 검토 중 2 · 대기 1 · 확정 1 · 행사 방 1(새 공지 2)
- 날짜: `MOCK_TODAY = 9`(2026-08-09 일요일 고정), 스트립 14일, 주말 모듈 [15, 16]
- 지도 좌표: `ZONES`(핀 순서 8곳) · `METRO_PINS`·`REGION_PINS`(% 좌표 — ⑦ 지도 뷰 참조)

### 공고 목업 13건 (표시가 = P2 기준 jobHourly)

| id | 유형 | 제목 | 주최 | 일시 | 거점 | 역할·인원 | 조건/자격 | 표시가 | 상태 |
|---|---|---|---|---|---|---|---|---|---|
| u-1 | 콘서트 | 돔 콘서트 게이트 안내 급구 | 온스테이지 프로덕션 | 8/9(일) 16–23시 | 고척 | 게이트 안내 3 | 야간·**급구** | **30,000** | 마감 43분(critical) |
| u-2 | 팝업스토어 | 성수 뷰티 팝업 리셉션 결원 | 글로우랩 코스메틱 | 8/10(월) 10:30–19 | 성수·한남 | 리셉션 1 | **급구** | 28,000 | 마감 3시간 |
| u-3 | 전시·박람회 | 산업 박람회 부스 운영 | 브라이트 엑스포 | 8/12–14 09–18시 | 킨텍스 | 부스 운영 4 | 2교대 | 23,000 | 마감 8시간 |
| u-4 | 판촉·샘플링 | 식음료 샘플링 프로모션 | 데일리 F&B | 8/11(화) 11–17시 | 코엑스·청담 | 샘플링 2 | — | 22,000 | 마감 21시간 |
| j-1 | 팝업스토어 | 패션 브랜드 한남 팝업 오픈런 운영 | 무브먼트 에이전시 | 8/15–16 10–20시 | 성수·한남 | 브랜드 앰배서더 6 | 신규 | 22,000 | D-2 · 잔여 4 · **AI 추천 1위** |
| j-2 | 전시·박람회 | IT 테크 컨퍼런스 안내 데스크 | 브라이트 엑스포 | 8/19–20 08:30–18 | 코엑스·청담 | 안내·등록 8 | 타 역할: 운영 스태프 22,000·잔여 3 | 22,000 | D-5 · 잔여 3 · AI 추천 |
| j-3 | 론칭 행사 | 신차 미디어데이 VIP 응대 | 오토모티브 PR | 8/21(금) 13–21시 | 여의도 | VIP 응대 4 | 자격 VIP 의전 · 신규 | 24,000 | D-7 · 잔여 2 · AI 추천 |
| j-4 | 페스티벌 | 한강 뮤직 페스티벌 게이트·안내 | 온스테이지 프로덕션 | 8/22–23 12–22시 | 홍대·상암 | 게이트·안내 20 | 야외·야간 | 25,000 | **불가 조건 제외** |
| j-5 | 판촉·샘플링 | 대형마트 신제품 시식 판촉 | 데일리 F&B | 8/15(토) 11–18시 | 잠실 | 시식 판촉 3 | — | 22,000 | D-3 · **정원 충족·대기** |
| j-6 | 쇼케이스 | 아이돌 쇼케이스 진행 보조 | 칠리 엔터테인먼트 | 8/18(화) 15–22시 | 홍대·상암 | 진행 보조 5 | 야간 · 신규 | 24,000 | D-4 · 잔여 5 |
| j-7 | VIP 행사 | 갤러리 프리뷰 리셉션(영어) | 청담 아트하우스 | 8/27(목) 17–21시 | 코엑스·청담 | 리셉션 2 | 자격 영어 회화+VIP 의전 | 26,000 | D-13 · 잔여 1 |
| j-8 | 로드쇼 | 전기차 시승 로드쇼 현장 안내 | 오토모티브 PR | 8/24–26 10–18시 | 부산 | 현장 안내 6 | 야외 | 23,000 | **불가 조건 제외** |
| j-9 | 전시·박람회 | 리빙 페어 브랜드 부스 데모 | 하우스 리빙 | 8/29–30 10–19시 | 코엑스·청담 | 제품 데모 4 | 자격 제품 데모 | 24,000 | D-15 · 잔여 4 |

## 상태 변형

- **비로그인**: 상태 스트립(③)·AI 추천(⑤)·개인화 캡션(⑥)·가용일 바(⑦)·급구 적합도 배지(⑧)·등급 rateNote 숨김, aside 상단에 Worker 가입 CTA(`일할 준비가 되셨나요?` 다크 카드) 노출 — **목업은 로그인 고정**(`mockSession`)이라 비로그인 분기는 미구현(디자인 `CAST Home.dc.html`의 `loggedIn` prop 변형 참조)
- 미동작 요소(`#`): 검색 폼, 퀵필터 칩, 상태 스트립 딥링크·가용일 관리·미리보기·사진 추가·경력 추가, 광고 카드, 더 보기, 불가 조건 설정. 로컬 상태만: 알림 토글, 프로필 펼침/모달, 모달의 선호·불가 칩(저장 미반영)
- 로딩 스켈레톤 미구현. D-day·마감 카운트다운은 **정적 문자열**(타이머 없음)

## 접근성

전 섹션 한국어 `aria-label`. 터치 타깃 44px(`h-11`, 데스크탑 축소). 상태를 색에만 의존하지 않고 라벨 병기(급구·신규·조건·적합도 배지, 마감 텍스트, 지도 건수 숫자). 숫자 `tabular-nums`. 사이렌·점멸 애니메이션은 `prefers-reduced-motion` 시 해제. 연락처·SNS는 어떤 화면에도 미노출(_common.md §14).

## 개편 가드레일 — UI/UX는 자유, 아래 도메인 사실만 유지

1. **단가는 열람자 등급 기준 실계산 + 세전** — 임의 고정 숫자로 되돌리지 않는다(D6 결정 6, 기획서 §9). 가산 내역은 어떤 형태로든 확인 가능해야 한다(현재: 툴팁+상세 라인아이템)
2. **세전·3.3% 원천징수 고지**는 단가가 보이는 화면 어딘가에 반드시 존재
3. **잔여 n자리 = 점유 기준 remaining projection**, 정원 충족 공고는 감추지 않고 "대기 지원"으로 노출(Standby — 02 §8)
4. **불가 조건 하드 제외**와 제외 사실 고지(캡션) 유지. 급구 채널은 제외 미적용 + **적합도 배지로 대체 고지**(2026-08-11 — 열린 결정을 배지 방식으로 구체화, 뒤집으면 기록)
5. **상태 스트립은 홈이 알림센터를 겸한다는 결정의 산물** — 없애려면 인앱 알림센터 부재 결정과 함께 재검토
6. 평판 점수(구 온도)·행사 방·알림 옵트인은 worker_interview 수용 표면 — 배치·형태는 자유, 제거는 결정 뒤집기. 온도(36.5°+)→0~100점 표기 전환(2026-08-11)은 `[정책]` 확정 전 잠정 표기
7. 지도는 지도 서비스 이미지 사용 금지(약관) — 자체 SVG 또는 대체 표현
8. 광고는 `AD` 표기 유지, 브랜드명 익명화 `[정책]`
9. **AI 추천은 근거(사유 칩)를 함께 노출** — 블랙박스 추천으로 되돌리지 않는다(2026-08-11 신설)

## 정책 미확정 (`[정책]`)

평판 점수 표기·산식(0~100 잠정), 알림 옵트인 묶음·채널, 정렬 기준, 광고 슬롯 운영, 추천 가중치(현 목업: 가용일2·선호2·신규1), 조건 어휘 확장(귀속 포함 — ERD), 브랜드명 익명화. 지도 실서비스 전환 시 Event 장소 좌표화(도메인 확장) 필요.
