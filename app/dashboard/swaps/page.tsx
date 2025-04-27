"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { useAuth } from "@/contexts/auth-context"
import { DashboardHeader } from "@/components/dashboard/header"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Loader2, BookOpen, RefreshCw, Check, X, AlertCircle, ArrowRight } from "lucide-react"
import { supabase } from "@/lib/supabase/client"
import { toast } from "@/components/ui/use-toast"
import { updateSwapStatus } from "@/app/actions/swap-actions"

export default function SwapsPage() {
  const router = useRouter()
  const { user } = useAuth()
  const [loading, setLoading] = useState(true)
  const [processingSwap, setProcessingSwap] = useState<string | null>(null)
  const [incomingSwaps, setIncomingSwaps] = useState<any[]>([])
  const [outgoingSwaps, setOutgoingSwaps] = useState<any[]>([])
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!user) {
      router.push("/login")
      return
    }

    fetchSwapRequests()
  }, [user, router])

  const fetchSwapRequests = async () => {
    if (!user) return

    try {
      setLoading(true)
      setError(null)

      // Fetch incoming swap requests (where user is the book owner)
      const { data: incomingData, error: incomingError } = await supabase
        .from("book_swaps")
        .select(`
          *,
          requester:requester_id(id, username, full_name, avatar_url),
          requested_book:requested_book_id(id, title, author, cover_image, condition),
          offered_book:offered_book_id(id, title, author, cover_image, condition)
        `)
        .eq("owner_id", user.id)
        .order("created_at", { ascending: false })

      if (incomingError) {
        throw incomingError
      }

      // Fetch outgoing swap requests (where user is the requester)
      const { data: outgoingData, error: outgoingError } = await supabase
        .from("book_swaps")
        .select(`
          *,
          owner:owner_id(id, username, full_name, avatar_url),
          requested_book:requested_book_id(id, title, author, cover_image, condition),
          offered_book:offered_book_id(id, title, author, cover_image, condition)
        `)
        .eq("requester_id", user.id)
        .order("created_at", { ascending: false })

      if (outgoingError) {
        throw outgoingError
      }

      setIncomingSwaps(incomingData || [])
      setOutgoingSwaps(outgoingData || [])
    } catch (err: any) {
      console.error("Error fetching swap requests:", err)
      setError("Failed to load swap requests. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  const handleUpdateStatus = async (swapId: string, status: "approved" | "rejected") => {
    if (!user) return

    try {
      setProcessingSwap(swapId)

      const result = await updateSwapStatus(swapId, status, user.id)

      if (result.success) {
        toast({
          title: `Swap Request ${status === "approved" ? "Approved" : "Rejected"}`,
          description:
            status === "approved"
              ? "The swap has been approved. Both books are now marked as swapped."
              : "The swap request has been rejected.",
        })
        fetchSwapRequests()
      } else {
        toast({
          title: "Action Failed",
          description: result.error || "Failed to update swap request",
          variant: "destructive",
        })
      }
    } catch (err: any) {
      console.error("Error updating swap status:", err)
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive",
      })
    } finally {
      setProcessingSwap(null)
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return (
          <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">
            Pending
          </Badge>
        )
      case "approved":
        return (
          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
            Approved
          </Badge>
        )
      case "rejected":
        return (
          <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">
            Rejected
          </Badge>
        )
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  if (!user) {
    return null
  }

  return (
    <div className="flex flex-col gap-8">
      <DashboardHeader heading="Book Swaps" text="Manage your book swap requests" />

      {error ? (
        <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-md flex items-start">
          <AlertCircle className="h-5 w-5 mr-2 flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-medium">Error loading swap requests</p>
            <p className="text-sm mt-1">{error}</p>
            <Button variant="outline" size="sm" className="mt-3" onClick={fetchSwapRequests}>
              Try Again
            </Button>
          </div>
        </div>
      ) : loading ? (
        <div className="flex flex-col items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-emerald-600 mb-3" />
          <p className="text-gray-500 text-sm">Loading swap requests...</p>
        </div>
      ) : (
        <Tabs defaultValue="incoming" className="w-full">
          <TabsList className="mb-6">
            <TabsTrigger value="incoming">
              Incoming Requests {incomingSwaps.length > 0 && `(${incomingSwaps.length})`}
            </TabsTrigger>
            <TabsTrigger value="outgoing">
              Outgoing Requests {outgoingSwaps.length > 0 && `(${outgoingSwaps.length})`}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="incoming">
            {incomingSwaps.length === 0 ? (
              <div className="text-center py-12 bg-gray-50 rounded-lg border border-dashed">
                <RefreshCw className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-1">No incoming swap requests</h3>
                <p className="text-gray-500 mb-4">
                  When someone requests to swap with one of your books, it will appear here.
                </p>
                <Button variant="outline" onClick={() => router.push("/books")}>
                  Browse Books
                </Button>
              </div>
            ) : (
              <div className="grid gap-4">
                {incomingSwaps.map((swap) => (
                  <Card key={swap.id} className={swap.status !== "pending" ? "opacity-75" : ""}>
                    <CardContent className="p-4">
                      <div className="flex flex-col gap-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <p className="text-sm font-medium">
                              From: {swap.requester?.full_name || swap.requester?.username || "Anonymous"}
                            </p>
                            {getStatusBadge(swap.status)}
                          </div>
                          <p className="text-xs text-gray-500">{new Date(swap.created_at).toLocaleDateString()}</p>
                        </div>

                        <div className="flex flex-col md:flex-row gap-6">
                          {/* Their book (offered) */}
                          <div className="flex-1">
                            <p className="text-sm font-medium text-gray-500 mb-2">Their Book:</p>
                            <div className="flex gap-3">
                              <div className="flex-shrink-0">
                                {swap.offered_book?.cover_image ? (
                                  <div className="relative w-16 h-24 overflow-hidden rounded-md border border-gray-200">
                                    <Image
                                      src={swap.offered_book.cover_image || "/placeholder.svg"}
                                      alt={`Cover for ${swap.offered_book.title}`}
                                      fill
                                      className="object-cover"
                                      sizes="64px"
                                    />
                                  </div>
                                ) : (
                                  <div className="flex w-16 h-24 flex-col items-center justify-center rounded-md border border-dashed border-gray-200 p-1">
                                    <BookOpen className="h-6 w-6 text-gray-400" />
                                  </div>
                                )}
                              </div>
                              <div>
                                <h3 className="font-medium line-clamp-1">{swap.offered_book?.title}</h3>
                                <p className="text-sm text-gray-600 line-clamp-1">By {swap.offered_book?.author}</p>
                                <Badge variant="outline" className="mt-2 text-xs">
                                  {swap.offered_book?.condition}
                                </Badge>
                              </div>
                            </div>
                          </div>

                          <div className="hidden md:flex items-center">
                            <ArrowRight className="h-5 w-5 text-gray-400" />
                          </div>

                          {/* Your book (requested) */}
                          <div className="flex-1">
                            <p className="text-sm font-medium text-gray-500 mb-2">Your Book:</p>
                            <div className="flex gap-3">
                              <div className="flex-shrink-0">
                                {swap.requested_book?.cover_image ? (
                                  <div className="relative w-16 h-24 overflow-hidden rounded-md border border-gray-200">
                                    <Image
                                      src={swap.requested_book.cover_image || "/placeholder.svg"}
                                      alt={`Cover for ${swap.requested_book.title}`}
                                      fill
                                      className="object-cover"
                                      sizes="64px"
                                    />
                                  </div>
                                ) : (
                                  <div className="flex w-16 h-24 flex-col items-center justify-center rounded-md border border-dashed border-gray-200 p-1">
                                    <BookOpen className="h-6 w-6 text-gray-400" />
                                  </div>
                                )}
                              </div>
                              <div>
                                <h3 className="font-medium line-clamp-1">{swap.requested_book?.title}</h3>
                                <p className="text-sm text-gray-600 line-clamp-1">By {swap.requested_book?.author}</p>
                                <Badge variant="outline" className="mt-2 text-xs">
                                  {swap.requested_book?.condition}
                                </Badge>
                              </div>
                            </div>
                          </div>
                        </div>

                        {swap.message && (
                          <div className="bg-gray-50 p-3 rounded-md text-sm">
                            <p className="font-medium mb-1">Message:</p>
                            <p className="text-gray-700">{swap.message}</p>
                          </div>
                        )}

                        {swap.status === "pending" && (
                          <div className="flex justify-end gap-3 mt-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleUpdateStatus(swap.id, "rejected")}
                              disabled={!!processingSwap}
                            >
                              {processingSwap === swap.id ? (
                                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                              ) : (
                                <X className="h-4 w-4 mr-2" />
                              )}
                              Reject
                            </Button>
                            <Button
                              size="sm"
                              onClick={() => handleUpdateStatus(swap.id, "approved")}
                              disabled={!!processingSwap}
                            >
                              {processingSwap === swap.id ? (
                                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                              ) : (
                                <Check className="h-4 w-4 mr-2" />
                              )}
                              Approve
                            </Button>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="outgoing">
            {outgoingSwaps.length === 0 ? (
              <div className="text-center py-12 bg-gray-50 rounded-lg border border-dashed">
                <RefreshCw className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-1">No outgoing swap requests</h3>
                <p className="text-gray-500 mb-4">
                  When you request to swap with someone else's book, it will appear here.
                </p>
                <Button variant="outline" onClick={() => router.push("/books")}>
                  Browse Books
                </Button>
              </div>
            ) : (
              <div className="grid gap-4">
                {outgoingSwaps.map((swap) => (
                  <Card key={swap.id} className={swap.status !== "pending" ? "opacity-75" : ""}>
                    <CardContent className="p-4">
                      <div className="flex flex-col gap-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <p className="text-sm font-medium">
                              To: {swap.owner?.full_name || swap.owner?.username || "Anonymous"}
                            </p>
                            {getStatusBadge(swap.status)}
                          </div>
                          <p className="text-xs text-gray-500">{new Date(swap.created_at).toLocaleDateString()}</p>
                        </div>

                        <div className="flex flex-col md:flex-row gap-6">
                          {/* Your book (offered) */}
                          <div className="flex-1">
                            <p className="text-sm font-medium text-gray-500 mb-2">Your Book:</p>
                            <div className="flex gap-3">
                              <div className="flex-shrink-0">
                                {swap.offered_book?.cover_image ? (
                                  <div className="relative w-16 h-24 overflow-hidden rounded-md border border-gray-200">
                                    <Image
                                      src={swap.offered_book.cover_image || "/placeholder.svg"}
                                      alt={`Cover for ${swap.offered_book.title}`}
                                      fill
                                      className="object-cover"
                                      sizes="64px"
                                    />
                                  </div>
                                ) : (
                                  <div className="flex w-16 h-24 flex-col items-center justify-center rounded-md border border-dashed border-gray-200 p-1">
                                    <BookOpen className="h-6 w-6 text-gray-400" />
                                  </div>
                                )}
                              </div>
                              <div>
                                <h3 className="font-medium line-clamp-1">{swap.offered_book?.title}</h3>
                                <p className="text-sm text-gray-600 line-clamp-1">By {swap.offered_book?.author}</p>
                                <Badge variant="outline" className="mt-2 text-xs">
                                  {swap.offered_book?.condition}
                                </Badge>
                              </div>
                            </div>
                          </div>

                          <div className="hidden md:flex items-center">
                            <ArrowRight className="h-5 w-5 text-gray-400" />
                          </div>

                          {/* Their book (requested) */}
                          <div className="flex-1">
                            <p className="text-sm font-medium text-gray-500 mb-2">Their Book:</p>
                            <div className="flex gap-3">
                              <div className="flex-shrink-0">
                                {swap.requested_book?.cover_image ? (
                                  <div className="relative w-16 h-24 overflow-hidden rounded-md border border-gray-200">
                                    <Image
                                      src={swap.requested_book.cover_image || "/placeholder.svg"}
                                      alt={`Cover for ${swap.requested_book.title}`}
                                      fill
                                      className="object-cover"
                                      sizes="64px"
                                    />
                                  </div>
                                ) : (
                                  <div className="flex w-16 h-24 flex-col items-center justify-center rounded-md border border-dashed border-gray-200 p-1">
                                    <BookOpen className="h-6 w-6 text-gray-400" />
                                  </div>
                                )}
                              </div>
                              <div>
                                <h3 className="font-medium line-clamp-1">{swap.requested_book?.title}</h3>
                                <p className="text-sm text-gray-600 line-clamp-1">By {swap.requested_book?.author}</p>
                                <Badge variant="outline" className="mt-2 text-xs">
                                  {swap.requested_book?.condition}
                                </Badge>
                              </div>
                            </div>
                          </div>
                        </div>

                        {swap.message && (
                          <div className="bg-gray-50 p-3 rounded-md text-sm">
                            <p className="font-medium mb-1">Your Message:</p>
                            <p className="text-gray-700">{swap.message}</p>
                          </div>
                        )}

                        {swap.status === "approved" && (
                          <div className="bg-green-50 p-3 rounded-md text-sm text-green-700 flex items-start">
                            <Check className="h-5 w-5 mr-2 flex-shrink-0" />
                            <div>
                              <p className="font-medium">Swap approved!</p>
                              <p>Contact the book owner to arrange the exchange.</p>
                            </div>
                          </div>
                        )}

                        {swap.status === "rejected" && (
                          <div className="bg-red-50 p-3 rounded-md text-sm text-red-700 flex items-start">
                            <X className="h-5 w-5 mr-2 flex-shrink-0" />
                            <div>
                              <p className="font-medium">Swap rejected</p>
                              <p>The book owner has declined your swap request.</p>
                            </div>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      )}
    </div>
  )
}
