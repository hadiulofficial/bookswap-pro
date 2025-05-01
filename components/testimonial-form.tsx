"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { saveTestimonial, deleteTestimonial } from "@/app/actions/testimonial-actions"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Star } from "lucide-react"
import { cn } from "@/lib/utils"
import { AlertCircle, CheckCircle2 } from "lucide-react"

interface TestimonialFormProps {
  existingTestimonial?: {
    id: string
    content: string
    rating: number
  } | null
}

export function TestimonialForm({ existingTestimonial }: TestimonialFormProps) {
  const router = useRouter()
  const [rating, setRating] = useState(existingTestimonial?.rating || 0)
  const [content, setContent] = useState(existingTestimonial?.content || "")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null)
  const [charCount, setCharCount] = useState(existingTestimonial?.content?.length || 0)

  const handleContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newContent = e.target.value
    setContent(newContent)
    setCharCount(newContent.length)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setMessage(null)

    try {
      const formData = new FormData()
      formData.append("rating", rating.toString())
      formData.append("content", content)

      const result = await saveTestimonial(formData)

      if (result.success) {
        setMessage({ type: "success", text: result.message })
        router.refresh()
      } else {
        setMessage({ type: "error", text: result.message })
      }
    } catch (error) {
      setMessage({ type: "error", text: "An unexpected error occurred. Please try again." })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete your review?")) {
      return
    }

    setIsDeleting(true)
    setMessage(null)

    try {
      const result = await deleteTestimonial()

      if (result.success) {
        setMessage({ type: "success", text: result.message })
        setRating(0)
        setContent("")
        setCharCount(0)
        router.refresh()
      } else {
        setMessage({ type: "error", text: result.message })
      }
    } catch (error) {
      setMessage({ type: "error", text: "An unexpected error occurred. Please try again." })
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>{existingTestimonial ? "Edit Your Review" : "Share Your Experience"}</CardTitle>
        <CardDescription>
          {existingTestimonial
            ? "Update your review and rating of BookSwap"
            : "Tell others about your experience with BookSwap"}
        </CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <div className="text-sm font-medium">Your Rating</div>
            <div className="flex gap-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <button key={star} type="button" onClick={() => setRating(star)} className="p-1 focus:outline-none">
                  <Star
                    className={cn(
                      "h-8 w-8 transition-all",
                      rating >= star
                        ? "fill-yellow-400 text-yellow-400"
                        : "text-gray-300 hover:fill-yellow-200 hover:text-yellow-300",
                    )}
                  />
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <div className="text-sm font-medium">Your Review</div>
            <Textarea
              value={content}
              onChange={handleContentChange}
              placeholder="Share your thoughts about BookSwap..."
              className="min-h-[120px] resize-none"
              maxLength={500}
            />
            <div className="text-xs text-gray-500 text-right">{charCount}/500 characters</div>
          </div>

          {message && (
            <div
              className={cn(
                "flex items-center gap-2 p-3 text-sm rounded-md",
                message.type === "success"
                  ? "bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-400"
                  : "bg-red-50 text-red-700 dark:bg-red-900/20 dark:text-red-400",
              )}
            >
              {message.type === "success" ? (
                <CheckCircle2 className="h-4 w-4 flex-shrink-0" />
              ) : (
                <AlertCircle className="h-4 w-4 flex-shrink-0" />
              )}
              {message.text}
            </div>
          )}
        </CardContent>
        <CardFooter className="flex justify-between">
          {existingTestimonial && (
            <Button
              type="button"
              variant="outline"
              onClick={handleDelete}
              disabled={isSubmitting || isDeleting}
              className="text-red-500 hover:text-red-700 hover:bg-red-50"
            >
              {isDeleting ? "Deleting..." : "Delete Review"}
            </Button>
          )}
          <Button
            type="submit"
            disabled={!rating || !content.trim() || isSubmitting || isDeleting}
            className={cn("ml-auto", existingTestimonial ? "" : "w-full")}
          >
            {isSubmitting ? "Saving..." : existingTestimonial ? "Update Review" : "Submit Review"}
          </Button>
        </CardFooter>
      </form>
    </Card>
  )
}
