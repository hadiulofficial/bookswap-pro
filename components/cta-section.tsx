import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ArrowRight } from "lucide-react"
import Link from "next/link"

export function CtaSection() {
  return (
    <section className="py-24 sm:py-32 bg-emerald-600">
      <div className="container">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
            Ready to start your book trading journey?
          </h2>
          <p className="mx-auto mt-6 max-w-xl text-lg leading-8 text-emerald-100">
            Join thousands of book lovers who are already buying, selling, donating, and exchanging books on BookSwap.
          </p>
          <div className="mt-10 flex items-center justify-center gap-x-6">
            <Button size="lg" variant="secondary" asChild>
              <Link href="/signup">
                Get Started Free
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <Button
              variant="outline"
              size="lg"
              className="border-white text-white hover:bg-white hover:text-emerald-600 bg-transparent"
              asChild
            >
              <Link href="/books">Browse Books</Link>
            </Button>
          </div>

          {/* Newsletter Signup */}
          <div className="mt-16 sm:mt-20">
            <div className="mx-auto max-w-md">
              <h3 className="text-lg font-semibold text-white mb-4">Stay updated</h3>
              <div className="flex gap-x-4">
                <Input
                  type="email"
                  placeholder="Enter your email"
                  className="bg-white/10 border-white/20 text-white placeholder:text-emerald-100"
                />
                <Button variant="secondary" size="sm">
                  Subscribe
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

// Export alias for compatibility
export { CtaSection as CTASection }
