import { requireAdmin } from '@/lib/auth'
import { createClient } from '@/lib/supabaseServer'
import { PageHeader } from '@/components/app/PageHeader'
import { EmptyState } from '@/components/app/EmptyState'
import { BookingsTable, type BookingRecord } from '@/components/app/tables/BookingsTable'
import { CalendarCheck } from 'lucide-react'

export default async function AdminBookingsPage() {
  await requireAdmin()
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('bookings')
    .select('id, itinerary, status, amount, commission, currency, booked_date, created_at, members:member_id ( first_name, last_name, email )')
    .order('booked_date', { ascending: false })

  if (error) {
    console.error('Failed to load bookings', error)
    throw new Error('Unable to load bookings')
  }

  const formatCurrency = (value: unknown, currency = 'USD') => {
    const numericValue = typeof value === 'number' ? value : Number(value ?? 0)
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency,
      maximumFractionDigits: 0,
    }).format(numericValue)
  }

  type MemberJoin = {
    first_name: string | null
    last_name: string | null
    email: string
  }

  type AdminBookingRow = {
    id: string
    itinerary: string
    status: string
    amount: number | string | null
    commission: number | string | null
    currency: string | null
    booked_date: string | null
    created_at: string
    members: MemberJoin | MemberJoin[] | null
  }

  const bookings: BookingRecord[] = ((data ?? []) as AdminBookingRow[]).map((row) => {
    const member = Array.isArray(row.members) ? (row.members[0] ?? null) : row.members

    const memberName = member
      ? [member.first_name, member.last_name].filter(Boolean).join(' ') || member.email
      : 'Unknown member'

    return {
      id: row.id,
      itinerary: row.itinerary,
      status: row.status as BookingRecord['status'],
      amount: formatCurrency(row.amount, row.currency ?? 'USD'),
      commission: formatCurrency(row.commission, row.currency ?? 'USD'),
      member: memberName,
      bookedDate: row.booked_date ?? row.created_at,
    }
  })

  return (
    <div className="space-y-8">
      <PageHeader
        title="Bookings"
        description="Track all confirmed bookings and commissions"
      />

      {bookings.length === 0 ? (
        <EmptyState
          icon={<CalendarCheck className="h-8 w-8 text-muted-foreground" />}
          title="No bookings yet"
          description="Confirmed bookings will appear here with commission details."
        />
      ) : (
        <BookingsTable data={bookings} />
      )}
    </div>
  )
}
