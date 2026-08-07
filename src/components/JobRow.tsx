import Link from "next/link";
import { ApplyButton } from "@/components/ApplyButton";
import type { Job } from "@/lib/types";

function formatPosted(date: string) {
  const posted = new Date(`${date}T12:00:00Z`);
  const now = new Date("2026-08-06T12:00:00Z");
  const days = Math.max(
    0,
    Math.round((now.getTime() - posted.getTime()) / 86_400_000),
  );
  if (days === 0) return "Today";
  if (days === 1) return "1 day ago";
  return `${days} days ago`;
}

export function JobRow({ job }: { job: Job }) {
  return (
    <li className="grid gap-3 border-b border-line py-5 sm:grid-cols-[1fr_auto] sm:items-start sm:gap-8">
      <Link
        href={`/jobs/${job.id}`}
        className="group min-w-0 transition hover:opacity-90"
      >
        <p className="font-display text-xl tracking-tight text-ink transition-colors group-hover:text-blush-deep sm:text-2xl">
          {job.title}
        </p>
        <p className="mt-1 text-sm text-ink-soft">
          {job.salon} · {job.city}, {job.state}
        </p>
        <div className="mt-3 flex flex-wrap gap-2">
          {job.skills.map((skill) => (
            <span
              key={skill}
              className="text-xs uppercase tracking-[0.12em] text-ink-soft/80"
            >
              {skill}
            </span>
          ))}
        </div>
      </Link>
      <div className="flex flex-col items-start gap-3 text-left text-sm text-ink-soft sm:items-end sm:text-right">
        <div>
          <p className="tabular-nums text-ink">{job.pay}</p>
          <p className="mt-1">{job.employmentType}</p>
          <p className="mt-1 text-xs uppercase tracking-[0.12em] text-ink-soft/65">
            {job.source} · {formatPosted(job.postedAt)}
          </p>
        </div>
        <ApplyButton href={job.applyUrl} source={job.source} size="sm" />
      </div>
    </li>
  );
}
