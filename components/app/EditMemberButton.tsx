"use client"

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Edit } from 'lucide-react'
import { MemberFormDialog } from './member-management/MemberFormDialog'

interface EditMemberButtonProps {
  member: {
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
    dob?: string | null
  }
}

export function EditMemberButton({ member }: EditMemberButtonProps) {
  const [open, setOpen] = useState(false)

  return (
    <>
      <Button onClick={() => setOpen(true)} size="sm" variant="outline">
        <Edit className="mr-2 h-4 w-4" />
        Edit Member
      </Button>
      <MemberFormDialog
        open={open}
        onOpenChange={setOpen}
        mode="edit"
        member={member}
      />
    </>
  )
}
