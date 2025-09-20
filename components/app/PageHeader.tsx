"use client"

import { ReactNode } from "react"
import { GlassCard } from "@/components/app/GlassCard"
import { cn } from "@/lib/utils"

interface PageHeaderProps {
  title: string
  description?: string
  actions?: ReactNode
  className?: string
}

export function PageHeader({ title, description, actions, className }: PageHeaderProps) {
  return (
    <GlassCard
      variant="strong"
      className={cn(
        "flex flex-col gap-4 rounded-2xl border-white/15 bg-white/8 py-5 sm:flex-row sm:items-center sm:justify-between sm:py-6",
        className
      )}
      hover={false}
    >
      <div className="space-y-2">
        <h1 className="text-3xl font-serif font-semibold tracking-tight text-foreground">
          {title}
        </h1>
        {description && (
          <p className="text-sm text-muted-foreground">{description}</p>
        )}
      </div>
      {actions && (
        <div className="flex items-center gap-3">
          {actions}
        </div>
      )}
    </GlassCard>
  )
}
