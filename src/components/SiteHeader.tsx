import Link from "next/link";

export function SiteHeader() {
  return (
    <header className="border-b border-line/80">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-6 px-5 py-3.5 sm:px-8">
        <Link href="/" className="group min-w-0">
          <p className="font-display text-xl tracking-tight text-ink transition-colors group-hover:text-blush-deep sm:text-2xl">
            Cosmo Connect
          </p>
          <p className="mt-0.5 text-xs uppercase tracking-[0.18em] text-ink-soft/70">
            Demand-led beauty careers
          </p>
        </Link>
        <nav className="flex shrink-0 items-center gap-5 text-sm text-ink-soft">
          <Link
            href="/"
            className="transition-colors hover:text-ink"
          >
            Jobs
          </Link>
          <Link
            href="/insights"
            className="transition-colors hover:text-ink"
          >
            Insights
          </Link>
        </nav>
      </div>
    </header>
  );
}
