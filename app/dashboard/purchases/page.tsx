"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { Loader2, Package, ShoppingBag } from "lucide-react"
import { format } from "date-fns"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { useAuth } from "@/contexts/auth-context"

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

      <div className="grid gap-6">
        {orders.map((order) => (
          <Card key={order.id} className="overflow-hidden">
            <CardHeader className="bg-muted/50 pb-4">
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-lg">Order #{order.id.substring(0, 8)}</CardTitle>
                  <CardDescription>Placed on {format(new Date(order.created_at), "MMMM d, yyyy")}</CardDescription>
                </div>
                {getStatusBadge(order.status)}
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <div className="p-6 flex items-center space-x-4">
                <div className="flex-shrink-0 h-24 w-16 bg-gray-100 rounded overflow-hidden">
                  {order.books.cover_image ? (
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
                  <h4 className="text-base font-medium truncate">{order.books.title}</h4>
                  <p className="text-sm text-gray-500">By {order.books.author}</p>
                  <div className="mt-2 flex items-center">
                    <span className="font-medium">${Number.parseFloat(order.amount).toFixed(2)}</span>
                  </div>
                </div>
              </div>

              <Separator />

              <div className="p-6">
                <h4 className="font-medium mb-2">Shipping Details</h4>
                <div className="text-sm text-gray-600 space-y-1">
                  <p>{order.shipping_details.full_name}</p>
                  <p>{order.shipping_details.address_line1}</p>
                  {order.shipping_details.address_line2 && <p>{order.shipping_details.address_line2}</p>}
                  <p>
                    {order.shipping_details.city}, {order.shipping_details.state} {order.shipping_details.postal_code}
                  </p>
                  <p>{order.shipping_details.country}</p>
                  {order.shipping_details.phone && <p>Phone: {order.shipping_details.phone}</p>}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
