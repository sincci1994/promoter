# 도메인 경계 결정 (D1~D5)

> Version 0.2 (2026-08-08) — 외부 리뷰 반영: D2 충원 교착 해법 정정(미충원 마감, required_count 불변), Replacement 성공 재정의(도착 기준), Booking 파생 fallback Open, 부속 결정 A7(단일 Shift) 추가
> 기준 문서: [기획서](../../README.md) §30 도메인 모델링 핵심 질문, §28 미결정 항목, Appendix B 의도적 미확정 항목
> 성격: ADR-lite. 각 결정을 "질문 → 결정 → 근거 → 검토한 실패 시나리오 → 모델 영향" 순으로 기록한다.

여기서 닫는 것은 **구조**다. 정책 수치(단가, 응답기한, 패널티 금액 등)는 여전히 열려 있으며 [개발 플랜](../plan/development-plan.md) Phase 1에서 다룬다.

결정이 만들어내는 엔티티와 상태기계의 상세는 [도메인 모델](02-domain-model.md)에 있다.

---

## 0. 결정 요약

| # | 경계 | 결정 |
|---|---|---|
| D1 | Event ↔ Team | Team은 엔티티가 아니다. Event의 Assignment 집합에 대한 projection이며, 추천 결과는 RecommendationRun 로그로만 저장 |
| D2 | Booking ↔ Assignment | Assignment = 개인 단위 계약(핵심 상태기계 보유). Booking = Event당 활성 1개의 거래 컨테이너, 상태는 순수 파생(fallback Open) + 명시 명령은 Cancel 하나 |
| D3 | Promoter ↔ Leader | 단일 Worker. Leader는 User Type이 아니라 LeaderCertification(L1~L3) 자격. 행사 내 Leader = leader형 EventRole에 대한 Assignment |
| D4 | Grade ↔ Certification | 분리. Grade = 플랫폼 산정 등급(이력 + 산정 근거 보존). Certification = 검증 자격. Capability Premium은 Certification에만 |
| D5 | Price 귀속 | 버전 관리 정책 테이블에서 계산 → Booking Request 시점에 Assignment당 불변 PriceSnapshot(단가×수량 라인아이템)으로 동결 |

---

## D1. Event ↔ Team — Team은 영속 엔티티가 아니다

### 질문 (기획서 §30, Appendix B)

Event는 행사 자체이고 Team은 특정 행사에 구성된 인력 조합이다. Recommended Team과 Confirmed Team을 동일 객체의 상태로 볼지, 별도 객체로 볼지, Team을 영속 Entity로 둘지 Assignment 집합으로 계산할지.

### 결정

1. **Team은 저장하지 않는다.** Team = 해당 Event의 활성 Assignment 집합을 EventRole별로 그룹한 **projection(계산값)**. "Recommended Team / Selected Team / Confirmed Team"은 별도 객체가 아니라 Assignment 상태에 대한 필터다.
2. **추천 결과의 저장소는 `RecommendationRun` append-only 로그 하나다.** 추천 실행마다 입력 조건과 후보 목록을 JSON으로 기록한다(추천 품질 분석용). 도메인 aggregate가 아니다.
3. **`Suggested` 상태는 두지 않는다.** Assignment는 Buyer가 Team Builder에서 사람을 담는 순간 `Selected`로 생성된다. 교체 후보 목록은 일시적 쿼리 결과 + 로그일 뿐 Assignment 행을 만들지 않는다.
4. **Crew 엔티티는 없다.** MVP에서는 Event당 leader형 EventRole을 최대 1개로 제한하고, Leader의 출결 권한은 행사 전체다.

### 근거

- 팀 총액, 팀 확정 여부 등 "Team이 필요해 보이는" 요구는 전부 Booking + PriceSnapshot + Assignment 상태에서 파생된다. 저장하면 두 번째 진실의 원천이 생긴다.
- 기획서 §8의 Team Builder UI에서 추천 인력은 이미 "현재 선택" 상태로 나타난다. 추천이 곧 Selected Assignment로 물질화되는 흐름과 일치한다.

### 검토한 실패 시나리오

- **이중 기록 드리프트**: 추천 결과를 Suggested Assignment와 로그 양쪽에 저장하는 안을 검토했다. 추천 1차 실행 후 2명이 거절해 재추천하면, "Suggested = 추천 팀" projection에 1차 잔여물과 2차 후보가 섞인다. → Suggested 상태를 제거하고 로그 단일화로 해소. 부수 효과로 행 폭증(Role 8개 × 후보 3명 × 실행 횟수)도 사라진다.
- **다중 Leader 대형 행사**: 40명 행사에 Zone별 Leader 3명이 필요한 경우 Leader와 담당 프로모터의 연결(출결 권한, Leader→Promoter 리뷰 범위)이 정의되지 않는다. → MVP 제약(leader Role 1개)으로 봉인하고 업그레이드 경로를 고정: EventRole에 nullable `supervisor_role_id` 자기참조 컬럼 1개(프로모터 Role이 자기 Leader Role을 가리킴). Crew 엔티티는 그때도 만들지 않는다.

### 모델 영향

- 엔티티 추가: `RecommendationRun`(로그). 엔티티 제외: Team, Crew.
- Assignment 상태기계는 `Selected`에서 시작한다.

---

## D2. Booking ↔ Assignment — 개인 단위 계약과 행사 단위 컨테이너

### 질문 (기획서 §30)

Booking은 행사 단위의 거래/확정 상태이고 Assignment는 특정 Promoter가 특정 Event Role에 배정된 관계로 볼 수 있다. Replacement는 새로운 Assignment인가.

### 결정

1. **Assignment가 핵심 상태기계를 소유한다.** Assignment = Worker 1명 ↔ EventRole 정원 1자리. Role이 요구조건의 granularity이므로 자리별 식별자(Slot 엔티티)는 두지 않는다 — 같은 Role의 자리들은 정의상 상호 교환 가능하고, 자리마다 조건이 달라야 한다면 그것은 새 EventRole이다.
   `Selected → Requested → Accepted | Declined | Expired`, `Accepted → Confirmed → Completed | NoShow | Cancelled`, 요청 전 제거는 `Selected → Removed`.
2. **응답기한의 실체는 Assignment의 `expires_at`이다.** Booking에는 기한 정책(예: 일반 24h/임박 3h)만 두고, 구체 시각은 Requested 진입 시 Assignment에 찍는다. 요청 시점이 제각각인 추가 요청(어제 Role A, 오늘 Role B)에 Booking 단위 기한은 성립하지 않기 때문이다.
3. **`Replaced` 상태는 없다.** 대체 투입은 `replaces_assignment_id`를 가진 **새 Assignment**다. "대체됨"이라는 사실은 자기를 가리키는 더 새로운 Assignment의 존재에서 파생된다(한 사실, 한 저장소). 원 Assignment의 종결 상태는 `NoShow` 또는 `Cancelled` 그대로 남는다. 기획서 §18 Attendance의 'Replaced'는 표시 라벨로만 쓴다.
4. **Booking = Event당 활성 1개인 거래 컨테이너.** 첫 Booking Request 시 생성되고, 거절/만료로 재오픈된 자리의 새 Assignment도 같은 Booking 아래에 생긴다. 취소된 Booking은 이력으로 남고 재예약 시 새 Booking을 만든다(활성 1개 제약은 부분 유니크).
5. **Booking 상태는 순수 파생이다. 명시적 명령은 `Cancel` 하나뿐이다.** Requested / PartiallyAccepted / Confirmed / Completed는 자식 Assignment 상태에서 계산하고, 어느 규칙에도 걸리지 않으면 fallback **`Open`**(재충원 필요)이다 — 파생에 빈 구간이 없다. 충원 현황의 정량 뷰(required/accepted/requested/remaining)는 별도 상태 enum이 아니라 숫자 projection으로 계산한다.
6. **대체 탐색은 경량 `ReplacementRequest` 엔티티로 기록한다.** `Open → Matched → Fulfilled | Failed | Cancelled`. **성공(Fulfilled)의 정의는 수락이 아니라 현장 Check-in이다** — Buyer가 산 것은 "갈게요"가 아니라 도착이므로, 수락 후 오지 않는 대체자가 Replacement Success Rate를 왜곡하지 못한다. 후보에게 보낸 요청은 `replacement_request_id`를 가진 Assignment로 생성되어 거절/만료된 후보까지 깔때기 전체가 추적된다. 탐색이 실패해도 도메인 기록이 남아야 하고(§25가 KPI), §26이 Replacement Request를 MVP에 포함하기 때문이다. §23.5의 Dispatched는 선택 단계로 접고, Arrived가 곧 Fulfilled다.

### 검토한 실패 시나리오

- **부분 수락 교착**: 8명 요청, 6명 수락, 2명 거절, 대안 후보 없음, Buyer가 "6명으로 진행" 결정. 순수 파생 상태는 Buyer 의사("충원 중" vs "이대로 확정")를 읽을 수 없어 영원히 Confirmed에 도달하지 못한다. → Buyer의 행위를 상태 오버라이드가 아니라 **EventRole의 "미충원 마감" 명령**(`closed_unfilled_count` +2, `required_count`는 최초 수요로 불변)으로 모델링. 파생 로직이 "유효 정원(8−2=6) 충족"을 계산해 Confirmed에 도달한다. 파생의 순수성이 유지되고 최초 수요가 보존되어 Original Fill Rate(6/8=75%)와 Final Coverage(6/6=100%)를 둘 다 계산할 수 있다. required_count를 직접 8→6으로 고치면 "처음부터 6명을 원했던 행사"가 되어 수요 데이터가 파괴된다 — v0.1의 해법을 이 이유로 폐기했다.
- **전 후보 거절/만료로 활성 0**: required=3에서 후보 전원이 Declined/Expired 되면 Requested=0, Accepted=0 — v0.1 규칙표에는 이 조합이 걸리는 상태가 없었다(파생 갭). fallback `Open`이 빈 구간을 구조적으로 제거한다.
- **확정 후 이탈**: Confirmed 후 1명이 취소하면 Booking은 PartiallyAccepted/Open으로 회귀한다. "거래가 확정되었다"는 사실은 **Event.Confirmed가 latch로 이미 보존**하므로(Event 상태는 회귀하지 않는다) Booking에 별도 lifecycle을 두어 Confirmed를 이중화하지 않는다. Event=Confirmed + Booking=Open은 정확히 "확정된 행사, 재충원 중"으로 읽힌다.
- **No-show → 대체 체인**: A가 NoShow → B 투입(B.replaces=A) → B가 중도 이탈 → C 투입(C.replaces=B). 링크 체인으로 자연 기록된다. 이 시나리오에서 "A = NoShow이면서 Replaced"라는 종결 상태 충돌이 드러나 `Replaced` 상태를 삭제했다.
- **취소 후 재예약**: Buyer가 Booking 전체 취소 후 다음 날 같은 행사를 재예약. "활성 1개" 부분 유니크 아래에서 취소 Booking은 이력으로 보존되고 리뷰·정산이 올바르게 매달린다. Declined 이력이 있는 Worker에게 재요청도 가능하다(유니크는 활성 행 기준).

### 모델 영향

- 엔티티 추가: `ReplacementRequest`. Assignment에 `expires_at`, `replaces_assignment_id`, `replacement_request_id` 필드. EventRole에 `closed_unfilled_count`(증가 전용, 유효 정원 = required_count − closed_unfilled_count).
- Booking에는 상태 컬럼 대신 파생 규칙(+ 명시적 Cancelled 플래그)을 둔다. 상세 규칙은 [도메인 모델 §6](02-domain-model.md)에.

---

## D3. Promoter ↔ Leader — 단일 Worker, Leader는 자격

### 질문 (기획서 §30, Appendix B)

한 사람이 Promoter이면서 Leader Certification을 가질 수 있다면 공통 User 또는 Worker 개념 아래 Capability로 설계할 수 있는가. Buyer를 User 하위 타입으로 둘지 Organization 단위로 둘지.

### 결정

1. **User 1 — 0..1 WorkerProfile, 1 — 0..1 BuyerProfile.** 공급자 프로필은 하나다. Promoter는 Worker의 기본 활동이고, **Leader는 Worker가 보유한 LeaderCertification(L1~L3) 자격**이다. 별도 User Type이 아니다.
2. **행사 내 Leader = kind=leader인 EventRole에 대한 Assignment.** 따라서 출결, 가격(Leader Fee = 해당 Assignment 스냅샷의 자격 프리미엄 라인), 리뷰(§19의 4방향)가 프로모터와 같은 메커니즘으로 처리된다. Leader 전용 배정·정산 장치가 필요 없다.
3. **가드 규칙**: leader형 Role의 배정자는 활성 LeaderCertification ≥ Role 요구 레벨이어야 한다. 레벨별 관리 인원 한도(L1: 5명 이하 등)는 선택 시점 검증 규칙이다.
4. **Buyer 조직은 BuyerProfile의 문자열 필드로 시작한다.** Organization 엔티티는 보류 — 정산/세금계산서 자동화가 기획서 §26에서 post-MVP이므로 지금 필요하지 않다. 단, **가장 먼저 올 마이그레이션 후보다. 도입 트리거: 같은 조직의 두 번째 담당자 계정이 필요해지는 순간**(BTL 대행사의 복수 AE). 경로: Organization + OrganizationMember 추가, BuyerProfile에 FK, 기존 데이터는 organization_name 그룹핑으로 backfill.

### 검토한 실패 시나리오

- 같은 사람이 어떤 행사에선 Promoter, 다른 행사에선 Leader → Role kind가 다른 Assignment일 뿐. 충돌 없음.
- Leader가 행사를 발주하는 Buyer가 되는 경우 → 한 User가 WorkerProfile과 BuyerProfile을 모두 보유. 충돌 없음.
- L1 자격자가 15명 행사의 Leader로 선택되는 경우 → 구조 문제가 아니라 선택 시점 검증(가드 규칙 3).

### 모델 영향

- 엔티티 제외: Leader(개념은 Certification + Role kind로 흡수). EventRole에 `kind: promoter | leader`.
- 커리어 전환(기획서 §15 Career Path)은 Certification 발급 이력으로 자연 표현된다.

---

## D4. Grade ↔ Certification — 분리

### 질문 (기획서 §30)

Professional Grade는 신뢰도/경력 수준이고 Certification은 특정 역할이나 능력을 수행할 수 있는 자격이므로 분리 가능성이 높다.

### 결정

1. **분리한다.** Grade = 플랫폼이 산정하는 P1~P4, Worker의 속성. Certification = 검증된 자격(Leader L1~L3, 검증 Skill), 별도 엔티티에 Worker와 M:N(`granted_at` / `revoked_at`).
2. **Grade는 `GradeHistory`로 유효기간 이력을 보존하고, 각 행에 산정 근거 입력값(JSON: reliability 값, 누적 완료 행사 수, 평가 지표 등)을 함께 저장한다.** Grade가 Base Rate를 결정하므로 "3개월 전 이 단가가 왜 24,000/h였나"에 답할 수 있어야 한다. 주기적 스냅샷만으로는 승급 시점과 어긋난다.
3. **자가신고 Skill 태그 ≠ Certification.** 태그는 검색용 소프트 필터일 뿐이다. **Capability Premium은 Certification에만 붙는다.** 프리미엄이 걸리는 EventRole 요구조건은 Certification 타입을 참조한다(태그 매칭으로 프리미엄이 새는 것을 차단).
4. **Reliability는 엔티티가 아니라 계산값이다.** 주기적 `ReliabilitySnapshot` 로그로 추이만 남긴다. 산식은 Phase 1에서 정의한다.

### 검토한 실패 시나리오

- **정산 감사**: 행사 3개월 후 분쟁 — 스냅샷은 "P3 base 24,000"이라 말하지만, 동결 시점에 실제 P3였는지·무엇으로 산정됐는지는 GradeHistory + 산정 근거 저장이 답한다.
- **태그-자격 혼동**: Role이 "English"를 요구할 때 자가신고 태그가 검색에 걸리고 프리미엄은 인증에만 붙는 경계가 흐려지는 문제 → 결정 3으로 차단.
- **예약 중 자격 취소**: Confirmed Assignment의 스냅샷에 이미 포함된 프리미엄은 유지된다(동결 시점의 계약). 자격 취소는 활성 Assignment에 대한 운영 플래그를 세울 뿐 모델을 바꾸지 않는다.

### 모델 영향

- 엔티티: `GradeHistory`, `Certification` + `WorkerCertification`(join), `ReliabilitySnapshot`(로그).
- WorkerProfile에 자가신고 skill 태그 배열(인라인).

---

## D5. Price — 정책 테이블에서 계산, Assignment에 스냅샷으로 동결

### 질문 (기획서 §30, Appendix B)

Worker Base Rate / Skill Premium / Event Assignment Premium / Assignment 최종 단가를 분리해야 가격 이력을 추적할 수 있다. Price Snapshot을 Booking 또는 Assignment 어디에 저장할지.

### 결정

1. **가격의 정의는 버전 관리되는 `PricingPolicy`에 산다.** Grade→Base Rate 테이블, Certification Premium, Assignment Premium 규칙. 수치는 시장 검증에 따라 바뀌므로(기획서 §9 "정책 가설") 버전 없이는 과거 거래를 설명할 수 없다.
2. **Team Builder 중에는 실시간 견적**(저장 없음, 표시용). **Booking Request 시점에 Assignment마다 불변 `PriceSnapshot`을 동결한다.**
3. **스냅샷은 라인아이템 구조다**: `(type, unit_rate, planned_qty, amount)` + `policy_version` + 적용 Grade. base / capability premium / assignment premium / fixed allowance가 각각 라인이다. 단가와 수량을 분리 저장하므로 **정산 = 동결 단가 × Attendance 실적 + 고정수당** — 연장 근무, 중도 이탈, 부분 근무가 모델 변경 없이 정산된다.
4. **Booking 총액 = 활성 Assignment 스냅샷의 합계**(파생값). 요청 시점이 달라 정책 버전이 섞여도 무해하다 — 스냅샷이 Assignment 단위이기 때문이다.
5. **Replacement Assignment는 자기 스냅샷을 새로 동결한다**(Emergency Premium 라인 포함). 원 Assignment의 스냅샷은 건드리지 않는다.
6. **MVP 규칙: 첫 Booking Request 이후 행사 일정/장소는 변경 불가.** 변경 = 취소 후 재요청. 스냅샷 불변성과 충돌하는 유일한 케이스(행사 시간 연장 등)를 봉인한다. V2 경로: Assignment↔스냅샷을 1:N으로 풀고 supersede 체인(현재 스냅샷 1개 유지).

### 검토한 실패 시나리오

- **정책 버전 혼재**: Role A는 v3에서, 며칠 뒤 추가된 Role C는 v4에서 동결 → Assignment 단위 스냅샷이라 Booking 총액 계산에 아무 문제 없음. 이 공격은 설계가 스스로 방어한다.
- **행사 일정 변경**: Confirmed 후 18:00→22:00 연장이면 동결된 planned_qty가 틀려진다 → MVP에서는 결정 6으로 금지, V2 경로 고정.
- **정산·중도 이탈**: A가 오전 근무 후 이탈, B가 대체 → A는 자기 스냅샷의 동결 단가 × 실제 근무시간으로, B는 자기 스냅샷으로 각각 정산. 총액만 저장했다면 불가능했을 케이스가 라인아이템 구조로 해결된다. Emergency Premium을 누가 부담하는가는 §28 정책 문제로 열려 있고, 모델은 어느 답이든 수용한다.

### 모델 영향

- 엔티티: `PricingPolicy`(버전별 불변 행, effective_from/to — 갱신은 새 버전 발행), `PriceSnapshot`(Assignment당 1, Requested 진입 시 필수, PricingPolicy를 FK+version으로 참조하되 해석은 자체 라인아이템만으로 완결).
- Booking에는 총액 컬럼이 필요 없다(파생). 캐시가 필요해지면 그때 추가한다.

---

## 부속 결정

D1~D5를 검증하는 과정에서 함께 확정한 것들이다.

| # | 결정 | 비고 |
|---|---|---|
| A1 | Worker당 Event당 활성 Assignment 최대 1 | 부분 유니크. Declined는 비활성이므로 거절자가 같은 행사의 다른 Role에 긴급 투입되는 것은 가능 |
| A2 | Availability는 참고 정보로 유지, Booking 상태를 미러링하지 않는다 | 기획서 §11/§23.4의 Soft Hold·Confirmed·Working 상태 제거. 이중 진실 원천 + 동기화 버그 공장 방지 |
| A3 | 시간 충돌은 **Accept 시점에 강제**한다 | Worker의 기존 Accepted/Confirmed Assignment와 겹침 검사(트랜잭션/DB 제약 — 신뢰 경계). 추천 시점엔 필터로만. 겹치는 두 요청을 다 수락하려 하면 먼저 수락한 쪽이 이긴다 |
| A4 | 빈 자리당 동시 Requested 1건 (순차 후보) — 정원 불변식(02 I3)의 따름정리로 강제되며 별도 Slot 개념이 필요 없다 | §10.2의 Primary/Alternative 병렬 요청은 V2 (그때 불변식을 "Requested 제외 활성 ≤ 유효 정원"으로 완화) |
| A5 | Soft Hold는 MVP 보류 | §28 열린 정책으로 유지 |
| A6 | Event 상태에서 `Recruiting` 제외 | 흐름이 공개 지원이 아니라 추천 주도이므로 (§23.1 후보에서 제거) |
| A7 | MVP의 Event는 단일 근무 시간대(Single Shift)를 전제한다 | 다일 전시·교대 행사는 날짜/교대별 Event 분리로 우회. 업그레이드 경로: Event—EventShift—EventRole 계층 삽입. ERD 착수 전 재확인 대상 |

---

## 닫힘 / 열림 매핑

### 기획서 §30 — 9개 질문 전부 구조적으로 닫힘

| §30 질문 | 답 | 근거 |
|---|---|---|
| Event와 Team은 같은 객체인가 | 아니다. Team은 projection | D1 |
| Booking과 Assignment는 어떻게 다른가 | 행사 단위 컨테이너 vs 개인 단위 계약 | D2 |
| Promoter와 Leader는 별도 User Type인가 | 아니다. 단일 Worker + Certification | D3 |
| Grade와 Certification은 같은가 | 아니다. 분리 | D4 |
| Price는 어디에 귀속되는가 | 정의는 PricingPolicy, 동결은 Assignment의 PriceSnapshot | D5 |
| Review는 누구와 누구 사이에 존재하는가 | Event context 안의 (평가자, 피평가자) 쌍 — 양쪽 다 Assignment 또는 Buyer로 특정 | 구조는 닫힘, 평가 항목 매트릭스는 Phase 2 |
| Availability와 Booking의 충돌 방지 | Accept 시점 겹침 검사 (Availability는 참고 정보) | A2, A3 |
| Replacement는 새로운 Assignment인가 | 그렇다. `replaces_assignment_id` 링크, Replaced 상태는 없음 | D2 |
| Leader의 관리 대상은 Event인가 Team인가 | MVP: 행사 전체 (leader Role 1개 제한). 다중 Crew는 `supervisor_role_id` 경로만 고정 | D1 |

### 기획서 Appendix B — 9개 중 8개 닫힘

| Appendix B 항목 | 결론 |
|---|---|
| Buyer를 User 하위로 둘지 Organization으로 둘지 | User + BuyerProfile, 조직명은 문자열. Organization 보류 (D3) |
| Promoter/Leader를 Entity로 둘지 Qualification으로 둘지 | Qualification (D3) |
| Team을 영속 Entity로 둘지 계산할지 | 계산 — projection (D1) |
| Recommendation 결과 저장 여부 | RecommendationRun 로그로 저장, 도메인 아님 (D1) |
| Price Snapshot 저장 위치 | Assignment에 라인아이템, Booking은 합계 파생 (D5) |
| Reliability를 Entity로 둘지 계산값으로 둘지 | 계산값 + 스냅샷 로그 (D4) |
| Event Role ↔ Assignment Cardinality | 시간축으로 1:N, 활성 수 ≤ required_count (D2) |
| 동일 Promoter의 복수 Role 수행 | MVP: 불가 (A1). 이후 시간대 비겹침 조건으로 완화 가능 |
| Leader 1명의 복수 Crew 관리 | **유일한 잔여 항목.** 업그레이드 경로만 고정(supervisor_role_id), 결정은 보류 (D1) |

### 기획서 §28 — 구조는 닫힘, 수치는 열림

이번에 닫힌 구조: Partial Accept 처리(미충원 마감 — 최초 수요 보존), 응답기한 메커니즘(Assignment.expires_at + Booking 정책), 동시 후보 요청 수(MVP 빈 자리당 1).

열림 유지 → 후속 단계로:

| 열린 항목 | 다루는 곳 |
|---|---|
| Base Rate 수치, 승급 규칙, Skill/Emergency Premium 금액, Platform Fee, 가격 공개 범위 | Phase 1 — Pricing Rule Table |
| 취소 정책 전부, No-show 정의·지각 기준·비용부담 주체·이의신청 | Phase 1 — Cancellation/No-show Policy |
| Soft Hold 여부, 응답기한 수치 | Phase 1 |
| Contact/In-App Chat 범위, Chat 유지기간, 직거래 약관 | Phase 2 이후 (기획서 §14 유지) |
| Leader 자격 취득 조건, Level 기준, Leader Fee | Phase 1~2 |
| Review 공개 범위, 익명성, 수정 기간, 허위 Review 처리 | Phase 2 — Review Matrix |
