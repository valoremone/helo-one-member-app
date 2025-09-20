"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs"
import { Plus } from "lucide-react"

const requestSchema = z.object({
  type: z.enum(["concierge", "flight"]),
  title: z.string().min(1, "Title is required"),
  category: z.string().optional(),
  details: z.string().min(1, "Details are required"),
  // Flight specific fields
  origin: z.string().optional(),
  destination: z.string().optional(),
  departureDate: z.string().optional(),
  returnDate: z.string().optional(),
  passengers: z.number().min(1).optional(),
  cabin: z.string().optional(),
  notes: z.string().optional(),
})

type RequestFormData = z.infer<typeof requestSchema>

interface RequestFormSheetProps {
  onSuccess?: (data: RequestFormData) => void
}

export function RequestFormSheet({ onSuccess }: RequestFormSheetProps) {
  const [open, setOpen] = useState(false)
  const [activeTab, setActiveTab] = useState("concierge")

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<RequestFormData>({
    resolver: zodResolver(requestSchema),
    defaultValues: {
      type: "concierge",
    },
  })

  const onSubmit = async (data: RequestFormData) => {
    try {
      // TODO: Submit to API
      console.log("Submitting request:", data)
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      onSuccess?.(data)
      reset()
      setOpen(false)
    } catch (error) {
      console.error("Error submitting request:", error)
    }
  }

  const handleTabChange = (value: string) => {
    setActiveTab(value)
    // Update form type when tab changes
    // This would be handled by the form library in a real implementation
  }

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button className="rounded-full px-5">
          <Plus className="mr-2 h-4 w-4" />
          New Request
        </Button>
      </SheetTrigger>
      <SheetContent className="w-full overflow-y-auto border-white/10 bg-black/80 px-8 py-10 sm:max-w-2xl">
        <SheetHeader>
          <SheetTitle className="text-2xl font-serif font-semibold">Create new request</SheetTitle>
          <SheetDescription className="text-sm text-muted-foreground">
            Submit concierge and flight experiences without breaking the luxury cadence.
          </SheetDescription>
        </SheetHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="mt-8 space-y-8">
          <Tabs value={activeTab} onValueChange={handleTabChange}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="concierge">Concierge</TabsTrigger>
              <TabsTrigger value="flight">Flight</TabsTrigger>
            </TabsList>

            <TabsContent value="concierge" className="mt-8 space-y-5">
              <div className="space-y-2">
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  {...register("title")}
                  placeholder="Brief description of your request"
                />
                {errors.title && (
                  <p className="text-sm text-destructive">{errors.title.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="category">Category</Label>
                <Input
                  id="category"
                  {...register("category")}
                  placeholder="e.g., Dining, Events, Transportation"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="details">Details</Label>
                <Textarea
                  id="details"
                  {...register("details")}
                  placeholder="Please provide detailed information about your request..."
                  rows={4}
                />
                {errors.details && (
                  <p className="text-sm text-destructive">{errors.details.message}</p>
                )}
              </div>
            </TabsContent>

            <TabsContent value="flight" className="mt-8 space-y-5">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="origin">Origin</Label>
                  <Input
                    id="origin"
                    {...register("origin")}
                    placeholder="Departure city/airport"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="destination">Destination</Label>
                  <Input
                    id="destination"
                    {...register("destination")}
                    placeholder="Arrival city/airport"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="departureDate">Departure Date</Label>
                  <Input
                    id="departureDate"
                    type="date"
                    {...register("departureDate")}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="returnDate">Return Date</Label>
                  <Input
                    id="returnDate"
                    type="date"
                    {...register("returnDate")}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="passengers">Passengers</Label>
                  <Input
                    id="passengers"
                    type="number"
                    min="1"
                    {...register("passengers", { valueAsNumber: true })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="cabin">Cabin Class</Label>
                  <Input
                    id="cabin"
                    {...register("cabin")}
                    placeholder="Economy, Business, First"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="notes">Additional Notes</Label>
                <Textarea
                  id="notes"
                  {...register("notes")}
                  placeholder="Any special requirements or preferences..."
                  rows={3}
                />
              </div>
            </TabsContent>
          </Tabs>

          <div className="flex justify-end gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              className="rounded-full px-5"
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting} className="rounded-full px-5">
              {isSubmitting ? "Submitting..." : "Submit request"}
            </Button>
          </div>
        </form>
      </SheetContent>
    </Sheet>
  )
}
