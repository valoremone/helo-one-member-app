import { requireAdmin } from '@/lib/auth'
import { Navigation } from '@/components/Navigation'

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const userProfile = await requireAdmin()

  return (
    <div className="min-h-screen bg-background">
      <Navigation userProfile={userProfile} currentPath="/admin" />
      <main className="container mx-auto px-4 py-8">
        {children}
      </main>
    </div>
  )
}
