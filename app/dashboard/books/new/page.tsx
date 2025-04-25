"use client"
import { useRouter } from "next/navigation"
import { useAuth } from "@/contexts/auth-context"
import { DashboardTitle } from "@/components/dashboard/title"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertCircle, ArrowLeft } from "lucide-react"

export default function NewBookPage() {
  const { user } = useAuth()
  const router = useRouter()

  // If not logged in, show error
  if (!user) {
    return (
      <div className="space-y-6">
        <DashboardTitle title="Add New Book" description="List a book for sale, swap, or donation" />
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>You must be logged in to add a book</AlertDescription>
        </Alert>
        <Button variant="outline" onClick={() => router.push("/login")}>
          Go to Login
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <DashboardTitle title="Add New Book" description="List a book for sale, swap, or donation" />
        <Button variant="outline" onClick={() => router.push("/dashboard/books")}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Books
        </Button>
      </div>

      <Card className="p-6">
        <div className="text-center p-8">
          <h2 className="text-xl font-semibold mb-4">Simplified Book Form</h2>
          <p className="mb-4">
            We're experiencing technical difficulties with the full book form. Our team is working on it.
          </p>
          <Button onClick={() => router.push("/dashboard/books")}>Return to Books</Button>
        </div>
      </Card>
    </div>
  )
}
