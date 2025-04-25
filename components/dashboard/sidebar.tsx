"use client"

import type React from "react"

import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { LayoutDashboard, BookOpen, RefreshCw, MessageSquare, Heart, Settings, User, Menu, LogOut } from "lucide-react"
import { useAuth } from "@/contexts/auth-context"
import { useRouter } from "next/navigation"

interface SidebarNavProps extends React.HTMLAttributes<HTMLDivElement> {
  items: {
    href: string
    title: string
    icon: React.ReactNode
  }[]
}

export function DashboardSidebar() {
  const [open, setOpen] = useState(false)
  const pathname = usePathname()
  const { signOut } = useAuth()
  const router = useRouter()

  // Close the mobile sidebar when the route changes
  useEffect(() => {
    setOpen(false)
  }, [pathname])

  const handleSignOut = async () => {
    await signOut()
    router.push("/")
  }

  const sidebarItems = [
    {
      href: "/dashboard",
      title: "Overview",
      icon: <LayoutDashboard className="h-5 w-5" />,
    },
    {
      href: "/dashboard/books",
      title: "My Books",
      icon: <BookOpen className="h-5 w-5" />,
    },
    {
      href: "/dashboard/swaps",
      title: "Book Swaps",
      icon: <RefreshCw className="h-5 w-5" />,
    },
    {
      href: "/dashboard/messages",
      title: "Messages",
      icon: <MessageSquare className="h-5 w-5" />,
    },
    {
      href: "/dashboard/wishlist",
      title: "Wishlist",
      icon: <Heart className="h-5 w-5" />,
    },
    {
      href: "/dashboard/profile",
      title: "Profile",
      icon: <User className="h-5 w-5" />,
    },
    {
      href: "/dashboard/settings",
      title: "Settings",
      icon: <Settings className="h-5 w-5" />,
    },
  ]

  return (
    <>
      {/* Mobile Sidebar */}
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetTrigger asChild className="lg:hidden absolute left-4 top-3.5 z-50">
          <Button variant="outline" size="icon" className="rounded-full">
            <Menu className="h-5 w-5" />
            <span className="sr-only">Toggle Menu</span>
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="w-[240px] sm:w-[280px] pr-0">
          <MobileSidebar items={sidebarItems} onSignOut={handleSignOut} />
        </SheetContent>
      </Sheet>

      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex w-[240px] flex-col border-r bg-white dark:bg-gray-800/40 dark:border-gray-800">
        <ScrollArea className="flex-1">
          <div className="flex flex-col gap-2 p-4">
            <div className="flex h-12 items-center border-b pb-4 mb-2">
              <Link href="/" className="flex items-center gap-2 font-semibold">
                <BookOpen className="h-6 w-6 text-emerald-600" />
                <span>BookSwap</span>
              </Link>
            </div>
            <nav className="grid gap-1">
              {sidebarItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium hover:bg-gray-100 dark:hover:bg-gray-800",
                    pathname === item.href
                      ? "bg-gray-100 text-emerald-600 dark:bg-gray-800 dark:text-emerald-500"
                      : "text-gray-700 dark:text-gray-300",
                  )}
                >
                  {item.icon}
                  {item.title}
                </Link>
              ))}
            </nav>
          </div>
        </ScrollArea>
        <div className="p-4 border-t">
          <Button
            variant="outline"
            className="w-full justify-start text-gray-700 dark:text-gray-300"
            onClick={handleSignOut}
          >
            <LogOut className="mr-2 h-4 w-4" />
            Sign out
          </Button>
        </div>
      </aside>
    </>
  )
}

function MobileSidebar({ items, onSignOut }: SidebarNavProps & { onSignOut: () => Promise<void> }) {
  const pathname = usePathname()

  return (
    <div className="flex flex-col h-full">
      <div className="flex h-14 items-center border-b px-4">
        <Link href="/" className="flex items-center gap-2 font-semibold">
          <BookOpen className="h-6 w-6 text-emerald-600" />
          <span>BookSwap</span>
        </Link>
      </div>
      <ScrollArea className="flex-1">
        <div className="flex flex-col gap-2 p-4">
          <nav className="grid gap-1">
            {items.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium hover:bg-gray-100 dark:hover:bg-gray-800",
                  pathname === item.href
                    ? "bg-gray-100 text-emerald-600 dark:bg-gray-800 dark:text-emerald-500"
                    : "text-gray-700 dark:text-gray-300",
                )}
              >
                {item.icon}
                {item.title}
              </Link>
            ))}
          </nav>
        </div>
      </ScrollArea>
      <div className="p-4 border-t">
        <Button variant="outline" className="w-full justify-start text-gray-700 dark:text-gray-300" onClick={onSignOut}>
          <LogOut className="mr-2 h-4 w-4" />
          Sign out
        </Button>
      </div>
    </div>
  )
}
