import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { requireAdmin } from '@/lib/auth'
import { createClient } from '@/lib/supabaseServer'
import { deriveNM2, deriveSIG, randomRAND, buildCore } from '@/lib/pmc'

const BodySchema = z.object({
  memberId: z.string().uuid(),
  tier: z.enum(['F50','H1','FF']),
  dob: z.string().min(8).max(8).optional(),
  phoneLast6: z.string().min(6).max(6).optional(),
  role: z.union([z.literal('X'), z.literal('A'), z.literal('B'), z.literal('C'), z.literal('D'), z.literal('E'), z.literal('F'), z.literal('G')]).optional(),
  accountHolder: z.object({ firstName: z.string(), lastName: z.string() }).optional()
})

export async function POST(req: NextRequest) {
  try {
    console.log('PMC issuance started')
    await requireAdmin()
    console.log('Admin auth passed')
    const supabase = await createClient()
    const json = await req.json()
    console.log('Request body:', json)
    const { memberId, tier, dob, phoneLast6, role = 'X', accountHolder } = BodySchema.parse(json)
    console.log('Parsed data:', { memberId, tier, dob, phoneLast6, role })

    const { data: me, error: meErr } = await supabase
      .from('members')
      .select('id,account_id,first_name,last_name')
      .eq('id', memberId)
      .single()
    if (meErr || !me) return NextResponse.json({ error: 'member_not_found' }, { status: 404 })

    // Try to reuse existing nm2/sig if member already has an active code (supports reissue without PII)
    const { data: existingCode } = await supabase
      .from('member_codes')
      .select('nm2,sig,role')
      .eq('member_id', memberId)
      .eq('status','active')
      .maybeSingle()

    let nm2: string
    let sig: string

    if (existingCode) {
      nm2 = existingCode.nm2 as string
      sig = existingCode.sig as string
    } else if (role === 'X') {
      const fn = accountHolder?.firstName ?? me.first_name ?? ''
      const ln = accountHolder?.lastName ?? me.last_name ?? ''
      nm2 = deriveNM2(fn, ln)
      if (!dob || !phoneLast6) return NextResponse.json({ error: 'missing_pii_for_sig' }, { status: 400 })
      sig = deriveSIG(dob, phoneLast6)
    } else {
      // Authorized user: inherit from the holder on the same account
      const accountId = me.account_id ?? me.id
      const { data: holderCode } = await supabase
        .from('member_codes')
        .select('nm2,sig')
        .eq('member_id', accountId)
        .eq('status','active')
        .limit(1)
        .maybeSingle()
      if (!holderCode) return NextResponse.json({ error: 'holder_code_missing' }, { status: 400 })
      nm2 = holderCode.nm2 as string
      sig = holderCode.sig as string
    }

    const rand = randomRAND()
    const { core, chk } = buildCore(tier, nm2, sig, rand)
    const display = `${tier}-${nm2}-${sig}-${rand}–${chk}-${role}`

    // Revoke any active code for this member
    await supabase
      .from('member_codes')
      .update({ status: 'revoked', revoked_at: new Date().toISOString() })
      .eq('member_id', memberId)
      .eq('status', 'active')

    const { data, error } = await supabase
      .from('member_codes')
      .insert({ member_id: memberId, core, display, tier, nm2, sig, rand, chk, role, status: 'active' })
      .select()
      .single()

    if (error) return NextResponse.json({ error: error.message }, { status: 400 })
    return NextResponse.json({ ok: true, pmc: data })
  } catch (err) {
    console.error('PMC issuance error:', err)
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: 'bad_request', details: err.flatten() }, { status: 400 })
    }
    return NextResponse.json({ error: 'internal_error', message: err instanceof Error ? err.message : 'Unknown error' }, { status: 500 })
  }
}


