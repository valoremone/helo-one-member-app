import { requireMember } from '@/lib/auth'
import { StatCard } from '@/components/app/StatCard'
import { GlassCard } from '@/components/app/GlassCard'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { RequestFormSheet } from '@/components/app/RequestFormSheet'
import Link from 'next/link'
import { Plane, Clock, CheckCircle, Star, TrendingUp } from 'lucide-react'

export default async function MemberDashboard() {
  const profile = await requireMember()

  return (
    <div className="space-y-8">
      {/* Welcome Header */}
      <div className="luxury-card">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-serif font-semibold text-foreground mb-2">
              Welcome back, {profile.full_name || 'Member'}!
            </h1>
            <p className="text-muted-foreground">
              Access premium concierge services and manage your luxury travel requests.
            </p>
          </div>
          <RequestFormSheet />
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid gap-6 md:grid-cols-3">
        <StatCard
          title="Active Requests"
          value="3"
          description="Currently being processed"
          trend={{ value: 2, label: "+2 this week" }}
        />
        <StatCard
          title="Total Bookings"
          value="12"
          description="This year"
          trend={{ value: 8, label: "+8%" }}
        />
        <StatCard
          title="Member Tier"
          value="Platinum"
          description="Premium benefits active"
        />
      </div>

      {/* Main Content Grid */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Quick Actions */}
        <div className="lg:col-span-1">
          <GlassCard>
            <div className="flex items-center space-x-2 mb-4">
              <Star className="h-5 w-5 text-accent" />
              <h3 className="text-lg font-semibold">Quick Actions</h3>
            </div>
            <div className="space-y-3">
              <Button asChild variant="outline" className="w-full justify-start">
                <Link href="/member/requests/new/flight">
                  <Plane className="mr-2 h-4 w-4" />
                  Flight Request
                </Link>
              </Button>
              <Button asChild variant="outline" className="w-full justify-start">
                <Link href="/member/requests/new/concierge">
                  <Star className="mr-2 h-4 w-4" />
                  Concierge Service
                </Link>
              </Button>
              <Button asChild variant="outline" className="w-full justify-start">
                <Link href="/member/bookings">
                  <CheckCircle className="mr-2 h-4 w-4" />
                  View Bookings
                </Link>
              </Button>
            </div>
          </GlassCard>

          {/* Membership Status */}
          <GlassCard className="mt-6">
            <div className="flex items-center space-x-2 mb-4">
              <TrendingUp className="h-5 w-5 text-accent" />
              <h3 className="text-lg font-semibold">Your Membership</h3>
            </div>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Status</span>
                <Badge className="bg-green-500 bg-opacity-20 text-green-300 border-green-500 border-opacity-30">
                  Active
                </Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Tier</span>
                <span className="text-sm font-medium text-accent">Platinum</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Member Since</span>
                <span className="text-sm font-medium">Jan 2023</span>
              </div>
            </div>
          </GlassCard>
        </div>

        {/* Recent Activity */}
        <div className="lg:col-span-2">
          <GlassCard>
            <div className="flex items-center space-x-2 mb-4">
              <Clock className="h-5 w-5 text-accent" />
              <h3 className="text-lg font-semibold">Recent Activity</h3>
            </div>
            <div className="space-y-4">
              <div className="flex items-center space-x-4 p-4 rounded-lg bg-soft">
                <div className="w-2 h-2 rounded-full bg-accent"></div>
                <div className="flex-1">
                  <p className="text-sm font-medium">Flight request to Aspen approved</p>
                  <p className="text-xs text-muted-foreground">2 hours ago</p>
                </div>
                <Badge className="bg-green-500 bg-opacity-20 text-green-300 border-green-500 border-opacity-30">
                  Completed
                </Badge>
              </div>
              <div className="flex items-center space-x-4 p-4 rounded-lg bg-soft">
                <div className="w-2 h-2 rounded-full bg-yellow-500"></div>
                <div className="flex-1">
                  <p className="text-sm font-medium">Restaurant reservation in progress</p>
                  <p className="text-xs text-muted-foreground">1 day ago</p>
                </div>
                <Badge className="bg-yellow-500 bg-opacity-20 text-yellow-300 border-yellow-500 border-opacity-30">
                  In Progress
                </Badge>
              </div>
              <div className="flex items-center space-x-4 p-4 rounded-lg bg-soft">
                <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                <div className="flex-1">
                  <p className="text-sm font-medium">New hotel booking request</p>
                  <p className="text-xs text-muted-foreground">3 days ago</p>
                </div>
                <Badge className="bg-blue-500 bg-opacity-20 text-blue-300 border-blue-500 border-opacity-30">
                  New
                </Badge>
              </div>
            </div>
          </GlassCard>
        </div>
      </div>
    </div>
  )
}
