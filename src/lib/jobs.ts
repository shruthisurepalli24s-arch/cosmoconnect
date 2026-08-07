import jobsData from "@/data/jobs.json";
import jobsMeta from "@/data/jobs-meta.json";
import type { Job, JobInsights } from "@/lib/types";

const jobs = jobsData as Job[];

export type JobsMeta = {
  source?: string;
  fetchedAt?: string | null;
  count?: number;
  note?: string;
};

export function getJobsMeta(): JobsMeta {
  return jobsMeta as JobsMeta;
}

export type JobFilters = {
  q?: string;
  city?: string;
  skill?: string;
  source?: string;
};

export function getAllJobs(): Job[] {
  return jobs;
}

export function getJobById(id: string): Job | undefined {
  return jobs.find((job) => job.id === id);
}

export function getAllSkills(): string[] {
  return [...new Set(jobs.flatMap((job) => job.skills))].sort((a, b) =>
    a.localeCompare(b),
  );
}

export function filterJobs(
  filters: JobFilters,
  list: Job[] = jobs,
): Job[] {
  const q = filters.q?.trim().toLowerCase();
  const city = filters.city?.trim();
  const skill = filters.skill?.trim();
  const source = filters.source?.trim();

  return list.filter((job) => {
    if (city && job.city !== city) return false;
    if (source && job.source !== source) return false;
    if (skill && !job.skills.includes(skill)) return false;
    if (q) {
      const haystack = [
        job.title,
        job.salon,
        job.role,
        job.city,
        job.description,
        ...job.skills,
      ]
        .join(" ")
        .toLowerCase();
      if (!haystack.includes(q)) return false;
    }
    return true;
  });
}

export function buildInsights(subset: Job[] = jobs): JobInsights {
  const totalJobs = subset.length;
  const skillMap = new Map<string, number>();
  const cityMap = new Map<string, number>();
  const sourceMap = new Map<string, number>();

  for (const job of subset) {
    cityMap.set(job.city, (cityMap.get(job.city) ?? 0) + 1);
    sourceMap.set(job.source, (sourceMap.get(job.source) ?? 0) + 1);
    for (const skill of job.skills) {
      skillMap.set(skill, (skillMap.get(skill) ?? 0) + 1);
    }
  }

  const skillDemand = [...skillMap.entries()]
    .map(([skill, count]) => ({
      skill,
      count,
      share: totalJobs ? count / totalJobs : 0,
    }))
    .sort((a, b) => b.count - a.count);

  const cityBreakdown = [...cityMap.entries()]
    .map(([city, count]) => ({ city, count }))
    .sort((a, b) => b.count - a.count);

  const sourceBreakdown = [...sourceMap.entries()]
    .map(([source, count]) => ({ source, count }))
    .sort((a, b) => b.count - a.count);

  return {
    totalJobs,
    skillDemand,
    cityBreakdown,
    sourceBreakdown,
    topSkill: skillDemand[0] ?? null,
  };
}
