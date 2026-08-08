# L4. Incident 기록

> [MVP 화면 목록](../mvp-screens.md) 소속 — 디자인 생성 시 [공통 규약](_common.md)과 함께 입력
> 현장 사용 전제: 한 손 조작·야외 시인성(대형 터치 타깃·고대비). 노출 조건: 활성 LeaderCertification + 해당 행사 leader Role Assignment Confirmed(D3, I8)
> Leader · 모바일 · `/p/lead/[eventId]/incidents` · 진입: [L1], [L2] 라벨 시트 보조 액션

**목적**: 인력 관련 사건(지각 사유, 현장 문제, 계약 외 업무 요구)을 그 자리에서 남긴다. 기록이 분쟁 대응과 Reliability의 근거가 된다.

- **레이아웃**: 기록 리스트(시각순) + 작성 시트: 대상(행사 전체 / 특정 인원 선택 — assignment 0..1), 내용 텍스트, 저장. 항목당 작성자·시각 자동 기록.
- **데이터**: IncidentReport CRUD(작성만, 수정·삭제 없음 — append 기록).
- **상태 변형**: 빈 목록("기록할 사건이 없다면 좋은 행사입니다").

