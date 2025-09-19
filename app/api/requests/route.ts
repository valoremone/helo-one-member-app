import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabaseServer'
import { requireMember } from '@/lib/auth'
import { z } from 'zod'

const createRequestSchema = z.object({
  type: z.enum(['flight', 'ground', 'experience', 'general']),
  subject: z.string().min(1),
  origin: z.string().optional(),
  destination: z.string().optional(),
  earliest_departure: z.string().optional(),
  latest_departure: z.string().optional(),
  one_way: z.boolean().optional(),
  return_earliest: z.string().optional(),
  return_latest: z.string().optional(),
  pax_count: z.number().optional(),
  cabin_preference: z.string().optional(),
  baggage_notes: z.string().optional(),
  special_requests: z.string().optional(),
  trip_purpose: z.string().optional(),
})

export async function POST(request: NextRequest) {
  try {
    const profile = await requireMember()
    const supabase = await createClient()
    
    const body = await request.json()
    const validatedData = createRequestSchema.parse(body)

    // Get the member record for this user
    const { data: member } = await supabase
      .from('members')
      .select('id')
      .eq('user_id', profile.id)
      .single()

    if (!member) {
      return NextResponse.json(
        { error: 'Member record not found' },
        { status: 404 }
      )
    }

    // Create the request
    const { data: newRequest, error: requestError } = await supabase
      .from('requests')
      .insert({
        member_id: member.id,
        created_by: profile.id,
        type: validatedData.type,
        subject: validatedData.subject,
        priority: 3, // Default priority
      })
      .select()
      .single()

    if (requestError) {
      console.error('Error creating request:', requestError)
      return NextResponse.json(
        { error: 'Failed to create request' },
        { status: 500 }
      )
    }

    // If it's a flight request, create the flight_requests record
    if (validatedData.type === 'flight') {
      const { error: flightError } = await supabase
        .from('flight_requests')
        .insert({
          request_id: newRequest.id,
          trip_purpose: validatedData.trip_purpose,
          pax_count: validatedData.pax_count,
          origin: validatedData.origin || '',
          destination: validatedData.destination || '',
          earliest_departure: validatedData.earliest_departure,
          latest_departure: validatedData.latest_departure,
          return_earliest: validatedData.return_earliest,
          return_latest: validatedData.return_latest,
          one_way: validatedData.one_way ?? true,
          cabin_preference: validatedData.cabin_preference,
          baggage_notes: validatedData.baggage_notes,
          special_requests: validatedData.special_requests,
        })

      if (flightError) {
        console.error('Error creating flight request:', flightError)
        return NextResponse.json(
          { error: 'Failed to create flight request details' },
          { status: 500 }
        )
      }
    }

    // Create initial message
    const { error: messageError } = await supabase
      .from('request_messages')
      .insert({
        request_id: newRequest.id,
        author_id: profile.id,
        body: `New ${validatedData.type} request submitted.`,
        is_internal: false,
      })

    if (messageError) {
      console.error('Error creating initial message:', messageError)
      // Don't fail the request creation for this
    }

    return NextResponse.json({ 
      success: true, 
      request: newRequest 
    })

  } catch (error) {
    console.error('Error in POST /api/requests:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request data', details: error.issues },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
