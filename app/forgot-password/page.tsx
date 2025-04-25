"use client"

import type React from "react"

import { useState } from "react"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { CheckCircle } from "lucide-react"

export default function ForgotPasswordPage() {
  const [isLoading, setIsLoading] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [email, setEmail] = useState("")

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsLoading(true)

    // Simulate API call
    setTimeout(() => {
      setIsLoading(false)
      setIsSubmitted(true)
    }, 1500)
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 py-16 md:py-24 bg-gray-50 dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col items-center justify-center space-y-4 text-center mb-8">
            <div className="space-y-2 max-w-[600px]">
              <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">Reset Your Password</h1>
              <p className="text-gray-500 md:text-xl dark:text-gray-400">
                Enter your email address and we'll send you a link to reset your password.
              </p>
            </div>
          </div>

          <div className="max-w-md mx-auto">
            {isSubmitted ? (
              <div className="space-y-6">
                <Alert className="bg-emerald-50 border-emerald-200 dark:bg-emerald-950/30 dark:border-emerald-900">
                  <CheckCircle className="h-5 w-5 text-emerald-600" />
                  <AlertTitle className="text-emerald-800 dark:text-emerald-400">Check your email</AlertTitle>
                  <AlertDescription className="text-emerald-700 dark:text-emerald-300">
                    We've sent a password reset link to <span className="font-medium">{email}</span>. The link will
                    expire in 1 hour.
                  </AlertDescription>
                </Alert>
                <div className="text-center">
                  <Button variant="link" asChild>
                    <Link href="/login" className="text-emerald-600 inline-flex items-center">
                      <ArrowLeft className="mr-2 h-4 w-4" />
                      Back to login
                    </Link>
                  </Button>
                </div>
              </div>
            ) : (
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 md:p-8">
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">Email address</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="john.doe@example.com"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                    />
                  </div>
                  <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading ? "Sending reset link..." : "Send reset link"}
                  </Button>
                </form>
                <div className="mt-6 text-center">
                  <Button variant="link" asChild>
                    <Link href="/login" className="text-emerald-600 inline-flex items-center">
                      <ArrowLeft className="mr-2 h-4 w-4" />
                      Back to login
                    </Link>
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}
