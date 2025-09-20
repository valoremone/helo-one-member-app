import { requireAdmin } from '@/lib/auth'
import { PageHeader } from '@/components/app/PageHeader'
import { GlassCard } from '@/components/app/GlassCard'
import { Button } from '@/components/ui/button'

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
          <Button className="w-max rounded-full">Update profile</Button>
        </GlassCard>

        <GlassCard className="space-y-6" hover={false}>
          <div>
            <h2 className="text-xl font-serif font-semibold text-foreground">Preferences</h2>
            <p className="text-sm text-muted-foreground">
              Control notification cadence, concierge handoff notes, and signature blocks.
            </p>
          </div>
          <ul className="space-y-3 text-sm text-muted-foreground">
            <li>• Signature updated last week.</li>
            <li>• Concierge alerts: immediate.</li>
            <li>• Flight briefs: daily digest at 7am.</li>
          </ul>
          <Button variant="outline" className="w-max rounded-full">Manage preferences</Button>
        </GlassCard>
      </div>
    </div>
  )
}
