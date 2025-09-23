import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { validatePMC } from '@/lib/pmc'

const Body = z.object({ code: z.string().min(8) })

export async function POST(req: NextRequest) {
  try {
    const { code } = Body.parse(await req.json())
    const v = validatePMC(code)
    if (!v.ok) return NextResponse.json({ ok: false, reason: v.reason }, { status: 200 })
    return NextResponse.json({ ok: true, core: v.core, role: v.role })
  } catch (err) {
    if (err instanceof z.ZodError) return NextResponse.json({ ok: false, reason: 'format' }, { status: 200 })
    return NextResponse.json({ ok: false, reason: 'format' }, { status: 200 })
  }
}


