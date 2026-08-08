# User Flow 3종 — Buyer / Promoter / Leader

> Version 0.3 (2026-08-08) — D6 외부 리뷰 반영: 복수 Role 지원(I10 Role 단위), 감사 필드 기록, Standby 대기, 승인=계약의 두 전제
> Version 0.2 (2026-08-08) — D6 반영: Buyer 공개 모집 병행 경로(M1~M6), Promoter 지원 경로(J1~J6), 알림 접점 4행 추가
> Version 0.1 (2026-08-08)
> 기준 문서: [기획서 §22 전체 흐름](../../README.md), [도메인 모델 §4~6 상태기계](../domain/02-domain-model.md), [경계 결정 D1~D6](../domain/01-boundary-decisions.md)
> 표기: `[화면 ID]`는 [MVP 화면 목록](mvp-screens.md)의 화면. `{엔티티: A→B}`는 상태 전이. 정책 미확정 수치는 `[정책]`으로 표기(Phase 1에서 확정).
> 모든 Flow는 상태기계 위에서 재생 가능해야 한다(Phase 2 완료 기준). 상태기계에 없는 전이를 Flow가 요구하면 이 문서가 아니라 02를 먼저 고친다.

---

## 1. Buyer Flow — 행사 생성 → 팀 구성 → 예약 → 행사 → 평가

### 성공 경로

| # | 단계 | 화면 | 상태 변화 |
|---|---|---|---|
| 1 | 가입, 조직 프로필 등록 | [A1] [A2] [A4] | User, BuyerProfile 생성 |
| 2 | 행사 생성 — 행사명/유형/브랜드/일시/장소 | [B2] | {Event: 생성→Draft} |
| 3 | 역할 구성 — Role별 인원·최소 Grade·자격 요구·소프트 태그. leader Role은 최대 1개(I9). **Role별 공개 모집 토글(선택, D6)** | [B3] | EventRole 생성 + posted_at 기록(켠 경우 — Event 상태 변화 없음). {Event: Draft→TeamBuilding} |
| 4 | 추천 확인·팀 편집 — 추천 실행(RecommendationRun 로그), 후보 담기/교체, 프로필 상세 확인([B5]), **실시간 견적**(저장 없음, D5) | [B4] | {Assignment: 생성→Selected}, 교체 시 {Selected→Removed} + 새 Selected |
| 5 | Booking 요청 발송 — 견적 요약·응답기한 `[정책]` 안내 확인 | [B6] | {Assignment: Selected→Requested} × N. **PriceSnapshot 동결(I5)**, expires_at 설정, Booking 생성(Event당 활성 1, I1), {Event: TeamBuilding→BookingPending}, **첫 요청 시 일시·장소·Role 요구조건 잠금(I7)**. Worker 알림 발송 |
| 6 | 응답 대기 — 충원 현황 모니터링 | [B7] | {Booking(파생): Requested → PartiallyAccepted} |
| 7 | 전 자리 수락 → 확정 | [B7] | {Booking(파생): Confirmed}, {Assignment: Accepted→Confirmed 일괄}, {Event: BookingPending→Confirmed}. D-3/D-1 확인 스케줄 등록, 전원 알림 |
| 8 | 행사 당일 — 출결·Incident·Replacement 진행 모니터링. Leader 없는 행사는 여기서 Buyer가 직접 출결 기록 | [B8] | {Event: Confirmed→InProgress}. Attendance 기록 열람 |
| 9 | 행사 종료 | — (System) | {Event: InProgress→Completed}, {Assignment: Confirmed→Completed}(check-out 기반) |
| 10 | 평가 — 참여 Promoter 각각·Leader | [B9] | Review 생성(§19.1 Buyer→Promoter, §19.4 Buyer→Leader). Reliability/Career 반영 |

### 공개 모집 병행 경로 (선택 — 성공 경로 3~7단계와 병행, D6)

| # | 단계 | 화면 | 상태 변화 |
|---|---|---|---|
| M1 | 모집 켜기 — 역할 구성 시 또는 충원 난항 시 Role 단위 토글 | [B3] [B7] | EventRole.posted_at 기록(최초 1회 — I7 래치). 공고 노출 시작(공개 범위 `[정책]`) |
| M2 | 지원 접수 — 알림 수신 → 지원자 확인 | [B7] | {Application: 생성→Open}(Worker 행위, I10). Buyer 알림 |
| M3 | 지원자 검토 — 프로필 상세 확인 | [B7] → [B5] | — |
| M4 | **승인** — 동결가가 지원 시 표시가보다 낮으면 Worker 재확인 분기 `[정책]` | [B7] (또는 [B4] 지원자 우선 노출 경유) | {Application: Open→Approved} + **{Assignment: 생성→Accepted}, PriceSnapshot 동결(I5)**, Booking 없으면 생성, 해당 Worker의 같은 행사 나머지 Open 지원 일괄 Closed(OTHER_ROLE_APPROVED). 충원 파생에 합류 — 전 자리 충족 시 성공 경로 7단계(확정)로. Worker 알림 |
| M5 | 반려 | [B7] | {Application: Open→Declined}. 자리 영향 없음. Worker 알림(재지원 제한 `[정책]`) |
| M6 | 모집 끄기 — 수동 또는 자동 `[정책]` | [B3]/[B7] | posting_closed_at 기록 — **신규 접수만 차단**, 접수된 Open 지원은 계속 검토 가능(기본 방향: Standby 유지, D6 결정 7). 일괄 종결 여부 `[정책]` |

### 실패·우회 경로

| 시나리오 | 흐름 | 상태 변화 |
|---|---|---|
| 거절/만료 발생 | 알림 수신 → [B7] → 대안 후보 재추천([B4] 재진입) → 추가 요청([B6]) | {Assignment: Requested→Declined \| Expired}(자리 재오픈) → 새 후보 {생성→Selected→Requested}. 같은 Booking 컨테이너 유지 |
| 부분 수락 교착 — 대안 후보 소진, "이대로 진행" 결정 | [B7] **미충원 마감** 명령 | EventRole.closed_unfilled_count 증가(I4, required_count 불변) → 파생 로직이 유효 정원 충족 계산 → {Booking(파생): Confirmed} |
| 요청 철회 | [B7] 개별 요청 철회 | {Assignment: Requested→Cancelled}(자리 재오픈) |
| 행사 취소 | [B7] 취소(확인 다이얼로그, 취소 정책 `[정책]` 고지) | Booking Cancel(유일한 명시 명령) → 활성 Assignment 일괄 {→Cancelled}, {Event: →Cancelled} |
| 취소 후 재예약 | [B2]부터 재생성 또는 [B7]에서 재예약 → 새 Booking | 취소 Booking은 이력 보존(I1은 활성 행 기준). Declined 이력 Worker에게 재요청 가능 |
| 확정 후 이탈 발생 | 알림 수신 → [B7]에서 재충원 — **잔여 Open 지원자(Standby) 즉시 승인(M4)**, 재추천([B4]), 또는 Replacement 진행 확인([B8]) | {Booking(파생): Confirmed→Open/PartiallyAccepted 회귀}. **Event.Confirmed는 latch로 유지** — "확정된 행사의 재충원 중" |
| 충원 난항 — 거절·만료 누적, 대안 후보 부족 | [B7] 결원 Role에 **공개 모집 켜기** → 지원 유입 대기 → M2~M4 | EventRole 게시(D6). 기존 재추천([B4])과 병행 가능 — 같은 자리에 지명 1건 + 지원 N건(A4) |
| 승인 직전 자리 소진 — 지명 수락이 먼저 성립 | [B7] 승인 시도 → "자리가 방금 충원되었습니다" 안내 | 승인 트랜잭션 I3 실패, Application은 Open 유지 → 반려 또는 모집 끄기로 정리 |

---

## 2. Promoter Flow — 프로필 → 가용일정 → 수락 → 근무 → 평가

### 성공 경로

| # | 단계 | 화면 | 상태 변화 |
|---|---|---|---|
| 1 | 가입, Worker 프로필 등록 — 사진/Portfolio/자가신고 skill 태그/선호 유형/활동 지역. 마지막에 **PWA 홈 화면 설치 안내** | [A1] [A2] [A3] | User, WorkerProfile 생성, 초기 GradeHistory 부여(P1 `[정책]`) |
| 2 | 가용일정 등록 — 날짜/시간대, emergency_flag | [P3] | AvailabilitySlot 생성(참고 정보 — 예약 상태를 미러링하지 않음, A2) |
| 3 | (플랫폼이 추천에 노출 — Worker 측 화면 없음) | — | RecommendationRun에 후보로 기록될 수 있음 |
| 4 | 요청 수신 — 알림톡/SMS 링크 → 상세 확인: 행사 정보·Role·**동결 단가 내역**·응답기한 카운트다운 | [P4] [P5] | — |
| 5 | 수락 | [P5] | {Assignment: Requested→Accepted}. **시간 겹침 검사(I6) 통과 필수** — 겹치면 수락 불가 안내(먼저 수락한 쪽이 이김, A3). Buyer 알림 |
| 6 | 확정 통지 수신 | [P6] [P7] | {Assignment: Accepted→Confirmed}(전 자리 수락 시 일괄) |
| 7 | D-3 참여 확정 / D-1 최종 확인 | [P7] | Attendance Risk 플래그 해제. 미확인 시 Risk 설정(Backup 사전 탐색 트리거) |
| 8 | 행사 당일 — 집합, Leader에게 체크인/체크아웃(기록은 [L2]에서) | [P7] | Attendance check_in_at / check_out_at → {Assignment: Confirmed→Completed} |
| 9 | 평가 — Leader·행사/Buyer에 대해 | [P8] | Review 생성(§19.3, §19.5) |
| 10 | 경력·등급 반영 확인 | [P2] | Career 증가, Reliability 반영, Grade 승급 시 GradeHistory 추가 `[정책]` |

### 지원 경로 (공고 탐색 → 지원 → 승인 — 성공 경로 4~5단계의 대칭, D6)

| # | 단계 | 화면 | 상태 변화 |
|---|---|---|---|
| J1 | 공고 탐색 — 날짜 스트립에서 날짜 선택 → 그날 모집 중 공고 리스트(본인 Grade 기준 **예상 단가** 표시) | [P9] | — |
| J2 | 공고 상세 — 조건·예상 금액("승인 시점 금액으로 동결됩니다" 고지) 확인 | [P5 공고 변형] | — |
| J3 | 지원 — 같은 행사 복수 Role 지원 가능 | [P5 공고 변형] | {Application: 생성→Open}(I10 — **Role당** 활성 지원 1, 행사당 상한 `[정책]`) + **감사 필드 3개 서버 기록**(표시가·정책 버전·등급, D6). 시간 겹침은 소프트 경고만(하드 검사 I6은 승인 시). Buyer 알림(묶음 `[정책]`) |
| J4 | 승인 대기 — 내 지원 현황 확인, 철회 가능. 정원 충족 시 "대기(Standby)" 표시 `[정책]` | [P4 내 지원 탭] | 철회 시 {Application: Open→Withdrawn}(Buyer 통지 여부 `[정책]`) |
| J5 | 승인 통지 수신 — **Worker의 수락 단계 없음**(지원이 사전 동의. 전제: I7 조건 잠금 + 가격 보호 — 동결가가 지원 시 표시가보다 낮으면 재확인 `[정책]`, D6) | [P7] | {Application: Open→Approved}, {Assignment: 생성→Accepted}. 같은 행사의 나머지 내 지원은 자동 마감(OTHER_ROLE_APPROVED). **합류점: 성공 경로 5단계(수락) 직후와 동일** — 이후 확정 통지·D-3/D-1·당일·평가 전부 기존 경로(D-3 이후 성립이면 즉시 확인 1회 `[정책]`) |
| J6 | 반려·만료·마감 통지 — 마감은 사유 표기(행사 취소/다른 역할 승인/모집 종료 등, closed_reason) | [P4] | {Application: Open→Declined \| Expired \| Closed}. 흐린 처리 이력 |

### 실패·우회 경로

| 시나리오 | 흐름 | 상태 변화 |
|---|---|---|
| 거절 | [P5] 거절(사유 선택) | {Assignment: Requested→Declined}. 자리 재오픈, Buyer에 대안 재추천 트리거 |
| 미응답 만료 | — (pg_cron) | {Assignment: Requested→Expired}. [P4]에서 만료됨 표기 |
| 수락 후 취소 | [P7] 취소 요청(취소 정책 `[정책]` 고지) | {Assignment: Accepted \| Confirmed→Cancelled}. 자리 재오픈 또는 ReplacementRequest 생성. Reliability 반영 `[정책]` |
| 긴급 대체 요청 수신 | 알림 → [P5]의 Emergency 변형 — Emergency Premium 라인 표시, 짧은 기한 `[정책]` | {Assignment: 생성→Requested}(replacement_request_id 보유, 새 PriceSnapshot) |
| 당일 미출근 | — | {Assignment: Confirmed→NoShow}(Leader/Buyer 보고). Reliability 하락 `[정책]`, 이의신청은 post-MVP 운영 대응 |

---

## 3. Leader Flow — 인증 → 배정 → 출결 → Replacement

전제: Leader는 별도 계정이 아니다(D3). Worker 계정에 활성 LeaderCertification이 있으면 leader Role에 선택될 수 있고, 수락 경로는 Promoter와 동일 메커니즘이다. 차이는 당일 운영 화면([L1]~[L4])의 노출뿐이다.

### 성공 경로

| # | 단계 | 화면 | 상태 변화 |
|---|---|---|---|
| 1 | LeaderCertification 취득 — MVP는 운영 수동 발급(심사·교육은 post-MVP) | — (운영) | WorkerCertification 생성(kind=leader, L1~L3) |
| 2 | Buyer가 leader Role에 선택([B4]) → 요청 수신 → 수락 | [P5] | {Assignment: Requested→Accepted}. 배정자 자격 검증(I8), Event당 leader Role ≤ 1(I9) |
| 3 | 행사 확정 후 — 담당 행사·인원 명단 확인 | [L1] | — |
| 4 | 당일 출결 기록 — 도착 순 Check-in, 라벨(Arrived/Late/No Contact/Absent), 휴게·역할 조정은 운영 메모 | [L2] | Attendance 생성(check_in_at). 지각은 타임스탬프 파생(late_minutes) |
| 5 | No-show 확인 시 처리 | [L2] | {Assignment: Confirmed→NoShow} |
| 6 | Replacement 요청 — 결원 Role·사유 입력 | [L3] | {ReplacementRequest: 생성→Open}. 플랫폼이 긴급 후보 탐색 → 후보 {Assignment: 생성→Requested}(Emergency Premium 스냅샷) |
| 7 | 대체자 수락 → 현장 도착 체크인 | [L3] [L2] | {ReplacementRequest: Open→Matched}(수락 시) → **{Matched→Fulfilled}(현장 Check-in 시 — 성공의 정의는 도착)** |
| 8 | Incident 기록 — 인력 관련 사건 | [L4] | IncidentReport 생성 |
| 9 | 종료 — 체크아웃 일괄 기록 | [L2] | check_out_at → {Assignment: Confirmed→Completed} |
| 10 | 평가 — 담당 Promoter 각각 | [P8] | Review 생성(§19.2 Leader→Promoter) |

### 실패·우회 경로

| 시나리오 | 흐름 | 상태 변화 |
|---|---|---|
| 대체자도 취소/노쇼 | [L3]에서 재탐색 | {ReplacementRequest: Matched→Open 회귀} → 새 후보 탐색 |
| 후보 소진/시간 초과 | [L3] 실패 표기, Buyer 통지 | {ReplacementRequest: Open→Failed} — 실패도 도메인 기록 |
| 요청 철회(결원 해소 등) | [L3] | {ReplacementRequest: →Cancelled} |
| Leader 없는 행사 | 출결·NoShow 보고·Replacement 요청을 Buyer가 [B8]에서 수행 | 상태 변화 동일(행위자만 Buyer) |

---

## 4. 알림 접점 요약

Flow를 관통하는 알림(알림톡/SMS, [스택 결정 §3](../tech/stack-decision.md))과 랜딩 화면:

| 트리거 | 수신자 | 랜딩 |
|---|---|---|
| Booking 요청 발송 | Worker | [P5] |
| 수락/거절/만료 | Buyer | [B7] |
| 전원 확정 | 전원 | [P7] / [B7] |
| D-3/D-1 확인 요청 | Worker | [P7] |
| Replacement 긴급 요청 | 긴급 가용 Worker | [P5] |
| Replacement 진행(매칭/실패) | Buyer, Leader | [B8] / [L3] |
| 행사 안내(집합·복장·Brief) | 참여 Worker | [P7] |
| Review 요청 | 전원 | [P8] / [B9] |
| 지원 접수 (D6) — 묶음/다이제스트 규칙 `[정책]`(상한 미확정 상태의 알림 폭주 방지) | Buyer | [B7] |
| 지원 철회 (D6) — 통지 여부 `[정책]` | Buyer | [B7] |
| 지원 승인 (D6) | Worker | [P7] |
| 지원 반려·만료 (D6) | Worker | [P4] |
| 일괄 종결(사유 표기) — 행사 취소·시작 시각 경과(I11), 계약 성립 supersede(지명 DIRECT_ASSIGNMENT_ACCEPTED·타 Role 승인 OTHER_ROLE_APPROVED) `[정책]` | Worker | [P4] |
