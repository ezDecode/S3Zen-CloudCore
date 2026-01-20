import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { Slot } from "radix-ui"

import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "inline-flex items-center rounded-lg border bg-zinc-50 px-1.5 py-0.5 font-mono text-xs text-muted-foreground dark:bg-zinc-900 [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-3.5 transition-colors",
  {
    variants: {
      variant: {
        default: "border-edge",
        secondary: "bg-secondary text-secondary-foreground border-border",
        destructive: "bg-destructive/10 text-destructive border-destructive/20 dark:bg-destructive/20",
        outline: "border-border text-foreground bg-transparent",
        info: "bg-info/10 text-info border-info/20",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

function Badge({
  className,
  variant,
  asChild = false,
  ...props
}: React.ComponentProps<"span"> &
  VariantProps<typeof badgeVariants> & { asChild?: boolean }) {
  const Comp = asChild ? Slot.Root : "span"

  return (
    <Comp
      data-slot="badge"
      className={cn(badgeVariants({ variant }), className)}
      {...props}
    />
  )
}

export { Badge, badgeVariants }
