# L3. Replacement 요청·진행

> [MVP 화면 목록](../mvp-screens.md) 소속 — 디자인 생성 시 [공통 규약](_common.md)과 함께 입력
> 현장 사용 전제: 한 손 조작·야외 시인성(대형 터치 타깃·고대비). 노출 조건: 활성 LeaderCertification + 해당 행사 leader Role Assignment Confirmed(D3, I8)
> Leader · 모바일 · `/p/lead/[eventId]/replacement` · 진입: [L2] 후속 시트, [L1]

**목적**: 결원을 보고하고 대체 투입의 진행을 추적한다. Buyer 개입 없이 플랫폼 안에서 완결되는 것이 제품 핵심 가설(S4).

- **레이아웃**: ① 새 요청 — 결원 인원 선택(NoShow/Cancelled 대상), 사유 확인 → 요청 생성 ② **진행 타임라인 카드**(요청별): 탐색 중(후보 n명에게 요청 발송, 경과 시간) → 매칭됨(대체자 카드: 사진·이름·도착 예상, "도착 시 체크인으로 완료됩니다") → **도착 완료**(Fulfilled) / 실패(후보 소진 — Buyer 통지됨) / 철회 ③ 재탐색 버튼(Matched 이탈 시).
- **데이터**: ReplacementRequest(Open→Matched→Fulfilled|Failed|Cancelled), 후보 Assignment(replacement_request_id, Emergency Premium 스냅샷).
- **액션 → 전이**: 요청 생성 {ReplacementRequest: 생성→Open}(플랫폼이 긴급 후보 탐색 — emergency_flag·가용·자격 기준). 철회 {→Cancelled}. 후속 상태는 시스템·대체자 행동으로 진행(화면은 추적).
- **정책**: Emergency Premium 부담 주체 표시 `[정책]`, 탐색 반경·시간 한도 `[정책]`.

