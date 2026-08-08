# 기술 스택 결정

> Version 0.1 (2026-08-08)
> 기준 문서: [기획서](../../README.md), [도메인 모델](../domain/02-domain-model.md), [개발 플랜](../plan/development-plan.md)
> **조기 확정 사유**: 스택 결정은 원래 Phase 3 산출물이나, 클라이언트 형태(웹/앱)·호스팅·알림 채널은 Phase 2 화면 설계와 비용 계획에 선행해야 하므로 이 문서만 앞당겨 확정한다. **ERD·API 계약은 규칙대로 Phase 1(정책 확정) 완료 후 작성한다** — "정책 구조가 스키마를 결정한다"는 순서 제약은 유지된다.
> 무료 티어 한도·약관은 2026-08 웹 검색으로 검증했다(§4 출처). 재검증 주기: 유료 전환 판단 시점마다.

---

## 0. 결정 요약

[개발 플랜 Phase 3](../plan/development-plan.md)의 결정 항목 4개에 대한 답이다.

| 결정 항목 | 결정 |
|---|---|
| 언어/프레임워크 | **TypeScript + Next.js(App Router)** + Tailwind CSS + shadcn/ui. **반응형 웹 하나 + PWA**로 Buyer(데스크탑)와 Promoter/Leader(모바일) 모두 커버. 네이티브 앱은 만들지 않는다 — 전환 트리거는 §5 |
| DB | **PostgreSQL = Supabase**(서울 리전) — Postgres + Auth(이메일·카카오 OAuth) + Storage + pg_cron 번들. ORM은 Drizzle, 연결은 Supavisor 트랜잭션 풀러 |
| 호스팅 | **Vercel** — Hobby(무료)로 개발·비공개 검증, **상업 파일럿 공개 시점에 Pro($20/월) 전환**(Hobby는 약관상 비상업 전용) |
| 알림 채널 | **카카오 알림톡 주 채널 + SMS 폴백**(SOLAPI 경유). 사업자등록 전에는 SMS로 시작. 네이티브 푸시 없음, 웹푸시는 보조 |

한 줄 요약: **웹 하나로 시작해 무료로 개발하고, 파일럿을 여는 순간부터 월 $25(Supabase Pro)만 낸다. 앱은 파일럿 데이터가 요구할 때 붙인다.**

### 기각한 대안

| 대안 | 기각 사유 |
|---|---|
| 웹+앱(Expo) 동시 개발 | MVP 기능 중 네이티브 필수 기능이 없다(QR/GPS 요구 없음, 크리티컬 알림은 알림톡). 프론트 공수 +40~60%, 스토어 비용(Apple $99/년 + Play $25)과 심사 리드타임이 전부 앱 쪽에 몰림. §5의 트리거 실측 전에는 시작하지 않는다 |
| Vite SPA + Cloudflare Workers | 상업 사용까지 완전 무료인 유일한 조합이지만, Next.js 생태계 이탈 대비 절감액이 월 $20뿐. 개발 속도 우선으로 기각. 비용이 최우선이 되면 재검토 가치 있음 |
| Firebase(Firestore) | 도메인이 요구하는 관계형 제약(부분 유니크, 시간 겹침 배제, 트랜잭션 검사 — [02 §7](../domain/02-domain-model.md))을 표현할 수 없음 |
| Neon(DB만) + 직접 조립 | Auth(카카오)·Storage·스케줄러가 전부 MVP 필수인데 셋 다 별도 구축 필요. Supabase는 셋 다 번들 |
| Render/Fly.io/Railway | 무료 티어 폐지 또는 슬립·만료 제약으로 부적합 |

---

## 1. 클라이언트 전략 — 웹 단일 + PWA

- **한 Next.js 앱, 두 네임스페이스**: `/buyer/*`는 데스크탑 중심 레이아웃(Team Builder·표·패널), `/p/*`는 모바일 퍼스트(수락/일정/출결 — Promoter와 Leader 화면 모두. Leader는 별도 User Type이 아니므로 [D3](../domain/01-boundary-decisions.md)). 반응형으로 상호 접근은 가능하되 최적화 대상 디바이스를 화면마다 명시한다([화면 목록](../product/mvp-screens.md)).
- **PWA**: 웹 앱 매니페스트 + 서비스 워커(설치 가능·아이콘·스탠드얼론). Promoter 온보딩 마지막 단계에 홈 화면 추가 안내 1장을 넣는다(iOS는 Safari 공유 → 홈 화면에 추가 — iOS 16.4+에서만 웹푸시 수신 가능하므로).
- **오프라인 지원은 하지 않는다.** PWA는 설치성·앱 같은 실행 경험까지만. 행사장 통신 두절 대응이 파일럿에서 문제로 실측되면 그때 검토.
- **네이티브 앱(Expo) 전환 트리거** — 파일럿 실측 지표로 판단: D-1 확인 응답률이 낮거나 Replacement 응답 지연이 운영 병목으로 측정될 때. 전환 경로: 모노레포 전환(`apps/web`, `apps/mobile`, `packages/contracts`) 후 기존 Route Handler API에 그대로 접속 — 백엔드 변경 0이 되도록 §2의 계약 분리를 지금부터 지킨다. 알림톡이 주 채널인 한 이 트리거가 당겨질 확률은 낮다.

---

## 2. 아키텍처와 백엔드 로직 배치

```text
[Buyer 데스크탑 브라우저]        [Promoter/Leader 모바일 브라우저·홈화면 PWA]
        └────────────────┬────────────────┘
                  Next.js on Vercel
                  ├─ App Router 화면 (/buyer/*, /p/*)
                  ├─ Route Handlers /api/* — 상태 전이 트랜잭션 (Drizzle)
                  └─ /api/cron/* — 알림 디스패처 (외부 크론이 분 단위 호출)
                          │  Supavisor 트랜잭션 풀러 (6543, prepare:false)
                  Supabase (서울)
                  ├─ Postgres — 도메인 전체, 제약 백스톱, 파생 뷰, notification_outbox
                  ├─ pg_cron — 만료 스윕(분) · D-3/D-1 판정(일) · ReliabilitySnapshot(주)
                  ├─ Auth — 이메일 + 카카오 OAuth
                  └─ Storage — 프로필/포트폴리오 (클라이언트 리사이즈 후 업로드)
                          │
                  SOLAPI — 알림톡 → SMS 자동 대체발송
```

로직 배치 원칙 — [02 §7 불변식](../domain/02-domain-model.md)의 강제 수단을 층으로 나눈다:

| 층 | 담당 | 근거 |
|---|---|---|
| **TS 트랜잭션 함수** (Route Handler) | 상태 전이 전부. 전이당 함수 1개: 대상 행 `FOR UPDATE` → 불변식 검사(I3 정원, I4 마감, I6 겹침) → 전이 → 부수효과(I5 PriceSnapshot 동결, outbox 적재) | Assignment 11개 상태 + 파생 규칙을 PL/pgSQL로 관리하면 1인 개발의 테스트·버전관리 병목. 전이표를 데이터로 두고 Vitest로 전수 테스트한다 |
| **DB 제약 (백스톱)** | I1·I2 부분 유니크 인덱스, I4 CHECK, **I6은 btree_gist `EXCLUDE` 배제 제약** — Assignment에 행사 시간범위(`tstzrange`)를 비정규화 저장하고 활성 상태 조건부로 겹침 금지 | 애플리케이션 버그가 있어도 정합성이 깨지지 않는 최종 방어선. 시간범위 비정규화가 안전한 근거는 **I7(첫 요청 후 일시·장소 변경 금지)** — 설계 결정들이 여기서 맞물린다 |
| **SQL 뷰** | [02 §8 파생값](../domain/02-domain-model.md): Booking 파생 상태(fallback Open), 충원 projection, Booking 총액, 지각/실근무 | 파생의 정의를 한 곳에 — TS 코드가 얇아진다 |
| **금지** | 클라이언트에서 supabase-js로 DB 직접 읽기/쓰기. PostgREST Data API는 비활성(또는 deny-all RLS) | RLS는 행 가시성 도구지 교차 행 불변식(I3·I6)을 표현하지 못한다. supabase-js는 Auth·Storage 용도로만 |

- **계약 분리**: zod 스키마(API 입출력)·상태 enum·전이표는 `lib/contracts/`에 모은다. Expo 전환 시 이 폴더가 그대로 `packages/contracts`가 된다.
- **저장소 구조**: 단일 Next.js 앱(모노레포 아님). 모노레포 전환은 앱 추가 시점에.
- **로컬 개발(Windows)**: 초기에는 Supabase 무료 2번째 프로젝트를 dev 환경으로 사용(활성 2개 허용 — 로컬 인프라 0). Auth/Storage 로컬 에뮬레이션이 필요해지면 Supabase CLI 로컬 스택(Docker Desktop 필요)으로 전환. dev 프로젝트의 7일 정지는 대시보드 복구 버튼 1회.

---

## 3. 스케줄러·이미지·알림 설계

### 스케줄러 (도메인 모델이 요구하는 지연 작업)

| 잡 | 주기 | 구현 |
|---|---|---|
| Booking 만료 스윕: `Requested → Expired`([02 §5](../domain/02-domain-model.md) System 주체) + outbox 적재 | 분 | **pg_cron** — 순수 SQL로 DB 안에서 완결 |
| D-3/D-1 확인 판정: Attendance Risk 플래그 + 확인 요청 outbox | 일 | pg_cron |
| ReliabilitySnapshot 주기 로그 | 주 | pg_cron |
| **알림 디스패치**: notification_outbox 폴링 → SOLAPI 발송(외부 HTTP) | 분 | Hobby 구간: 외부 무료 크론(cron-job.org)이 `/api/cron/dispatch`를 호출(시크릿 헤더 검증). Pro 전환 후 Vercel Cron으로 교체. Vercel Hobby의 Cron은 하루 1회 + 실행 시각 부정확이라 만료·알림 어디에도 부적합 — pg_cron이 스케줄러의 본체인 이유 |

pg_net으로 DB에서 직접 HTTP를 쏘는 대안은 기각 — API 서명·재시도 로직을 SQL로 끌고 오게 된다.

### 이미지 업로드 (S1 필수 — 사진 기반 인력 선정이 시장의 핵심 행위)

- **클라이언트에서 리사이즈 후 업로드**(원본 최대 1600px + 썸네일 320px, browser-image-compression). Supabase 이미지 변환 API가 Pro 전용이므로 무료 구간에서는 클라이언트가 변환을 담당한다.
- 서버(Route Handler)가 signed upload URL 발급 → 클라이언트가 Storage에 직접 업로드. 장당 ~300KB 기준 무료 1GB ≈ 3천 장 — 파일럿 규모(수백 명) 커버.

### 알림 (notification_outbox 패턴)

- 도메인 트랜잭션은 알림을 직접 보내지 않고 **outbox 행만 적재**한다(전이와 발송의 원자성 분리). 디스패처가 채널을 결정하므로 채널 교체가 어댑터 교체로 국소화된다.
- **채널 로드맵**: SMS(사업자등록 전, SOLAPI 개인 가입 + 발신번호 인증) → **알림톡 전환**(사업자등록 + 카카오 비즈니스 채널 + 발신프로필 + 템플릿 사전 심사 수일 — 일정에 반영). SOLAPI는 알림톡 실패 시 SMS 자동 대체발송을 단일 API로 지원.
- 대상 알림: Booking 요청·수락/거절 결과·만료, Confirmed 전환, D-3/D-1 확인, Replacement 긴급 요청, 행사 안내(기획서 §17). 건당 알림톡 ~8원(중계사 7~13원), SMS ~20원 — 파일럿 규모에서 월 수천 원 수준.

---

## 4. 무료 티어 검증 사실 (2026-08)

| 항목 | 확인된 사실 |
|---|---|
| Vercel Hobby | **비상업·개인 용도 전용**(Fair Use). 대역폭 100GB/월, 함수 호출 1M/월. Cron은 하루 1회 + 시각 부정확. → 상업 공개 전 Pro($20/월) 전환 필수 |
| Supabase Free | DB 500MB, Storage 1GB, egress 5GB/월, 50K MAU, 활성 프로젝트 2개. **API 무활동 7일이면 프로젝트 자동 정지**(수동 복구). **자동 백업 없음**. pg_cron(Supabase Cron 모듈)·btree_gist 확장 사용 가능. 이미지 변환은 Pro 전용 |
| Supabase Pro | $25/월 — 일 자동 백업, 정지 없음, DB 8GB, Storage 100GB |
| Cloudflare Workers Free | 상업 사용 명시 허용, 10만 req/일 — 기각한 대안이지만 비용 최우선 시 탈출구로 기록 |
| 알림톡 | 사업자등록 + 카카오 비즈니스 채널 + 발신프로필 + 템플릿 심사 필요. 건당 ~8원(중계사 7~13원). SMS ~20원 |
| 앱스토어 (참고) | Apple Developer $99/년, Google Play $25 일회 + 개인 계정은 12명 테스터 × 14일 비공개 테스트 요건. Expo EAS Free 월 30빌드(iOS 15) |
| iOS 웹푸시 (참고) | iOS 16.4+, **홈 화면에 추가된 웹앱에서만** 수신 가능 — 웹푸시를 보조 채널로만 두는 이유 |

출처: [Vercel Cron 요금](https://vercel.com/docs/cron-jobs/usage-and-pricing) · [Supabase Cron](https://supabase.com/docs/guides/cron) · [Supabase 이미지 변환(Pro)](https://supabase.com/docs/guides/storage/serving/image-transformations) · [Supabase range+EXCLUDE 패턴](https://supabase.com/blog/range-columns) · [카카오 로그인 연동](https://supabase.com/docs/guides/auth/social-login/auth-kakao) · [Cloudflare Workers 요금](https://developers.cloudflare.com/workers/platform/pricing/) · [Expo 플랜](https://docs.expo.dev/billing/plans/) · [SOLAPI 단가](https://solapi.com/guides/tiered-pricing/) · [카카오 비즈니스 채널 가이드](https://kakaobusiness.gitbook.io/main/channel/start)

---

## 5. 리스크와 마이그레이션 트리거

| 함정 | 트리거 | 조치 |
|---|---|---|
| Supabase Free 자동 백업 없음 | **첫 실사용 거래 데이터 발생(파일럿 개시)** | Pro $25/월. 그 전 개발 기간은 GitHub Actions 야간 `pg_dump`(0원)로 임시 커버 |
| Supabase 7일 무활동 정지 | 즉시 대비 | 외부 무료 크론으로 헬스 핑 1일 1회. Pro 전환 시 소멸 |
| Vercel Hobby 비상업 조항 | **상업 파일럿 공개 전** | Pro $20/월 전환. "무료 Vercel로 상업 운영"은 처음부터 선택지가 아님 |
| DB 500MB | 350MB 도달(주범 후보: RecommendationRun JSONB 로그) | 로그 보존기간 정책 → 그래도 넘으면 Pro(8GB) |
| Storage 1GB | 0.7GB(±2천 장) | Pro(100GB) 또는 원본만 Cloudflare R2(10GB 무료) |
| 크리티컬 알림 도달 실패(웹푸시 한계) | D-1 확인 응답률 저조·Replacement 응답 지연 실측 | 1차: 알림톡 템플릿·타이밍 개선. 2차: Expo 앱 착수(§1 트리거) |
| 알림톡 발신 요건 미비 | 사업자등록 전 | SMS로 운영, 등록 완료 시 알림톡 전환(템플릿 심사 리드타임 포함) |

**과금 로드맵**: 개발기 **0원** → 파일럿 개시 **$25/월**(Supabase Pro) → 상업 공개 **+$20/월**(Vercel Pro) → 앱 전환 시 +$99/년(Apple)+$25(Play, 일회). 첫 1년 최악 합계 ~$460 수준.
