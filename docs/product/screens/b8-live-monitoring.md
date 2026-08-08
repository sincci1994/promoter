# B8. 당일 모니터링

> [MVP 화면 목록](../mvp-screens.md) 소속 — 디자인 생성 시 [공통 규약](_common.md)과 함께 입력
> Buyer · 양쪽 · `/buyer/events/[id]/live` · 진입: [B7], 알림 랜딩(NoShow/Replacement)

**목적**: 행사 당일 출결과 결원 대응을 실시간으로 본다. Buyer는 개입하지 않고 확인만 하는 것이 기본(No-show 책임 이전이 제품 가설) — 단 **Leader 없는 행사에서는 이 화면이 출결 기록 도구가 된다**.

- **레이아웃**: ① 상단 요약 — 총원/도착/지각/미도착 카운터, Event 상태(진행 중) ② 출결 보드 — Role별 인원 카드(사진, 이름, 출결 라벨 배지: 도착/지각/연락 두절/불참, 체크인 시각) ③ **Replacement 진행 카드**(있을 때) — 타임라인: 요청됨 → 후보 n명 요청 중 → 매칭됨(대체자 카드) → 도착 완료 ④ Incident 목록(읽기).
- **데이터**: Attendance(라벨은 §13.3: Arrived/Late/No Contact/Absent), Assignment(Confirmed/NoShow/Completed), ReplacementRequest + 후보 Assignment, IncidentReport.
- **상태 변형**: 행사 전(카운트다운 + 집합 정보), 진행 중, 종료 후(요약 + 리뷰 유도 → [B9]). **Leader 없는 행사 변형**: 인원 카드에 체크인/라벨 버튼 노출([L2]와 동일 컴포넌트), NoShow 처리·Replacement 요청 액션 노출([L3] 동일) — 행위자만 Buyer.
- **액션 → 전이**(Leader 없는 행사에서만): 체크인 기록(Attendance), NoShow 처리 {Confirmed→NoShow}, Replacement 요청 {ReplacementRequest 생성→Open}.

