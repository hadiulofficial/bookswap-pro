"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { useAuth } from "@/contexts/auth-context"
import { DashboardTitle } from "@/components/dashboard/title"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { BookUpload } from "@/components/dashboard/book-upload"
import { Loader2, AlertCircle, ArrowLeft, BookPlus } from "lucide-react"
import { addBook, getCategories, type BookFormValues } from "@/app/actions/book-actions"

// Define the form schema with Zod
const bookFormSchema = z.object({
  title: z.string().min(1, "Title is required"),
  author: z.string().min(1, "Author is required"),
  isbn: z.string().optional(),
  description: z.string().optional(),
  // Update the condition enum to match database constraints
  condition: z.enum(["new", "like_new", "very_good", "good", "fair", "poor"], {
    required_error: "Please select a condition",
  }),
  category_id: z.coerce.number({
    required_error: "Please select a category",
  }),
  listing_type: z.enum(["sale", "swap", "donation"], {
    required_error: "Please select a listing type",
  }),
  price: z.coerce.number().min(0, "Price must be a positive number").optional().nullable(),
  cover_image: z.string().optional(),
  user_id: z.string().optional(), // Add user_id field
})

export default function NewBookPage() {
  const { user } = useAuth()
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [coverImageUrl, setCoverImageUrl] = useState<string | null>(null)
  const [categories, setCategories] = useState<{ id: number; name: string }[]>([])

  // Fetch categories on component mount
  useEffect(() => {
    const fetchCategories = async () => {
      const categoriesData = await getCategories()
      setCategories(categoriesData)
    }

    fetchCategories()
  }, [])

  // Initialize the form
  const form = useForm<BookFormValues>({
    resolver: zodResolver(bookFormSchema),
    defaultValues: {
      title: "",
      author: "",
      isbn: "",
      description: "",
      condition: "good", // This is a valid value in the database
      category_id: undefined,
      listing_type: "swap",
      price: null,
      cover_image: "",
      user_id: "", // Initialize user_id as empty
    },
  })

  // Set user_id when user is available
  useEffect(() => {
    if (user) {
      form.setValue("user_id", user.id)
    }
  }, [user, form])

  // Watch the listing type to conditionally show price field
  const listingType = form.watch("listing_type")

  // Handle image upload completion
  const handleImageUploaded = (url: string) => {
    setCoverImageUrl(url)
    form.setValue("cover_image", url)
  }

  // Form submission handler
  const onSubmit = async (data: BookFormValues) => {
    if (!user) {
      setError("You must be logged in to add a book")
      return
    }

    // Ensure user_id is set
    data.user_id = user.id

    setIsSubmitting(true)
    setError(null)

    try {
      console.log("Submitting book data:", data)
      const result = await addBook(data)

      if (!result.success) {
        throw new Error(result.error || "Failed to add book")
      }

      // Show success message and reset form
      setSuccess(true)
      form.reset()
      setCoverImageUrl(null)

      // Redirect after a short delay
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
            <TabsList>
              <TabsTrigger value="details">Book Details</TabsTrigger>
              <TabsTrigger value="listing">Listing Information</TabsTrigger>
              <TabsTrigger value="image">Cover Image</TabsTrigger>
            </TabsList>

            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                {error && (
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}

                <TabsContent value="details" className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField
                      control={form.control}
                      name="title"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Book Title*</FormLabel>
                          <FormControl>
                            <Input placeholder="Enter the book title" {...field} />
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
                          <FormLabel>Author*</FormLabel>
                          <FormControl>
                            <Input placeholder="Enter the author's name" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="isbn"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>ISBN</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter ISBN (optional)" {...field} />
                        </FormControl>
                        <FormDescription>
                          The International Standard Book Number (ISBN) helps identify your book
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Description</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Enter a brief description of the book (optional)"
                            className="min-h-32"
                            {...field}
                          />
                        </FormControl>
                        <FormDescription>
                          Include details about the book's content, themes, or any other relevant information
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField
                      control={form.control}
                      name="condition"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Condition*</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select condition" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {/* Update the values to match database constraints */}
                              <SelectItem value="new">New</SelectItem>
                              <SelectItem value="like_new">Like New</SelectItem>
                              <SelectItem value="very_good">Very Good</SelectItem>
                              <SelectItem value="good">Good</SelectItem>
                              <SelectItem value="fair">Fair</SelectItem>
                              <SelectItem value="poor">Poor</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormDescription>Select the condition that best describes your book</FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="category_id"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Category*</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value?.toString()}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select category" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {categories.map((category) => (
                                <SelectItem key={category.id} value={category.id.toString()}>
                                  {category.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormDescription>Choose the category that best fits your book</FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </TabsContent>

                <TabsContent value="listing" className="space-y-6">
                  <FormField
                    control={form.control}
                    name="listing_type"
                    render={({ field }) => (
                      <FormItem className="space-y-3">
                        <FormLabel>Listing Type*</FormLabel>
                        <FormControl>
                          <RadioGroup
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                            className="flex flex-col space-y-1"
                          >
                            <FormItem className="flex items-center space-x-3 space-y-0">
                              <FormControl>
                                <RadioGroupItem value="sale" />
                              </FormControl>
                              <FormLabel className="font-normal">For Sale</FormLabel>
                            </FormItem>
                            <FormItem className="flex items-center space-x-3 space-y-0">
                              <FormControl>
                                <RadioGroupItem value="swap" />
                              </FormControl>
                              <FormLabel className="font-normal">For Swap</FormLabel>
                            </FormItem>
                            <FormItem className="flex items-center space-x-3 space-y-0">
                              <FormControl>
                                <RadioGroupItem value="donation" />
                              </FormControl>
                              <FormLabel className="font-normal">For Donation</FormLabel>
                            </FormItem>
                          </RadioGroup>
                        </FormControl>
                        <FormDescription>Select whether you want to sell, swap, or donate this book</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {listingType === "sale" && (
                    <FormField
                      control={form.control}
                      name="price"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Price*</FormLabel>
                          <FormControl>
                            <div className="relative">
                              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">$</span>
                              <Input
                                type="number"
                                step="0.01"
                                min="0"
                                placeholder="0.00"
                                className="pl-8"
                                {...field}
                                onChange={(e) => {
                                  const value = e.target.value === "" ? null : Number.parseFloat(e.target.value)
                                  field.onChange(value)
                                }}
                                value={field.value === null ? "" : field.value}
                              />
                            </div>
                          </FormControl>
                          <FormDescription>Enter the price you want to sell this book for</FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  )}
                </TabsContent>

                <TabsContent value="image" className="space-y-6">
                  <FormField
                    control={form.control}
                    name="cover_image"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Cover Image</FormLabel>
                        <FormControl>
                          <BookUpload
                            onImageUploaded={handleImageUploaded}
                            existingImageUrl={coverImageUrl}
                            {...field}
                          />
                        </FormControl>
                        <FormDescription>
                          Upload a cover image for your book. This will help attract more interest.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </TabsContent>

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
            </Form>
          </Tabs>
        </Card>
      )}
    </div>
  )
}
