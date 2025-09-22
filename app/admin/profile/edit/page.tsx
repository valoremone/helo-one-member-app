import Link from 'next/link'
import { requireAdmin } from '@/lib/auth'
import { createClient } from '@/lib/supabaseServer'
import { PageHeader } from '@/components/app/PageHeader'
import { GlassCard } from '@/components/app/GlassCard'
import { Button } from '@/components/ui/button'
import { ProfileEditForm } from '@/components/app/ProfileEditForm'

type ProfileMetadata = {
  signature?: string
  concierge_notes?: string
}

export default async function AdminProfileEditPage() {
  const user = await requireAdmin()
  const supabase = await createClient()
  const {
    data: { user: authUser },
  } = await supabase.auth.getUser()

  const metadata = (authUser?.user_metadata as ProfileMetadata | null) ?? {}

  const profileDefaults = {
    fullName: user.full_name ?? '',
    email: user.email,
    signature: metadata.signature ?? '',
    notes: metadata.concierge_notes ?? '',
  }

  return (
    <div className="space-y-8">
      <PageHeader
        title="Edit profile"
        description="Refresh the details members see when you reach out."
        actions={
          <Button variant="ghost" className="rounded-full" asChild>
            <Link href="/admin/profile">Cancel</Link>
          </Button>
        }
      />

      <GlassCard className="space-y-6" hover={false}>
        <ProfileEditForm defaults={profileDefaults} />
      </GlassCard>
    </div>
  )
}
