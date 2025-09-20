"use client"

import { DataTable, type Column } from "@/components/app/DataTable"
import { StatusPill, type StatusVariant } from "@/components/app/StatusPill"

export type PaymentStatus = "completed" | "pending" | "canceled"

export interface PaymentRecord extends Record<string, unknown> {
  id: string
  date: string
  status: PaymentStatus
  amount: string
  payoutMethod: string
  bookingsPaid: number
}

const paymentStatusTone: Record<PaymentStatus, StatusVariant> = {
  completed: "completed",
  pending: "in_progress",
  canceled: "canceled",
}

const columns: Column<PaymentRecord>[] = [
  {
    key: "date",
    label: "Date",
    sortable: true,
    render: (value) => (
      <span className="text-sm text-muted-foreground">
        {new Date(value as string).toLocaleDateString()}
      </span>
    ),
  },
  {
    key: "status",
    label: "Status",
    sortable: true,
    render: (_, row) => <StatusPill status={paymentStatusTone[row.status]} />,
  },
  {
    key: "amount",
    label: "Amount",
    sortable: true,
    render: (value) => <span className="text-sm font-semibold text-foreground">{value as string}</span>,
  },
  {
    key: "payoutMethod",
    label: "Payout Method",
    sortable: true,
    render: (value) => <span className="text-sm text-muted-foreground">{value as string}</span>,
  },
  {
    key: "bookingsPaid",
    label: "Bookings Paid",
    sortable: true,
    render: (value) => <span className="text-sm text-muted-foreground">{value as number} bookings</span>,
  },
]

interface PaymentsTableProps {
  data: PaymentRecord[]
}

export function PaymentsTable({ data }: PaymentsTableProps) {
  const handleRowClick = (row: PaymentRecord) => {
    console.log("View payment:", row.id)
  }

  return (
    <DataTable
      data={data}
      columns={columns}
      searchKey="payoutMethod"
      onRowClick={handleRowClick}
      emptyMessage="No payments found"
      className="border-white/10"
    />
  )
}
