"use client"

import type React from "react"

import { useState } from "react"
import Link from "next/link"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { MessageCircle, Clock, Send, CheckCircle2, Facebook, Twitter, Instagram, Linkedin } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

export default function ContactPage() {
  const [formState, setFormState] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [error, setError] = useState("")

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormState({
      ...formState,
      [e.target.name]: e.target.value,
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError("")

    // Simulate form submission
    try {
      await new Promise((resolve) => setTimeout(resolve, 1500))
      setIsSubmitted(true)
      setFormState({
        name: "",
        email: "",
        subject: "",
        message: "",
      })
    } catch (err) {
      setError("There was an error submitting your message. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1">
        {/* Hero Section */}
        <section className="py-16 md:py-24 bg-gradient-to-b from-white to-gray-50 dark:from-gray-950 dark:to-gray-900">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col items-center justify-center space-y-4 text-center mb-12">
              <div className="space-y-3 max-w-[800px]">
                <div className="inline-block rounded-lg bg-emerald-100 px-3 py-1 text-sm text-emerald-700 dark:bg-emerald-800/30 dark:text-emerald-400">
                  Get in Touch
                </div>
                <h1 className="text-4xl font-bold tracking-tighter sm:text-5xl md:text-6xl">Contact Us</h1>
                <p className="text-gray-500 md:text-xl dark:text-gray-400">
                  Have questions about BookSwap? We're here to help. Reach out to our team and we'll get back to you as
                  soon as possible.
                </p>
              </div>
            </div>

            <div className="grid gap-8 lg:grid-cols-2">
              {/* Contact Form */}
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 md:p-8">
                {isSubmitted ? (
                  <Alert className="bg-emerald-50 border-emerald-200 dark:bg-emerald-950/30 dark:border-emerald-900">
                    <CheckCircle2 className="h-5 w-5 text-emerald-600" />
                    <AlertTitle className="text-emerald-800 dark:text-emerald-400">Message Sent!</AlertTitle>
                    <AlertDescription className="text-emerald-700 dark:text-emerald-300">
                      Thank you for reaching out. We've received your message and will get back to you shortly.
                    </AlertDescription>
                  </Alert>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="space-y-4">
                      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                        <div className="space-y-2">
                          <Label htmlFor="name">Your Name</Label>
                          <Input
                            id="name"
                            name="name"
                            placeholder="John Doe"
                            required
                            value={formState.name}
                            onChange={handleChange}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="email">Email Address</Label>
                          <Input
                            id="email"
                            name="email"
                            type="email"
                            placeholder="john.doe@example.com"
                            required
                            value={formState.email}
                            onChange={handleChange}
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="subject">Subject</Label>
                        <Input
                          id="subject"
                          name="subject"
                          placeholder="How can we help you?"
                          required
                          value={formState.subject}
                          onChange={handleChange}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="message">Message</Label>
                        <Textarea
                          id="message"
                          name="message"
                          placeholder="Tell us more about your inquiry..."
                          rows={6}
                          required
                          value={formState.message}
                          onChange={handleChange}
                        />
                      </div>
                    </div>
                    {error && (
                      <Alert variant="destructive">
                        <AlertDescription>{error}</AlertDescription>
                      </Alert>
                    )}
                    <Button type="submit" className="w-full" disabled={isSubmitting}>
                      {isSubmitting ? "Sending..." : "Send Message"}
                      <Send className="ml-2 h-4 w-4" />
                    </Button>
                  </form>
                )}
              </div>

              {/* Contact Information */}
              <div className="space-y-6">
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-start gap-4">
                      <div className="rounded-full bg-emerald-100 p-3 dark:bg-emerald-800/30">
                        <MessageCircle className="h-5 w-5 text-emerald-600" />
                      </div>
                      <div>
                        <h3 className="font-medium">Contact via Telegram</h3>
                        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                          <a
                            href="https://t.me/+447476933400"
                            className="hover:text-emerald-600 transition-colors"
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            +44 7476 933400
                          </a>
                        </p>
                        <p className="mt-2 text-xs text-gray-400 dark:text-gray-500">
                          Click to chat with us on Telegram
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-start gap-4">
                      <div className="rounded-full bg-emerald-100 p-3 dark:bg-emerald-800/30">
                        <Clock className="h-5 w-5 text-emerald-600" />
                      </div>
                      <div>
                        <h3 className="font-medium">Response Time</h3>
                        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                          We typically respond within 24 hours
                          <br />
                          Monday - Sunday
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <div className="mt-6">
                  <h3 className="font-medium mb-3">Follow Us</h3>
                  <div className="flex gap-4">
                    <Link
                      href="#"
                      className="rounded-full bg-gray-100 p-3 text-gray-600 hover:bg-emerald-100 hover:text-emerald-600 transition-colors dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-emerald-800/30 dark:hover:text-emerald-400"
                    >
                      <Facebook className="h-5 w-5" />
                      <span className="sr-only">Facebook</span>
                    </Link>
                    <Link
                      href="#"
                      className="rounded-full bg-gray-100 p-3 text-gray-600 hover:bg-emerald-100 hover:text-emerald-600 transition-colors dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-emerald-800/30 dark:hover:text-emerald-400"
                    >
                      <Twitter className="h-5 w-5" />
                      <span className="sr-only">Twitter</span>
                    </Link>
                    <Link
                      href="#"
                      className="rounded-full bg-gray-100 p-3 text-gray-600 hover:bg-emerald-100 hover:text-emerald-600 transition-colors dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-emerald-800/30 dark:hover:text-emerald-400"
                    >
                      <Instagram className="h-5 w-5" />
                      <span className="sr-only">Instagram</span>
                    </Link>
                    <Link
                      href="#"
                      className="rounded-full bg-gray-100 p-3 text-gray-600 hover:bg-emerald-100 hover:text-emerald-600 transition-colors dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-emerald-800/30 dark:hover:text-emerald-400"
                    >
                      <Linkedin className="h-5 w-5" />
                      <span className="sr-only">LinkedIn</span>
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Map Section */}
        <section className="py-12 bg-white dark:bg-gray-950">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col items-center justify-center space-y-4 text-center mb-8">
              <h2 className="text-2xl font-bold tracking-tighter sm:text-3xl">We're Here to Help</h2>
              <p className="text-gray-500 dark:text-gray-400">Reach out via Telegram for the fastest response.</p>
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section className="py-16 md:py-24 bg-gray-50 dark:bg-gray-900">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col items-center justify-center space-y-4 text-center mb-12">
              <div className="space-y-3 max-w-[800px]">
                <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl">Frequently Asked Questions</h2>
                <p className="text-gray-500 dark:text-gray-400">
                  Can't find the answer you're looking for? Reach out to our customer support team.
                </p>
              </div>
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:gap-8">
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
                <h3 className="text-lg font-medium mb-2">How do I list a book for exchange?</h3>
                <p className="text-gray-500 dark:text-gray-400">
                  After creating an account, navigate to your dashboard and click on "Add Book." Fill out the book
                  details, condition, and whether you want to sell, donate, or exchange it.
                </p>
              </div>
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
                <h3 className="text-lg font-medium mb-2">Is BookSwap available internationally?</h3>
                <p className="text-gray-500 dark:text-gray-400">
                  Yes! BookSwap is available worldwide. However, most exchanges happen locally to avoid shipping costs.
                  You can filter searches by location to find books near you.
                </p>
              </div>
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
                <h3 className="text-lg font-medium mb-2">How does the rating system work?</h3>
                <p className="text-gray-500 dark:text-gray-400">
                  After completing a transaction, both parties can rate each other based on communication, book
                  condition accuracy, and overall experience. These ratings help build trust in the community.
                </p>
              </div>
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
                <h3 className="text-lg font-medium mb-2">What if I receive a book in poor condition?</h3>
                <p className="text-gray-500 dark:text-gray-400">
                  If there's a significant discrepancy between the listed condition and what you received, please
                  contact the seller first. If you can't resolve the issue, our support team can help mediate.
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  )
}
