import { requireAdmin } from '@/lib/auth'
import { createClient } from '@/lib/supabaseServer'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import type { Member360 } from '@/lib/types'
import { notFound } from 'next/navigation'
import { Calendar, Phone, MapPin, Plane, User, ArrowLeft } from 'lucide-react'
import Link from 'next/link'

interface Member360PageProps {
  params: Promise<{ memberId: string }>
}

export default async function Member360Page({ params }: Member360PageProps) {
  await requireAdmin()
  const supabase = await createClient()
  const { memberId } = await params

  // Get member 360 data
  const { data: member360 } = await supabase
    .from('member_360')
    .select('*')
    .eq('member_id', memberId)
    .single()

  if (!member360) {
    notFound()
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString()
  }

  const statusColors: Record<string, string> = {
    new: 'bg-blue-100 text-blue-800',
    in_progress: 'bg-yellow-100 text-yellow-800',
    awaiting_member: 'bg-orange-100 text-orange-800',
    completed: 'bg-green-100 text-green-800',
    canceled: 'bg-red-100 text-red-800',
  }

  const typeColors: Record<string, string> = {
    flight: 'bg-purple-100 text-purple-800',
    ground: 'bg-green-100 text-green-800',
    experience: 'bg-pink-100 text-pink-800',
    general: 'bg-gray-100 text-gray-800',
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Button asChild variant="outline" size="sm">
          <Link href="/admin">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Dashboard
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold">
            {member360.first_name} {member360.last_name}
          </h1>
          <p className="text-muted-foreground">Member 360 View</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Profile Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm font-medium">Full Name</p>
                <p className="text-sm text-muted-foreground">
                  {member360.profile_name || 'Not set'}
                </p>
              </div>

              <div>
                <p className="text-sm font-medium">Email</p>
                <p className="text-sm text-muted-foreground">
                  {member360.email || 'Not set'}
                </p>
              </div>

              <div>
                <p className="text-sm font-medium">Role</p>
                <Badge variant="secondary" className="capitalize">
                  {member360.role || 'member'}
                </Badge>
              </div>

              <div>
                <p className="text-sm font-medium">Member Status</p>
                <Badge 
                  variant={member360.member_status === 'active' ? 'default' : 'secondary'}
                  className="capitalize"
                >
                  {member360.member_status}
                </Badge>
              </div>

              {member360.phone && (
                <div className="flex items-center gap-2">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">Phone</p>
                    <p className="text-sm text-muted-foreground">
                      {member360.phone}
                    </p>
                  </div>
                </div>
              )}

              {member360.preferred_airport && (
                <div className="flex items-center gap-2">
                  <Plane className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">Preferred Airport</p>
                    <p className="text-sm text-muted-foreground">
                      {member360.preferred_airport}
                    </p>
                  </div>
                </div>
              )}

              {(member360.city || member360.country) && (
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">Location</p>
                    <p className="text-sm text-muted-foreground">
                      {[member360.city, member360.country].filter(Boolean).join(', ')}
                    </p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Memberships</CardTitle>
              <CardDescription>
                Current and historical memberships
              </CardDescription>
            </CardHeader>
            <CardContent>
              {member360.memberships && member360.memberships.length > 0 ? (
                <div className="space-y-3">
                  {member360.memberships.map((membership: { tier: string; start_date: string; end_date: string | null; status: string }, index: number) => (
                    <div key={index} className="border rounded-lg p-3">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-medium">{membership.tier}</p>
                          <p className="text-sm text-muted-foreground">
                            {formatDate(membership.start_date)}
                            {membership.end_date && ` - ${formatDate(membership.end_date)}`}
                          </p>
                        </div>
                        <Badge 
                          variant={membership.status === 'active' ? 'default' : 'secondary'}
                          className="capitalize"
                        >
                          {membership.status}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">No memberships found</p>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Recent Requests
              </CardTitle>
              <CardDescription>
                Latest requests from this member
              </CardDescription>
            </CardHeader>
            <CardContent>
              {member360.recent_requests && member360.recent_requests.length > 0 ? (
                <div className="space-y-4">
                  {member360.recent_requests.map((request: { id: string; type: string; status: string; subject: string; created_at: string }) => (
                    <div key={request.id} className="border rounded-lg p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <Badge className={typeColors[request.type]}>
                              {request.type}
                            </Badge>
                            <Badge className={statusColors[request.status]}>
                              {request.status.replace('_', ' ')}
                            </Badge>
                          </div>
                          <h3 className="font-medium mb-1">{request.subject}</h3>
                          <p className="text-sm text-muted-foreground">
                            {formatDate(request.created_at)}
                          </p>
                        </div>
                        <Button asChild size="sm" variant="outline">
                          <Link href={`/admin/requests/${request.id}`}>
                            View
                          </Link>
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">No requests found</p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
