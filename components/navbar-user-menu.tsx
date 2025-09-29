"use client"

import { useRouter } from "next/navigation"
import { useAuth } from "@/contexts/auth-context"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { User, LogOut, Settings, BookOpen, LayoutDashboard } from "lucide-react"
import { useState } from "react"

export function NavbarUserMenu() {
  const { user, profile, signOut, isLoading } = useAuth()
  const router = useRouter()
  const [isSigningOut, setIsSigningOut] = useState(false)

  const handleSignOut = async () => {
    if (isSigningOut) return // Prevent multiple clicks

    try {
      setIsSigningOut(true)
      console.log("User menu: Starting sign out...")
      await signOut()
    } catch (error) {
      console.error("Error in handleSignOut:", error)
      // Force redirect even if there's an error
      window.location.href = "/login"
    } finally {
      setIsSigningOut(false)
    }
  }

  // Don't render if loading or no user
  if (isLoading || !user) {
    return null
  }

  const displayName = profile?.full_name || profile?.username || "User"
  const initials =
    profile?.full_name
      ?.split(" ")
      .map((n) => n[0])
      .join("") ||
    user.email?.charAt(0).toUpperCase() ||
    "U"

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative h-10 w-10 rounded-full" disabled={isSigningOut}>
          <Avatar className="h-10 w-10">
            <AvatarImage src={profile?.avatar_url || ""} alt={displayName} />
            <AvatarFallback className="text-sm bg-emerald-100 text-emerald-800">{initials}</AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" align="end" forceMount>
        <DropdownMenuLabel>
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none">{displayName}</p>
            <p className="text-xs leading-none text-gray-500">{user.email}</p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => router.push("/dashboard")} disabled={isSigningOut}>
          <LayoutDashboard className="mr-2 h-4 w-4" />
          Dashboard
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => router.push("/dashboard/profile")} disabled={isSigningOut}>
          <User className="mr-2 h-4 w-4" />
          Profile
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => router.push("/dashboard/books")} disabled={isSigningOut}>
          <BookOpen className="mr-2 h-4 w-4" />
          My Books
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => router.push("/dashboard/settings")} disabled={isSigningOut}>
          <Settings className="mr-2 h-4 w-4" />
          Settings
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleSignOut} disabled={isSigningOut} className="text-red-600 focus:text-red-600">
          <LogOut className="mr-2 h-4 w-4" />
          {isSigningOut ? "Signing out..." : "Sign out"}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
