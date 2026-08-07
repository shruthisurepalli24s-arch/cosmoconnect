export type Job = {
  id: string;
  title: string;
  salon: string;
  role: string;
  city: string;
  state: string;
  source: string;
  skills: string[];
  employmentType: string;
  pay: string;
  postedAt: string;
  description: string;
  /** Link back to the original posting / source search */
  applyUrl: string;
};

export type SkillCount = {
  skill: string;
  count: number;
  share: number;
};

export type CityCount = {
  city: string;
  count: number;
};

export type SourceCount = {
  source: string;
  count: number;
};

export type JobInsights = {
  totalJobs: number;
  skillDemand: SkillCount[];
  cityBreakdown: CityCount[];
  sourceBreakdown: SourceCount[];
  topSkill: SkillCount | null;
};
