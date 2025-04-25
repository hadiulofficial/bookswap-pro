"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/contexts/auth-context"
import { DashboardTitle } from "@/components/dashboard/title"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertCircle, ArrowLeft, BookPlus, Loader2 } from "lucide-react"
import { DebugAuth } from "@/components/debug-auth"

export default function NewBookPage() {
  const { user, session } = useAuth()
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [isClient, setIsClient] = useState(false)

  // Form state
  const [title, setTitle] = useState("")
  const [author, setAuthor] = useState("")
  const [description, setDescription] = useState("")

  useEffect(() => {
    setIsClient(true)
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!user) {
      setError("You must be logged in to add a book")
      return
    }

    if (!title || !author) {
      setError("Title and author are required")
      return
    }

    setIsSubmitting(true)
    setError(null)

    try {
      const response = await fetch("/api/books/add", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title,
          author,
          description,
          condition: "Good",
          listing_type: "Exchange", // Correctly capitalized
          category_id: 1, // Default category
        }),
        credentials: "include", // Important: include cookies for auth
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || "Failed to add book")
      }

      setSuccess(true)
      setTimeout(() => {
        router.push("/dashboard/books")
        router.refresh()
      }, 2000)
    } catch (err: any) {
      console.error("Error adding book:", err)
      setError(err.message || "Failed to add book. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  // Wait for client-side rendering to check auth
  if (!isClient) {
    return <div>Loading...</div>
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
        <DebugAuth />
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
        <Card>
          <CardContent className="pt-6">
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
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Enter the book title"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="author">Author*</Label>
                  <Input
                    id="author"
                    value={author}
                    onChange={(e) => setAuthor(e.target.value)}
                    placeholder="Enter the author's name"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Enter a description of the book"
                    rows={3}
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
      <DebugAuth />
    </div>
  )
}
