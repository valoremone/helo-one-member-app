import { requireMember } from '@/lib/auth'
import { createClient } from '@/lib/supabaseServer'
import { PageHeader } from '@/components/app/PageHeader'
import { DataTable, Column } from '@/components/app/DataTable'
import { RequestFormSheet } from '@/components/app/RequestFormSheet'
import { StatusPill } from '@/components/app/StatusPill'
import { EmptyState } from '@/components/app/EmptyState'
import { ClipboardList } from 'lucide-react'

interface MemberRequestRow extends Record<string, unknown> {
  id: string
  subject: string
  type: 'concierge' | 'flight' | 'other'
  status: 'new' | 'in_progress' | 'awaiting_member' | 'completed' | 'canceled'
  priority: 'high' | 'medium' | 'low'
  created: string
}

export default async function MemberRequestsPage() {
  const profile = await requireMember()
  const supabase = await createClient()

  const { data: memberRecord } = await supabase
    .from('members')
    .select('id')
    .eq('user_id', profile.id)
    .single()

  let requestRows: MemberRequestRow[] = []

  if (memberRecord?.id) {
    const { data: requestData, error } = await supabase
      .from('requests')
      .select('id, subject, type, status, priority, created_at')
      .eq('member_id', memberRecord.id)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Failed to load member requests', error)
    } else {
      requestRows = (requestData ?? []).map((row) => ({
        id: row.id,
        subject: row.subject,
        type: row.type as MemberRequestRow['type'],
        status: row.status as MemberRequestRow['status'],
        priority: row.priority as MemberRequestRow['priority'],
        created: row.created_at,
      }))
    }
  }

  const columns: Column<MemberRequestRow>[] = [
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

      {requestRows.length === 0 ? (
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
          data={requestRows}
          columns={columns}
          searchKey="subject"
          onRowClick={(row) => console.log("View request:", row.id)}
          emptyMessage="No requests found"
        />
      )}
    </div>
  )
}
