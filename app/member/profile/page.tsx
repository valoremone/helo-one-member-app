import { requireMember } from '@/lib/auth'
import { PageHeader } from '@/components/app/PageHeader'
import { GlassCard } from '@/components/app/GlassCard'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { User, Mail, Phone, MapPin, Plane, Edit } from 'lucide-react'

export default async function MemberProfilePage() {
  const profile = await requireMember()

  return (
    <div className="space-y-8">
      <PageHeader
        title="Profile"
        description="Manage your personal information and preferences"
        actions={
          <Button variant="outline">
            <Edit className="h-4 w-4 mr-2" />
            Edit Profile
          </Button>
        }
      />

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Personal Information */}
        <GlassCard>
          <div className="flex items-center space-x-2 mb-6">
            <User className="h-5 w-5 text-accent" />
            <h3 className="text-lg font-semibold">Personal Information</h3>
          </div>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="firstName">First Name</Label>
                <Input
                  id="firstName"
                  defaultValue={profile.full_name?.split(' ')[0] || ''}
                  disabled
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName">Last Name</Label>
                <Input
                  id="lastName"
                  defaultValue={profile.full_name?.split(' ')[1] || ''}
                  disabled
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                defaultValue={profile.email}
                disabled
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Phone</Label>
              <Input
                id="phone"
                placeholder="+1 (555) 123-4567"
                disabled
              />
            </div>
          </div>
        </GlassCard>

        {/* Membership Information */}
        <GlassCard>
          <div className="flex items-center space-x-2 mb-6">
            <Plane className="h-5 w-5 text-accent" />
            <h3 className="text-lg font-semibold">Membership Information</h3>
          </div>
          <div className="space-y-4">
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
              <span className="text-sm font-medium">January 2023</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Role</span>
              <span className="text-sm font-medium capitalize">{profile.role}</span>
            </div>
          </div>
        </GlassCard>

        {/* Travel Preferences */}
        <GlassCard>
          <div className="flex items-center space-x-2 mb-6">
            <MapPin className="h-5 w-5 text-accent" />
            <h3 className="text-lg font-semibold">Travel Preferences</h3>
          </div>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="preferredAirport">Preferred Airport</Label>
              <Input
                id="preferredAirport"
                placeholder="JFK - John F. Kennedy International"
                disabled
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="homeCity">Home City</Label>
              <Input
                id="homeCity"
                placeholder="New York, NY"
                disabled
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="cabinPreference">Cabin Preference</Label>
              <Input
                id="cabinPreference"
                placeholder="Business Class"
                disabled
              />
            </div>
          </div>
        </GlassCard>

        {/* Contact Information */}
        <GlassCard>
          <div className="flex items-center space-x-2 mb-6">
            <Mail className="h-5 w-5 text-accent" />
            <h3 className="text-lg font-semibold">Contact Information</h3>
          </div>
          <div className="space-y-4">
            <div className="flex items-center space-x-3">
              <Mail className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium">Email</p>
                <p className="text-sm text-muted-foreground">{profile.email}</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <Phone className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium">Phone</p>
                <p className="text-sm text-muted-foreground">+1 (555) 123-4567</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <MapPin className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium">Location</p>
                <p className="text-sm text-muted-foreground">New York, NY</p>
              </div>
            </div>
          </div>
        </GlassCard>
      </div>
    </div>
  )
}
