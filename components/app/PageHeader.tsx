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
        "surface-card flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between",
        className
      )}
      hover={false}
    >
      <div className="stack-tight">
        <h1 className="text-3xl font-serif font-medium tracking-tight text-foreground md:text-[2.2rem]">
          {title}
        </h1>
        {description && (
          <p className="text-sm text-muted-foreground md:text-base">
            {description}
          </p>
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
