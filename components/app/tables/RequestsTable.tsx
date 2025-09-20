"use client"

import { DataTable, type Column } from "@/components/app/DataTable"
import { StatusPill, type StatusVariant } from "@/components/app/StatusPill"

export interface RequestRecord {
  id: string
  subject: string
  type: "concierge" | "flight" | "other"
  status: StatusVariant
  priority: "high" | "medium" | "low"
  member: string
  created: string
}

const columns: Column<RequestRecord>[] = [
  {
    key: "subject",
    label: "Subject",
    sortable: true,
    render: (value) => (
      <div className="space-y-1">
        <p className="text-sm font-medium text-foreground">{value as string}</p>
        <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Request</p>
      </div>
    ),
  },
  {
    key: "type",
    label: "Type",
    sortable: true,
    render: (value) => (
      <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs uppercase tracking-[0.18em] text-muted-foreground">
        {value as string}
      </span>
    ),
  },
  {
    key: "status",
    label: "Status",
    sortable: true,
    render: (value) => <StatusPill status={value} />,
  },
  {
    key: "priority",
    label: "Priority",
    sortable: true,
    render: (value) => (
      <span className="text-sm font-semibold text-muted-foreground">{String(value).toUpperCase()}</span>
    ),
  },
  {
    key: "member",
    label: "Member",
    sortable: true,
    render: (value) => (
      <div>
        <p className="text-sm font-medium text-foreground">{value as string}</p>
        <p className="text-xs text-muted-foreground">Platinum member</p>
      </div>
    ),
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

interface RequestsTableProps {
  data: RequestRecord[]
}

export function RequestsTable({ data }: RequestsTableProps) {
  return (
    <DataTable
      data={data}
      columns={columns}
      searchKey="subject"
      emptyMessage="No requests found"
      className="border-white/10"
    />
  )
}
