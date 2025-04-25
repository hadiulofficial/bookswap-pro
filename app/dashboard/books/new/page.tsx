"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/contexts/auth-context"
import { DashboardTitle } from "@/components/dashboard/title"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { BookUpload } from "@/components/dashboard/book-upload"
import { AlertCircle, ArrowLeft, BookPlus, Loader2 } from "lucide-react"
import { addBook, getCategories, VALID_CONDITIONS } from "@/app/actions/book-actions"

export default function NewBookPage() {
  const { user } = useAuth()
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [categories, setCategories] = useState<{ id: number; name: string }[]>([])
  const [coverImageUrl, setCoverImageUrl] = useState<string | null>(null)

  // Enhanced form state
  const [formData, setFormData] = useState({
    title: "",
    author: "",
    isbn: "",
    description: "",
    condition: "Good" as (typeof VALID_CONDITIONS)[number],
    category_id: "",
    listing_type: "swap" as "sale" | "swap" | "donation",
    price: "" as string | number,
    cover_image: "",
  })

  // Fetch categories on component mount
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const categoriesData = await getCategories()
        if (Array.isArray(categoriesData) && categoriesData.length > 0) {
          setCategories(categoriesData)
          // Set default category
          setFormData((prev) => ({ ...prev, category_id: categoriesData[0].id.toString() }))
        } else {
          console.log("No categories found or invalid data format")
        }
      } catch (error) {
        console.error("Error fetching categories:", error)
      }
    }

    fetchCategories()
  }, [])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleImageUploaded = (url: string) => {
    setCoverImageUrl(url)
    setFormData((prev) => ({ ...prev, cover_image: url }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!user) {
      setError("You must be logged in to add a book")
      return
    }

    if (!formData.title || !formData.author) {
      setError("Title and author are required")
      return
    }

    setIsSubmitting(true)
    setError(null)

    try {
      // Convert form data to the expected format
      const bookData = {
        title: formData.title,
        author: formData.author,
        isbn: formData.isbn || undefined,
        description: formData.description || undefined,
        condition: formData.condition,
        category_id: Number.parseInt(formData.category_id),
        listing_type: formData.listing_type,
        price: formData.listing_type === "sale" && formData.price ? Number.parseFloat(formData.price.toString()) : null,
        cover_image: formData.cover_image || undefined,
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
          <Tabs defaultValue="details" className="space-y-6">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="details">Book Details</TabsTrigger>
              <TabsTrigger value="listing">Listing Information</TabsTrigger>
              <TabsTrigger value="image">Cover Image</TabsTrigger>
            </TabsList>

            <form onSubmit={handleSubmit} className="space-y-6">
              {error && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <TabsContent value="details" className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                </div>

                <div className="space-y-2">
                  <Label htmlFor="isbn">ISBN</Label>
                  <Input
                    id="isbn"
                    name="isbn"
                    value={formData.isbn}
                    onChange={handleChange}
                    placeholder="Enter ISBN (optional)"
                  />
                  <p className="text-sm text-muted-foreground">
                    The International Standard Book Number (ISBN) helps identify your book
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    placeholder="Enter a brief description of the book (optional)"
                    className="min-h-32"
                  />
                  <p className="text-sm text-muted-foreground">
                    Include details about the book's content, themes, or any other relevant information
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="condition">Condition*</Label>
                    <Select
                      value={formData.condition}
                      onValueChange={(value) => handleSelectChange("condition", value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select condition" />
                      </SelectTrigger>
                      <SelectContent>
                        {VALID_CONDITIONS.map((condition) => (
                          <SelectItem key={condition} value={condition}>
                            {condition}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <p className="text-sm text-muted-foreground">Select the condition that best describes your book</p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="category">Category*</Label>
                    <Select
                      value={formData.category_id}
                      onValueChange={(value) => handleSelectChange("category_id", value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map((category) => (
                          <SelectItem key={category.id} value={category.id.toString()}>
                            {category.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <p className="text-sm text-muted-foreground">Choose the category that best fits your book</p>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="listing" className="space-y-6">
                <div className="space-y-3">
                  <Label>Listing Type*</Label>
                  <RadioGroup
                    value={formData.listing_type}
                    onValueChange={(value) => handleSelectChange("listing_type", value as "sale" | "swap" | "donation")}
                    className="flex flex-col space-y-1"
                  >
                    <div className="flex items-center space-x-3 space-y-0">
                      <RadioGroupItem value="sale" id="sale" />
                      <Label htmlFor="sale" className="font-normal">
                        For Sale
                      </Label>
                    </div>
                    <div className="flex items-center space-x-3 space-y-0">
                      <RadioGroupItem value="swap" id="swap" />
                      <Label htmlFor="swap" className="font-normal">
                        For Swap
                      </Label>
                    </div>
                    <div className="flex items-center space-x-3 space-y-0">
                      <RadioGroupItem value="donation" id="donation" />
                      <Label htmlFor="donation" className="font-normal">
                        For Donation
                      </Label>
                    </div>
                  </RadioGroup>
                  <p className="text-sm text-muted-foreground">
                    Select whether you want to sell, swap, or donate this book
                  </p>
                </div>

                {formData.listing_type === "sale" && (
                  <div className="space-y-2">
                    <Label htmlFor="price">Price*</Label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">$</span>
                      <Input
                        id="price"
                        name="price"
                        type="number"
                        step="0.01"
                        min="0"
                        value={formData.price}
                        onChange={handleChange}
                        placeholder="0.00"
                        className="pl-8"
                      />
                    </div>
                    <p className="text-sm text-muted-foreground">Enter the price you want to sell this book for</p>
                  </div>
                )}
              </TabsContent>

              <TabsContent value="image" className="space-y-6">
                <div className="space-y-2">
                  <Label>Cover Image</Label>
                  <CardContent className="p-0">
                    <BookUpload
                      onImageUploaded={handleImageUploaded}
                      existingImageUrl={coverImageUrl}
                      value={formData.cover_image}
                      onChange={(value) => handleSelectChange("cover_image", value)}
                    />
                  </CardContent>
                  <p className="text-sm text-muted-foreground">
                    Upload a cover image for your book. This will help attract more interest.
                  </p>
                </div>
              </TabsContent>

              <div className="flex justify-end">
                <Button type="submit" disabled={isSubmitting} className="w-full sm:w-auto">
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
          </Tabs>
        </Card>
      )}
    </div>
  )
}
