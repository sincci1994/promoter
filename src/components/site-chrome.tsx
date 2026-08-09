import Link from "next/link";

import { Button } from "@/components/ui/button";

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 border-b bg-card">
      <div className="mx-auto flex h-14 max-w-6xl items-center gap-6 px-4 md:px-8">
        <Link
          href="/home"
          className="font-display text-lg font-semibold tracking-widest uppercase"
        >
          CAST
        </Link>
        <nav className="hidden items-center gap-5 md:flex">
          <Link href="/home" className="font-medium">
            공고
          </Link>
          <a
            href="#"
            className="text-muted-foreground transition-colors hover:text-foreground"
          >
            행사·광고
          </a>
          <a
            href="#"
            className="text-muted-foreground transition-colors hover:text-foreground"
          >
            기업 서비스
          </a>
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
