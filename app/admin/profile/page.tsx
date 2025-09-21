import { requireAdmin } from '@/lib/auth'
import Link from 'next/link'
import { PageHeader } from '@/components/app/PageHeader'
import { GlassCard } from '@/components/app/GlassCard'
import { Button } from '@/components/ui/button'
import { ProfilePreferencesCard } from '@/components/app/ProfilePreferencesCard'

export default async function AdminProfilePage() {
  const user = await requireAdmin()

  return (
    <div className="space-y-8">
      <PageHeader
        title="Profile"
        description="Fine-tune your operator profile so members always know who is crafting their experience."
      />

      <div className="grid gap-6 md:grid-cols-2">
        <GlassCard className="space-y-6" hover={false}>
          <div>
            <h2 className="text-xl font-serif font-semibold text-foreground">Contact details</h2>
            <p className="text-sm text-muted-foreground">
              Members see these details when you communicate through the portal.
            </p>
          </div>
          <div className="space-y-4 text-sm text-muted-foreground">
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Name</p>
              <p className="text-foreground">{user.full_name || 'Team Member'}</p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Email</p>
              <p className="text-foreground">{user.email}</p>
            </div>
          </div>
          <Button className="w-max rounded-full" asChild>
            <Link href="/admin/profile/edit">Update profile</Link>
          </Button>
        </GlassCard>

        <ProfilePreferencesCard
          title="Preferences"
          description="Control notification cadence, concierge handoff notes, and signature blocks."
          items={[
            { label: 'Signature synced last week' },
            { label: 'Concierge alerts: immediate push' },
            { label: 'Flight briefs: daily digest at 7am' },
          ]}
        />
      </div>
    </div>
  )
}
