"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import {
  ClipboardList,
  CalendarCheck,
  Users2,
  Wallet,
  User,
  Share2,
  Palette,
  FileText,
  CircleHelp,
} from "lucide-react"

interface NavItem {
  title: string
  href: string
  icon: React.ComponentType<{ className?: string }>
}

interface NavGroup {
  title: string
  items: NavItem[]
}

const navigation: NavGroup[] = [
  {
    title: "My business",
    items: [
      {
        title: "Requests",
        href: "/member/requests",
        icon: ClipboardList,
      },
      {
        title: "Bookings",
        href: "/member/bookings",
        icon: CalendarCheck,
      },
      {
        title: "Members",
        href: "/member/members",
        icon: Users2,
      },
      {
        title: "Payments",
        href: "/member/payments",
        icon: Wallet,
      },
    ],
  },
  {
    title: "Client development",
    items: [
      {
        title: "Profile",
        href: "/member/profile",
        icon: User,
      },
      {
        title: "Shareable assets",
        href: "/member/shareable-assets",
        icon: Share2,
      },
      {
        title: "Brand assets",
        href: "/member/brand-assets",
        icon: Palette,
      },
      {
        title: "Templates & forms",
        href: "/member/templates-and-forms",
        icon: FileText,
      },
    ],
  },
]

export function MemberSidebarNav() {
  const pathname = usePathname()

  return (
    <div className="flex h-full flex-col">
      {/* Logo */}
      <div className="flex h-16 items-center border-b border-soft px-6">
        <Link href="/member" className="flex items-center space-x-2">
          <div className="h-8 w-8 rounded-lg accent-gradient flex items-center justify-center">
            <span className="text-sm font-bold text-primary-foreground">H</span>
          </div>
          <span className="text-xl font-serif font-semibold">HELO One</span>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-6 p-6">
        {navigation.map((group) => (
          <div key={group.title} className="space-y-2">
            <h3 className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
              {group.title}
            </h3>
            <div className="space-y-1">
              {group.items.map((item) => {
                const isActive = pathname === item.href
                const Icon = item.icon

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      "flex items-center space-x-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                      isActive
                        ? "bg-accent-soft text-accent border border-accent-soft"
                        : "text-muted-foreground hover-bg-soft hover:text-foreground"
                    )}
                  >
                    <Icon className="h-4 w-4" />
                    <span>{item.title}</span>
                  </Link>
                )
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* Footer */}
      <div className="border-t border-soft p-6">
        <Link
          href="/member/help"
          className="flex items-center space-x-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <CircleHelp className="h-4 w-4" />
          <span>Report an issue</span>
        </Link>
      </div>
    </div>
  )
}
