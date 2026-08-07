import Link from "next/link";
import { SkillBars } from "@/components/SkillBars";
import type { JobInsights } from "@/lib/types";

export function InsightsPanel({ insights }: { insights: JobInsights }) {
  return (
    <aside className="animate-rise animate-rise-delay-2 border-t border-line pt-6 lg:sticky lg:top-4 lg:border-t-0 lg:border-l lg:pl-8 lg:pt-0">
      <p className="text-[11px] uppercase tracking-[0.18em] text-ink-soft/70">
        Live demand signal
      </p>
      <h2 className="mt-1 font-display text-2xl tracking-tight text-ink">
        What salons want
      </h2>
      <p className="mt-2 text-sm leading-relaxed text-ink-soft">
        From {insights.totalJobs} active listings
        {insights.topSkill
          ? ` — ${insights.topSkill.skill} leads with ${insights.topSkill.count} mentions.`
          : "."}{" "}
        No guessing.
      </p>

      <div className="mt-5">
        <SkillBars skills={insights.skillDemand} limit={6} />
      </div>

      <div className="mt-5 space-y-2 border-t border-line pt-4 text-sm text-ink-soft">
        {insights.sourceBreakdown.slice(0, 3).map((item) => (
          <div key={item.source} className="flex justify-between gap-4">
            <span>{item.source}</span>
            <span className="tabular-nums text-ink">{item.count}</span>
          </div>
        ))}
      </div>

      <Link
        href="/insights"
        className="mt-5 inline-block text-sm text-blush-deep underline decoration-blush/50 underline-offset-4 transition hover:decoration-blush-deep"
      >
        Full market insights →
      </Link>
    </aside>
  );
}
