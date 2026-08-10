// ponytail: 내부 홈 목업 데이터 — API/DB 붙일 때 이 파일만 교체
// 주의: 업체명·공고·수치는 전부 시연용 가상 데이터다(실존 브랜드 없음). 공개 전 실데이터로 교체할 것.

import { CERT_PREMIUM, GRADE_RATES, type Cert, type Grade } from "./buyer-flow-content";

export type JobPost = {
  id: string;
  category: string;
  title: string;
  org: string;
  date: string;
  place: string;
  role: string;
  headcount: number;
  conditions?: JobCondition[]; // 행사 특성 조건 — 가산 입력(기획서 §9.3)이자 워커 불가 조건과 공유하는 축
  requiredCerts?: Cert[]; // 역할 필수 자격 — 자격 가산 입력(기획서 §9.2)
  startDay: number; // 2026-08 기준 일자 — 날짜 스트립·주말 모듈 필터용
  endDay?: number;
  zone: string; // 구인맵 거점(수도권 외는 맵 각주 처리)
  dday?: string;
  remaining?: number; // 모집 잔여(= 유효 정원 − 활성 배정)
  standby?: boolean; // remaining 0 — 모집 중이면 "대기 지원"으로 노출(도메인 §8)
  isNew?: boolean;
  urgent?: boolean; // 급구(Emergency)
  closesIn?: string; // 마감 카운트다운 라벨
  critical?: boolean; // 마감 1시간 미만 — red 강조(_common.md)
  otherRoles?: { name: string; rate: number; remaining: number }[]; // 같은 행사의 다른 모집 역할(I10 복수 지원 시연)
};

export type AdItem = {
  id: string;
  brand: string;
  title: string;
  note: string;
  img: string;
  ad?: boolean; // 유료 광고 표기
};

// ---- 행사 특성 조건 축 (worker_interview 수용 — 기획서 §9.3) ----
// 도메인 후보: Event 특성의 구조화 필드. Event vs EventRole 귀속은 ERD 미결(docs/domain/02 §10).
// 워커 불가 조건(mockSession.blockedConditions)이 같은 통제 어휘를 공유한다 — 자가신고 태그 아님.

export type JobCondition = "outdoor" | "night" | "harsh" | "shift2" | "shift3";

export const CONDITION_LABELS: Record<JobCondition, string> = {
  outdoor: "야외",
  night: "야간",
  harsh: "열악 환경",
  shift2: "2교대",
  shift3: "3교대",
};

// 조건별 시급 가산 — 정책 가설(Phase 1 Pricing Rule Table에서 확정)
export const CONDITION_PREMIUM: Record<JobCondition, number> = {
  outdoor: 1000,
  night: 2000,
  harsh: 2000,
  shift2: 1000,
  shift3: 2000,
};

export const EMERGENCY_PREMIUM = 6000; // 긴급 대체 가산 — 기획서 §13.5 예시값

export type RateLine = { label: string; amount: number };

// 열람자 등급 기준 표시 단가 — "게시 단가는 열람 시 본인 Grade 기준 계산 표시"(D6 결정 6)의 목업 재현.
// 합성: Grade 기본(§9.1) + 필수 자격 가산(§9.2) + 행사 조건 가산(§9.3) + 긴급 가산(§13.5). 전부 세전.
export function jobHourly(job: JobPost, grade: Grade = mockSession.grade) {
  const lines: RateLine[] = [{ label: `${grade} 기본`, amount: GRADE_RATES[grade] }];
  for (const cert of job.requiredCerts ?? []) lines.push({ label: cert, amount: CERT_PREMIUM });
  for (const c of job.conditions ?? []) lines.push({ label: CONDITION_LABELS[c], amount: CONDITION_PREMIUM[c] });
  if (job.urgent) lines.push({ label: "긴급 투입", amount: EMERGENCY_PREMIUM });
  return { total: lines.reduce((sum, line) => sum + line.amount, 0), lines };
}

export const quickFilters = [
  "서울",
  "경기·인천",
  "이번 주말",
  "급구",
  "전시·박람회",
  "팝업스토어",
  "페스티벌",
];

export const jobTabs = [
  "전체",
  "행사 STAFF",
  "판촉·샘플링",
  "전시·박람회",
  "팝업스토어",
  "공연·페스티벌",
  "VIP·의전",
];

export const ads: AdItem[] = [
  {
    id: "ad-1",
    brand: "글로우랩 코스메틱",
    title: "글로우랩 뷰티 위크 팝업",
    note: "성수 4주 운영 — 스태프 12명 상시 모집",
    img: "/media/ring-brand-poster.jpg",
    ad: true,
  },
  {
    id: "ad-2",
    brand: "브라이트 엑스포",
    title: "킨텍스 산업 박람회 2026",
    note: "부스 운영·제품 데모 대규모 채용",
    img: "/media/ring-expo-poster.jpg",
    ad: true,
  },
  {
    id: "ad-3",
    brand: "온스테이지 프로덕션",
    title: "한강 나이트 페스티벌",
    note: "게이트·안내 20명 — 8/22 개막",
    img: "/media/hero-02-poster.jpg",
  },
  {
    id: "ad-4",
    brand: "오토모티브 PR",
    title: "신차 론칭 미디어데이",
    note: "VIP 응대 정예팀 모집",
    img: "/media/case-launch-poster.jpg",
    ad: true,
  },
];

export const urgentJobs: JobPost[] = [
  {
    id: "u-1",
    startDay: 9,
    zone: "고척",
    category: "콘서트",
    title: "돔 콘서트 게이트 안내 급구",
    org: "온스테이지 프로덕션",
    date: "8/9(일) 16:00–23:00",
    place: "고척 스카이돔",
    role: "게이트 안내",
    headcount: 3,
    conditions: ["night"],
    closesIn: "43분 남음",
    critical: true,
    urgent: true,
  },
  {
    id: "u-2",
    startDay: 10,
    zone: "성수·한남",
    category: "팝업스토어",
    title: "성수 뷰티 팝업 리셉션 결원",
    org: "글로우랩 코스메틱",
    date: "8/10(월) 10:30–19:00",
    place: "서울 성수동",
    role: "리셉션",
    headcount: 1,
    closesIn: "3시간 남음",
    urgent: true,
  },
  {
    id: "u-3",
    startDay: 12,
    endDay: 14,
    zone: "킨텍스",
    category: "전시·박람회",
    title: "산업 박람회 부스 운영",
    org: "브라이트 엑스포",
    date: "8/12(수)–8/14(금) 09:00–18:00",
    place: "킨텍스 제2전시장",
    role: "부스 운영",
    headcount: 4,
    conditions: ["shift2"],
    closesIn: "8시간 남음",
  },
  {
    id: "u-4",
    startDay: 11,
    zone: "코엑스·청담",
    category: "판촉·샘플링",
    title: "식음료 샘플링 프로모션",
    org: "데일리 F&B",
    date: "8/11(화) 11:00–17:00",
    place: "코엑스몰",
    role: "샘플링",
    headcount: 2,
    closesIn: "21시간 남음",
  },
];

export const jobs: JobPost[] = [
  {
    id: "j-1",
    startDay: 15,
    endDay: 16,
    zone: "성수·한남",
    category: "팝업스토어",
    title: "패션 브랜드 한남 팝업 오픈런 운영",
    org: "무브먼트 에이전시",
    date: "8/15(토)–8/16(일) 10:00–20:00",
    place: "서울 한남동",
    role: "브랜드 앰배서더",
    headcount: 6,
    dday: "D-2",
    remaining: 4,
    isNew: true,
  },
  {
    id: "j-2",
    startDay: 19,
    endDay: 20,
    zone: "코엑스·청담",
    category: "전시·박람회",
    title: "IT 테크 컨퍼런스 안내 데스크",
    org: "브라이트 엑스포",
    date: "8/19(수)–8/20(목) 08:30–18:00",
    place: "코엑스 컨퍼런스룸",
    role: "안내·등록 데스크",
    headcount: 8,
    dday: "D-5",
    remaining: 3,
    otherRoles: [{ name: "운영 스태프", rate: 22000, remaining: 3 }],
  },
  {
    id: "j-3",
    startDay: 21,
    zone: "여의도",
    category: "론칭 행사",
    title: "신차 미디어데이 VIP 응대",
    org: "오토모티브 PR",
    date: "8/21(금) 13:00–21:00",
    place: "여의도 특설 행사장",
    role: "VIP 응대",
    headcount: 4,
    requiredCerts: ["VIP 의전"],
    dday: "D-7",
    remaining: 2,
    isNew: true,
  },
  {
    id: "j-4",
    startDay: 22,
    endDay: 23,
    zone: "홍대·상암",
    category: "페스티벌",
    title: "한강 뮤직 페스티벌 게이트·안내",
    org: "온스테이지 프로덕션",
    date: "8/22(토)–8/23(일) 12:00–22:00",
    place: "난지 한강공원",
    role: "게이트·안내",
    headcount: 20,
    conditions: ["outdoor", "night"],
    dday: "D-8",
    remaining: 11,
  },
  {
    id: "j-5",
    startDay: 15,
    zone: "잠실",
    category: "판촉·샘플링",
    title: "대형마트 신제품 시식 판촉",
    org: "데일리 F&B",
    date: "8/15(토) 11:00–18:00",
    place: "잠실 대형마트",
    role: "시식 판촉",
    headcount: 3,
    dday: "D-3",
    remaining: 0,
    standby: true,
  },
  {
    id: "j-6",
    startDay: 18,
    zone: "홍대·상암",
    category: "쇼케이스",
    title: "아이돌 쇼케이스 진행 보조",
    org: "칠리 엔터테인먼트",
    date: "8/18(화) 15:00–22:00",
    place: "홍대 무브홀",
    role: "진행 보조",
    headcount: 5,
    conditions: ["night"],
    dday: "D-4",
    remaining: 5,
    isNew: true,
  },
  {
    id: "j-7",
    startDay: 27,
    zone: "코엑스·청담",
    category: "VIP 행사",
    title: "갤러리 프리뷰 리셉션(영어)",
    org: "청담 아트하우스",
    date: "8/27(목) 17:00–21:00",
    place: "서울 청담동",
    role: "리셉션",
    headcount: 2,
    requiredCerts: ["영어 회화", "VIP 의전"],
    dday: "D-13",
    remaining: 1,
  },
  {
    id: "j-8",
    startDay: 24,
    endDay: 26,
    zone: "부산",
    category: "로드쇼",
    title: "전기차 시승 로드쇼 현장 안내",
    org: "오토모티브 PR",
    date: "8/24(월)–8/26(수) 10:00–18:00",
    place: "부산 벡스코 광장",
    role: "현장 안내",
    headcount: 6,
    conditions: ["outdoor"],
    dday: "D-10",
    remaining: 6,
  },
  {
    id: "j-9",
    startDay: 29,
    endDay: 30,
    zone: "코엑스·청담",
    category: "전시·박람회",
    title: "리빙 페어 브랜드 부스 데모",
    org: "하우스 리빙",
    date: "8/29(토)–8/30(일) 10:00–19:00",
    place: "세텍(SETEC)",
    role: "제품 데모",
    headcount: 4,
    requiredCerts: ["제품 데모"],
    dday: "D-15",
    remaining: 4,
  },
];

export const homeStats = {
  openJobs: 128,
  startsThisWeek: 42,
  activeWorkers: 1840, // 랜딩 heroStats와 일관 유지
  rehireRate: 87,
};

// ---- 날짜 유틸 (목업 고정 기준일 — 실데이터 전환 시 실제 오늘로 교체) ----

export const MOCK_TODAY = 9; // 2026-08-09(일)
export const STRIP_DAYS = Array.from({ length: 14 }, (_, i) => MOCK_TODAY + i);

const DOW = ["일", "월", "화", "수", "목", "금", "토"];
// 2026-08-09 = 일요일 기준
export function dowLabel(day: number) {
  return DOW[(day - MOCK_TODAY) % 7];
}
export function isWeekendDay(day: number) {
  const dow = (day - MOCK_TODAY) % 7;
  return dow === 0 || dow === 6;
}
export function jobOnDay(job: JobPost, day: number) {
  return job.startDay <= day && day <= (job.endDay ?? job.startDay);
}

// ---- 구인맵 거점 (자체 제작 개략도 — 좌표는 각 지도 컨테이너 기준 %) ----

export const ZONES = [
  "킨텍스",
  "홍대·상암",
  "여의도",
  "고척",
  "성수·한남",
  "코엑스·청담",
  "잠실",
  "부산",
];

// 수도권 확대 지도(viewBox 0 0 800 420) 위 핀
export const METRO_PINS: Record<string, { x: number; y: number }> = {
  킨텍스: { x: 12, y: 20 },
  "홍대·상암": { x: 28, y: 46 },
  여의도: { x: 38, y: 74 },
  고척: { x: 20, y: 90 },
  "성수·한남": { x: 58, y: 36 },
  "코엑스·청담": { x: 66, y: 70 },
  잠실: { x: 85, y: 50 },
};

// 전국 개략도(viewBox 0 0 400 520) 위 광역 핀 — 공고 zone 어휘와 동일
export const REGION_PINS: Record<string, { x: number; y: number }> = {
  강원: { x: 63, y: 20 },
  "대전·충청": { x: 38, y: 42 },
  대구: { x: 65, y: 54 },
  "광주·전남": { x: 32, y: 74 },
  부산: { x: 76, y: 81 },
  제주: { x: 37, y: 96 },
};

// ---- 주말 모듈 ----

export const WEEKEND = { label: "이번 주말 8/15(토)–8/16(일)", days: [15, 16] };

// ---- mock 세션 (로그인 Worker 상태 시연용 — 실 세션 붙일 때 교체) ----

export const mockSession = {
  name: "김지수",
  grade: "P2" as const,
  region: "서울",
  completed: 12, // 완료 행사 수 — 프로필 미리보기용
  tags: ["팝업스토어", "전시·박람회"],
  availableDays: [15, 20, 21], // 가용일정 등록분
  score: 92, // 평판 점수(0~100 공개 지표, 가칭 — 구 온도) — 표기·산식 [정책], 기획서 §20
  blockedConditions: ["outdoor"] as JobCondition[], // 불가 조건 — 공고 탐색에서 하드 제외(조건 축과 동일 어휘)
  // 확정 근무 1건 — 시간 겹침 소프트 경고 시연용(j-1과 8/16 겹침)
  confirmedWork: { day: 16, label: "8/16(일) 14:00–22:00 아이돌 팬사인회 진행 보조" },
  // 포트폴리오 — Buyer가 팀 구성 시 보는 프로필(홈 스트립 패널·수정 모달 시연용)
  profile: {
    role: "행사 스태프",
    basics: "여성 · 25세 · 168cm",
    regionShort: "서울·경기",
    regionDetail: "서울 전역 · 경기 남부",
    languages: "한국어 · 영어",
    availableFor: "주말 · 야간",
    certs: "영어 회화",
    certsMissing: "VIP 의전",
    rehires: 4,
    catchphrase: "밝은 응대가 강점, 뷰티·패션 현장 경험 다수",
    intro:
      "뷰티·패션 팝업 12회, 전시 안내 데스크 4회 경험이 있습니다. 첫 방문 고객 응대와 대기열 관리에 자신 있고, 지각·노쇼 이력 없이 재의뢰 4회를 받았습니다.",
    career: [
      { title: "글로우랩 뷰티 위크 팝업 — 리셉션 리더", when: "2026.05" },
      { title: "킨텍스 리빙 페어 — 안내 데스크", when: "2026.03" },
      { title: "청담 패션 브랜드 VIP 프리뷰 — 응대", when: "2025.12" },
    ],
  },
};

export const workerStatus = {
  actionNeeded: 1,
  actionExpiresIn: "2시간 12분",
  reviewing: 2,
  standby: 1,
  confirmedThisWeek: 1,
  eventRooms: { open: 1, unread: 2 }, // 행사 방 — 확정 행사당 자동 개설(기획서 §14.2·§17), unread = 새 공지
};

// ---- 탐색 표면 파생 (mock 세션 기준 — 홈·탐색 컴포넌트 공용) ----

// 불가 조건 하드 제외(worker_interview) — 급구 채널은 긴급이라 미적용
export const visibleJobs = jobs.filter(
  (j) => !j.conditions?.some((c) => mockSession.blockedConditions.includes(c)),
);
export const excludedCount = jobs.length - visibleJobs.length;

// AI 맞춤 추천 — 가용일(2)·선호 유형(2)·신규(1) 가중 상위 3건
// ponytail: 규칙 기반 목업 스코어링 — 실추천 모델 붙일 때 이 블록만 교체
export const recommendedJobs = visibleJobs
  .map((job) => {
    const availHit = mockSession.availableDays.some((d) => jobOnDay(job, d));
    const prefHit = mockSession.tags.includes(job.category);
    const reasons = [
      ...(availHit ? ["가용일 일치"] : []),
      ...(prefHit ? ["선호 유형"] : []),
      ...(job.isNew ? ["신규"] : []),
    ];
    return {
      job,
      reasons,
      score: (availHit ? 2 : 0) + (prefHit ? 2 : 0) + (job.isNew ? 1 : 0),
    };
  })
  .filter((r) => r.score >= 2)
  .sort((a, b) => b.score - a.score)
  .slice(0, 3);
