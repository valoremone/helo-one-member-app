import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { getUserProfile } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { Plane, Users, Settings, ArrowRight } from 'lucide-react'

export default async function Home() {
  const profile = await getUserProfile()

  // If user is logged in, redirect to appropriate portal
  if (profile) {
    if (['admin', 'ops'].includes(profile.role)) {
      redirect('/admin')
    } else {
      redirect('/member')
    }
  }

  return (
    <div className="min-h-screen">
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-16">
          <div className="flex items-center justify-center mb-6">
            <div className="h-16 w-16 accent-gradient rounded-2xl flex items-center justify-center">
              <span className="text-primary-foreground font-bold text-2xl">H</span>
            </div>
          </div>
          <h1 className="text-4xl md:text-6xl font-serif font-bold text-foreground mb-4">
            HELO One
          </h1>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Premium concierge services for discerning members. Experience the world with personalized care and attention to detail.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild size="lg" className="text-lg px-8 glass ring-gold">
              <Link href="/login">
                Sign In
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="text-lg px-8 glass ring-gold">
              <Link href="/login">
                Get Started
              </Link>
            </Button>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          <Card className="text-center luxury-card">
            <CardHeader>
              <div className="mx-auto mb-4 h-12 w-12 bg-accent-soft rounded-lg flex items-center justify-center">
                <Plane className="h-6 w-6 text-accent" />
              </div>
              <CardTitle className="text-foreground">Flight Services</CardTitle>
              <CardDescription className="text-muted-foreground">
                Private jet charters, commercial flight bookings, and travel coordination
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="text-sm text-muted-foreground space-y-2">
                <li>• Private jet charters</li>
                <li>• First class bookings</li>
                <li>• Travel coordination</li>
                <li>• VIP airport services</li>
              </ul>
            </CardContent>
          </Card>

          <Card className="text-center luxury-card">
            <CardHeader>
              <div className="mx-auto mb-4 h-12 w-12 bg-accent-soft rounded-lg flex items-center justify-center">
                <Users className="h-6 w-6 text-accent" />
              </div>
              <CardTitle className="text-foreground">Concierge Services</CardTitle>
              <CardDescription className="text-muted-foreground">
                Personal assistance for all your lifestyle and business needs
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="text-sm text-muted-foreground space-y-2">
                <li>• Restaurant reservations</li>
                <li>• Event planning</li>
                <li>• Personal shopping</li>
                <li>• Business support</li>
              </ul>
            </CardContent>
          </Card>

          <Card className="text-center luxury-card">
            <CardHeader>
              <div className="mx-auto mb-4 h-12 w-12 bg-accent-soft rounded-lg flex items-center justify-center">
                <Settings className="h-6 w-6 text-accent" />
              </div>
              <CardTitle className="text-foreground">24/7 Support</CardTitle>
              <CardDescription className="text-muted-foreground">
                Round-the-clock assistance from our dedicated team of professionals
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="text-sm text-muted-foreground space-y-2">
                <li>• 24/7 availability</li>
                <li>• Dedicated account manager</li>
                <li>• Priority support</li>
                <li>• Global network</li>
              </ul>
            </CardContent>
          </Card>
        </div>

        <div className="text-center mt-16">
          <p className="text-muted-foreground">
            Ready to experience premium concierge services?
          </p>
          <Button asChild className="mt-4" size="lg" variant="outline">
            <Link href="/login">
              Join HELO One Today
            </Link>
          </Button>
        </div>
      </div>
    </div>
  )
}
