import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva } from "class-variance-authority"

import { cn } from "../../lib/utils"

const buttonVariants = cva(
    "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg text-sm font-normal transition-colors duration-150 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-white/20 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
    {
        variants: {
            variant: {
                default:
                    "bg-white text-black shadow-lg hover:bg-white/90",
                destructive:
                    "bg-white/[0.08] text-white border border-white/[0.12] shadow-sm hover:bg-white/[0.1]",
                outline:
                    "border border-white/[0.08] bg-transparent shadow-sm hover:bg-white/[0.03] hover:border-white/[0.1]",
                secondary:
                    "bg-white/[0.04] text-white shadow-sm hover:bg-white/[0.05]",
                ghost: "hover:bg-white/[0.03] hover:text-white",
                link: "text-white/70 underline-offset-4 hover:underline hover:text-white",
            },
            size: {
                default: "h-9 px-4 py-2",
                sm: "h-8 rounded-lg px-3 text-xs",
                lg: "h-10 rounded-lg px-8",
                icon: "h-9 w-9",
            },
        },
        defaultVariants: {
            variant: "default",
            size: "default",
        },
    }
)

const Button = React.forwardRef(({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    return (
        <Comp
            className={cn(buttonVariants({ variant, size, className }))}
            ref={ref}
            {...props}
        />
    )
})
Button.displayName = "Button"

export { Button, buttonVariants }
