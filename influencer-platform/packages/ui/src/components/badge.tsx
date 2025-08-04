import { cva, type VariantProps } from "class-variance-authority"
import * as React from "react"
import { cn } from "../lib/utils"

const badgeVariants = cva(
  "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold transition-all duration-200",
  {
    variants: {
      variant: {
        default:
          "bg-primary/10 text-primary border border-primary/20 hover:bg-primary/20",
        secondary:
          "bg-secondary/10 text-secondary border border-secondary/20 hover:bg-secondary/20",
        destructive:
          "bg-destructive/10 text-destructive border border-destructive/20 hover:bg-destructive/20",
        outline: "border border-input hover:bg-accent hover:text-accent-foreground",
        success:
          "bg-emerald-500/10 text-emerald-700 border border-emerald-500/20 hover:bg-emerald-500/20 dark:text-emerald-400",
        warning:
          "bg-amber-500/10 text-amber-700 border border-amber-500/20 hover:bg-amber-500/20 dark:text-amber-400",
        gradient:
          "bg-gradient-to-r from-primary/10 to-purple-600/10 text-primary border border-primary/20",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  )
}

export { Badge, badgeVariants }