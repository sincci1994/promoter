import Link from "next/link";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

// 전 페이지 공용 헤더 — 룩은 랜딩(풀폭·워드마크), 메뉴는 홈 기준.
// transparent: 랜딩처럼 콘텐츠 위에 뜨는 투명 헤더(스크롤 없는 화면 전용).
const NAV = [
  { key: "intro", label: "소개", href: "/" },
  { key: "board", label: "공고", href: "/home" },
  { key: "ads", label: "행사·광고", href: "#" },
  { key: "biz", label: "기업 서비스", href: "#" },
] as const;

export function SiteHeader({
  transparent,
  active,
}: {
  transparent?: boolean;
  active?: (typeof NAV)[number]["key"];
}) {
  return (
    <header
      className={cn(
        transparent
          ? "absolute inset-x-0 top-0 z-50"
          : "sticky top-0 z-40 border-b bg-card",
      )}
    >
      <div className="flex items-center gap-6 px-5 py-3.5 md:px-10">
        <Link
          href="/home"
          className="font-display text-xl font-semibold tracking-widest uppercase"
        >
          CAST
        </Link>
        <nav className="hidden items-center gap-6 text-sm md:flex">
          {NAV.map((item) => (
            <Link
              key={item.key}
              href={item.href}
              className={cn(
                "tracking-wide transition-colors",
                active === item.key
                  ? "font-medium"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="ml-auto flex items-center gap-2">
          <Button variant="ghost" size="sm" asChild>
            <a href="#">로그인</a>
          </Button>
          <Button size="sm" asChild>
            <Link href="/post">공고 등록</Link>
          </Button>
        </div>
      </div>
    </header>
  );
}

export function SiteFooter() {
  return (
    <footer className="mt-16 border-t bg-card">
      <div className="mx-auto flex max-w-6xl flex-col gap-3 px-4 py-8 text-xs text-muted-foreground md:flex-row md:items-center md:justify-between md:px-8">
        <p>
          <span className="font-display text-sm font-semibold tracking-widest text-foreground uppercase">
            CAST
          </span>
          <span className="ml-2">행사 전문 인력 플랫폼</span>
        </p>
        <nav className="flex gap-4">
          <Link href="/" className="transition-colors hover:text-foreground">
            소개
          </Link>
          <a href="#" className="transition-colors hover:text-foreground">
            이용약관
          </a>
          <a href="#" className="transition-colors hover:text-foreground">
            개인정보처리방침
          </a>
          <a
            href="mailto:hello@cast.example"
            className="transition-colors hover:text-foreground"
          >
            문의
          </a>
        </nav>
        <p>© 2026 CAST</p>
      </div>
    </footer>
  );
}
