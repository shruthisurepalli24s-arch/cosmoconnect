import Link from "next/link";
import { SkillBars } from "@/components/SkillBars";
import { MARKET_LABEL } from "@/lib/constants";
import { buildInsights, getAllJobs } from "@/lib/jobs";

export const metadata = {
  title: "Skill demand insights — Cosmo Connect",
  description:
    "What salons are hiring for across LA, SF, San Diego, Sacramento, and Vegas.",
};

export default function InsightsPage() {
  const jobs = getAllJobs();
  const insights = buildInsights(jobs);
  const maxCity = insights.cityBreakdown[0]?.count ?? 1;
  const maxSource = insights.sourceBreakdown[0]?.count ?? 1;

  return (
    <div className="mx-auto max-w-6xl px-5 pb-20 pt-10 sm:px-8 sm:pt-14">
      <section className="animate-rise max-w-3xl">
        <p className="text-[11px] uppercase tracking-[0.2em] text-ink-soft/70">
          Market report · {MARKET_LABEL}
        </p>
        <h1 className="mt-3 font-display text-5xl leading-[1.05] tracking-tight text-ink sm:text-6xl">
          Hiring demand, decoded
        </h1>
        <p className="mt-5 max-w-2xl text-base leading-relaxed text-ink-soft sm:text-lg">
          We analyzed {insights.totalJobs} salon job posts. Here are the skills
          salons want most — the same signal that will pick Cosmo Connect&apos;s
          first classes.
        </p>
      </section>

      <section className="animate-rise animate-rise-delay-1 mt-12 grid gap-6 sm:grid-cols-3">
        <Stat
          label="Live listings"
          value={String(insights.totalJobs)}
        />
        <Stat
          label="Top skill"
          value={insights.topSkill?.skill ?? "—"}
          detail={
            insights.topSkill
              ? `${insights.topSkill.count} mentions`
              : undefined
          }
        />
        <Stat
          label="Top market"
          value={insights.cityBreakdown[0]?.city ?? "—"}
          detail={
            insights.cityBreakdown[0]
              ? `${insights.cityBreakdown[0].count} jobs`
              : undefined
          }
        />
      </section>

      <section className="mt-16 grid gap-14 lg:grid-cols-2">
        <div className="animate-rise animate-rise-delay-2">
          <h2 className="font-display text-3xl tracking-tight text-ink">
            Top skills salons ask for
          </h2>
          <p className="mt-3 text-sm text-ink-soft">
            Counted from skill mentions across every listing — not surveys.
          </p>
          <div className="mt-8">
            <SkillBars skills={insights.skillDemand} limit={12} />
          </div>
        </div>

        <div className="animate-rise animate-rise-delay-3 space-y-12">
          <div>
            <h2 className="font-display text-3xl tracking-tight text-ink">
              By city
            </h2>
            <ul className="mt-8 space-y-4">
              {insights.cityBreakdown.map((item, index) => (
                <li key={item.city}>
                  <div className="mb-1 flex justify-between text-sm">
                    <span>{item.city}</span>
                    <span className="tabular-nums text-ink-soft">
                      {item.count}
                    </span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-mist-deep/70">
                    <div
                      className="skill-bar-fill h-full rounded-full bg-ink/80"
                      style={{
                        width: `${(item.count / maxCity) * 100}%`,
                        animationDelay: `${0.05 * index}s`,
                      }}
                    />
                  </div>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h2 className="font-display text-3xl tracking-tight text-ink">
              Where listings come from
            </h2>
            <p className="mt-3 text-sm text-ink-soft">
              Instagram and Facebook groups outweigh Indeed in this industry.
            </p>
            <ul className="mt-8 space-y-4">
              {insights.sourceBreakdown.map((item, index) => (
                <li key={item.source}>
                  <div className="mb-1 flex justify-between text-sm">
                    <span>{item.source}</span>
                    <span className="tabular-nums text-ink-soft">
                      {item.count}
                    </span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-mist-deep/70">
                    <div
                      className="skill-bar-fill h-full rounded-full bg-gradient-to-r from-ink to-blush-deep"
                      style={{
                        width: `${(item.count / maxSource) * 100}%`,
                        animationDelay: `${0.05 * index}s`,
                      }}
                    />
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      <p className="animate-rise mt-16 text-sm text-ink-soft">
        Ready to browse roles?{" "}
        <Link
          href="/"
          className="text-blush-deep underline decoration-blush/50 underline-offset-4"
        >
          Back to the job board
        </Link>
      </p>
    </div>
  );
}

function Stat({
  label,
  value,
  detail,
}: {
  label: string;
  value: string;
  detail?: string;
}) {
  return (
    <div className="border-t border-line pt-4">
      <p className="text-[11px] uppercase tracking-[0.16em] text-ink-soft/70">
        {label}
      </p>
      <p className="mt-2 font-display text-3xl tracking-tight text-ink">
        {value}
      </p>
      {detail ? (
        <p className="mt-1 text-sm text-ink-soft">{detail}</p>
      ) : null}
    </div>
  );
}
