import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'

import { createClient } from '@/lib/supabaseServer'
import { requireAdmin } from '@/lib/auth'

const updateSchema = z
  .object({
    firstName: z.string().min(1).optional(),
    lastName: z.string().min(1).optional(),
    email: z.string().email().optional(),
    status: z.enum(['active', 'inactive', 'pending', 'prospect']).optional(),
    tier: z.enum(['Founding50', 'Standard', 'House', 'Corporate']).optional(),
    phone: z.string().optional(),
    city: z.string().optional(),
    country: z.string().optional(),
    preferredAirport: z.string().optional(),
    notes: z.string().optional(),
  })
  .refine((value) => Object.keys(value).length > 0, {
    message: 'No fields to update',
  })

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ memberId: string }> }) {
  try {
    await requireAdmin()
    const supabase = await createClient()
    const { memberId } = await params

    const json = await request.json()
    const payload = updateSchema.parse(json)

    const updates: Record<string, unknown> = {}

    if (payload.firstName !== undefined) updates.first_name = payload.firstName
    if (payload.lastName !== undefined) updates.last_name = payload.lastName
    if (payload.email !== undefined) updates.email = payload.email
    if (payload.status !== undefined) updates.status = payload.status
    if (payload.tier !== undefined) updates.tier = payload.tier
    if (payload.phone !== undefined) updates.phone = payload.phone || null
    if (payload.city !== undefined) updates.city = payload.city || null
    if (payload.country !== undefined) updates.country = payload.country || null
    if (payload.preferredAirport !== undefined) updates.preferred_airport = payload.preferredAirport || null
    if (payload.notes !== undefined) updates.notes = payload.notes || null

    const { data, error } = await supabase
      .from('members')
      .update(updates)
      .eq('id', memberId)
      .select()
      .single()

    if (error) {
      console.error('Failed to update member', error)
      return NextResponse.json({ error: 'Unable to update member' }, { status: 500 })
    }

    return NextResponse.json({ member: data })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Invalid member data', details: error.format() }, { status: 400 })
    }

    console.error('Error updating member', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
