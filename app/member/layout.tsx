import { requireMember } from '@/lib/auth'
import { Navigation } from '@/components/Navigation'

export default async function MemberLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const userProfile = await requireMember()

  return (
    <div className="min-h-screen bg-background">
      <Navigation userProfile={userProfile} currentPath="/member" />
      <main className="container mx-auto px-4 py-8">
        {children}
      </main>
    </div>
  )
}
