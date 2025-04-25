"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

export default function AddBookFixed() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    const formData = new FormData(e.currentTarget)

    // Important: Use correct capitalization for listing_type
    // The values in the form match exactly what the database expects
    const data = {
      title: formData.get("title") as string,
      author: formData.get("author") as string,
      description: formData.get("description") as string,
      condition: formData.get("condition") as string,
      listingType: formData.get("listingType") as string, // This will be capitalized from the select
    }

    try {
      const response = await fetch("/api/books/add-fixed", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || "Failed to add book")
      }

      setSuccess(true)
      // Redirect to books page after 1 second
      setTimeout(() => {
        router.push("/dashboard/books")
        router.refresh()
      }, 1000)
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="container mx-auto py-8">
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle className="text-2xl">Add New Book</CardTitle>
        </CardHeader>
        <CardContent>
          {error && <div className="bg-red-50 text-red-500 p-3 rounded-md mb-4">{error}</div>}

          {success && (
            <div className="bg-green-50 text-green-500 p-3 rounded-md mb-4">
              Book added successfully! Redirecting...
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">Title *</Label>
              <Input id="title" name="title" required />
            </div>

            <div className="space-y-2">
              <Label htmlFor="author">Author *</Label>
              <Input id="author" name="author" required />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea id="description" name="description" rows={3} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="condition">Condition</Label>
              <Select name="condition" defaultValue="Good">
                <SelectTrigger>
                  <SelectValue placeholder="Select condition" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Like New">Like New</SelectItem>
                  <SelectItem value="Very Good">Very Good</SelectItem>
                  <SelectItem value="Good">Good</SelectItem>
                  <SelectItem value="Acceptable">Acceptable</SelectItem>
                  <SelectItem value="Poor">Poor</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="listingType">Listing Type</Label>
              <Select name="listingType" defaultValue="Exchange">
                <SelectTrigger>
                  <SelectValue placeholder="Select listing type" />
                </SelectTrigger>
                <SelectContent>
                  {/* Important: Use correct capitalization that matches the database constraint */}
                  <SelectItem value="Exchange">Exchange</SelectItem>
                  <SelectItem value="Sell">Sell</SelectItem>
                  <SelectItem value="Donate">Donate</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? "Adding Book..." : "Add Book"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
