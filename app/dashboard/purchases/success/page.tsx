"use client"

import { useEffect, useState } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import Link from "next/link"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { CheckCircle, Loader2, ShoppingBag, Home } from "lucide-react"

export default function PurchaseSuccessPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const sessionId = searchParams.get("session_id")
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // In a real implementation, we would verify the payment with Stripe
    // and update the order status in the database
    const timer = setTimeout(() => {
      setLoading(false)
    }, 1500)

    return () => clearTimeout(timer)
  }, [sessionId])

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-1 flex items-center justify-center">
          <div className="flex flex-col items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-emerald-600 mb-3" />
            <p className="text-gray-500 text-sm">Confirming your purchase...</p>
          </div>
        </main>
        <Footer />
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 bg-gray-50 dark:bg-gray-900 py-12">
        <div className="max-w-md mx-auto px-4">
          <Card className="border-green-100 shadow-md">
            <CardHeader className="text-center pb-2">
              <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-2" />
              <CardTitle className="text-2xl text-green-700">Purchase Successful!</CardTitle>
              <CardDescription>Thank you for your purchase. Your order has been confirmed.</CardDescription>
            </CardHeader>
            <CardContent className="text-center space-y-2 pb-2">
              <p className="text-sm text-gray-600">
                We've sent a confirmation email with all the details of your purchase.
              </p>
              <p className="text-sm text-gray-600">The seller will be notified to ship your book soon.</p>
            </CardContent>
            <CardFooter className="flex flex-col space-y-3">
              <Button asChild className="w-full">
                <Link href="/dashboard/purchases">
                  <ShoppingBag className="mr-2 h-4 w-4" /> View My Purchases
                </Link>
              </Button>
              <Button asChild variant="outline" className="w-full">
                <Link href="/">
                  <Home className="mr-2 h-4 w-4" /> Return to Home
                </Link>
              </Button>
            </CardFooter>
          </Card>
        </div>
      </main>
      <Footer />
    </div>
  )
}
