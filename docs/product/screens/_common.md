# 화면 공통 규약

> 모든 화면 프롬프트에 함께 입력한다 — 사용법: 이 파일 + 해당 화면 파일 2개를 첨부. 화면 목록은 [MVP 화면 목록](../mvp-screens.md).

- **제품**: B2B 행사 인력 매칭 플랫폼. Buyer(행사 대행사·브랜드 담당자)가 행사를 만들고 추천된 프로모터 팀을 편집·예약하며, Worker(프로모터/Leader)가 모바일로 수락·근무·출결한다. 톤: 신뢰감 있는 업무 도구 — 소비자 앱 같은 장식 배제, 정보 밀도와 스캔 속도 우선.
- **디바이스 기준**: 공용 화면(홈·공고 등, 2026-08-09 IA)은 390px~1280px+ 완전 반응형(`lg`에서 레이아웃 전환). Buyer 전용 화면은 데스크탑 1280px+, Worker 전용 화면은 모바일 390px(홈 화면 설치 PWA로 실행될 수 있음).
- **컴포넌트**: Tailwind CSS + shadcn/ui 기준(버튼/카드/다이얼로그/폼/배지/시트) — 토큰·테마는 아래 [디자인 시스템](#디자인-시스템) 절.
- **상태 배지 시맨틱**(Assignment/Booking/Event 공통): 대기·응답 필요=amber, 진행 중=blue, 확정·성공=green, 거절·만료·취소·NoShow=red, 종결 중립(Removed/Completed)=gray. 상태 이름은 한국어 라벨 + 원문 병기 없이 한국어만(수락 대기/수락됨/확정/거절/만료/취소/노쇼/완료). **Application(D6) 매핑**: 검토 대기(Open)=amber, 승인됨(Approved)=green, 반려(Declined)·만료(Expired)=red, 철회(Withdrawn)·마감(Closed)=gray. 마감 배지는 closed_reason 한국어 라벨 병기(예: 행사 취소·다른 역할 승인·모집 종료). 정원 충족 상태의 Open은 amber 유지 + "대기(Standby)" 병기 — 별도 상태가 아니라 파생 표시(도메인 모델 §8), 표시 UX `[정책]`.
- **연락처 비공개 원칙**(기획서 §14): 어떤 화면에도 Worker의 전화번호·이메일·SNS를 노출하지 않는다. 연락 관련 UI는 "플랫폼 안내를 확인하세요" 수준(MVP).
- **금액 표기**: `₩24,000/h` 단가, 합계는 `₩1,248,000`. 모든 금액 옆에 산출 근거(단가 × 시간)가 접근 가능해야 한다. 정산 기능은 없다 — 금액은 "예상 금액" 라벨. **동결 전/후 구분(D6)**: 공고·지원 맥락의 금액은 본인 Grade 기준 계산 표시가 — "승인 시점 금액으로 동결됩니다" 고지 병기. 동결 후(요청 수신·승인)는 동결 단가 내역을 표시하며 두 값은 라벨로 구분한다.
- **시간 표기**: `8/22(토) 10:00–18:00`. 카운트다운은 `23시간 12분 남음`, 1시간 미만은 red 강조.
- **공통 상태 변형**(모든 화면): 로딩=스켈레톤, 빈 상태=아이콘+한 줄 설명+주 액션 버튼, 에러=재시도 버튼, 권한 없음=역할 안내 후 홈 유도.
- **접근성**: 모바일 터치 타깃 최소 44px(현장·야외 사용), 상태를 색에만 의존하지 않고 라벨 병기.

## 디자인 시스템

### 테마
- **공용 화면(홈·공고 등)과 Buyer 화면 = 라이트, Worker 전용 모바일 화면 = 다크**(랜딩 다크 계승). 라이트 페이지 안의 Worker향 구획은 `dark` 클래스 스코프로 다크 서피스를 쓸 수 있다(홈 CTA 패널 참조).
- 두 테마 모두 웜 뉴트럴 + spot 오렌지 + 동일 폰트로 브랜드 통일. 앱 화면은 아래 시맨틱 토큰만 사용 — 랜딩 raw 토큰(ink/paper/spot 직접 참조) 금지.
- 한 화면 = 한 테마 고정(런타임 테마 전환 없음).

### 시맨틱 토큰 (shadcn/ui 변수명 그대로)
| 토큰 | 용도 | 라이트(Buyer) | 다크(Worker/Leader) |
|---|---|---|---|
| background | 페이지 배경 | `#f4f2ee` | `#0a0a0b` |
| foreground | 본문 텍스트 | `#0a0a0b` | `#f4f2ee` |
| card | 카드·시트 표면 | `#ffffff` | `#131315` |
| popover | 다이얼로그·드롭다운 | `#ffffff` | `#1a1a1e` |
| muted | 보조 채움(스켈레톤·비활성) | `#eceae4` | `#1a1a1e` |
| muted-foreground | 보조 텍스트 | `#6b6a66` | `#8b8a86` |
| border / input | 구분선·입력 테두리 | `#e2dfd8` | `#26262a` |
| primary | 주 버튼·핵심 액션 채움 | `#ff5c28` | `#ff5c28` |
| primary-foreground | primary 위 텍스트 | `#0a0a0b` | `#0a0a0b` |
| ring | 포커스 링 | `#ff5c28` | `#ff5c28` |
| destructive | 파괴적 액션 | shadcn 기본(red-600 계열) | shadcn 기본(red-400 계열) |

- **spot 대비 규칙**: 채움은 두 테마 모두 `#ff5c28` + ink 텍스트(대비 6.1:1). **텍스트·아이콘·링크**로 쓸 때 라이트에서는 `text-orange-700`(#c2410c)만 허용 — 흰 배경 위 `#ff5c28` 텍스트 금지(대비 3:1 미달). 다크에서는 spot 그대로 텍스트 허용.

### 상태색 (Tailwind 기본 팔레트)
- 배지: 라이트 `bg-{c}-100 text-{c}-800`, 다크 `bg-{c}-500/15 text-{c}-400`. c = 대기 amber / 진행 blue / 확정 green / 실패 red / 종결 stone(종결만 라이트 `bg-stone-200/70 text-stone-600`).
- 텍스트 단독 강조(카운트다운 red 등): 라이트 `text-{c}-700`(red는 600), 다크 `text-{c}-400`.
- 배지 형태: `rounded-full px-2 py-0.5 text-xs font-medium` + 한국어 라벨 필수(색 단독 의존 금지).

### 타이포
- 본문 = Pretendard(`font-sans`). 기본 크기: 데스크탑 `text-sm`(14px, 업무 밀도), 모바일 `text-base`(16px, 현장 가독 + iOS 입력 줌 방지).
- 허용 단계 6개: `text-xs/sm/base/lg/xl/2xl`. 페이지 제목 `text-lg`~`xl font-semibold`, 섹션 제목 `text-base font-semibold`, 캡션 `text-xs`. `3xl` 이상은 랜딩 전용.
- 굵기: 400/500/600/700만.
- **숫자**: 금액·시간·카운트다운·테이블 숫자는 전부 Pretendard + `tabular-nums`(변하거나 세로 정렬되는 숫자에 필수).
- **Clash Display(`font-display`)**: 워드마크, 짧은 영문 장식 라벨, 정적 대형 KPI 숫자까지만. 카운트다운·데이터 테이블에는 금지(tabular 미지원).

### 간격 · radius · 그림자 · 브레이크포인트
- Tailwind 기본 4px 스케일. 페이지 패딩: 데스크탑 `p-8`, 모바일 `p-4`. 카드 내부 `p-4`~`p-6`, 카드 사이 `gap-4`, 섹션 사이 `gap-8`.
- radius: shadcn 기본 유지 — 카드·다이얼로그 `rounded-lg`, 버튼·입력 `rounded-md`, 배지·아바타 `rounded-full`.
- 그림자: 라이트는 카드 `shadow-sm`만. 다크는 그림자 금지 — 표면색(card/popover)과 border로 층 구분.
- 브레이크포인트: Tailwind 기본, 커스텀 없음. "양쪽" 화면은 `lg`(1024px)에서 레이아웃 전환.

### 모션
- **GSAP은 랜딩 전용** — 앱 화면에서 import 금지. 앱은 CSS transition만: `transition-colors/opacity`, hover·press `duration-150`, 패널·시트 `duration-300`, `ease-out`.
- 다이얼로그·시트 등장은 shadcn 기본 애니메이션 그대로, 스켈레톤은 `animate-pulse`. 높이·위치가 움직이는 레이아웃 애니메이션 금지, `prefers-reduced-motion` 존중.

### 구현 노트
- **테마 스코핑(반영됨, 2026-08-09)**: `globals.css`에 구현 — `:root` 라이트 값, `.dark` 다크 값(+`color-scheme: dark`), `@theme inline` 연결, `@custom-variant dark` 선언. 루트 layout은 무색, `(marketing)` layout 래퍼가 `bg-ink text-paper`, 앱 페이지는 각자 `bg-background text-foreground`(다크 화면은 `dark` 클래스 추가).
- **컴포넌트(설치됨, 2026-08-09)**: shadcn/ui — `components.json`은 classic 포맷(new-york·neutral)으로 수기 작성(최신 CLI 4.x는 init 체계가 바뀌어 `init` 대신 `add`만 사용). 신규 컴포넌트는 `npx shadcn@latest add <name>`으로 추가(현재 button·input). CSS 변수 값은 위 표의 값으로 교체 완료 — 토큰명이 shadcn 변수명과 동일하므로 매핑 레이어 없음. 커스텀 컴포넌트는 shadcn에 없는 것만(상태 배지 등).
