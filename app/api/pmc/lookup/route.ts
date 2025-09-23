import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { createClient } from '@/lib/supabaseServer'
import { requireAdmin } from '@/lib/auth'
import { validatePMC } from '@/lib/pmc'

const Body = z.object({ code: z.string().min(8) })

export async function POST(req: NextRequest) {
  try {
    await requireAdmin()
    const supabase = await createClient()
    const { code } = Body.parse(await req.json())
    const v = validatePMC(code)
    if (!v.ok || !v.core) return NextResponse.json({ error: 'invalid_code' }, { status: 400 })

    const { data, error } = await supabase
      .from('member_codes')
      .select('member_id, status, role')
      .eq('core', v.core)
      .eq('role', v.role)
      .eq('status','active')
      .single()
    if (error || !data) return NextResponse.json({ error: 'not_found' }, { status: 404 })
    return NextResponse.json({ ok: true, memberId: data.member_id, role: data.role })
  } catch (err) {
    if (err instanceof z.ZodError) return NextResponse.json({ error: 'bad_request' }, { status: 400 })
    return NextResponse.json({ error: 'internal_error' }, { status: 500 })
  }
}


