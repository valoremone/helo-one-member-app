// Mock data utilities for when Supabase isn't configured
// This allows the UI to render beautifully out-of-the-box

export interface MockUser {
  id: string
  email: string
  full_name: string
  role: string
}

export interface MockRequest {
  id: string
  subject: string
  type: 'flight' | 'concierge'
  status: 'new' | 'in_progress' | 'awaiting_member' | 'completed' | 'canceled'
  priority: 'high' | 'medium' | 'low'
  member: string
  created: string
}

export interface MockMember {
  id: string
  name: string
  email: string
  status: 'active' | 'inactive' | 'pending'
  tier: string
  requests: number
  city: string
  created: string
}

export interface MockBooking {
  id: string
  itinerary: string
  status: 'confirmed' | 'pending' | 'canceled'
  amount: string
  commission: string
  bookedDate: string
}

export const mockUser: MockUser = {
  id: 'mock-user-1',
  email: 'john@example.com',
  full_name: 'John Smith',
  role: 'member',
}

export const mockAdminUser: MockUser = {
  id: 'mock-admin-1',
  email: 'admin@helo-one.com',
  full_name: 'Admin User',
  role: 'admin',
}

export const mockRequests: MockRequest[] = [
  {
    id: '1',
    subject: 'Private Jet to Aspen',
    type: 'flight',
    status: 'new',
    priority: 'high',
    member: 'John Smith',
    created: '2024-01-15',
  },
  {
    id: '2',
    subject: 'Restaurant Reservations',
    type: 'concierge',
    status: 'in_progress',
    priority: 'medium',
    member: 'Sarah Johnson',
    created: '2024-01-14',
  },
  {
    id: '3',
    subject: 'Hotel Booking - Paris',
    type: 'concierge',
    status: 'awaiting_member',
    priority: 'low',
    member: 'Michael Brown',
    created: '2024-01-13',
  },
  {
    id: '4',
    subject: 'Event Tickets - Wimbledon',
    type: 'concierge',
    status: 'completed',
    priority: 'high',
    member: 'Emily Davis',
    created: '2024-01-12',
  },
]

export const mockMembers: MockMember[] = [
  {
    id: '1',
    name: 'John Smith',
    email: 'john@example.com',
    status: 'active',
    tier: 'Founding50',
    requests: 12,
    city: 'New York',
    created: '2023-06-15',
  },
  {
    id: '2',
    name: 'Sarah Johnson',
    email: 'sarah@example.com',
    status: 'active',
    tier: 'House',
    requests: 8,
    city: 'Los Angeles',
    created: '2023-08-22',
  },
  {
    id: '3',
    name: 'Michael Brown',
    email: 'michael@example.com',
    status: 'pending',
    tier: 'Standard',
    requests: 3,
    city: 'Chicago',
    created: '2024-01-10',
  },
  {
    id: '4',
    name: 'Emily Davis',
    email: 'emily@example.com',
    status: 'active',
    tier: 'Founding50',
    requests: 15,
    city: 'Miami',
    created: '2023-04-05',
  },
]

export const mockBookings: MockBooking[] = [
  {
    id: '1',
    itinerary: 'Private Jet - NYC to Aspen',
    status: 'confirmed',
    amount: '$15,000',
    commission: '$1,500',
    bookedDate: '2024-01-15',
  },
  {
    id: '2',
    itinerary: 'Hotel - The Ritz Paris',
    status: 'pending',
    amount: '$3,200',
    commission: '$320',
    bookedDate: '2024-01-14',
  },
  {
    id: '3',
    itinerary: 'Restaurant - Le Bernardin',
    status: 'confirmed',
    amount: '$450',
    commission: '$45',
    bookedDate: '2024-01-13',
  },
]

export function loadMock<T>(data: T[]): T[] {
  // Simulate loading delay
  return data
}

export function isSupabaseConfigured(): boolean {
  return !!(
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  )
}
