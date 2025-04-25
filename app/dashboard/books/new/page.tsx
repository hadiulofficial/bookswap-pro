"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/contexts/auth-context"
import { DashboardTitle } from "@/components/dashboard/title"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertCircle, ArrowLeft, BookPlus, Loader2 } from "lucide-react"
import { addBook } from "@/app/actions/book-actions"

export default function NewBookPage() {
  const { user } = useAuth()
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  // Simple form state
  const [formData, setFormData] = useState({
    title: "",
    author: "",
    description: "",
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!user) {
      setError("You must be logged in to add a book")
      return
    }

    setIsSubmitting(true)
    setError(null)

    try {
      // Create minimal book data
      const bookData = {
        title: formData.title,
        author: formData.author,
        description: formData.description || "",
        condition: "Good",
        category_id: 1, // Default category
        listing_type: "swap",
        user_id: user.id,
      }

      const result = await addBook(bookData)

      if (!result.success) {
        throw new Error(result.error || "Failed to add book")
      }

      setSuccess(true)

      // Redirect after success
      setTimeout(() => {
        router.push("/dashboard/books")
      }, 2000)
    } catch (err: any) {
      console.error("Error adding book:", err)
      setError(err.message || "Failed to add book. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  // If not logged in, show error
  if (!user) {
    return (
      <div className="space-y-6">
        <DashboardTitle title="Add New Book" description="List a book for sale, swap, or donation" />
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>You must be logged in to add a book</AlertDescription>
        </Alert>
        <Button variant="outline" onClick={() => router.push("/login")}>
          Go to Login
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <DashboardTitle title="Add New Book" description="List a book for sale, swap, or donation" />
        <Button variant="outline" onClick={() => router.push("/dashboard/books")}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Books
        </Button>
      </div>

      {success ? (
        <Alert className="bg-emerald-50 border-emerald-200 dark:bg-emerald-950/30 dark:border-emerald-900">
          <BookPlus className="h-4 w-4 text-emerald-600" />
          <AlertDescription className="text-emerald-700 dark:text-emerald-300">
            Book added successfully! Redirecting to your book collection...
          </AlertDescription>
        </Alert>
      ) : (
        <Card className="p-6">
          <CardHeader>
            <CardTitle>Add New Book</CardTitle>
          </CardHeader>
          <CardContent>
            {error && (
              <Alert variant="destructive" className="mb-6">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Book Title*</Label>
                  <Input
                    id="title"
                    name="title"
                    value={formData.title}
                    onChange={handleChange}
                    placeholder="Enter the book title"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="author">Author*</Label>
                  <Input
                    id="author"
                    name="author"
                    value={formData.author}
                    onChange={handleChange}
                    placeholder="Enter the author's name"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    placeholder="Enter a brief description of the book (optional)"
                    rows={4}
                  />
                </div>
              </div>

              <div className="flex justify-end">
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Adding Book...
                    </>
                  ) : (
                    <>
                      <BookPlus className="mr-2 h-4 w-4" /> Add Book
                    </>
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
