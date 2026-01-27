import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { Slot } from "@radix-ui/react-slot"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "group relative isolate inline-flex items-center justify-center overflow-hidden text-left font-medium transition duration-300 ease-[cubic-bezier(0.4,0.36,0,1)] before:duration-300 before:ease-[cubic-bezier(0.4,0.36,0,1)] before:transition-opacity rounded-md shadow-[0_1px_theme(colors.white/0.07)_inset,0_1px_3px_theme(colors.gray.900/0.2)] before:pointer-events-none before:absolute before:inset-0 before:-z-10 before:rounded-md before:bg-gradient-to-b before:from-white/20 before:opacity-50 hover:before:opacity-100 after:pointer-events-none after:absolute after:inset-0 after:-z-10 after:rounded-md after:bg-gradient-to-b after:from-white/10 after:from-[46%] after:to-[54%] after:mix-blend-overlay ring-1 focus-visible:ring-brand/50 active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none whitespace-nowrap select-none box-border appearance-none m-0",
  {
    variants: {
      variant: {
        default: "bg-gray-900 text-white ring-gray-900 hover:bg-gray-800 border border-transparent",
        brand: "bg-brand text-white ring-brand border border-transparent",
        secondary: "bg-secondary text-secondary-foreground ring-secondary border border-transparent",
        destructive: "bg-destructive text-destructive-foreground ring-destructive border border-transparent",
        outline: "border border-input bg-background hover:bg-accent hover:text-accent-foreground ring-input/50 shadow-none",
        ghost: "hover:bg-accent hover:text-accent-foreground ring-transparent shadow-none before:opacity-0 after:opacity-0 border border-transparent",
        link: "text-brand underline-offset-4 hover:underline active:scale-100 ring-transparent shadow-none before:opacity-0 after:opacity-0 border border-transparent",
      },
      size: {
        default: "h-[1.875rem] px-3 text-sm gap-2",
        sm: "h-6.5 px-1 text-[11px] gap-1.5",
        lg: "h-10 px-2 text-base gap-2.5",
        icon: "size-7.5",
        "icon-xs": "size-6",
        launch: "h-10 px-4 text-sm gap-2",
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
