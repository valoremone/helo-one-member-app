import { requireAdmin } from '@/lib/auth'
import { PageHeader } from '@/components/app/PageHeader'
import { RequestFormSheet } from '@/components/app/RequestFormSheet'
import { EmptyState } from '@/components/app/EmptyState'
import { RequestsTable, type RequestRecord } from '@/components/app/tables/RequestsTable'
import { ClipboardList } from 'lucide-react'

const mockRequests: RequestRecord[] = [
  {
    id: '1',
    subject: 'Private Jet to Aspen',
    type: 'flight',
    status: 'new',
    priority: 'high',
    member: 'John Smith',
    created: '2024-01-15',
  },
  {
    id: '2',
    subject: 'Restaurant Reservations',
    type: 'concierge',
    status: 'in_progress',
    priority: 'medium',
    member: 'Sarah Johnson',
    created: '2024-01-14',
  },
  {
    id: '3',
    subject: 'Hotel Booking - Paris',
    type: 'concierge',
    status: 'awaiting_member',
    priority: 'low',
    member: 'Michael Brown',
    created: '2024-01-13',
  },
  {
    id: '4',
    subject: 'Event Tickets - Wimbledon',
    type: 'concierge',
    status: 'completed',
    priority: 'high',
    member: 'Emily Davis',
    created: '2024-01-12',
  },
]

export default async function AdminRequestsPage() {
  await requireAdmin()

  return (
    <div className="space-y-8">
      <PageHeader
        title="Requests"
        description="Manage and track all member requests"
        actions={<RequestFormSheet />}
      />

      {mockRequests.length === 0 ? (
        <EmptyState
          icon={<ClipboardList className="h-8 w-8 text-muted-foreground" />}
          title="No requests yet"
          description="When members submit requests, they'll appear here for you to manage."
        />
      ) : (
        <RequestsTable data={mockRequests} />
      )}
    </div>
  )
}
