# L1. 당일 운영 홈

> [MVP 화면 목록](../mvp-screens.md) 소속 — 디자인 생성 시 [공통 규약](_common.md)과 함께 입력
> 현장 사용 전제: 한 손 조작·야외 시인성(대형 터치 타깃·고대비). 노출 조건: 활성 LeaderCertification + 해당 행사 leader Role Assignment Confirmed(D3, I8)
> Leader · 모바일 · `/p/lead` · 진입: [P1] "오늘 운영" 배너, 당일 알림

**목적**: 오늘 담당 행사의 운영 시작점.

- **레이아웃**: 오늘 행사 카드(행사명, 집합 시간·장소, Buyer 조직명) + 인원 요약(총원 n·도착 n·미도착 n 실시간) + 대형 CTA "출결 시작" → [L2] + 보조 링크: Replacement([L3])·Incident([L4]).
- **데이터**: 내 leader Assignment(Confirmed, 당일), 해당 Event의 Assignment/Attendance 집계.
- **상태 변형**: 담당 행사 없는 날(빈 상태), 복수 행사(리스트).

