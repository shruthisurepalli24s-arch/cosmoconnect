import Link from "next/link";
import { notFound } from "next/navigation";
import { ApplyButton } from "@/components/ApplyButton";
import { buildInsights, getAllJobs, getJobById } from "@/lib/jobs";

type JobPageProps = {
  params: Promise<{ id: string }>;
};

export function generateStaticParams() {
  return getAllJobs().map((job) => ({ id: job.id }));
}

export async function generateMetadata({ params }: JobPageProps) {
  const { id } = await params;
  const job = getJobById(id);
  if (!job) return { title: "Job not found — Cosmo Connect" };
  return {
    title: `${job.title} — Cosmo Connect`,
    description: job.description,
  };
}

export default async function JobPage({ params }: JobPageProps) {
  const { id } = await params;
  const job = getJobById(id);
  if (!job) notFound();

  const insights = buildInsights();
  const relatedSkills = insights.skillDemand.filter((item) =>
    job.skills.includes(item.skill),
  );

  return (
    <div className="mx-auto max-w-3xl px-5 pb-20 pt-10 sm:px-8 sm:pt-14">
      <Link
        href="/"
        className="text-sm text-ink-soft transition hover:text-ink"
      >
        ← All jobs
      </Link>

      <article className="animate-rise mt-8">
        <p className="text-[11px] uppercase tracking-[0.18em] text-ink-soft/70">
          {job.source} · {job.city}, {job.state}
        </p>
        <h1 className="mt-3 font-display text-4xl leading-tight tracking-tight text-ink sm:text-5xl">
          {job.title}
        </h1>
        <p className="mt-4 text-lg text-ink-soft">
          {job.salon} · {job.employmentType} · {job.pay}
        </p>

        <div className="mt-6 flex flex-wrap items-center gap-4">
          <ApplyButton href={job.applyUrl} source={job.source} />
          <p className="text-xs text-ink-soft/70">
            Opens the original posting (via {job.source})
          </p>
        </div>

        <div className="mt-8 flex flex-wrap gap-x-4 gap-y-2 border-y border-line py-5 text-sm uppercase tracking-[0.12em] text-ink-soft">
          {job.skills.map((skill) => (
            <Link
              key={skill}
              href={`/?skill=${encodeURIComponent(skill)}`}
              className="transition hover:text-blush-deep"
            >
              {skill}
            </Link>
          ))}
        </div>

        <p className="mt-8 text-base leading-relaxed text-ink-soft">
          {job.description}
        </p>

        <section className="mt-12">
          <h2 className="font-display text-2xl tracking-tight text-ink">
            Why this skill matters
          </h2>
          <p className="mt-3 text-sm text-ink-soft">
            Demand across the full Cosmo Connect board for skills on this role:
          </p>
          <ul className="mt-6 space-y-3">
            {relatedSkills.map((item) => (
              <li
                key={item.skill}
                className="flex items-baseline justify-between gap-4 border-b border-line pb-3 text-sm"
              >
                <span className="text-ink">{item.skill}</span>
                <span className="tabular-nums text-ink-soft">
                  {item.count} of {insights.totalJobs} jobs (
                  {Math.round(item.share * 100)}%)
                </span>
              </li>
            ))}
          </ul>
        </section>

        <p className="mt-10 text-xs text-ink-soft/70">
          Posted {job.postedAt}. Aggregated for market visibility — verify
          details with the salon before applying.
        </p>
      </article>
    </div>
  );
}
