"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/contexts/auth-context"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { DashboardTitle } from "@/components/dashboard/title"
import { BookUpload } from "@/components/dashboard/book-upload"
import { VALID_CONDITIONS, updateBook } from "@/app/actions/book-actions"
import { Loader2, AlertCircle } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { createClientSupabaseClient } from "@/lib/supabase/client"

// Define the form schema with Zod
const formSchema = z.object({
  title: z.string().min(1, "Title is required"),
  author: z.string().min(1, "Author is required"),
  isbn: z.string().optional(),
  description: z.string().optional(),
  condition: z.string().min(1, "Condition is required"),
  category_id: z.coerce.number().min(1, "Category is required"),
  listing_type: z.enum(["Sale", "Exchange", "Donation"]),
  price: z.coerce.number().optional().nullable(),
  cover_image: z.string().optional(),
  user_id: z.string(),
})

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
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      author: "",
      isbn: "",
      description: "",
      condition: "",
      category_id: 0,
      listing_type: "Exchange" as const,
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

        // Convert listing_type to match our enum if needed
        let listingType = bookData.listing_type
        if (listingType === "sale") listingType = "Sale"
        if (listingType === "swap") listingType = "Exchange"
        if (listingType === "donation") listingType = "Donation"

        // Set form values
        form.reset({
          title: bookData.title || "",
          author: bookData.author || "",
          isbn: bookData.isbn || "",
          description: bookData.description || "",
          condition: bookData.condition || "",
          category_id: bookData.category_id || 0,
          listing_type: listingType as "Sale" | "Exchange" | "Donation",
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

  // Handle form submission
  async function onSubmit(values: z.infer<typeof formSchema>) {
    if (!user) {
      setError("You must be logged in to update a book")
      return
    }

    try {
      setIsSubmitting(true)
      setError(null)

      // Make sure user_id is set
      values.user_id = user.id

      // If listing type is not Sale, set price to null
      if (values.listing_type !== "Sale") {
        values.price = null
      }

      // Convert listing_type to match database format if needed
      let listingType = values.listing_type
      if (listingType === "Exchange") listingType = "swap" as any
      if (listingType === "Sale") listingType = "sale" as any
      if (listingType === "Donation") listingType = "donation" as any

      values.listing_type = listingType as any

      // Call the server action to update the book
      const result = await updateBook(params.id, values)

      if (!result.success) {
        throw new Error(result.error)
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
    return (
      <div className="space-y-6">
        <DashboardTitle title="Edit Book" description="Update your book listing" />
        <div className="flex items-center justify-center p-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </div>
    )
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
                            <Input placeholder="Enter ISBN" {...field} />
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
                            value={field.value}
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
                                  const value = e.target.value ? Number.parseFloat(e.target.value) : null
                                  field.onChange(value)
                                }}
                                value={field.value === null ? "" : field.value}
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
