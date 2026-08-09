// ponytail: Buyer 플로우·홈 미니폼 목업 데이터 — 추천/매칭 API 붙일 때 이 파일만 교체
// 주의: 후보 인물·수치는 전부 시연용 가상 데이터다(실존 인물 없음). 단가는 기획서 §9의 "정책 가설" 수치.
// 필터·견적 계산은 실제 로직 — 데이터만 가상이고 인터랙션은 진짜다.

export type Grade = "P1" | "P2" | "P3" | "P4";

export const GRADE_ORDER: Grade[] = ["P1", "P2", "P3", "P4"];

export const GRADE_RATES: Record<Grade, number> = {
  P1: 20000,
  P2: 22000,
  P3: 24000,
  P4: 27000,
};

export const GRADE_NAMES: Record<Grade, string> = {
  P1: "Starter",
  P2: "Verified",
  P3: "Professional",
  P4: "Senior",
};

export const CERTS = ["영어 회화", "중국어", "VIP 의전", "제품 데모", "MC"] as const;
export type Cert = (typeof CERTS)[number];
export const CERT_PREMIUM = 2000; // 자격당 시급 가산 — 정책 가설

export const EVENT_TYPES = [
  "팝업스토어",
  "전시·박람회",
  "판촉·샘플링",
  "페스티벌",
  "론칭 행사",
  "쇼케이스",
  "VIP 행사",
  "로드쇼",
  "콘서트",
];

export type Candidate = {
  id: string;
  name: string;
  grade: Grade;
  certs: Cert[];
  regions: string[];
  eventTypes: string[];
  completed: number; // 완료 행사 수
  rehired: number; // 재의뢰 수
  availableDays: number[]; // 2026-08 기준 가용 일자 — 목업 단순화(실제는 AvailabilitySlot)
};

const FAMILY = ["김", "이", "박", "최", "정", "한", "조", "윤", "장", "임"];
const GIVEN = [
  "지수", "서연", "민준", "하윤", "도윤", "서준", "예린", "시우", "유나", "준호",
  "수아", "지호", "가은", "현우", "다은", "태윤", "소율", "건우", "리아", "은우",
];

// 8월 남은 날짜(9~31). 8/1(토) 기준 — d%7이 1이면 토, 2면 일.
const AUG_DAYS = Array.from({ length: 23 }, (_, i) => i + 9);
const isWeekend = (d: number) => d % 7 === 1 || d % 7 === 2;

// 결정적 생성 100명 — 등급 분포 4:3:2:1, 주말 가용률 높게
export const candidates: Candidate[] = Array.from({ length: 100 }, (_, i) => {
  const grade: Grade = i % 10 < 4 ? "P1" : i % 10 < 7 ? "P2" : i % 10 < 9 ? "P3" : "P4";
  // 주기를 등급 주기(10)와 서로소로 — 특정 자격이 특정 등급에 쏠리지 않게
  const certs: Cert[] = [];
  if (i % 4 === 0) certs.push("영어 회화");
  if (i % 9 === 7) certs.push("VIP 의전");
  if (i % 7 === 3) certs.push("제품 데모");
  if (i % 11 === 4) certs.push("MC");
  if (i % 13 === 6) certs.push("중국어");
  const regions =
    i % 5 < 3 ? ["서울"] : i % 5 === 3 ? ["서울", "경기·인천"] : ["경기·인천"];
  if (i % 17 === 0) regions.push("부산");
  const eventTypes = [
    EVENT_TYPES[i % 9],
    EVENT_TYPES[(i + 3) % 9],
    EVENT_TYPES[(i + 6) % 9],
  ];
  const completed = ((i * 7) % 60) + 2;
  return {
    id: `c-${i + 1}`,
    // 등급 주기(10)와 어긋나게 조합 — 같은 조건 풀에서 이름이 반복되지 않도록
    name: FAMILY[(i + Math.floor(i / 10)) % 10] + GIVEN[(i * 3 + Math.floor(i / 5)) % 20],
    grade,
    certs,
    regions,
    eventTypes,
    completed,
    rehired: Math.floor(completed / 4) + (i % 3),
    // 평일 ~2/3, 주말 ~4/5 가용 — 전원 가용(100%)은 가짜티가 나서 배제
    availableDays: AUG_DAYS.filter((d) =>
      isWeekend(d) ? (d + i) % 5 !== 0 : (d + i) % 3 !== 0,
    ),
  };
});

export function gradeAtLeast(grade: Grade, min: Grade) {
  return GRADE_ORDER.indexOf(grade) >= GRADE_ORDER.indexOf(min);
}

export function matchCandidates(filter: {
  day?: number | null;
  region?: string | null;
  eventType?: string | null;
  minGrade?: Grade | null;
  requiredCerts?: Cert[];
}): Candidate[] {
  const { day, region, eventType, minGrade, requiredCerts = [] } = filter;
  return candidates.filter(
    (c) =>
      (day == null || c.availableDays.includes(day)) &&
      (region == null || c.regions.includes(region)) &&
      (eventType == null || c.eventTypes.includes(eventType)) &&
      (minGrade == null || gradeAtLeast(c.grade, minGrade)) &&
      requiredCerts.every((cert) => c.certs.includes(cert)),
  );
}

// Role 예상 시급 = 최소 Grade Base + 필수 자격 가산 (§9 Layer 1+2)
export function roleRate(minGrade: Grade, requiredCerts: Cert[] = []) {
  return GRADE_RATES[minGrade] + requiredCerts.length * CERT_PREMIUM;
}
