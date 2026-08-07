import type { SkillCount } from "@/lib/types";

type SkillBarsProps = {
  skills: SkillCount[];
  limit?: number;
  animateFrom?: number;
};

export function SkillBars({
  skills,
  limit = 8,
  animateFrom = 0,
}: SkillBarsProps) {
  const visible = skills.slice(0, limit);
  const max = visible[0]?.count ?? 1;

  return (
    <ul className="space-y-3">
      {visible.map((item, index) => (
        <li key={item.skill}>
          <div className="mb-1 flex items-baseline justify-between gap-3 text-sm">
            <span className="text-ink">{item.skill}</span>
            <span className="tabular-nums text-ink-soft/80">
              {item.count} jobs
            </span>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-mist-deep/70">
            <div
              className="skill-bar-fill h-full rounded-full bg-gradient-to-r from-blush-deep to-champagne"
              style={{
                width: `${Math.max(8, (item.count / max) * 100)}%`,
                animationDelay: `${animateFrom + index * 0.05}s`,
              }}
            />
          </div>
        </li>
      ))}
    </ul>
  );
}
