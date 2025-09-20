"use client"

import { ReactNode } from "react"
import { Button } from "@/components/ui/button"
import { GlassCard } from "@/components/app/GlassCard"
import { cn } from "@/lib/utils"

interface EmptyStateProps {
  icon?: ReactNode
  title: string
  description: string
  primaryAction?: {
    label: string
    onClick: () => void
  }
  secondaryAction?: {
    label: string
    onClick: () => void
  }
  className?: string
}

export function EmptyState({
  icon,
  title,
  description,
  primaryAction,
  secondaryAction,
  className,
}: EmptyStateProps) {
  return (
    <GlassCard hover={false} className={cn("text-center", className)}>
      {icon && (
        <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full border border-white/10 bg-white/10 text-accent">
          {icon}
        </div>
      )}
      <h3 className="mb-3 text-lg font-semibold text-foreground">{title}</h3>
      <p className="mx-auto mb-6 max-w-sm text-sm text-muted-foreground">{description}</p>
      <div className="flex flex-wrap items-center justify-center gap-3">
        {primaryAction && (
          <Button onClick={primaryAction.onClick} className="rounded-full px-5">
            {primaryAction.label}
          </Button>
        )}
        {secondaryAction && (
          <Button variant="outline" onClick={secondaryAction.onClick} className="rounded-full px-5">
            {secondaryAction.label}
          </Button>
        )}
      </div>
    </GlassCard>
  )
}
