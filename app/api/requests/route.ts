import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { createClient } from '@/lib/supabaseServer'

const requestSchema = z.object({
  type: z.enum(['concierge', 'flight']),
  title: z.string().min(1, 'Title is required'),
  category: z.string().optional(),
  details: z.string().min(1, 'Details are required'),
  // Flight specific fields
  origin: z.string().optional(),
  destination: z.string().optional(),
  departureDate: z.string().optional(),
  returnDate: z.string().optional(),
  passengers: z.number().min(1).optional(),
  cabin: z.string().optional(),
  notes: z.string().optional(),
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const validatedData = requestSchema.parse(body)

    const supabase = await createClient()
    
    // Get the current user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json(
        { ok: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Get member record
    const { data: member, error: memberError } = await supabase
      .from('members')
      .select('id')
      .eq('user_id', user.id)
      .single()

    if (memberError || !member) {
      return NextResponse.json(
        { ok: false, error: 'Member not found' },
        { status: 404 }
      )
    }

    // Create the request
    const { data: newRequest, error: requestError } = await supabase
      .from('requests')
      .insert({
        member_id: member.id,
        type: validatedData.type,
        subject: validatedData.title,
        details: validatedData.details,
        status: 'new',
        priority: 'medium',
      })
      .select()
      .single()

    if (requestError) {
      console.error('Error creating request:', requestError)
      return NextResponse.json(
        { ok: false, error: 'Failed to create request' },
        { status: 500 }
      )
    }

    // If it's a flight request, create flight_requests record
    if (validatedData.type === 'flight') {
      const { error: flightError } = await supabase
        .from('flight_requests')
        .insert({
          request_id: newRequest.id,
          origin: validatedData.origin,
          destination: validatedData.destination,
          departure_date: validatedData.departureDate,
          return_date: validatedData.returnDate,
          passengers: validatedData.passengers,
          cabin_class: validatedData.cabin,
          notes: validatedData.notes,
        })

      if (flightError) {
        console.error('Error creating flight request:', flightError)
        // Don't fail the whole request, just log the error
      }
    }

    // Create initial message
    const { error: messageError } = await supabase
      .from('request_messages')
      .insert({
        request_id: newRequest.id,
        sender_id: user.id,
        message: `New ${validatedData.type} request created: ${validatedData.title}`,
        is_internal: false,
      })

    if (messageError) {
      console.error('Error creating initial message:', messageError)
      // Don't fail the whole request, just log the error
    }

    return NextResponse.json({
      ok: true,
      data: {
        id: newRequest.id,
        type: newRequest.type,
        subject: newRequest.subject,
        status: newRequest.status,
      }
    })

  } catch (error) {
    console.error('Error in POST /api/requests:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { ok: false, error: 'Invalid request data', details: error.issues },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { ok: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function GET() {
  try {
    const supabase = await createClient()
    
    // Get the current user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json(
        { ok: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Get member record
    const { data: member, error: memberError } = await supabase
      .from('members')
      .select('id')
      .eq('user_id', user.id)
      .single()

    if (memberError || !member) {
      return NextResponse.json(
        { ok: false, error: 'Member not found' },
        { status: 404 }
      )
    }

    // Get requests for this member
    const { data: requests, error: requestsError } = await supabase
      .from('requests')
      .select('*')
      .eq('member_id', member.id)
      .order('created_at', { ascending: false })

    if (requestsError) {
      console.error('Error fetching requests:', requestsError)
      return NextResponse.json(
        { ok: false, error: 'Failed to fetch requests' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      ok: true,
      data: requests || []
    })

  } catch (error) {
    console.error('Error in GET /api/requests:', error)
    return NextResponse.json(
      { ok: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}