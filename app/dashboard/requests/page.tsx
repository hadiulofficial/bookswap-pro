"use client"

import { useState, useEffect } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { updateRequestStatus } from "@/app/actions/book-request-actions"
import { useAuth } from "@/contexts/auth-context"
import { DashboardTitle } from "@/components/dashboard/title"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  Loader2,
  CheckCircle,
  XCircle,
  Calendar,
  Clock,
  Book,
  RefreshCw,
  MessageCircle,
  User,
  BookOpen,
  AlertCircle,
  ArrowRight,
} from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { format } from "date-fns"
import { toast } from "@/components/ui/use-toast"
import { supabase } from "@/lib/supabase/client"
import { Skeleton } from "@/components/ui/skeleton"

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
      // Step 1: Get all incoming requests (where you are the owner)
      const { data: incomingRequestsRaw, error: incomingError } = await supabase
        .from("book_requests")
        .select("*")
        .eq("owner_id", user.id)
        .order("created_at", { ascending: false })

      if (incomingError) {
        console.error("Error fetching incoming requests:", incomingError)
        throw incomingError
      }

      // Step 2: Get all outgoing requests (where you are the requester)
      const { data: outgoingRequestsRaw, error: outgoingError } = await supabase
        .from("book_requests")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })

      if (outgoingError) {
        console.error("Error fetching outgoing requests:", outgoingError)
        throw outgoingError
      }

      console.log("Raw incoming requests:", incomingRequestsRaw)
      console.log("Raw outgoing requests:", outgoingRequestsRaw)

      // Step 3: Enrich incoming requests with book and user details
      const enrichedIncoming = await Promise.all(
        (incomingRequestsRaw || []).map(async (request) => {
          // Get book details
          const { data: book } = await supabase
            .from("books")
            .select("id, title, author, cover_image, listing_type")
            .eq("id", request.book_id)
            .single()

          // Get requester details
          const { data: requester } = await supabase
            .from("profiles")
            .select("id, username, full_name, avatar_url")
            .eq("id", request.user_id)
            .single()

          return {
            ...request,
            books: book || { title: "Unknown Book", author: "Unknown Author" },
            profiles: requester || { username: "Unknown User" },
          }
        }),
      )

      // Step 4: Enrich outgoing requests with book and owner details
      const enrichedOutgoing = await Promise.all(
        (outgoingRequestsRaw || []).map(async (request) => {
          // Get book details
          const { data: book } = await supabase
            .from("books")
            .select("id, title, author, cover_image, listing_type")
            .eq("id", request.book_id)
            .single()

          // Get owner details
          const { data: owner } = await supabase
            .from("profiles")
            .select("id, username, full_name, avatar_url")
            .eq("id", request.owner_id)
            .single()

          return {
            ...request,
            books: book || { title: "Unknown Book", author: "Unknown Author" },
            profiles: owner || { username: "Unknown User" },
          }
        }),
      )

      console.log("Enriched incoming requests:", enrichedIncoming)
      console.log("Enriched outgoing requests:", enrichedOutgoing)

      setIncomingRequests(enrichedIncoming)
      setOutgoingRequests(enrichedOutgoing)
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
          <Badge variant="outline" className="bg-yellow-50 border-yellow-200 text-yellow-700">
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
        <div className="text-center py-10 bg-gray-50 rounded-lg mt-6">
          <User className="h-12 w-12 text-gray-400 mx-auto mb-3" />
          <h3 className="text-lg font-medium mb-1">Please sign in</h3>
          <p className="text-gray-500 text-sm">You need to be signed in to view your requests.</p>
          <Button asChild className="mt-4">
            <Link href="/login">
              Sign In <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="p-4 md:p-6 max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
        <div>
          <DashboardTitle>Book Requests</DashboardTitle>
          <p className="text-gray-500 mt-1">Manage your incoming and outgoing book requests</p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={handleRefresh}
          disabled={refreshing || loading}
          className="flex items-center gap-1 self-end md:self-auto"
        >
          <RefreshCw className={`h-4 w-4 ${refreshing ? "animate-spin" : ""}`} />
          Refresh
        </Button>
      </div>

      <Tabs defaultValue="incoming" className="mt-6">
        <TabsList className="mb-6 w-full md:w-auto bg-gray-100/80 p-1 rounded-lg">
          <TabsTrigger
            value="incoming"
            className="flex items-center gap-1.5 data-[state=active]:bg-white rounded-md px-4 py-2"
          >
            <MessageCircle className="h-4 w-4" />
            Incoming Requests
            {incomingRequests.length > 0 && (
              <span className="ml-1 bg-emerald-100 text-emerald-700 text-xs font-medium px-2 py-0.5 rounded-full">
                {incomingRequests.length}
              </span>
            )}
          </TabsTrigger>
          <TabsTrigger
            value="outgoing"
            className="flex items-center gap-1.5 data-[state=active]:bg-white rounded-md px-4 py-2"
          >
            <BookOpen className="h-4 w-4" />
            Your Requests
            {outgoingRequests.length > 0 && (
              <span className="ml-1 bg-emerald-100 text-emerald-700 text-xs font-medium px-2 py-0.5 rounded-full">
                {outgoingRequests.length}
              </span>
            )}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="incoming">
          {loading ? (
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {[1, 2, 3].map((i) => (
                <Card key={i} className="overflow-hidden">
                  <CardHeader className="pb-0">
                    <div className="flex justify-between items-start mb-2">
                      <Skeleton className="h-6 w-3/4" />
                      <Skeleton className="h-5 w-20" />
                    </div>
                    <Skeleton className="h-4 w-1/2 mt-1" />
                  </CardHeader>
                  <CardContent className="pt-4">
                    <div className="flex items-start gap-3 mb-3">
                      <Skeleton className="h-12 w-12 rounded-full" />
                      <div className="space-y-2 flex-1">
                        <Skeleton className="h-4 w-1/3" />
                        <Skeleton className="h-3 w-1/4" />
                      </div>
                    </div>
                    <Skeleton className="h-20 w-full rounded-md" />
                  </CardContent>
                  <CardFooter className="flex gap-2 border-t pt-4">
                    <Skeleton className="h-9 w-full" />
                    <Skeleton className="h-9 w-full" />
                  </CardFooter>
                </Card>
              ))}
            </div>
          ) : incomingRequests.length === 0 ? (
            <div className="text-center py-12 bg-gray-50 rounded-lg border border-gray-100">
              <Book className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-medium mb-2">No incoming requests</h3>
              <p className="text-gray-500 max-w-md mx-auto">
                When someone requests your donated books, they'll appear here. You'll be able to approve or decline
                their requests.
              </p>
              <Button asChild variant="outline" className="mt-6">
                <Link href="/books">
                  Browse Books <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
              {incomingRequests.map((request) => (
                <Card
                  key={request.id}
                  className="overflow-hidden border-gray-200 hover:border-gray-300 transition-colors"
                >
                  <CardHeader className="pb-0">
                    <div className="flex justify-between items-start mb-2">
                      <Link href={`/books/${request.book_id}`}>
                        <CardTitle className="text-lg hover:text-emerald-600 hover:underline line-clamp-1">
                          {safeGet(request, "books.title", "Book Title")}
                        </CardTitle>
                      </Link>
                      {getStatusBadge(request.status)}
                    </div>
                    <CardDescription className="line-clamp-1">
                      By {safeGet(request, "books.author", "Unknown Author")}
                    </CardDescription>
                  </CardHeader>

                  <CardContent className="pt-4">
                    <div className="flex items-start gap-3 mb-4">
                      <Link href={`/users/${request.user_id}`} className="block">
                        <div className="w-12 h-12 rounded-full overflow-hidden flex-shrink-0 bg-gray-100 border border-gray-200">
                          {safeGet(request, "profiles.avatar_url") ? (
                            <Image
                              src={safeGet(request, "profiles.avatar_url", "/placeholder.svg") || "/placeholder.svg"}
                              alt={safeGet(request, "profiles.username", "User")}
                              width={48}
                              height={48}
                              className="object-cover w-full h-full"
                            />
                          ) : (
                            <div className="w-12 h-12 flex items-center justify-center bg-emerald-100 text-emerald-800 text-sm font-medium">
                              {safeGet(request, "profiles.username", "User").substring(0, 2).toUpperCase()}
                            </div>
                          )}
                        </div>
                      </Link>
                      <div>
                        <Link href={`/users/${request.user_id}`} className="block">
                          <p className="font-medium hover:text-emerald-600 hover:underline">
                            {safeGet(request, "profiles.full_name") ||
                              safeGet(request, "profiles.username", "Anonymous User")}
                          </p>
                        </Link>
                        <p className="text-sm text-gray-500 flex items-center">
                          <Calendar className="h-3 w-3 mr-1" />
                          {format(new Date(request.created_at), "MMM d, yyyy")}
                        </p>
                      </div>
                    </div>

                    <div className="bg-gray-50 p-4 rounded-md text-sm border border-gray-100">
                      <p className="italic text-gray-700">"{request.message || "I'd like to request this book."}"</p>
                    </div>
                  </CardContent>

                  {request.status === "pending" ? (
                    <CardFooter className="flex gap-3 border-t pt-4">
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
                  ) : (
                    <CardFooter className="border-t pt-4 text-sm text-gray-500">
                      {request.status === "approved" ? (
                        <div className="flex items-center">
                          <CheckCircle className="h-4 w-4 mr-2 text-green-500" />
                          You approved this request on {format(new Date(request.updated_at), "MMMM d, yyyy")}
                        </div>
                      ) : (
                        <div className="flex items-center">
                          <XCircle className="h-4 w-4 mr-2 text-red-500" />
                          You declined this request on {format(new Date(request.updated_at), "MMMM d, yyyy")}
                        </div>
                      )}
                    </CardFooter>
                  )}
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="outgoing">
          {loading ? (
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {[1, 2, 3].map((i) => (
                <Card key={i} className="overflow-hidden">
                  <CardHeader className="pb-0">
                    <div className="flex justify-between items-start mb-2">
                      <Skeleton className="h-6 w-3/4" />
                      <Skeleton className="h-5 w-20" />
                    </div>
                    <Skeleton className="h-4 w-1/2 mt-1" />
                  </CardHeader>
                  <CardContent className="pt-4">
                    <Skeleton className="h-4 w-1/3 mb-3" />
                    <Skeleton className="h-20 w-full rounded-md" />
                    <Skeleton className="h-3 w-1/4 mt-3" />
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : outgoingRequests.length === 0 ? (
            <div className="text-center py-12 bg-gray-50 rounded-lg border border-gray-100">
              <BookOpen className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-medium mb-2">No outgoing requests</h3>
              <p className="text-gray-500 max-w-md mx-auto">
                When you request donated books from other users, they'll appear here. You'll be able to track their
                status.
              </p>
              <Button asChild variant="outline" className="mt-6">
                <Link href="/books?listing_type=donation">
                  Find Donated Books <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
              {outgoingRequests.map((request) => (
                <Card
                  key={request.id}
                  className="overflow-hidden border-gray-200 hover:border-gray-300 transition-colors"
                >
                  <CardHeader className="pb-3">
                    <div className="flex justify-between items-start mb-2">
                      <Link href={`/books/${request.book_id}`}>
                        <CardTitle className="text-lg hover:text-emerald-600 hover:underline line-clamp-1">
                          {safeGet(request, "books.title", "Book Title")}
                        </CardTitle>
                      </Link>
                      {getStatusBadge(request.status)}
                    </div>
                    <CardDescription className="line-clamp-1">
                      By {safeGet(request, "books.author", "Unknown Author")}
                    </CardDescription>
                  </CardHeader>

                  <CardContent>
                    <div className="flex items-center gap-2 mb-4">
                      <span className="font-medium text-sm">Request to:</span>
                      <Link
                        href={`/users/${request.owner_id}`}
                        className="text-sm hover:text-emerald-600 hover:underline"
                      >
                        {safeGet(request, "profiles.full_name") ||
                          safeGet(request, "profiles.username", "Anonymous User")}
                      </Link>
                    </div>

                    <div className="bg-gray-50 p-4 rounded-md text-sm border border-gray-100 mb-4">
                      <p className="text-xs text-gray-500 mb-1">Your message:</p>
                      <p className="italic text-gray-700">"{request.message || "I'd like to request this book."}"</p>
                    </div>

                    <div className="flex items-center justify-between">
                      <p className="text-xs text-gray-500 flex items-center">
                        <Calendar className="h-3 w-3 mr-1" />
                        Requested on {format(new Date(request.created_at), "MMMM d, yyyy")}
                      </p>

                      {request.status === "approved" ? (
                        <Badge variant="success" className="bg-green-100 text-green-800 hover:bg-green-100">
                          <CheckCircle className="h-3 w-3 mr-1" /> Approved
                        </Badge>
                      ) : request.status === "rejected" ? (
                        <Badge variant="destructive" className="bg-red-100 text-red-800 hover:bg-red-100">
                          <XCircle className="h-3 w-3 mr-1" /> Declined
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">
                          <Clock className="h-3 w-3 mr-1" /> Awaiting Response
                        </Badge>
                      )}
                    </div>

                    {request.status === "approved" && (
                      <div className="mt-4 p-3 bg-green-50 border border-green-100 rounded-md text-sm text-green-800 flex items-start">
                        <AlertCircle className="h-4 w-4 mr-2 mt-0.5 flex-shrink-0" />
                        <p>
                          Your request has been approved! Please contact the book owner to arrange pickup or delivery.
                        </p>
                      </div>
                    )}

                    {request.status === "rejected" && (
                      <div className="mt-4 p-3 bg-red-50 border border-red-100 rounded-md text-sm text-red-800 flex items-start">
                        <AlertCircle className="h-4 w-4 mr-2 mt-0.5 flex-shrink-0" />
                        <p>
                          Your request has been declined. The book may no longer be available or the owner has chosen
                          another recipient.
                        </p>
                      </div>
                    )}
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
