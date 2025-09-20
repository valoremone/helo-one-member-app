import { requireAdmin } from '@/lib/auth'
import { PageHeader } from '@/components/app/PageHeader'
import { GlassCard } from '@/components/app/GlassCard'
import { Button } from '@/components/ui/button'
import { FileText, Mail, FileCheck, ExternalLink } from 'lucide-react'

export default async function AdminTemplatesAndFormsPage() {
  await requireAdmin()

  const templates = [
    {
      title: 'Email Templates',
      description: 'Pre-designed email templates for member communications',
      icon: Mail,
      count: '12 templates',
      action: 'Open Templates',
    },
    {
      title: 'Forms',
      description: 'Customizable forms for member requests and feedback',
      icon: FileCheck,
      count: '8 forms',
      action: 'Open Forms',
    },
    {
      title: 'Other Resources',
      description: 'Additional resources and documentation',
      icon: FileText,
      count: '25 resources',
      action: 'Open Resources',
    },
  ]

  return (
    <div className="space-y-8">
      <PageHeader
        title="Templates & Forms"
        description="Manage your communication templates and forms"
      />

      <div className="grid gap-6 md:grid-cols-3">
        {templates.map((template, index) => {
          const Icon = template.icon
          return (
            <GlassCard key={index} className="group flex h-full flex-col" variant="default">
              <div className="flex flex-1 flex-col items-start gap-6">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-white/15 bg-white/10 text-accent transition-transform duration-200 group-hover:-translate-y-1">
                  <Icon className="h-6 w-6" />
                </div>
                <div className="space-y-2">
                  <h3 className="text-xl font-serif font-semibold text-foreground">
                    {template.title}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {template.description}
                  </p>
                  <p className="text-xs uppercase tracking-[0.28em] text-muted-foreground">
                    {template.count}
                  </p>
                </div>
                <Button variant="outline" className="mt-auto inline-flex w-full items-center justify-center gap-2 rounded-full border-white/15 bg-white/5">
                  {template.action}
                  <ExternalLink className="h-4 w-4" />
                </Button>
              </div>
            </GlassCard>
          )
        })}
      </div>
    </div>
  )
}
