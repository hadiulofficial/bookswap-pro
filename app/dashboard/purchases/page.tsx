"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { Package, Calendar, ArrowRight, ShoppingCart, ExternalLink, Truck, Clock } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Shell, ShellContent, ShellHeader, ShellTitle, ShellDescription } from "@/components/ui/shell"
import { Skeleton } from "@/components/ui/skeleton"

export default function PurchasesPage() {
  const [purchases, setPurchases] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const supabase = createClientComponentClient()

  useEffect(() => {
    async function fetchPurchases() {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser()

        if (!user) {
          setPurchases([])
          setLoading(false)
          return
        }

        // Fetch orders where the buyer is the current user
        const { data: orders, error: ordersError } = await supabase
          .from("orders")
          .select(`
            *,
            books:book_id(*),
            shipping_details:shipping_detail_id(*),
            seller:seller_id(id, email, profiles:id(full_name, username))
          `)
          .eq("buyer_id", user.id)
          .order("created_at", { ascending: false })

        if (ordersError) {
          console.error("Error fetching purchases:", ordersError)
          setPurchases([])
        } else {
          setPurchases(orders || [])
        }
      } catch (error) {
        console.error("Error in fetchPurchases:", error)
        setPurchases([])
      } finally {
        setLoading(false)
      }
    }

    fetchPurchases()
  }, [supabase])

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return (
          <div className="flex items-center gap-1.5">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-yellow-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-yellow-500"></span>
            </span>
            <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">
              Pending
            </Badge>
          </div>
        )
      case "processing":
        return (
          <div className="flex items-center gap-1.5">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-blue-500"></span>
            </span>
            <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
              Processing
            </Badge>
          </div>
        )
      case "shipped":
        return (
          <div className="flex items-center gap-1.5">
            <Truck className="h-3.5 w-3.5 text-purple-600" />
            <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200">
              Shipped
            </Badge>
          </div>
        )
      case "delivered":
        return (
          <div className="flex items-center gap-1.5">
            <Package className="h-3.5 w-3.5 text-green-600" />
            <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
              Delivered
            </Badge>
          </div>
        )
      case "cancelled":
        return (
          <div className="flex items-center gap-1.5">
            <svg className="h-3.5 w-3.5 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
            <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">
              Cancelled
            </Badge>
          </div>
        )
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return new Intl.DateTimeFormat("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    }).format(date)
  }

  const getEstimatedDelivery = (status: string, createdAt: string) => {
    if (status === "delivered") {
      return "Delivered"
    }

    if (status === "cancelled") {
      return "Cancelled"
    }

    // Add 7-10 days to the order date
    const orderDate = new Date(createdAt)
    const minDelivery = new Date(orderDate)
    minDelivery.setDate(orderDate.getDate() + 7)

    const maxDelivery = new Date(orderDate)
    maxDelivery.setDate(orderDate.getDate() + 10)

    const formatOptions: Intl.DateTimeFormatOptions = { month: "short", day: "numeric" }
    return `Est. ${minDelivery.toLocaleDateString("en-US", formatOptions)} - ${maxDelivery.toLocaleDateString("en-US", formatOptions)}`
  }

  if (loading) {
    return (
      <div className="container mx-auto py-10">
        <h1 className="text-3xl font-bold mb-6">Your Purchases</h1>
        <div className="grid gap-6">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="overflow-hidden">
              <CardHeader className="pb-0">
                <Skeleton className="h-6 w-1/3 mb-2" />
                <Skeleton className="h-4 w-1/4" />
              </CardHeader>
              <CardContent className="pb-0">
                <div className="flex flex-col md:flex-row gap-6">
                  <Skeleton className="h-32 w-24 rounded-md" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-2/3" />
                    <Skeleton className="h-4 w-1/2" />
                    <Skeleton className="h-4 w-1/4" />
                  </div>
                  <div className="w-full md:w-1/3 space-y-2">
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-2/3" />
                  </div>
                </div>
              </CardContent>
              <CardFooter className="flex justify-end pt-4">
                <Skeleton className="h-9 w-28" />
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-10">
      <Shell>
        <ShellHeader>
          <ShellTitle className="flex items-center gap-2">
            <ShoppingCart className="h-6 w-6" />
            Your Purchases
          </ShellTitle>
          <ShellDescription>Track and manage your book orders</ShellDescription>
        </ShellHeader>
        <ShellContent>
          {purchases.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="rounded-full bg-muted p-3 mb-4">
                <ShoppingCart className="h-10 w-10 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-semibold mb-2">No purchases yet</h3>
              <p className="text-muted-foreground max-w-sm mb-6">
                When you purchase books, they will appear here for tracking.
              </p>
              <Button asChild>
                <Link href="/books">Browse Books</Link>
              </Button>
            </div>
          ) : (
            <div className="grid gap-6">
              {purchases.map((purchase) => (
                <Card key={purchase.id} className="overflow-hidden transition-all duration-200 hover:shadow-md">
                  <CardHeader className="pb-2">
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="text-lg">Order #{purchase.id.substring(0, 8)}</CardTitle>
                        <CardDescription className="flex items-center gap-1">
                          <Calendar className="h-3.5 w-3.5" />
                          {formatDate(purchase.created_at)}
                        </CardDescription>
                      </div>
                      {getStatusBadge(purchase.status)}
                    </div>
                  </CardHeader>
                  <CardContent className="pb-2">
                    <div className="flex flex-col md:flex-row gap-6">
                      <div className="relative h-32 w-24 overflow-hidden rounded-md border group">
                        {purchase.books?.cover_image ? (
                          <Image
                            src={purchase.books.cover_image || "/placeholder.svg"}
                            alt={purchase.books.title}
                            fill
                            className="object-cover transition-transform duration-300 group-hover:scale-105"
                            sizes="(max-width: 768px) 100vw, 200px"
                          />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center bg-muted">
                            <Package className="h-8 w-8 text-muted-foreground" />
                          </div>
                        )}
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-lg mb-1">{purchase.books?.title}</h3>
                        <p className="text-muted-foreground text-sm mb-3">{purchase.books?.author}</p>
                        <p className="font-medium">${purchase.amount.toFixed(2)}</p>

                        <div className="mt-3 flex items-center gap-1.5 text-sm text-muted-foreground">
                          <Link
                            href={`/users/${purchase.seller_id}`}
                            className="flex items-center gap-1 text-primary hover:underline"
                          >
                            Sold by:{" "}
                            {purchase.seller?.profiles?.full_name ||
                              purchase.seller?.profiles?.username ||
                              purchase.seller?.email}
                            <ExternalLink className="h-3 w-3" />
                          </Link>
                        </div>
                      </div>

                      <div className="w-full md:w-1/3">
                        <div className="bg-muted/30 p-3 rounded-lg mb-3">
                          <div className="flex items-center gap-1.5 mb-2">
                            <Clock className="h-4 w-4 text-muted-foreground" />
                            <span className="text-sm font-medium">Delivery Status</span>
                          </div>
                          <div className="space-y-1">
                            <div className="flex justify-between text-sm">
                              <span>Status:</span>
                              <span className="font-medium capitalize">{purchase.status}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                              <span>Delivery:</span>
                              <span>{getEstimatedDelivery(purchase.status, purchase.created_at)}</span>
                            </div>
                          </div>
                        </div>

                        {purchase.shipping_details && (
                          <div className="text-sm text-muted-foreground">
                            <p>
                              Shipping to: {purchase.shipping_details.city}, {purchase.shipping_details.state}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter className="flex justify-end pt-4">
                    <Button
                      variant="outline"
                      className="group"
                      onClick={() => {
                        // Track order logic would go here
                        console.log("Track order:", purchase.id)
                      }}
                    >
                      Track Order
                      <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          )}
        </ShellContent>
      </Shell>
    </div>
  )
}
