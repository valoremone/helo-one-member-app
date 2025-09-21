"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { motion } from "framer-motion"
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

interface SidebarNavProps {
  onNavigate?: () => void
}

const navigation: NavGroup[] = [
  {
    title: "My business",
    items: [
      {
        title: "Requests",
        href: "/admin/requests",
        icon: ClipboardList,
      },
      {
        title: "Bookings",
        href: "/admin/bookings",
        icon: CalendarCheck,
      },
      {
        title: "Members",
        href: "/admin/members",
        icon: Users2,
      },
      {
        title: "Payments",
        href: "/admin/payments",
        icon: Wallet,
      },
    ],
  },
  {
    title: "Client development",
    items: [
      {
        title: "Profile",
        href: "/admin/profile",
        icon: User,
      },
      {
        title: "Shareable assets",
        href: "/admin/shareable-assets",
        icon: Share2,
      },
      {
        title: "Brand assets",
        href: "/admin/brand-assets",
        icon: Palette,
      },
      {
        title: "Templates & forms",
        href: "/admin/templates-and-forms",
        icon: FileText,
      },
    ],
  },
]

export function SidebarNav({ onNavigate }: SidebarNavProps) {
  const pathname = usePathname()

  return (
    <div className="flex h-full flex-col">
      <div className="flex h-20 items-center border-b border-white/10 px-6">
        <Link
          href="/admin"
          className="group flex w-full items-center gap-3 text-sm text-muted-foreground transition-colors hover:text-foreground"
          onClick={onNavigate}
        >
          <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-white/8 shadow-[0_10px_30px_rgba(0,0,0,0.4)]">
            <span className="font-serif text-lg tracking-[-0.05em] text-foreground">H</span>
          </div>
          <div className="space-y-0.5">
            <p className="font-serif text-base font-semibold leading-none text-foreground">
              HELO One
            </p>
            <p className="text-xs uppercase tracking-[0.32em] text-muted-foreground">
              Member Suite
            </p>
          </div>
        </Link>
      </div>

      <nav className="flex-1 space-y-7 px-6 py-6">
        {navigation.map((group) => (
          <div key={group.title} className="space-y-3">
            <p className="px-2 text-[10px] uppercase tracking-[0.32em] text-muted-foreground">
              {group.title}
            </p>
            <div className="space-y-1.5">
              {group.items.map((item, index) => {
                const isActive = pathname === item.href
                const Icon = item.icon

                return (
                  <motion.div
                    key={item.href}
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.03, duration: 0.3, ease: [0.32, 0.08, 0.24, 1] }}
                  >
                    <Link
                      href={item.href}
                      onClick={onNavigate}
                      className={cn(
                        "group flex items-center gap-3 rounded-xl border px-3 py-2.5 text-sm font-medium transition-all backdrop-blur-sm",
                        "md:px-4",
                        isActive
                          ? "border-accent-soft bg-accent-soft/90 text-accent shadow-[0_12px_32px_rgba(203,163,92,0.25)]"
                          : "border-white/10 bg-white/5 text-muted-foreground hover:border-white/20 hover:bg-white/12 hover:text-foreground"
                      )}
                    >
                      <Icon
                        className={cn(
                          "h-4 w-4",
                          isActive ? "text-accent" : "text-muted-foreground group-hover:text-foreground"
                        )}
                      />
                      <span className="hidden truncate text-sm md:inline">
                        {item.title}
                      </span>
                      <span className="text-sm md:hidden">{item.title}</span>
                    </Link>
                  </motion.div>
                )
              })}
            </div>
          </div>
        ))}
      </nav>

      <div className="mt-auto border-t border-white/10 px-6 py-6">
        <Link
          href="/admin/help"
          onClick={onNavigate}
          className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-muted-foreground shadow-[0_12px_32px_rgba(0,0,0,0.35)] transition-all hover:bg-white/12 hover:text-foreground"
        >
          <CircleHelp className="h-4 w-4" />
          <span>Report an issue</span>
        </Link>
      </div>
    </div>
  )
}
