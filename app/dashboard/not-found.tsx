"use client"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { FileQuestion, Home, ArrowLeft, Construction } from "lucide-react"
import { DashboardTitle } from "@/components/dashboard/title"

export default function DashboardNotFound() {
  const router = useRouter()

  return (
    <div className="space-y-8">
      <DashboardTitle
        title="Page Not Found"
        description="The page you're looking for doesn't exist or is still under construction"
      />

      <div className="flex items-center justify-center py-8">
        <Card className="max-w-md w-full">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <div className="rounded-full bg-amber-100 p-4 dark:bg-amber-900/20">
                <FileQuestion className="h-12 w-12 text-amber-600" />
              </div>
            </div>
            <CardTitle className="text-2xl">Page Not Found</CardTitle>
            <CardDescription>This feature is currently under development and will be available soon.</CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <div className="flex items-center justify-center gap-2 mb-4 text-amber-600 bg-amber-50 dark:bg-amber-900/10 p-3 rounded-md">
              <Construction className="h-5 w-5" />
              <p className="text-sm">We're working hard to bring this feature to you!</p>
            </div>
            <p className="text-gray-500 dark:text-gray-400">
              In the meantime, you can explore other sections of the dashboard or return to the home page.
            </p>
          </CardContent>
          <CardFooter className="flex justify-center gap-4">
            <Button variant="outline" onClick={() => router.back()}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Go Back
            </Button>
            <Button onClick={() => router.push("/dashboard")}>
              <Home className="mr-2 h-4 w-4" />
              Dashboard
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  )
}
