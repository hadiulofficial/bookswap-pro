"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { useAuth } from "@/contexts/auth-context"
import { Title } from "@/components/dashboard/title"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { toast } from "@/components/ui/use-toast"
import { getUserSwapRequests, updateSwapRequestStatus } from "@/app/actions/swap-actions"
import { BookOpen, RefreshCw, Loader2, AlertCircle, CheckCircle2, XCircle, Clock, ArrowRight } from "lucide-react"
import { format } from "date-fns"

export default function SwapRequestsPage() {
  const { user } = useAuth()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [sentRequests, setSentRequests] = useState<any[]>([])
  const [receivedRequests, setReceivedRequests] = useState<any[]>([])
  const [actionLoading, setActionLoading] = useState<string | null>(null)

  useEffect(() => {
    if (user) {
      fetchSwapRequests()
    }
  }, [user])

  const fetchSwapRequests = async () => {
    if (!user) return

    setLoading(true)
    setError(null)

    try {
      const result = await getUserSwapRequests(user.id)

      if (result.success) {
        setSentRequests(result.sentRequests)
        setReceivedRequests(result.receivedRequests)
      } else {
        setError(result.error || "Failed to load swap requests")
      }
    } catch (err: any) {
      console.error("Error fetching swap requests:", err)
      setError("An unexpected error occurred")
    } finally {
      setLoading(false)
    }
  }

  const handleUpdateStatus = async (swapRequestId: string, status: "accepted" | "rejected") => {
    if (!user) return

    setActionLoading(swapRequestId)

    try {
      const result = await updateSwapRequestStatus(swapRequestId, status, user.id)

      if (result.success) {
        toast({
          title: `Swap request ${status === "accepted" ? "accepted" : "rejected"}`,
          description:
            status === "accepted" ? "The swap has been completed successfully!" : "The swap request has been rejected.",
        })
        fetchSwapRequests()
      } else {
        toast({
          title: "Error",
          description: result.error || "Failed to update swap request",
          variant: "destructive",
        })
      }
    } catch (err: any) {
      console.error("Error updating swap request:", err)
      toast({
        title: "Error",
        description: "An unexpected error occurred",
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
          <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">
            <Clock className="h-3 w-3 mr-1" /> Pending
          </Badge>
        )
      case "accepted":
        return (
          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
            <CheckCircle2 className="h-3 w-3 mr-1" /> Accepted
          </Badge>
        )
      case "rejected":
        return (
          <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">
            <XCircle className="h-3 w-3 mr-1" /> Rejected
          </Badge>
        )
      default:
        return (
          <Badge variant="outline">
            <Clock className="h-3 w-3 mr-1" /> {status}
          </Badge>
        )
    }
  }

  const renderBookCard = (book: any) => {
    return (
      <div className="flex items-center gap-3">
        <div className="flex-shrink-0 w-12 h-16 relative rounded overflow-hidden border border-gray-200">
          {book?.cover_image ? (
            <Image
              src={book.cover_image || "/placeholder.svg"}
              alt={book.title}
              fill
              className="object-cover"
              sizes="48px"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gray-100">
              <BookOpen className="h-4 w-4 text-gray-400" />
            </div>
          )}
        </div>
        <div className="flex-1 min-w-0">
          <Link
            href={`/books/${book?.id}`}
            className="font-medium text-sm hover:text-emerald-600 hover:underline truncate block"
          >
            {book?.title}
          </Link>
          <p className="text-gray-500 text-xs truncate">by {book?.author}</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="p-6">
        <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4 text-sm text-yellow-800">
          <p>Please sign in to view your swap requests.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="p-4 md:p-6">
      <Title>Swap Requests</Title>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-md p-4 mb-6 text-sm text-red-800 flex items-start gap-3">
          <AlertCircle className="h-5 w-5 text-red-500 mt-0.5 flex-shrink-0" />
          <div>
            <p className="font-medium">Error loading swap requests</p>
            <p>{error}</p>
          </div>
        </div>
      )}

      <Tabs defaultValue="received" className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="received" className="relative">
            Received Requests
            {receivedRequests.filter((req) => req.status === "pending").length > 0 && (
              <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-emerald-500 text-[10px] font-medium text-white">
                {receivedRequests.filter((req) => req.status === "pending").length}
              </span>
            )}
          </TabsTrigger>
          <TabsTrigger value="sent">Sent Requests</TabsTrigger>
        </TabsList>

        <TabsContent value="received" className="mt-0">
          {loading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <Card key={i}>
                  <CardHeader className="pb-3">
                    <Skeleton className="h-5 w-32" />
                    <Skeleton className="h-4 w-48" />
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-col md:flex-row gap-4">
                      <div className="flex-1">
                        <Skeleton className="h-4 w-24 mb-3" />
                        <div className="flex gap-3">
                          <Skeleton className="h-16 w-12" />
                          <div className="flex-1">
                            <Skeleton className="h-4 w-32 mb-2" />
                            <Skeleton className="h-3 w-24" />
                          </div>
                        </div>
                      </div>
                      <div className="flex-1">
                        <Skeleton className="h-4 w-24 mb-3" />
                        <div className="flex gap-3">
                          <Skeleton className="h-16 w-12" />
                          <div className="flex-1">
                            <Skeleton className="h-4 w-32 mb-2" />
                            <Skeleton className="h-3 w-24" />
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : receivedRequests.length === 0 ? (
            <Card>
              <CardContent className="pt-6 flex flex-col items-center justify-center text-center p-8">
                <RefreshCw className="h-12 w-12 text-gray-300 mb-3" />
                <CardTitle className="text-xl mb-2">No swap requests received</CardTitle>
                <CardDescription className="mb-4">
                  When someone requests to swap one of your books, it will appear here.
                </CardDescription>
                <Button asChild variant="outline">
                  <Link href="/books">Browse Books</Link>
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {receivedRequests.map((request) => (
                <Card key={request.id}>
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg">Swap Request</CardTitle>
                      {getStatusBadge(request.status)}
                    </div>
                    <CardDescription>
                      From{" "}
                      <Link
                        href={`/users/${request.requester_id}`}
                        className="font-medium text-emerald-600 hover:underline"
                      >
                        {request.requester_id}
                      </Link>{" "}
                      on {format(new Date(request.created_at), "MMM d, yyyy")}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-col md:flex-row gap-6">
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-500 mb-3">They want your book:</p>
                        {renderBookCard(request.requested_book)}
                      </div>

                      <div className="hidden md:flex items-center justify-center">
                        <ArrowRight className="h-5 w-5 text-gray-400" />
                      </div>

                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-500 mb-3">In exchange for their book:</p>
                        {renderBookCard(request.offered_book)}
                      </div>
                    </div>

                    {request.status === "pending" && (
                      <div className="flex gap-3 mt-6 justify-end">
                        <Button
                          variant="outline"
                          onClick={() => handleUpdateStatus(request.id, "rejected")}
                          disabled={!!actionLoading}
                          className="text-red-600 hover:text-red-700 hover:bg-red-50"
                        >
                          {actionLoading === request.id ? (
                            <Loader2 className="h-4 w-4 animate-spin mr-2" />
                          ) : (
                            <XCircle className="h-4 w-4 mr-2" />
                          )}
                          Decline
                        </Button>
                        <Button onClick={() => handleUpdateStatus(request.id, "accepted")} disabled={!!actionLoading}>
                          {actionLoading === request.id ? (
                            <Loader2 className="h-4 w-4 animate-spin mr-2" />
                          ) : (
                            <CheckCircle2 className="h-4 w-4 mr-2" />
                          )}
                          Accept Swap
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="sent" className="mt-0">
          {loading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <Card key={i}>
                  <CardHeader className="pb-3">
                    <Skeleton className="h-5 w-32" />
                    <Skeleton className="h-4 w-48" />
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-col md:flex-row gap-4">
                      <div className="flex-1">
                        <Skeleton className="h-4 w-24 mb-3" />
                        <div className="flex gap-3">
                          <Skeleton className="h-16 w-12" />
                          <div className="flex-1">
                            <Skeleton className="h-4 w-32 mb-2" />
                            <Skeleton className="h-3 w-24" />
                          </div>
                        </div>
                      </div>
                      <div className="flex-1">
                        <Skeleton className="h-4 w-24 mb-3" />
                        <div className="flex gap-3">
                          <Skeleton className="h-16 w-12" />
                          <div className="flex-1">
                            <Skeleton className="h-4 w-32 mb-2" />
                            <Skeleton className="h-3 w-24" />
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : sentRequests.length === 0 ? (
            <Card>
              <CardContent className="pt-6 flex flex-col items-center justify-center text-center p-8">
                <RefreshCw className="h-12 w-12 text-gray-300 mb-3" />
                <CardTitle className="text-xl mb-2">No swap requests sent</CardTitle>
                <CardDescription className="mb-4">
                  When you request to swap a book with someone, it will appear here.
                </CardDescription>
                <Button asChild variant="outline">
                  <Link href="/books">Browse Books</Link>
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {sentRequests.map((request) => (
                <Card key={request.id}>
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg">Swap Request</CardTitle>
                      {getStatusBadge(request.status)}
                    </div>
                    <CardDescription>
                      To{" "}
                      <Link
                        href={`/users/${request.owner_id}`}
                        className="font-medium text-emerald-600 hover:underline"
                      >
                        {request.owner_id}
                      </Link>{" "}
                      on {format(new Date(request.created_at), "MMM d, yyyy")}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-col md:flex-row gap-6">
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-500 mb-3">You want this book:</p>
                        {renderBookCard(request.requested_book)}
                      </div>

                      <div className="hidden md:flex items-center justify-center">
                        <ArrowRight className="h-5 w-5 text-gray-400" />
                      </div>

                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-500 mb-3">In exchange for your book:</p>
                        {renderBookCard(request.offered_book)}
                      </div>
                    </div>

                    {request.status === "pending" && (
                      <div className="mt-4 p-3 bg-gray-50 rounded-md text-sm text-gray-600 flex items-center gap-2">
                        <Clock className="h-4 w-4 text-gray-400" />
                        <span>Waiting for the owner to respond to your swap request.</span>
                      </div>
                    )}

                    {request.status === "accepted" && (
                      <div className="mt-4 p-3 bg-green-50 rounded-md text-sm text-green-700 flex items-center gap-2">
                        <CheckCircle2 className="h-4 w-4 text-green-500" />
                        <span>Your swap request has been accepted! The book is now yours.</span>
                      </div>
                    )}

                    {request.status === "rejected" && (
                      <div className="mt-4 p-3 bg-red-50 rounded-md text-sm text-red-700 flex items-center gap-2">
                        <XCircle className="h-4 w-4 text-red-500" />
                        <span>Your swap request has been declined by the owner.</span>
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
