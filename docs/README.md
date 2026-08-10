# 문서 맵

설계 산출물을 [기획서](../README.md)와 분리해 여기서 관리한다. 새 문서를 만들면 반드시 이 맵에 등록한다.

## 분류

| 분류 | 문서 | 상태 |
|---|---|---|
| 기획 | [기획서 (서비스 전체)](../README.md) | v0.1 |
| 도메인 | [01. 경계 결정 D1~D6](domain/01-boundary-decisions.md) | v0.4 |
| 도메인 | [02. 도메인 모델](domain/02-domain-model.md) | v0.4 |
| 정책 | `policy/pricing-rules.md` — 단가·승급·Premium·Fee | 예정 (Phase 1) |
| 정책 | `policy/cancellation-noshow.md` — 취소·No-show·비용부담 | 예정 (Phase 1) |
| 제품 | `product/use-cases.md` — Actor×UseCase | 예정 (Phase 2) |
| 제품 | [User Flow 3종](product/user-flows.md) — Buyer/Promoter/Leader Flow + 공개 모집·지원 경로(D6) | v0.3 |
| 제품 | `product/review-authority-matrix.md` — Review·Leader 권한 매트릭스 | 예정 (Phase 2) |
| 제품 | [MVP 화면 목록](product/mvp-screens.md) — 인벤토리(구인보드 IA) + [`screens/`](product/screens/) 화면별 정의 + 재현 스펙 2종([h0 랜딩](product/screens/h0-landing.md)·[HOME 내부 홈](product/screens/home.md) — 디자인 생성·UI/UX 개편 입력 단위, 이 행으로 집합 등록) | v0.5 |
| 기술 | [스택 결정](tech/stack-decision.md) — 언어/프레임워크·DB·호스팅·알림 채널 | v0.1 (조기 확정 — 사유는 문서 헤더) |
| 기술 | `tech/erd.md` — ERD·제약 매핑 | 예정 (Phase 3) |
| 기술 | `tech/api.md` — API 계약 | 예정 (Phase 3) |
| 플랜 | [개발 플랜 (Phase 0~4)](plan/development-plan.md) | v0.3 |

## 읽는 순서

1. [기획서](../README.md) — 무엇을, 왜 만드는가
2. [경계 결정](domain/01-boundary-decisions.md) — 다섯 경계를 어떻게 결정했는가
3. [도메인 모델](domain/02-domain-model.md) — 그 결과 구조가 무엇인가
4. [개발 플랜](plan/development-plan.md) — 앞으로 무엇을 어떤 순서로 하는가

## 규칙

- 기획서는 비즈니스 기준 문서로 유지하고, 설계 상세는 여기 `docs/`에만 쌓는다.
- 결정을 뒤집을 때는 해당 문서를 고치고 사유를 남긴다(새 문서를 늘리지 않는다).
- "예정" 문서는 해당 Phase 착수 전에 만들지 않는다.
