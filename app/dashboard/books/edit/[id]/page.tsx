import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { EditBookForm } from "./edit-book-form"

async function getBook(id: string) {
  const supabase = await createClient()

  try {
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      redirect("/login")
    }

    const { data: book, error } = await supabase.from("books").select("*").eq("id", id).eq("user_id", user.id).single()

    if (error || !book) {
      redirect("/dashboard/books")
    }

    return book
  } catch (error) {
    console.error("Error fetching book:", error)
    redirect("/dashboard/books")
  }
}

export default async function EditBookPage({
  params,
}: {
  params: { id: string }
}) {
  const book = await getBook(params.id)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Edit Book</h1>
        <p className="text-gray-600">Update your book listing</p>
      </div>

      <EditBookForm book={book} />
    </div>
  )
}
