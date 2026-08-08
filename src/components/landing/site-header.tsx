import { site } from "@/lib/landing-content";

export function SiteHeader() {
  return (
    <header className="fixed inset-x-0 top-0 z-50 mix-blend-difference">
      <div className="flex items-center justify-between px-5 py-5 md:px-10">
        <a
          href="#top"
          className="font-display text-xl font-semibold tracking-widest uppercase"
        >
          {site.brand}
        </a>
        <nav className="flex items-center gap-6 text-sm">
          <a
            href="#models"
            className="tracking-wide opacity-80 transition-opacity hover:opacity-100"
          >
            모델
          </a>
          {site.nav.map((item) => (
            <a
              key={item.href}
              href={item.href}
              className="tracking-wide opacity-80 transition-opacity hover:opacity-100"
            >
              {item.label}
            </a>
          ))}
        </nav>
      </div>
    </header>
  );
}
