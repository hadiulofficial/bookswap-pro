"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"

interface Book {
  id: string
  title: string
  author: string
  description: string | null
  price: number | null
  category: string
  listing_type: "sale" | "swap" | "donation"
  condition: string | null
  image_url: string | null
}

interface EditBookFormProps {
  book: Book
}

export function EditBookForm({ book }: EditBookFormProps) {
  const [formData, setFormData] = useState({
    title: book.title,
    author: book.author,
    description: book.description || "",
    price: book.price?.toString() || "",
    category: book.category,
    listing_type: book.listing_type,
    condition: book.condition || "",
    image_url: book.image_url || "",
  })
  const [isSubmitting, setIsSubmitting] = useState(false)

  const router = useRouter()
  const { toast } = useToast()

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      const response = await fetch("/api/books/update", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id: book.id,
          title: formData.title,
          author: formData.author,
          description: formData.description || null,
          price: formData.price ? Number.parseFloat(formData.price) : null,
          category: formData.category,
          listing_type: formData.listing_type,
          condition: formData.condition || null,
          image_url: formData.image_url || null,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to update book")
      }

      toast({
        title: "Success",
        description: "Book updated successfully",
      })

      router.push("/dashboard/books")
      router.refresh()
    } catch (error) {
      console.error("Error updating book:", error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to update book",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Book Details</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="title">Title *</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => handleChange("title", e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="author">Author *</Label>
              <Input
                id="author"
                value={formData.author}
                onChange={(e) => handleChange("author", e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="category">Category *</Label>
              <Select value={formData.category} onValueChange={(value) => handleChange("category", value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="fiction">Fiction</SelectItem>
                  <SelectItem value="non-fiction">Non-fiction</SelectItem>
                  <SelectItem value="mystery">Mystery</SelectItem>
                  <SelectItem value="romance">Romance</SelectItem>
                  <SelectItem value="sci-fi">Sci-Fi</SelectItem>
                  <SelectItem value="biography">Biography</SelectItem>
                  <SelectItem value="history">History</SelectItem>
                  <SelectItem value="self-help">Self-Help</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="listing_type">Listing Type *</Label>
              <Select value={formData.listing_type} onValueChange={(value) => handleChange("listing_type", value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select listing type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="sale">For Sale</SelectItem>
                  <SelectItem value="swap">For Swap</SelectItem>
                  <SelectItem value="donation">Donation</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {formData.listing_type === "sale" && (
              <div className="space-y-2">
                <Label htmlFor="price">Price ($)</Label>
                <Input
                  id="price"
                  type="number"
                  step="0.01"
                  value={formData.price}
                  onChange={(e) => handleChange("price", e.target.value)}
                  placeholder="0.00"
                />
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="condition">Condition</Label>
              <Select value={formData.condition} onValueChange={(value) => handleChange("condition", value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select condition" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="new">New</SelectItem>
                  <SelectItem value="like-new">Like New</SelectItem>
                  <SelectItem value="very-good">Very Good</SelectItem>
                  <SelectItem value="good">Good</SelectItem>
                  <SelectItem value="acceptable">Acceptable</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => handleChange("description", e.target.value)}
              placeholder="Tell readers about this book..."
              rows={4}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="image_url">Image URL</Label>
            <Input
              id="image_url"
              type="url"
              value={formData.image_url}
              onChange={(e) => handleChange("image_url", e.target.value)}
              placeholder="https://example.com/book-cover.jpg"
            />
          </div>

          <div className="flex gap-4">
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Updating..." : "Update Book"}
            </Button>
            <Button type="button" variant="outline" onClick={() => router.push("/dashboard/books")}>
              Cancel
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
