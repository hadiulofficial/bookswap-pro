"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { useToast } from "@/components/ui/use-toast"
import { Loader2, Upload, X } from "lucide-react"
import Image from "next/image"

const bookSchema = z.object({
  title: z.string().min(1, "Title is required").max(200, "Title must be less than 200 characters"),
  author: z.string().min(1, "Author is required").max(100, "Author must be less than 100 characters"),
  genre: z.string().min(1, "Genre is required"),
  condition: z.enum(["new", "like_new", "good", "fair", "poor"], {
    required_error: "Please select a condition",
  }),
  listing_type: z.enum(["sale", "exchange", "donation"], {
    required_error: "Please select a listing type",
  }),
  price: z.string().optional(),
  description: z.string().max(1000, "Description must be less than 1000 characters").optional(),
  image_url: z.string().optional(),
})

type BookFormData = z.infer<typeof bookSchema>

interface Book {
  id: string
  title: string
  author: string
  genre: string
  condition: string
  listing_type: string
  price: number | null
  description: string | null
  image_url: string | null
}

interface EditBookFormProps {
  book: Book
  genres: string[]
}

export function EditBookForm({ book, genres }: EditBookFormProps) {
  const router = useRouter()
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)
  const [imagePreview, setImagePreview] = useState<string | null>(book.image_url)

  const form = useForm<BookFormData>({
    resolver: zodResolver(bookSchema),
    defaultValues: {
      title: book.title,
      author: book.author,
      genre: book.genre,
      condition: book.condition as "new" | "like_new" | "good" | "fair" | "poor",
      listing_type: book.listing_type as "sale" | "exchange" | "donation",
      price: book.price?.toString() || "",
      description: book.description || "",
      image_url: book.image_url || "",
    },
  })

  const watchListingType = form.watch("listing_type")

  const onSubmit = async (data: BookFormData) => {
    setIsLoading(true)

    try {
      // Convert price to number if listing type is sale
      const processedData = {
        ...data,
        price: data.listing_type === "sale" && data.price ? Number.parseFloat(data.price) : null,
        description: data.description || null,
        image_url: data.image_url || null,
      }

      const response = await fetch("/api/books/update", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id: book.id,
          ...processedData,
        }),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || "Failed to update book")
      }

      toast({
        title: "Success",
        description: "Book updated successfully!",
      })

      router.push("/dashboard/books")
      router.refresh()
    } catch (error) {
      console.error("Error updating book:", error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to update book. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    // Create preview
    const reader = new FileReader()
    reader.onload = (e) => {
      setImagePreview(e.target?.result as string)
    }
    reader.readAsDataURL(file)

    // Here you would typically upload to your storage service
    // For now, we'll just set a placeholder URL
    form.setValue("image_url", URL.createObjectURL(file))
  }

  const removeImage = () => {
    setImagePreview(null)
    form.setValue("image_url", "")
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid gap-4 md:grid-cols-2">
          <FormField
            control={form.control}
            name="title"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Title</FormLabel>
                <FormControl>
                  <Input placeholder="Enter book title" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="author"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Author</FormLabel>
                <FormControl>
                  <Input placeholder="Enter author name" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Textarea placeholder="Describe the book (optional)" className="min-h-[100px]" {...field} />
              </FormControl>
              <FormDescription>Provide additional details about the book's content or condition.</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid gap-4 md:grid-cols-3">
          <FormField
            control={form.control}
            name="genre"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Genre</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select genre" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {genres.map((genre) => (
                      <SelectItem key={genre} value={genre}>
                        {genre}
                      </SelectItem>
                    ))}
                    <SelectItem value="Fiction">Fiction</SelectItem>
                    <SelectItem value="Non-Fiction">Non-Fiction</SelectItem>
                    <SelectItem value="Mystery">Mystery</SelectItem>
                    <SelectItem value="Romance">Romance</SelectItem>
                    <SelectItem value="Science Fiction">Science Fiction</SelectItem>
                    <SelectItem value="Fantasy">Fantasy</SelectItem>
                    <SelectItem value="Biography">Biography</SelectItem>
                    <SelectItem value="History">History</SelectItem>
                    <SelectItem value="Self-Help">Self-Help</SelectItem>
                    <SelectItem value="Children">Children</SelectItem>
                    <SelectItem value="Young Adult">Young Adult</SelectItem>
                    <SelectItem value="Other">Other</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="condition"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Condition</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select condition" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="new">New</SelectItem>
                    <SelectItem value="like_new">Like New</SelectItem>
                    <SelectItem value="good">Good</SelectItem>
                    <SelectItem value="fair">Fair</SelectItem>
                    <SelectItem value="poor">Poor</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="listing_type"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Listing Type</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="sale">For Sale</SelectItem>
                    <SelectItem value="exchange">Exchange</SelectItem>
                    <SelectItem value="donation">Donation</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {watchListingType === "sale" && (
          <FormField
            control={form.control}
            name="price"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Price ($)</FormLabel>
                <FormControl>
                  <Input type="number" step="0.01" min="0" placeholder="0.00" {...field} />
                </FormControl>
                <FormDescription>Enter the price you want to sell this book for.</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        )}

        <div className="space-y-4">
          <FormLabel>Book Cover Image</FormLabel>

          {imagePreview ? (
            <div className="relative w-32 h-40 rounded-lg overflow-hidden border">
              <Image src={imagePreview || "/placeholder.svg"} alt="Book cover preview" fill className="object-cover" />
              <Button
                type="button"
                variant="destructive"
                size="sm"
                className="absolute top-1 right-1"
                onClick={removeImage}
              >
                <X className="h-3 w-3" />
              </Button>
            </div>
          ) : (
            <div className="w-32 h-40 border-2 border-dashed border-muted-foreground/25 rounded-lg flex items-center justify-center">
              <div className="text-center">
                <Upload className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                <p className="text-sm text-muted-foreground">No image</p>
              </div>
            </div>
          )}

          <div>
            <Input type="file" accept="image/*" onChange={handleImageUpload} className="w-full" />
            <p className="text-sm text-muted-foreground mt-1">Upload a cover image for your book (optional)</p>
          </div>
        </div>

        <div className="flex gap-4">
          <Button type="submit" disabled={isLoading}>
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Update Book
          </Button>

          <Button type="button" variant="outline" onClick={() => router.back()} disabled={isLoading}>
            Cancel
          </Button>
        </div>
      </form>
    </Form>
  )
}
