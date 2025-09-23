"use client"

import { useEffect, useTransition } from "react"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { useRouter } from "next/navigation"
import { toast } from "sonner"

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

const statusOptions = ["active", "pending", "inactive", "prospect"] as const
const tierOptions = ["Founding50", "Standard", "House", "Corporate"] as const

const formSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  email: z.string().email("Please provide a valid email"),
  status: z.enum(statusOptions),
  tier: z.enum(tierOptions),
  dob: z.string().regex(/^\d{4}-\d{2}-\d{2}$/,{ message: "Use YYYY-MM-DD" }).optional(),
  phone: z.string().optional(),
  city: z.string().optional(),
  country: z.string().optional(),
  preferredAirport: z.string().optional(),
  notes: z.string().optional(),
})

type FormValues = z.infer<typeof formSchema>

export interface MemberFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  mode: "create" | "edit"
  member?: {
    id: string
    first_name: string | null
    last_name: string | null
    email: string
    status: string
    tier: string
    phone: string | null
    city: string | null
    country: string | null
    preferred_airport: string | null
    notes: string | null
  }
}

export function MemberFormDialog({ open, onOpenChange, mode, member }: MemberFormDialogProps) {
  const [isPending, startTransition] = useTransition()
  const router = useRouter()

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      status: "active",
      tier: "Standard",
      dob: "",
      phone: "",
      city: "",
      country: "",
      preferredAirport: "",
      notes: "",
    },
  })

  useEffect(() => {
    if (open) {
      if (mode === "edit" && member) {
        reset({
          firstName: member.first_name ?? "",
          lastName: member.last_name ?? "",
          email: member.email,
          status: (statusOptions.includes(member.status as typeof statusOptions[number])
            ? (member.status as typeof statusOptions[number])
            : "active"),
          tier: (tierOptions.includes(member.tier as typeof tierOptions[number])
            ? (member.tier as typeof tierOptions[number])
            : "Standard"),
          dob: (member as { dob?: string }).dob ?? "",
          phone: member.phone ?? "",
          city: member.city ?? "",
          country: member.country ?? "",
          preferredAirport: member.preferred_airport ?? "",
          notes: member.notes ?? "",
        })
      } else {
        reset({
          firstName: "",
          lastName: "",
          email: "",
          status: "active",
          tier: "Standard",
          dob: "",
          phone: "",
          city: "",
          country: "",
          preferredAirport: "",
          notes: "",
        })
      }
    }
  }, [open, mode, member, reset])

  const submit = (values: FormValues) => {
    startTransition(async () => {
      try {
        const endpoint = mode === "create"
          ? "/api/admin/members"
          : `/api/admin/members/${member?.id}`

        const response = await fetch(endpoint, {
          method: mode === "create" ? "POST" : "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(values),
        })

        if (!response.ok) {
          const body = await response.json().catch(() => ({}))
          throw new Error(body.error || 'Unable to save member')
        }

        toast.success(mode === "create" ? "Member created" : "Member updated")
        onOpenChange(false)
        router.refresh()
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Something went wrong'
        toast.error(message)
      }
    })
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        showCloseButton
        className="luxury-card-strong border-soft-strong p-8 sm:p-10 sm:max-w-2xl"
        overlayClassName="bg-black/70 backdrop-blur-md"
      >
        <DialogHeader>
          <DialogTitle>{mode === "create" ? "Create member" : "Edit member"}</DialogTitle>
          <DialogDescription>
            {mode === "create"
              ? "Add a new member profile to the concierge roster."
              : "Update the member profile details."}
          </DialogDescription>
        </DialogHeader>

        <form className="space-y-5" onSubmit={handleSubmit(submit)}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="firstName">First name</Label>
              <Input id="firstName" placeholder="Ava" {...register("firstName")} />
              {errors.firstName && <p className="text-sm text-red-600 mt-1">{errors.firstName.message}</p>}
            </div>
            <div>
              <Label htmlFor="lastName">Last name</Label>
              <Input id="lastName" placeholder="Stone" {...register("lastName")} />
              {errors.lastName && <p className="text-sm text-red-600 mt-1">{errors.lastName.message}</p>}
            </div>
            <div>
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" placeholder="ava@example.com" {...register("email")} />
              {errors.email && <p className="text-sm text-red-600 mt-1">{errors.email.message}</p>}
            </div>
            <div>
              <Label htmlFor="dob">Date of Birth</Label>
              <Input id="dob" type="date" placeholder="YYYY-MM-DD" {...register("dob")} />
              {errors.dob && <p className="text-sm text-red-600 mt-1">{errors.dob.message}</p>}
            </div>
            <div>
              <Label htmlFor="status">Status</Label>
              <Select value={watch("status")} onValueChange={(value: string) => setValue("status", value as typeof statusOptions[number])}>
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  {statusOptions.map((option) => (
                    <SelectItem key={option} value={option}>
                      {option.charAt(0).toUpperCase() + option.slice(1)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.status && <p className="text-sm text-red-600 mt-1">{errors.status.message}</p>}
            </div>
            <div>
              <Label htmlFor="tier">Tier</Label>
              <Select value={watch("tier")} onValueChange={(value: string) => setValue("tier", value as typeof tierOptions[number])}>
                <SelectTrigger>
                  <SelectValue placeholder="Select tier" />
                </SelectTrigger>
                <SelectContent>
                  {tierOptions.map((option) => (
                    <SelectItem key={option} value={option}>
                      {option}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.tier && <p className="text-sm text-red-600 mt-1">{errors.tier.message}</p>}
            </div>
            <div>
              <Label htmlFor="phone">Phone</Label>
              <Input id="phone" placeholder="+1 555 0100" {...register("phone")} />
            </div>
            <div>
              <Label htmlFor="city">City</Label>
              <Input id="city" placeholder="New York" {...register("city")} />
            </div>
            <div>
              <Label htmlFor="country">Country</Label>
              <Input id="country" placeholder="US" {...register("country")} />
            </div>
            <div>
              <Label htmlFor="preferredAirport">Preferred Airport</Label>
              <Input id="preferredAirport" placeholder="JFK" {...register("preferredAirport")} />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Concierge notes</Label>
            <Textarea id="notes" rows={3} placeholder="Preferences, celebration details, favorite accommodations..." {...register("notes")} />
          </div>

          <DialogFooter className="flex items-center justify-end gap-3 pt-4">
            <Button type="button" variant="ghost" className="rounded-full" onClick={() => onOpenChange(false)} disabled={isPending}>
              Cancel
            </Button>
            <Button type="submit" className="rounded-full" disabled={isPending}>
              {isPending ? "Saving…" : mode === "create" ? "Create member" : "Save changes"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
