"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useRouter } from "next/navigation"
import { cn } from "@/lib/utils"
import { useAuth } from "@/contexts/auth-context"
import {
  BookOpen,
  LayoutDashboard,
  RefreshCw,
  MessageSquare,
  Heart,
  Settings,
  User,
  LogOut,
  Menu,
  X,
  Gift,
  ShoppingBag,
  DollarSign,
  Star,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent } from "@/components/ui/sheet"

export function DashboardSidebar() {
  const [isCollapsed, setIsCollapsed] = useState(false)
  const [isMobileOpen, setIsMobileOpen] = useState(false)
  const pathname = usePathname()
  const { signOut } = useAuth()
  const router = useRouter()

  // Check if screen is mobile
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const checkIfMobile = () => {
      setIsMobile(window.innerWidth < 1024)
      if (window.innerWidth < 1024) {
        setIsCollapsed(true)
      }
    }

    checkIfMobile()
    window.addEventListener("resize", checkIfMobile)

    return () => {
      window.removeEventListener("resize", checkIfMobile)
    }
  }, [])

  const handleSignOut = async () => {
    await signOut()
    router.push("/")
  }

  const toggleSidebar = () => {
    setIsCollapsed(!isCollapsed)
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
      href: "/dashboard/purchases",
      title: "Purchases",
      icon: <ShoppingBag className="h-5 w-5" />,
    },
    {
      href: "/dashboard/sales",
      title: "Sales",
      icon: <DollarSign className="h-5 w-5" />,
    },
    {
      href: "/dashboard/swaps",
      title: "Book Swaps",
      icon: <RefreshCw className="h-5 w-5" />,
    },
    {
      href: "/dashboard/requests",
      title: "Book Requests",
      icon: <Gift className="h-5 w-5" />,
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
      href: "/dashboard/testimonial",
      title: "Your Review",
      icon: <Star className="h-5 w-5" />,
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

  // Mobile sidebar
  if (isMobile) {
    return (
      <>
        <Button
          variant="outline"
          size="icon"
          className="fixed left-4 top-4 z-40 lg:hidden"
          onClick={() => setIsMobileOpen(true)}
        >
          <Menu className="h-5 w-5" />
        </Button>

        <Sheet open={isMobileOpen} onOpenChange={setIsMobileOpen}>
          <SheetContent side="left" className="p-0 w-[280px]">
            <div className="flex flex-col h-full bg-white dark:bg-gray-800">
              <div className="flex items-center justify-between p-4 border-b">
                <Link href="/" className="flex items-center gap-2 font-semibold">
                  <BookOpen className="h-6 w-6 text-emerald-600" />
                  <span>BookSwap</span>
                </Link>
                <Button variant="ghost" size="icon" onClick={() => setIsMobileOpen(false)}>
                  <X className="h-5 w-5" />
                </Button>
              </div>

              <div className="flex-1 overflow-auto py-2">
                <nav className="grid gap-1 px-2">
                  {sidebarItems.map((item) => (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={cn(
                        "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium hover:bg-gray-100 dark:hover:bg-gray-700",
                        pathname === item.href
                          ? "bg-emerald-50 text-emerald-600 dark:bg-emerald-900/20 dark:text-emerald-500"
                          : "text-gray-700 dark:text-gray-300",
                      )}
                      onClick={() => setIsMobileOpen(false)}
                    >
                      {item.icon}
                      {item.title}
                    </Link>
                  ))}
                </nav>
              </div>

              <div className="p-4 border-t">
                <Button variant="outline" className="w-full justify-start text-red-500" onClick={handleSignOut}>
                  <LogOut className="mr-2 h-4 w-4" />
                  Sign out
                </Button>
              </div>
            </div>
          </SheetContent>
        </Sheet>
      </>
    )
  }

  // Desktop sidebar
  return (
    <aside
      className={cn(
        "h-screen sticky top-0 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 transition-all duration-300",
        isCollapsed ? "w-[70px]" : "w-[240px]",
      )}
    >
      <div className="flex h-16 items-center justify-between px-4 border-b border-gray-200 dark:border-gray-700">
        {!isCollapsed && (
          <Link href="/" className="flex items-center gap-2 font-semibold">
            <BookOpen className="h-6 w-6 text-emerald-600" />
            <span>BookSwap</span>
          </Link>
        )}
        {isCollapsed && <BookOpen className="h-6 w-6 text-emerald-600 mx-auto" />}
        <Button
          variant="ghost"
          size="sm"
          onClick={toggleSidebar}
          className={cn("p-0 h-8 w-8", isCollapsed && "mx-auto")}
        >
          <Menu className="h-5 w-5" />
        </Button>
      </div>

      <div className="py-4">
        <nav className="grid gap-1 px-2">
          {sidebarItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium hover:bg-gray-100 dark:hover:bg-gray-700",
                pathname === item.href
                  ? "bg-emerald-50 text-emerald-600 dark:bg-emerald-900/20 dark:text-emerald-500"
                  : "text-gray-700 dark:text-gray-300",
                isCollapsed && "justify-center",
              )}
              title={isCollapsed ? item.title : undefined}
            >
              {item.icon}
              {!isCollapsed && <span>{item.title}</span>}
            </Link>
          ))}
        </nav>
      </div>

      <div className={cn("absolute bottom-4 left-0 right-0 px-2")}>
        <Button
          variant="outline"
          className={cn("w-full text-red-500", isCollapsed ? "justify-center" : "justify-start")}
          onClick={handleSignOut}
          title={isCollapsed ? "Sign out" : undefined}
        >
          <LogOut className={cn("h-4 w-4", !isCollapsed && "mr-2")} />
          {!isCollapsed && "Sign out"}
        </Button>
      </div>
    </aside>
  )
}
