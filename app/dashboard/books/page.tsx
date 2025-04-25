"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { useAuth } from "@/contexts/auth-context"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { DashboardTitle } from "@/components/dashboard/title"
import { Loader2, Plus } from "lucide-react"
import { supabase } from "@/lib/supabase/client"

export default function BooksPage() {
  const { user, isLoading } = useAuth()
  const router = useRouter()
  const [books, setBooks] = useState<any[]>([])
  const [loadingBooks, setLoadingBooks] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    // If not loading and no user, redirect to login
    if (!isLoading && !user) {
      router.push("/login")
      return
    }

    // Only fetch books if we have a user
    if (user) {
      fetchBooks()
    }
  }, [user, isLoading, router])

  const fetchBooks = async () => {
    try {
      setLoadingBooks(true)
      setError(null)

      const { data, error } = await supabase
        .from("books")
        .select("*")
        .eq("owner_id", user?.id)
        .order("created_at", { ascending: false })

      if (error) {
        throw error
      }

      setBooks(data || [])
    } catch (err: any) {
      console.error("Error fetching books:", err)
      setError(err.message || "Failed to load books")
    } finally {
      setLoadingBooks(false)
    }
  }

  // Show loading state
  if (isLoading || loadingBooks) {
    return (
      <div className="flex flex-col items-center justify-center h-[50vh]">
        <Loader2 className="h-8 w-8 animate-spin text-emerald-600 mb-4" />
        <p className="text-gray-500">Loading your books...</p>
      </div>
    )
  }

  // This should not happen since we redirect in useEffect, but just in case
  if (!user) {
    return (
      <div className="container mx-auto py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">You must be logged in to view your books</h1>
          <Link href="/login">
            <Button>Log In</Button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <DashboardTitle title="My Books" description="Manage your book listings" />
        <Button onClick={() => router.push("/dashboard/books/add-fixed")}>
          <Plus className="mr-2 h-4 w-4" /> Add Book
        </Button>
      </div>

      {error && (
        <div className="bg-red-50 text-red-500 p-4 rounded-md mb-4">
          <p>{error}</p>
        </div>
      )}

      {books.length === 0 ? (
        <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-lg shadow-sm">
          <h2 className="text-xl font-medium mb-2">You haven't added any books yet</h2>
          <p className="text-gray-500 mb-4">Add your first book to start exchanging with others</p>
          <Button onClick={() => router.push("/dashboard/books/add-fixed")}>Add Your First Book</Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {books.map((book) => (
            <Card key={book.id}>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <CardTitle className="text-xl">{book.title}</CardTitle>
                  <Badge
                    variant={
                      book.listing_type === "Exchange"
                        ? "default"
                        : book.listing_type === "Sell"
                          ? "secondary"
                          : "outline"
                    }
                  >
                    {book.listing_type}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <p className="font-medium">By {book.author}</p>
                {book.description && <p className="text-gray-500 mt-2 line-clamp-3">{book.description}</p>}
                <div className="mt-4 flex items-center gap-2">
                  <Badge variant="outline">{book.condition}</Badge>
                  <Badge
                    variant={
                      book.status === "Available" ? "success" : book.status === "Reserved" ? "warning" : "secondary"
                    }
                  >
                    {book.status}
                  </Badge>
                </div>
              </CardContent>
              <CardFooter className="flex justify-between">
                <Button variant="outline" size="sm">
                  View Details
                </Button>
                <Button variant="ghost" size="sm">
                  Edit
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
