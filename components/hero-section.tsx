import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowRight, BookOpen, Users, Repeat } from "lucide-react"

export function HeroSection() {
  return (
    <section className="relative bg-gradient-to-br from-emerald-50 to-teal-50 py-20 sm:py-32">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h1 className="text-4xl sm:text-6xl font-bold text-gray-900 mb-6">
            Your Books Deserve a<span className="text-emerald-600 block">Second Chapter</span>
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            Join thousands of book lovers in buying, selling, donating, and exchanging books. Find your next great read
            or give your books a new home.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            <Link href="/signup">
              <Button size="lg" className="bg-emerald-600 hover:bg-emerald-700">
                Start Trading Books
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <Link href="/books">
              <Button size="lg" variant="outline">
                Browse Books
              </Button>
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 max-w-4xl mx-auto">
            <div className="flex flex-col items-center">
              <div className="bg-emerald-100 p-4 rounded-full mb-4">
                <BookOpen className="h-8 w-8 text-emerald-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">50,000+ Books</h3>
              <p className="text-gray-600 text-center">Discover a vast collection of books across all genres</p>
            </div>

            <div className="flex flex-col items-center">
              <div className="bg-emerald-100 p-4 rounded-full mb-4">
                <Users className="h-8 w-8 text-emerald-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">10,000+ Users</h3>
              <p className="text-gray-600 text-center">Connect with fellow book enthusiasts in your area</p>
            </div>

            <div className="flex flex-col items-center">
              <div className="bg-emerald-100 p-4 rounded-full mb-4">
                <Repeat className="h-8 w-8 text-emerald-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">25,000+ Swaps</h3>
              <p className="text-gray-600 text-center">Books successfully traded between our community</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
