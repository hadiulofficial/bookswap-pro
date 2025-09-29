"use client"

import { useEffect, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { useAuth } from "@/contexts/auth-context"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { BookOpen, RefreshCw, BookMarked, ArrowUp, Plus, MessageSquare, DollarSign, BarChart3 } from "lucide-react"
import { DashboardTitle } from "@/components/dashboard/title"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { supabase } from "@/lib/supabase/client"
import { Skeleton } from "@/components/ui/skeleton"
import { Alert, AlertDescription } from "@/components/ui/alert"

export default function DashboardPage() {
  const { user, profile, isLoading } = useAuth()
  const router = useRouter()
  const searchParams = useSearchParams()
  const [isPageLoaded, setIsPageLoaded] = useState(false)
  const [showSuccessMessage, setShowSuccessMessage] = useState(false)
  const [dashboardData, setDashboardData] = useState({
    totalBooks: 0,
    wishlistItems: 0,
    soldBooks: 0,
    donatedBooks: 0,
    activeSwaps: 0,
    booksByCategory: [] as { category: string; count: number; color: string }[],
    recentActivity: [] as any[],
  })
  const [isDataLoading, setIsDataLoading] = useState(true)

  // Check for successful auth
  useEffect(() => {
    const authSuccess = searchParams.get("auth")
    if (authSuccess === "success") {
      setShowSuccessMessage(true)
      // Remove the parameter from URL
      const newUrl = new URL(window.location.href)
      newUrl.searchParams.delete("auth")
      window.history.replaceState({}, "", newUrl.toString())

      // Hide success message after 5 seconds
      setTimeout(() => setShowSuccessMessage(false), 5000)
    }
  }, [searchParams])

  useEffect(() => {
    if (!isLoading && !user) {
      console.log("No user found, redirecting to login")
      router.push("/login")
    }

    // Force page to render after a short delay even if profile is not loaded
    const timer = setTimeout(() => {
      setIsPageLoaded(true)
    }, 1000)

    return () => clearTimeout(timer)
  }, [user, isLoading, router])

  useEffect(() => {
    if (user) {
      fetchDashboardData()
    }
  }, [user])

  const fetchDashboardData = async () => {
    setIsDataLoading(true)
    try {
      // Fetch total books
      const { data: booksData, error: booksError } = await supabase
        .from("books")
        .select("id, listing_type, status")
        .eq("owner_id", user?.id)

      if (booksError) throw booksError

      // Fetch wishlist items
      const { data: wishlistData, error: wishlistError } = await supabase
        .from("wishlists")
        .select("id")
        .eq("user_id", user?.id)

      if (wishlistError) throw wishlistError

      // Calculate sold books
      const soldBooks = booksData?.filter((book) => book.listing_type === "Sell" && book.status === "sold").length || 0

      // Calculate donated books
      const donatedBooks =
        booksData?.filter((book) => book.listing_type === "Donate" && book.status === "donated").length || 0

      // Fetch active swaps
      const { data: swapsData, error: swapsError } = await supabase
        .from("book_swaps")
        .select("id")
        .eq("owner_id", user?.id)
        .eq("status", "pending")

      if (swapsError) throw swapsError

      // Fetch books by category
      const { data: categoriesData, error: categoriesError } = await supabase
        .from("books")
        .select("category_id")
        .eq("owner_id", user?.id)

      if (categoriesError) throw categoriesError

      // Count books by category
      const categoryMap = new Map()
      categoriesData?.forEach((book) => {
        const categoryId = book.category_id
        categoryMap.set(categoryId, (categoryMap.get(categoryId) || 0) + 1)
      })

      // Map category IDs to names and colors
      const categoryColors = [
        { id: 1, name: "Fiction", color: "bg-emerald-500" },
        { id: 2, name: "Non-Fiction", color: "bg-blue-500" },
        { id: 3, name: "Science Fiction", color: "bg-purple-500" },
        { id: 4, name: "Mystery", color: "bg-amber-500" },
        { id: 5, name: "Biography", color: "bg-pink-500" },
        { id: 6, name: "History", color: "bg-indigo-500" },
        { id: 7, name: "Self-Help", color: "bg-red-500" },
        { id: 8, name: "Business", color: "bg-cyan-500" },
        { id: 9, name: "Children's", color: "bg-lime-500" },
        { id: 10, name: "Young Adult", color: "bg-orange-500" },
      ]

      const booksByCategory = Array.from(categoryMap.entries())
        .map(([categoryId, count]) => {
          const category = categoryColors.find((c) => c.id === categoryId) || {
            name: `Category ${categoryId}`,
            color: "bg-gray-500",
          }
          return {
            category: category.name,
            count: count as number,
            color: category.color,
          }
        })
        .sort((a, b) => b.count - a.count)
        .slice(0, 5) // Top 5 categories

      // Set dashboard data
      setDashboardData({
        totalBooks: booksData?.length || 0,
        wishlistItems: wishlistData?.length || 0,
        soldBooks,
        donatedBooks,
        activeSwaps: swapsData?.length || 0,
        booksByCategory,
        recentActivity: [], // We'll use mock data for now
      })
    } catch (error) {
      console.error("Error fetching dashboard data:", error)
    } finally {
      setIsDataLoading(false)
    }
  }

  // Show loading state only if auth is still loading and page hasn't been force-loaded
  if ((isLoading || !user) && !isPageLoaded) {
    return (
      <div className="flex justify-center items-center h-[calc(100vh-64px)]">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-emerald-600 mx-auto"></div>
          <p className="text-gray-500">Loading your dashboard...</p>
        </div>
      </div>
    )
  }

  // Get user display name safely
  const displayName = profile?.full_name || profile?.username || user?.email?.split("@")[0] || "User"

  // Recent activity data (mock data for now)
  const recentActivity = [
    {
      title: "New swap request",
      description: "Jane Smith wants to swap 'The Great Gatsby'",
      time: "2 hours ago",
      icon: <RefreshCw className="h-4 w-4 text-blue-500" />,
    },
    {
      title: "Book listed",
      description: "You listed 'To Kill a Mockingbird'",
      time: "Yesterday",
      icon: <BookOpen className="h-4 w-4 text-emerald-500" />,
    },
    {
      title: "New message",
      description: "Michael Brown sent you a message",
      time: "2 days ago",
      icon: <MessageSquare className="h-4 w-4 text-purple-500" />,
    },
    {
      title: "Swap completed",
      description: "Swap with Alex Johnson completed",
      time: "1 week ago",
      icon: <RefreshCw className="h-4 w-4 text-blue-500" />,
    },
  ]

  return (
    <div className="space-y-8">
      {showSuccessMessage && (
        <Alert className="border-emerald-200 bg-emerald-50 text-emerald-800">
          <AlertDescription>Welcome to BookSwap! You've successfully signed in to your account.</AlertDescription>
        </Alert>
      )}

      <DashboardTitle
        title={`Welcome back, ${displayName}!`}
        description="Here's an overview of your BookSwap activity"
      />

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="bg-white dark:bg-gray-800 border">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="activity">Activity</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card className="border-l-4 border-l-emerald-500 hover:shadow-md transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Books</CardTitle>
                <div className="rounded-full bg-emerald-100 p-2 dark:bg-emerald-800/30">
                  <BookOpen className="h-4 w-4 text-emerald-600" />
                </div>
              </CardHeader>
              <CardContent>
                {isDataLoading ? (
                  <Skeleton className="h-8 w-16" />
                ) : (
                  <>
                    <div className="text-2xl font-bold">{dashboardData.totalBooks}</div>
                    <div className="flex items-center text-xs text-gray-500 mt-1">
                      <ArrowUp className="h-3 w-3 text-emerald-500 mr-1" />
                      <span className="text-emerald-500 font-medium">12%</span>
                      <span className="ml-1">from last month</span>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>

            <Card className="border-l-4 border-l-blue-500 hover:shadow-md transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Active Swaps</CardTitle>
                <div className="rounded-full bg-blue-100 p-2 dark:bg-blue-800/30">
                  <RefreshCw className="h-4 w-4 text-blue-600" />
                </div>
              </CardHeader>
              <CardContent>
                {isDataLoading ? (
                  <Skeleton className="h-8 w-16" />
                ) : (
                  <>
                    <div className="text-2xl font-bold">{dashboardData.activeSwaps}</div>
                    <div className="flex items-center text-xs text-gray-500 mt-1">
                      <ArrowUp className="h-3 w-3 text-emerald-500 mr-1" />
                      <span className="text-emerald-500 font-medium">18%</span>
                      <span className="ml-1">from last month</span>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>

            <Card className="border-l-4 border-l-amber-500 hover:shadow-md transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Wishlist Items</CardTitle>
                <div className="rounded-full bg-amber-100 p-2 dark:bg-amber-800/30">
                  <BookMarked className="h-4 w-4 text-amber-600" />
                </div>
              </CardHeader>
              <CardContent>
                {isDataLoading ? (
                  <Skeleton className="h-8 w-16" />
                ) : (
                  <>
                    <div className="text-2xl font-bold">{dashboardData.wishlistItems}</div>
                    <div className="flex items-center text-xs text-gray-500 mt-1">
                      <ArrowUp className="h-3 w-3 text-emerald-500 mr-1" />
                      <span className="text-emerald-500 font-medium">8%</span>
                      <span className="ml-1">from last month</span>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>

            <Card className="border-l-4 border-l-green-500 hover:shadow-md transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Books Sold</CardTitle>
                <div className="rounded-full bg-green-100 p-2 dark:bg-green-800/30">
                  <DollarSign className="h-4 w-4 text-green-600" />
                </div>
              </CardHeader>
              <CardContent>
                {isDataLoading ? (
                  <Skeleton className="h-8 w-16" />
                ) : (
                  <>
                    <div className="text-2xl font-bold">{dashboardData.soldBooks}</div>
                    <div className="flex items-center text-xs text-gray-500 mt-1">
                      <ArrowUp className="h-3 w-3 text-emerald-500 mr-1" />
                      <span className="text-emerald-500 font-medium">24%</span>
                      <span className="ml-1">from last month</span>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
            <Card className="md:col-span-4 hover:shadow-md transition-shadow">
              <CardHeader>
                <CardTitle>Book Activity</CardTitle>
                <CardDescription>Your book listing activity over time</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px] flex flex-col">
                  <div className="grid grid-cols-12 gap-2 mb-4">
                    {Array.from({ length: 12 }).map((_, i) => (
                      <div key={i} className="flex flex-col items-center">
                        <div
                          className="w-full bg-emerald-100 dark:bg-emerald-800/30 rounded-t-sm"
                          style={{
                            height: `${Math.floor(Math.random() * 100) + 20}px`,
                          }}
                        ></div>
                        <span className="text-xs text-gray-500 mt-1">{i + 1}</span>
                      </div>
                    ))}
                  </div>

                  <div className="mt-auto space-y-4">
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm font-medium">Listing Completion</span>
                        <span className="text-sm font-medium">78%</span>
                      </div>
                      <Progress value={78} className="h-2" />
                    </div>

                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm font-medium">Swap Success Rate</span>
                        <span className="text-sm font-medium">92%</span>
                      </div>
                      <Progress value={92} className="h-2" />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="md:col-span-3 hover:shadow-md transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <div>
                  <CardTitle>Recent Activity</CardTitle>
                  <CardDescription>Your latest interactions</CardDescription>
                </div>
                <Button variant="ghost" size="sm" className="text-xs">
                  View all
                </Button>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentActivity.map((item, i) => (
                    <div key={i} className="flex items-start gap-3">
                      <div className="rounded-full bg-gray-100 p-2 dark:bg-gray-800">{item.icon}</div>
                      <div className="flex-1">
                        <p className="text-sm font-medium">{item.title}</p>
                        <p className="text-xs text-gray-500">{item.description}</p>
                        <p className="text-xs text-gray-400 mt-1">{item.time}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <Card className="hover:shadow-md transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <div>
                  <CardTitle>Book Statistics</CardTitle>
                  <CardDescription>Breakdown of your book listings</CardDescription>
                </div>
                <Button variant="ghost" size="sm" className="text-xs">
                  View all
                </Button>
              </CardHeader>
              <CardContent>
                {isDataLoading ? (
                  <div className="space-y-4">
                    {[1, 2, 3, 4, 5].map((i) => (
                      <div key={i} className="space-y-2">
                        <div className="flex justify-between">
                          <Skeleton className="h-4 w-24" />
                          <Skeleton className="h-4 w-8" />
                        </div>
                        <Skeleton className="h-2 w-full" />
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="space-y-4">
                    {dashboardData.booksByCategory.length > 0 ? (
                      dashboardData.booksByCategory.map((item, i) => (
                        <div key={i} className="space-y-1">
                          <div className="flex items-center justify-between">
                            <span className="text-sm">{item.category}</span>
                            <span className="text-sm font-medium">{item.count}</span>
                          </div>
                          <div className="w-full h-2 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                            <div
                              className={`h-full ${item.color}`}
                              style={{
                                width: `${(item.count / dashboardData.totalBooks) * 100}%`,
                              }}
                            ></div>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="flex flex-col items-center justify-center py-8 text-center">
                        <BarChart3 className="h-8 w-8 text-gray-400 mb-2" />
                        <p className="text-sm text-gray-500">No books listed yet</p>
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>

            <Card className="md:col-span-2 hover:shadow-md transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <div>
                  <CardTitle>Quick Actions</CardTitle>
                  <CardDescription>Common tasks you might want to perform</CardDescription>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <Button
                    variant="outline"
                    className="flex flex-col h-24 items-center justify-center hover:bg-emerald-50 hover:text-emerald-600 hover:border-emerald-200 transition-colors bg-transparent"
                    onClick={() => router.push("/dashboard/books/add")}
                  >
                    <Plus className="h-8 w-8 mb-2 text-emerald-500" />
                    <span>Add Book</span>
                  </Button>
                  <Button
                    variant="outline"
                    className="flex flex-col h-24 items-center justify-center hover:bg-amber-50 hover:text-amber-600 hover:border-amber-200 transition-colors bg-transparent"
                    onClick={() => router.push("/dashboard/wishlist")}
                  >
                    <BookMarked className="h-8 w-8 mb-2 text-amber-500" />
                    <span>Wishlist</span>
                  </Button>
                  <Button
                    variant="outline"
                    className="flex flex-col h-24 items-center justify-center hover:bg-blue-50 hover:text-blue-600 hover:border-blue-200 transition-colors bg-transparent"
                    onClick={() => router.push("/dashboard/swaps")}
                  >
                    <RefreshCw className="h-8 w-8 mb-2 text-blue-500" />
                    <span>Swaps</span>
                  </Button>
                  <Button
                    variant="outline"
                    className="flex flex-col h-24 items-center justify-center hover:bg-purple-50 hover:text-purple-600 hover:border-purple-200 transition-colors bg-transparent"
                    onClick={() => router.push("/dashboard/books")}
                  >
                    <BookOpen className="h-8 w-8 mb-2 text-purple-500" />
                    <span>My Books</span>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="analytics">
          <Card>
            <CardHeader>
              <CardTitle>Analytics</CardTitle>
              <CardDescription>Detailed statistics about your BookSwap activity</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-center h-64">
                <p className="text-gray-500">Analytics data will be available soon</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="activity">
          <Card>
            <CardHeader>
              <CardTitle>Activity Log</CardTitle>
              <CardDescription>Your recent activity on BookSwap</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-center h-64">
                <p className="text-gray-500">Activity log will be available soon</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
