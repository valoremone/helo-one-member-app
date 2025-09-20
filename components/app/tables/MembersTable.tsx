"use client"

import { DataTable, type Column } from "@/components/app/DataTable"
import { StatusPill, type StatusVariant } from "@/components/app/StatusPill"
import { cn } from "@/lib/utils"

export type MemberTier = "Platinum" | "Gold" | "Silver"
export type MemberStatus = "active" | "inactive" | "pending"

export interface MemberRecord {
  id: string
  name: string
  email: string
  status: MemberStatus
  tier: MemberTier
  requests: number
  city: string
  created: string
}

const tierTone: Record<MemberTier, string> = {
  Platinum: "text-purple-200",
  Gold: "text-yellow-200",
  Silver: "text-slate-200",
}

const statusTone: Record<MemberStatus, StatusVariant> = {
  active: "completed",
  pending: "in_progress",
  inactive: "canceled",
}

const columns: Column<MemberRecord>[] = [
  {
    key: "name",
    label: "Name",
    sortable: true,
    render: (_, row) => (
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/10 text-sm font-semibold text-accent">
          {row.name
            .split(" ")
            .map((n) => n[0])
            .join("")}
        </div>
        <div>
          <p className="text-sm font-medium text-foreground">{row.name}</p>
          <p className="text-xs text-muted-foreground">Primary member</p>
        </div>
      </div>
    ),
  },
  {
    key: "email",
    label: "Email",
    sortable: true,
    render: (value) => <span className="text-sm text-muted-foreground">{value as string}</span>,
  },
  {
    key: "status",
    label: "Status",
    sortable: true,
    render: (_, row) => <StatusPill status={statusTone[row.status]} />,
  },
  {
    key: "tier",
    label: "Tier",
    sortable: true,
    render: (value) => (
      <span
        className={cn(
          "rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs uppercase tracking-[0.2em]",
          tierTone[value as MemberTier]
        )}
      >
        {value as string}
      </span>
    ),
  },
  {
    key: "requests",
    label: "Requests",
    sortable: true,
    render: (value) => <span className="text-sm text-muted-foreground">{value as number}</span>,
  },
  {
    key: "city",
    label: "City",
    sortable: true,
    render: (value) => <span className="text-sm text-muted-foreground">{value as string}</span>,
  },
  {
    key: "created",
    label: "Created",
    sortable: true,
    render: (value) => (
      <span className="text-sm text-muted-foreground">
        {new Date(value as string).toLocaleDateString()}
      </span>
    ),
  },
]

interface MembersTableProps {
  data: MemberRecord[]
}

export function MembersTable({ data }: MembersTableProps) {
  return (
    <DataTable
      data={data}
      columns={columns}
      searchKey="name"
      emptyMessage="No members found"
      className="border-white/10"
    />
  )
}
