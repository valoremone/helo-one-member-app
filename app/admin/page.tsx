import Link from 'next/link'
import { requireAdmin } from '@/lib/auth'
import { BentoGrid, BentoGridItem } from '@/components/app/BentoGrid'
import { Button } from '@/components/ui/button'
import {
  Calendar,
  TrendingUp,
  Clock,
  Plane,
  Sparkles,
  BadgePercent,
  ArrowUpRight,
  ClipboardList,
  Users2,
} from 'lucide-react'

export default async function AdminDashboard() {
  const userProfile = await requireAdmin()

  const metrics = [
    {
      title: 'Total Requests',
      value: '24',
      description: 'Submitted this month',
      trend: '+12%',
      accent: 'emerald' as const,
    },
    {
      title: 'Total Value',
      value: '$45,230',
      description: 'Revenue generated YTD',
      trend: '+8%',
      accent: 'violet' as const,
    },
    {
      title: 'Next Payout',
      value: '$2,340',
      description: 'Scheduled in 3 days',
      trend: null,
      accent: 'gold' as const,
    },
  ]

  const schedule = [
    {
      title: 'Member welcome touchpoint',
      time: '09:30 AM',
      status: 'Awaiting confirmation',
    },
    {
      title: 'Flight concierge briefing',
      time: '02:00 PM',
      status: 'Crew aligned',
    },
    {
      title: 'Lifestyle event walkthrough',
      time: '05:30 PM',
      status: 'Venues locked',
    },
  ]

  return (
    <div className="stack-roomy">
      <BentoGrid className="md:auto-rows-[minmax(20px,_1fr)]">
        <BentoGridItem
          className="md:col-span-6 lg:row-span-1 md:row-span-1"
          accent="gold"
          eyebrow={new Date().toLocaleDateString(undefined, {
            weekday: 'long',
            month: 'long',
            day: 'numeric',
          })}
          title={`Welcome back, ${userProfile.full_name || userProfile.email}`}
          description="Here’s the snapshot of your business. Track high-touch requests, monitor revenue, and keep every member experience polished."
          icon={<Sparkles className="h-4 w-4 text-accent" />}
          action={
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2 text-xs uppercase tracking-[0.28em] text-muted-foreground">
                <BadgePercent className="h-4 w-4 text-accent" />
                Signature Service Mode
              </div>
              <Button asChild size="sm">
                <Link href="/admin/requests">
                  View pipeline
                  <ArrowUpRight className="ml-2 h-3.5 w-3.5" />
                </Link>
              </Button>
            </div>
          }
        >
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="surface-tile flex items-center gap-3 text-sm text-muted-foreground">
              <Clock className="h-4 w-4 text-accent" />
              <span>Next check-in scheduled in 2 hours</span>
            </div>
            <div className="surface-tile flex items-center gap-3 text-sm text-muted-foreground">
              <Plane className="h-4 w-4 text-accent" />
              <span>3 flight itineraries awaiting confirmation</span>
            </div>
          </div>
        </BentoGridItem>

        {metrics.map((metric) => (
          <BentoGridItem
            key={metric.title}
            className="md:col-span-2 lg:row-span-1 md:row-span-1"
            accent={metric.accent}
            eyebrow="Key metric"
            title={metric.title}
            description={metric.description}
          >
            <div className="flex items-end justify-between">
              <span className="text-4xl font-serif font-semibold text-foreground">
                {metric.value}
              </span>
              {metric.trend && (
                <span className="badge-soft text-emerald-200">
                  {metric.trend}
                </span>
              )}
            </div>
            <p className="text-xs text-muted-foreground">
              {metric.description}
            </p>
            <Button
              asChild
              variant="outline"
              size="sm"
              className="w-max text-[0.7rem] uppercase tracking-[0.24em]"
            >
              <Link href="/admin/requests">
                View detail
                <ArrowUpRight className="ml-1.5 h-3.5 w-3.5" />
              </Link>
            </Button>
          </BentoGridItem>
        ))}

        <BentoGridItem
          className="md:col-span-4 lg:row-span-2 md:row-span-1"
          accent="violet"
          eyebrow="Pulse"
          title="Booking velocity"
          description="Concierge and flight trends across the past seven days"
          icon={<TrendingUp className="h-4 w-4 text-accent" />}
        >
          <div className="grid gap-5 md:grid-cols-2">
            <div className="space-y-3">
              <h3 className="text-sm font-semibold text-muted-foreground">Services in focus</h3>
              <div className="space-y-3">
                {[
                  {
                    label: 'Concierge',
                    detail: '11 active experiences',
                  },
                  {
                    label: 'Flights',
                    detail: '6 itineraries in progress',
                  },
                  {
                    label: 'Lifestyle',
                    detail: '4 bespoke events this week',
                  },
                ].map((item) => (
                  <div key={item.label} className="surface-tile flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-foreground">{item.label}</p>
                      <p className="text-xs text-muted-foreground">{item.detail}</p>
                    </div>
                    <span className="text-xs uppercase tracking-[0.24em] text-muted-foreground">Live</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-muted-foreground">Member sentiment</h3>
              <div className="surface-card text-sm text-muted-foreground">
                “Every touchpoint still feels bespoke. The Paris itinerary updates were seamless.”
                <div className="mt-4 flex items-center gap-2 text-xs uppercase tracking-[0.32em] text-muted-foreground">
                  <Sparkles className="h-4 w-4 text-accent" />
                  Platinum Member
                </div>
              </div>
            </div>
          </div>
        </BentoGridItem>

        <BentoGridItem
          className="md:col-span-2 lg:row-span-2 md:row-span-1 gap-y-10"
          accent="ocean"
          eyebrow="Today"
          title="Concierge schedule"
          description="Keep high-touch experiences aligned across your day."
          icon={<Calendar className="h-4 w-4 text-accent" />}
        >
          <div className="space-y-4">
            {schedule.map((event) => (
              <div key={event.title} className="surface-tile space-y-2">
                <p className="text-sm font-medium text-foreground">{event.title}</p>
                <div className="mt-2 flex items-center justify-between text-xs text-muted-foreground">
                  <span>{event.time}</span>
                  <span>{event.status}</span>
                </div>
              </div>
            ))}
          </div>
        </BentoGridItem>

        <BentoGridItem
          className="md:col-span-3 lg:row-span-2 md:row-span-1"
          accent="emerald"
          eyebrow="Active requests"
          title="High-touch queue"
          description="Prioritise member experiences that need attention today."
          icon={<ClipboardList className="h-4 w-4 text-accent" />}
          action={
            <Button
              asChild
              variant="outline"
              size="sm"
              className="w-max text-[0.7rem] uppercase tracking-[0.24em]"
            >
              <Link href="/admin/requests">
                Manage requests
                <ArrowUpRight className="ml-1.5 h-3.5 w-3.5" />
              </Link>
            </Button>
          }
        >
          <div className="space-y-3">
            {openRequests.map((request) => (
              <div key={request.id} className="surface-tile flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-foreground">{request.member}</p>
                  <p className="text-xs text-muted-foreground">{request.type}</p>
                </div>
                <span className="text-xs uppercase tracking-[0.2em] text-muted-foreground">{request.due}</span>
              </div>
            ))}
          </div>
        </BentoGridItem>

        <BentoGridItem
          className="md:col-span-3 lg:row-span-2 md:row-span-1"
          accent="blush"
          eyebrow="Quick actions"
          title="Keep momentum"
          description="Launch the most common workflows without leaving the dashboard."
          icon={<Sparkles className="h-4 w-4 text-accent" />}
        >
          <div className="space-y-3">
            {quickActions.map((action) => (
              <Link
                key={action.title}
                href={action.href}
                className="surface-tile flex items-center justify-between gap-3 transition-colors hover:border-white/25 hover:bg-white/12"
              >
                <div>
                  <p className="text-sm font-medium text-foreground">{action.title}</p>
                  <p className="text-xs text-muted-foreground">{action.description}</p>
                </div>
                <ArrowUpRight className="h-4 w-4 text-accent" />
              </Link>
            ))}
          </div>
        </BentoGridItem>

        <BentoGridItem
          className="md:col-span-6 lg:row-span-2 md:row-span-1"
          accent="neutral"
          eyebrow="Member spotlight"
          title="Top engagement this quarter"
          description="Recognise members with the highest spend and personal interactions."
          icon={<Users2 className="h-4 w-4 text-accent" />}
          action={
            <Button
              asChild
              variant="outline"
              size="sm"
              className="w-max text-[0.7rem] uppercase tracking-[0.24em]"
            >
              <Link href="/admin/members">
                View member roster
                <ArrowUpRight className="ml-1.5 h-3.5 w-3.5" />
              </Link>
            </Button>
          }
        >
          <div className="grid gap-3 sm:grid-cols-3">
            {topMembers.map((member) => (
              <div key={member.name} className="space-y-2 rounded-2xl border border-white/10 bg-white/5 p-4">
                <p className="text-sm font-medium text-foreground">{member.name}</p>
                <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">{member.tier}</p>
                <p className="text-sm text-muted-foreground">Spend to date: {member.spend}</p>
              </div>
            ))}
          </div>
        </BentoGridItem>
      </BentoGrid>
    </div>
  )
}
  const quickActions = [
    {
      title: 'Create concierge request',
      description: 'Launch the luxury request form for bespoke experiences.',
      href: '/admin/requests',
    },
    {
      title: 'Invite a member',
      description: 'Send a personal invite email with onboarding steps.',
      href: '/admin/members',
    },
    {
      title: 'Upload shareable asset',
      description: 'Keep your media kit updated for client outreach.',
      href: '/admin/shareable-assets',
    },
  ]

  const openRequests = [
    {
      id: 'REQ-1045',
      member: 'Sarah Johnson',
      type: 'Concierge',
      due: 'Today · 5:00 PM',
    },
    {
      id: 'REQ-1038',
      member: 'Michael Brown',
      type: 'Flight',
      due: 'Tomorrow · 9:30 AM',
    },
    {
      id: 'REQ-1026',
      member: 'Emily Davis',
      type: 'Lifestyle',
      due: 'Friday · 1:00 PM',
    },
  ]

  const topMembers = [
    {
      name: 'Emily Davis',
      tier: 'Founding50',
      spend: '$18,400',
    },
    {
      name: 'John Smith',
      tier: 'Founding50',
      spend: '$15,900',
    },
    {
      name: 'Sarah Johnson',
      tier: 'House',
      spend: '$11,250',
    },
  ]
