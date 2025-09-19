'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Checkbox } from '@/components/ui/checkbox'
import { Plane, Loader2 } from 'lucide-react'
import { toast } from 'sonner'

const flightRequestSchema = z.object({
  subject: z.string().min(1, 'Subject is required'),
  origin: z.string().min(1, 'Origin is required'),
  destination: z.string().min(1, 'Destination is required'),
  earliest_departure: z.string().min(1, 'Earliest departure is required'),
  latest_departure: z.string().min(1, 'Latest departure is required'),
  one_way: z.boolean().default(true),
  return_earliest: z.string().optional(),
  return_latest: z.string().optional(),
  pax_count: z.number().min(1, 'At least 1 passenger required'),
  cabin_preference: z.string().optional(),
  baggage_notes: z.string().optional(),
  special_requests: z.string().optional(),
  trip_purpose: z.string().optional(),
})

type FlightRequestForm = z.infer<typeof flightRequestSchema>

export function RequestFormFlight() {
  const [isSubmitting, setIsSubmitting] = useState(false)
  
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<FlightRequestForm>({
    defaultValues: {
      one_way: true,
      pax_count: 1,
    },
  })

  const oneWay = watch('one_way')

  const onSubmit = async (data: FlightRequestForm) => {
    setIsSubmitting(true)
    
    try {
      // Validate the data
      const validatedData = flightRequestSchema.parse(data)
      const response = await fetch('/api/requests', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          type: 'flight',
          ...validatedData,
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to submit request')
      }

      toast.success('Flight request submitted successfully!')
      
      // Reset form
      window.location.href = '/member/requests'
    } catch (error) {
      console.error('Error submitting request:', error)
      toast.error('Failed to submit request. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Plane className="h-5 w-5" />
          Flight Request
        </CardTitle>
        <CardDescription>
          Submit a new flight request. Our team will work to find the best options for you.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="subject">Subject *</Label>
            <Input
              id="subject"
              {...register('subject')}
              placeholder="Brief description of your trip"
            />
            {errors.subject && (
              <p className="text-sm text-red-600">{errors.subject.message}</p>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="origin">Origin *</Label>
              <Input
                id="origin"
                {...register('origin')}
                placeholder="e.g., LAX, JFK"
              />
              {errors.origin && (
                <p className="text-sm text-red-600">{errors.origin.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="destination">Destination *</Label>
              <Input
                id="destination"
                {...register('destination')}
                placeholder="e.g., LHR, CDG"
              />
              {errors.destination && (
                <p className="text-sm text-red-600">{errors.destination.message}</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="earliest_departure">Earliest Departure *</Label>
              <Input
                id="earliest_departure"
                type="datetime-local"
                {...register('earliest_departure')}
              />
              {errors.earliest_departure && (
                <p className="text-sm text-red-600">{errors.earliest_departure.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="latest_departure">Latest Departure *</Label>
              <Input
                id="latest_departure"
                type="datetime-local"
                {...register('latest_departure')}
              />
              {errors.latest_departure && (
                <p className="text-sm text-red-600">{errors.latest_departure.message}</p>
              )}
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="one_way"
              checked={oneWay}
              onCheckedChange={(checked) => setValue('one_way', checked as boolean)}
            />
            <Label htmlFor="one_way">One-way trip</Label>
          </div>

          {!oneWay && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="return_earliest">Earliest Return</Label>
                <Input
                  id="return_earliest"
                  type="datetime-local"
                  {...register('return_earliest')}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="return_latest">Latest Return</Label>
                <Input
                  id="return_latest"
                  type="datetime-local"
                  {...register('return_latest')}
                />
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="pax_count">Number of Passengers *</Label>
              <Input
                id="pax_count"
                type="number"
                min="1"
                {...register('pax_count', { valueAsNumber: true })}
              />
              {errors.pax_count && (
                <p className="text-sm text-red-600">{errors.pax_count.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="cabin_preference">Cabin Preference</Label>
              <Input
                id="cabin_preference"
                {...register('cabin_preference')}
                placeholder="e.g., Business, First"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="trip_purpose">Trip Purpose</Label>
            <Input
              id="trip_purpose"
              {...register('trip_purpose')}
              placeholder="e.g., Business, Leisure, Medical"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="baggage_notes">Baggage Notes</Label>
            <Textarea
              id="baggage_notes"
              {...register('baggage_notes')}
              placeholder="Special baggage requirements..."
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="special_requests">Special Requests</Label>
            <Textarea
              id="special_requests"
              {...register('special_requests')}
              placeholder="Any special requirements or preferences..."
              rows={3}
            />
          </div>

          <Button type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Submitting...
              </>
            ) : (
              'Submit Flight Request'
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
