import { Suspense } from "react";
import { JobBoard } from "@/components/JobBoard";
import { MARKET_LABEL } from "@/lib/constants";
import {
  buildInsights,
  getAllJobs,
  getAllSkills,
  getJobsMeta,
} from "@/lib/jobs";

export default function Home() {
  const jobs = getAllJobs();
  const skills = getAllSkills();
  const totalJobs = buildInsights(jobs).totalJobs;
  const meta = getJobsMeta();
  const isLive = meta.source === "Adzuna" && Boolean(meta.fetchedAt);
  const fetchedLabel = meta.fetchedAt
    ? new Date(meta.fetchedAt).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      })
    : null;

  return (
    <div className="mx-auto max-w-6xl px-5 pb-16 pt-5 sm:px-8 sm:pt-6">
      <p className="animate-rise text-sm text-ink-soft">
        <span className="text-[11px] uppercase tracking-[0.16em] text-ink-soft/70">
          {MARKET_LABEL}
        </span>
        <span className="mx-2 text-line">·</span>
        {totalJobs} listings
        {isLive
          ? ` · live via Adzuna${fetchedLabel ? ` · updated ${fetchedLabel}` : ""}`
          : " · demo seed data (connect Adzuna for real postings)"}
      </p>

      <Suspense
        fallback={
          <div className="mt-4 h-40 animate-pulse bg-mist/50" aria-hidden />
        }
      >
        <JobBoard jobs={jobs} skills={skills} />
      </Suspense>
    </div>
  );
}
