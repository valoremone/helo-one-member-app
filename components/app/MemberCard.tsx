"use client"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { MoreHorizontal, Mail, Phone, MapPin } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { cn } from "@/lib/utils"

interface MemberCardProps {
  member: {
    id: string
    name: string
    email: string
    avatar?: string
    status: "active" | "inactive" | "pending"
    tier: string
    city?: string
    phone?: string
    requestsCount: number
  }
  onView?: (member: Record<string, unknown>) => void
  onEdit?: (member: Record<string, unknown>) => void
  className?: string
}

export function MemberCard({ member, onView, onEdit, className }: MemberCardProps) {
  const statusColors = {
    active: "bg-green-500 bg-opacity-20 text-green-300 border-green-500 border-opacity-30",
    inactive: "bg-gray-500 bg-opacity-20 text-gray-300 border-gray-500 border-opacity-30",
    pending: "bg-yellow-500 bg-opacity-20 text-yellow-300 border-yellow-500 border-opacity-30",
  }

  return (
    <div className={cn("luxury-card", className)}>
      <div className="flex items-start justify-between">
        <div className="flex items-start space-x-4">
          <Avatar className="h-12 w-12">
            <AvatarImage src={member.avatar} alt={member.name} />
            <AvatarFallback>
              {member.name
                .split(" ")
                .map((n) => n[0])
                .join("")
                .toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div className="space-y-1">
            <div className="flex items-center space-x-2">
              <h3 className="font-semibold text-foreground">{member.name}</h3>
              <Badge
                variant="outline"
                className={cn("status-pill", statusColors[member.status])}
              >
                {member.status}
              </Badge>
            </div>
            <div className="space-y-1 text-sm text-muted-foreground">
              <div className="flex items-center space-x-2">
                <Mail className="h-3 w-3" />
                <span>{member.email}</span>
              </div>
              {member.phone && (
                <div className="flex items-center space-x-2">
                  <Phone className="h-3 w-3" />
                  <span>{member.phone}</span>
                </div>
              )}
              {member.city && (
                <div className="flex items-center space-x-2">
                  <MapPin className="h-3 w-3" />
                  <span>{member.city}</span>
                </div>
              )}
            </div>
            <div className="flex items-center space-x-4 text-xs text-muted-foreground">
              <span>Tier: {member.tier}</span>
              <span>{member.requestsCount} requests</span>
            </div>
          </div>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => onView?.(member)}>
              View Details
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onEdit?.(member)}>
              Edit Member
            </DropdownMenuItem>
            <DropdownMenuItem>Send Message</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  )
}
