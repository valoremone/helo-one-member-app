import { requireAdmin } from '@/lib/auth'
import { createClient } from '@/lib/supabaseServer'
import { DataTable } from '@/components/DataTable'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import type { Request } from '@/lib/types'
import { Clock, CheckCircle, AlertCircle, Users } from 'lucide-react'

export default async function AdminDashboard() {
  const profile = await requireAdmin()
  const supabase = await createClient()

  // Get recent requests (last 50)
  const { data: requests } = await supabase
    .from('requests')
    .select(`
      *,
      members!inner(first_name, last_name, user_id)
    `)
    .order('created_at', { ascending: false })
    .limit(50)

  const statusCounts = {
    new: requests?.filter(r => r.status === 'new').length || 0,
    in_progress: requests?.filter(r => r.status === 'in_progress').length || 0,
    awaiting_member: requests?.filter(r => r.status === 'awaiting_member').length || 0,
    completed: requests?.filter(r => r.status === 'completed').length || 0,
  }

  const typeCounts = {
    flight: requests?.filter(r => r.type === 'flight').length || 0,
    ground: requests?.filter(r => r.type === 'ground').length || 0,
    experience: requests?.filter(r => r.type === 'experience').length || 0,
    general: requests?.filter(r => r.type === 'general').length || 0,
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Admin Dashboard</h1>
        <p className="text-muted-foreground">
          Welcome back, {profile.full_name}. Manage requests and member services.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">New Requests</CardTitle>
            <AlertCircle className="h-4 w-4 text-blue-600" />
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
            <Clock className="h-4 w-4 text-yellow-600" />
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
            <CardTitle className="text-sm font-medium">Awaiting Member</CardTitle>
            <Users className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{statusCounts.awaiting_member}</div>
            <p className="text-xs text-muted-foreground">
              Member response needed
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completed</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{statusCounts.completed}</div>
            <p className="text-xs text-muted-foreground">
              Successfully completed
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Request Types</CardTitle>
            <CardDescription>
              Breakdown by request type
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm">Flight</span>
              <Badge variant="secondary">{typeCounts.flight}</Badge>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm">Ground</span>
              <Badge variant="secondary">{typeCounts.ground}</Badge>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm">Experience</span>
              <Badge variant="secondary">{typeCounts.experience}</Badge>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm">General</span>
              <Badge variant="secondary">{typeCounts.general}</Badge>
            </div>
          </CardContent>
        </Card>

        <div className="lg:col-span-3">
          <DataTable 
            requests={requests || []} 
            title="Recent Requests"
            showMember={true}
          />
        </div>
      </div>
    </div>
  )
}
