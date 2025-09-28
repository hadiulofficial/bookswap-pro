import { Suspense } from "react"
import { createServerComponentClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import { redirect, notFound } from "next/navigation"
import { EditBookForm } from "./edit-book-form"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"

interface EditBookPageProps {
  params: {
    id: string
  }
}

export default async function EditBookPage({ params }: EditBookPageProps) {
  const supabase = createServerComponentClient({ cookies })

  const {
    data: { session },
  } = await supabase.auth.getSession()

  if (!session) {
    redirect("/login")
  }

  // Fetch book data
  const { data: book, error: bookError } = await supabase
    .from("books")
    .select(`
      *,
      categories (
        id,
        name
      )
    `)
    .eq("id", params.id)
    .eq("user_id", session.user.id)
    .single()

  if (bookError || !book) {
    console.error("Error fetching book:", bookError)
    notFound()
  }

  // Fetch categories for the form
  const { data: categories, error: categoriesError } = await supabase.from("categories").select("*").order("name")

  if (categoriesError) {
    console.error("Error fetching categories:", categoriesError)
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Edit Book</h1>
        <p className="text-muted-foreground">Update your book details</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Book Information</CardTitle>
          <CardDescription>Update the details for "{book.title}"</CardDescription>
        </CardHeader>
        <CardContent>
          <Suspense fallback={<EditBookFormSkeleton />}>
            <EditBookForm book={book} categories={categories || []} />
          </Suspense>
        </CardContent>
      </Card>
    </div>
  )
}

function EditBookFormSkeleton() {
  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Skeleton className="h-4 w-16" />
          <Skeleton className="h-10 w-full" />
        </div>
        <div className="space-y-2">
          <Skeleton className="h-4 w-16" />
          <Skeleton className="h-10 w-full" />
        </div>
      </div>
      <div className="space-y-2">
        <Skeleton className="h-4 w-20" />
        <Skeleton className="h-20 w-full" />
      </div>
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="space-y-2">
          <Skeleton className="h-4 w-16" />
          <Skeleton className="h-10 w-full" />
        </div>
        <div className="space-y-2">
          <Skeleton className="h-4 w-16" />
          <Skeleton className="h-10 w-full" />
        </div>
        <div className="space-y-2">
          <Skeleton className="h-4 w-16" />
          <Skeleton className="h-10 w-full" />
        </div>
      </div>
      <Skeleton className="h-10 w-32" />
    </div>
  )
}
