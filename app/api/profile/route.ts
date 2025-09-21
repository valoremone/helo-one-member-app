import { NextResponse } from 'next/server'

import { createClient } from '@/lib/supabaseServer'

interface ProfilePayload {
  fullName?: string
  signature?: string
  notes?: string
}

export async function PATCH(request: Request) {
  const supabase = await createClient()

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser()

  if (userError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const payload = (await request.json()) as ProfilePayload

  const fullNameUpdates: Record<string, unknown> = {}
  const metadataUpdates: Record<string, unknown> = {}

  if (typeof payload.fullName === 'string') {
    fullNameUpdates.full_name = payload.fullName.trim()
  }

  if (typeof payload.signature === 'string') {
    metadataUpdates.signature = payload.signature.trim()
  }

  if (typeof payload.notes === 'string') {
    metadataUpdates.concierge_notes = payload.notes.trim()
  }

  if (Object.keys(fullNameUpdates).length === 0 && Object.keys(metadataUpdates).length === 0) {
    return NextResponse.json({ error: 'No fields to update' }, { status: 400 })
  }

  let profileErrorMessage: string | null = null

  if (Object.keys(fullNameUpdates).length > 0) {
    const { error } = await supabase
      .from('profiles')
      .update({
        ...fullNameUpdates,
        updated_at: new Date().toISOString(),
      })
      .eq('id', user.id)

    if (error) {
      profileErrorMessage = error.message
    }
  }

  if (profileErrorMessage) {
    return NextResponse.json({ error: profileErrorMessage }, { status: 500 })
  }

  let updatedUserMetadata = user.user_metadata ?? {}

  if (Object.keys(metadataUpdates).length > 0) {
    const { data: updatedUser, error: metadataError } = await supabase.auth.updateUser({
      data: {
        ...updatedUserMetadata,
        ...metadataUpdates,
      },
    })

    if (metadataError) {
      return NextResponse.json({ error: metadataError.message }, { status: 500 })
    }

    updatedUserMetadata = updatedUser.user?.user_metadata ?? updatedUserMetadata
  }

  const { data: profile, error: profileFetchError } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  if (profileFetchError) {
    return NextResponse.json({ error: profileFetchError.message }, { status: 500 })
  }

  const metadata = {
    signature: updatedUserMetadata.signature ?? null,
    concierge_notes: updatedUserMetadata.concierge_notes ?? null,
  }

  return NextResponse.json({ profile, metadata })
}
