'use client'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Request, RequestStatus, RequestType } from '@/lib/types'
import { Eye, Calendar, User } from 'lucide-react'
import Link from 'next/link'

interface DataTableProps {
  requests: Request[]
  title?: string
  showMember?: boolean
}

const statusColors: Record<RequestStatus, string> = {
  new: 'bg-blue-100 text-blue-800',
  in_progress: 'bg-yellow-100 text-yellow-800',
  awaiting_member: 'bg-orange-100 text-orange-800',
  completed: 'bg-green-100 text-green-800',
  canceled: 'bg-red-100 text-red-800',
}

const typeColors: Record<RequestType, string> = {
  flight: 'bg-purple-100 text-purple-800',
  ground: 'bg-green-100 text-green-800',
  experience: 'bg-pink-100 text-pink-800',
  general: 'bg-gray-100 text-gray-800',
}

export function DataTable({ requests, title = 'Requests', showMember = false }: DataTableProps) {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  const getPriorityColor = (priority: number) => {
    if (priority <= 2) return 'text-red-600 font-semibold'
    if (priority === 3) return 'text-yellow-600 font-medium'
    return 'text-green-600'
  }

  if (requests.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{title}</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-center py-8">
            No requests found.
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {requests.map((request) => (
            <div
              key={request.id}
              className="border rounded-lg p-4 transition-colors bg-muted bg-opacity-0 hover:bg-opacity-50"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1 space-y-2">
                  <div className="flex items-center gap-2 flex-wrap">
                    <Badge className={typeColors[request.type]}>
                      {request.type}
                    </Badge>
                    <Badge className={statusColors[request.status]}>
                      {request.status.replace('_', ' ')}
                    </Badge>
                    <span className={`text-sm ${getPriorityColor(request.priority)}`}>
                      Priority {request.priority}
                    </span>
                  </div>
                  
                  <h3 className="font-medium text-lg">{request.subject}</h3>
                  
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      {formatDate(request.created_at)}
                    </div>
                    {showMember && (
                      <div className="flex items-center gap-1">
                        <User className="h-4 w-4" />
                        Member ID: {request.member_id.slice(0, 8)}...
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="flex gap-2">
                  <Button asChild size="sm" variant="outline">
                    <Link href={`/admin/requests/${request.id}`}>
                      <Eye className="h-4 w-4 mr-1" />
                      View
                    </Link>
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
