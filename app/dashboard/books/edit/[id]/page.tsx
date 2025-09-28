"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { useAuth } from "@/contexts/auth-context"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { toast } from "@/components/ui/use-toast"
import { Loader2, ArrowLeft, Save } from "lucide-react"
import { supabase } from "@/lib/supabase/client"

type Category = {
  id: number
  name: string
}

type Book = {
  id: string
  title: string
  author: string
  isbn?: string
  description?: string
  condition: string
  listing_type: string
  price?: number
  category_id: number
  cover_image?: string
  owner_id: string
}

export default function EditBookPage() {
  const params = useParams()
  const router = useRouter()
  const { user } = useAuth()
  const bookId = params.id as string

  const [book, setBook] = useState<Book | null>(null)
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [formData, setFormData] = useState({
    title: "",
    author: "",
    isbn: "",
    description: "",
    condition: "Good",
    listing_type: "Exchange",
    price: "",
    category_id: "1",
    cover_image: "",
  })

  useEffect(() => {
    if (!user) {
      router.push("/login")
      return
    }

    fetchBookAndCategories()
  }, [user, bookId, router])

  const fetchBookAndCategories = async () => {
    try {
      setLoading(true)

      // Fetch book details
      const { data: bookData, error: bookError } = await supabase
        .from("books")
        .select("*")
        .eq("id", bookId)
        .eq("owner_id", user?.id)
        .single()

      if (bookError) {
        console.error("Error fetching book:", bookError)
        toast({
          title: "Error",
          description: "Failed to load book details",
          variant: "destructive",
        })
        router.push("/dashboard/books")
        return
      }

      if (!bookData) {
        toast({
          title: "Error",
          description: "Book not found or you don't have permission to edit it",
          variant: "destructive",
        })
        router.push("/dashboard/books")
        return
      }

      setBook(bookData)

      // Convert database values to UI values
      const uiListingType =
        bookData.listing_type === "swap"
          ? "Exchange"
          : bookData.listing_type === "sale"
            ? "Sale"
            : bookData.listing_type === "donation"
              ? "Donation"
              : "Exchange"

      setFormData({
        title: bookData.title || "",
        author: bookData.author || "",
        isbn: bookData.isbn || "",
        description: bookData.description || "",
        condition: bookData.condition || "Good",
        listing_type: uiListingType,
        price: bookData.price ? bookData.price.toString() : "",
        category_id: bookData.category_id ? bookData.category_id.toString() : "1",
        cover_image: bookData.cover_image || "",
      })

      // Fetch categories
      const { data: categoriesData, error: categoriesError } = await supabase
        .from("categories")
        .select("id, name")
        .order("name")

      if (categoriesError) {
        console.error("Error fetching categories:", categoriesError)
        // Set default categories if fetch fails
        setCategories([
          { id: 1, name: "Fiction" },
          { id: 2, name: "Non-Fiction" },
          { id: 3, name: "Science" },
          { id: 4, name: "Technology" },
          { id: 5, name: "History" },
        ])
      } else {
        setCategories(categoriesData || [])
      }
    } catch (error) {
      console.error("Error in fetchBookAndCategories:", error)
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!user) {
      toast({
        title: "Error",
        description: "You must be logged in to update a book",
        variant: "destructive",
      })
      return
    }

    if (!formData.title.trim() || !formData.author.trim()) {
      toast({
        title: "Error",
        description: "Title and author are required",
        variant: "destructive",
      })
      return
    }

    setSubmitting(true)

    try {
      // Convert UI listing type to database format
      const listingTypeMap: Record<string, string> = {
        Sale: "sale",
        Exchange: "swap",
        Donation: "donation",
      }

      const dbListingType = listingTypeMap[formData.listing_type] || "swap"

      console.log("Client: Converted UI listing type to DB format:", {
        ui: formData.listing_type,
        db: dbListingType,
      })

      const updateData = {
        title: formData.title.trim(),
        author: formData.author.trim(),
        isbn: formData.isbn.trim() || null,
        description: formData.description.trim() || null,
        condition: formData.condition,
        listing_type: dbListingType,
        price: dbListingType === "sale" ? Number.parseFloat(formData.price) || 0 : null,
        category_id: Number.parseInt(formData.category_id),
        cover_image: formData.cover_image || null,
        user_id: user.id,
      }

      console.log("Client: Sending update data to API:", updateData)

      const response = await fetch("/api/books/update", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          bookId,
          data: updateData,
        }),
      })

      const result = await response.json()

      if (!response.ok || !result.success) {
        throw new Error(result.error || "Failed to update book")
      }

      toast({
        title: "Success",
        description: "Book updated successfully",
      })

      router.push("/dashboard/books")
    } catch (error: any) {
      console.error("Client: Error updating book:", error)
      toast({
        title: "Error",
        description: error.message || "Failed to update book",
        variant: "destructive",
      })
    } finally {
      setSubmitting(false)
    }
  }

  if (!user) {
    return (
      <div className="container mx-auto py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">You must be logged in to edit books</h1>
          <Button onClick={() => router.push("/login")}>Log In</Button>
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="container mx-auto py-8">
        <div className="flex flex-col items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-emerald-600 mb-3" />
          <p className="text-gray-500 text-sm">Loading book details...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center gap-4 mb-6">
          <Button variant="ghost" size="sm" onClick={() => router.push("/dashboard/books")}>
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to Books
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Edit Book</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Title *</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => handleInputChange("title", e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="author">Author *</Label>
                  <Input
                    id="author"
                    value={formData.author}
                    onChange={(e) => handleInputChange("author", e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="isbn">ISBN</Label>
                <Input id="isbn" value={formData.isbn} onChange={(e) => handleInputChange("isbn", e.target.value)} />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => handleInputChange("description", e.target.value)}
                  rows={4}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="condition">Condition</Label>
                  <Select value={formData.condition} onValueChange={(value) => handleInputChange("condition", value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="New">New</SelectItem>
                      <SelectItem value="Like New">Like New</SelectItem>
                      <SelectItem value="Very Good">Very Good</SelectItem>
                      <SelectItem value="Good">Good</SelectItem>
                      <SelectItem value="Acceptable">Acceptable</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="listing_type">Listing Type</Label>
                  <Select
                    value={formData.listing_type}
                    onValueChange={(value) => handleInputChange("listing_type", value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Sale">Sale</SelectItem>
                      <SelectItem value="Exchange">Exchange</SelectItem>
                      <SelectItem value="Donation">Donation</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {formData.listing_type === "Sale" && (
                <div className="space-y-2">
                  <Label htmlFor="price">Price ($)</Label>
                  <Input
                    id="price"
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.price}
                    onChange={(e) => handleInputChange("price", e.target.value)}
                  />
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="category">Category</Label>
                <Select value={formData.category_id} onValueChange={(value) => handleInputChange("category_id", value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((category) => (
                      <SelectItem key={category.id} value={category.id.toString()}>
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="cover_image">Cover Image URL</Label>
                <Input
                  id="cover_image"
                  type="url"
                  value={formData.cover_image}
                  onChange={(e) => handleInputChange("cover_image", e.target.value)}
                  placeholder="https://example.com/book-cover.jpg"
                />
              </div>

              <div className="flex justify-end gap-4">
                <Button type="button" variant="outline" onClick={() => router.push("/dashboard/books")}>
                  Cancel
                </Button>
                <Button type="submit" disabled={submitting}>
                  {submitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Updating...
                    </>
                  ) : (
                    <>
                      <Save className="mr-2 h-4 w-4" />
                      Update Book
                    </>
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
