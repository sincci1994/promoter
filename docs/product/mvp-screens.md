# MVP 화면 목록

> Version 0.2 (2026-08-08) — 화면별 UI/UX 정의를 [`screens/`](screens/)로 분리(디자인 생성 입력 단위). v0.1의 본문 내용은 재작성 없이 그대로 이동했다.
> 기준 문서: [기획서 §26 MVP 범위](../../README.md), [User Flow](user-flows.md), [도메인 모델](../domain/02-domain-model.md), [스택 결정](../tech/stack-decision.md)
> **용도**: 클로드 디자인으로 화면을 생성할 때 **해당 화면 파일 + [공통 규약](screens/_common.md) 2개를 함께 입력**한다.
> 정책 미확정 값은 `[정책]`으로 표기 — Phase 1 산출물(pricing-rules, cancellation-noshow)이 채운다. 화면 구조는 정책 수치와 무관하게 유효하다.

---

## 0. 화면 인벤토리

| ID | 화면 | 사용자 | 디바이스 | 슬라이스 | 라우트 |
|---|---|---|---|---|---|
| [A1](screens/a1-login.md) | 로그인 | 공통 | 양쪽 | S1 | `/login` |
| [A2](screens/a2-signup.md) | 가입·역할 선택 | 공통 | 양쪽 | S1 | `/signup` |
| [A3](screens/a3-worker-onboarding.md) | Worker 온보딩 | Worker | 모바일 | S1 | `/onboarding/worker` |
| [A4](screens/a4-buyer-onboarding.md) | Buyer 온보딩 | Buyer | 데스크탑 | S1 | `/onboarding/buyer` |
| [B1](screens/b1-buyer-home.md) | Buyer 홈 — 행사 목록 | Buyer | 데스크탑 | S2 | `/buyer` |
| [B2](screens/b2-event-create.md) | 행사 생성 | Buyer | 데스크탑 | S2 | `/buyer/events/new` |
| [B3](screens/b3-role-setup.md) | 역할 구성 | Buyer | 데스크탑 | S2 | `/buyer/events/[id]/roles` |
| [B4](screens/b4-team-builder.md) | Team Builder | Buyer | 데스크탑 | S2 | `/buyer/events/[id]/team` |
| [B5](screens/b5-worker-profile-panel.md) | Worker 프로필 상세 (Buyer 뷰) | Buyer | 데스크탑 | S2 | B4 내 사이드 패널 |
| [B6](screens/b6-booking-request.md) | Booking 요청 발송 | Buyer | 데스크탑 | S3 | `/buyer/events/[id]/request` |
| [B7](screens/b7-event-detail.md) | 행사 상세·충원 현황 | Buyer | 데스크탑 | S3 | `/buyer/events/[id]` |
| [B8](screens/b8-live-monitoring.md) | 당일 모니터링 | Buyer | 양쪽 | S4 | `/buyer/events/[id]/live` |
| [B9](screens/b9-review-buyer.md) | 리뷰 작성 (Buyer) | Buyer | 데스크탑 | S5 | `/buyer/events/[id]/reviews` |
| [P1](screens/p1-worker-home.md) | Worker 홈 | Worker | 모바일 | S1+ | `/p` |
| [P2](screens/p2-profile.md) | 프로필 관리 | Worker | 모바일 | S1 | `/p/profile` |
| [P3](screens/p3-availability.md) | 가용일정 | Worker | 모바일 | S1 | `/p/availability` |
| [P4](screens/p4-requests.md) | 요청 목록 | Worker | 모바일 | S3 | `/p/requests` |
| [P5](screens/p5-request-detail.md) | 요청 상세 — 수락/거절 | Worker | 모바일 | S3 | `/p/requests/[id]` |
| [P6](screens/p6-schedule.md) | 내 일정 | Worker | 모바일 | S3 | `/p/schedule` |
| [P7](screens/p7-assignment-detail.md) | 배정 상세 — 안내·D-3/D-1 | Worker | 모바일 | S4 | `/p/assignments/[id]` |
| [P8](screens/p8-review-worker.md) | 리뷰 작성 (Worker) | Worker | 모바일 | S5 | `/p/reviews/[eventId]` |
| [L1](screens/l1-lead-home.md) | 당일 운영 홈 | Leader | 모바일 | S4 | `/p/lead` |
| [L2](screens/l2-attendance.md) | 출결 체크 | Leader | 모바일 | S4 | `/p/lead/[eventId]/attendance` |
| [L3](screens/l3-replacement.md) | Replacement 요청·진행 | Leader | 모바일 | S4 | `/p/lead/[eventId]/replacement` |
| [L4](screens/l4-incidents.md) | Incident 기록 | Leader | 모바일 | S4 | `/p/lead/[eventId]/incidents` |

Leader 화면(L*)은 별도 계정이 아니라 **활성 LeaderCertification 보유 + 해당 행사의 leader Role Assignment가 Confirmed인 Worker**에게만 `/p/*` 안에서 노출된다(D3). 현장 사용 전제(한 손 조작·야외 시인성)는 각 L 파일 헤더에 있다.

> **공개 랜딩(H0)**: 위 표 밖의 화면으로, 문서 없이 코드로 직접 구현했다(`src/app/(marketing)/` — cipher.tv 무드의 시네마틱 다크 랜딩, 2026-08-08). 기존 "공개 페이지 없음" 전제는 이 결정으로 변경됨. 카피·클립·인물은 `src/lib/landing-content.ts`에서 교체한다.

---

## 1. 화면 ↔ 기획서 §26 MVP 범위 대조표

| §26 항목 | 커버 화면 / 구현 위치 |
|---|---|
| Promoter — Profile | [A3] [P2] |
| Promoter — Portfolio | [A3] [P2] |
| Promoter — Career | [P2] 완료 집계, [P6] 완료 탭 |
| Promoter — Availability | [P3] |
| Promoter — Skill | [A3] [P2] (자가신고 태그 + 검증 자격 구분) |
| Promoter — Basic Grade | [P2] 등급 배지·이력 (부여는 운영 수동 `[정책]`) |
| Promoter — Booking Accept/Decline | [P4] [P5] |
| Buyer — Event Create | [B2] |
| Buyer — Event Requirement | [B2] [B3] |
| Buyer — Role | [B3] |
| Buyer — Recommended Team | [B4] |
| Buyer — Team Builder | [B4] [B5] |
| Buyer — 가격 확인 | [B4] 견적 패널, [B6] 라인아이템 |
| Buyer — Booking Request | [B6] |
| Leader — 인증 여부 | [P2] 자격 배지 (발급은 운영 수동) |
| Leader — 행사 배정 | [B4](leader Role 자리) + [P5](수락) |
| Leader — Attendance | [L2] (Leader 없는 행사는 [B8] 변형) |
| Leader — Basic Incident | [L4] |
| Leader — Replacement Request | [L3] (Leader 없는 행사는 [B8] 변형) |
| Platform — Booking | [B6] [B7] [P5] + 시스템(파생 상태·만료 스윕) |
| Platform — Notification | 화면 없음 — 알림톡/SMS 발송 + 딥링크 랜딩([User Flow §4](user-flows.md)) |
| Platform — Review | [B9] [P8] |
| Platform — Reliability 기초 데이터 | 화면 없음 — Attendance·Review·응답 기록에서 축적(내부값, §20) |

**의도적 화면 제외**: 인앱 알림 센터(알림톡+딥링크로 대체), 운영자 콘솔(파일럿은 Supabase Studio/SQL 수동 운영 — Grade 부여·Certification 발급·PricingPolicy 관리), In-App Chat(§14는 MVP에서 In-App 안내 수준 — [P7] 행사 안내로 커버), 정산 화면(post-MVP — 예상 금액 표시만).
