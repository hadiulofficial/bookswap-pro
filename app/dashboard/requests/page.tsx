"use client"

import { useState, useEffect } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { updateRequestStatus } from "@/app/actions/book-request-actions"
import { useAuth } from "@/contexts/auth-context"
import { DashboardTitle } from "@/components/dashboard/title"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Loader2, CheckCircle, XCircle, Calendar, Clock, Book, RefreshCw } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { format } from "date-fns"
import { toast } from "@/components/ui/use-toast"
import { supabase } from "@/lib/supabase/client"

export default function RequestsPage() {
  const { user } = useAuth()
  const [incomingRequests, setIncomingRequests] = useState<any[]>([])
  const [outgoingRequests, setOutgoingRequests] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [actionLoading, setActionLoading] = useState<string | null>(null)

  useEffect(() => {
    if (user) {
      fetchRequests()
    }
  }, [user])

  const fetchRequests = async () => {
    if (!user) return

    setLoading(true)
    console.log("Fetching requests for user:", user.id)

    try {
      // Fetch incoming requests (requests for books you own)
      const { data: incomingData, error: incomingError } = await supabase
        .from("book_requests")
        .select(`
          id, 
          created_at,
          updated_at,
          status,
          message,
          book_id,
          user_id,
          owner_id,
          books:book_id (
            id, 
            title, 
            author, 
            cover_image, 
            listing_type
          ),
          profiles:user_id (
            id,
            username,
            full_name,
            avatar_url
          )
        `)
        .eq("owner_id", user.id)
        .order("created_at", { ascending: false })

      if (incomingError) {
        throw incomingError
      }

      // Fetch outgoing requests (requests you made for others' books)
      const { data: outgoingData, error: outgoingError } = await supabase
        .from("book_requests")
        .select(`
          id, 
          created_at,
          updated_at,
          status,
          message,
          book_id,
          user_id,
          owner_id,
          books:book_id (
            id, 
            title, 
            author, 
            cover_image, 
            listing_type
          ),
          profiles:owner_id (
            id,
            username,
            full_name,
            avatar_url
          )
        `)
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })

      if (outgoingError) {
        throw outgoingError
      }

      console.log("Incoming requests:", incomingData)
      console.log("Outgoing requests:", outgoingData)

      setIncomingRequests(incomingData || [])
      setOutgoingRequests(outgoingData || [])
    } catch (err: any) {
      console.error("Error fetching requests:", err)
      toast({
        title: "Error",
        description: err.message || "Failed to load requests",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleRefresh = async () => {
    if (!user || refreshing) return

    setRefreshing(true)
    await fetchRequests()
    setRefreshing(false)

    toast({
      title: "Refreshed",
      description: "Request list has been updated.",
    })
  }

  const handleApprove = async (requestId: string) => {
    if (!user) return

    setActionLoading(requestId)

    try {
      const result = await updateRequestStatus(requestId, "approved", user.id)

      if (result.success) {
        toast({
          title: "Request Approved",
          description: "The requester has been notified.",
        })
        fetchRequests() // Refresh the list
      } else {
        toast({
          title: "Action Failed",
          description: result.error || "Failed to approve request.",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error approving request:", error)
      toast({
        title: "Error",
        description: "An unexpected error occurred.",
        variant: "destructive",
      })
    } finally {
      setActionLoading(null)
    }
  }

  const handleReject = async (requestId: string) => {
    if (!user) return

    setActionLoading(requestId)

    try {
      const result = await updateRequestStatus(requestId, "rejected", user.id)

      if (result.success) {
        toast({
          title: "Request Rejected",
          description: "The requester has been notified.",
        })
        fetchRequests() // Refresh the list
      } else {
        toast({
          title: "Action Failed",
          description: result.error || "Failed to reject request.",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error rejecting request:", error)
      toast({
        title: "Error",
        description: "An unexpected error occurred.",
        variant: "destructive",
      })
    } finally {
      setActionLoading(null)
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return (
          <Badge variant="outline" className="bg-yellow-50">
            <Clock className="h-3 w-3 mr-1" /> Pending
          </Badge>
        )
      case "approved":
        return (
          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
            <CheckCircle className="h-3 w-3 mr-1" /> Approved
          </Badge>
        )
      case "rejected":
        return (
          <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">
            <XCircle className="h-3 w-3 mr-1" /> Rejected
          </Badge>
        )
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  // Helper function to safely access nested properties
  const safeGet = (obj: any, path: string, fallback: any = undefined) => {
    return path.split(".").reduce((prev, curr) => {
      return prev && prev[curr] !== undefined ? prev[curr] : fallback
    }, obj)
  }

  if (!user) {
    return (
      <div className="p-6">
        <DashboardTitle>Book Requests</DashboardTitle>
        <div className="text-center py-10">Please sign in to view your requests.</div>
      </div>
    )
  }

  return (
    <div className="p-4 md:p-6">
      <div className="flex justify-between items-center mb-6">
        <DashboardTitle>Book Requests</DashboardTitle>
        <Button
          variant="outline"
          size="sm"
          onClick={handleRefresh}
          disabled={refreshing || loading}
          className="flex items-center gap-1"
        >
          <RefreshCw className={`h-4 w-4 ${refreshing ? "animate-spin" : ""}`} />
          Refresh
        </Button>
      </div>

      <Tabs defaultValue="incoming" className="mt-6">
        <TabsList className="mb-4">
          <TabsTrigger value="incoming">
            Incoming Requests {incomingRequests.length > 0 && `(${incomingRequests.length})`}
          </TabsTrigger>
          <TabsTrigger value="outgoing">
            Your Requests {outgoingRequests.length > 0 && `(${outgoingRequests.length})`}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="incoming">
          {loading ? (
            <div className="flex justify-center items-center py-10">
              <Loader2 className="h-8 w-8 animate-spin text-emerald-500" />
            </div>
          ) : incomingRequests.length === 0 ? (
            <div className="text-center py-10 bg-gray-50 rounded-lg">
              <Book className="h-12 w-12 text-gray-400 mx-auto mb-3" />
              <h3 className="text-lg font-medium mb-1">No incoming requests</h3>
              <p className="text-gray-500 text-sm">When someone requests your donated books, they'll appear here.</p>
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {incomingRequests.map((request) => (
                <Card key={request.id} className="overflow-hidden">
                  <CardHeader className="pb-0">
                    <div className="flex justify-between items-start mb-2">
                      <Link href={`/books/${request.book_id}`}>
                        <CardTitle className="text-lg hover:text-emerald-600 hover:underline">
                          {safeGet(request, "books.title", "Book Title")}
                        </CardTitle>
                      </Link>
                      {getStatusBadge(request.status)}
                    </div>
                    <CardDescription>By {safeGet(request, "books.author", "Unknown Author")}</CardDescription>
                  </CardHeader>

                  <CardContent className="pt-4">
                    <div className="flex items-start gap-3 mb-3">
                      <div className="w-12 h-12 rounded-full overflow-hidden flex-shrink-0 bg-gray-100">
                        {safeGet(request, "profiles.avatar_url") ? (
                          <Image
                            src={safeGet(request, "profiles.avatar_url", "/placeholder.svg") || "/placeholder.svg"}
                            alt={safeGet(request, "profiles.username", "User")}
                            width={48}
                            height={48}
                            className="object-cover"
                          />
                        ) : (
                          <div className="w-12 h-12 flex items-center justify-center bg-emerald-100 text-emerald-800 text-sm font-medium">
                            {safeGet(request, "profiles.username", "User").substring(0, 2).toUpperCase()}
                          </div>
                        )}
                      </div>
                      <div>
                        <p className="font-medium">
                          {safeGet(request, "profiles.full_name") ||
                            safeGet(request, "profiles.username", "Anonymous User")}
                        </p>
                        <p className="text-sm text-gray-500 flex items-center">
                          <Calendar className="h-3 w-3 mr-1" />
                          {format(new Date(request.created_at), "MMM d, yyyy")}
                        </p>
                      </div>
                    </div>

                    <div className="bg-gray-50 p-3 rounded-md text-sm">
                      "{request.message || "I'd like to request this book."}"
                    </div>
                  </CardContent>

                  {request.status === "pending" && (
                    <CardFooter className="flex gap-2 border-t pt-4">
                      <Button
                        className="flex-1"
                        onClick={() => handleApprove(request.id)}
                        disabled={actionLoading === request.id}
                      >
                        {actionLoading === request.id ? (
                          <Loader2 className="h-4 w-4 animate-spin mr-2" />
                        ) : (
                          <CheckCircle className="h-4 w-4 mr-2" />
                        )}
                        Approve
                      </Button>
                      <Button
                        variant="outline"
                        className="flex-1"
                        onClick={() => handleReject(request.id)}
                        disabled={actionLoading === request.id}
                      >
                        <XCircle className="h-4 w-4 mr-2" />
                        Decline
                      </Button>
                    </CardFooter>
                  )}
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="outgoing">
          {loading ? (
            <div className="flex justify-center items-center py-10">
              <Loader2 className="h-8 w-8 animate-spin text-emerald-500" />
            </div>
          ) : outgoingRequests.length === 0 ? (
            <div className="text-center py-10 bg-gray-50 rounded-lg">
              <Book className="h-12 w-12 text-gray-400 mx-auto mb-3" />
              <h3 className="text-lg font-medium mb-1">No outgoing requests</h3>
              <p className="text-gray-500 text-sm">When you request donated books, they'll appear here.</p>
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {outgoingRequests.map((request) => (
                <Card key={request.id} className="overflow-hidden">
                  <CardHeader className="pb-3">
                    <div className="flex justify-between items-start mb-2">
                      <Link href={`/books/${request.book_id}`}>
                        <CardTitle className="text-lg hover:text-emerald-600 hover:underline">
                          {safeGet(request, "books.title", "Book Title")}
                        </CardTitle>
                      </Link>
                      {getStatusBadge(request.status)}
                    </div>
                    <CardDescription>By {safeGet(request, "books.author", "Unknown Author")}</CardDescription>
                  </CardHeader>

                  <CardContent>
                    <div className="flex items-center gap-3 mb-3">
                      <p className="text-sm">
                        <span className="font-medium">Request to:</span>{" "}
                        {safeGet(request, "profiles.full_name") ||
                          safeGet(request, "profiles.username", "Anonymous User")}
                      </p>
                    </div>

                    <div className="bg-gray-50 p-3 rounded-md text-sm">
                      <p className="text-xs text-gray-500 mb-1">Your message:</p>"
                      {request.message || "I'd like to request this book."}"
                    </div>

                    <p className="text-xs text-gray-500 mt-3 flex items-center">
                      <Calendar className="h-3 w-3 mr-1" />
                      Requested on {format(new Date(request.created_at), "MMMM d, yyyy")}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
