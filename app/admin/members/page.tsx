import { requireAdmin } from '@/lib/auth'
import { createClient } from '@/lib/supabaseServer'
import { PageHeader } from '@/components/app/PageHeader'
import { MemberManagementTable } from '@/components/app/member-management/MemberManagementTable'

export default async function AdminMembersPage() {
  await requireAdmin()
  const supabase = await createClient()

  const { data: members, error } = await supabase
    .from('member_list')
    .select(`
      *,
      member_codes(display, status)
    `)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Failed to load members', error)
    throw new Error('Unable to load members')
  }

  return (
    <div className="space-y-8">
      <PageHeader
        title="Members"
        description="Manage your member base and track engagement"
      />

      <MemberManagementTable members={members ?? []} />
    </div>
  )
}
