import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { ArrowRight } from "lucide-react"

export function HeroSection() {
  return (
    <section className="relative bg-gradient-to-br from-gray-50 to-white py-20 lg:py-32">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left Content */}
          <div className="space-y-8">
            <div className="inline-flex items-center px-4 py-2 rounded-full bg-emerald-100 text-emerald-800 text-sm font-medium">
              <div className="w-2 h-2 bg-emerald-500 rounded-full mr-2"></div>
              Find Your Next Read
            </div>

            <div className="space-y-6">
              <h1 className="text-4xl lg:text-6xl font-bold text-gray-900 leading-tight">
                Share Books,
                <br />
                Convert Readers,
                <br />
                And <span className="bg-emerald-500 text-white px-3 py-1 rounded-lg">Connect.</span>
              </h1>

              <p className="text-xl text-gray-600 leading-relaxed max-w-lg">
                Buy, sell, donate, or exchange books with fellow readers. Join BookSwap and give your books a new life.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              <Link href="/books">
                <Button size="lg" className="bg-black hover:bg-gray-800 text-white px-8 py-3 rounded-full">
                  View Books
                </Button>
              </Link>
              <Link href="/signup">
                <Button size="lg" variant="ghost" className="text-gray-700 hover:text-gray-900 px-8 py-3">
                  Learn More
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
            </div>
          </div>

          {/* Right Image */}
          <div className="relative">
            <div className="relative rounded-2xl overflow-hidden shadow-2xl">
              <Image
                src="/colorful-bookshelf.png"
                alt="Colorful bookshelf with organized books"
                width={600}
                height={400}
                className="w-full h-auto object-cover"
                priority
              />
            </div>
            {/* Decorative elements */}
            <div className="absolute -top-4 -right-4 w-24 h-24 bg-emerald-200 rounded-full opacity-60 blur-xl"></div>
            <div className="absolute -bottom-4 -left-4 w-32 h-32 bg-blue-200 rounded-full opacity-40 blur-xl"></div>
          </div>
        </div>
      </div>
    </section>
  )
}
