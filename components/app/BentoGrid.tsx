"use client"

import { ReactNode } from "react"
import { motion } from "framer-motion"
import { cn } from "@/lib/utils"
import { GlassCard } from "@/components/app/GlassCard"

type AccentTone = "gold" | "violet" | "ocean" | "emerald" | "blush" | "neutral"

interface BentoGridProps {
  className?: string
  children: ReactNode
}

export function BentoGrid({ className, children }: BentoGridProps) {
  return (
    <div
      className={cn(
        "grid gap-6 md:grid-cols-6 md:auto-rows-auto lg:auto-rows-[minmax(260px,_1fr)]",
        className
      )}
    >
      {children}
    </div>
  )
}

interface BentoGridItemProps {
  title?: string
  description?: string
  eyebrow?: string
  icon?: ReactNode
  accent?: AccentTone
  className?: string
  action?: ReactNode
  children?: ReactNode
}

const accentMap: Record<AccentTone, string> = {
  gold: "bg-[radial-gradient(circle_at_18%_18%,rgba(203,163,92,0.38),transparent_60%)]",
  violet: "bg-[radial-gradient(circle_at_80%_0%,rgba(181,132,255,0.28),transparent_65%)]",
  ocean: "bg-[radial-gradient(circle_at_10%_20%,rgba(99,132,255,0.28),transparent_65%)]",
  emerald: "bg-[radial-gradient(circle_at_80%_20%,rgba(91,214,161,0.28),transparent_65%)]",
  blush: "bg-[radial-gradient(circle_at_80%_80%,rgba(255,176,117,0.3),transparent_60%)]",
  neutral: "bg-[radial-gradient(circle_at_50%_50%,rgba(255,255,255,0.12),transparent_70%)]",
}

export function BentoGridItem({
  title,
  description,
  eyebrow,
  icon,
  accent = "neutral",
  className,
  action,
  children,
}: BentoGridItemProps) {
  return (
    <GlassCard
      className={cn(
        "group relative flex h-full flex-col overflow-hidden rounded-2xl border-white/12 p-6",
        className
      )}
      transition={{ duration: 0.5, ease: [0.32, 0.08, 0.24, 1] }}
    >
      <motion.div
        aria-hidden
        initial={{ opacity: 0.5 }}
        animate={{ opacity: 0.85 }}
        className={cn(
          "pointer-events-none absolute -inset-px mix-blend-screen blur-0 transition-opacity duration-500 group-hover:opacity-100",
          accentMap[accent]
        )}
      />
      <div className="relative flex flex-1 flex-col gap-5">
        {(eyebrow || icon) && (
          <div className="flex items-center justify-between gap-3 text-xs uppercase tracking-[0.32em] text-muted-foreground">
            {eyebrow && <span>{eyebrow}</span>}
            {icon && (
              <span className="flex h-9 w-9 items-center justify-center rounded-full border border-white/15 bg-white/10">
                {icon}
              </span>
            )}
          </div>
        )}
        {(title || description) && (
          <div className="space-y-3">
            {title && (
              <h3 className="text-2xl font-serif font-semibold leading-snug text-foreground">
                {title}
              </h3>
            )}
            {description && (
              <p className="text-sm text-muted-foreground">{description}</p>
            )}
          </div>
        )}
        <div className="flex-1 space-y-5 text-sm text-muted-foreground">
          {children}
        </div>
        {action && (
          <div className="mt-auto pt-4 text-sm text-muted-foreground">{action}</div>
        )}
      </div>
    </GlassCard>
  )
}
