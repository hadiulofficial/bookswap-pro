"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { DashboardTitle } from "@/components/dashboard/title"
import { BookOpen, Plus, Search, Filter, SlidersHorizontal } from "lucide-react"

export default function BooksPage() {
  const router = useRouter()
  const [searchQuery, setSearchQuery] = useState("")

  // This would normally fetch from your database
  const books = []

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <DashboardTitle title="My Books" description="Manage your book listings, sales, and exchanges" />
        <Button onClick={() => router.push("/dashboard/books/new")}>
          <Plus className="mr-2 h-4 w-4" />
          Add New Book
        </Button>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <CardTitle>Book Collection</CardTitle>
              <CardDescription>All your listed books in one place</CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <div className="relative w-full md:w-64">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
                <Input
                  type="search"
                  placeholder="Search books..."
                  className="pl-8"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <Button variant="outline" size="icon">
                <Filter className="h-4 w-4" />
                <span className="sr-only">Filter</span>
              </Button>
              <Button variant="outline" size="icon">
                <SlidersHorizontal className="h-4 w-4" />
                <span className="sr-only">Sort</span>
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="all" className="space-y-6">
            <TabsList>
              <TabsTrigger value="all">All Books</TabsTrigger>
              <TabsTrigger value="selling">For Sale</TabsTrigger>
              <TabsTrigger value="swapping">For Swap</TabsTrigger>
              <TabsTrigger value="donating">For Donation</TabsTrigger>
            </TabsList>

            <TabsContent value="all" className="space-y-4">
              {books.length > 0 ? (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">{/* Book cards would go here */}</div>
              ) : (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <div className="rounded-full bg-gray-100 p-4 dark:bg-gray-800 mb-4">
                    <BookOpen className="h-8 w-8 text-gray-400" />
                  </div>
                  <h3 className="text-lg font-medium mb-2">No books found</h3>
                  <p className="text-gray-500 dark:text-gray-400 max-w-md mb-6">
                    You haven't added any books to your collection yet. Start by adding your first book.
                  </p>
                  <Button onClick={() => router.push("/dashboard/books/new")}>
                    <Plus className="mr-2 h-4 w-4" />
                    Add Your First Book
                  </Button>
                </div>
              )}
            </TabsContent>

            <TabsContent value="selling" className="space-y-4">
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <div className="rounded-full bg-gray-100 p-4 dark:bg-gray-800 mb-4">
                  <BookOpen className="h-8 w-8 text-gray-400" />
                </div>
                <h3 className="text-lg font-medium mb-2">No books for sale</h3>
                <p className="text-gray-500 dark:text-gray-400 max-w-md mb-6">
                  You don't have any books listed for sale. Add a book and set its listing type to "For Sale".
                </p>
                <Button onClick={() => router.push("/dashboard/books/new")}>
                  <Plus className="mr-2 h-4 w-4" />
                  Add Book For Sale
                </Button>
              </div>
            </TabsContent>

            <TabsContent value="swapping" className="space-y-4">
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <div className="rounded-full bg-gray-100 p-4 dark:bg-gray-800 mb-4">
                  <BookOpen className="h-8 w-8 text-gray-400" />
                </div>
                <h3 className="text-lg font-medium mb-2">No books for swap</h3>
                <p className="text-gray-500 dark:text-gray-400 max-w-md mb-6">
                  You don't have any books listed for swap. Add a book and set its listing type to "For Swap".
                </p>
                <Button onClick={() => router.push("/dashboard/books/new")}>
                  <Plus className="mr-2 h-4 w-4" />
                  Add Book For Swap
                </Button>
              </div>
            </TabsContent>

            <TabsContent value="donating" className="space-y-4">
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <div className="rounded-full bg-gray-100 p-4 dark:bg-gray-800 mb-4">
                  <BookOpen className="h-8 w-8 text-gray-400" />
                </div>
                <h3 className="text-lg font-medium mb-2">No books for donation</h3>
                <p className="text-gray-500 dark:text-gray-400 max-w-md mb-6">
                  You don't have any books listed for donation. Add a book and set its listing type to "For Donation".
                </p>
                <Button onClick={() => router.push("/dashboard/books/new")}>
                  <Plus className="mr-2 h-4 w-4" />
                  Add Book For Donation
                </Button>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}
