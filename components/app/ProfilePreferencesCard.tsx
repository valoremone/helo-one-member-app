"use client"

import { GlassCard } from "@/components/app/GlassCard"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"

interface PreferenceItem {
  label: string
}

interface ProfilePreferencesCardProps {
  title: string
  description: string
  items: PreferenceItem[]
  onManage?: () => void
}

export function ProfilePreferencesCard({
  title,
  description,
  items,
  onManage,
}: ProfilePreferencesCardProps) {
  return (
    <GlassCard className="space-y-6" hover={false}>
      <div>
        <h2 className="text-xl font-serif font-semibold text-foreground">{title}</h2>
        <p className="text-sm text-muted-foreground">{description}</p>
      </div>
      <ul className="space-y-3 text-sm text-muted-foreground">
        {items.map((item) => (
          <li key={item.label}>• {item.label}</li>
        ))}
      </ul>
      <Button
        variant="outline"
        className="w-max rounded-full"
        onClick={() => {
          if (onManage) {
            onManage()
            return
          }

          toast("Operator preferences", {
            description: "Wire this action to the settings module once available.",
          })
        }}
      >
        Manage preferences
      </Button>
    </GlassCard>
  )
}
