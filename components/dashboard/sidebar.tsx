"use client"

import React from "react"

import { useEffect } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import {
  LayoutDashboard,
  BookOpen,
  RefreshCw,
  MessageSquare,
  Heart,
  Settings,
  User,
  Menu,
  LogOut,
  ChevronLeft,
  ChevronRight,
} from "lucide-react"
import { useAuth } from "@/contexts/auth-context"
import { useRouter } from "next/navigation"
import { useSidebarToggle } from "@/contexts/sidebar-context"

interface SidebarNavProps extends React.HTMLAttributes<HTMLDivElement> {
  items: {
    href: string
    title: string
    icon: React.ReactNode
  }[]
}

export function DashboardSidebar() {
  const [open, setOpen] = React.useState(false)
  const pathname = usePathname()
  const { signOut } = useAuth()
  const router = useRouter()
  const { isOpen, toggleSidebar, closeSidebar } = useSidebarToggle()

  // Close the mobile sidebar when the route changes
  useEffect(() => {
    setOpen(false)
    closeSidebar()
  }, [pathname, closeSidebar])

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
        <SheetContent side="left" className="w-[280px] p-0">
          <MobileSidebar items={sidebarItems} onSignOut={handleSignOut} />
        </SheetContent>
      </Sheet>

      {/* Desktop Sidebar */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-20 flex h-full flex-col border-r bg-white dark:bg-gray-800/40 dark:border-gray-800 transition-all duration-300 ease-in-out lg:relative",
          isOpen ? "w-[240px]" : "w-[70px]",
        )}
        style={{ marginTop: "64px" }}
      >
        <div className="absolute -right-3 top-6 hidden lg:block">
          <Button
            variant="outline"
            size="icon"
            onClick={toggleSidebar}
            className="h-6 w-6 rounded-full bg-white border shadow-sm"
          >
            {isOpen ? <ChevronLeft className="h-3 w-3" /> : <ChevronRight className="h-3 w-3" />}
          </Button>
        </div>
        <ScrollArea className="flex-1">
          <div className="flex flex-col gap-2 p-4">
            <nav className="grid gap-1 px-2">
              {sidebarItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors hover:bg-gray-100 dark:hover:bg-gray-800",
                    pathname === item.href
                      ? "bg-emerald-50 text-emerald-600 dark:bg-emerald-900/20 dark:text-emerald-500"
                      : "text-gray-700 dark:text-gray-300",
                    !isOpen && "justify-center px-0",
                  )}
                >
                  {item.icon}
                  {isOpen && <span>{item.title}</span>}
                </Link>
              ))}
            </nav>
          </div>
        </ScrollArea>
        <div className="p-4 border-t">
          <Button
            variant="outline"
            className={cn("w-full text-gray-700 dark:text-gray-300", !isOpen && "justify-center px-0")}
            onClick={handleSignOut}
          >
            <LogOut className="h-4 w-4" />
            {isOpen && <span className="ml-2">Sign out</span>}
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
      <ScrollArea className="flex-1">
        <div className="flex flex-col gap-2 p-4 pt-8">
          <nav className="grid gap-1">
            {items.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium hover:bg-gray-100 dark:hover:bg-gray-800",
                  pathname === item.href
                    ? "bg-emerald-50 text-emerald-600 dark:bg-emerald-900/20 dark:text-emerald-500"
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
