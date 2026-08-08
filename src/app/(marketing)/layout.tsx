import { SiteHeader } from "@/components/landing/site-header";
import { ModelsPanel } from "@/components/landing/models-panel";

export default function MarketingLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <div className="h-svh overflow-hidden">
      <SiteHeader />
      {children}
      <ModelsPanel />
    </div>
  );
}
