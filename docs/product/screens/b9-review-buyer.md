# B9. 리뷰 작성 (Buyer)

> [MVP 화면 목록](../mvp-screens.md) 소속 — 디자인 생성 시 [공통 규약](_common.md)과 함께 입력
> Buyer · 데스크탑 · `/buyer/events/[id]/reviews` · 진입: 행사 종료 알림, [B7]/[B8] 종료 상태 CTA

**목적**: 참여 인력을 평가한다. 평가가 다음 추천 품질과 Worker 성장(등급)의 원료다.

- **레이아웃**: 좌측 대상 리스트(참여 Worker — 사진·이름·Role, 작성 완료 체크), 우측 평가 폼: **Buyer→Promoter** 항목(시간 준수/업무 수행/커뮤니케이션/태도/행사 적합도 — 5점 척도 + 재고용 의사 토글 `[정책: Review Matrix에서 확정]`), **Buyer→Leader** 항목(현장 인력 통제/커뮤니케이션/문제 해결/요청 대응/Replacement 대응 `[정책]`), 자유 코멘트.
- **데이터**: Review 생성(Event context, 평가자=buyer, 피평가자=assignment — §19.1, §19.4).
- **상태 변형**: 전원 작성 완료 화면. 수정 가능 기간 `[정책]`.

