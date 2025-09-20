import { requireAdmin } from '@/lib/auth'
import { PageHeader } from '@/components/app/PageHeader'
import { GlassCard } from '@/components/app/GlassCard'
import { Button } from '@/components/ui/button'
import { UploadCloud, Image, FileText, Share2 } from 'lucide-react'

const assetCategories = [
  {
    title: 'Press-ready imagery',
    description: 'Curated photography for property features, jets, and partner venues.',
    icon: Image,
    count: '38 files',
  },
  {
    title: 'Brand narratives',
    description: 'Long-form copy blocks for newsletters, proposals, and website refreshes.',
    icon: FileText,
    count: '16 documents',
  },
  {
    title: 'Social toolkits',
    description: 'Editable reels, captions, and paid media variants for weekly campaigns.',
    icon: Share2,
    count: '12 kits',
  },
]

export default async function AdminShareableAssetsPage() {
  await requireAdmin()

  return (
    <div className="space-y-8">
      <PageHeader
        title="Shareable assets"
        description="Maintain a polished media library for partners, members, and internal storytellers."
        actions={
          <Button className="rounded-full" size="sm">
            <UploadCloud className="mr-2 h-4 w-4" />
            Upload asset
          </Button>
        }
      />

      <div className="grid gap-6 md:grid-cols-3">
        {assetCategories.map((asset) => {
          const Icon = asset.icon

          return (
            <GlassCard key={asset.title} className="flex h-full flex-col gap-5" hover={false}>
              <div className="flex items-center justify-between">
                <Icon className="h-6 w-6 text-accent" />
                <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs uppercase tracking-[0.2em] text-muted-foreground">
                  {asset.count}
                </span>
              </div>
              <div className="space-y-2">
                <h2 className="text-lg font-serif font-semibold text-foreground">{asset.title}</h2>
                <p className="text-sm text-muted-foreground">{asset.description}</p>
              </div>
              <Button variant="outline" className="mt-auto w-max rounded-full" size="sm">
                Open library
              </Button>
            </GlassCard>
          )
        })}
      </div>
    </div>
  )
}
