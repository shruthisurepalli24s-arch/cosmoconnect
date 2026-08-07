type ApplyButtonProps = {
  href: string;
  source?: string;
  size?: "sm" | "md";
};

export function ApplyButton({ href, source, size = "md" }: ApplyButtonProps) {
  const sizeClass =
    size === "sm"
      ? "px-3 py-1.5 text-xs tracking-[0.12em]"
      : "px-5 py-2.5 text-sm tracking-[0.14em]";

  const label = source ? `Apply · ${shortSource(source)}` : "Apply";

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className={`inline-flex items-center justify-center bg-ink text-paper uppercase transition hover:bg-blush-deep ${sizeClass}`}
    >
      {label}
    </a>
  );
}

function shortSource(source: string) {
  if (source === "Facebook Groups") return "Facebook";
  if (source === "Independent salon websites") return "salon site";
  if (source === "Academy bulletin boards") return "academy board";
  if (source === "Local salons") return "salon";
  return source;
}
