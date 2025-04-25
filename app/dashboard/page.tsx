"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/contexts/auth-context"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { BookOpen, RefreshCw, TrendingUp, Users, BookMarked, User } from "lucide-react"
import { DashboardTitle } from "@/components/dashboard/title"
import { RecentActivityCard } from "@/components/dashboard/recent-activity"
import { BookStatsCard } from "@/components/dashboard/book-stats"

export default function DashboardPage() {
  const { user, profile, isLoading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!isLoading && !user) {
      router.push("/login")
    }
  }, [user, isLoading, router])

  if (isLoading || !user || !profile) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-emerald-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <DashboardTitle
        title={`Welcome back, ${profile.full_name || profile.username || user.email?.split("@")[0] || "User"}!`}
        description="Here's an overview of your BookSwap activity"
      />

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Books</CardTitle>
            <BookOpen className="h-4 w-4 text-emerald-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">0</div>
            <p className="text-xs text-gray-500 mt-1">Books you've listed</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Swaps</CardTitle>
            <RefreshCw className="h-4 w-4 text-emerald-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">0</div>
            <p className="text-xs text-gray-500 mt-1">Ongoing exchanges</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Profile Views</CardTitle>
            <Users className="h-4 w-4 text-emerald-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">0</div>
            <p className="text-xs text-gray-500 mt-1">In the last 30 days</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Wishlist Items</CardTitle>
            <BookMarked className="h-4 w-4 text-emerald-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">0</div>
            <p className="text-xs text-gray-500 mt-1">Books you want</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="md:col-span-4">
          <CardHeader>
            <CardTitle>Book Activity</CardTitle>
            <CardDescription>Your book listing activity over time</CardDescription>
          </CardHeader>
          <CardContent className="h-[300px] flex items-center justify-center">
            <div className="text-center">
              <TrendingUp className="h-12 w-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 mb-4">No activity data to display yet</p>
              <Button onClick={() => router.push("/dashboard/books/new")}>Add Your First Book</Button>
            </div>
          </CardContent>
        </Card>
        <Card className="md:col-span-3">
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>Your latest interactions</CardDescription>
          </CardHeader>
          <CardContent>
            <RecentActivityCard />
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Book Statistics</CardTitle>
            <CardDescription>Breakdown of your book listings</CardDescription>
          </CardHeader>
          <CardContent>
            <BookStatsCard />
          </CardContent>
        </Card>
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Common tasks you might want to perform</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Button
                variant="outline"
                className="flex flex-col h-24 items-center justify-center"
                onClick={() => router.push("/dashboard/books/new")}
              >
                <BookOpen className="h-8 w-8 mb-2" />
                <span>Add Book</span>
              </Button>
              <Button
                variant="outline"
                className="flex flex-col h-24 items-center justify-center"
                onClick={() => router.push("/dashboard/wishlist")}
              >
                <BookMarked className="h-8 w-8 mb-2" />
                <span>Wishlist</span>
              </Button>
              <Button
                variant="outline"
                className="flex flex-col h-24 items-center justify-center"
                onClick={() => router.push("/dashboard/messages")}
              >
                <Users className="h-8 w-8 mb-2" />
                <span>Messages</span>
              </Button>
              <Button
                variant="outline"
                className="flex flex-col h-24 items-center justify-center"
                onClick={() => router.push("/dashboard/profile")}
              >
                <User className="h-8 w-8 mb-2" />
                <span>Profile</span>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
