"use client"

import { useRouter } from "next/navigation"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useAuth } from "@/contexts/auth-context"
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from "@/components/ui/sidebar"
import { LayoutDashboard, BookOpen, RefreshCw, MessageSquare, Heart, Settings, User, LogOut } from "lucide-react"

export function DashboardSidebar() {
  const pathname = usePathname()
  const { signOut } = useAuth()
  const router = useRouter()

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
    <Sidebar className="border-r border-gray-200 dark:border-gray-800">
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {sidebarItems.map((item) => (
                <SidebarMenuItem key={item.href}>
                  <SidebarMenuButton asChild isActive={pathname === item.href} tooltip={item.title}>
                    <Link href={item.href} className="flex items-center gap-3">
                      {item.icon}
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
              <SidebarMenuItem>
                <SidebarMenuButton
                  onClick={handleSignOut}
                  tooltip="Sign Out"
                  className="text-red-500 hover:text-red-600 dark:text-red-400 dark:hover:text-red-300"
                >
                  <LogOut className="h-5 w-5" />
                  <span>Sign Out</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarRail />
    </Sidebar>
  )
}
