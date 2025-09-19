export type RequestType = 'flight' | 'ground' | 'experience' | 'general'
export type RequestStatus = 'new' | 'in_progress' | 'awaiting_member' | 'completed' | 'canceled'
export type MemberStatus = 'active' | 'inactive' | 'prospect'
export type MembershipStatus = 'active' | 'expired' | 'pending'
export type UserRole = 'member' | 'admin' | 'ops'

export interface Organization {
  id: string
  name: string
  created_at: string
}

export interface Profile {
  id: string
  email: string
  full_name: string | null
  avatar_url: string | null
  role: UserRole
  organization_id: string | null
  created_at: string
}

export interface Member {
  id: string
  user_id: string | null
  external_ref: string | null
  status: MemberStatus
  first_name: string | null
  last_name: string | null
  phone: string | null
  preferred_airport: string | null
  city: string | null
  country: string | null
  notes: string | null
  created_at: string
  updated_at: string
}

export interface Membership {
  id: string
  member_id: string
  tier: string
  start_date: string
  end_date: string | null
  status: MembershipStatus
  created_at: string
}

export interface Request {
  id: string
  member_id: string
  created_by: string | null
  type: RequestType
  status: RequestStatus
  subject: string
  priority: number
  created_at: string
  updated_at: string
}

export interface RequestMessage {
  id: string
  request_id: string
  author_id: string | null
  body: string | null
  is_internal: boolean
  created_at: string
}

export interface FlightRequest {
  request_id: string
  trip_purpose: string | null
  pax_count: number | null
  origin: string
  destination: string
  earliest_departure: string | null
  latest_departure: string | null
  return_earliest: string | null
  return_latest: string | null
  one_way: boolean
  cabin_preference: string | null
  baggage_notes: string | null
  special_requests: string | null
}

export interface Attachment {
  id: string
  request_id: string
  storage_path: string
  filename: string
  created_at: string
}

export interface Member360 {
  member_id: string
  first_name: string | null
  last_name: string | null
  phone: string | null
  preferred_airport: string | null
  city: string | null
  country: string | null
  member_status: MemberStatus
  email: string | null
  profile_name: string | null
  role: UserRole | null
  recent_requests: Array<{
    id: string
    type: RequestType
    status: RequestStatus
    subject: string
    created_at: string
  }> | null
  memberships: Array<{
    tier: string
    start_date: string
    end_date: string | null
    status: MembershipStatus
  }> | null
}
