import * as React from "react"
import { cn } from "../../lib/utils"

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: "default" | "secondary" | "outline" | "github" | "leetcode" | "hackerrank"
}

const Badge = React.forwardRef<HTMLSpanElement, BadgeProps>(
  ({ className, variant = "default", ...props }, ref) => {
    return (
      <span
        ref={ref}
        className={cn(
          "inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
          {
            "bg-accent/10 text-accent border border-accent/20":
              variant === "default",
            "bg-surface-2 text-text border border-border hover:bg-surface-2/80":
              variant === "secondary",
            "border border-border text-muted hover:text-text":
              variant === "outline",
            "bg-[#6B7280]/10 text-[#9CA3AF] border border-[#6B7280]/20":
              variant === "github",
            "bg-[#F59E0B]/10 text-[#FBBF24] border border-[#F59E0B]/20":
              variant === "leetcode",
            "bg-[#10B981]/10 text-[#34D399] border border-[#10B981]/20":
              variant === "hackerrank",
          },
          className,
        )}
        {...props}
      />
    )
  },
)
Badge.displayName = "Badge"

export default Badge
