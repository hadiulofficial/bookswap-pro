"use client"

import type React from "react"
import { Suspense } from "react"
import { createServerComponentClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import { redirect, notFound } from "next/navigation"
import { EditBookForm } from "./edit-book-form"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { Button } from "@/components/ui/button"
import { Save } from "lucide-react"
import { useState } from "react"

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
  user_id: string
}

interface EditBookPageProps {
  params: {
    id: string
  }
}

async function getBook(bookId: string, userId: string) {
  const supabase = createServerComponentClient({ cookies })

  const { data: book, error } = await supabase.from("books").select("*").eq("id", bookId).eq("user_id", userId).single()

  if (error) {
    console.error("Error fetching book:", error)
    return null
  }

  return book
}

async function getGenres() {
  const supabase = createServerComponentClient({ cookies })

  const { data, error } = await supabase.from("books").select("genre").not("genre", "is", null)

  if (error) {
    console.error("Error fetching genres:", error)
    return []
  }

  const uniqueGenres = [...new Set(data?.map((book) => book.genre) || [])]
  return uniqueGenres.filter(Boolean)
}

export default async function EditBookPage({ params }: EditBookPageProps) {
  const supabase = createServerComponentClient({ cookies })

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()

  if (authError || !user) {
    redirect("/login")
  }

  const [book, genres] = await Promise.all([getBook(params.id, user.id), getGenres()])

  if (!book) {
    notFound()
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Edit Book</h1>
        <p className="text-muted-foreground">Update your book listing information</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Book Details</CardTitle>
          <CardDescription>Make changes to your book listing. Click save when you're done.</CardDescription>
        </CardHeader>
        <CardContent>
          <Suspense fallback={<EditBookFormSkeleton />}>
            <EditBookForm book={book} genres={genres} />
          </Suspense>
        </CardContent>
      </Card>
    </div>
  )
}

function EditBookFormSkeleton() {
  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Skeleton className="h-4 w-16" />
          <Skeleton className="h-10 w-full" />
        </div>
        <div className="space-y-2">
          <Skeleton className="h-4 w-16" />
          <Skeleton className="h-10 w-full" />
        </div>
      </div>
      <div className="space-y-2">
        <Skeleton className="h-4 w-20" />
        <Skeleton className="h-24 w-full" />
      </div>
      <div className="grid gap-4 md:grid-cols-3">
        <div className="space-y-2">
          <Skeleton className="h-4 w-16" />
          <Skeleton className="h-10 w-full" />
        </div>
        <div className="space-y-2">
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-10 w-full" />
        </div>
        <div className="space-y-2">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-10 w-full" />
        </div>
      </div>
      <Skeleton className="h-10 w-24" />
    </div>
  )
}

function EditBookFormComponent({ book, genres }) {
  const [formData, setFormData] = useState({
    title: book.title || "",
    author: book.author || "",
    isbn: book.isbn || "",
    description: book.description || "",
    condition: book.condition || "Good",
    listing_type:
      book.listing_type === "swap"
        ? "Exchange"
        : book.listing_type === "sale"
          ? "Sale"
          : book.listing_type === "donation"
            ? "Donation"
            : "Exchange",
    price: book.price ? book.price.toString() : "",
    category_id: book.category_id ? book.category_id.toString() : "1",
    cover_image: book.cover_image || "",
  })

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    const listingTypeMap: Record<string, string> = {
      Sale: "sale",
      Exchange: "swap",
      Donation: "donation",
    }

    const dbListingType = listingTypeMap[formData.listing_type] || "swap"

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
      user_id: book.user_id,
    }

    const response = await fetch("/api/books/update", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        bookId: book.id,
        data: updateData,
      }),
    })

    const result = await response.json()

    if (!response.ok || !result.success) {
      throw new Error(result.error || "Failed to update book")
    }

    alert("Book updated successfully")
    window.location.href = "/dashboard/books"
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <label htmlFor="title">Title *</label>
          <input
            id="title"
            value={formData.title}
            onChange={(e) => handleInputChange("title", e.target.value)}
            required
          />
        </div>

        <div className="space-y-2">
          <label htmlFor="author">Author *</label>
          <input
            id="author"
            value={formData.author}
            onChange={(e) => handleInputChange("author", e.target.value)}
            required
          />
        </div>
      </div>

      <div className="space-y-2">
        <label htmlFor="isbn">ISBN</label>
        <input id="isbn" value={formData.isbn} onChange={(e) => handleInputChange("isbn", e.target.value)} />
      </div>

      <div className="space-y-2">
        <label htmlFor="description">Description</label>
        <textarea
          id="description"
          value={formData.description}
          onChange={(e) => handleInputChange("description", e.target.value)}
          rows={4}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <label htmlFor="condition">Condition</label>
          <select value={formData.condition} onChange={(e) => handleInputChange("condition", e.target.value)}>
            <option value="New">New</option>
            <option value="Like New">Like New</option>
            <option value="Very Good">Very Good</option>
            <option value="Good">Good</option>
            <option value="Acceptable">Acceptable</option>
          </select>
        </div>

        <div className="space-y-2">
          <label htmlFor="listing_type">Listing Type</label>
          <select value={formData.listing_type} onChange={(e) => handleInputChange("listing_type", e.target.value)}>
            <option value="Sale">Sale</option>
            <option value="Exchange">Exchange</option>
            <option value="Donation">Donation</option>
          </select>
        </div>
      </div>

      {formData.listing_type === "Sale" && (
        <div className="space-y-2">
          <label htmlFor="price">Price ($)</label>
          <input
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
        <label htmlFor="category">Category</label>
        <select value={formData.category_id} onChange={(e) => handleInputChange("category_id", e.target.value)}>
          {genres.map((genre) => (
            <option key={genre} value={genre}>
              {genre}
            </option>
          ))}
        </select>
      </div>

      <div className="space-y-2">
        <label htmlFor="cover_image">Cover Image URL</label>
        <input
          id="cover_image"
          type="url"
          value={formData.cover_image}
          onChange={(e) => handleInputChange("cover_image", e.target.value)}
          placeholder="https://example.com/book-cover.jpg"
        />
      </div>

      <div className="flex justify-end gap-4">
        <Button type="button" variant="outline" onClick={() => (window.location.href = "/dashboard/books")}>
          Cancel
        </Button>
        <Button type="submit">
          <Save className="mr-2 h-4 w-4" />
          Update Book
        </Button>
      </div>
    </form>
  )
}
