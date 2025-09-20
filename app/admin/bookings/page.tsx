import { requireAdmin } from '@/lib/auth'
import { PageHeader } from '@/components/app/PageHeader'
import { EmptyState } from '@/components/app/EmptyState'
import { BookingsTable, type BookingRecord } from '@/components/app/tables/BookingsTable'
import { CalendarCheck } from 'lucide-react'

const mockBookings: BookingRecord[] = [
  {
    id: '1',
    itinerary: 'Private Jet - NYC to Aspen',
    status: 'confirmed',
    amount: '$15,000',
    commission: '$1,500',
    bookedDate: '2024-01-15',
  },
  {
    id: '2',
    itinerary: 'Hotel - The Ritz Paris',
    status: 'pending',
    amount: '$3,200',
    commission: '$320',
    bookedDate: '2024-01-14',
  },
  {
    id: '3',
    itinerary: 'Restaurant - Le Bernardin',
    status: 'confirmed',
    amount: '$450',
    commission: '$45',
    bookedDate: '2024-01-13',
  },
]

export default async function AdminBookingsPage() {
  await requireAdmin()

  return (
    <div className="space-y-8">
      <PageHeader
        title="Bookings"
        description="Track all confirmed bookings and commissions"
      />

      {mockBookings.length === 0 ? (
        <EmptyState
          icon={<CalendarCheck className="h-8 w-8 text-muted-foreground" />}
          title="No bookings yet"
          description="Confirmed bookings will appear here with commission details."
        />
      ) : (
        <BookingsTable data={mockBookings} />
      )}
    </div>
  )
}
