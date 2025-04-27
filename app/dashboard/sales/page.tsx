"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { MapPin, Package, User, Calendar, ArrowRight, ShoppingBag, ExternalLink } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Shell, ShellContent, ShellHeader, ShellTitle, ShellDescription } from "@/components/ui/shell"
import { Skeleton } from "@/components/ui/skeleton"

export default function SalesPage() {
  const [sales, setSales] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const supabase = createClientComponentClient()

  useEffect(() => {
    async function fetchSales() {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser()

        if (!user) {
          setSales([])
          setLoading(false)
          return
        }

        // Fetch orders where the seller is the current user
        const { data: orders, error: ordersError } = await supabase
          .from("orders")
          .select(`
            *,
            books(*),
            buyer:user_id(id, email, profiles(*))
          `)
          .eq("seller_id", user.id)
          .order("created_at", { ascending: false })

        if (ordersError) {
          console.error("Error fetching sales:", ordersError)
          setSales([])
        } else {
          // Fetch shipping details for each order
          if (orders && orders.length > 0) {
            const ordersWithShipping = await Promise.all(
              orders.map(async (order) => {
                const { data: shippingData } = await supabase
                  .from("shipping_details")
                  .select("*")
                  .eq("order_id", order.id)
                  .single()

                return {
                  ...order,
                  shipping_details: shippingData,
                }
              }),
            )
            setSales(ordersWithShipping || [])
          } else {
            setSales([])
          }
        }
      } catch (error) {
        console.error("Error in fetchSales:", error)
        setSales([])
      } finally {
        setLoading(false)
      }
    }

    fetchSales()
  }, [supabase])

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return (
          <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">
            Pending
          </Badge>
        )
      case "processing":
        return (
          <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
            Processing
          </Badge>
        )
      case "shipped":
        return (
          <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200">
            Shipped
          </Badge>
        )
      case "delivered":
        return (
          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
            Delivered
          </Badge>
        )
      case "cancelled":
        return (
          <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">
            Cancelled
          </Badge>
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

  if (loading) {
    return (
      <div className="container mx-auto py-10">
        <h1 className="text-3xl font-bold mb-6">Your Sales</h1>
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
            <ShoppingBag className="h-6 w-6" />
            Your Sales
          </ShellTitle>
          <ShellDescription>Manage and track your book sales</ShellDescription>
        </ShellHeader>
        <ShellContent>
          {sales.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="rounded-full bg-muted p-3 mb-4">
                <Package className="h-10 w-10 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-semibold mb-2">No sales yet</h3>
              <p className="text-muted-foreground max-w-sm mb-6">
                When someone purchases your books, they will appear here.
              </p>
              <Button asChild>
                <Link href="/dashboard/books">Manage Your Books</Link>
              </Button>
            </div>
          ) : (
            <div className="grid gap-6">
              {sales.map((sale) => (
                <Card key={sale.id} className="overflow-hidden transition-all duration-200 hover:shadow-md">
                  <CardHeader className="pb-2">
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="text-lg">Order #{sale.id.substring(0, 8)}</CardTitle>
                        <CardDescription className="flex items-center gap-1">
                          <Calendar className="h-3.5 w-3.5" />
                          {formatDate(sale.created_at)}
                        </CardDescription>
                      </div>
                      {getStatusBadge(sale.status)}
                    </div>
                  </CardHeader>
                  <CardContent className="pb-2">
                    <div className="flex flex-col md:flex-row gap-6">
                      <div className="relative h-32 w-24 overflow-hidden rounded-md border">
                        {sale.books?.cover_image ? (
                          <Image
                            src={sale.books.cover_image || "/placeholder.svg"}
                            alt={sale.books.title}
                            fill
                            className="object-cover transition-transform duration-300 hover:scale-105"
                            sizes="(max-width: 768px) 100vw, 200px"
                          />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center bg-muted">
                            <Package className="h-8 w-8 text-muted-foreground" />
                          </div>
                        )}
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-lg mb-1">{sale.books?.title}</h3>
                        <p className="text-muted-foreground text-sm mb-3">{sale.books?.author}</p>
                        <p className="font-medium">${sale.amount.toFixed(2)}</p>
                      </div>

                      <div className="w-full md:w-1/3 space-y-4">
                        {/* Buyer Information */}
                        <div className="bg-muted/30 p-3 rounded-lg">
                          <h4 className="text-sm font-medium flex items-center gap-1.5 mb-2">
                            <User className="h-4 w-4" />
                            Buyer Information
                          </h4>
                          <div className="text-sm">
                            <Link
                              href={`/users/${sale.buyer_id}`}
                              className="flex items-center gap-1 text-primary hover:underline mb-1"
                            >
                              {sale.buyer?.profiles[0]?.full_name ||
                                sale.buyer?.profiles[0]?.username ||
                                sale.buyer?.email}
                              <ExternalLink className="h-3 w-3" />
                            </Link>
                            <p className="text-muted-foreground text-xs">{sale.buyer?.email}</p>
                          </div>
                        </div>

                        {/* Shipping Address */}
                        {sale.shipping_details && (
                          <div className="bg-muted/30 p-3 rounded-lg">
                            <h4 className="text-sm font-medium flex items-center gap-1.5 mb-2">
                              <MapPin className="h-4 w-4" />
                              Shipping Address
                            </h4>
                            <div className="text-sm">
                              <p>{sale.shipping_details.full_name}</p>
                              <p>{sale.shipping_details.address_line1}</p>
                              {sale.shipping_details.address_line2 && <p>{sale.shipping_details.address_line2}</p>}
                              <p>
                                {sale.shipping_details.city}, {sale.shipping_details.state}{" "}
                                {sale.shipping_details.postal_code}
                              </p>
                              <p>{sale.shipping_details.country}</p>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter className="flex justify-end pt-4">
                    <Button
                      variant={sale.status === "pending" ? "default" : "outline"}
                      onClick={() => {
                        // Update order status logic would go here
                        console.log("Update status for order:", sale.id)
                      }}
                      className="group"
                    >
                      {sale.status === "pending" ? "Process Order" : "Update Status"}
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
