"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { format } from "date-fns"
import {
  Loader2,
  Package,
  ShoppingBag,
  Clock,
  CheckCircle,
  Truck,
  XCircle,
  ChevronRight,
  Calendar,
  MapPin,
} from "lucide-react"

import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { useAuth } from "@/contexts/auth-context"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export default function PurchasesPage() {
  const { user } = useAuth()
  const router = useRouter()
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const supabase = createClientComponentClient()

  useEffect(() => {
    async function fetchOrders() {
      if (!user?.id) return

      try {
        const { data, error } = await supabase
          .from("orders")
          .select(`
            *,
            books (*),
            shipping_details (*)
          `)
          .eq("user_id", user.id)
          .order("created_at", { ascending: false })

        if (error) {
          console.error("Error fetching orders:", error)
          return
        }

        setOrders(data || [])
      } catch (error) {
        console.error("Error in fetchOrders:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchOrders()
  }, [user, supabase])

  const getStatusIcon = (status) => {
    switch (status) {
      case "pending":
        return <Clock className="h-5 w-5 text-yellow-500" />
      case "processing":
        return <Clock className="h-5 w-5 text-blue-500" />
      case "shipped":
        return <Truck className="h-5 w-5 text-purple-500" />
      case "delivered":
        return <CheckCircle className="h-5 w-5 text-green-500" />
      case "cancelled":
        return <XCircle className="h-5 w-5 text-red-500" />
      default:
        return <Clock className="h-5 w-5 text-gray-500" />
    }
  }

  const getStatusBadge = (status) => {
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

  const getStatusText = (status) => {
    switch (status) {
      case "pending":
        return "Your order is being processed"
      case "processing":
        return "Your order is being prepared for shipping"
      case "shipped":
        return "Your order is on its way"
      case "delivered":
        return "Your order has been delivered"
      case "cancelled":
        return "Your order has been cancelled"
      default:
        return "Order status unknown"
    }
  }

  const activeOrders = orders.filter((order) => ["pending", "processing", "shipped"].includes(order.status))

  const completedOrders = orders.filter((order) => ["delivered", "cancelled"].includes(order.status))

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  if (orders.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] text-center p-4">
        <ShoppingBag className="h-12 w-12 text-gray-400 mb-4" />
        <h3 className="text-xl font-semibold mb-2">No purchases yet</h3>
        <p className="text-gray-500 mb-6 max-w-md">
          You haven't made any purchases yet. Browse our collection of books to find something you like.
        </p>
        <Button onClick={() => router.push("/books")}>Browse Books</Button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">My Purchases</h2>
        <p className="text-muted-foreground">View and manage your book purchases.</p>
      </div>

      <Tabs defaultValue="active" className="w-full">
        <TabsList className="grid w-full grid-cols-2 mb-6">
          <TabsTrigger value="active">
            Active Orders{" "}
            {activeOrders.length > 0 && (
              <span className="ml-1 text-xs bg-primary text-white rounded-full w-5 h-5 inline-flex items-center justify-center">
                {activeOrders.length}
              </span>
            )}
          </TabsTrigger>
          <TabsTrigger value="completed">Completed Orders</TabsTrigger>
        </TabsList>

        <TabsContent value="active" className="space-y-4">
          {activeOrders.length === 0 ? (
            <div className="bg-muted/30 rounded-lg p-8 text-center">
              <Truck className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">No active orders</h3>
              <p className="text-muted-foreground">You don't have any active orders at the moment.</p>
            </div>
          ) : (
            activeOrders.map((order) => (
              <Card key={order.id} className="overflow-hidden hover:shadow-md transition-shadow">
                <CardContent className="p-0">
                  <div className="p-4 md:p-6 flex flex-col md:flex-row md:items-center gap-4 md:gap-6">
                    <div className="flex-shrink-0 h-24 w-16 bg-gray-100 rounded overflow-hidden">
                      {order.books?.cover_image ? (
                        <img
                          src={order.books.cover_image || "/placeholder.svg"}
                          alt={order.books.title}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <div className="h-full w-full flex items-center justify-center">
                          <Package className="h-8 w-8 text-gray-400" />
                        </div>
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2">
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="text-base font-medium truncate">{order.books?.title}</h4>
                            {getStatusBadge(order.status)}
                          </div>
                          <p className="text-sm text-gray-500">By {order.books?.author}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-medium">${Number.parseFloat(order.amount).toFixed(2)}</p>
                        </div>
                      </div>

                      <div className="mt-3 flex flex-col sm:flex-row sm:items-center gap-3 text-sm">
                        <div className="flex items-center gap-1.5 text-muted-foreground">
                          <Calendar className="h-4 w-4" />
                          <span>Ordered on {format(new Date(order.created_at), "MMM d, yyyy")}</span>
                        </div>
                        <div className="hidden sm:block text-muted-foreground">•</div>
                        <div className="flex items-center gap-1.5">
                          {getStatusIcon(order.status)}
                          <span className="font-medium">{getStatusText(order.status)}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <Separator />

                  <div className="p-4 md:p-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div className="flex items-start gap-2">
                      <MapPin className="h-4 w-4 text-muted-foreground mt-0.5" />
                      <div className="text-sm text-muted-foreground">
                        <p className="font-medium text-foreground">{order.shipping_details?.full_name}</p>
                        <p>{order.shipping_details?.address_line1}</p>
                        <p>
                          {order.shipping_details?.city}, {order.shipping_details?.state}{" "}
                          {order.shipping_details?.postal_code}
                        </p>
                      </div>
                    </div>

                    <Button
                      variant="outline"
                      className="sm:self-end flex items-center gap-1"
                      onClick={() => {
                        // Future implementation: view order details
                        console.log("View order details", order.id)
                      }}
                    >
                      Track Order
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>

        <TabsContent value="completed" className="space-y-4">
          {completedOrders.length === 0 ? (
            <div className="bg-muted/30 rounded-lg p-8 text-center">
              <CheckCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">No completed orders</h3>
              <p className="text-muted-foreground">You don't have any completed orders yet.</p>
            </div>
          ) : (
            completedOrders.map((order) => (
              <Card key={order.id} className="overflow-hidden hover:shadow-md transition-shadow">
                <CardContent className="p-0">
                  <div className="p-4 md:p-6 flex flex-col md:flex-row md:items-center gap-4 md:gap-6">
                    <div className="flex-shrink-0 h-24 w-16 bg-gray-100 rounded overflow-hidden">
                      {order.books?.cover_image ? (
                        <img
                          src={order.books.cover_image || "/placeholder.svg"}
                          alt={order.books.title}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <div className="h-full w-full flex items-center justify-center">
                          <Package className="h-8 w-8 text-gray-400" />
                        </div>
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2">
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="text-base font-medium truncate">{order.books?.title}</h4>
                            {getStatusBadge(order.status)}
                          </div>
                          <p className="text-sm text-gray-500">By {order.books?.author}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-medium">${Number.parseFloat(order.amount).toFixed(2)}</p>
                        </div>
                      </div>

                      <div className="mt-3 flex flex-col sm:flex-row sm:items-center gap-3 text-sm">
                        <div className="flex items-center gap-1.5 text-muted-foreground">
                          <Calendar className="h-4 w-4" />
                          <span>Ordered on {format(new Date(order.created_at), "MMM d, yyyy")}</span>
                        </div>
                        <div className="hidden sm:block text-muted-foreground">•</div>
                        <div className="flex items-center gap-1.5">
                          {getStatusIcon(order.status)}
                          <span className="font-medium">{getStatusText(order.status)}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <Separator />

                  <div className="p-4 md:p-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div className="flex items-start gap-2">
                      <MapPin className="h-4 w-4 text-muted-foreground mt-0.5" />
                      <div className="text-sm text-muted-foreground">
                        <p className="font-medium text-foreground">{order.shipping_details?.full_name}</p>
                        <p>{order.shipping_details?.address_line1}</p>
                        <p>
                          {order.shipping_details?.city}, {order.shipping_details?.state}{" "}
                          {order.shipping_details?.postal_code}
                        </p>
                      </div>
                    </div>

                    <Button
                      variant="outline"
                      className="sm:self-end flex items-center gap-1"
                      onClick={() => {
                        // Future implementation: view order details
                        console.log("View order details", order.id)
                      }}
                    >
                      View Details
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
