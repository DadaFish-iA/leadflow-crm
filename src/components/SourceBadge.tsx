import { SOURCE_LABELS, SOURCE_COLORS, type LeadSource } from "@/types";

interface SourceBadgeProps {
  source: LeadSource;
  className?: string;
}

export function SourceBadge({ source, className = "" }: SourceBadgeProps) {
  const color = SOURCE_COLORS[source];
  const label = SOURCE_LABELS[source];

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${className}`}
      style={{
        backgroundColor: `${color}18`,
        color: color,
        border: `1px solid ${color}30`,
      }}
    >
      <span
        className="w-1.5 h-1.5 rounded-full"
        style={{ backgroundColor: color }}
      />
      {label}
    </span>
  );
}
