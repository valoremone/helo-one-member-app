import { requireMember } from '@/lib/auth'
import { PageHeader } from '@/components/app/PageHeader'
import { DataTable, Column } from '@/components/app/DataTable'
import { EmptyState } from '@/components/app/EmptyState'
import { CalendarCheck } from 'lucide-react'

// Mock data for now - will be replaced with real data
const mockBookings = [
  {
    id: '1',
    itinerary: 'Private Jet - NYC to Aspen',
    status: 'confirmed',
    amount: '$15,000',
    date: '2024-01-15',
  },
  {
    id: '2',
    itinerary: 'Hotel - The Ritz Paris',
    status: 'confirmed',
    amount: '$3,200',
    date: '2024-01-14',
  },
  {
    id: '3',
    itinerary: 'Restaurant - Le Bernardin',
    status: 'pending',
    amount: '$450',
    date: '2024-01-13',
  },
]

export default async function MemberBookingsPage() {
  await requireMember()

  const columns: Column<typeof mockBookings[0]>[] = [
    {
      key: 'itinerary',
      label: 'Itinerary/Hotel',
      sortable: true,
    },
    {
      key: 'status',
      label: 'Status',
      sortable: true,
      render: (value) => (
        <span className={`status-pill ${
          value === 'confirmed' ? 'status-completed' :
          value === 'pending' ? 'status-in-progress' :
          'status-canceled'
        }`}>
          {value as string}
        </span>
      ),
    },
    {
      key: 'amount',
      label: 'Amount',
      sortable: true,
      render: (value) => (
        <span className="font-medium text-foreground">{value as string}</span>
      ),
    },
    {
      key: 'date',
      label: 'Booking Date',
      sortable: true,
      render: (value) => (
        <span className="text-sm text-muted-foreground">
          {new Date(value as string).toLocaleDateString()}
        </span>
      ),
    },
  ]

  return (
    <div className="space-y-8">
      <PageHeader
        title="My Bookings"
        description="View your confirmed luxury travel bookings"
      />

      {mockBookings.length === 0 ? (
        <EmptyState
          icon={<CalendarCheck className="h-8 w-8 text-muted-foreground" />}
          title="No bookings yet"
          description="Your confirmed bookings will appear here once requests are processed."
        />
      ) : (
        <DataTable
          data={mockBookings}
          columns={columns}
          searchKey="itinerary"
          onRowClick={(row) => console.log("View booking:", row.id)}
          emptyMessage="No bookings found"
        />
      )}
    </div>
  )
}
