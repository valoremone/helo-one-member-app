import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabaseServer'
import { requireMember } from '@/lib/auth'
import { z } from 'zod'

const createMessageSchema = z.object({
  body: z.string().min(1),
  is_internal: z.boolean().default(false),
})

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const profile = await requireMember()
    const supabase = await createClient()
    const { id: requestId } = await params

    // Check if user has access to this request
    const { data: requestData } = await supabase
      .from('requests')
      .select(`
        id,
        member_id
      `)
      .eq('id', requestId)
      .single()

    if (!requestData) {
      return NextResponse.json(
        { error: 'Request not found' },
        { status: 404 }
      )
    }

    // Check if user is the member or admin/ops
    const { data: member } = await supabase
      .from('members')
      .select('user_id')
      .eq('id', requestData.member_id)
      .single()

    const isOwner = member?.user_id === profile.id
    const isAdmin = ['admin', 'ops'].includes(profile.role)

    if (!isOwner && !isAdmin) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 403 }
      )
    }

    // Fetch messages
    let query = supabase
      .from('request_messages')
      .select(`
        id,
        body,
        is_internal,
        created_at,
        author_id,
        profiles!inner(full_name, avatar_url)
      `)
      .eq('request_id', requestId)
      .order('created_at', { ascending: true })

    // If not admin, only show non-internal messages
    if (!isAdmin) {
      query = query.eq('is_internal', false)
    }

    const { data: messages, error } = await query

    if (error) {
      console.error('Error fetching messages:', error)
      return NextResponse.json(
        { error: 'Failed to fetch messages' },
        { status: 500 }
      )
    }

    return NextResponse.json(messages)

  } catch (error) {
    console.error('Error in GET /api/requests/[id]/messages:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const profile = await requireMember()
    const supabase = await createClient()
    const { id: requestId } = await params
    const body = await request.json()
    const validatedData = createMessageSchema.parse(body)

    // Check if user has access to this request
    const { data: requestData } = await supabase
      .from('requests')
      .select(`
        id,
        member_id
      `)
      .eq('id', requestId)
      .single()

    if (!requestData) {
      return NextResponse.json(
        { error: 'Request not found' },
        { status: 404 }
      )
    }

    // Check if user is the member or admin/ops
    const { data: member } = await supabase
      .from('members')
      .select('user_id')
      .eq('id', requestData.member_id)
      .single()

    const isOwner = member?.user_id === profile.id
    const isAdmin = ['admin', 'ops'].includes(profile.role)

    if (!isOwner && !isAdmin) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 403 }
      )
    }

    // Only admins can create internal messages
    if (validatedData.is_internal && !isAdmin) {
      return NextResponse.json(
        { error: 'Only admins can create internal messages' },
        { status: 403 }
      )
    }

    // Create the message
    const { data: newMessage, error: messageError } = await supabase
      .from('request_messages')
      .insert({
        request_id: requestId,
        author_id: profile.id,
        body: validatedData.body,
        is_internal: validatedData.is_internal,
      })
      .select(`
        id,
        body,
        is_internal,
        created_at,
        author_id,
        profiles!inner(full_name, avatar_url)
      `)
      .single()

    if (messageError) {
      console.error('Error creating message:', messageError)
      return NextResponse.json(
        { error: 'Failed to create message' },
        { status: 500 }
      )
    }

    return NextResponse.json(newMessage)

  } catch (error) {
    console.error('Error in POST /api/requests/[id]/messages:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid message data', details: error.issues },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}