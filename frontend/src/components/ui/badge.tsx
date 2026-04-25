import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium transition-colors",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-primary/15 text-indigo-300 ring-1 ring-inset ring-primary/30",
        secondary:
          "border-transparent bg-white/[0.06] text-foreground/80 ring-1 ring-inset ring-white/10",
        success:
          "border-transparent bg-emerald-500/10 text-emerald-300 ring-1 ring-inset ring-emerald-500/30",
        warning:
          "border-transparent bg-amber-500/10 text-amber-300 ring-1 ring-inset ring-amber-500/30",
        destructive:
          "border-transparent bg-red-500/10 text-red-300 ring-1 ring-inset ring-red-500/30",
        outline: "text-foreground border-white/10",
      },
    },
    defaultVariants: { variant: "default" },
  },
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

export function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  );
}

export { badgeVariants };
