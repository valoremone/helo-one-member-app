"use client"

import { TrendingUp, TrendingDown } from "lucide-react"
import { GlassCard } from "@/components/app/GlassCard"
import { cn } from "@/lib/utils"
import { motion } from "framer-motion"

interface StatCardProps {
  title: string
  value: string | number
  description?: string
  trend?: {
    value: number
    label: string
  }
  className?: string
}

export function StatCard({ title, value, description, trend, className }: StatCardProps) {
  return (
    <GlassCard className={cn("h-full", className)}>
      <div className="flex h-full flex-col justify-between space-y-4">
        <div className="space-y-2">
          <p className="text-xs uppercase tracking-[0.28em] text-muted-foreground">
            {title}
          </p>
          <motion.p
            key={String(value)}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.32, ease: [0.32, 0.08, 0.24, 1] }}
            className="text-4xl font-serif font-semibold text-foreground"
          >
            {value}
          </motion.p>
        </div>

        <div className="flex items-center justify-between text-sm text-muted-foreground">
          {description && <p>{description}</p>}
          {trend && (
            <span
              className={cn(
                "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-semibold backdrop-blur",
                trend.value > 0
                  ? "border-green-500/30 bg-green-500/15 text-green-200"
                  : "border-red-500/35 bg-red-500/15 text-red-200"
              )}
            >
              {trend.value > 0 ? (
                <TrendingUp className="h-3 w-3" />
              ) : (
                <TrendingDown className="h-3 w-3" />
              )}
              {trend.label}
            </span>
          )}
        </div>
      </div>
    </GlassCard>
  )
}
