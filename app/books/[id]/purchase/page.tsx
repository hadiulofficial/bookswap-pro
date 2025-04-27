"use client"

import type React from "react"

import { useState } from "react"
import { useParams, useRouter } from "next/navigation"
import Image from "next/image"
import { useAuth } from "@/contexts/auth-context"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { toast } from "@/components/ui/use-toast"
import { createOrder, type ShippingDetails } from "@/app/actions/order-actions"
import { supabase } from "@/lib/supabase/client"
import { Loader2, ArrowLeft, CreditCard, Package } from "lucide-react"

export default function PurchasePage() {
  const params = useParams()
  const router = useRouter()
  const { user } = useAuth()
  const bookId = params.id as string

  const [book, setBook] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [shippingDetails, setShippingDetails] = useState<ShippingDetails>({
    fullName: "",
    addressLine1: "",
    addressLine2: "",
    city: "",
    state: "",
    postalCode: "",
    country: "United States",
    phone: "",
  })

  // Fetch book details
  useState(() => {
    async function fetchBookDetails() {
      if (!bookId) return

      try {
        setLoading(true)
        const { data, error } = await supabase
          .from("books")
          .select("*, profiles(id, username, full_name)")
          .eq("id", bookId)
          .single()

        if (error) {
          throw error
        }

        setBook(data)
      } catch (error) {
        console.error("Error fetching book:", error)
        toast({
          title: "Error",
          description: "Failed to load book details",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }

    fetchBookDetails()
  }, [bookId])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setShippingDetails((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!user || !book) {
      toast({
        title: "Error",
        description: "You must be logged in to make a purchase",
        variant: "destructive",
      })
      return
    }

    setSubmitting(true)

    try {
      const result = await createOrder(user.id, bookId, book.owner_id, book.price, shippingDetails)

      if (result.success && result.checkoutUrl) {
        // Redirect to Stripe checkout
        window.location.href = result.checkoutUrl
      } else {
        throw new Error(result.error || "Failed to create order")
      }
    } catch (error) {
      console.error("Error creating order:", error)
      toast({
        title: "Error",
        description: "There was a problem processing your order",
        variant: "destructive",
      })
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-1 flex items-center justify-center">
          <div className="flex flex-col items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-emerald-600 mb-3" />
            <p className="text-gray-500 text-sm">Loading book details...</p>
          </div>
        </main>
        <Footer />
      </div>
    )
  }

  if (!book) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-1">
          <div className="max-w-4xl mx-auto px-4 py-12">
            <div className="text-center py-8">
              <h2 className="text-xl font-medium mb-2">Book not found</h2>
              <p className="text-gray-500 mb-4">The book you're looking for doesn't exist or has been removed.</p>
              <Button onClick={() => router.push("/books")}>Browse Books</Button>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 bg-gray-50 dark:bg-gray-900 py-8">
        <div className="max-w-4xl mx-auto px-4">
          {/* Back button */}
          <Button
            variant="ghost"
            size="sm"
            className="mb-6 pl-0 h-8 text-sm font-medium text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-200"
            onClick={() => router.push(`/books/${bookId}`)}
          >
            <ArrowLeft className="mr-1.5 h-3.5 w-3.5" /> Back to Book Details
          </Button>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Order summary - Left column */}
            <div className="md:col-span-1">
              <Card>
                <CardHeader>
                  <CardTitle>Order Summary</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Book details */}
                  <div className="flex items-start space-x-3">
                    <div className="relative h-16 w-12 flex-shrink-0 overflow-hidden rounded border border-gray-200">
                      {book.cover_image ? (
                        <Image
                          src={book.cover_image || "/placeholder.svg"}
                          alt={book.title}
                          fill
                          className="object-cover"
                          sizes="48px"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center bg-gray-100 text-gray-400">
                          <Package className="h-6 w-6" />
                        </div>
                      )}
                    </div>
                    <div>
                      <h3 className="font-medium text-sm">{book.title}</h3>
                      <p className="text-xs text-gray-500">By {book.author}</p>
                      <p className="text-xs text-gray-500">Condition: {book.condition}</p>
                    </div>
                  </div>

                  <Separator />

                  {/* Price breakdown */}
                  <div className="space-y-1">
                    <div className="flex justify-between text-sm">
                      <span>Book Price</span>
                      <span>${book.price?.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Shipping</span>
                      <span>Free</span>
                    </div>
                  </div>

                  <Separator />

                  {/* Total */}
                  <div className="flex justify-between font-medium">
                    <span>Total</span>
                    <span>${book.price?.toFixed(2)}</span>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Shipping form - Right column */}
            <div className="md:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle>Shipping Information</CardTitle>
                  <CardDescription>Enter your shipping details to continue with your purchase</CardDescription>
                </CardHeader>
                <form onSubmit={handleSubmit}>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="fullName">Full Name</Label>
                      <Input
                        id="fullName"
                        name="fullName"
                        value={shippingDetails.fullName}
                        onChange={handleInputChange}
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="addressLine1">Address Line 1</Label>
                      <Input
                        id="addressLine1"
                        name="addressLine1"
                        value={shippingDetails.addressLine1}
                        onChange={handleInputChange}
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="addressLine2">Address Line 2 (Optional)</Label>
                      <Input
                        id="addressLine2"
                        name="addressLine2"
                        value={shippingDetails.addressLine2}
                        onChange={handleInputChange}
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="city">City</Label>
                        <Input
                          id="city"
                          name="city"
                          value={shippingDetails.city}
                          onChange={handleInputChange}
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="state">State</Label>
                        <Input
                          id="state"
                          name="state"
                          value={shippingDetails.state}
                          onChange={handleInputChange}
                          required
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="postalCode">Postal Code</Label>
                        <Input
                          id="postalCode"
                          name="postalCode"
                          value={shippingDetails.postalCode}
                          onChange={handleInputChange}
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="country">Country</Label>
                        <Input
                          id="country"
                          name="country"
                          value={shippingDetails.country}
                          onChange={handleInputChange}
                          required
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="phone">Phone Number (Optional)</Label>
                      <Input
                        id="phone"
                        name="phone"
                        type="tel"
                        value={shippingDetails.phone}
                        onChange={handleInputChange}
                      />
                    </div>
                  </CardContent>
                  <CardFooter>
                    <Button type="submit" className="w-full" disabled={submitting}>
                      {submitting ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Processing...
                        </>
                      ) : (
                        <>
                          <CreditCard className="mr-2 h-4 w-4" /> Proceed to Payment
                        </>
                      )}
                    </Button>
                  </CardFooter>
                </form>
              </Card>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}
