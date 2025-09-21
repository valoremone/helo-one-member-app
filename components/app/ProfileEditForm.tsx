"use client"

import { FormEvent, useEffect, useMemo, useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "sonner"

interface ProfileEditFormProps {
  defaults: {
    fullName: string
    email: string
    signature: string
    notes: string
  }
}

export function ProfileEditForm({ defaults }: ProfileEditFormProps) {
  const [baseline, setBaseline] = useState(defaults)
  const [formState, setFormState] = useState(defaults)
  const [isSaving, setIsSaving] = useState(false)

  useEffect(() => {
    setBaseline(defaults)
    setFormState(defaults)
  }, [defaults])

  const hasChanges = useMemo(() => (
    formState.fullName !== baseline.fullName ||
    formState.signature !== baseline.signature ||
    formState.notes !== baseline.notes
  ), [formState, baseline])

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    if (!hasChanges || isSaving) {
      return
    }

    try {
      setIsSaving(true)

      const response = await fetch('/api/profile', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          fullName: formState.fullName,
          signature: formState.signature,
          notes: formState.notes,
        }),
      })

      if (!response.ok) {
        const { error } = await response.json()
        throw new Error(error || 'Unable to update profile')
      }

      const { profile, metadata } = await response.json()

      const nextState = {
        fullName: profile?.full_name ?? '',
        email: profile?.email ?? baseline.email,
        signature: metadata?.signature ?? '',
        notes: metadata?.concierge_notes ?? '',
      }

      setBaseline(nextState)
      setFormState(nextState)

      toast.success('Profile updated', {
        description: 'Your contact details and concierge preferences are now in sync.',
      })
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Something went wrong'
      toast.error('Unable to update profile', { description: message })
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <form className="space-y-6" onSubmit={handleSubmit}>
      <div className="grid gap-6 md:grid-cols-2">
        <div className="space-y-2">
          <label
            className="text-xs uppercase tracking-[0.2em] text-muted-foreground"
            htmlFor="fullName"
          >
            Full name
          </label>
          <Input
            id="fullName"
            name="fullName"
            value={formState.fullName}
            onChange={(event) =>
              setFormState((state) => ({ ...state, fullName: event.target.value }))
            }
            placeholder="Add your full name"
          />
        </div>
        <div className="space-y-2">
          <label
            className="text-xs uppercase tracking-[0.2em] text-muted-foreground"
            htmlFor="email"
          >
            Email
          </label>
          <Input id="email" name="email" value={formState.email} disabled readOnly />
        </div>
      </div>

      <div className="space-y-2">
        <label
          className="text-xs uppercase tracking-[0.2em] text-muted-foreground"
          htmlFor="signature"
        >
          Signature block
        </label>
        <Textarea
          id="signature"
          name="signature"
          value={formState.signature}
          onChange={(event) =>
            setFormState((state) => ({ ...state, signature: event.target.value }))
          }
          placeholder="Signature that appears at the end of every correspondence."
          rows={4}
        />
      </div>

      <div className="space-y-2">
        <label
          className="text-xs uppercase tracking-[0.2em] text-muted-foreground"
          htmlFor="notes"
        >
          Concierge notes
        </label>
        <Textarea
          id="notes"
          name="notes"
          value={formState.notes}
          onChange={(event) =>
            setFormState((state) => ({ ...state, notes: event.target.value }))
          }
          placeholder="Internal reminders, guest preferences, or service SOPs."
          rows={4}
        />
      </div>

      <div className="flex items-center justify-end gap-3">
        <Button
          type="button"
          variant="ghost"
          className="rounded-full"
          onClick={() => setFormState(baseline)}
          disabled={isSaving || !hasChanges}
        >
          Reset changes
        </Button>
        <Button
          className="rounded-full"
          type="submit"
          disabled={isSaving || !hasChanges}
        >
          {isSaving ? "Saving…" : "Save changes"}
        </Button>
      </div>
    </form>
  )
}
