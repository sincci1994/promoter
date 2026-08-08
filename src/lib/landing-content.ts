// ponytail: 카피·라벨·클립 전부 하드코딩 placeholder — 실데이터/브랜드명/실촬영 확보 시 이 파일만 교체
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
    {
      label: "프로모터 지원",
      href: `mailto:${email}?subject=${encodeURIComponent("[프로모터 지원]")}`,
    },
  ],
};

export const hero = {
  eyebrow: "EVENT WORKFORCE PLATFORM",
  titleKo: ["무대를 완성하는", "사람들"],
  sub: "검증된 프로모터 팀을 추천받고, 예약부터 현장 운영까지 한 흐름으로.",
};

const clip = (name: string, alt: string, hue: number): Clip => ({
  src: `/media/${name}.mp4`,
  poster: `/media/${name}-poster.jpg`,
  alt,
  hue,
});

// 링 캐러셀 12장 — 궤도 순서 = 배열 순서
export const ringClips: { clip: Clip; label: string }[] = [
  { clip: clip("hero-01", "무대를 가로지르는 컬러 스포트라이트", 16), label: "STAGE" },
  { clip: clip("ring-popup", "팝업 매장의 옷걸이 진열", 24), label: "POP-UP" },
  { clip: clip("talent-04", "흰 의상의 캣워크", 45), label: "RUNWAY" },
  { clip: clip("ring-expo", "컨벤션홀을 채운 청중", 205), label: "EXPO" },
  { clip: clip("hero-02", "야간 페스티벌에서 춤추는 관중", 215), label: "FESTIVAL" },
  { clip: clip("ring-showcase", "푸른 조명의 무대 공연", 300), label: "SHOWCASE" },
  { clip: clip("case-launch", "무대 조명 앞 실루엣", 350), label: "LAUNCH" },
  { clip: clip("ring-brand", "핑크 립스틱 제품 클로즈업", 18), label: "BRAND DAY" },
  { clip: clip("case-festival", "페스티벌 무대 앞 관중", 265), label: "ROADSHOW" },
  { clip: clip("ring-vip", "골드 커튼 사이의 레드카펫", 340), label: "VIP" },
  { clip: clip("hero-03", "콘서트장의 흐릿한 인파와 조명", 285), label: "CONCERT" },
  { clip: clip("ring-promo", "쇼핑몰을 오가는 인파 타임랩스", 170), label: "PROMOTION" },
];

export function ph(hue: number): CSSProperties {
  return {
    background: `linear-gradient(160deg, hsl(${hue} 42% 17%) 0%, hsl(${(hue + 40) % 360} 48% 9%) 45%, #0a0a0b 100%)`,
  };
}
