"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import Image from "next/image"
import Link from "next/link"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Separator } from "@/components/ui/separator"
import { BookOpen, Calendar, MapPin, Globe, ArrowLeft, Loader2, RefreshCw } from "lucide-react"
import { supabase } from "@/lib/supabase/client"
import { useAuth } from "@/contexts/auth-context"

export default function UserProfilePage() {
  const { id } = useParams()
  const router = useRouter()
  const { user } = useAuth()
  const [profile, setProfile] = useState<any>(null)
  const [books, setBooks] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!id) return

    fetchUserProfile()
    fetchUserBooks()
  }, [id])

  const fetchUserProfile = async () => {
    try {
      const { data, error } = await supabase.from("profiles").select("*").eq("id", id).single()

      if (error) throw error
      setProfile(data)
    } catch (err: any) {
      console.error("Error fetching user profile:", err)
      setError("Failed to load user profile")
    }
  }

  const fetchUserBooks = async () => {
    try {
      setLoading(true)
      setError(null)

      const { data, error } = await supabase
        .from("books")
        .select("*")
        .eq("owner_id", id)
        .eq("status", "Available")
        .order("created_at", { ascending: false })

      if (error) throw error
      setBooks(data || [])
    } catch (err: any) {
      console.error("Error fetching user books:", err)
      setError(err.message || "Failed to load books")
    } finally {
      setLoading(false)
    }
  }

  const getDisplayName = () => {
    if (!profile) return "User"
    return profile.full_name || profile.username || "User"
  }

  const getInitials = () => {
    if (!profile) return "U"
    if (profile.full_name) {
      return profile.full_name
        .split(" ")
        .map((n: string) => n[0])
        .join("")
    }
    return profile.username?.[0]?.toUpperCase() || "U"
  }

  const formatDate = (dateString: string) => {
    if (!dateString) return "Unknown"
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  }

  if (error) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-1 py-16 md:py-24 bg-gray-50 dark:bg-gray-900">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-8 text-center">
              <h2 className="text-2xl font-bold mb-4">Error</h2>
              <p className="text-red-500 mb-6">{error}</p>
              <Button onClick={() => router.back()}>
                <ArrowLeft className="mr-2 h-4 w-4" /> Go Back
              </Button>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 py-16 md:py-24 bg-gray-50 dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Button variant="ghost" className="mb-6" onClick={() => router.back()}>
            <ArrowLeft className="mr-2 h-4 w-4" /> Back
          </Button>

          {loading && !profile ? (
            <div className="flex flex-col items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-emerald-600 mb-4" />
              <p className="text-gray-500">Loading profile...</p>
            </div>
          ) : (
            <>
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm overflow-hidden mb-8">
                <div className="h-32 bg-gradient-to-r from-emerald-500 to-teal-600"></div>
                <div className="px-6 py-4 sm:px-8 sm:py-6">
                  <div className="flex flex-col sm:flex-row items-center sm:items-end -mt-16 mb-4 gap-4">
                    <Avatar className="h-24 w-24 border-4 border-white dark:border-gray-800">
                      <AvatarImage src={profile?.avatar_url || ""} alt={getDisplayName()} />
                      <AvatarFallback className="text-2xl bg-emerald-100 text-emerald-800">
                        {getInitials()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="text-center sm:text-left">
                      <h1 className="text-2xl font-bold">{getDisplayName()}</h1>
                      <p className="text-gray-500">@{profile?.username || "user"}</p>
                    </div>
                  </div>

                  <Separator className="my-6" />

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h2 className="text-lg font-semibold mb-4">About</h2>
                      <p className="text-gray-600 dark:text-gray-300 mb-4">
                        {profile?.bio || "This user hasn't added a bio yet."}
                      </p>

                      <div className="space-y-2">
                        <div className="flex items-center text-gray-500">
                          <Calendar className="h-4 w-4 mr-2" />
                          <span>Joined {formatDate(profile?.created_at)}</span>
                        </div>
                        {profile?.location && (
                          <div className="flex items-center text-gray-500">
                            <MapPin className="h-4 w-4 mr-2" />
                            <span>{profile.location}</span>
                          </div>
                        )}
                        {profile?.website && (
                          <div className="flex items-center text-gray-500">
                            <Globe className="h-4 w-4 mr-2" />
                            <a
                              href={profile.website.startsWith("http") ? profile.website : `https://${profile.website}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-emerald-600 hover:underline"
                            >
                              {profile.website.replace(/^https?:\/\//, "")}
                            </a>
                          </div>
                        )}
                      </div>
                    </div>

                    <div>
                      <h2 className="text-lg font-semibold mb-4">Stats</h2>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg text-center">
                          <p className="text-2xl font-bold text-emerald-600">{books.length}</p>
                          <p className="text-gray-500">Books Listed</p>
                        </div>
                        <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg text-center">
                          <p className="text-2xl font-bold text-emerald-600">
                            {profile?.created_at
                              ? Math.floor(
                                  (new Date().getTime() - new Date(profile.created_at).getTime()) /
                                    (1000 * 60 * 60 * 24 * 30),
                                )
                              : 0}
                          </p>
                          <p className="text-gray-500">Months Active</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <Tabs defaultValue="books" className="w-full">
                <TabsList className="mb-8">
                  <TabsTrigger value="books">Books ({books.length})</TabsTrigger>
                </TabsList>

                <TabsContent value="books">
                  {loading ? (
                    <div className="flex flex-col items-center justify-center py-12">
                      <Loader2 className="h-8 w-8 animate-spin text-emerald-600 mb-4" />
                      <p className="text-gray-500">Loading books...</p>
                    </div>
                  ) : books.length === 0 ? (
                    <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-lg shadow-sm">
                      <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <h2 className="text-xl font-medium mb-2">No books found</h2>
                      <p className="text-gray-500 mb-4">This user hasn't listed any books yet.</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {books.map((book) => (
                        <Card key={book.id} className="overflow-hidden">
                          <div className="relative h-48 bg-gray-100 dark:bg-gray-700">
                            {book.cover_image ? (
                              <Image
                                src={book.cover_image || "/placeholder.svg"}
                                alt={book.title}
                                fill
                                className="object-cover"
                                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                              />
                            ) : (
                              <div className="flex h-full items-center justify-center">
                                <BookOpen className="h-12 w-12 text-gray-400" />
                              </div>
                            )}
                            <Badge
                              className="absolute top-2 right-2"
                              variant={
                                book.listing_type === "Exchange"
                                  ? "default"
                                  : book.listing_type === "Sell"
                                    ? "secondary"
                                    : "outline"
                              }
                            >
                              {book.listing_type}
                            </Badge>
                          </div>
                          <CardHeader>
                            <CardTitle className="line-clamp-1">{book.title}</CardTitle>
                            <p className="text-sm text-gray-500">By {book.author}</p>
                          </CardHeader>
                          <CardContent>
                            {book.description && (
                              <p className="text-sm text-gray-500 line-clamp-2 mb-2">{book.description}</p>
                            )}
                            <div className="flex items-center gap-2 mt-2">
                              <Badge variant="outline">{book.condition}</Badge>
                              {book.listing_type === "Sell" && book.price && (
                                <Badge variant="secondary">${book.price.toFixed(2)}</Badge>
                              )}
                            </div>
                          </CardContent>
                          <CardFooter>
                            {user ? (
                              <Button className="w-full">
                                {book.listing_type === "Exchange" ? (
                                  <>
                                    <RefreshCw className="mr-2 h-4 w-4" /> Request Swap
                                  </>
                                ) : book.listing_type === "Sell" ? (
                                  "Purchase"
                                ) : (
                                  "Request Book"
                                )}
                              </Button>
                            ) : (
                              <Button asChild variant="outline" className="w-full">
                                <Link href="/login">Sign in to interact</Link>
                              </Button>
                            )}
                          </CardFooter>
                        </Card>
                      ))}
                    </div>
                  )}
                </TabsContent>
              </Tabs>
            </>
          )}
        </div>
      </main>
      <Footer />
    </div>
  )
}
