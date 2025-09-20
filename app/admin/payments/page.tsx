import { requireAdmin } from '@/lib/auth'
import { PageHeader } from '@/components/app/PageHeader'
import { StatCard } from '@/components/app/StatCard'
import { EmptyState } from '@/components/app/EmptyState'
import { PaymentsTable, type PaymentRecord } from '@/components/app/tables/PaymentsTable'
import { Wallet } from 'lucide-react'

const mockPayments: PaymentRecord[] = [
  {
    id: '1',
    date: '2024-01-15',
    status: 'completed',
    amount: '$2,340',
    payoutMethod: 'Bank Transfer',
    bookingsPaid: 3,
  },
  {
    id: '2',
    date: '2024-01-01',
    status: 'completed',
    amount: '$1,890',
    payoutMethod: 'Bank Transfer',
    bookingsPaid: 2,
  },
  {
    id: '3',
    date: '2023-12-15',
    status: 'pending',
    amount: '$3,120',
    payoutMethod: 'Bank Transfer',
    bookingsPaid: 4,
  },
]

export default async function AdminPaymentsPage() {
  await requireAdmin()

  return (
    <div className="space-y-8">
      <PageHeader
        title="Payments"
        description="Track your earnings and payout history"
      />

      <div className="grid gap-6 md:grid-cols-2">
        <StatCard
          title="Completed Payments"
          value="$7,350"
          description="Total earned this quarter"
          trend={{ value: 15, label: "+15%" }}
        />
        <StatCard
          title="Next Payment"
          value="$3,120"
          description="Due in 2 days"
        />
      </div>

      {mockPayments.length === 0 ? (
        <EmptyState
          icon={<Wallet className="h-8 w-8 text-muted-foreground" />}
          title="No payments yet"
          description="Your payment history will appear here once you start earning commissions."
        />
      ) : (
        <PaymentsTable data={mockPayments} />
      )}
    </div>
  )
}
