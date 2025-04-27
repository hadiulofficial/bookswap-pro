"use client"

import { useState, useEffect } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { updateSwapStatus } from "@/app/actions/swap-actions"
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
  RefreshCw,
  User,
  BookOpen,
  AlertCircle,
  ArrowRight,
  MessageSquare,
} from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { format } from "date-fns"
import { toast } from "@/components/ui/use-toast"
import { supabase } from "@/lib/supabase/client"
import { Skeleton } from "@/components/ui/skeleton"
import { Separator } from "@/components/ui/separator"

export default function SwapsPage() {
  const { user } = useAuth()
  const [incomingSwaps, setIncomingSwaps] = useState<any[]>([])
  const [outgoingSwaps, setOutgoingSwaps] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [actionLoading, setActionLoading] = useState<string | null>(null)

  useEffect(() => {
    if (user) {
      fetchSwaps()
    }
  }, [user])

  const fetchSwaps = async () => {
    if (!user) return

    setLoading(true)
    console.log("Fetching swaps for user:", user.id)

    try {
      // Step 1: Get all incoming swaps (where you are the owner)
      const { data: incomingSwapsRaw, error: incomingError } = await supabase
        .from("book_swaps")
        .select("*")
        .eq("owner_id", user.id)
        .order("created_at", { ascending: false })

      if (incomingError) {
        console.error("Error fetching incoming swaps:", incomingError)
        throw incomingError
      }

      // Step 2: Get all outgoing swaps (where you are the requester)
      const { data: outgoingSwapsRaw, error: outgoingError } = await supabase
        .from("book_swaps")
        .select("*")
        .eq("requester_id", user.id)
        .order("created_at", { ascending: false })

      if (outgoingError) {
        console.error("Error fetching outgoing swaps:", outgoingError)
        throw outgoingError
      }

      console.log("Raw incoming swaps:", incomingSwapsRaw)
      console.log("Raw outgoing swaps:", outgoingSwapsRaw)

      // Step 3: Enrich incoming swaps with book and user details
      const enrichedIncoming = await Promise.all(
        (incomingSwapsRaw || []).map(async (swap) => {
          // Get requested book details
          const { data: requestedBook } = await supabase
            .from("books")
            .select("id, title, author, cover_image, condition")
            .eq("id", swap.requested_book_id)
            .single()

          // Get offered book details
          const { data: offeredBook } = await supabase
            .from("books")
            .select("id, title, author, cover_image, condition")
            .eq("id", swap.offered_book_id)
            .single()

          // Get requester details
          const { data: requester } = await supabase
            .from("profiles")
            .select("id, username, full_name, avatar_url")
            .eq("id", swap.requester_id)
            .single()

          return {
            ...swap,
            requested_book: requestedBook || { title: "Unknown Book", author: "Unknown Author" },
            offered_book: offeredBook || { title: "Unknown Book", author: "Unknown Author" },
            requester: requester || { username: "Unknown User" },
          }
        }),
      )

      // Step 4: Enrich outgoing swaps with book and owner details
      const enrichedOutgoing = await Promise.all(
        (outgoingSwapsRaw || []).map(async (swap) => {
          // Get requested book details
          const { data: requestedBook } = await supabase
            .from("books")
            .select("id, title, author, cover_image, condition")
            .eq("id", swap.requested_book_id)
            .single()

          // Get offered book details
          const { data: offeredBook } = await supabase
            .from("books")
            .select("id, title, author, cover_image, condition")
            .eq("id", swap.offered_book_id)
            .single()

          // Get owner details
          const { data: owner } = await supabase
            .from("profiles")
            .select("id, username, full_name, avatar_url")
            .eq("id", swap.owner_id)
            .single()

          return {
            ...swap,
            requested_book: requestedBook || { title: "Unknown Book", author: "Unknown Author" },
            offered_book: offeredBook || { title: "Unknown Book", author: "Unknown Author" },
            owner: owner || { username: "Unknown User" },
          }
        }),
      )

      console.log("Enriched incoming swaps:", enrichedIncoming)
      console.log("Enriched outgoing swaps:", enrichedOutgoing)

      setIncomingSwaps(enrichedIncoming)
      setOutgoingSwaps(enrichedOutgoing)
    } catch (err: any) {
      console.error("Error fetching swaps:", err)
      toast({
        title: "Error",
        description: err.message || "Failed to load swap requests",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleRefresh = async () => {
    if (!user || refreshing) return

    setRefreshing(true)
    await fetchSwaps()
    setRefreshing(false)

    toast({
      title: "Refreshed",
      description: "Swap requests have been updated.",
    })
  }

  const handleApprove = async (swapId: string) => {
    if (!user) return

    setActionLoading(swapId)

    try {
      const result = await updateSwapStatus(swapId, "approved", user.id)

      if (result.success) {
        toast({
          title: "Swap Approved",
          description: "The requester has been notified.",
        })
        fetchSwaps() // Refresh the list
      } else {
        toast({
          title: "Action Failed",
          description: result.error || "Failed to approve swap request.",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error approving swap:", error)
      toast({
        title: "Error",
        description: "An unexpected error occurred.",
        variant: "destructive",
      })
    } finally {
      setActionLoading(null)
    }
  }

  const handleReject = async (swapId: string) => {
    if (!user) return

    setActionLoading(swapId)

    try {
      const result = await updateSwapStatus(swapId, "rejected", user.id)

      if (result.success) {
        toast({
          title: "Swap Rejected",
          description: "The requester has been notified.",
        })
        fetchSwaps() // Refresh the list
      } else {
        toast({
          title: "Action Failed",
          description: result.error || "Failed to reject swap request.",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error rejecting swap:", error)
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
        <DashboardTitle>Book Swaps</DashboardTitle>
        <div className="text-center py-10 bg-gray-50 rounded-lg mt-6">
          <User className="h-12 w-12 text-gray-400 mx-auto mb-3" />
          <h3 className="text-lg font-medium mb-1">Please sign in</h3>
          <p className="text-gray-500 text-sm">You need to be signed in to view your swap requests.</p>
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
          <DashboardTitle>Book Swaps</DashboardTitle>
          <p className="text-gray-500 mt-1">Manage your book swap requests</p>
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
            <MessageSquare className="h-4 w-4" />
            Incoming Swaps
            {incomingSwaps.length > 0 && (
              <span className="ml-1 bg-emerald-100 text-emerald-700 text-xs font-medium px-2 py-0.5 rounded-full">
                {incomingSwaps.length}
              </span>
            )}
          </TabsTrigger>
          <TabsTrigger
            value="outgoing"
            className="flex items-center gap-1.5 data-[state=active]:bg-white rounded-md px-4 py-2"
          >
            <BookOpen className="h-4 w-4" />
            Your Swap Requests
            {outgoingSwaps.length > 0 && (
              <span className="ml-1 bg-emerald-100 text-emerald-700 text-xs font-medium px-2 py-0.5 rounded-full">
                {outgoingSwaps.length}
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
          ) : incomingSwaps.length === 0 ? (
            <div className="text-center py-12 bg-gray-50 rounded-lg border border-gray-100">
              <RefreshCw className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-medium mb-2">No incoming swap requests</h3>
              <p className="text-gray-500 max-w-md mx-auto">
                When someone requests to swap books with you, they'll appear here. You'll be able to approve or decline
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
              {incomingSwaps.map((swap) => (
                <Card key={swap.id} className="overflow-hidden border-gray-200 hover:border-gray-300 transition-colors">
                  <CardHeader className="pb-0">
                    <div className="flex justify-between items-start mb-2">
                      <CardTitle className="text-lg">Swap Request</CardTitle>
                      {getStatusBadge(swap.status)}
                    </div>
                    <CardDescription>
                      From{" "}
                      {safeGet(swap, "requester.full_name") || safeGet(swap, "requester.username", "Anonymous User")}
                    </CardDescription>
                  </CardHeader>

                  <CardContent className="pt-4">
                    <div className="flex items-start gap-3 mb-4">
                      <Link href={`/users/${swap.requester_id}`} className="block">
                        <div className="w-12 h-12 rounded-full overflow-hidden flex-shrink-0 bg-gray-100 border border-gray-200">
                          {safeGet(swap, "requester.avatar_url") ? (
                            <Image
                              src={safeGet(swap, "requester.avatar_url", "/placeholder.svg") || "/placeholder.svg"}
                              alt={safeGet(swap, "requester.username", "User")}
                              width={48}
                              height={48}
                              className="object-cover w-full h-full"
                            />
                          ) : (
                            <div className="w-12 h-12 flex items-center justify-center bg-emerald-100 text-emerald-800 text-sm font-medium">
                              {safeGet(swap, "requester.username", "User").substring(0, 2).toUpperCase()}
                            </div>
                          )}
                        </div>
                      </Link>
                      <div>
                        <Link href={`/users/${swap.requester_id}`} className="block">
                          <p className="font-medium hover:text-emerald-600 hover:underline">
                            {safeGet(swap, "requester.full_name") ||
                              safeGet(swap, "requester.username", "Anonymous User")}
                          </p>
                        </Link>
                        <p className="text-sm text-gray-500 flex items-center">
                          <Calendar className="h-3 w-3 mr-1" />
                          {format(new Date(swap.created_at), "MMM d, yyyy")}
                        </p>
                      </div>
                    </div>

                    <div className="bg-gray-50 p-4 rounded-md border border-gray-100 mb-4">
                      <div className="flex flex-col gap-4">
                        <div>
                          <h4 className="text-sm font-medium text-gray-700 mb-2">They want your book:</h4>
                          <div className="flex gap-3">
                            {swap.requested_book?.cover_image ? (
                              <div className="relative w-12 h-16 overflow-hidden rounded-md border border-gray-200">
                                <Image
                                  src={swap.requested_book.cover_image || "/placeholder.svg"}
                                  alt={`Cover for ${swap.requested_book.title}`}
                                  fill
                                  className="object-cover"
                                  sizes="48px"
                                />
                              </div>
                            ) : (
                              <div className="flex w-12 h-16 flex-col items-center justify-center rounded-md border border-dashed border-gray-200 p-1">
                                <BookOpen className="h-5 w-5 text-gray-400" />
                              </div>
                            )}
                            <div>
                              <p className="font-medium text-sm line-clamp-1">{swap.requested_book?.title}</p>
                              <p className="text-xs text-gray-600 line-clamp-1">By {swap.requested_book?.author}</p>
                              <Badge variant="outline" className="mt-1 text-xs">
                                {swap.requested_book?.condition}
                              </Badge>
                            </div>
                          </div>
                        </div>

                        <Separator />

                        <div>
                          <h4 className="text-sm font-medium text-gray-700 mb-2">In exchange for their book:</h4>
                          <div className="flex gap-3">
                            {swap.offered_book?.cover_image ? (
                              <div className="relative w-12 h-16 overflow-hidden rounded-md border border-gray-200">
                                <Image
                                  src={swap.offered_book.cover_image || "/placeholder.svg"}
                                  alt={`Cover for ${swap.offered_book.title}`}
                                  fill
                                  className="object-cover"
                                  sizes="48px"
                                />
                              </div>
                            ) : (
                              <div className="flex w-12 h-16 flex-col items-center justify-center rounded-md border border-dashed border-gray-200 p-1">
                                <BookOpen className="h-5 w-5 text-gray-400" />
                              </div>
                            )}
                            <div>
                              <p className="font-medium text-sm line-clamp-1">{swap.offered_book?.title}</p>
                              <p className="text-xs text-gray-600 line-clamp-1">By {swap.offered_book?.author}</p>
                              <Badge variant="outline" className="mt-1 text-xs">
                                {swap.offered_book?.condition}
                              </Badge>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {swap.message && (
                      <div className="bg-blue-50 p-3 rounded-md text-sm border border-blue-100 mb-4">
                        <p className="text-xs text-blue-700 font-medium mb-1">Message:</p>
                        <p className="italic text-gray-700">"{swap.message}"</p>
                      </div>
                    )}
                  </CardContent>

                  {swap.status === "pending" ? (
                    <CardFooter className="flex gap-3 border-t pt-4">
                      <Button
                        className="flex-1"
                        onClick={() => handleApprove(swap.id)}
                        disabled={actionLoading === swap.id}
                      >
                        {actionLoading === swap.id ? (
                          <Loader2 className="h-4 w-4 animate-spin mr-2" />
                        ) : (
                          <CheckCircle className="h-4 w-4 mr-2" />
                        )}
                        Approve Swap
                      </Button>
                      <Button
                        variant="outline"
                        className="flex-1"
                        onClick={() => handleReject(swap.id)}
                        disabled={actionLoading === swap.id}
                      >
                        <XCircle className="h-4 w-4 mr-2" />
                        Decline
                      </Button>
                    </CardFooter>
                  ) : (
                    <CardFooter className="border-t pt-4 text-sm text-gray-500">
                      {swap.status === "approved" ? (
                        <div className="flex items-center">
                          <CheckCircle className="h-4 w-4 mr-2 text-green-500" />
                          You approved this swap on {format(new Date(swap.updated_at), "MMMM d, yyyy")}
                        </div>
                      ) : (
                        <div className="flex items-center">
                          <XCircle className="h-4 w-4 mr-2 text-red-500" />
                          You declined this swap on {format(new Date(swap.updated_at), "MMMM d, yyyy")}
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
          ) : outgoingSwaps.length === 0 ? (
            <div className="text-center py-12 bg-gray-50 rounded-lg border border-gray-100">
              <RefreshCw className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-medium mb-2">No outgoing swap requests</h3>
              <p className="text-gray-500 max-w-md mx-auto">
                When you request to swap books with other users, they'll appear here. You'll be able to track their
                status.
              </p>
              <Button asChild variant="outline" className="mt-6">
                <Link href="/books?listing_type=exchange">
                  Find Books to Swap <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
              {outgoingSwaps.map((swap) => (
                <Card key={swap.id} className="overflow-hidden border-gray-200 hover:border-gray-300 transition-colors">
                  <CardHeader className="pb-3">
                    <div className="flex justify-between items-start mb-2">
                      <CardTitle className="text-lg">Swap Request</CardTitle>
                      {getStatusBadge(swap.status)}
                    </div>
                    <CardDescription>
                      To {safeGet(swap, "owner.full_name") || safeGet(swap, "owner.username", "Anonymous User")}
                    </CardDescription>
                  </CardHeader>

                  <CardContent>
                    <div className="bg-gray-50 p-4 rounded-md border border-gray-100 mb-4">
                      <div className="flex flex-col gap-4">
                        <div>
                          <h4 className="text-sm font-medium text-gray-700 mb-2">You want this book:</h4>
                          <div className="flex gap-3">
                            {swap.requested_book?.cover_image ? (
                              <div className="relative w-12 h-16 overflow-hidden rounded-md border border-gray-200">
                                <Image
                                  src={swap.requested_book.cover_image || "/placeholder.svg"}
                                  alt={`Cover for ${swap.requested_book.title}`}
                                  fill
                                  className="object-cover"
                                  sizes="48px"
                                />
                              </div>
                            ) : (
                              <div className="flex w-12 h-16 flex-col items-center justify-center rounded-md border border-dashed border-gray-200 p-1">
                                <BookOpen className="h-5 w-5 text-gray-400" />
                              </div>
                            )}
                            <div>
                              <p className="font-medium text-sm line-clamp-1">{swap.requested_book?.title}</p>
                              <p className="text-xs text-gray-600 line-clamp-1">By {swap.requested_book?.author}</p>
                              <Badge variant="outline" className="mt-1 text-xs">
                                {swap.requested_book?.condition}
                              </Badge>
                            </div>
                          </div>
                        </div>

                        <Separator />

                        <div>
                          <h4 className="text-sm font-medium text-gray-700 mb-2">You offered this book:</h4>
                          <div className="flex gap-3">
                            {swap.offered_book?.cover_image ? (
                              <div className="relative w-12 h-16 overflow-hidden rounded-md border border-gray-200">
                                <Image
                                  src={swap.offered_book.cover_image || "/placeholder.svg"}
                                  alt={`Cover for ${swap.offered_book.title}`}
                                  fill
                                  className="object-cover"
                                  sizes="48px"
                                />
                              </div>
                            ) : (
                              <div className="flex w-12 h-16 flex-col items-center justify-center rounded-md border border-dashed border-gray-200 p-1">
                                <BookOpen className="h-5 w-5 text-gray-400" />
                              </div>
                            )}
                            <div>
                              <p className="font-medium text-sm line-clamp-1">{swap.offered_book?.title}</p>
                              <p className="text-xs text-gray-600 line-clamp-1">By {swap.offered_book?.author}</p>
                              <Badge variant="outline" className="mt-1 text-xs">
                                {swap.offered_book?.condition}
                              </Badge>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <p className="text-xs text-gray-500 flex items-center">
                        <Calendar className="h-3 w-3 mr-1" />
                        Requested on {format(new Date(swap.created_at), "MMMM d, yyyy")}
                      </p>
                    </div>

                    {swap.status === "approved" && (
                      <div className="mt-4 p-3 bg-green-50 border border-green-100 rounded-md text-sm text-green-800 flex items-start">
                        <AlertCircle className="h-4 w-4 mr-2 mt-0.5 flex-shrink-0" />
                        <p>
                          Your swap request has been approved! Please contact the book owner to arrange the exchange.
                        </p>
                      </div>
                    )}

                    {swap.status === "rejected" && (
                      <div className="mt-4 p-3 bg-red-50 border border-red-100 rounded-md text-sm text-red-800 flex items-start">
                        <AlertCircle className="h-4 w-4 mr-2 mt-0.5 flex-shrink-0" />
                        <p>
                          Your swap request has been declined. The book may no longer be available or the owner has
                          chosen another swap.
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
