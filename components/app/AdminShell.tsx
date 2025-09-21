"use client"

import { useState } from "react"
import { TopBar } from "@/components/app/TopBar"
import { SidebarNav } from "@/components/app/SidebarNav"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"

interface AdminShellProps {
  user: {
    full_name?: string | null
    email: string
    avatar_url?: string | null
  }
  children: React.ReactNode
}

export function AdminShell({ user, children }: AdminShellProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <div className="relative flex min-h-screen w-full bg-transparent">
      {/* Desktop Sidebar */}
      <aside className="relative hidden px-4 pb-8 pt-6 md:flex md:w-[19rem] lg:w-[20rem]">
        <div className="sticky top-6 flex h-[calc(100vh-4rem)] w-full flex-col overflow-hidden rounded-3xl luxury-card-strong p-0 shadow-[0_30px_80px_rgba(5,6,10,0.75)]">
          <SidebarNav />
        </div>
      </aside>

      {/* Mobile Sidebar Sheet */}
      <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
        <SheetContent side="left" className="w-full border-r border-white/10 bg-black/60 px-0 py-0 sm:max-w-xs">
          <SheetHeader className="sr-only">
            <SheetTitle>Navigation</SheetTitle>
          </SheetHeader>
          <SidebarNav onNavigate={() => setSidebarOpen(false)} />
        </SheetContent>
      </Sheet>

      {/* Main Area */}
      <div className="flex min-h-screen flex-1 flex-col">
        <TopBar user={user} onToggleSidebar={() => setSidebarOpen(true)} />
        <main className="relative z-10 flex-1 px-4 pb-16 pt-8 sm:px-6 lg:px-12">
          <div className="mx-auto flex w-full max-w-7xl flex-col gap-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}
