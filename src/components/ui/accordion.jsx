import * as React from "react"
import * as AccordionPrimitive from "@radix-ui/react-accordion"
import { motion } from "framer-motion"
import { ArrowDown01Icon } from "hugeicons-react"

import { cn } from "../../lib/utils"

const Accordion = AccordionPrimitive.Root

const AccordionItem = React.forwardRef(({ className, ...props }, ref) => (
    <AccordionPrimitive.Item
        ref={ref}
        className={cn("border-b border-white/8", className)}
        {...props}
    />
))
AccordionItem.displayName = "AccordionItem"

const AccordionTrigger = React.forwardRef(({ className, children, showArrow = true, ...props }, ref) => (
    <AccordionPrimitive.Header className="flex">
        <AccordionPrimitive.Trigger
            ref={ref}
            className={cn(
                "flex flex-1 items-center justify-between py-4 text-sm font-medium transition-all hover:bg-white/5 [&[data-state=open]>svg]:rotate-180",
                className
            )}
            {...props}
        >
            {children}
            {showArrow && (
                <motion.span
                    initial={false}
                    className="shrink-0"
                >
                    <ArrowDown01Icon className="h-5 w-5 text-white/50 transition-transform duration-300 ease-[cubic-bezier(0.32,0.72,0,1)]" />
                </motion.span>
            )}
        </AccordionPrimitive.Trigger>
    </AccordionPrimitive.Header>
))
AccordionTrigger.displayName = AccordionPrimitive.Trigger.displayName

const AccordionContent = React.forwardRef(({ className, children, ...props }, ref) => (
    <AccordionPrimitive.Content
        ref={ref}
        className={cn(
            "overflow-hidden text-sm",
            "data-[state=closed]:animate-accordion-up data-[state=open]:animate-accordion-down"
        )}
        {...props}
    >
        <motion.div 
            className={cn("pb-4 pt-0", className)}
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ 
                type: 'spring', 
                stiffness: 150, 
                damping: 22,
                delay: 0.1
            }}
        >
            {children}
        </motion.div>
    </AccordionPrimitive.Content>
))
AccordionContent.displayName = AccordionPrimitive.Content.displayName

export { Accordion, AccordionItem, AccordionTrigger, AccordionContent }
