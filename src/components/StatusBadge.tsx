import { STATUS_LABELS, STATUS_COLORS, STATUS_BG_COLORS, type LeadStatus } from "@/types";

interface StatusBadgeProps {
  status: LeadStatus;
  className?: string;
  onClick?: () => void;
}

export function StatusBadge({ status, className = "", onClick }: StatusBadgeProps) {
  const color = STATUS_COLORS[status];
  const bgColor = STATUS_BG_COLORS[status];
  const label = STATUS_LABELS[status];

  return (
    <span
      onClick={onClick}
      className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${onClick ? "cursor-pointer hover:opacity-80" : ""} ${className}`}
      style={{
        backgroundColor: bgColor,
        color: color,
        border: `1px solid ${color}25`,
      }}
    >
      <span
        className="w-1.5 h-1.5 rounded-full mr-1.5"
        style={{ backgroundColor: color }}
      />
      {label}
    </span>
  );
}
