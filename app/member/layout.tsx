import { requireMember } from '@/lib/auth'
import { MemberSidebarNav } from '@/components/app/MemberSidebarNav'
import { TopBar } from '@/components/app/TopBar'

export default async function MemberLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const userProfile = await requireMember()

  return (
    <div className="min-h-screen flex">
      {/* Sidebar */}
      <div className="w-64 glass-strong border-r border-soft">
        <MemberSidebarNav />
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col">
        <TopBar user={userProfile} />
        <main className="flex-1 p-6">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}
