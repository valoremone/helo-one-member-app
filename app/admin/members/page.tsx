import { requireAdmin } from '@/lib/auth'
import { PageHeader } from '@/components/app/PageHeader'
import { EmptyState } from '@/components/app/EmptyState'
import { MembersTable, type MemberRecord } from '@/components/app/tables/MembersTable'
import { Users2 } from 'lucide-react'

const mockMembers: MemberRecord[] = [
  {
    id: '1',
    name: 'John Smith',
    email: 'john@example.com',
    status: 'active',
    tier: 'Platinum',
    requests: 12,
    city: 'New York',
    created: '2023-06-15',
  },
  {
    id: '2',
    name: 'Sarah Johnson',
    email: 'sarah@example.com',
    status: 'active',
    tier: 'Gold',
    requests: 8,
    city: 'Los Angeles',
    created: '2023-08-22',
  },
  {
    id: '3',
    name: 'Michael Brown',
    email: 'michael@example.com',
    status: 'pending',
    tier: 'Silver',
    requests: 3,
    city: 'Chicago',
    created: '2024-01-10',
  },
  {
    id: '4',
    name: 'Emily Davis',
    email: 'emily@example.com',
    status: 'active',
    tier: 'Platinum',
    requests: 15,
    city: 'Miami',
    created: '2023-04-05',
  },
]

export default async function AdminMembersPage() {
  await requireAdmin()

  return (
    <div className="space-y-8">
      <PageHeader
        title="Members"
        description="Manage your member base and track engagement"
      />

      {mockMembers.length === 0 ? (
        <EmptyState
          icon={<Users2 className="h-8 w-8 text-muted-foreground" />}
          title="No members yet"
          description="When members join, they'll appear here for you to manage."
        />
      ) : (
        <MembersTable data={mockMembers} />
      )}
    </div>
  )
}
