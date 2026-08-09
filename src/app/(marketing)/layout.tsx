import { SiteHeader } from "@/components/landing/site-header";

export default function MarketingLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <div className="h-svh overflow-hidden bg-ink text-paper">
      <SiteHeader />
      {children}
    </div>
  );
}
