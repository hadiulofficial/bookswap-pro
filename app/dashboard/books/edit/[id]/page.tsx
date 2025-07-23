"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/contexts/auth-context"
import { useForm } from "react-hook-form"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { DashboardTitle } from "@/components/dashboard/title"
import { BookUpload } from "@/components/dashboard/book-upload"
import { Loader2, AlertCircle } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { createClientSupabaseClient } from "@/lib/supabase/client"
import { Skeleton } from "@/components/ui/skeleton"

// Define the valid conditions
const VALID_CONDITIONS = ["New", "Like New", "Very Good", "Good", "Acceptable"]

// Define the form interface
interface BookFormValues {
  title: string
  author: string
  isbn?: string
  description?: string
  condition: string
  category_id: number
  listing_type: "Sale" | "Exchange" | "Donation"
  price?: number | null
  cover_image?: string
  user_id: string
}

// Map UI listing types to database listing types (lowercase)
const listingTypeMap = {
  Sale: "sale",
  Exchange: "swap",
  Donation: "donation",
} as const // Use 'as const' for type safety

export default function EditBookPage({ params }: { params: { id: string } }) {
  const { user, isLoading: authLoading } = useAuth()
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [categories, setCategories] = useState<{ id: number; name: string }[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [bookNotFound, setBookNotFound] = useState(false)
  const supabase = createClientSupabaseClient()

  // Initialize the form
  const form = useForm<BookFormValues>({
    defaultValues: {
      title: "",
      author: "",
      isbn: "",
      description: "",
      condition: "",
      category_id: 0,
      listing_type: "Exchange", // Default to Exchange
      price: null,
      cover_image: "",
      user_id: "",
    },
  })

  // Fetch book data and categories when the component mounts
  useEffect(() => {
    async function fetchData() {
      if (!user) return

      try {
        setIsLoading(true)
        setError(null)

        // Fetch the book data directly from Supabase client
        const { data: bookData, error: bookError } = await supabase
          .from("books")
          .select("*")
          .eq("id", params.id)
          .single()

        if (bookError || !bookData) {
          console.error("Error fetching book:", bookError)
          setBookNotFound(true)
          return
        }

        // Check if the book belongs to the current user
        if (bookData.owner_id !== user.id) {
          setError("You don't have permission to edit this book")
          return
        }

        // Fetch categories
        const { data: categoriesData, error: categoriesError } = await supabase
          .from("categories")
          .select("id, name")
          .order("name")

        if (categoriesError) {
          console.error("Error fetching categories:", categoriesError)
          setError("Failed to load categories")
          return
        }

        // Ensure categoriesData is an array before setting state
        const categoriesArray = Array.isArray(categoriesData) ? categoriesData : []
        setCategories(categoriesArray)

        // Convert database listing_type to match our UI enum (e.g., "swap" to "Exchange")
        let uiListingType: "Sale" | "Exchange" | "Donation"
        switch (bookData.listing_type) {
          case "sale":
            uiListingType = "Sale"
            break
          case "swap":
            uiListingType = "Exchange"
            break
          case "donation":
            uiListingType = "Donation"
            break
          default:
            uiListingType = "Exchange" // Fallback
        }

        // Set form values
        form.reset({
          title: bookData.title || "",
          author: bookData.author || "",
          isbn: bookData.isbn || "",
          description: bookData.description || "",
          condition: bookData.condition || "",
          category_id: bookData.category_id || 0,
          listing_type: uiListingType,
          price: bookData.price,
          cover_image: bookData.cover_image || "",
          user_id: user.id,
        })
      } catch (err: any) {
        console.error("Error fetching data:", err)
        setError(err.message || "Failed to load book data")
      } finally {
        setIsLoading(false)
      }
    }

    if (user) {
      fetchData()
    }
  }, [user, params.id, form, supabase])

  // Handle form submission with manual validation
  async function onSubmit(values: BookFormValues) {
    if (!user) {
      setError("You must be logged in to update a book")
      return
    }

    // Basic validation
    if (!values.title) {
      setError("Title is required")
      return
    }
    if (!values.author) {
      setError("Author is required")
      return
    }
    if (!values.condition) {
      setError("Condition is required")
      return
    }
    if (!values.category_id || values.category_id < 1) {
      setError("Category is required")
      return
    }

    try {
      setIsSubmitting(true)
      setError(null)

      // Make sure user_id is set
      values.user_id = user.id

      // Convert UI listing type to database format (lowercase)
      const dbListingType = listingTypeMap[values.listing_type]

      // If listing type is not Sale, set price to null
      if (values.listing_type !== "Sale") {
        values.price = null
      } else if (values.price === undefined || values.price === null) {
        // Ensure price is at least 0 for sale items
        values.price = 0
      }

      // Prepare the data for the database
      const updateData = {
        title: values.title.trim(),
        author: values.author.trim(),
        isbn: values.isbn?.trim() || null,
        description: values.description?.trim() || null,
        condition: values.condition,
        cover_image: values.cover_image || null,
        listing_type: dbListingType, // Use the converted value
        price: dbListingType === "sale" ? values.price || 0 : null,
        category_id: values.category_id,
        user_id: user.id, // Pass user_id for server-side validation
      }

      console.log("Sending update data to API:", updateData)

      // Call the API route to update the book
      const response = await fetch("/api/books/update", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          bookId: params.id,
          data: updateData,
        }),
      })

      const result = await response.json()

      if (!result.success) {
        throw new Error(result.error || "Failed to update book")
      }

      // Redirect to the books page
      router.push("/dashboard/books")
    } catch (err: any) {
      console.error("Error updating book:", err)
      setError(err.message || "Failed to update book")
    } finally {
      setIsSubmitting(false)
    }
  }

  // Handle image upload
  function handleImageUploaded(url: string) {
    form.setValue("cover_image", url)
  }

  // If not logged in, show a message
  if (!authLoading && !user) {
    router.push("/login")
    return null
  }

  // If book not found, show a message
  if (!isLoading && bookNotFound) {
    return (
      <div className="space-y-6">
        <DashboardTitle title="Edit Book" description="Update your book listing" />
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>Book not found</AlertDescription>
        </Alert>
        <Button onClick={() => router.push("/dashboard/books")}>Back to Books</Button>
      </div>
    )
  }

  // Show loading state
  if (isLoading) {
    return <EditBookLoadingState />
  }

  return (
    <div className="space-y-6">
      <DashboardTitle title="Edit Book" description="Update your book listing" />

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Left column */}
            <div className="space-y-6">
              <Card>
                <CardContent className="pt-6">
                  <div className="space-y-4">
                    <FormField
                      control={form.control}
                      name="title"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Book Title</FormLabel>
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

                    <FormField
                      control={form.control}
                      name="isbn"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>ISBN (Optional)</FormLabel>
                          <FormControl>
                            <Input placeholder="Enter ISBN" {...field} value={field.value || ""} />
                          </FormControl>
                          <FormDescription>International Standard Book Number, if available</FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="description"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Description (Optional)</FormLabel>
                          <FormControl>
                            <Textarea
                              placeholder="Enter a brief description of the book"
                              className="resize-none"
                              {...field}
                              value={field.value || ""}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6">
                  <FormField
                    control={form.control}
                    name="cover_image"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Cover Image (Optional)</FormLabel>
                        <FormControl>
                          <BookUpload
                            onImageUploaded={handleImageUploaded}
                            existingImageUrl={field.value}
                            value={field.value || ""}
                            onChange={field.onChange}
                          />
                        </FormControl>
                        <FormDescription>Upload a cover image for your book (max 5MB)</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>
            </div>

            {/* Right column */}
            <div className="space-y-6">
              <Card>
                <CardContent className="pt-6">
                  <div className="space-y-4">
                    <FormField
                      control={form.control}
                      name="listing_type"
                      render={({ field }) => (
                        <FormItem className="space-y-3">
                          <FormLabel>Listing Type</FormLabel>
                          <FormControl>
                            <RadioGroup
                              onValueChange={field.onChange}
                              defaultValue={field.value}
                              className="flex flex-col space-y-1"
                            >
                              <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                                <FormItem>
                                  <FormLabel className="[&:has([data-state=checked])>div]:border-primary">
                                    <FormControl>
                                      <RadioGroupItem value="Exchange" className="sr-only" />
                                    </FormControl>
                                    <div className="border-2 rounded-md p-4 cursor-pointer hover:border-primary">
                                      <div className="font-medium">Exchange</div>
                                      <div className="text-sm text-muted-foreground">Swap for another book</div>
                                    </div>
                                  </FormLabel>
                                </FormItem>
                                <FormItem>
                                  <FormLabel className="[&:has([data-state=checked])>div]:border-primary">
                                    <FormControl>
                                      <RadioGroupItem value="Sale" className="sr-only" />
                                    </FormControl>
                                    <div className="border-2 rounded-md p-4 cursor-pointer hover:border-primary">
                                      <div className="font-medium">Sale</div>
                                      <div className="text-sm text-muted-foreground">Sell for a price</div>
                                    </div>
                                  </FormLabel>
                                </FormItem>
                                <FormItem>
                                  <FormLabel className="[&:has([data-state=checked])>div]:border-primary">
                                    <FormControl>
                                      <RadioGroupItem value="Donation" className="sr-only" />
                                    </FormControl>
                                    <div className="border-2 rounded-md p-4 cursor-pointer hover:border-primary">
                                      <div className="font-medium">Donation</div>
                                      <div className="text-sm text-muted-foreground">Give away for free</div>
                                    </div>
                                  </FormLabel>
                                </FormItem>
                              </div>
                            </RadioGroup>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {form.watch("listing_type") === "Sale" && (
                      <FormField
                        control={form.control}
                        name="price"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Price ($)</FormLabel>
                            <FormControl>
                              <Input
                                type="number"
                                step="0.01"
                                min="0"
                                placeholder="Enter price"
                                {...field}
                                onChange={(e) => {
                                  const value = e.target.value ? Number.parseFloat(e.target.value) : 0
                                  field.onChange(value)
                                }}
                                value={field.value === null ? "0" : field.value}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    )}

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
                              {VALID_CONDITIONS.map((condition) => (
                                <SelectItem key={condition} value={condition}>
                                  {condition}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="category_id"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Category</FormLabel>
                          <Select
                            onValueChange={(value) => field.onChange(Number.parseInt(value))}
                            defaultValue={field.value ? field.value.toString() : undefined}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select category" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {categories && categories.length > 0 ? (
                                categories.map((category) => (
                                  <SelectItem key={category.id} value={category.id.toString()}>
                                    {category.name}
                                  </SelectItem>
                                ))
                              ) : (
                                <SelectItem value="0" disabled>
                                  No categories available
                                </SelectItem>
                              )}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </CardContent>
              </Card>

              <div className="flex justify-between">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.push("/dashboard/books")}
                  disabled={isSubmitting}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Updating...
                    </>
                  ) : (
                    "Update Book"
                  )}
                </Button>
              </div>
            </div>
          </div>
        </form>
      </Form>
    </div>
  )
}

// Loading state component
function EditBookLoadingState() {
  return (
    <div className="space-y-6">
      <DashboardTitle title="Edit Book" description="Update your book listing" />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Left column skeleton */}
        <div className="space-y-6">
          <Card>
            <CardContent className="pt-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Skeleton className="h-4 w-20" />
                  <Skeleton className="h-10 w-full" />
                </div>
                <div className="space-y-2">
                  <Skeleton className="h-4 w-20" />
                  <Skeleton className="h-10 w-full" />
                </div>
                <div className="space-y-2">
                  <Skeleton className="h-4 w-20" />
                  <Skeleton className="h-10 w-full" />
                  <Skeleton className="h-4 w-40" />
                </div>
                <div className="space-y-2">
                  <Skeleton className="h-4 w-20" />
                  <Skeleton className="h-24 w-full" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="space-y-2">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-40 w-full" />
                <Skeleton className="h-4 w-64" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right column skeleton */}
        <div className="space-y-6">
          <Card>
            <CardContent className="pt-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Skeleton className="h-4 w-24" />
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                    <Skeleton className="h-20 w-full" />
                    <Skeleton className="h-20 w-full" />
                    <Skeleton className="h-20 w-full" />
                  </div>
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
            </CardContent>
          </Card>

          <div className="flex justify-between">
            <Skeleton className="h-10 w-24" />
            <Skeleton className="h-10 w-32" />
          </div>
        </div>
      </div>
    </div>
  )
}
