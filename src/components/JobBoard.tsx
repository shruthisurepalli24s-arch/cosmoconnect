"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useDeferredValue, useEffect, useMemo, useState, useTransition } from "react";
import { InsightsPanel } from "@/components/InsightsPanel";
import { JobRow } from "@/components/JobRow";
import { CITIES } from "@/lib/constants";
import { buildInsights, filterJobs } from "@/lib/jobs";
import type { Job } from "@/lib/types";

type JobBoardProps = {
  jobs: Job[];
  skills: string[];
};

export function JobBoard({ jobs, skills }: JobBoardProps) {
  const sources = useMemo(
    () => [...new Set(jobs.map((job) => job.source))].sort(),
    [jobs],
  );
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [, startTransition] = useTransition();

  const [q, setQ] = useState(searchParams.get("q") ?? "");
  const [city, setCity] = useState(searchParams.get("city") ?? "");
  const [skill, setSkill] = useState(searchParams.get("skill") ?? "");
  const [source, setSource] = useState(searchParams.get("source") ?? "");

  const deferredQ = useDeferredValue(q);

  useEffect(() => {
    setQ(searchParams.get("q") ?? "");
    setCity(searchParams.get("city") ?? "");
    setSkill(searchParams.get("skill") ?? "");
    setSource(searchParams.get("source") ?? "");
  }, [searchParams]);

  useEffect(() => {
    const params = new URLSearchParams();
    if (q.trim()) params.set("q", q.trim());
    if (city) params.set("city", city);
    if (skill) params.set("skill", skill);
    if (source) params.set("source", source);
    const next = params.toString();
    const current = searchParams.toString();
    if (next === current) return;

    const handle = window.setTimeout(() => {
      startTransition(() => {
        router.replace(next ? `${pathname}?${next}` : pathname, {
          scroll: false,
        });
      });
    }, 200);

    return () => window.clearTimeout(handle);
  }, [q, city, skill, source, pathname, router, searchParams, startTransition]);

  const filteredJobs = useMemo(
    () =>
      filterJobs(
        { q: deferredQ, city, skill, source },
        jobs,
      ),
    [jobs, deferredQ, city, skill, source],
  );

  const insights = useMemo(
    () => buildInsights(filteredJobs),
    [filteredJobs],
  );
  const allInsights = useMemo(() => buildInsights(jobs), [jobs]);
  const filtered = Boolean(deferredQ.trim() || city || skill || source);

  const selectClass =
    "w-full rounded-none border-0 border-b border-line bg-transparent px-0 py-2 text-sm text-ink outline-none transition focus:border-blush-deep";

  return (
    <>
      <section className="animate-rise animate-rise-delay-1 mt-4 border-y border-line py-4">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          <label className="lg:col-span-2">
            <span className="mb-1 block text-[11px] uppercase tracking-[0.16em] text-ink-soft/70">
              Search
            </span>
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Balayage, colorist, salon…"
              autoComplete="off"
              className="w-full rounded-none border-0 border-b border-line bg-transparent px-0 py-2 text-sm text-ink outline-none transition placeholder:text-ink-soft/40 focus:border-blush-deep"
            />
          </label>

          <label>
            <span className="mb-1 block text-[11px] uppercase tracking-[0.16em] text-ink-soft/70">
              City
            </span>
            <select
              className={selectClass}
              value={city}
              onChange={(e) => setCity(e.target.value)}
            >
              <option value="">All cities</option>
              {CITIES.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
          </label>

          <label>
            <span className="mb-1 block text-[11px] uppercase tracking-[0.16em] text-ink-soft/70">
              Skill
            </span>
            <select
              className={selectClass}
              value={skill}
              onChange={(e) => setSkill(e.target.value)}
            >
              <option value="">All skills</option>
              {skills.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
          </label>

          <label>
            <span className="mb-1 block text-[11px] uppercase tracking-[0.16em] text-ink-soft/70">
              Source
            </span>
            <select
              className={selectClass}
              value={source}
              onChange={(e) => setSource(e.target.value)}
            >
              <option value="">All sources</option>
              {sources.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
          </label>
        </div>
      </section>

      <section className="mt-6 grid gap-8 lg:grid-cols-[minmax(0,1.4fr)_minmax(280px,0.8fr)] lg:items-start">
        <div className="animate-rise animate-rise-delay-2 min-w-0">
          <div className="flex items-end justify-between gap-4">
            <h1 className="font-display text-2xl tracking-tight text-ink sm:text-3xl">
              Open roles
            </h1>
            <p className="text-sm tabular-nums text-ink-soft">
              {filteredJobs.length} listing
              {filteredJobs.length === 1 ? "" : "s"}
              {filtered ? " matching" : ""}
            </p>
          </div>

          {filteredJobs.length === 0 ? (
            <p className="mt-8 text-ink-soft">
              No listings match these filters. Try another city or skill.
            </p>
          ) : (
            <ul className="mt-1">
              {filteredJobs.map((job) => (
                <JobRow key={job.id} job={job} />
              ))}
            </ul>
          )}
        </div>

        <InsightsPanel insights={filtered ? insights : allInsights} />
      </section>
    </>
  );
}
