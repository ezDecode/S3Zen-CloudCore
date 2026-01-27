import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { Slot } from "@radix-ui/react-slot"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "group relative isolate inline-flex items-center justify-center overflow-hidden text-left font-medium transition-all duration-300 ease-[cubic-bezier(0.4,0.36,0,1)] rounded-md shadow-[0_1px_theme(colors.white/0.07)_inset,0_1px_3px_theme(colors.gray.900/0.2)] ring-1 focus-visible:ring-brand/50 active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none whitespace-nowrap select-none box-border appearance-none m-0",
  {
    variants: {
      variant: {
        default: "bg-gray-900 text-white ring-gray-900 hover:bg-gray-800 border border-transparent before:absolute before:inset-0 before:-z-10 before:rounded-md before:bg-gradient-to-b before:from-white/20 before:opacity-50 hover:before:opacity-100 before:transition-opacity before:duration-300 after:absolute after:inset-0 after:-z-10 after:rounded-md after:bg-gradient-to-b after:from-white/10 after:from-[46%] after:to-[54%] after:mix-blend-overlay",
        brand: "bg-brand text-white ring-brand border border-transparent hover:brightness-110",
        secondary: "bg-secondary text-secondary-foreground ring-secondary border border-transparent hover:bg-secondary/80",
        destructive: "bg-destructive text-destructive-foreground ring-destructive border border-transparent hover:bg-destructive/90",
        outline: "border border-input bg-background hover:bg-accent hover:text-accent-foreground ring-input/50 shadow-none",
        ghost: "hover:bg-accent hover:text-accent-foreground ring-transparent shadow-none border border-transparent",
        link: "text-brand underline-offset-4 hover:underline active:scale-100 ring-transparent shadow-none border border-transparent",
      },
      size: {
        default: "h-10 px-4 py-2 text-sm gap-1.5",
        sm: "h-8 px-3 text-xs gap-1",
        lg: "h-12 px-8 text-base gap-1.5",
        xl: "h-14 px-10 text-lg gap-2",
        launch: "h-10 px-4 text-sm font-semibold tracking-tight gap-2",
        icon: "h-10 w-10",
        "icon-sm": "h-8 w-8",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
  VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }
