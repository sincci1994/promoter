import type { Metadata } from "next";
import { Suspense } from "react";

import { PostFlow } from "@/components/post/post-flow";
import { SiteFooter, SiteHeader } from "@/components/site-chrome";

export const metadata: Metadata = {
  title: "공고 등록 | CAST",
  description: "조건을 입력하는 동안 후보와 견적이 실시간으로 — 발행 즉시 추천 팀 초안을 받아보세요.",
};

export default function PostPage() {
  return (
    <div className="min-h-svh bg-background text-base text-foreground lg:text-sm">
      <SiteHeader />
      <Suspense>
        <PostFlow />
      </Suspense>
      <SiteFooter />
    </div>
  );
}
