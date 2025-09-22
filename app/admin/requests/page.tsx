import { requireAdmin } from '@/lib/auth'
import { createClient } from '@/lib/supabaseServer'
import { PageHeader } from '@/components/app/PageHeader'
import { RequestFormSheet } from '@/components/app/RequestFormSheet'
import { EmptyState } from '@/components/app/EmptyState'
import { RequestsTable, type RequestRecord } from '@/components/app/tables/RequestsTable'
import { ClipboardList } from 'lucide-react'

export default async function AdminRequestsPage() {
  await requireAdmin()
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('requests')
    .select('id, subject, type, status, priority, created_at, members:member_id ( first_name, last_name, email, tier )')
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Failed to load requests', error)
    throw new Error('Unable to load requests')
  }

  type MemberJoin = {
    first_name: string | null
    last_name: string | null
    email: string
    tier: string | null
  }

  type AdminRequestRow = {
    id: string
    subject: string
    type: string
    status: string
    priority: string
    created_at: string
    members: MemberJoin | MemberJoin[] | null
  }

  const requestRows: RequestRecord[] = ((data ?? []) as AdminRequestRow[]).map((row) => {
    const member = Array.isArray(row.members) ? (row.members[0] ?? null) : row.members

    const memberName = member
      ? [member.first_name, member.last_name].filter(Boolean).join(' ') || member.email
      : 'Unknown member'

    return {
      id: row.id,
      subject: row.subject,
      type: row.type as RequestRecord['type'],
      status: row.status as RequestRecord['status'],
      priority: row.priority as RequestRecord['priority'],
      member: memberName,
      created: row.created_at,
    }
  })

  return (
    <div className="space-y-8">
      <PageHeader
        title="Requests"
        description="Manage and track all member requests"
        actions={<RequestFormSheet />}
      />

      {requestRows.length === 0 ? (
        <EmptyState
          icon={<ClipboardList className="h-8 w-8 text-muted-foreground" />}
          title="No requests yet"
          description="When members submit requests, they'll appear here for you to manage."
        />
      ) : (
        <RequestsTable data={requestRows} />
      )}
    </div>
  )
}
