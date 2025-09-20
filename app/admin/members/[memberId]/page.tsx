import { requireAdmin } from '@/lib/auth'
import { createClient } from '@/lib/supabaseServer'
import { GlassCard } from '@/components/app/GlassCard'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { notFound } from 'next/navigation'
import { Phone, MapPin, Plane, ArrowLeft, CreditCard, Star, Users, FileText } from 'lucide-react'
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
          <Link href="/admin/members">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Members
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-serif font-semibold">
            {member360.first_name} {member360.last_name}
          </h1>
          <p className="text-muted-foreground">Member 360 View</p>
        </div>
      </div>

      {/* Hero Card */}
      <GlassCard variant="strong">
        <div className="flex items-start space-x-6">
          <div className="h-20 w-20 rounded-full bg-accent-soft flex items-center justify-center">
            <span className="text-2xl font-bold text-accent">
              {member360.first_name?.[0]}{member360.last_name?.[0]}
            </span>
          </div>
          <div className="flex-1">
            <div className="flex items-center space-x-4 mb-4">
              <h2 className="text-2xl font-serif font-semibold">
                {member360.profile_name || `${member360.first_name} ${member360.last_name}`}
              </h2>
              <Badge 
                variant={member360.member_status === 'active' ? 'default' : 'secondary'}
                className="capitalize"
              >
                {member360.member_status}
              </Badge>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="flex items-center space-x-2">
                <Phone className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">{member360.phone || 'No phone'}</span>
              </div>
              <div className="flex items-center space-x-2">
                <MapPin className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">
                  {[member360.city, member360.country].filter(Boolean).join(', ') || 'No location'}
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <Plane className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">{member360.preferred_airport || 'No preferred airport'}</span>
              </div>
            </div>
          </div>
        </div>
      </GlassCard>

      {/* Tabs */}
      <Tabs defaultValue="about" className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="about">About</TabsTrigger>
          <TabsTrigger value="payment">Payment Methods</TabsTrigger>
          <TabsTrigger value="loyalty">Loyalty</TabsTrigger>
          <TabsTrigger value="travelers">Travelers</TabsTrigger>
          <TabsTrigger value="notes">Notes</TabsTrigger>
        </TabsList>

        <TabsContent value="about" className="space-y-6">
          <div className="grid gap-6 lg:grid-cols-2">
            <GlassCard>
              <h3 className="text-lg font-semibold mb-4">Profile Information</h3>
              <div className="space-y-4">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Email</p>
                  <p className="text-sm">{member360.email || 'Not set'}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Role</p>
                  <Badge variant="secondary" className="capitalize">
                    {member360.role || 'member'}
                  </Badge>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Member Since</p>
                  <p className="text-sm">{formatDate(member360.created_at)}</p>
                </div>
              </div>
            </GlassCard>

            <GlassCard>
              <h3 className="text-lg font-semibold mb-4">Memberships</h3>
              {member360.memberships && member360.memberships.length > 0 ? (
                <div className="space-y-3">
                  {member360.memberships.map((membership: { tier: string; start_date: string; end_date: string | null; status: string }, index: number) => (
                    <div key={index} className="p-3 rounded-lg bg-soft">
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
            </GlassCard>
          </div>

          <GlassCard>
            <h3 className="text-lg font-semibold mb-4">Recent Requests</h3>
            {member360.recent_requests && member360.recent_requests.length > 0 ? (
              <div className="space-y-4">
                {member360.recent_requests.map((request: { id: string; type: string; status: string; subject: string; created_at: string }) => (
                  <div key={request.id} className="p-4 rounded-lg bg-soft">
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
          </GlassCard>
        </TabsContent>

        <TabsContent value="payment" className="space-y-6">
          <GlassCard>
            <div className="text-center py-12">
              <CreditCard className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No Payment Methods</h3>
              <p className="text-muted-foreground mb-6">
                        This member hasn&apos;t added any payment methods yet.
              </p>
              <Button variant="outline">Add Payment Method</Button>
            </div>
          </GlassCard>
        </TabsContent>

        <TabsContent value="loyalty" className="space-y-6">
          <GlassCard>
            <div className="text-center py-12">
              <Star className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Loyalty Program</h3>
              <p className="text-muted-foreground mb-6">
                Track loyalty points and rewards for this member.
              </p>
              <Button variant="outline">View Loyalty Details</Button>
            </div>
          </GlassCard>
        </TabsContent>

        <TabsContent value="travelers" className="space-y-6">
          <GlassCard>
            <div className="text-center py-12">
              <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Associated Travelers</h3>
              <p className="text-muted-foreground mb-6">
                Manage travelers associated with this member account.
              </p>
              <Button variant="outline">Add Traveler</Button>
            </div>
          </GlassCard>
        </TabsContent>

        <TabsContent value="notes" className="space-y-6">
          <GlassCard>
            <div className="text-center py-12">
              <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Member Notes</h3>
              <p className="text-muted-foreground mb-6">
                Add private notes about this member for your team.
              </p>
              <Button variant="outline">Add Note</Button>
            </div>
          </GlassCard>
        </TabsContent>
      </Tabs>
    </div>
  )
}
