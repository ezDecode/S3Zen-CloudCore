'use client'

import * as React from "react"
import * as AccordionPrimitive from "@radix-ui/react-accordion"
import { motion, AnimatePresence } from "framer-motion"
import { PlusSignIcon, MinusSignIcon } from "hugeicons-react"

import { cn } from "../../lib/utils"

// Context to track which items are open
const AccordionContext = React.createContext({ openItems: [] })
const AccordionItemContext = React.createContext({ value: '', isOpen: false })

const Accordion = React.forwardRef(({ children, value, defaultValue, onValueChange, ...props }, ref) => {
    const [openItems, setOpenItems] = React.useState(() => {
        if (props.type === 'multiple') {
            return defaultValue || []
        }
        return defaultValue ? [defaultValue] : []
    })

    // Update openItems when controlled value changes
    React.useEffect(() => {
        if (value !== undefined) {
            if (props.type === 'multiple') {
                setOpenItems(value || [])
            } else {
                setOpenItems(value ? [value] : [])
            }
        }
    }, [value, props.type])

    const handleValueChange = (newValue) => {
        if (props.type === 'multiple') {
            setOpenItems(newValue || [])
        } else {
            setOpenItems(newValue ? [newValue] : [])
        }
        onValueChange?.(newValue)
    }

    return (
        <AccordionContext.Provider value={{ openItems }}>
            <AccordionPrimitive.Root
                ref={ref}
                value={value}
                defaultValue={defaultValue}
                onValueChange={handleValueChange}
                {...props}
            >
                {children}
            </AccordionPrimitive.Root>
        </AccordionContext.Provider>
    );
});
Accordion.displayName = "Accordion";

const AccordionItem = React.forwardRef(({ className, value, ...props }, ref) => {
    const { openItems } = React.useContext(AccordionContext)
    const isOpen = openItems.includes(value)

    return (
        <AccordionItemContext.Provider value={{ value, isOpen }}>
            <AccordionPrimitive.Item
                ref={ref}
                value={value}
                className={cn("border-b border-white/8", className)}
                {...props}
            />
        </AccordionItemContext.Provider>
    );
});
AccordionItem.displayName = "AccordionItem";

const AccordionTrigger = React.forwardRef(({ className, children, showIcon = true, ...props }, ref) => {
    const { isOpen } = React.useContext(AccordionItemContext)

    return (
        <AccordionPrimitive.Header className="flex">
            <AccordionPrimitive.Trigger
                ref={ref}
                className={cn(
                    "flex flex-1 items-center justify-between py-4 text-sm font-medium transition-all hover:bg-white/5",
                    className
                )}
                {...props}
            >
                {children}
                {showIcon && (
                    <span className="relative shrink-0 text-white/50 h-5 w-5">
                        <PlusSignIcon 
                            className={cn(
                                "absolute inset-0 h-5 w-5 transition-all duration-300 ease-in-out",
                                isOpen ? "rotate-90 opacity-0" : "rotate-0 opacity-100"
                            )} 
                        />
                        <MinusSignIcon 
                            className={cn(
                                "absolute inset-0 h-5 w-5 transition-all duration-300 ease-in-out",
                                isOpen ? "rotate-0 opacity-100" : "-rotate-90 opacity-0"
                            )} 
                        />
                    </span>
                )}
            </AccordionPrimitive.Trigger>
        </AccordionPrimitive.Header>
    );
});
AccordionTrigger.displayName = AccordionPrimitive.Trigger.displayName;

const AccordionContent = React.forwardRef(({ 
    className, 
    children,
    transition = { type: 'spring', stiffness: 200, damping: 24 },
    ...props 
}, ref) => {
    const { isOpen } = React.useContext(AccordionItemContext)

    return (
        <AnimatePresence initial={false}>
            {isOpen && (
                <AccordionPrimitive.Content ref={ref} forceMount asChild {...props}>
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ 
                            height: 'auto', 
                            opacity: 1,
                            transition: {
                                height: transition,
                                opacity: { duration: 0.2, delay: 0.1 }
                            }
                        }}
                        exit={{ 
                            height: 0, 
                            opacity: 0,
                            transition: {
                                height: { ...transition, duration: 0.2 },
                                opacity: { duration: 0.1 }
                            }
                        }}
                        style={{ overflow: 'hidden' }}
                    >
                        <div className={cn("pb-4 pt-0 text-sm", className)}>
                            {children}
                        </div>
                    </motion.div>
                </AccordionPrimitive.Content>
            )}
        </AnimatePresence>
    );
});
AccordionContent.displayName = AccordionPrimitive.Content.displayName;

export { Accordion, AccordionItem, AccordionTrigger, AccordionContent };
