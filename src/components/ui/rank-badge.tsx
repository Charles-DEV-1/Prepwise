import { getRankInfo } from "@/services/api/points";
import { cn } from "@/lib/utils";

type Props = {
  points: number;
  showProgress?: boolean;
  size?: "sm" | "md" | "lg";
};

export function RankBadge({
  points,
  showProgress = false,
  size = "md",
}: Props) {
  const rank = getRankInfo(points);

  const sizeStyles = {
    sm: "text-xs px-2 py-0.5 gap-1",
    md: "text-sm px-3 py-1 gap-1.5",
    lg: "text-base px-4 py-1.5 gap-2",
  };

  return (
    <div className="space-y-2">
      <div
        className={cn(
          "inline-flex items-center font-semibold rounded-full border",
          sizeStyles[size],
        )}
        style={{
          backgroundColor: `${rank.color}15`,
          borderColor: `${rank.color}40`,
          color: rank.color,
        }}
      >
        <span>{rank.emoji}</span>
        <span>{rank.name}</span>
        {size !== "sm" && (
          <span className="opacity-60 font-normal">
            {points.toLocaleString()} pts
          </span>
        )}
      </div>

      {showProgress && rank.nextRank && (
        <div className="space-y-1">
          <div className="flex justify-between text-xs text-slate-500">
            <span>{rank.name}</span>
            <span>
              {rank.nextRank.emoji} {rank.nextRank.name} in{" "}
              {rank.nextRank.min - points} pts
            </span>
          </div>
          <div className="h-1.5 bg-slate-200 rounded-full overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-500"
              style={{
                width: `${rank.progress}%`,
                backgroundColor: rank.color,
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
}
