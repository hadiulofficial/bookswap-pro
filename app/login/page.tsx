"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { supabase } from "@/lib/supabase/client"
import { useAuth } from "@/contexts/auth-context"

export default function LoginPage() {
  const [isLoading, setIsLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState("")
  const [successMessage, setSuccessMessage] = useState("")
  const [phoneNumber, setPhoneNumber] = useState("")
  const [otp, setOtp] = useState("")
  const [showOtpInput, setShowOtpInput] = useState(false)
  const router = useRouter()
  const searchParams = useSearchParams()
  const { user, isLoading: authLoading } = useAuth()

  // Check for error in URL params
  useEffect(() => {
    const error = searchParams.get("error")
    if (error) {
      setErrorMessage(decodeURIComponent(error))
    }
  }, [searchParams])

  // Redirect if already logged in
  useEffect(() => {
    if (!authLoading && user) {
      console.log("User already logged in, redirecting to dashboard")
      router.push("/dashboard")
    }
  }, [user, authLoading, router])

  const handleGoogleSignIn = async () => {
    if (isLoading) return

    setIsLoading(true)
    setErrorMessage("")

    try {
      console.log("Initiating Google sign in...")

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

      if (error) {
        throw error
      }

      console.log("OAuth redirect initiated")
    } catch (error: any) {
      console.error("Login error:", error)
      setErrorMessage(error.message || "Failed to sign in with Google")
      setIsLoading(false)
    }
  }

  const handlePhoneSignIn = async () => {
    if (isLoading || !phoneNumber) return

    setIsLoading(true)
    setErrorMessage("")
    setSuccessMessage("")

    try {
      // Validate phone number format
      const cleanPhone = phoneNumber.replace(/\D/g, "")
      if (cleanPhone.length < 10) {
        throw new Error("Please enter a valid phone number")
      }

      // Format phone number with country code if not present
      const formattedPhone = cleanPhone.startsWith("1") ? `+${cleanPhone}` : `+1${cleanPhone}`

      console.log("Sending OTP to:", formattedPhone)

      const { error } = await supabase.auth.signInWithOtp({
        phone: formattedPhone,
      })

      if (error) {
        throw error
      }

      setShowOtpInput(true)
      setSuccessMessage("OTP sent to your phone number. Please check your messages.")
    } catch (error: any) {
      console.error("Phone sign in error:", error)
      setErrorMessage(error.message || "Failed to send OTP")
    } finally {
      setIsLoading(false)
    }
  }

  const handleOtpVerification = async () => {
    if (isLoading || !otp || !phoneNumber) return

    setIsLoading(true)
    setErrorMessage("")

    try {
      const cleanPhone = phoneNumber.replace(/\D/g, "")
      const formattedPhone = cleanPhone.startsWith("1") ? `+${cleanPhone}` : `+1${cleanPhone}`

      console.log("Verifying OTP for:", formattedPhone)

      const { error } = await supabase.auth.verifyOtp({
        phone: formattedPhone,
        token: otp,
        type: "sms",
      })

      if (error) {
        throw error
      }

      console.log("OTP verified successfully")
      // The auth context will handle the redirect
    } catch (error: any) {
      console.error("OTP verification error:", error)
      setErrorMessage(error.message || "Failed to verify OTP")
      setIsLoading(false)
    }
  }

  const resetPhoneAuth = () => {
    setShowOtpInput(false)
    setOtp("")
    setPhoneNumber("")
    setErrorMessage("")
    setSuccessMessage("")
  }

  // Show loading if auth is still initializing
  if (authLoading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-1 flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-emerald-600"></div>
        </main>
        <Footer />
      </div>
    )
  }

  // Don't render if user is already logged in (will redirect)
  if (user) {
    return null
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 py-16 md:py-24 bg-gray-50 dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col items-center justify-center space-y-4 text-center mb-8">
            <div className="space-y-2 max-w-[600px]">
              <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">Welcome Back</h1>
              <p className="text-gray-500 md:text-xl dark:text-gray-400">
                Sign in to your BookSwap account to continue your reading journey.
              </p>
            </div>
          </div>

          <div className="max-w-md mx-auto">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 md:p-8">
              <Tabs defaultValue="google" className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="google">Google</TabsTrigger>
                  <TabsTrigger value="phone">Phone</TabsTrigger>
                </TabsList>

                <div className="mt-6 space-y-4">
                  {errorMessage && (
                    <Alert variant="destructive">
                      <AlertDescription>{errorMessage}</AlertDescription>
                    </Alert>
                  )}

                  {successMessage && (
                    <Alert>
                      <AlertDescription>{successMessage}</AlertDescription>
                    </Alert>
                  )}

                  <TabsContent value="google" className="space-y-4">
                    <Button
                      onClick={handleGoogleSignIn}
                      disabled={isLoading}
                      className="w-full flex items-center justify-center gap-2 py-6"
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
                      {isLoading ? "Signing in..." : "Sign in with Google"}
                    </Button>
                  </TabsContent>

                  <TabsContent value="phone" className="space-y-4">
                    {!showOtpInput ? (
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor="phone">Phone Number</Label>
                          <Input
                            id="phone"
                            type="tel"
                            placeholder="(555) 123-4567"
                            value={phoneNumber}
                            onChange={(e) => setPhoneNumber(e.target.value)}
                            disabled={isLoading}
                          />
                          <p className="text-xs text-gray-500">We'll send you a verification code via SMS</p>
                        </div>
                        <Button
                          onClick={handlePhoneSignIn}
                          disabled={isLoading || !phoneNumber}
                          className="w-full py-6"
                        >
                          {isLoading ? "Sending OTP..." : "Send Verification Code"}
                        </Button>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor="otp">Verification Code</Label>
                          <Input
                            id="otp"
                            type="text"
                            placeholder="123456"
                            value={otp}
                            onChange={(e) => setOtp(e.target.value)}
                            disabled={isLoading}
                            maxLength={6}
                          />
                          <p className="text-xs text-gray-500">Enter the 6-digit code sent to {phoneNumber}</p>
                        </div>
                        <div className="space-y-2">
                          <Button onClick={handleOtpVerification} disabled={isLoading || !otp} className="w-full py-6">
                            {isLoading ? "Verifying..." : "Verify Code"}
                          </Button>
                          <Button
                            onClick={resetPhoneAuth}
                            variant="outline"
                            disabled={isLoading}
                            className="w-full bg-transparent"
                          >
                            Use Different Number
                          </Button>
                        </div>
                      </div>
                    )}
                  </TabsContent>
                </div>
              </Tabs>
            </div>
            <div className="mt-6 text-center">
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Don't have an account?{" "}
                <Link href="/signup" className="text-emerald-600 hover:underline font-medium">
                  Sign up
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
