import { requireAdmin } from '@/lib/auth'
import { PageHeader } from '@/components/app/PageHeader'
import { GlassCard } from '@/components/app/GlassCard'
import { Button } from '@/components/ui/button'
import { Palette, PenSquare, BadgeCheck } from 'lucide-react'

const guidelines = [
  {
    title: 'Core palette',
    description: 'Download swatches and usage rules for digital and print executions.',
    items: ['Primary hex + Pantone', 'Gradient treatments', 'Accessibility contrast specs'],
  },
  {
    title: 'Typography system',
    description: 'Pairings and hierarchy for Playfair Display and Inter across surfaces.',
    items: ['Heading rhythm', 'Body copy scales', 'Email-safe alternatives'],
  },
  {
    title: 'Voice & tone',
    description: 'Positioning pillars to keep messaging consistent and elevated.',
    items: ['Brand pillars', 'Copy do’s & don’ts', 'Sample outreach scripts'],
  },
]

export default async function AdminBrandAssetsPage() {
  await requireAdmin()

  return (
    <div className="space-y-8">
      <PageHeader
        title="Brand assets"
        description="Protect the HELO aesthetic with source-of-truth guidelines and approvals."
        actions={
          <Button className="rounded-full" size="sm">
            <BadgeCheck className="mr-2 h-4 w-4" />
            Request review
          </Button>
        }
      />

      <GlassCard className="space-y-6" hover={false}>
        <div className="flex items-center gap-3">
          <Palette className="h-5 w-5 text-accent" />
          <h2 className="text-lg font-serif font-semibold text-foreground">Guideline suites</h2>
        </div>
        <div className="grid gap-6 md:grid-cols-3">
          {guidelines.map((guide) => (
            <div key={guide.title} className="space-y-4 rounded-2xl border border-white/10 bg-white/5 p-5">
              <div>
                <h3 className="text-base font-semibold text-foreground">{guide.title}</h3>
                <p className="mt-1 text-sm text-muted-foreground">{guide.description}</p>
              </div>
              <ul className="space-y-2 text-sm text-muted-foreground">
                {guide.items.map((item) => (
                  <li key={item}>• {item}</li>
                ))}
              </ul>
              <Button variant="ghost" className="w-max rounded-full" size="sm">
                <PenSquare className="mr-2 h-4 w-4" />
                Preview pack
              </Button>
            </div>
          ))}
        </div>
      </GlassCard>
    </div>
  )
}
