import { createServerComponentClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

export const dynamic = "force-dynamic"

export default async function BooksPage() {
  const supabase = createServerComponentClient({ cookies })

  // Get the current session
  const {
    data: { session },
  } = await supabase.auth.getSession()

  if (!session) {
    return (
      <div className="container mx-auto py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">You must be logged in to view your books</h1>
          <Link href="/login">
            <Button>Log In</Button>
          </Link>
        </div>
      </div>
    )
  }

  // Get the user's books
  const { data: books, error } = await supabase
    .from("books")
    .select("*")
    .eq("owner_id", session.user.id)
    .order("created_at", { ascending: false })

  if (error) {
    console.error("Error fetching books:", error)
    return (
      <div className="container mx-auto py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Error fetching books</h1>
          <p className="text-red-500">{error.message}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">My Books</h1>
        <div className="flex gap-2">
          <Link href="/dashboard/books/new">
            <Button variant="outline">Add Book (Original)</Button>
          </Link>
          <Link href="/dashboard/books/add-fixed">
            <Button>Add Book (Fixed)</Button>
          </Link>
        </div>
      </div>

      {books.length === 0 ? (
        <div className="text-center py-12">
          <h2 className="text-xl font-medium mb-2">You haven't added any books yet</h2>
          <p className="text-gray-500 mb-4">Add your first book to start exchanging with others</p>
          <Link href="/dashboard/books/add-fixed">
            <Button>Add Your First Book</Button>
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {books.map((book) => (
            <Card key={book.id}>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <CardTitle className="text-xl">{book.title}</CardTitle>
                  <Badge
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
              </CardHeader>
              <CardContent>
                <p className="font-medium">By {book.author}</p>
                {book.description && <p className="text-gray-500 mt-2 line-clamp-3">{book.description}</p>}
                <div className="mt-4 flex items-center gap-2">
                  <Badge variant="outline">{book.condition}</Badge>
                  <Badge
                    variant={
                      book.status === "Available" ? "success" : book.status === "Reserved" ? "warning" : "secondary"
                    }
                  >
                    {book.status}
                  </Badge>
                </div>
              </CardContent>
              <CardFooter className="flex justify-between">
                <Button variant="outline" size="sm">
                  View Details
                </Button>
                <Button variant="ghost" size="sm">
                  Edit
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
