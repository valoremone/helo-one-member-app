'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { createClient } from '@/lib/supabaseClient'
import { toast } from 'sonner'

export default function TestAuthPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [user, setUser] = useState<any>(null)

  const testSignUp = async () => {
    setIsLoading(true)
    try {
      const supabase = createClient()
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
      })
      
      if (error) {
        toast.error(`Sign up error: ${error.message}`)
        console.error('Sign up error:', error)
      } else {
        toast.success('Sign up successful!')
        console.log('Sign up data:', data)
        setUser(data.user)
      }
    } catch (error) {
      toast.error(`Unexpected error: ${error}`)
      console.error('Unexpected error:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const testSignIn = async () => {
    setIsLoading(true)
    try {
      const supabase = createClient()
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })
      
      if (error) {
        toast.error(`Sign in error: ${error.message}`)
        console.error('Sign in error:', error)
      } else {
        toast.success('Sign in successful!')
        console.log('Sign in data:', data)
        setUser(data.user)
      }
    } catch (error) {
      toast.error(`Unexpected error: ${error}`)
      console.error('Unexpected error:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const testProfile = async () => {
    try {
      const supabase = createClient()
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user?.id)
        .single()
      
      if (error) {
        toast.error(`Profile error: ${error.message}`)
        console.error('Profile error:', error)
      } else {
        toast.success('Profile found!')
        console.log('Profile data:', profile)
      }
    } catch (error) {
      toast.error(`Unexpected error: ${error}`)
      console.error('Unexpected error:', error)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Auth Test Page</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="test@example.com"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="password123"
            />
          </div>
          
          <div className="flex gap-2">
            <Button onClick={testSignUp} disabled={isLoading} className="flex-1">
              Test Sign Up
            </Button>
            <Button onClick={testSignIn} disabled={isLoading} className="flex-1">
              Test Sign In
            </Button>
          </div>
          
          {user && (
            <div className="space-y-2">
              <p className="text-sm text-green-600">User: {user.email}</p>
              <Button onClick={testProfile} className="w-full">
                Test Profile Query
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
