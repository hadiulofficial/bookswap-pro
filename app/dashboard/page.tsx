"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/contexts/auth-context"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
  BookOpen,
  RefreshCw,
  Users,
  BookMarked,
  ArrowUpRight,
  BarChart3,
  BookCopy,
  Clock,
  ArrowRight,
  MessageSquare,
  Star,
  Plus,
} from "lucide-react"
import { DashboardTitle } from "@/components/dashboard/title"
import { Progress } from "@/components/ui/progress"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useSidebarToggle } from "@/contexts/sidebar-context"

export default function DashboardPage() {
  const { user, profile, isLoading } = useAuth()
  const router = useRouter()
  const { isOpen } = useSidebarToggle()

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

  // Demo data
  const recentBooks = [
    {
      id: 1,
      title: "The Great Gatsby",
      author: "F. Scott Fitzgerald",
      status: "Available",
      cover: "/abstract-book-cover.png",
    },
    {
      id: 2,
      title: "To Kill a Mockingbird",
      author: "Harper Lee",
      status: "Swapped",
      cover: "/mockingbird-silhouette.png",
    },
    { id: 3, title: "1984", author: "George Orwell", status: "Pending", cover: "/thought-police-eye.png" },
  ]

  const recentSwaps = [
    {
      id: 1,
      user: "Sarah Johnson",
      book: "Pride and Prejudice",
      date: "2 days ago",
      avatar: "/serene-gaze.png",
    },
    { id: 2, user: "Michael Chen", book: "The Hobbit", date: "1 week ago", avatar: "/thoughtful-gaze.png" },
  ]

  return (
    <div className="space-y-8">
      <DashboardTitle
        title={`Welcome back, ${profile.full_name || profile.username || user.email?.split("@")[0] || "User"}!`}
        description="Here's an overview of your BookSwap activity"
      />

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="bg-white dark:bg-gray-800 shadow-sm hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Books</CardTitle>
            <div className="rounded-full bg-emerald-50 p-2 text-emerald-600">
              <BookOpen className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">12</div>
            <div className="flex items-center text-xs text-gray-500 mt-1">
              <span className="flex items-center text-emerald-600 mr-1">
                <ArrowUpRight className="h-3 w-3 mr-1" />
                +2
              </span>
              since last month
            </div>
          </CardContent>
        </Card>
        <Card className="bg-white dark:bg-gray-800 shadow-sm hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Swaps</CardTitle>
            <div className="rounded-full bg-blue-50 p-2 text-blue-600">
              <RefreshCw className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">3</div>
            <div className="flex items-center text-xs text-gray-500 mt-1">
              <span className="flex items-center text-blue-600 mr-1">
                <ArrowUpRight className="h-3 w-3 mr-1" />
                +1
              </span>
              since last week
            </div>
          </CardContent>
        </Card>
        <Card className="bg-white dark:bg-gray-800 shadow-sm hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Profile Views</CardTitle>
            <div className="rounded-full bg-purple-50 p-2 text-purple-600">
              <Users className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">48</div>
            <div className="flex items-center text-xs text-gray-500 mt-1">
              <span className="flex items-center text-purple-600 mr-1">
                <ArrowUpRight className="h-3 w-3 mr-1" />
                +12
              </span>
              in the last 30 days
            </div>
          </CardContent>
        </Card>
        <Card className="bg-white dark:bg-gray-800 shadow-sm hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Wishlist Items</CardTitle>
            <div className="rounded-full bg-amber-50 p-2 text-amber-600">
              <BookMarked className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">7</div>
            <div className="flex items-center text-xs text-gray-500 mt-1">
              <span className="flex items-center text-amber-600 mr-1">
                <ArrowUpRight className="h-3 w-3 mr-1" />
                +3
              </span>
              new additions
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-7">
        <Card className="md:col-span-4 bg-white dark:bg-gray-800 shadow-sm">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Book Activity</CardTitle>
                <CardDescription>Your book listing activity over time</CardDescription>
              </div>
              <Tabs defaultValue="month">
                <TabsList className="grid w-[200px] grid-cols-3">
                  <TabsTrigger value="week">Week</TabsTrigger>
                  <TabsTrigger value="month">Month</TabsTrigger>
                  <TabsTrigger value="year">Year</TabsTrigger>
                </TabsList>
              </Tabs>
            </div>
          </CardHeader>
          <CardContent>
            <div className="h-[300px] relative">
              {/* This would be a real chart in production */}
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <BarChart3 className="h-16 w-16 text-gray-200 mb-4" />
                <div className="space-y-2 text-center">
                  <h3 className="text-lg font-medium">Activity Visualization</h3>
                  <p className="text-sm text-gray-500">Your book activity will be displayed here</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="md:col-span-3 bg-white dark:bg-gray-800 shadow-sm">
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>Your latest interactions</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {recentSwaps.map((swap) => (
              <div key={swap.id} className="flex items-start space-x-4">
                <Avatar>
                  <AvatarImage src={swap.avatar || "/placeholder.svg"} alt={swap.user} />
                  <AvatarFallback>{swap.user.charAt(0)}</AvatarFallback>
                </Avatar>
                <div className="space-y-1">
                  <p className="text-sm font-medium leading-none">{swap.user}</p>
                  <p className="text-sm text-gray-500">
                    Requested to swap <span className="font-medium">{swap.book}</span>
                  </p>
                  <p className="text-xs text-gray-500">{swap.date}</p>
                </div>
                <div className="ml-auto flex space-x-2">
                  <Button variant="outline" size="sm">
                    Decline
                  </Button>
                  <Button size="sm">Accept</Button>
                </div>
              </div>
            ))}

            <div className="pt-2">
              <Button variant="ghost" className="w-full justify-center" size="sm">
                View All Activity
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card className="bg-white dark:bg-gray-800 shadow-sm">
          <CardHeader>
            <CardTitle>Book Statistics</CardTitle>
            <CardDescription>Breakdown of your book listings</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center">
                    <div className="mr-2 h-3 w-3 rounded-full bg-emerald-500"></div>
                    <span>Available</span>
                  </div>
                  <span className="font-medium">8 books</span>
                </div>
                <Progress value={67} className="h-2 bg-gray-100" indicatorClassName="bg-emerald-500" />
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center">
                    <div className="mr-2 h-3 w-3 rounded-full bg-blue-500"></div>
                    <span>Swapped</span>
                  </div>
                  <span className="font-medium">3 books</span>
                </div>
                <Progress value={25} className="h-2 bg-gray-100" indicatorClassName="bg-blue-500" />
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center">
                    <div className="mr-2 h-3 w-3 rounded-full bg-amber-500"></div>
                    <span>Pending</span>
                  </div>
                  <span className="font-medium">1 book</span>
                </div>
                <Progress value={8} className="h-2 bg-gray-100" indicatorClassName="bg-amber-500" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="md:col-span-2 bg-white dark:bg-gray-800 shadow-sm">
          <CardHeader>
            <div className="flex justify-between items-center">
              <div>
                <CardTitle>Your Books</CardTitle>
                <CardDescription>Recently added books in your collection</CardDescription>
              </div>
              <Button size="sm" onClick={() => router.push("/dashboard/books/new")}>
                <Plus className="mr-2 h-4 w-4" />
                Add Book
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentBooks.map((book) => (
                <div key={book.id} className="flex items-center space-x-4">
                  <div className="h-20 w-14 overflow-hidden rounded-md shadow-sm">
                    <img
                      src={book.cover || "/placeholder.svg"}
                      alt={book.title}
                      className="h-full w-full object-cover"
                    />
                  </div>
                  <div className="flex-1 space-y-1">
                    <h4 className="font-medium leading-none">{book.title}</h4>
                    <p className="text-sm text-gray-500">{book.author}</p>
                  </div>
                  <Badge
                    variant={
                      book.status === "Available" ? "outline" : book.status === "Swapped" ? "secondary" : "default"
                    }
                    className={
                      book.status === "Available"
                        ? "text-emerald-600 bg-emerald-50"
                        : book.status === "Swapped"
                          ? "text-blue-600 bg-blue-50"
                          : "text-amber-600 bg-amber-50"
                    }
                  >
                    {book.status}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
          <CardFooter className="border-t pt-4">
            <Button variant="ghost" className="w-full justify-center" size="sm">
              View All Books
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </CardFooter>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="bg-gradient-to-br from-emerald-500 to-emerald-700 text-white shadow-md">
          <CardHeader>
            <CardTitle className="flex items-center">
              <BookCopy className="mr-2 h-5 w-5" />
              Quick Add Book
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-emerald-100 mb-4">Add a new book to your collection in just a few clicks</p>
            <Button
              variant="secondary"
              className="w-full bg-white text-emerald-700 hover:bg-emerald-50"
              onClick={() => router.push("/dashboard/books/new")}
            >
              Add Book Now
            </Button>
          </CardContent>
        </Card>

        <Card className="bg-white dark:bg-gray-800 shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Messages</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">5</div>
            <p className="text-xs text-gray-500">Unread messages</p>
          </CardContent>
          <CardFooter className="border-t pt-2">
            <Button
              variant="ghost"
              size="sm"
              className="w-full justify-center"
              onClick={() => router.push("/dashboard/messages")}
            >
              <MessageSquare className="mr-2 h-4 w-4" />
              View Messages
            </Button>
          </CardFooter>
        </Card>

        <Card className="bg-white dark:bg-gray-800 shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Rating</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center">
              <div className="text-2xl font-bold mr-2">4.8</div>
              <div className="flex text-amber-500">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="h-4 w-4 fill-current" />
                ))}
              </div>
            </div>
            <p className="text-xs text-gray-500">Based on 12 reviews</p>
          </CardContent>
          <CardFooter className="border-t pt-2">
            <Button variant="ghost" size="sm" className="w-full justify-center">
              View Reviews
            </Button>
          </CardFooter>
        </Card>

        <Card className="bg-white dark:bg-gray-800 shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Upcoming Swaps</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">2</div>
            <p className="text-xs text-gray-500">Scheduled this week</p>
          </CardContent>
          <CardFooter className="border-t pt-2">
            <Button
              variant="ghost"
              size="sm"
              className="w-full justify-center"
              onClick={() => router.push("/dashboard/swaps")}
            >
              <Clock className="mr-2 h-4 w-4" />
              View Schedule
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  )
}
