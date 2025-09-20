import { requireAdmin } from '@/lib/auth'
import { createClient } from '@/lib/supabaseServer'
import { RequestThread } from '@/components/RequestThread'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
// import type { Request, FlightRequest } from '@/lib/types'
import { notFound } from 'next/navigation'
import { Calendar, Plane, User, MapPin, ExternalLink } from 'lucide-react'
import Link from 'next/link'

interface AdminRequestPageProps {
  params: Promise<{ id: string }>
}

export default async function AdminRequestPage({ params }: AdminRequestPageProps) {
  const profile = await requireAdmin()
  const supabase = await createClient()
  const { id } = await params

  // Get the request with member details
  const { data: request } = await supabase
    .from('requests')
    .select(`
      *,
      members!inner(
        id,
        first_name,
        last_name,
        user_id,
        phone,
        preferred_airport
      )
    `)
    .eq('id', id)
    .single()

  if (!request) {
    notFound()
  }

  // Get flight request details if it's a flight request
  let flightDetails: {
    origin: string;
    destination: string;
    earliest_departure?: string;
    latest_departure?: string;
    pax_count?: number;
    cabin_preference?: string;
    trip_purpose?: string;
    special_requests?: string;
    baggage_notes?: string;
  } | null = null
  if (request.type === 'flight') {
    const { data } = await supabase
      .from('flight_requests')
      .select('*')
      .eq('request_id', request.id)
      .single()
    
    flightDetails = data
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

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString()
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">{request.subject}</h1>
          <div className="flex items-center gap-2 mt-2">
            <Badge className={typeColors[request.type]}>
              {request.type}
            </Badge>
            <Badge className={statusColors[request.status]}>
              {request.status.replace('_', ' ')}
            </Badge>
            <span className="text-sm text-muted-foreground">
              Priority {request.priority}
            </span>
          </div>
        </div>
        <Button asChild variant="outline">
          <Link href={`/admin/members/${request.members.id}`}>
            <ExternalLink className="mr-2 h-4 w-4" />
            View Member 360
          </Link>
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <RequestThread 
            requestId={request.id} 
            isAdmin={true}
            userProfile={profile}
          />
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Request Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">Created</p>
                  <p className="text-sm text-muted-foreground">
                    {formatDate(request.created_at)}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <User className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">Request ID</p>
                  <p className="text-sm text-muted-foreground font-mono">
                    {request.id.slice(0, 8)}...
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Member Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm font-medium">Name</p>
                <p className="text-sm text-muted-foreground">
                  {request.members.first_name} {request.members.last_name}
                </p>
              </div>

              {request.members.phone && (
                <div>
                  <p className="text-sm font-medium">Phone</p>
                  <p className="text-sm text-muted-foreground">
                    {request.members.phone}
                  </p>
                </div>
              )}

              {request.members.preferred_airport && (
                <div>
                  <p className="text-sm font-medium">Preferred Airport</p>
                  <p className="text-sm text-muted-foreground">
                    {request.members.preferred_airport}
                  </p>
                </div>
              )}

              <div>
                <p className="text-sm font-medium">Member ID</p>
                <p className="text-sm text-muted-foreground font-mono">
                  {request.members.id.slice(0, 8)}...
                </p>
              </div>
            </CardContent>
          </Card>

          {flightDetails && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Plane className="h-5 w-5" />
                  Flight Details
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">Route</p>
                    <p className="text-sm text-muted-foreground">
                      {flightDetails.origin} → {flightDetails.destination}
                    </p>
                  </div>
                </div>

                {flightDetails.earliest_departure && (
                  <div>
                    <p className="text-sm font-medium">Earliest Departure</p>
                    <p className="text-sm text-muted-foreground">
                      {formatDate(flightDetails.earliest_departure)}
                    </p>
                  </div>
                )}

                {flightDetails.latest_departure && (
                  <div>
                    <p className="text-sm font-medium">Latest Departure</p>
                    <p className="text-sm text-muted-foreground">
                      {formatDate(flightDetails.latest_departure)}
                    </p>
                  </div>
                )}

                {flightDetails.pax_count && (
                  <div>
                    <p className="text-sm font-medium">Passengers</p>
                    <p className="text-sm text-muted-foreground">
                      {flightDetails.pax_count}
                    </p>
                  </div>
                )}

                {flightDetails.cabin_preference && (
                  <div>
                    <p className="text-sm font-medium">Cabin Preference</p>
                    <p className="text-sm text-muted-foreground">
                      {flightDetails.cabin_preference}
                    </p>
                  </div>
                )}

                {flightDetails.trip_purpose && (
                  <div>
                    <p className="text-sm font-medium">Trip Purpose</p>
                    <p className="text-sm text-muted-foreground">
                      {flightDetails.trip_purpose}
                    </p>
                  </div>
                )}

                {flightDetails.special_requests && (
                  <div>
                    <p className="text-sm font-medium">Special Requests</p>
                    <p className="text-sm text-muted-foreground">
                      {flightDetails.special_requests}
                    </p>
                  </div>
                )}

                {flightDetails.baggage_notes && (
                  <div>
                    <p className="text-sm font-medium">Baggage Notes</p>
                    <p className="text-sm text-muted-foreground">
                      {flightDetails.baggage_notes}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
