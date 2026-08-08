# B7. 행사 상세·충원 현황

> [MVP 화면 목록](../mvp-screens.md) 소속 — 디자인 생성 시 [공통 규약](_common.md)과 함께 입력
> Buyer · 데스크탑 · `/buyer/events/[id]` · 진입: [B1] 카드, 알림 랜딩(수락/거절/만료/확정)

**목적**: 요청 발송 후 행사의 관제탑. 응답 현황을 보고 결원에 대응하며, 확정 여부를 판단한다.

- **레이아웃**: ① 헤더 — 행사명·일시·장소, Event 상태 배지 + Booking 파생 상태 배지(수락 대기/부분 수락/확정/재충원 필요/취소됨), 우측 액션 메뉴(행사 취소) ② **Role별 충원 보드** — Role마다: 충원 projection 숫자줄(`필요 8 · 마감 2 · 수락 5 · 대기 1 · 남음 0`), Assignment 행 리스트(사진 소형, 이름, 상태 배지, 단가, 응답 카운트다운, 행 클릭→[B5]) ③ D-3/D-1 확인 현황 스트립(확정 n / 미확인 n — Risk 명단, S4) ④ 하단 이력(취소된 Booking 등).
- **데이터**: Event, Booking(파생), EventRole, Assignment 전체, PriceSnapshot 합계, Attendance Risk.
- **상태 변형**: Booking 파생 상태별 헤더 변형. **재충원 필요(Open)**: 결원 Role 강조 + 재추천 CTA. **확정(Confirmed)**: green 헤더 + D-3/D-1 스트립 활성. Event=Confirmed + Booking=Open 조합은 "확정된 행사 — 재충원 진행 중" 라벨(Event.Confirmed latch).
- **액션 → 전이**: 대안 재추천 → [B4] 재진입(빈 자리만). 개별 요청 철회 {Requested→Cancelled}. **미충원 마감**(Role 단위 버튼, 확인 다이얼로그: "남은 n자리를 비워둔 채 확정합니다. 처음 요청 인원 기록은 유지됩니다") → closed_unfilled_count 증가(I4) → 파생 Confirmed 도달 가능. 행사 취소(다이얼로그, 취소 정책 `[정책]` 고지) → Booking Cancel → 활성 Assignment 일괄 {→Cancelled}, {Event→Cancelled}. 당일이 되면 상단에 "당일 모니터링 열기" → [B8].

