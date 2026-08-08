import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";

const pretendard = localFont({
  src: "../fonts/PretendardVariable.woff2",
  weight: "45 920",
  variable: "--font-pretendard",
  display: "swap",
});

const clash = localFont({
  src: "../fonts/ClashDisplay-Variable.woff2",
  weight: "200 700",
  variable: "--font-clash",
  display: "swap",
});

export const metadata: Metadata = {
  title: "CAST — 행사 전문 인력 플랫폼",
  description:
    "행사 조건을 입력하면 검증된 프로모터 팀을 추천하고, 예약부터 현장 운영과 긴급 대체 투입까지 하나의 흐름으로 관리합니다.",
  openGraph: {
    title: "CAST — 행사 전문 인력 플랫폼",
    description:
      "행사의 성패는 결국, 사람입니다. 검증된 프로모터 팀을 추천받고 예약부터 현장 운영까지 한 흐름으로.",
    images: ["/media/hero-01-poster.jpg"],
    locale: "ko_KR",
    type: "website",
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="ko" className={`${pretendard.variable} ${clash.variable}`}>
      <body className="bg-ink font-sans text-paper antialiased">
        {children}
      </body>
    </html>
  );
}
