# 프로모터 플랫폼 서비스 기획서
> Version 0.1  
> 목적: 프로모터 행사 인력 시장의 기존 에이전시 기능을 디지털 플랫폼으로 재구성하고, 향후 도메인 모델 및 PRD 설계를 위한 기준 문서로 사용한다.

---

## 0. 문서의 목적

본 문서는 현재까지 논의된 프로모터 플랫폼의 사업 아이디어와 서비스 구조를 정리한 초기 기획서다.

이 문서의 주요 목적은 다음과 같다.

1. 플랫폼이 해결하려는 시장 문제를 명확히 정의한다.
2. Buyer, Promoter, Leader 간 역할과 관계를 정리한다.
3. 행사 생성부터 추천, 예약, 행사 진행, 평가까지의 전체 비즈니스 흐름을 정의한다.
4. 가격, 승인, No-show, 연락, 관리자 제도 등 주요 운영 정책을 정리한다.
5. 향후 Domain Model, API, 화면, 데이터 모델을 설계할 수 있도록 핵심 비즈니스 개념과 상태를 드러낸다.
6. 아직 검증되지 않은 시장 가설과 추가 결정이 필요한 항목을 분리한다.

현재 단계에서는 세부 UI나 기술 아키텍처보다 **서비스의 비즈니스 규칙과 핵심 객체를 정의하는 것**에 집중한다.

---

# 1. 서비스 개요

## 1.1 배경

현재 행사 프로모터 시장은 대략 다음과 같은 참여자들로 구성된다.

- 광고주 / 대기업
- 종합 광고대행사
- BTL / 행사 대행사
- 프로모터 에이전시
- 현장 관리자
- 프로모터

전통적인 에이전시는 프로모터를 정규 직원으로 고용하기보다는 별도의 인력 Pool을 관리하면서 행사별로 적합한 인력을 섭외한다.

실제 운영 과정에서는 다음과 같은 업무가 발생한다.

- 프로모터 모집 및 Pool 관리
- 사진 / 경력 / 특성 기반 인력 추천
- 일정 확인
- 인력 확정
- 행사 안내 전달
- 현장 인력 배치 및 역할 조정
- 프로모터 출결 및 태도 관리
- 행사 중 요청사항 전달
- No-show / 결원 발생 시 대체 인력 확보
- 행사 종료 후 정산
- 반복적으로 우수 인력을 재섭외

현재 이러한 업무의 상당 부분은 오픈채팅, 전화, 개인 연락처, Excel 및 에이전시 담당자의 경험에 의존한다.

---

## 1.2 문제 정의

현재 시장의 핵심 문제를 단순히 "중간 수수료가 높다"라고 정의하지 않는다.

플랫폼이 해결하려는 보다 근본적인 문제는 다음과 같다.

### Problem 1. 인력 정보의 비표준화

프로모터의 경력, 능력, 실제 행사 수행 이력, 출결 신뢰도 등이 구조화된 데이터로 축적되지 않는다.

### Problem 2. 가격의 불투명성

행사비와 인력비가 명확히 구분되지 않는 경우가 많으며, 프로모터 입장에서도 경력이나 역량이 단가 상승으로 연결되지 않는 문제가 존재한다.

### Problem 3. 인력 선정 과정의 비효율

Buyer가 원하는 인력을 찾기 위해 담당자에게 요구사항을 전달하고, 사진과 프로필을 반복적으로 전달받아 사람을 교체하는 과정이 발생한다.

### Problem 4. 운영 품질의 개인 의존

인력 관리와 현장 문제 해결이 특정 에이전시 담당자 또는 관리자 개인의 역량에 의존한다.

### Problem 5. 경력 축적에 따른 공급자 성장 구조 부족

프로모터가 많은 행사에 참여하고 좋은 평가를 쌓아도 해당 경험이 구조화된 신뢰도, 등급, 단가 상승으로 직접 연결되지 않는다.

---

# 2. 서비스 비전

## 2.1 핵심 정의

이 플랫폼은 단순히 행사 인력을 검색하거나 구인 공고를 올리는 서비스가 아니다.

> **Buyer가 행사 조건을 입력하면 플랫폼이 적합한 프로모터 팀을 구성하고, Buyer가 해당 팀을 편집·확정한 뒤, 행사 운영과 평가까지 관리하는 행사 전문 인력 구성 플랫폼이다.**

핵심 서비스 단위는 단일 프로모터가 아니라 **Event Team**이다.

매칭의 기본 경로는 플랫폼 추천이다. 여기에 보완 채널로 **공개 모집**을 지원한다(2026-08-08 하이브리드 확장, [D6](docs/domain/01-boundary-decisions.md)): Buyer는 특정 역할을 공개 게시할 수 있고, 프로모터가 지원하면 Buyer의 승인으로만 계약이 성립한다. 이는 구인 게시판이 아니다 — 공고는 독립된 게시물이 아니라 역할의 모집 속성이며, 지원자도 승인되는 순간 추천으로 선택된 인력과 동일한 팀 구성·확정·운영·평가 파이프라인에 합류한다. 핵심 서비스 단위가 Event Team이라는 정의는 변하지 않는다.

---

## 2.2 핵심 가치

### Buyer 관점

- 사람을 일일이 찾지 않아도 된다.
- 행사 조건에 맞는 인력 조합을 추천받을 수 있다.
- 인력을 교체하면서 가격 변화를 즉시 확인할 수 있다.
- 프로모터의 경력과 평가를 비교할 수 있다.
- 관리자가 필요한 경우 인증된 Leader를 함께 구성할 수 있다.
- 행사 전후 연락과 일정 안내를 플랫폼에서 관리할 수 있다.
- No-show 발생 시 대체 인력을 요청할 수 있다.

### Promoter 관점

- 본인의 프로필과 경력을 하나의 자산으로 축적할 수 있다.
- 좋은 근무 이력이 실제 등급과 단가 상승으로 연결된다.
- 특정 Skill 인증을 통해 더 높은 단가의 행사에 접근할 수 있다.
- 관리자 인증을 통해 별도의 Career Path를 만들 수 있다.
- 계약 내용과 실제 업무가 다른 경우 Leader를 통해 권리를 주장할 수 있다.
- 플랫폼 내 공식 경력과 평가를 계속 축적할 수 있다.

### Platform 관점

플랫폼은 시간이 지나면서 다음 데이터를 축적한다.

- 어떤 사람이 어떤 행사에 잘 맞는가
- 어떤 사람이 실제로 신뢰도가 높은가
- 어떤 Buyer가 어떤 유형의 인력을 반복적으로 선택하는가
- 어떤 역할이 어떤 가격에 거래되는가
- 어떤 행사에서 No-show 위험이 높은가
- 어떤 Leader가 어떤 규모의 팀을 안정적으로 관리하는가

장기적으로 이 데이터가 Recommendation 및 Pricing 품질을 높이는 핵심 자산이 된다.

---

# 3. 주요 Actor

## 3.1 Buyer

행사에 필요한 프로모터 인력을 구매하거나 구성하는 주체.

초기 주요 대상은 다음과 같은 조직을 가정한다.

- BTL 대행사
- 행사 대행사
- 광고대행사
- 브랜드 행사 담당 조직
- 기업 마케팅 / 행사 담당자

Buyer는 다음 업무를 수행한다.

- Event 생성
- 행사 요구사항 입력
- 추천 Team 확인
- 프로모터 교체
- Leader 선택
- Booking Request
- 행사 관련 요구사항 전달
- 행사 종료 후 평가

---

## 3.2 Promoter

행사에서 실제 업무를 수행하는 공급자.

프로필에는 최소 다음 정보가 존재할 수 있다.

- 기본 프로필
- 프로필 사진 / Portfolio
- 행사 경력
- Skill
- Certification
- Professional Grade
- Availability
- Review
- Reliability
- 선호 행사 유형
- 활동 가능 지역

Promoter는 본인의 가용일정을 등록한다.

가용 상태는 단순 참고 정보이며, Buyer가 선택했다고 자동으로 근무가 확정되지는 않는다.

최종 Booking은 Promoter의 승인 후 확정된다.

---

## 3.3 Leader

프로모터 인력을 대표하고 행사 현장의 인력 운영을 담당하는 공급자.

Leader는 행사 전체를 기획하거나 책임지는 Event Manager와 구분한다.

Leader의 기본 역할은 다음과 같다.

- 프로모터 출결 확인
- 지각 / 이탈 관리
- 휴게시간 조정
- 계약된 범위 안에서 역할 배치 및 변경
- Buyer 요청사항을 Promoter에게 전달
- Promoter의 문제를 Buyer에게 전달
- 계약 외 업무 요청이 발생할 경우 Promoter 입장을 대변
- No-show 발생 시 플랫폼에 Replacement 요청
- 현장 인력 관련 Incident 기록

Leader 역시 플랫폼 내 공급자이며 별도의 인증 과정을 통해 자격을 획득한다.

---

# 4. 행사 중심 서비스 구조

서비스의 중심 객체는 `Event`다.

Event를 생성하면 행사에 필요한 인력 요구사항이 정의되고, 이 요구사항을 기준으로 Event Team이 구성된다.

```text
Event
  │
  ├─ Event Requirement
  │
  ├─ Event Role
  │
  ├─ Recommended Team
  │
  ├─ Selected Team
  │
  ├─ Leader
  │
  ├─ Booking
  │
  ├─ Assignment
  │
  ├─ Event Communication
  │
  ├─ Attendance / Incident
  │
  └─ Review
```

---

# 5. Event 생성

Buyer는 행사 생성을 통해 필요한 인력 조건을 입력한다.

## 5.1 기본 정보

예시:

- 행사명
- 행사 유형
- 브랜드
- 날짜
- 시작 시간
- 종료 시간
- 장소
- 필요 인원수

---

## 5.2 원하는 인력 조건

Buyer는 행사에 필요한 프로모터의 특성을 정의한다.

예:

- 원하는 이미지 / 분위기
- 행사 경험
- 특정 산업 경험
- 언어
- Product Demo 능력
- VIP 응대 경험
- MC 가능 여부
- 특정 Skill
- 필요 인원

여기서 "원하는 모델상"은 단순 외모 등급이 아니라 포트폴리오와 행사 적합도를 판단하기 위한 조건으로 다룬다.

---

# 6. Event Role

하나의 행사에서 모든 프로모터가 동일한 일을 수행한다고 가정하지 않는다.

Event 내부에서 여러 Role을 구성할 수 있다.

예:

```text
Event: 자동차 신제품 런칭

Reception
- 2명
- P2 이상

Product Zone
- 3명
- P3 이상
- 자동차 행사 경험
- Product Demo Skill

VIP Zone
- 2명
- P3 이상
- VIP Skill
- English Skill

Floating
- 1명
- P1 이상
```

이 구조를 사용하면 Recommendation은 단순 상위 점수 인력 N명을 추천하는 것이 아니라 **Role Requirement를 충족하는 Team Composition 문제**가 된다.

---

# 7. Recommendation

## 7.1 목적

Event와 Event Role 조건을 기반으로 현재 가용한 Promoter 중 적합한 인력 조합을 추천한다.

---

## 7.2 추천 시 고려 가능한 데이터

- Availability
- 행사 경력
- 산업 경험
- Skill
- Professional Grade
- Reliability
- Buyer Review
- Leader Review
- Rehire History
- 활동 지역
- 예상 비용

추천 알고리즘은 향후 고도화 대상이며, MVP에서는 Rule 기반으로 시작할 수 있다.

---

## 7.3 추천 결과

Recommendation의 결과는 단순한 검색 목록이 아니라 **Recommended Team**이다.

예:

```text
Recommended Team

Reception
[A] [B]

Product Zone
[C] [D] [E]

VIP
[F] [G]

Floating
[H]

Leader
[L1]
```

---

# 8. Team Builder

Team Builder는 플랫폼의 핵심 UX다.

Buyer는 추천된 Team에서 특정 Promoter를 다른 후보로 교체할 수 있다.

예:

```text
현재 선택

[C] 김OO
Match: High
Price: 248,000

교체 후보

[C-1] 박OO
Price: 216,000

[C-2] 이OO
Price: 264,000

[C-3] 최OO
Price: 232,000
```

Buyer가 인력을 교체할 경우 전체 예상 비용이 실시간으로 갱신된다.

Team Builder의 핵심 목적은 기존 에이전시에서 전화, 메신저, 사진 전달을 반복하며 수행하던 인력 교체 프로세스를 플랫폼 UX로 변환하는 것이다.

---

# 9. Pricing Model

가격은 하나의 단순 시급으로 정의하지 않는다.

가격의 성격을 분리한다.

## 9.1 Layer 1. Professional Grade

공급자의 장기적인 경험과 신뢰 수준에 따른 기본 단가.

예시:

| Grade | 의미 | 예시 Base Rate |
|---|---|---:|
| P1 | Starter | 20,000/h |
| P2 | Verified | 22,000/h |
| P3 | Professional | 24,000/h |
| P4 | Senior | 27,000/h |

※ 숫자는 정책 가설이며 시장 검증 후 조정한다.

등급은 단순 행사 참여 횟수만으로 결정하지 않는다.

고려 요소:

- 누적 완료 행사
- 누적 근무시간
- No-show
- 지각률
- Buyer 평가
- Leader 평가
- Rehire Rate

---

## 9.2 Layer 2. Capability Premium

개인이 보유한 검증 Skill에 대한 추가 보상.

예:

- English
- Chinese
- VIP
- Product Demo
- Luxury Brand Experience
- Automotive
- MC
- 기타 전문 Skill

일부 Skill은 추가 단가와 직접 연결될 수 있다.

---

## 9.3 Layer 3. Assignment Premium

이번 행사 자체의 난이도나 특수 조건에 대한 보상.

예:

- Emergency
- Night Shift
- Holiday
- Long Distance
- Long Hours
- Special Costume
- Training
- Rehearsal

---

## 9.4 Fixed Allowance

시간 단가로 계산하기 어려운 일회성 추가 업무는 별도로 계산한다.

예:

- 사전 교육비
- Fitting
- 장거리 이동
- 숙박
- 특정 준비 활동

---

## 9.5 Usage / Talent Fee

초상, 광고 콘텐츠, SNS 콘텐츠 등 노동시간과 별도의 사용가치가 발생하는 경우 별도 비용 정책을 둔다.

이는 일반적인 프로모터 인력비와 분리한다.

---

# 10. Booking

## 10.1 기본 원칙

Buyer가 Promoter를 선택해도 자동으로 Booking이 확정되지 않는다.

Promoter는 해당 행사 정보를 검토하고 승인하거나 거절할 수 있다.

```text
Buyer Team 구성
      ↓
Booking Request
      ↓
Promoter Review
      ↓
Accept / Decline
      ↓
전원 승인
      ↓
Booking Confirmed
```

---

## 10.2 거절 또는 미응답

특정 Promoter가 거절하거나 정해진 시간 안에 응답하지 않는 경우 해당 Slot은 다시 Open 상태가 된다.

플랫폼은 해당 Role에 맞는 Alternative Candidate를 다시 추천한다.

향후 다음 개념을 도입할 수 있다.

- Primary Candidate
- Alternative Candidate

---

## 10.3 Booking 응답기한

응답기한은 행사까지 남은 기간에 따라 다르게 설정할 수 있다.

예:

- 일반 행사: 24시간
- 임박 행사: 3시간
- Emergency: 별도 정책

정확한 시간은 운영 데이터 축적 후 조정한다.

---

# 11. Availability

Promoter는 본인의 활동 가능 일정을 등록한다.

Availability는 최소 다음 상태를 고려할 수 있다.

```text
Available
Soft Hold
Confirmed
Working
Completed
Unavailable
```

Recommendation 단계에서는 `Available` 상태의 Promoter만 추천 대상으로 본다.

Team Builder 중 특정 Promoter를 Buyer가 선택했을 때 일정 시간 Soft Hold를 적용할지는 추가 결정이 필요하다.

---

# 12. 행사 전 확인

Booking이 Confirmed 되었더라도 No-show 위험을 줄이기 위해 행사 전 재확인 절차를 둔다.

예:

### D-3

```text
행사가 3일 남았습니다.

[참여 확정]
[참여 불가]
```

### D-1

```text
내일 행사입니다.

[최종 확인]
```

일정 시간까지 최종 확인하지 않은 Promoter는 Attendance Risk 상태로 전환할 수 있다.

---

# 13. No-show 및 Replacement

No-show 정책의 목표는 단순 처벌이 아니다.

핵심 목표는 다음이다.

> **No-show가 발생해도 Buyer가 직접 대체 인력을 찾지 않도록 한다.**

---

## 13.1 Prevention

행사 전 Confirmation을 통해 위험을 사전에 발견한다.

---

## 13.2 Attendance Risk

D-1 또는 지정 시점까지 확인하지 않은 경우 내부적으로 Risk Flag를 설정한다.

이 시점에서 플랫폼은 Backup Candidate를 사전 탐색할 수 있다.

---

## 13.3 Event Day Check-in

Leader 또는 플랫폼을 통해 출석을 기록한다.

예:

```text
Promoter Status

Arrived
Late
No Contact
Absent
```

---

## 13.4 Replacement Request

Leader가 No-show 또는 긴급 결원을 확인하면 플랫폼에 Replacement를 요청할 수 있다.

플랫폼은 다음 조건을 기반으로 긴급 후보를 탐색한다.

- 현재 Available
- 해당 행사장까지 이동 가능
- 해당 Role 수행 가능
- 필요한 Skill 보유
- 즉시 출발 가능

---

## 13.5 Emergency Premium

긴급 대체 근무는 Assignment Premium을 적용할 수 있다.

예:

```text
Base Rate          24,000/h
Emergency Premium  +6,000/h
Total              30,000/h
```

---

## 13.6 Emergency Availability

Promoter가 별도의 긴급 호출 가능 상태를 설정할 수 있다.

예:

```text
Emergency Availability: ON
```

이를 통해 긴급 Replacement 전용 공급자 Pool을 구성할 수 있다.

---

## 13.7 No-show Penalty

No-show 발생 시 단순 별점이 아니라 Reliability에 영향을 준다.

가능한 조치:

- Reliability 하락
- Booking 제한
- Premium Event 접근 제한
- Grade 승급 제한
- Manager Certification 제한
- 반복 발생 시 계정 정지

단, 불가항력 상황에 대한 이의신청 절차가 필요하다.

---

# 14. Contact Policy

Buyer와 Promoter의 직접 연락은 플랫폼 이탈과 직거래 위험을 발생시킨다.

따라서 Contact Policy는 핵심 운영 정책이다.

---

## 14.1 기본 원칙

예약 전에는 개인 연락처를 공개하지 않는다.

Buyer가 확인할 수 있는 정보:

- Profile
- Portfolio
- Career
- Skill
- Grade
- Rating
- Availability
- Price

공개하지 않는 정보:

- 전화번호
- 이메일
- 개인 SNS / 메신저 ID

---

## 14.2 Booking 이후

Booking 이후에도 개인 전화번호 공개를 기본값으로 두지 않는다.

가능한 방식:

- In-App Chat
- Event Group Chat
- Relay Call
- 안심번호
- Leader 중심 연락

---

## 14.3 Leader가 존재하는 행사

Leader가 존재하는 경우 Buyer와 개별 Promoter의 업무 연락은 최소화한다.

```text
Buyer
  ↕
Leader
  ↕
Promoters
```

Buyer의 인력 관련 요청은 Leader를 통해 전달한다.

---

## 14.4 직거래 방지 원칙

직거래를 기술적으로 완전히 차단하는 것은 현실적으로 어렵다.

따라서 정보 차단만으로 문제를 해결하지 않는다.

플랫폼 안에서 활동해야 하는 경제적 이유를 만든다.

Promoter가 플랫폼을 벗어날 경우 잃는 가치:

- 공식 Career
- Professional Grade
- Base Rate 성장
- Review
- Reliability
- Premium Event 접근
- Manager Certification
- 정산 보호
- 분쟁 대응

Buyer가 플랫폼을 벗어날 경우 잃는 가치:

- 인력 Recommendation
- Team Builder
- 계약 관리
- Attendance
- Replacement
- 행사 History
- 평가
- 정산
- 반복 Booking 관리

---

# 15. Leader Certification

Leader는 별도 Certification을 통해 자격을 획득한다.

초기에는 Promoter가 일정 조건을 충족한 후 교육과 인증 절차를 거쳐 Leader가 되는 Career Path를 고려한다.

```text
Promoter
   ↓
Experience
   ↓
Training
   ↓
Certification
   ↓
Leader L1
   ↓
Leader L2
   ↓
Leader L3
```

---

## 15.1 Leader L1

소규모 팀 인력 운영.

예:

- 5명 이하
- Attendance
- Break
- Basic Communication
- Basic Incident Handling

---

## 15.2 Leader L2

중규모 행사 인력 운영.

예:

- 20명 이하
- Role Assignment
- Briefing
- Buyer Communication
- Replacement 요청
- Incident Handling

---

## 15.3 Leader L3

전문 인력 운영자.

예:

- 대형 행사
- Workforce Planning
- Role Design
- Staff Allocation
- Buyer에게 인력 구성 자문
- 복수 Zone 관리

L3부터는 단순 현장 관리자를 넘어 행사 특성을 분석하고 적합한 인력 운영 방식을 제안하는 전문가 역할을 할 수 있다.

---

# 16. Leader 권한 범위

Leader는 행사 전체 운영 책임자가 아니다.

Leader의 책임범위는 **인력 운영**이다.

가능한 업무:

- 계약된 Event Brief 안에서 인력 배치
- Promoter 업무 수행 확인
- Buyer 요청 전달
- Promoter 의견 전달
- 휴게시간 조정
- No-show 및 지각 보고
- Replacement 요청
- 인력 관련 Incident 기록
- 계약 범위를 벗어난 업무 요청 시 이의 제기

Leader가 행사 기획, 시설 운영, 고객사의 핵심 의사결정까지 책임지는 것은 기본 범위에 포함하지 않는다.

---

# 17. Event Communication

Booking 이후 행사 진행을 위해 플랫폼 메시지 기능을 제공한다.

예:

### 행사 전

- 행사 일정
- 집합 장소
- 복장
- 준비물
- Event Brief
- 사전 교육 안내

### 행사 당일

- 집합 알림
- Check-in
- Role 변경
- 휴게시간 안내
- 긴급 공지

### 행사 종료

- Check-out
- 정산 안내
- Review 요청

---

# 18. Attendance

행사 당일 Promoter의 실제 근무 상태를 기록한다.

가능한 상태:

```text
Scheduled
Confirmed
Arrived
Working
Break
Completed
Late
Absent
Cancelled
Replaced
```

Attendance 기록은 이후 다음 데이터에 영향을 줄 수 있다.

- Reliability
- Grade
- Review
- Payment
- No-show Penalty
- Career History

---

# 19. Review System

Review는 단순 별점 하나로 구성하지 않는다.

평가 주체에 따라 질문을 다르게 구성한다.

---

## 19.1 Buyer → Promoter

예:

- 시간 준수
- 업무 수행
- 커뮤니케이션
- 태도
- 행사 적합도
- 재고용 의사

---

## 19.2 Leader → Promoter

예:

- 시간 준수
- 지시 이해
- Teamwork
- 현장 대응
- 업무 태도

---

## 19.3 Promoter → Leader

예:

- Briefing
- 업무 배분
- 문제 대응
- 의사소통
- 공정한 인력 관리

---

## 19.4 Buyer → Leader

예:

- 현장 인력 통제
- Communication
- Problem Solving
- 요청 대응
- Replacement 대응

---

## 19.5 Promoter → Event / Buyer

예:

- 공고와 실제 업무 일치
- 휴게시간 준수
- 근무환경
- 업무 요구의 적정성
- 현장운영 품질

---

# 20. Rating과 Reliability 분리

공개 평가와 플랫폼 내부 신뢰도를 분리한다.

## Public Rating

사용자가 참고할 수 있는 공개 평가.

예:

```text
4.8 / 5.0
```

---

## Reliability

플랫폼 내부 운영에 활용되는 신뢰도.

고려 가능한 데이터:

- No-show
- Late
- Cancellation
- Completed Events
- Rehire Rate
- Buyer Rating
- Leader Rating
- Confirmation Response
- Incident History

Reliability는 Recommendation, Grade, Premium Event 접근 등에 활용할 수 있다.

---

# 21. Career System

플랫폼은 프로모터가 경력을 쌓을수록 경제적 가치가 증가하는 구조를 제공한다.

```text
행사 완료
   ↓
Career 증가
   ↓
Review / Reliability 축적
   ↓
Professional Grade 상승
   ↓
Base Rate 상승
   ↓
Premium Event 접근
```

추가 Skill을 획득하면 Capability Premium이 붙을 수 있다.

Leader Certification을 획득하면 별도의 관리자 Career Path로 진입할 수 있다.

---

# 22. 전체 Business Flow

```text
Buyer
  │
  ▼
Event Create
  │
  ▼
Event Requirement
  │
  ▼
Event Role 구성
  │
  ▼
Recommendation
  │
  ▼
Recommended Team
  │
  ▼
Team Builder
  │
  ├─ Promoter 변경
  ├─ Leader 선택
  └─ 가격 확인
  │
  ▼
Booking Request
  │
  ▼
Promoter Accept / Decline
  │
  ├─ Decline → Alternative 추천
  │
  ▼
Booking Confirmed
  │
  ▼
D-3 Confirmation
  │
  ▼
D-1 Final Confirmation
  │
  ▼
Event Day
  │
  ├─ Check-in
  ├─ Attendance
  ├─ Leader Operation
  ├─ Event Communication
  └─ Incident
  │
  ├────────────── No-show ──────────────┐
  │                                      │
  │                                      ▼
  │                             Replacement Request
  │                                      │
  │                                      ▼
  │                              Emergency Matching
  │                                      │
  └───────────────────┬──────────────────┘
                      ▼
                Event Completed
                      │
                      ▼
                   Review
                      │
                      ▼
        Career / Reliability Update
                      │
                      ▼
             Next Recommendation
```

---

# 23. 핵심 상태 모델 후보

Domain Model을 설계할 때 객체 자체뿐 아니라 상태 변화를 중요하게 본다.

## 23.1 Event

후보 상태:

```text
Draft
Recruiting
Team Building
Booking Pending
Confirmed
In Progress
Completed
Cancelled
```

---

## 23.2 Booking

후보 상태:

```text
Requested
Pending
Partially Accepted
Confirmed
Expired
Cancelled
Completed
```

---

## 23.3 Assignment

Promoter 한 명과 Event Role의 연결.

후보 상태:

```text
Suggested
Selected
Requested
Accepted
Declined
Confirmed
Cancelled
Late
No-show
Replaced
Completed
```

---

## 23.4 Availability

```text
Available
Soft Hold
Confirmed
Unavailable
```

---

## 23.5 Replacement

```text
Requested
Searching
Candidate Found
Accepted
Dispatched
Arrived
Failed
Completed
```

---

# 24. 플랫폼의 핵심 데이터 자산

플랫폼 장기 경쟁력은 단순 프로필 DB가 아니다.

## 공급자 데이터

- 실제 행사 완료 이력
- Attendance
- No-show
- Late
- Skill
- Industry Experience
- Buyer Review
- Leader Review
- Rehire
- Grade
- Reliability

## 행사 데이터

- Event Type
- Industry
- Role
- Required Skill
- Staffing Size
- Location
- Duration
- Premium 조건

## 운영 데이터

- Confirmation Rate
- Cancellation Rate
- No-show Rate
- Replacement Time
- Replacement Success Rate
- Leader Performance

## Buyer 데이터

- 반복 선택 Promoter
- 선호 Skill
- 행사 유형
- 평균 인원
- 가격 민감도
- Rebooking History

---

# 25. 핵심 KPI 후보

서비스의 성공 여부를 단순 거래액만으로 평가하지 않는다.

## Marketplace

- Event 생성 수
- Booking Conversion
- Fill Rate
- Average Team Size
- Repeat Buyer Rate

## Supply

- Active Promoter
- Availability 등록률
- Booking Acceptance Rate
- Rehire Rate

## Reliability

- No-show Rate
- Late Rate
- D-1 Confirmation Rate
- Replacement Success Rate
- Average Replacement Time

## Quality

- Buyer Rating
- Promoter Rating
- Leader Rating
- Repeat Booking Rate

## Economics

- 평균 Promoter Rate
- Average Order Value
- Platform Revenue
- Premium Assignment 비중

---

# 26. 초기 MVP 범위

초기 MVP에서는 모든 기능을 구현하지 않는다.

## MVP 포함 권장

### Promoter

- Profile
- Portfolio
- Career
- Availability
- Skill
- Basic Grade
- Booking Accept / Decline

### Buyer

- Event Create
- Event Requirement
- Role
- Recommended Team
- Team Builder
- 가격 확인
- Booking Request

### Leader

- 인증 여부
- 행사 배정
- Attendance
- Basic Incident
- Replacement Request

### Platform

- Booking
- Notification
- Review
- Reliability 기초 데이터

---

## MVP 이후

- AI Matching
- Dynamic Pricing
- Emergency Pool 자동 매칭
- 안심번호 / Relay Call
- Enterprise Dashboard
- 세금 / 정산 자동화
- 고급 Leader Certification
- Workforce Planning
- Usage Rights
- Direct Hire / 전환 정책
- 고급 Recommendation

---

# 27. 현재 합의된 주요 정책

현재 논의 기준으로 다음 방향성이 정리되었다.

### 1. Booking

Buyer가 선택한 뒤 Promoter가 직접 검토하고 승인한다.

### 2. Pricing

경력에 따른 Base Rate 상승을 유지한다.

다만 Premium은 별도로 분리한다.

```text
Professional Grade
+
Capability Premium
+
Assignment Premium
+
Fixed Allowance
+
필요 시 Usage Fee
```

### 3. No-show

처벌 중심이 아니라 Replacement 중심으로 설계한다.

### 4. Contact

예약 전 개인 연락처를 공개하지 않는다.

예약 후에도 플랫폼 내 Communication을 우선한다.

### 5. Leader

행사 전체 책임자가 아니라 프로모터 인력을 대표하는 현장 인력 관리자다.

### 6. Leader Growth

향후 전문화되면 Workforce Planning과 맞춤형 인력 운영 제안까지 확장한다.

---

# 28. 아직 결정되지 않은 문제

아래 항목은 Domain Model 및 상세 PRD 작성 전에 추가 결정이 필요하다.

## Pricing

- P1~P4 실제 Base Rate
- Grade 승급 규칙
- Skill별 Premium
- Emergency Premium
- Buyer에게 가격 세부 내역을 어디까지 공개할지
- Platform Fee 구조

## Booking

- Promoter 응답기한
- Soft Hold 적용 여부
- Partial Accept 상태 처리
- Buyer가 후보를 동시에 몇 명까지 요청할 수 있는지

## Cancellation

- Buyer 취소
- Promoter 취소
- 행사 임박 취소
- 취소 보상
- 취소 패널티

## No-show

- No-show 정의
- 몇 분 지각부터 Late인지
- Replacement 비용을 누가 부담하는지
- Emergency Premium 부담 주체
- 이의신청 방식

## Contact

- In-App Chat 범위
- 개인번호 공개 여부
- Leader 없는 행사에서 연락 방식
- 행사 종료 후 Chat 유지기간
- 직거래 약관

## Leader

- 자격 취득 조건
- Level 기준
- 최대 관리 인원
- Leader Fee
- Leader의 법적 / 계약상 권한

## Review

- 공개 정보 범위
- 익명성
- 평가 수정 가능 기간
- 허위 / 보복성 Review 처리

---

# 29. 추가 검증이 필요한 시장 가설

다음은 아직 사실로 확정하면 안 되는 가설이다.

1. 현재 프로모터 시장의 평균 기본 시급이 약 20,000원 수준으로 고착되어 있다.
2. 경력이 증가해도 시급 상승이 충분히 발생하지 않는다.
3. 고급 행사 일급 600,000~700,000원의 프리미엄은 특정 Skill, 외형적 적합성, 초상 사용, 브랜드, 업무 난이도 등 복수 요인에서 발생한다.
4. Buyer가 기존 에이전시를 이용하는 가장 중요한 이유 중 하나가 No-show 및 현장 인력 문제의 책임 이전이다.
5. Buyer와 Promoter 사이의 직접 Contact 및 플랫폼 우회거래는 서비스 수익성에 주요 위협이 된다.
6. Promoter는 공식 경력과 등급 상승이 단가 증가로 연결된다면 플랫폼 내 거래를 유지할 유인이 생긴다.
7. Leader Certification이 기존 에이전시의 현장 인력관리 역할을 일정 수준 분산 대체할 수 있다.

이 가설들은 실제 인터뷰와 거래 데이터로 검증해야 한다.

---

# 30. 도메인 모델링 시 관찰할 핵심 질문

본 문서를 읽으며 Domain Model을 설계할 때 다음 질문을 기준으로 객체와 관계를 분리한다.

### Event와 Team은 같은 객체인가?

Event는 행사 자체이고 Team은 특정 행사에 구성된 인력 조합이다.

Recommended Team과 Confirmed Team을 동일 객체의 상태로 볼지 별도 객체로 볼지 결정해야 한다.

### Booking과 Assignment는 어떻게 다른가?

Booking은 행사 단위의 거래/확정 상태이고,
Assignment는 특정 Promoter가 특정 Event Role에 배정된 관계로 볼 수 있다.

### Promoter와 Leader는 별도 User Type인가?

한 사람이 Promoter이면서 Leader Certification을 가질 수 있다면 공통 User 또는 Worker 개념 아래 Capability로 설계할 수 있다.

### Grade와 Certification은 같은가?

Professional Grade는 신뢰도/경력 수준이고,
Certification은 특정 역할이나 능력을 수행할 수 있는 자격이므로 분리 가능성이 높다.

### Price는 어디에 귀속되는가?

- Worker Base Rate
- Skill Premium
- Event Assignment Premium
- Assignment 최종 단가

를 분리해야 가격 이력을 추적할 수 있다.

### Review는 누구와 누구 사이에 존재하는가?

Review는 단순 User-to-User가 아니라 Event Context 안에서 발생한다.

누가 누구를 어떤 Role로 평가했는지가 필요하다.

### Availability와 Booking은 어떻게 충돌을 방지할 것인가?

동일 시간대 복수 Event에 대한 Booking Request와 Confirmed Assignment 충돌을 처리해야 한다.

### Replacement는 새로운 Assignment인가?

No-show 인력을 대체하는 사람도 최종적으로는 Event Role에 Assignment되는 구조가 자연스럽다.

기존 Assignment와 Replacement 관계를 어떻게 기록할지 결정해야 한다.

### Leader의 관리 대상은 Event인가 Team인가?

Leader는 Event 전체가 아니라 특정 Team 또는 Crew를 관리할 가능성이 높다.

대형 행사에서 여러 Leader가 존재할 경우 이를 고려해야 한다.

---

# 31. 서비스 설계 우선순위

현재 단계에서 우선순위는 다음과 같다.

## Priority 1. Domain Model

다음 개념의 경계를 명확히 한다.

- User
- Buyer
- Worker
- Promoter Profile
- Leader Certification
- Event
- Event Role
- Team
- Assignment
- Booking
- Availability
- Price
- Attendance
- Incident
- Replacement
- Review
- Reliability

## Priority 2. State Machine

특히 다음 상태 전환을 먼저 정의한다.

- Event
- Booking
- Assignment
- Replacement

## Priority 3. Pricing Policy

Base Rate와 Premium의 계산 구조를 확정한다.

## Priority 4. Cancellation / No-show Policy

운영 리스크와 비용부담 주체를 명확히 한다.

## Priority 5. Contact / Communication Policy

플랫폼 내 Communication과 직거래 방지 정책을 설계한다.

---

# 32. 현재 서비스의 한 문장 정의

> **행사 조건을 입력하면 적합한 프로모터와 인증 Leader를 조합한 Team을 추천하고, Buyer가 가격을 확인하며 인력을 직접 구성한 뒤 Booking·현장 인력관리·Replacement·평가까지 하나의 흐름으로 관리하는 행사 전문 인력 플랫폼.**

---

# 33. 서비스가 궁극적으로 만들고자 하는 변화

기존:

```text
전화
→ 카카오톡
→ 사진 전달
→ 일정 확인
→ 가격 문의
→ 인력 확정
→ 행사
→ 개인 경험에 의존
```

플랫폼:

```text
Event
→ Requirement
→ Team Recommendation
→ Team Builder
→ Transparent Pricing
→ Booking
→ Attendance
→ Workforce Operation
→ Review
→ Career / Reliability Data
→ Better Recommendation
```

플랫폼의 핵심 경쟁력은 단순한 인력 Pool이 아니다.

> **검증된 Promoter Career Data + Reliability Data + Certified Leader Network + Event Workforce Operation Data**

가 장기적인 핵심 자산이다.

---

## Appendix A. 다음 설계 산출물 권장 순서

이 문서를 기준으로 다음 순서로 상세화를 진행한다.

1. Domain Model 초안
2. Actor × Use Case
3. Event / Booking / Assignment State Diagram
4. Pricing Rule Table
5. Cancellation / No-show Policy
6. Leader Authority Matrix
7. Review Matrix
8. Buyer User Flow
9. Promoter User Flow
10. Leader User Flow
11. MVP 화면 목록
12. API / DB 설계

---

## Appendix B. 도메인 모델 초안에서 일부러 아직 확정하지 않은 부분

도메인 모델을 그릴 때 사고를 제한하지 않기 위해 아래는 본 문서에서 의도적으로 확정하지 않는다.

- `Buyer`를 User 하위 타입으로 둘지 Organization 단위로 둘지
- `Promoter`와 `Leader`를 각각 Entity로 둘지 Qualification으로 둘지
- `Team`을 영속 Entity로 둘지 Assignment 집합으로 계산할지
- Recommendation 결과를 저장할지 매번 계산할지
- Price Snapshot을 Booking 또는 Assignment에 어떻게 저장할지
- Reliability Score를 Entity로 관리할지 계산값으로 관리할지
- Event Role과 실제 Assignment 간 Cardinality
- 대형 행사에서 Leader 한 명이 여러 Crew를 관리할 수 있는지
- 동일 Promoter가 하나의 Event에서 복수 Role을 수행할 수 있는지

이 부분들은 Domain Model을 그리면서 별도 의사결정 대상으로 다룬다.

---

## 관련 문서

설계 산출물은 기획서와 분리해 [`docs/`](docs/README.md)에서 관리한다.

- [문서 맵](docs/README.md)
- [도메인 경계 결정 D1~D6](docs/domain/01-boundary-decisions.md) — §30·Appendix B의 다섯 경계 + 공개 모집·지원(D6)에 대한 결정
- [도메인 모델](docs/domain/02-domain-model.md) — 엔티티, 관계, 상태기계, 불변식
- [개발 플랜](docs/plan/development-plan.md) — Phase 0~4 시스템 개발 순서
