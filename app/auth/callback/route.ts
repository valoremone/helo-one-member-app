import { createClient } from '@/lib/supabaseServer'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const type = searchParams.get('type')
  const next = searchParams.get('next') ?? '/'

  if (code) {
    const supabase = await createClient()
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    
    if (!error) {
      const forwardedHost = request.headers.get('x-forwarded-host')
      const isLocalEnv = process.env.NODE_ENV === 'development'
      
      // Handle password reset redirects
      if (type === 'recovery') {
        const redirectUrl = isLocalEnv 
          ? `${origin}/auth/reset-password`
          : forwardedHost 
            ? `https://${forwardedHost}/auth/reset-password`
            : `${origin}/auth/reset-password`
        return NextResponse.redirect(redirectUrl)
      }
      
      // For new user signups, ensure profile exists and redirect appropriately
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        // Check if profile exists, create if not
        const { data: profile } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', user.id)
          .single()
        
        if (!profile) {
          // Create profile if it doesn't exist
          await supabase
            .from('profiles')
            .insert({
              id: user.id,
              email: user.email || '',
              full_name: user.user_metadata?.full_name || user.email || '',
              role: 'member'
            })
        }
      }
      
      if (isLocalEnv) {
        return NextResponse.redirect(`${origin}${next}`)
      } else if (forwardedHost) {
        return NextResponse.redirect(`https://${forwardedHost}${next}`)
      } else {
        return NextResponse.redirect(`${origin}${next}`)
      }
    }
  }

  // Return the user to an error page with instructions
  return NextResponse.redirect(`${origin}/auth/auth-code-error`)
}
