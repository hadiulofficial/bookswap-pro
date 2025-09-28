import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowRight, BookOpen } from "lucide-react"

export function CtaSection() {
  return (
    <section className="py-20 bg-gradient-to-r from-emerald-600 to-teal-600">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <BookOpen className="h-16 w-16 text-white mx-auto mb-8" />
        <h2 className="text-3xl sm:text-4xl font-bold text-white mb-6">Ready to Start Your Book Journey?</h2>
        <p className="text-xl text-emerald-100 mb-8 max-w-2xl mx-auto">
          Join thousands of book lovers who are already sharing, discovering, and connecting through BookSwap.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link href="/signup">
            <Button size="lg" className="bg-white text-emerald-600 hover:bg-gray-100 px-8 py-3">
              Get Started Free
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </Link>
          <Link href="/books">
            <Button
              size="lg"
              variant="outline"
              className="border-white text-white hover:bg-white hover:text-emerald-600 px-8 py-3 bg-transparent"
            >
              Browse Books
            </Button>
          </Link>
        </div>
      </div>
    </section>
  )
}
