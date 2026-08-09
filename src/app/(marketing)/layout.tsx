import { SiteHeader } from "@/components/site-chrome";

export default function MarketingLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <div className="dark h-svh overflow-hidden bg-ink text-paper">
      <SiteHeader transparent active="intro" />
      {children}
    </div>
  );
}
