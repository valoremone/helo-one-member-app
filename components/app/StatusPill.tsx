"use client"

import { cn } from "@/lib/utils"

export type StatusVariant = "new" | "in_progress" | "awaiting_member" | "completed" | "canceled"

interface StatusPillProps {
  status: StatusVariant
  className?: string
}

const statusConfig = {
  new: {
    label: "New",
    className: "status-new",
  },
  in_progress: {
    label: "In Progress",
    className: "status-in-progress",
  },
  awaiting_member: {
    label: "Awaiting Member",
    className: "status-awaiting-member",
  },
  completed: {
    label: "Completed",
    className: "status-completed",
  },
  canceled: {
    label: "Canceled",
    className: "status-canceled",
  },
}

export function StatusPill({ status, className }: StatusPillProps) {
  const config = statusConfig[status]

  return (
    <span className={cn("status-pill", config.className, className)}>
      {config.label}
    </span>
  )
}
