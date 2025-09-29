"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { supabase } from "@/lib/supabase/client"

export default function SignUpPage() {
  const [isLoading, setIsLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState("")
  const router = useRouter()

  const handleGoogleSignUp = async () => {
    setIsLoading(true)
    setErrorMessage("")

    try {
      console.log("Starting Google sign up...")

      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
          queryParams: {
            access_type: "offline",
            prompt: "consent",
          },
        },
      })

      console.log("Google sign up response:", { data, error })

      if (error) {
        console.error("Google sign up error:", error)
        throw error
      }

      console.log("Google sign up initiated successfully")
    } catch (error: any) {
      console.error("Sign up error:", error)
      setErrorMessage(error.message || "Failed to sign up with Google. Please try again.")
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 py-16 md:py-24 bg-gray-50 dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col items-center justify-center space-y-4 text-center mb-8">
            <div className="space-y-2 max-w-[600px]">
              <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">Join BookSwap</h1>
              <p className="text-gray-500 md:text-xl dark:text-gray-400">
                Create your account and start your book exchange journey today.
              </p>
            </div>
          </div>

          <div className="max-w-md mx-auto">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 md:p-8">
              <div className="space-y-6">
                {errorMessage && (
                  <Alert variant="destructive">
                    <AlertDescription>{errorMessage}</AlertDescription>
                  </Alert>
                )}

                <div className="flex flex-col gap-4">
                  <Button
                    onClick={handleGoogleSignUp}
                    disabled={isLoading}
                    className="w-full flex items-center justify-center gap-2 py-6 bg-white hover:bg-gray-50 text-gray-900 border border-gray-300"
                  >
                    <svg className="h-5 w-5" viewBox="0 0 24 24">
                      <path
                        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                        fill="#4285F4"
                      />
                      <path
                        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                        fill="#34A853"
                      />
                      <path
                        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                        fill="#FBBC05"
                      />
                      <path
                        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                        fill="#EA4335"
                      />
                    </svg>
                    {isLoading ? "Creating account..." : "Sign up with Google"}
                  </Button>
                </div>

                <div className="text-center text-sm text-gray-500 dark:text-gray-400">
                  By signing up, you agree to our{" "}
                  <Link href="/terms" className="text-emerald-600 hover:underline">
                    Terms of Service
                  </Link>{" "}
                  and{" "}
                  <Link href="/privacy" className="text-emerald-600 hover:underline">
                    Privacy Policy
                  </Link>
                </div>
              </div>
            </div>
            <div className="mt-6 text-center">
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Already have an account?{" "}
                <Link href="/login" className="text-emerald-600 hover:underline font-medium">
                  Sign in
                </Link>
              </p>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}
