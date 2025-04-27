"use client"

import { useEffect, useState } from "react"
import { useRouter, useParams } from "next/navigation"
import Image from "next/image"
import { useAuth } from "@/contexts/auth-context"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { DashboardTitle } from "@/components/dashboard/title"
import { BookOpen, ArrowLeft, Edit, Trash2, Calendar, Tag, BookMarked } from "lucide-react"
import { supabase } from "@/lib/supabase/client"
import { Skeleton } from "@/components/ui/skeleton"
import { format } from "date-fns"
import { Separator } from "@/components/ui/separator"

export default function BookDetailsPage() {
  const { user, isLoading: authLoading } = useAuth()
  const router = useRouter()
  const params = useParams()
  const bookId = params.id as string

  const [book, setBook] = useState<any>(null)
  const [category, setCategory] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    // If not loading and no user, redirect to login
    if (!authLoading && !user) {
      router.push("/login")
      return
    }

    // Only fetch book if we have a user and bookId
    if (user && bookId) {
      fetchBookDetails()
    }
  }, [user, authLoading, bookId, router])

  const fetchBookDetails = async () => {
    try {
      setLoading(true)
      setError(null)

      // Fetch book details
      const { data: bookData, error: bookError } = await supabase
        .from("books")
        .select("*")
        .eq("id", bookId)
        .eq("owner_id", user?.id)
        .single()

      if (bookError) {
        throw bookError
      }

      if (!bookData) {
        throw new Error("Book not found or you don't have permission to view it")
      }

      setBook(bookData)

      // If book has a category, fetch category details
      if (bookData.category_id) {
        const { data: categoryData, error: categoryError } = await supabase
          .from("categories")
          .select("*")
          .eq("id", bookData.category_id)
          .single()

        if (!categoryError && categoryData) {
          setCategory(categoryData)
        }
      }
    } catch (err: any) {
      console.error("Error fetching book details:", err)
      setError(err.message || "Failed to load book details")
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this book?")) {
      return
    }

    try {
      const { error } = await supabase.from("books").delete().eq("id", bookId).eq("owner_id", user?.id)

      if (error) {
        throw error
      }

      router.push("/dashboard/books")
    } catch (err: any) {
      console.error("Error deleting book:", err)
      alert(`Failed to delete book: ${err.message}`)
    }
  }

  if (!authLoading && !user) {
    return (
      <div className="container mx-auto py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">You must be logged in to view book details</h1>
          <Button onClick={() => router.push("/login")}>Log In</Button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <Button variant="ghost" size="sm" className="w-fit" onClick={() => router.push("/dashboard/books")}>
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to Books
        </Button>
      </div>

      {error && (
        <div className="bg-red-50 text-red-500 p-4 rounded-md mb-4">
          <p>{error}</p>
        </div>
      )}

      {loading ? (
        <Card>
          <CardHeader>
            <Skeleton className="h-8 w-3/4" />
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex flex-col md:flex-row gap-6">
              <Skeleton className="h-64 w-48 rounded-md" />
              <div className="space-y-4 flex-1">
                <Skeleton className="h-6 w-1/2" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-3/4" />
                <div className="flex gap-2 mt-4">
                  <Skeleton className="h-6 w-20" />
                  <Skeleton className="h-6 w-20" />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      ) : book ? (
        <>
          <DashboardTitle title={book.title} description="Book Details" />

          <Card>
            <CardContent className="pt-6 space-y-6">
              <div className="flex flex-col md:flex-row gap-6">
                {/* Book Cover */}
                <div className="flex-shrink-0">
                  {book.cover_image ? (
                    <div className="relative w-48 h-64 overflow-hidden rounded-md border border-gray-200">
                      <Image
                        src={book.cover_image || "/placeholder.svg"}
                        alt={`Cover for ${book.title}`}
                        fill
                        className="object-cover"
                        sizes="(max-width: 768px) 100vw, 192px"
                      />
                    </div>
                  ) : (
                    <div className="flex w-48 h-64 flex-col items-center justify-center rounded-md border border-dashed border-gray-200 p-4">
                      <BookOpen className="h-12 w-12 text-gray-400" />
                      <p className="text-sm text-gray-500 mt-2">No cover available</p>
                    </div>
                  )}
                </div>

                {/* Book Details */}
                <div className="flex-1 space-y-4">
                  <div>
                    <h2 className="text-2xl font-bold">{book.title}</h2>
                    <p className="text-lg text-gray-700">By {book.author}</p>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    <Badge
                      variant={
                        book.listing_type === "Exchange"
                          ? "default"
                          : book.listing_type === "Sell"
                            ? "secondary"
                            : "outline"
                      }
                      className="text-sm"
                    >
                      {book.listing_type}
                    </Badge>

                    <Badge variant="outline" className="text-sm">
                      {book.condition}
                    </Badge>

                    <Badge
                      variant={
                        book.status === "Available" ? "success" : book.status === "Reserved" ? "warning" : "secondary"
                      }
                      className="text-sm"
                    >
                      {book.status}
                    </Badge>

                    {book.listing_type === "Sell" && book.price && (
                      <Badge variant="secondary" className="text-sm">
                        ${book.price.toFixed(2)}
                      </Badge>
                    )}

                    {category && (
                      <Badge variant="outline" className="text-sm">
                        {category.name}
                      </Badge>
                    )}
                  </div>

                  {book.isbn && (
                    <p className="text-sm text-gray-500">
                      <span className="font-medium">ISBN:</span> {book.isbn}
                    </p>
                  )}

                  {book.description && (
                    <div>
                      <h3 className="text-md font-medium mb-2">Description</h3>
                      <p className="text-gray-700">{book.description}</p>
                    </div>
                  )}
                </div>
              </div>

              <Separator />

              {/* Additional Details */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-gray-500" />
                  <div>
                    <p className="text-sm font-medium">Added on</p>
                    <p className="text-sm text-gray-600">
                      {book.created_at ? format(new Date(book.created_at), "PPP") : "Unknown"}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Tag className="h-5 w-5 text-gray-500" />
                  <div>
                    <p className="text-sm font-medium">Listing Type</p>
                    <p className="text-sm text-gray-600">{book.listing_type}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <BookMarked className="h-5 w-5 text-gray-500" />
                  <div>
                    <p className="text-sm font-medium">Status</p>
                    <p className="text-sm text-gray-600">{book.status}</p>
                  </div>
                </div>

                {book.listing_type === "Sell" && book.price && (
                  <div className="flex items-center gap-2">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="20"
                      height="20"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="text-gray-500"
                    >
                      <circle cx="12" cy="12" r="10" />
                      <path d="M16 8h-6a2 2 0 1 0 0 4h4a2 2 0 1 1 0 4H8" />
                      <path d="M12 18V6" />
                    </svg>
                    <div>
                      <p className="text-sm font-medium">Price</p>
                      <p className="text-sm text-gray-600">${book.price.toFixed(2)}</p>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>

            <CardFooter className="flex justify-between border-t p-6">
              <Button variant="outline" onClick={() => router.push(`/dashboard/books/edit/${book.id}`)}>
                <Edit className="mr-2 h-4 w-4" /> Edit Book
              </Button>
              <Button variant="destructive" onClick={handleDelete}>
                <Trash2 className="mr-2 h-4 w-4" /> Delete Book
              </Button>
            </CardFooter>
          </Card>
        </>
      ) : (
        <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-lg shadow-sm">
          <h2 className="text-xl font-medium mb-2">Book not found</h2>
          <p className="text-gray-500 mb-4">
            The book you're looking for doesn't exist or you don't have permission to view it.
          </p>
          <Button onClick={() => router.push("/dashboard/books")}>Back to Books</Button>
        </div>
      )}
    </div>
  )
}
