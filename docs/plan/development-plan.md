# 시스템 개발 플랜

> Version 0.2 (2026-08-08)
> 전제: [기획서](../../README.md) + [경계 결정 D1~D5](../domain/01-boundary-decisions.md) + [도메인 모델](../domain/02-domain-model.md)을 기준으로 한다.
> 기술 스택의 결정 항목 4개(언어/프레임워크·DB·호스팅·알림 채널)는 **조기 확정**했다(2026-08-08) — [스택 결정](../tech/stack-decision.md). 클라이언트 형태(웹+PWA)·호스팅·알림 채널이 Phase 2 화면 설계와 비용 계획에 선행해야 했기 때문이다. **ERD·API 계약은 여전히 Phase 1 완료 후**이며, 정책 이전 단계 산출물이 스택과 무관하게 유효하다는 원칙은 유지된다.

---

## 0. Phase 개요

| Phase | 목표 | 산출물 | 완료 기준 |
|---|---|---|---|
| 0. 경계 결정 | 도메인 골격 확정 | 01-boundary-decisions, 02-domain-model | **완료** (2026-08-08) |
| 1. 설계 확정 | 상태·가격·리스크 정책의 구조 확정 | 상태기계 확정판(02 갱신), Pricing Rule Table, Cancellation/No-show Policy | §28 구조 항목 전부 결정 또는 명시 보류, 유스케이스 워크스루 통과 |
| 2. 제품 설계 | 화면·흐름으로 번역 | Actor×UseCase, User Flow 3종, Review/Leader Authority Matrix, MVP 화면 목록 | 화면 목록이 §26 MVP 범위 전부 커버, Flow가 상태기계와 모순 없음 |
| 3. 기술 설계 | 구현 가능한 명세 | 스택 결정, ERD, API 계약 | 02의 불변식 I1~I9 전부가 DB 제약/트랜잭션 규칙으로 매핑 |
| 4. MVP 구현 | 거래 루프가 도는 제품 | 수직 슬라이스 S1~S5 | 슬라이스별 기준 (아래) |

Phase 1~3은 문서 작업이므로 겹쳐 진행할 수 있으나, **Phase 3은 Phase 1 완료 전에 시작하지 않는다** (정책 구조가 스키마를 결정하므로).

---

## 1. Phase 1 — 설계 확정

기획서 §31 Priority 2~4에 해당한다.

| 산출물 | 내용 | 비고 |
|---|---|---|
| 상태기계 확정판 | [02 §5~6](../domain/02-domain-model.md)의 전이표에서 "조건" 칸을 정책으로 채운다: 취소 가능 시점별 처리, No-show 판정 시점, Expired 후 재요청 규칙 | 새 문서가 아니라 02 갱신 |
| Pricing Rule Table → `docs/policy/pricing-rules.md` | P1~P4 Base Rate 초안 수치, Grade 승급 규칙(산정 근거 입력값 정의 포함), Certification Premium 표, Assignment Premium 표(Emergency/Night/Holiday…), Platform Fee 구조(**Buyer Charge / Worker Pay / Platform Fee 방향 구분 — PriceSnapshot 라인아이템의 recipient 필드 확정 포함**), Buyer 가격 공개 범위 | 수치는 가설임을 명기 — PricingPolicy가 버전 관리되므로 틀려도 교체 비용이 낮다 |
| Cancellation/No-show Policy → `docs/policy/cancellation-noshow.md` | Buyer/Worker 취소 시점별 보상·패널티, No-show 정의와 지각 기준, Replacement·Emergency Premium 비용부담 주체, 이의신청 절차 | 상태기계의 Cancelled/NoShow 전이 조건과 반드시 상호 참조 |
| 러프 Actor×UseCase 워크스루 | 기획서 §22 전체 흐름 + 실패 경로(거절, 만료, 부분 수락, No-show→대체, 취소 후 재예약)를 유스케이스로 써서 상태기계를 스모크 테스트 | 형식화는 Phase 2에서. 여기서는 검증 도구 |

**완료 기준**: §28 항목이 전부 "결정됨" 또는 "명시적 보류 + 사유"로 분류된다. 워크스루에서 상태기계가 표현 못 하는 시나리오가 0건.

---

## 2. Phase 2 — 제품 설계

기획서 Appendix A 2, 6~11에 해당한다. 산출물은 `docs/product/`에 둔다.

**착수 (2026-08-08)**: [User Flow 3종](../product/user-flows.md) v0.1, [MVP 화면 목록](../product/mvp-screens.md) v0.1 작성됨(화면↔§26 대조표 포함). 잔여: Actor×UseCase, Review/Leader Authority Matrix — Review 항목·Leader 권한이 확정되면 화면 문서의 `[정책]` 표기를 채운다.

| 산출물 | 내용 |
|---|---|
| Actor×UseCase 확정 | Phase 1 워크스루의 형식화. Buyer/Worker(Promoter/Leader)/Platform별 |
| User Flow 3종 | Buyer(행사 생성→팀 구성→예약→행사→평가), Promoter(프로필→가용일정→수락→근무→평가), Leader(인증→배정→출결→Replacement) |
| Review Matrix | §19의 5방향 평가 항목 확정 + 공개 범위·익명성·수정 기간 정책 |
| Leader Authority Matrix | §16 권한 범위를 기능 단위로 확정 (무엇을 할 수 있고 없는지) |
| MVP 화면 목록 | §26 범위의 화면 인벤토리. 화면마다 다루는 엔티티·상태 전이를 표기 |

**완료 기준**: 화면 목록 ↔ §26 MVP 범위 상호 대조표에 빠짐이 없고, 모든 Flow가 02의 상태기계 위에서 재생 가능하다.

---

## 3. Phase 3 — 기술 설계

산출물은 `docs/tech/`에 둔다.

| 산출물 | 내용 |
|---|---|
| 스택 결정 | **확정됨 (2026-08-08 조기 확정)**: TypeScript + Next.js(웹 단일+PWA) / PostgreSQL(Supabase) / Vercel / 알림톡+SMS(SOLAPI) — 근거·무료 티어 검증·마이그레이션 트리거는 [스택 결정](../tech/stack-decision.md). ERD 착수 시 재검증 |
| ERD | 02의 엔티티·불변식을 스키마로. I1~I9 각각의 강제 수단(부분 유니크, 트랜잭션, 애플리케이션 규칙)을 명시. 자격 요구조건의 저장 형태(배열 vs 관계 테이블 — 추천 쿼리 빈도 기준) 결정 |
| API 계약 | 상태 전이 = API의 뼈대. 전이표의 행위자 칸이 곧 권한 모델 |

**완료 기준**: 불변식 매핑표(I1~I9 → 제약) 완성. 스냅샷 불변·Accept 충돌 검사가 트랜잭션 설계로 증명됨.

---

## 4. Phase 4 — MVP 구현 (수직 슬라이스)

각 슬라이스는 UI→도메인→DB를 관통해 그 자체로 동작한다. 순서는 의존성 순이며 기획서 §26 범위와 정렬된다.

| 슬라이스 | 내용 | 완료 기준 |
|---|---|---|
| **S1. 계정·프로필·가용일정** | User 가입, WorkerProfile(사진/Portfolio/skill 태그), BuyerProfile, AvailabilitySlot 등록, 초기 GradeHistory 부여 | Worker가 프로필과 가용일정을 등록하고 목록에 노출된다 |
| **S2. 행사·역할·Team Builder** | Event 생성, EventRole 구성(leader Role 포함), Rule 기반 추천(RecommendationRun 로그), Team Builder에서 Selected Assignment 생성/교체, 실시간 견적 표시 | Buyer가 조건 입력→추천 팀 확인→교체하며 총액 변화를 본다 |
| **S3. Booking 루프** | Booking Request(PriceSnapshot 동결, expires_at), Worker 수락/거절(I6 충돌 검사), Expired 처리, 파생 Booking 상태(fallback Open), 미충원 마감(closed_unfilled_count), 알림 | 전 자리 수락 → Booking Confirmed 도달. 거절 시 대안 재추천 |
| **S4. 행사 당일 운영** | Check-in/out Attendance(타임스탬프 기반), D-3/D-1 확인(Attendance Risk 플래그), NoShow 처리, ReplacementRequest(Open→Matched→Fulfilled, 성공=현장 Check-in)→긴급 후보 탐색→대체 Assignment(Emergency Premium 스냅샷), Leader 출결 권한, IncidentReport | No-show 발생→대체 투입까지 Buyer 개입 없이 플랫폼 안에서 완결 |
| **S5. 평가·신뢰도** | Review 입력(Phase 2 매트릭스), Reliability 계산 기초, ReliabilitySnapshot, Grade 반영 고리 | 행사 완료→평가→Reliability/Career 반영→다음 추천에 사용 |

S3까지가 **최소 거래 루프**다. S3 완료 시점부터 실사용 파일럿(수동 운영 병행)이 가능하며, 이때부터 §29 가설 검증 데이터가 쌓인다.

**MVP 제외** (기획서 §26 "MVP 이후"와 동일): AI Matching, Dynamic Pricing, 안심번호/Relay Call, 정산 자동화, Enterprise Dashboard, Usage Rights, 고급 Leader Certification.

---

## 5. 리스크 — §29 가설과의 연결

| 가설 (기획서 §29) | 플랜 반영 |
|---|---|
| 4. Buyer가 에이전시를 쓰는 핵심 이유는 No-show 책임 이전 | S4(Replacement 완결 루프)가 MVP 핵심 — 늦출 수 없는 슬라이스 |
| 6. 등급→단가 상승이 플랫폼 잔류 유인 | 수치가 가설이므로 하드코딩 금지 → PricingPolicy 버전 테이블 (모델에 이미 반영) |
| 5. 직거래 우회가 수익성 위협 | Contact 정책(§14)은 MVP에서 In-App 안내 수준으로 시작, 기술적 차단은 후순위 |
| 1~3. 단가 시장 가설 | Phase 1 Pricing Rule Table 수치는 인터뷰·파일럿 데이터로 검증 후 조정 |
| 7. Leader Certification의 대체 가능성 | MVP는 leader Role 1개 제한(I9) — 소규모 행사로 먼저 검증 |

---

## 6. 다음 액션 (Phase 1 착수)

1. `docs/policy/pricing-rules.md` — Base Rate/승급 규칙/Premium 표 초안
2. `docs/policy/cancellation-noshow.md` — 취소·No-show 정책 초안
3. 02 상태 전이표의 "조건" 칸을 1·2 결과로 채우고, §22 흐름 워크스루로 검증
