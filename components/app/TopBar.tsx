"use client"

import { useEffect, useMemo, useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { motion } from "framer-motion"
import { Menu, Search, Bell, HelpCircle, User, LogOut, Settings } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command"
import { cn } from "@/lib/utils"

interface TopBarProps {
  user?: {
    full_name?: string | null
    email: string
    avatar_url?: string | null
  }
  onToggleSidebar?: () => void
}

export function TopBar({ user, onToggleSidebar }: TopBarProps) {
  const [commandOpen, setCommandOpen] = useState(false)
  const pathname = usePathname()

  // Generate breadcrumb from pathname
  const breadcrumb = useMemo(() => {
    const segments = pathname.split("/").filter(Boolean)
    if (segments.length === 0) {
      return [{ label: "Dashboard", href: "/admin" }]
    }

    const items = [{ label: "Home", href: "/admin" }]
    let currentPath = ""

    segments.forEach((segment) => {
      currentPath += `/${segment}`
      const label = segment
        .split("-")
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(" ")

      items.push({
        label,
        href: currentPath,
      })
    })

    return items
  }, [pathname])

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault()
        setCommandOpen((previous) => !previous)
      }
    }

    window.addEventListener("keydown", onKeyDown)
    return () => window.removeEventListener("keydown", onKeyDown)
  }, [])

  return (
    <>
      <motion.header
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: [0.32, 0.08, 0.24, 1] }}
        className="sticky top-0 z-40 border-b border-white/10 bg-black/30 px-4 backdrop-blur-xl"
      >
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 sm:px-2">
          <div className="flex flex-1 items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={onToggleSidebar}
              className="h-9 w-9 rounded-full border border-white/10 bg-white/5 text-muted-foreground hover:text-foreground md:hidden"
            >
              <Menu className="h-4 w-4" />
              <span className="sr-only">Toggle navigation</span>
            </Button>

            <div className="hidden md:flex md:items-center md:gap-3">
              <Link
                href="/admin"
                className="flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-sm font-semibold text-foreground shadow-[0_12px_30px_rgba(0,0,0,0.45)]"
              >
                <span className="font-serif text-base tracking-[-0.04em]">HELO</span>
                <span className="text-xs uppercase text-muted-foreground">One</span>
              </Link>
              <span className="text-muted-foreground">›</span>
            </div>

            <nav className="flex items-center gap-2 text-sm text-muted-foreground">
              {breadcrumb.map((item, index) => (
                <div key={`${item.href}-${index}`} className="flex items-center gap-2">
                  {index > 0 && <span className="opacity-60">›</span>}
                  <Link
                    href={item.href}
                    className={cn(
                      "transition-colors",
                      index === breadcrumb.length - 1
                        ? "text-foreground font-medium"
                        : "hover:text-foreground"
                    )}
                  >
                    {item.label}
                  </Link>
                </div>
              ))}
            </nav>
          </div>

          <div className="flex flex-1 items-center justify-end gap-2 sm:gap-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setCommandOpen(true)}
              className="group hidden items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 text-sm text-muted-foreground hover:text-foreground sm:inline-flex"
            >
              <Search className="h-4 w-4" />
              <span>Search</span>
              <kbd className="ml-1 hidden rounded-full border border-white/10 bg-black/40 px-1.5 py-0.5 font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground sm:flex">
                <span>⌘</span>K
              </kbd>
            </Button>

            <Button
              variant="ghost"
              size="icon"
              onClick={() => setCommandOpen(true)}
              className="h-9 w-9 rounded-full border border-white/10 bg-white/5 text-muted-foreground hover:text-foreground sm:hidden"
            >
              <Search className="h-4 w-4" />
              <span className="sr-only">Search</span>
            </Button>

            <Button
              variant="ghost"
              size="icon"
              className="h-9 w-9 rounded-full border border-white/10 bg-white/5 text-muted-foreground hover:text-foreground"
            >
              <Bell className="h-4 w-4" />
              <span className="sr-only">Notifications</span>
            </Button>

            <Button
              variant="ghost"
              size="icon"
              className="hidden h-9 w-9 rounded-full border border-white/10 bg-white/5 text-muted-foreground hover:text-foreground sm:inline-flex"
            >
              <HelpCircle className="h-4 w-4" />
              <span className="sr-only">Help</span>
            </Button>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-10 w-10 rounded-full border border-white/10 bg-white/5 p-0">
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={user?.avatar_url || undefined} alt={user?.full_name || undefined} />
                    <AvatarFallback className="bg-accent-soft text-sm font-semibold text-accent">
                      {user?.full_name
                        ?.split(" ")
                        .map((n) => n[0])
                        .join("")
                        .toUpperCase() || "U"}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-60 border border-white/10 bg-black/80 text-foreground shadow-[0_24px_60px_rgba(0,0,0,0.6)] backdrop-blur-xl" align="end" forceMount>
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">
                      {user?.full_name || "User"}
                    </p>
                    <p className="text-xs leading-none text-muted-foreground">
                      {user?.email || "user@example.com"}
                    </p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator className="bg-white/10" />
                <DropdownMenuItem>
                  <User className="mr-2 h-4 w-4" />
                  <span>Profile</span>
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Settings className="mr-2 h-4 w-4" />
                  <span>Settings</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator className="bg-white/10" />
                <DropdownMenuItem>
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Log out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </motion.header>

      <CommandDialog open={commandOpen} onOpenChange={setCommandOpen}>
        <CommandInput placeholder="Search for requests, members, or quick actions…" />
        <CommandList>
          <CommandEmpty>No results found.</CommandEmpty>
          <CommandGroup heading="Quick Actions">
            <CommandItem>
              <span>New Request</span>
            </CommandItem>
            <CommandItem>
              <span>View Members</span>
            </CommandItem>
            <CommandItem>
              <span>View Bookings</span>
            </CommandItem>
          </CommandGroup>
          <CommandGroup heading="Navigation">
            <CommandItem>
              <span>Dashboard</span>
            </CommandItem>
            <CommandItem>
              <span>Requests</span>
            </CommandItem>
            <CommandItem>
              <span>Members</span>
            </CommandItem>
          </CommandGroup>
        </CommandList>
      </CommandDialog>
    </>
  )
}
