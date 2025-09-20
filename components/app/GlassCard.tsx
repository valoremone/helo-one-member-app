"use client"

import { ReactNode } from "react"
import { motion, type MotionProps } from "framer-motion"
import { cn } from "@/lib/utils"

interface GlassCardProps extends MotionProps {
  children: ReactNode
  className?: string
  variant?: "default" | "strong"
  hover?: boolean
}

export function GlassCard({ 
  children, 
  className, 
  variant = "default",
  hover = true, 
  initial,
  animate,
  transition,
  ...motionProps
}: GlassCardProps) {
  return (
    <motion.div
      className={cn(
        variant === "strong" ? "luxury-card-strong" : "luxury-card",
        hover && "glass-hover",
        className
      )}
      initial={initial ?? { opacity: 0, y: 12 }}
      animate={animate ?? { opacity: 1, y: 0 }}
      transition={transition ?? { duration: 0.32, ease: [0.32, 0.08, 0.24, 1] }}
      {...motionProps}
    >
      {children}
    </motion.div>
  )
}
