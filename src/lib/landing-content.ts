// ponytail: 카피·라벨·클립 전부 하드코딩 placeholder — 실데이터/브랜드명/실촬영 확보 시 이 파일만 교체
// 주의: heroStats·frag.records는 목업 시연용 "가상" 수치·실적이다(실존 브랜드 없음). 공개 전 실데이터로 교체할 것.
import type { CSSProperties } from "react";

export type Clip = {
  src?: string;
  poster?: string;
  alt: string;
  hue: number;
};

const email = "hello@cast.example";

export const site = {
  brand: "CAST",
  tagline: "행사 전문 인력 플랫폼",
  email,
  nav: [
    {
      label: "행사 문의",
      href: `mailto:${email}?subject=${encodeURIComponent("[행사 문의]")}`,
    },
  ],
};

export const hero = {
  eyebrow: "EVENT WORKFORCE PLATFORM",
  titleKo: ["무대를 완성하는", "사람들"],
  sub: "검증된 프로모터 팀을 추천받고, 예약부터 현장 운영까지 한 흐름으로.",
};

export const heroStats = [
  { value: "128", suffix: "건", label: "누적 프로젝트" },
  { value: "1,840", suffix: "명", label: "누적 파견" },
  { value: "87", suffix: "%", label: "재의뢰율" },
];

const clip = (name: string, alt: string, hue: number): Clip => ({
  src: `/media/${name}.mp4`,
  poster: `/media/${name}-poster.jpg`,
  alt,
  hue,
});

export type Frag = {
  titleKo: string;
  note: string;
  roles: string[];
  snaps: string[];
  records: { year: string; name: string; size: string }[];
};

// 링 캐러셀 12장 — 궤도 순서 = 배열 순서. frag = 호버 시 우측 조각 콘텐츠
// (실적 데이터가 쌓이면 note/snaps를 실제 행사 사진·기록으로 교체)
export const ringClips: { clip: Clip; label: string; frag: Frag }[] = [
  {
    clip: clip("hero-01", "무대를 가로지르는 컬러 스포트라이트", 16),
    label: "STAGE",
    frag: {
      titleKo: "무대 운영",
      note: "리허설부터 철수까지, 무대 뒤를 지키는 팀.",
      roles: ["무대 진행", "운영 스태프", "리더"],
      records: [
        { year: "2025", name: "여의도 신차 발표 무대", size: "운영 8명" },
        { year: "2024", name: "코엑스 시상식 무대", size: "운영 11명" },
      ],
      snaps: ["/media/snap-stage.jpg", "/media/ring-showcase-poster.jpg"],
    },
  },
  {
    clip: clip("ring-popup", "팝업 매장의 옷걸이 진열", 24),
    label: "POP-UP",
    frag: {
      titleKo: "팝업스토어",
      note: "첫인사부터 계산대까지, 브랜드 경험을 접객으로.",
      roles: ["리셉션", "브랜드 앰배서더", "진열·재고"],
      records: [
        { year: "2025", name: "성수 뷰티 팝업 4주 운영", size: "스태프 12명" },
        { year: "2025", name: "한남 패션 팝업", size: "스태프 6명" },
      ],
      snaps: ["/media/snap-popup.jpg", "/media/ring-brand-poster.jpg"],
    },
  },
  {
    clip: clip("talent-04", "흰 의상의 캣워크", 45),
    label: "RUNWAY",
    frag: {
      titleKo: "런웨이 · 쇼",
      note: "쇼의 템포를 아는 사람들로 백스테이지를 채웁니다.",
      roles: ["모델", "피팅 스태프", "백스테이지"],
      records: [
        { year: "2025", name: "DDP 컬렉션 쇼 백스테이지", size: "스태프 14명" },
        { year: "2024", name: "강남 편집숍 트렁크쇼", size: "모델 8명" },
      ],
      snaps: ["/media/snap-runway.jpg", "/media/ring-vip-poster.jpg"],
    },
  },
  {
    clip: clip("ring-expo", "컨벤션홀을 채운 청중", 205),
    label: "EXPO",
    frag: {
      titleKo: "전시 · 박람회",
      note: "부스 운영과 리드 수집까지, 훈련된 팀이 갑니다.",
      roles: ["부스 운영", "제품 데모", "안내", "영어 응대"],
      records: [
        { year: "2025", name: "킨텍스 산업 박람회 부스", size: "운영 22명" },
        { year: "2025", name: "코엑스 IT 전시 부스", size: "데모 9명" },
      ],
      snaps: ["/media/snap-expo.jpg", "/media/ring-promo-poster.jpg"],
    },
  },
  {
    clip: clip("hero-02", "야간 페스티벌에서 춤추는 관중", 215),
    label: "FESTIVAL",
    frag: {
      titleKo: "페스티벌",
      note: "수만 인파 속에서도 흐트러지지 않는 운영.",
      roles: ["게이트", "안내", "운영 스태프", "리더"],
      records: [
        { year: "2024", name: "난지 뮤직 페스티벌 게이트", size: "스태프 35명" },
        { year: "2024", name: "잠실 푸드 페스티벌", size: "안내 18명" },
      ],
      snaps: ["/media/snap-festival.jpg", "/media/hero-03-poster.jpg"],
    },
  },
  {
    clip: clip("ring-showcase", "푸른 조명의 무대 공연", 300),
    label: "SHOWCASE",
    frag: {
      titleKo: "쇼케이스",
      note: "무대와 객석 사이의 모든 순간을 케어합니다.",
      roles: ["진행 보조", "아티스트 케어", "안내"],
      records: [
        { year: "2025", name: "홍대 아티스트 쇼케이스", size: "진행 7명" },
        { year: "2024", name: "성수 리스닝 파티", size: "케어 5명" },
      ],
      snaps: ["/media/snap-showcase.jpg", "/media/hero-01-poster.jpg"],
    },
  },
  {
    clip: clip("case-launch", "무대 조명 앞 실루엣", 350),
    label: "LAUNCH",
    frag: {
      titleKo: "론칭 행사",
      note: "미디어와 VIP 앞에 서는 정예 구성.",
      roles: ["VIP 응대", "MC", "제품 데모"],
      records: [
        { year: "2025", name: "청담 플래그십 론칭", size: "VIP 응대 10명" },
        { year: "2024", name: "한강 신제품 미디어데이", size: "정예 12명" },
      ],
      snaps: ["/media/snap-launch.jpg", "/media/ring-vip-poster.jpg"],
    },
  },
  {
    clip: clip("ring-brand", "핑크 립스틱 제품 클로즈업", 18),
    label: "BRAND DAY",
    frag: {
      titleKo: "브랜드 데이",
      note: "브랜드의 톤을 입은 사람들이 하루를 만듭니다.",
      roles: ["브랜드 앰배서더", "체험 부스", "샘플링"],
      records: [
        { year: "2025", name: "잠실 스포츠 브랜드 데이", size: "앰배서더 16명" },
        { year: "2024", name: "광화문 코스메틱 체험존", size: "스태프 9명" },
      ],
      snaps: ["/media/snap-brand.jpg", "/media/ring-popup-poster.jpg"],
    },
  },
  {
    clip: clip("case-festival", "페스티벌 무대 앞 관중", 265),
    label: "ROADSHOW",
    frag: {
      titleKo: "로드쇼",
      note: "도시를 옮겨 다녀도 품질은 그대로.",
      roles: ["현장 안내", "샘플링", "운영 스태프"],
      records: [
        { year: "2025", name: "전국 5개 도시 시승 로드쇼", size: "회차당 12명" },
        { year: "2024", name: "부산·대구 순회 판촉", size: "스태프 10명" },
      ],
      snaps: ["/media/snap-roadshow.jpg", "/media/ring-promo-poster.jpg"],
    },
  },
  {
    clip: clip("ring-vip", "골드 커튼 사이의 레드카펫", 340),
    label: "VIP",
    frag: {
      titleKo: "VIP 행사",
      note: "이름과 취향을 기억하는 응대가 격을 만듭니다.",
      roles: ["VIP 응대", "리셉션", "통역"],
      records: [
        { year: "2025", name: "청담 갤러리 VIP 프리뷰", size: "응대 6명" },
        { year: "2024", name: "호텔 연말 갈라 디너", size: "응대 14명" },
      ],
      snaps: ["/media/snap-vip.jpg", "/media/case-launch-poster.jpg"],
    },
  },
  {
    clip: clip("hero-03", "콘서트장의 흐릿한 인파와 조명", 285),
    label: "CONCERT",
    frag: {
      titleKo: "콘서트",
      note: "입장부터 퇴장까지, 관객 동선을 설계합니다.",
      roles: ["게이트", "객석 안내", "안전 스태프"],
      records: [
        { year: "2024", name: "고척돔 콘서트 게이트", size: "안내 40명" },
        { year: "2024", name: "올림픽홀 팬미팅", size: "스태프 24명" },
      ],
      snaps: ["/media/snap-concert.jpg", "/media/hero-02-poster.jpg"],
    },
  },
  {
    clip: clip("ring-promo", "쇼핑몰을 오가는 인파 타임랩스", 170),
    label: "PROMOTION",
    frag: {
      titleKo: "프로모션",
      note: "지나가는 발걸음을 멈추게 하는 현장 판촉.",
      roles: ["샘플링", "판촉", "행사 안내"],
      records: [
        { year: "2025", name: "코엑스몰 샘플링 프로모션", size: "판촉 15명" },
        { year: "2024", name: "타임스퀘어 런칭 판촉", size: "스태프 8명" },
      ],
      snaps: ["/media/snap-promo.jpg", "/media/ring-popup-poster.jpg"],
    },
  },
];

export type RingItem = (typeof ringClips)[number];

export function ph(hue: number): CSSProperties {
  return {
    background: `linear-gradient(160deg, hsl(${hue} 42% 17%) 0%, hsl(${(hue + 40) % 360} 48% 9%) 45%, #0a0a0b 100%)`,
  };
}
