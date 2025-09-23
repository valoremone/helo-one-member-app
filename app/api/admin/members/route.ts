import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'

import { createClient } from '@/lib/supabaseServer'
import { requireAdmin } from '@/lib/auth'

const memberSchema = z.object({
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  email: z.string().email(),
  status: z.enum(['active', 'inactive', 'pending', 'prospect']).default('active'),
  tier: z.enum(['Founding50', 'Standard', 'House', 'Corporate']).default('Standard'),
  phone: z.string().optional(),
  city: z.string().optional(),
  country: z.string().optional(),
  preferredAirport: z.string().optional(),
  notes: z.string().optional(),
})

export async function POST(request: NextRequest) {
  try {
    await requireAdmin()
    const supabase = await createClient()
    const json = await request.json()
    const payload = memberSchema.parse(json)

    const { data, error } = await supabase
      .from('members')
      .insert({
        first_name: payload.firstName,
        last_name: payload.lastName,
        email: payload.email,
        status: payload.status,
        tier: payload.tier,
        phone: payload.phone ?? null,
        city: payload.city ?? null,
        country: payload.country ?? null,
        preferred_airport: payload.preferredAirport ?? null,
        notes: payload.notes ?? null,
      })
      .select()
      .single()

    if (error) {
      console.error('Failed to create member', error)
      return NextResponse.json({ error: 'Unable to create member' }, { status: 500 })
    }

    return NextResponse.json({ member: data }, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Invalid member data', details: error.format() }, { status: 400 })
    }

    console.error('Error creating member', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
