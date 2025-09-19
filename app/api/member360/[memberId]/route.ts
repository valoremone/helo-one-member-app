import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabaseServer'
import { requireAdmin } from '@/lib/auth'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ memberId: string }> }
) {
  try {
    await requireAdmin()
    const supabase = await createClient()
    const { memberId } = await params

    // Fetch member 360 data from the view
    const { data: member360, error } = await supabase
      .from('member_360')
      .select('*')
      .eq('member_id', memberId)
      .single()

    if (error) {
      console.error('Error fetching member 360:', error)
      return NextResponse.json(
        { error: 'Failed to fetch member data' },
        { status: 500 }
      )
    }

    if (!member360) {
      return NextResponse.json(
        { error: 'Member not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(member360)

  } catch (error) {
    console.error('Error in GET /api/member360/[memberId]:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
