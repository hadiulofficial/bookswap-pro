"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/contexts/auth-context"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { BookOpen, RefreshCw, Users, BookMarked, User, ArrowUp, ArrowDown, Plus, MessageSquare } from "lucide-react"
import { DashboardTitle } from "@/components/dashboard/title"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export default function DashboardPage() {
  const { user, profile, isLoading } = useAuth()
  const router = useRouter()
  const [isPageLoaded, setIsPageLoaded] = useState(false)

  useEffect(() => {
    if (!isLoading && !user) {
      router.push("/login")
    }

    // Force page to render after a short delay even if profile is not loaded
    const timer = setTimeout(() => {
      setIsPageLoaded(true)
    }, 1000)

    return () => clearTimeout(timer)
  }, [user, isLoading, router])

  // Show loading state only if auth is still loading and page hasn't been force-loaded
  if ((isLoading || !user) && !isPageLoaded) {
    return (
      <div className="flex justify-center items-center h-[calc(100vh-64px)]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-emerald-600"></div>
      </div>
    )
  }

  // Get user display name safely
  const displayName = profile?.full_name || profile?.username || user?.email?.split("@")[0] || "User"

  return (
    <div className="space-y-8">
      <DashboardTitle
        title={`Welcome back, ${displayName}!`}
        description="Here's an overview of your BookSwap activity"
      />

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="activity">Activity</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card className="border-l-4 border-l-emerald-500">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Books</CardTitle>
                <div className="rounded-full bg-emerald-100 p-2 dark:bg-emerald-800/30">
                  <BookOpen className="h-4 w-4 text-emerald-600" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">24</div>
                <div className="flex items-center text-xs text-gray-500 mt-1">
                  <ArrowUp className="h-3 w-3 text-emerald-500 mr-1" />
                  <span className="text-emerald-500 font-medium">12%</span>
                  <span className="ml-1">from last month</span>
                </div>
              </CardContent>
            </Card>

            <Card className="border-l-4 border-l-blue-500">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Active Swaps</CardTitle>
                <div className="rounded-full bg-blue-100 p-2 dark:bg-blue-800/30">
                  <RefreshCw className="h-4 w-4 text-blue-600" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">7</div>
                <div className="flex items-center text-xs text-gray-500 mt-1">
                  <ArrowUp className="h-3 w-3 text-emerald-500 mr-1" />
                  <span className="text-emerald-500 font-medium">18%</span>
                  <span className="ml-1">from last month</span>
                </div>
              </CardContent>
            </Card>

            <Card className="border-l-4 border-l-purple-500">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Profile Views</CardTitle>
                <div className="rounded-full bg-purple-100 p-2 dark:bg-purple-800/30">
                  <Users className="h-4 w-4 text-purple-600" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">142</div>
                <div className="flex items-center text-xs text-gray-500 mt-1">
                  <ArrowDown className="h-3 w-3 text-red-500 mr-1" />
                  <span className="text-red-500 font-medium">4%</span>
                  <span className="ml-1">from last month</span>
                </div>
              </CardContent>
            </Card>

            <Card className="border-l-4 border-l-amber-500">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Wishlist Items</CardTitle>
                <div className="rounded-full bg-amber-100 p-2 dark:bg-amber-800/30">
                  <BookMarked className="h-4 w-4 text-amber-600" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">16</div>
                <div className="flex items-center text-xs text-gray-500 mt-1">
                  <ArrowUp className="h-3 w-3 text-emerald-500 mr-1" />
                  <span className="text-emerald-500 font-medium">8%</span>
                  <span className="ml-1">from last month</span>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
            <Card className="md:col-span-4">
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

            <Card className="md:col-span-3">
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
                  {[
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
                  ].map((item, i) => (
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
            <Card>
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
                <div className="space-y-4">
                  {[
                    { category: "Fiction", count: 12, color: "bg-emerald-500" },
                    { category: "Non-Fiction", count: 5, color: "bg-blue-500" },
                    { category: "Science Fiction", count: 3, color: "bg-purple-500" },
                    { category: "Biography", count: 2, color: "bg-amber-500" },
                    { category: "Other", count: 2, color: "bg-gray-500" },
                  ].map((item, i) => (
                    <div key={i} className="space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="text-sm">{item.category}</span>
                        <span className="text-sm font-medium">{item.count}</span>
                      </div>
                      <div className="w-full h-2 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                        <div className={`h-full ${item.color}`} style={{ width: `${(item.count / 24) * 100}%` }}></div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card className="md:col-span-2">
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
                    className="flex flex-col h-24 items-center justify-center"
                    onClick={() => router.push("/dashboard/books/new")}
                  >
                    <Plus className="h-8 w-8 mb-2 text-emerald-500" />
                    <span>Add Book</span>
                  </Button>
                  <Button
                    variant="outline"
                    className="flex flex-col h-24 items-center justify-center"
                    onClick={() => router.push("/dashboard/wishlist")}
                  >
                    <BookMarked className="h-8 w-8 mb-2 text-amber-500" />
                    <span>Wishlist</span>
                  </Button>
                  <Button
                    variant="outline"
                    className="flex flex-col h-24 items-center justify-center"
                    onClick={() => router.push("/dashboard/messages")}
                  >
                    <MessageSquare className="h-8 w-8 mb-2 text-purple-500" />
                    <span>Messages</span>
                  </Button>
                  <Button
                    variant="outline"
                    className="flex flex-col h-24 items-center justify-center"
                    onClick={() => router.push("/dashboard/profile")}
                  >
                    <User className="h-8 w-8 mb-2 text-blue-500" />
                    <span>Profile</span>
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
