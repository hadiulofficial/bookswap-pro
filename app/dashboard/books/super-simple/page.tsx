"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/contexts/auth-context"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertCircle, BookPlus, Loader2 } from "lucide-react"

export default function SuperSimpleBookPage() {
  const { user } = useAuth()
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [debugInfo, setDebugInfo] = useState<any>(null)

  // Minimal form state
  const [title, setTitle] = useState("")
  const [author, setAuthor] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!title || !author) {
      setError("Title and author are required")
      return
    }

    setIsSubmitting(true)
    setError(null)
    setDebugInfo(null)

    try {
      // Direct fetch to avoid any client-side issues
      const response = await fetch("/api/books/add-simple", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title,
          author,
          user_id: user?.id || null,
        }),
      })

      const result = await response.json()

      if (!response.ok) {
        setDebugInfo(result)
        throw new Error(result.error || "Failed to add book")
      }

      setSuccess(true)
      setDebugInfo(result)
    } catch (err: any) {
      console.error("Error adding book:", err)
      setError(err.message || "Failed to add book. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="max-w-md mx-auto mt-10 p-4">
      <h1 className="text-2xl font-bold mb-6">Super Simple Book Form</h1>

      {error && (
        <Alert variant="destructive" className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {success && (
        <Alert className="mb-6 bg-green-50 border-green-200">
          <BookPlus className="h-4 w-4 text-green-600" />
          <AlertDescription className="text-green-700">Book added successfully!</AlertDescription>
        </Alert>
      )}

      <Card>
        <CardContent className="pt-6">
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
            </div>

            <Button type="submit" className="w-full" disabled={isSubmitting}>
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
          </form>
        </CardContent>
      </Card>

      {debugInfo && (
        <div className="mt-6 p-4 bg-gray-100 rounded-md">
          <h3 className="font-bold mb-2">Debug Information:</h3>
          <pre className="text-xs overflow-auto">{JSON.stringify(debugInfo, null, 2)}</pre>
        </div>
      )}
    </div>
  )
}
