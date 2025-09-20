import { requireMember } from '@/lib/auth'
import { PageHeader } from '@/components/app/PageHeader'
import { DataTable, Column } from '@/components/app/DataTable'
import { RequestFormSheet } from '@/components/app/RequestFormSheet'
import { StatusPill } from '@/components/app/StatusPill'
import { EmptyState } from '@/components/app/EmptyState'
import { ClipboardList } from 'lucide-react'

// Mock data for now - will be replaced with real data
const mockRequests = [
  {
    id: '1',
    subject: 'Private Jet to Aspen',
    type: 'flight',
    status: 'completed',
    priority: 'high',
    created: '2024-01-15',
  },
  {
    id: '2',
    subject: 'Restaurant Reservations',
    type: 'concierge',
    status: 'in_progress',
    priority: 'medium',
    created: '2024-01-14',
  },
  {
    id: '3',
    subject: 'Hotel Booking - Paris',
    type: 'concierge',
    status: 'new',
    priority: 'low',
    created: '2024-01-13',
  },
]

export default async function MemberRequestsPage() {
  await requireMember()

  const columns: Column<typeof mockRequests[0]>[] = [
    {
      key: 'subject',
      label: 'Subject',
      sortable: true,
    },
    {
      key: 'type',
      label: 'Type',
      sortable: true,
      render: (value) => (
        <span className="capitalize text-sm">
          {value === 'flight' ? 'Flight' : 'Concierge'}
        </span>
      ),
    },
    {
      key: 'status',
      label: 'Status',
      sortable: true,
      render: (value) => <StatusPill status={value as "new" | "in_progress" | "awaiting_member" | "completed" | "canceled"} />,
    },
    {
      key: 'priority',
      label: 'Priority',
      sortable: true,
      render: (value) => (
        <span className={`text-sm font-medium ${
          value === 'high' ? 'text-red-400' :
          value === 'medium' ? 'text-yellow-400' :
          'text-green-400'
        }`}>
          {value as string}
        </span>
      ),
    },
    {
      key: 'created',
      label: 'Created',
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
        title="My Requests"
        description="Track and manage your luxury travel requests"
        actions={<RequestFormSheet />}
      />

      {mockRequests.length === 0 ? (
        <EmptyState
          icon={<ClipboardList className="h-8 w-8 text-muted-foreground" />}
          title="No requests yet"
          description="Start by creating your first luxury travel request."
          primaryAction={{
            label: "Create Request",
            onClick: () => console.log("Create request"),
          }}
        />
      ) : (
        <DataTable
          data={mockRequests}
          columns={columns}
          searchKey="subject"
          onRowClick={(row) => console.log("View request:", row.id)}
          emptyMessage="No requests found"
        />
      )}
    </div>
  )
}
