import { requireMember } from '@/lib/auth'
import { createClient } from '@/lib/supabaseServer'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { DataTable } from '@/components/DataTable'
import type { Request } from '@/lib/types'
import Link from 'next/link'
import { Plus, Plane, Clock, CheckCircle } from 'lucide-react'

export default async function MemberDashboard() {
  const profile = await requireMember()
  const supabase = await createClient()

  // Get member record
  const { data: member } = await supabase
    .from('members')
    .select('id')
    .eq('user_id', profile.id)
    .single()

  // Get recent requests
  const { data: requests } = await supabase
    .from('requests')
    .select('*')
    .eq('member_id', member?.id)
    .order('created_at', { ascending: false })
    .limit(10)

  const statusCounts = {
    new: requests?.filter(r => r.status === 'new').length || 0,
    in_progress: requests?.filter(r => r.status === 'in_progress').length || 0,
    completed: requests?.filter(r => r.status === 'completed').length || 0,
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Welcome back, {profile.full_name || 'Member'}!</h1>
          <p className="text-muted-foreground">
            Manage your requests and access premium concierge services.
          </p>
        </div>
        <Button asChild>
          <Link href="/member/requests/new/flight">
            <Plus className="mr-2 h-4 w-4" />
            New Request
          </Link>
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">New Requests</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{statusCounts.new}</div>
            <p className="text-xs text-muted-foreground">
              Awaiting review
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">In Progress</CardTitle>
            <Plane className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{statusCounts.in_progress}</div>
            <p className="text-xs text-muted-foreground">
              Being processed
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completed</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{statusCounts.completed}</div>
            <p className="text-xs text-muted-foreground">
              Successfully completed
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <DataTable 
            requests={requests || []} 
            title="Recent Requests"
          />
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
              <CardDescription>
                Common request types
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button asChild variant="outline" className="w-full justify-start">
                <Link href="/member/requests/new/flight">
                  <Plane className="mr-2 h-4 w-4" />
                  Flight Request
                </Link>
              </Button>
              <Button asChild variant="outline" className="w-full justify-start">
                <Link href="/member/requests/new/ground">
                  <Plane className="mr-2 h-4 w-4" />
                  Ground Transportation
                </Link>
              </Button>
              <Button asChild variant="outline" className="w-full justify-start">
                <Link href="/member/requests/new/experience">
                  <Plane className="mr-2 h-4 w-4" />
                  Experience Booking
                </Link>
              </Button>
              <Button asChild variant="outline" className="w-full justify-start">
                <Link href="/member/requests/new/general">
                  <Plane className="mr-2 h-4 w-4" />
                  General Request
                </Link>
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Your Membership</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Status</span>
                  <Badge variant="default">Active</Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Role</span>
                  <span className="text-sm font-medium capitalize">{profile.role}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
