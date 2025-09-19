import { requireMember } from '@/lib/auth'
import { RequestFormFlight } from '@/components/RequestFormFlight'

export default async function NewFlightRequestPage() {
  await requireMember()

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">New Flight Request</h1>
        <p className="text-muted-foreground">
          Submit a new flight request and our team will work to find the best options for you.
        </p>
      </div>
      
      <RequestFormFlight />
    </div>
  )
}
