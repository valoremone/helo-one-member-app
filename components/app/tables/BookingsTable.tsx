"use client"

import { DataTable, type Column } from "@/components/app/DataTable"
import { StatusPill, type StatusVariant } from "@/components/app/StatusPill"

export type BookingStatus = "confirmed" | "pending" | "canceled"

export interface BookingRecord extends Record<string, unknown> {
  id: string
  itinerary: string
  status: BookingStatus
  amount: string
  commission: string
  member: string
  bookedDate: string
}

const statusLookup: Record<BookingStatus, StatusVariant> = {
  confirmed: "completed",
  pending: "in_progress",
  canceled: "canceled",
}

const columns: Column<BookingRecord>[] = [
  {
    key: "itinerary",
    label: "Itinerary/Hotel",
    sortable: true,
    render: (value) => (
      <div className="space-y-1">
        <p className="text-sm font-medium text-foreground">{value as string}</p>
        <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Journey</p>
      </div>
    ),
  },
  {
    key: "member",
    label: "Member",
    sortable: true,
    render: (value) => (
      <div>
        <p className="text-sm font-medium text-foreground">{value as string}</p>
      </div>
    ),
  },
  {
    key: "status",
    label: "Status",
    sortable: true,
    render: (_, row) => <StatusPill status={statusLookup[row.status]} />,
  },
  {
    key: "amount",
    label: "Amount",
    sortable: true,
    render: (value) => <span className="text-sm font-semibold text-foreground">{value as string}</span>,
  },
  {
    key: "commission",
    label: "Commission",
    sortable: true,
    render: (value) => <span className="text-sm font-semibold text-accent">{value as string}</span>,
  },
  {
    key: "bookedDate",
    label: "Booked Date",
    sortable: true,
    render: (value) => (
      <span className="text-sm text-muted-foreground">
        {new Date(value as string).toLocaleDateString()}
      </span>
    ),
  },
]

interface BookingsTableProps {
  data: BookingRecord[]
}

export function BookingsTable({ data }: BookingsTableProps) {
  const handleRowClick = (row: BookingRecord) => {
    // TODO: replace with modal/drawer when ready
    console.log("View booking:", row.id)
  }

  return (
    <DataTable
      data={data}
      columns={columns}
      searchKey="itinerary"
      onRowClick={handleRowClick}
      emptyMessage="No bookings found"
      className="border-white/10"
    />
  )
}
