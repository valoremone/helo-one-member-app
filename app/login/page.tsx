'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { createClient } from '@/lib/supabaseClient'
import { toast } from 'sonner'
import { Loader2, Mail, Lock, UserPlus } from 'lucide-react'
import { useRouter } from 'next/navigation'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isSignUp, setIsSignUp] = useState(false)
  const [showForgotPassword, setShowForgotPassword] = useState(false)
  const router = useRouter()

  const handleMagicLink = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!email) {
      toast.error('Please enter your email address')
      return
    }

    setIsLoading(true)

    try {
      const supabase = createClient()
      
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      })

      if (error) {
        throw error
      }

      toast.success('Check your email for the login link!')
    } catch (error) {
      console.error('Error signing in:', error)
      toast.error('Failed to send login link. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const handlePasswordAuth = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!email || !password) {
      toast.error('Please enter both email and password')
      return
    }

    setIsLoading(true)

    try {
      const supabase = createClient()
      
      if (isSignUp) {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: `${window.location.origin}/auth/callback`,
          },
        })
        
        if (error) throw error
        toast.success('Account created! Check your email to confirm your account.')
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        })
        
        if (error) throw error
        toast.success('Signed in successfully!')
        
        // Get user profile to determine redirect
        const { data: { user } } = await supabase.auth.getUser()
        if (user) {
          const { data: profile } = await supabase
            .from('profiles')
            .select('role')
            .eq('id', user.id)
            .single()
          
          if (profile) {
            if (['admin', 'ops'].includes(profile.role)) {
              router.push('/admin')
            } else {
              router.push('/member')
            }
          } else {
            // If no profile exists, redirect to home to trigger profile creation
            router.push('/')
          }
        } else {
          router.push('/')
        }
      }
    } catch (error: any) {
      console.error('Error with password auth:', error)
      toast.error(error.message || 'Authentication failed. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!email) {
      toast.error('Please enter your email address')
      return
    }

    setIsLoading(true)

    try {
      const supabase = createClient()
      
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/reset-password`,
      })
      
      if (error) throw error
      toast.success('Password reset link sent! Check your email.')
      setShowForgotPassword(false)
    } catch (error: any) {
      console.error('Error sending password reset:', error)
      toast.error(error.message || 'Failed to send password reset link.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex items-center justify-center mb-4">
            <div className="h-12 w-12 bg-primary rounded-xl flex items-center justify-center">
              <span className="text-primary-foreground font-bold text-xl">H</span>
            </div>
          </div>
          <CardTitle className="text-2xl">Welcome to Helo One</CardTitle>
          <CardDescription>
            Choose your preferred sign-in method
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="password" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="password">Password</TabsTrigger>
              <TabsTrigger value="magic-link">Magic Link</TabsTrigger>
            </TabsList>
            
            <TabsContent value="password" className="space-y-4">
              {!showForgotPassword ? (
                <form onSubmit={handlePasswordAuth} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="email-password">Email Address</Label>
                    <Input
                      id="email-password"
                      type="email"
                      placeholder="your@email.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="password">Password</Label>
                    <Input
                      id="password"
                      type="password"
                      placeholder="Enter your password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                    />
                  </div>
                  
                  <div className="flex gap-2">
                    <Button 
                      type="submit" 
                      className="flex-1" 
                      disabled={isLoading}
                      onClick={() => setIsSignUp(false)}
                    >
                      {isLoading ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Signing In...
                        </>
                      ) : (
                        <>
                          <Lock className="mr-2 h-4 w-4" />
                          Sign In
                        </>
                      )}
                    </Button>
                    
                    <Button 
                      type="button" 
                      variant="outline" 
                      className="flex-1" 
                      disabled={isLoading}
                      onClick={async () => {
                        setIsSignUp(true)
                        await handlePasswordAuth(new Event('submit') as any)
                      }}
                    >
                      <UserPlus className="mr-2 h-4 w-4" />
                      Sign Up
                    </Button>
                  </div>
                  
                  <div className="text-center">
                    <Button
                      type="button"
                      variant="link"
                      className="text-sm text-muted-foreground"
                      onClick={() => setShowForgotPassword(true)}
                    >
                      Forgot your password?
                    </Button>
                  </div>
                </form>
              ) : (
                <form onSubmit={handleForgotPassword} className="space-y-4">
                  <div className="text-center mb-4">
                    <h3 className="text-lg font-semibold">Reset Password</h3>
                    <p className="text-sm text-muted-foreground">
                      Enter your email address and we'll send you a link to reset your password.
                    </p>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="email-forgot">Email Address</Label>
                    <Input
                      id="email-forgot"
                      type="email"
                      placeholder="your@email.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                  </div>
                  
                  <div className="flex gap-2">
                    <Button 
                      type="submit" 
                      className="flex-1" 
                      disabled={isLoading}
                    >
                      {isLoading ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Sending...
                        </>
                      ) : (
                        <>
                          <Mail className="mr-2 h-4 w-4" />
                          Send Reset Link
                        </>
                      )}
                    </Button>
                    
                    <Button 
                      type="button" 
                      variant="outline" 
                      className="flex-1" 
                      onClick={() => setShowForgotPassword(false)}
                    >
                      Back to Sign In
                    </Button>
                  </div>
                </form>
              )}
            </TabsContent>
            
            <TabsContent value="magic-link" className="space-y-4">
              <form onSubmit={handleMagicLink} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email-magic">Email Address</Label>
                  <Input
                    id="email-magic"
                    type="email"
                    placeholder="your@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
                
                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Sending...
                    </>
                  ) : (
                    <>
                      <Mail className="mr-2 h-4 w-4" />
                      Send Magic Link
                    </>
                  )}
                </Button>
              </form>
              
              <div className="text-center text-sm text-muted-foreground">
                <p>
                  We&apos;ll send you a secure link to sign in to your account.
                  No password required.
                </p>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}
