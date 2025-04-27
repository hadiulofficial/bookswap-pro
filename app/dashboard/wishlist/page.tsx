"use client"

import { useEffect, useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { useAuth } from "@/contexts/auth-context"
import { DashboardTitle } from "@/components/dashboard/title"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Loader2, BookOpen, Heart, RefreshCw, ExternalLink } from "lucide-react"
import { toast } from "@/components/ui/use-toast"
import { removeFromWishlist } from "@/app/actions/wishlist-actions"
import { supabase } from "@/lib/supabase/client"

export default function WishlistPage() {
  const { user } = useAuth()
  const [wishlist, setWishlist] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [removeLoading, setRemoveLoading] = useState<Record<string, boolean>>({})

  useEffect(() => {
    if (user) {
      fetchWishlist()
    }
  }, [user])

  const fetchWishlist = async () => {
    if (!user) return

    try {
      setLoading(true)

      const { data, error } = await supabase
        .from("wishlists")
        .select(`
          id, 
          created_at,
          book_id,
          books (
            id, 
            title, 
            author, 
            description, 
            condition, 
            cover_image, 
            listing_type, 
            price,
            owner_id,
            profiles (
              username,
              full_name,
              avatar_url
            )
          )
        `)
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })

      if (error) {
        throw error
      }

      setWishlist(data || [])
    } catch (err: any) {
      console.error("Error fetching wishlist:", err)
      toast({
        title: "Error",
        description: err.message || "Failed to load wishlist",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleRemoveFromWishlist = async (wishlistId: string, bookId: string) => {
    if (!user) return

    setRemoveLoading((prev) => ({ ...prev, [bookId]: true }))

    try {
      const result = await removeFromWishlist(user.id, bookId)

      if (result.success) {
        setWishlist((prev) => prev.filter((item) => item.id !== wishlistId))
        toast({
          title: "Success",
          description: "Book removed from your wishlist",
        })
      } else {
        toast({
          title: "Error",
          description: result.error || "Failed to remove from wishlist",
          variant: "destructive",
        })
      }
    } catch (err: any) {
      console.error("Error removing from wishlist:", err)
      toast({
        title: "Error",
        description: err.message || "An unexpected error occurred",
        variant: "destructive",
      })
    } finally {
      setRemoveLoading((prev) => ({ ...prev, [bookId]: false }))
    }
  }

  const getOwnerName = (book: any) => {
    if (book.profiles?.full_name) return book.profiles.full_name
    if (book.profiles?.username) return book.profiles.username
    return "Anonymous User"
  }

  return (
    <div className="container mx-auto py-6 space-y-8">
      <DashboardTitle
        title="My Wishlist"
        description="Books you're interested in"
        icon={<Heart className="h-6 w-6" />}
      />

      {loading ? (
        <div className="flex flex-col items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-emerald-600 mb-4" />
          <p className="text-gray-500">Loading your wishlist...</p>
        </div>
      ) : wishlist.length === 0 ? (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-8 text-center">
          <div className="mx-auto w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mb-4">
            <Heart className="h-8 w-8 text-gray-400" />
          </div>
          <h2 className="text-xl font-medium mb-2">Your wishlist is empty</h2>
          <p className="text-gray-500 mb-6 max-w-md mx-auto">
            Browse available books and add them to your wishlist to keep track of books you're interested in.
          </p>
          <Button asChild>
            <Link href="/books">
              <BookOpen className="mr-2 h-4 w-4" /> Browse Books
            </Link>
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {wishlist.map((item) => {
            const book = item.books
            if (!book) return null

            return (
              <Card key={item.id} className="overflow-hidden">
                <div className="relative h-48 bg-gray-100 dark:bg-gray-700">
                  {book.cover_image ? (
                    <Image
                      src={book.cover_image || "/placeholder.svg"}
                      alt={book.title}
                      fill
                      className="object-cover"
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center">
                      <BookOpen className="h-12 w-12 text-gray-400" />
                    </div>
                  )}
                  <Badge
                    className="absolute top-2 right-2"
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
                  <Button
                    size="icon"
                    variant="ghost"
                    className="absolute top-2 left-2 h-8 w-8 rounded-full text-red-500 bg-white/80 hover:text-red-600 hover:bg-white"
                    onClick={() => handleRemoveFromWishlist(item.id, book.id)}
                    disabled={removeLoading[book.id]}
                  >
                    {removeLoading[book.id] ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Heart className="h-4 w-4 fill-current" />
                    )}
                  </Button>
                </div>
                <CardHeader>
                  <CardTitle className="line-clamp-1">{book.title}</CardTitle>
                  <p className="text-sm text-gray-500">By {book.author}</p>
                </CardHeader>
                <CardContent>
                  {book.description && <p className="text-sm text-gray-500 line-clamp-2 mb-2">{book.description}</p>}
                  <div className="flex items-center gap-2 mt-2">
                    <Badge variant="outline">{book.condition}</Badge>
                    {book.listing_type === "sale" && book.price && (
                      <Badge variant="secondary">${book.price.toFixed(2)}</Badge>
                    )}
                  </div>
                  <p className="text-xs text-gray-400 mt-3">Listed by {getOwnerName(book)}</p>
                </CardContent>
                <CardFooter className="flex gap-2">
                  <Button className="flex-1">
                    {book.listing_type === "Exchange" ? (
                      <>
                        <RefreshCw className="mr-2 h-4 w-4" /> Request Swap
                      </>
                    ) : book.listing_type === "Sell" ? (
                      "Purchase"
                    ) : (
                      "Request Book"
                    )}
                  </Button>
                  <Button variant="outline" size="icon" asChild>
                    <Link href={`/books/${book.id}`}>
                      <ExternalLink className="h-4 w-4" />
                    </Link>
                  </Button>
                </CardFooter>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}
