"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import { useAuth } from "@/contexts/auth-context"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { DashboardTitle } from "@/components/dashboard/title"
import { Plus, BookOpen } from "lucide-react"
import { supabase } from "@/lib/supabase/client"
import { Skeleton } from "@/components/ui/skeleton"

export default function BooksPage() {
  const { user, isLoading: authLoading } = useAuth()
  const router = useRouter()
  const [books, setBooks] = useState<any[]>([])
  const [loadingBooks, setLoadingBooks] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    // If not loading and no user, redirect to login
    if (!authLoading && !user) {
      router.push("/login")
      return
    }

    // Only fetch books if we have a user
    if (user) {
      fetchBooks()
    }
  }, [user, authLoading, router])

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

  // Only redirect if auth is not loading and there's no user
  if (!authLoading && !user) {
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

  // Render the page layout even while loading
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <DashboardTitle title="My Books" description="Manage your book listings" />
        <Button onClick={() => router.push("/dashboard/books/add")}>
          <Plus className="mr-2 h-4 w-4" /> Add Book
        </Button>
      </div>

      {error && (
        <div className="bg-red-50 text-red-500 p-4 rounded-md mb-4">
          <p>{error}</p>
        </div>
      )}

      {loadingBooks ? (
        // Skeleton loading state that maintains the layout
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Card key={i} className="overflow-hidden">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <Skeleton className="h-6 w-3/4" />
                  <Skeleton className="h-5 w-20" />
                </div>
              </CardHeader>
              <CardContent>
                <Skeleton className="h-4 w-1/2 mb-4" />
                <Skeleton className="h-4 w-full mb-2" />
                <Skeleton className="h-4 w-full mb-2" />
                <Skeleton className="h-4 w-3/4" />
                <div className="mt-4 flex items-center gap-2">
                  <Skeleton className="h-5 w-20" />
                  <Skeleton className="h-5 w-20" />
                </div>
              </CardContent>
              <CardFooter className="flex justify-between">
                <Skeleton className="h-9 w-24" />
                <Skeleton className="h-9 w-16" />
              </CardFooter>
            </Card>
          ))}
        </div>
      ) : books.length === 0 ? (
        <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-lg shadow-sm">
          <h2 className="text-xl font-medium mb-2">You haven't added any books yet</h2>
          <p className="text-gray-500 mb-4">Add your first book to start exchanging with others</p>
          <Button onClick={() => router.push("/dashboard/books/add")}>Add Your First Book</Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {books.map((book) => (
            <Card key={book.id} className="flex flex-col">
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
              <CardContent className="flex-grow">
                <div className="flex flex-col md:flex-row gap-4">
                  <div className="flex-shrink-0">
                    {book.cover_image ? (
                      <div className="relative w-24 h-36 overflow-hidden rounded-md border border-gray-200">
                        <Image
                          src={book.cover_image || "/placeholder.svg"}
                          alt={`Cover for ${book.title}`}
                          fill
                          className="object-cover"
                          sizes="(max-width: 768px) 100vw, 96px"
                        />
                      </div>
                    ) : (
                      <div className="flex w-24 h-36 flex-col items-center justify-center rounded-md border border-dashed border-gray-200 p-2">
                        <BookOpen className="h-8 w-8 text-gray-400" />
                        <p className="text-xs text-gray-500">No cover</p>
                      </div>
                    )}
                  </div>
                  <div>
                    <p className="font-medium">By {book.author}</p>
                    {book.description && <p className="text-gray-500 mt-2 line-clamp-3">{book.description}</p>}
                    <div className="mt-4 flex items-center gap-2 flex-wrap">
                      <Badge variant="outline">{book.condition}</Badge>
                      <Badge
                        variant={
                          book.status === "Available" ? "success" : book.status === "Reserved" ? "warning" : "secondary"
                        }
                      >
                        {book.status}
                      </Badge>
                      {book.listing_type === "Sell" && book.price && (
                        <Badge variant="secondary">${book.price.toFixed(2)}</Badge>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="flex justify-between">
                <Button variant="outline" size="sm" onClick={() => router.push(`/dashboard/books/${book.id}`)}>
                  View Details
                </Button>
                <Button variant="ghost" size="sm" onClick={() => router.push(`/dashboard/books/edit/${book.id}`)}>
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
