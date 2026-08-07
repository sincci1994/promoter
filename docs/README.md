# 문서 맵

설계 산출물을 [기획서](../README.md)와 분리해 여기서 관리한다. 새 문서를 만들면 반드시 이 맵에 등록한다.

## 분류

| 분류 | 문서 | 상태 |
|---|---|---|
| 기획 | [기획서 (서비스 전체)](../README.md) | v0.1 |
| 도메인 | [01. 경계 결정 D1~D5](domain/01-boundary-decisions.md) | v0.2 |
| 도메인 | [02. 도메인 모델](domain/02-domain-model.md) | v0.2 |
| 정책 | `policy/pricing-rules.md` — 단가·승급·Premium·Fee | 예정 (Phase 1) |
| 정책 | `policy/cancellation-noshow.md` — 취소·No-show·비용부담 | 예정 (Phase 1) |
| 제품 | `product/use-cases.md` — Actor×UseCase | 예정 (Phase 2) |
| 제품 | `product/user-flows.md` — Buyer/Promoter/Leader Flow | 예정 (Phase 2) |
| 제품 | `product/review-authority-matrix.md` — Review·Leader 권한 매트릭스 | 예정 (Phase 2) |
| 제품 | `product/mvp-screens.md` — MVP 화면 목록 | 예정 (Phase 2) |
| 기술 | `tech/stack-decision.md` — 스택 결정 | 예정 (Phase 3) |
| 기술 | `tech/erd.md` — ERD·제약 매핑 | 예정 (Phase 3) |
| 기술 | `tech/api.md` — API 계약 | 예정 (Phase 3) |
| 플랜 | [개발 플랜 (Phase 0~4)](plan/development-plan.md) | v0.2 |

## 읽는 순서

1. [기획서](../README.md) — 무엇을, 왜 만드는가
2. [경계 결정](domain/01-boundary-decisions.md) — 다섯 경계를 어떻게 결정했는가
3. [도메인 모델](domain/02-domain-model.md) — 그 결과 구조가 무엇인가
4. [개발 플랜](plan/development-plan.md) — 앞으로 무엇을 어떤 순서로 하는가

## 규칙

- 기획서는 비즈니스 기준 문서로 유지하고, 설계 상세는 여기 `docs/`에만 쌓는다.
- 결정을 뒤집을 때는 해당 문서를 고치고 사유를 남긴다(새 문서를 늘리지 않는다).
- "예정" 문서는 해당 Phase 착수 전에 만들지 않는다.
