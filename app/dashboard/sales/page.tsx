"use client"

import { useEffect, useState } from "react"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { format } from "date-fns"
import { Loader2, Package, Clock, CheckCircle, Truck, XCircle, Calendar, MapPin, DollarSign } from "lucide-react"

import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { useAuth } from "@/contexts/auth-context"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { toast } from "@/components/ui/use-toast"
import { updateOrderStatus } from "@/app/actions/order-actions"

export default function SalesPage() {
  const { user } = useAuth()
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedOrder, setSelectedOrder] = useState(null)
  const [isUpdateDialogOpen, setIsUpdateDialogOpen] = useState(false)
  const [isUpdating, setIsUpdating] = useState(false)
  const [newStatus, setNewStatus] = useState("")
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
          .eq("seller_id", user.id)
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

  const handleUpdateStatus = async () => {
    if (!selectedOrder || !newStatus) return

    setIsUpdating(true)

    try {
      const result = await updateOrderStatus(selectedOrder.id, newStatus)

      if (result.success) {
        // Update the local state
        setOrders(orders.map((order) => (order.id === selectedOrder.id ? { ...order, status: newStatus } : order)))

        toast({
          title: "Order updated",
          description: `Order status has been updated to ${newStatus}`,
          variant: "default",
        })

        setIsUpdateDialogOpen(false)
      } else {
        toast({
          title: "Update failed",
          description: result.error || "Failed to update order status",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error updating order status:", error)
      toast({
        title: "Update failed",
        description: "An unexpected error occurred",
        variant: "destructive",
      })
    } finally {
      setIsUpdating(false)
    }
  }

  const openUpdateDialog = (order) => {
    setSelectedOrder(order)
    setNewStatus(order.status)
    setIsUpdateDialogOpen(true)
  }

  const pendingOrders = orders.filter((order) => ["pending", "processing"].includes(order.status))
  const shippedOrders = orders.filter((order) => ["shipped"].includes(order.status))
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
        <DollarSign className="h-12 w-12 text-gray-400 mb-4" />
        <h3 className="text-xl font-semibold mb-2">No sales yet</h3>
        <p className="text-gray-500 mb-6 max-w-md">
          You haven't sold any books yet. Continue listing books for sale to attract buyers.
        </p>
        <Button onClick={() => (window.location.href = "/dashboard/books/new")}>List a Book</Button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">My Sales</h2>
        <p className="text-muted-foreground">Manage orders for books you've sold.</p>
      </div>

      <Tabs defaultValue="pending" className="w-full">
        <TabsList className="grid w-full grid-cols-3 mb-6">
          <TabsTrigger value="pending">
            Pending{" "}
            {pendingOrders.length > 0 && (
              <span className="ml-1 text-xs bg-primary text-white rounded-full w-5 h-5 inline-flex items-center justify-center">
                {pendingOrders.length}
              </span>
            )}
          </TabsTrigger>
          <TabsTrigger value="shipped">
            Shipped{" "}
            {shippedOrders.length > 0 && (
              <span className="ml-1 text-xs bg-primary text-white rounded-full w-5 h-5 inline-flex items-center justify-center">
                {shippedOrders.length}
              </span>
            )}
          </TabsTrigger>
          <TabsTrigger value="completed">Completed</TabsTrigger>
        </TabsList>

        <TabsContent value="pending" className="space-y-4">
          {pendingOrders.length === 0 ? (
            <div className="bg-muted/30 rounded-lg p-8 text-center">
              <Clock className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">No pending orders</h3>
              <p className="text-muted-foreground">You don't have any pending orders to process.</p>
            </div>
          ) : (
            pendingOrders.map((order) => (
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
                          <span className="font-medium">
                            {order.status === "pending" ? "Awaiting processing" : "Being processed"}
                          </span>
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
                        {order.shipping_details?.address_line2 && <p>{order.shipping_details?.address_line2}</p>}
                        <p>
                          {order.shipping_details?.city}, {order.shipping_details?.state}{" "}
                          {order.shipping_details?.postal_code}
                        </p>
                        <p>{order.shipping_details?.country}</p>
                        {order.shipping_details?.phone && <p>Phone: {order.shipping_details?.phone}</p>}
                      </div>
                    </div>

                    <Button className="sm:self-end" onClick={() => openUpdateDialog(order)}>
                      Update Status
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>

        <TabsContent value="shipped" className="space-y-4">
          {shippedOrders.length === 0 ? (
            <div className="bg-muted/30 rounded-lg p-8 text-center">
              <Truck className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">No shipped orders</h3>
              <p className="text-muted-foreground">You don't have any orders currently being shipped.</p>
            </div>
          ) : (
            shippedOrders.map((order) => (
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
                          <span className="font-medium">In transit to buyer</span>
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
                        {order.shipping_details?.address_line2 && <p>{order.shipping_details?.address_line2}</p>}
                        <p>
                          {order.shipping_details?.city}, {order.shipping_details?.state}{" "}
                          {order.shipping_details?.postal_code}
                        </p>
                        <p>{order.shipping_details?.country}</p>
                        {order.shipping_details?.phone && <p>Phone: {order.shipping_details?.phone}</p>}
                      </div>
                    </div>

                    <Button className="sm:self-end" onClick={() => openUpdateDialog(order)}>
                      Update Status
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
                          <span className="font-medium">
                            {order.status === "delivered" ? "Successfully delivered" : "Order cancelled"}
                          </span>
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
                        {order.shipping_details?.address_line2 && <p>{order.shipping_details?.address_line2}</p>}
                        <p>
                          {order.shipping_details?.city}, {order.shipping_details?.state}{" "}
                          {order.shipping_details?.postal_code}
                        </p>
                        <p>{order.shipping_details?.country}</p>
                        {order.shipping_details?.phone && <p>Phone: {order.shipping_details?.phone}</p>}
                      </div>
                    </div>

                    <Button
                      variant="outline"
                      className="sm:self-end"
                      onClick={() => {
                        // Future implementation: view order details
                        console.log("View order details", order.id)
                      }}
                    >
                      View Details
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>
      </Tabs>

      <Dialog open={isUpdateDialogOpen} onOpenChange={setIsUpdateDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Update Order Status</DialogTitle>
            <DialogDescription>
              Change the status of this order to keep your buyer informed about their purchase.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <p className="text-sm font-medium">Current Status: {selectedOrder?.status}</p>

              <Select value={newStatus} onValueChange={setNewStatus}>
                <SelectTrigger>
                  <SelectValue placeholder="Select new status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="processing">Processing</SelectItem>
                  <SelectItem value="shipped">Shipped</SelectItem>
                  <SelectItem value="delivered">Delivered</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsUpdateDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleUpdateStatus} disabled={isUpdating || newStatus === selectedOrder?.status}>
              {isUpdating ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Updating...
                </>
              ) : (
                "Update Status"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
