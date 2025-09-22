"use client"

import { useMemo, useState } from "react"
import Link from "next/link"
import { Plus, Eye, PencilLine, MoreHorizontal } from "lucide-react"

import { Button } from "@/components/ui/button"
import { MembersTable, type MemberRecord } from "@/components/app/tables/MembersTable"
import { MemberFormDialog } from "@/components/app/member-management/MemberFormDialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

interface MemberListRow {
  id: string
  first_name: string | null
  last_name: string | null
  email: string
  status: string
  tier: string
  phone: string | null
  preferred_airport: string | null
  city: string | null
  country: string | null
  notes: string | null
  created_at: string
  request_count: number
}

interface MemberManagementTableProps {
  members: MemberListRow[]
}

const statusMap: Record<string, MemberRecord["status"]> = {
  active: "active",
  pending: "pending",
  inactive: "inactive",
  prospect: "pending",
}

export function MemberManagementTable({ members }: MemberManagementTableProps) {
  const [createOpen, setCreateOpen] = useState(false)
  const [editMemberId, setEditMemberId] = useState<string | null>(null)

  const tableData = useMemo<MemberRecord[]>(() => {
    return members.map((member) => {
      const name = [member.first_name, member.last_name].filter(Boolean).join(" ") || member.email
      const status = statusMap[member.status] ?? "pending"

      return {
        id: member.id,
        name,
        email: member.email,
        status,
        tier: (member.tier || "Silver") as MemberRecord["tier"],
        requests: member.request_count ?? 0,
        city: member.city || "",
        created: member.created_at,
      }
    })
  }, [members])

  const editMember = editMemberId
    ? members.find((member) => member.id === editMemberId) || null
    : null

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-muted-foreground">
            Maintain your concierge roster and keep records synchronized across requests and bookings.
          </p>
        </div>
        <Button className="rounded-full" onClick={() => setCreateOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          New member
        </Button>
      </div>

      <MembersTable
        data={tableData}
        onRowClick={(row) => setEditMemberId(row.id)}
        renderActions={(row) => (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="rounded-full border border-white/10 bg-white/5"
              >
                <MoreHorizontal className="h-4 w-4" aria-hidden="true" />
                <span className="sr-only">Open member actions</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="end"
              className="border border-white/10 bg-black/80 text-foreground backdrop-blur-xl"
            >
              <DropdownMenuItem asChild>
                <Link href={`/admin/members/${row.id}`} className="flex items-center" onClick={(event) => event.stopPropagation()}>
                  <Eye className="mr-2 h-4 w-4" />
                  View 360
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={(event) => {
                  event.preventDefault()
                  setEditMemberId(row.id)
                }}
              >
                <PencilLine className="mr-2 h-4 w-4" />
                Edit
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      />

      <MemberFormDialog
        open={createOpen}
        onOpenChange={(open) => setCreateOpen(open)}
        mode="create"
      />

      <MemberFormDialog
        open={Boolean(editMember)}
        onOpenChange={(open) => {
          if (!open) {
            setEditMemberId(null)
          }
        }}
        mode="edit"
        member={editMember || undefined}
      />
    </div>
  )
}
