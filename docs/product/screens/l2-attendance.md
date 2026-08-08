# L2. 출결 체크

> [MVP 화면 목록](../mvp-screens.md) 소속 — 디자인 생성 시 [공통 규약](_common.md)과 함께 입력
> 현장 사용 전제: 한 손 조작·야외 시인성(대형 터치 타깃·고대비). 노출 조건: 활성 LeaderCertification + 해당 행사 leader Role Assignment Confirmed(D3, I8)
> Leader · 모바일 · `/p/lead/[eventId]/attendance` · 진입: [L1]

**목적**: 도착 순으로 빠르게 체크인하고, 문제 인원을 라벨링한다. 행사 시작 직전의 러시를 버티는 속도가 생명.

- **레이아웃**: ① 상단 고정 요약 바(도착 n/총원 n, 행사 시작까지 카운트다운) ② 인원 리스트(Role별 그룹) — 행: **사진(크게)**+이름+Role, 우측 대형 체크인 버튼. 체크인 시 타임스탬프 기록, 시작 시간 이후면 자동 "지각" 라벨(late_minutes 파생 표시) ③ 행 스와이프/길게 누르기 → 라벨 시트: 도착/지각/연락 두절/불참(§13.3) ④ 하단: 일괄 체크아웃(행사 종료 시).
- **데이터**: Assignment(Confirmed), Attendance 생성·갱신(check_in_at/check_out_at, status).
- **액션 → 전이**: 체크인=Attendance 기록(대체자라면 {ReplacementRequest: Matched→**Fulfilled**} — 성공의 정의는 도착). **불참 확정** → 확인 다이얼로그 "노쇼로 처리합니다" {Assignment: Confirmed→NoShow} → 후속 시트 "대체 인력을 요청할까요?" → [L3]. 일괄 체크아웃 → {Confirmed→Completed}(check-out 기반).
- **상태 변형**: 전원 도착(green 완료 상태), 미도착 잔여(시작 후 red 강조), 오프라인/약전파 — 실패 시 재시도 큐 안내(MVP는 온라인 전제, 스택 결정 §1).

