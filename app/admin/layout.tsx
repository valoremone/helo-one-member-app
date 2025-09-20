import { requireAdmin } from '@/lib/auth'
import { AdminShell } from '@/components/app/AdminShell'

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const userProfile = await requireAdmin()

  return (
    <AdminShell user={userProfile}>{children}</AdminShell>
  )
}
