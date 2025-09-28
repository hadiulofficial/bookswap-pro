import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { ArrowRight, Sparkles } from "lucide-react"

export function HeroSection() {
  return (
    <section className="relative bg-gradient-to-br from-gray-50 via-white to-emerald-50/30 py-20 lg:py-32 overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute inset-0">
        <div className="absolute top-20 left-10 w-72 h-72 bg-emerald-200/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-blue-200/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-gradient-to-r from-emerald-100/10 to-blue-100/10 rounded-full blur-3xl"></div>
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Left Content */}
          <div className="space-y-8 relative z-10">
            <div className="inline-flex items-center px-4 py-2 rounded-full bg-gradient-to-r from-emerald-100 to-emerald-50 border border-emerald-200 text-emerald-800 text-sm font-medium shadow-sm hover:shadow-md transition-shadow duration-300">
              <Sparkles className="w-4 h-4 mr-2 text-emerald-600" />
              Find Your Next Read
            </div>

            <div className="space-y-6">
              <h1 className="text-4xl lg:text-6xl font-bold text-gray-900 leading-tight tracking-tight">
                Share Books,
                <br />
                <span className="text-gray-700">Convert Readers,</span>
                <br />
                And{" "}
                <span className="relative inline-block">
                  <span className="bg-gradient-to-r from-emerald-500 to-emerald-600 text-white px-1 py-0.5 rounded-md shadow-md transform hover:scale-105 transition-transform duration-300">
                    Connect.
                  </span>
                </span>
              </h1>

              <p className="text-xl text-gray-600 leading-relaxed max-w-lg font-light">
                Buy, sell, donate, or exchange books with fellow readers. Join BookSwap and give your books a new life.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              <Link href="/books">
                <Button
                  size="lg"
                  className="bg-black hover:bg-gray-800 text-white px-8 py-4 rounded-full font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 group"
                >
                  View Books
                  <div className="ml-2 transform group-hover:translate-x-1 transition-transform duration-300">→</div>
                </Button>
              </Link>
              <Link href="/signup">
                <Button
                  size="lg"
                  variant="ghost"
                  className="text-gray-700 hover:text-gray-900 hover:bg-gray-100 px-8 py-4 rounded-full font-semibold border border-gray-200 hover:border-gray-300 transition-all duration-300 group"
                >
                  Learn More
                  <ArrowRight className="ml-2 h-5 w-5 transform group-hover:translate-x-1 transition-transform duration-300" />
                </Button>
              </Link>
            </div>

            {/* Trust indicators */}
            <div className="flex items-center space-x-6 pt-4 text-sm text-gray-500">
              <div className="flex items-center space-x-2">
                <div className="flex -space-x-2">
                  <div className="w-8 h-8 bg-emerald-500 rounded-full border-2 border-white"></div>
                  <div className="w-8 h-8 bg-blue-500 rounded-full border-2 border-white"></div>
                  <div className="w-8 h-8 bg-purple-500 rounded-full border-2 border-white"></div>
                </div>
                <span>10,000+ readers</span>
              </div>
              <div className="flex items-center space-x-1">
                <span className="text-yellow-500">★★★★★</span>
                <span>4.9/5 rating</span>
              </div>
            </div>
          </div>

          {/* Right Image */}
          <div className="relative lg:pl-8">
            <div className="relative group">
              {/* Main image container */}
              <div className="relative rounded-3xl overflow-hidden shadow-2xl bg-white p-3 transform group-hover:scale-105 transition-transform duration-500">
                <div className="rounded-2xl overflow-hidden">
                  <Image
                    src="/modern-bookshelf-hero.jpg"
                    alt="Modern organized bookshelf with colorful books"
                    width={600}
                    height={500}
                    className="w-full h-auto object-cover"
                    priority
                  />
                </div>
              </div>

              {/* Floating elements */}
              <div className="absolute -top-6 -right-6 bg-white rounded-2xl shadow-lg p-4 transform rotate-12 hover:rotate-6 transition-transform duration-300">
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-emerald-500 rounded-full"></div>
                  <span className="text-sm font-semibold text-gray-700">50K+ Books</span>
                </div>
              </div>

              <div className="absolute -bottom-6 -left-6 bg-white rounded-2xl shadow-lg p-4 transform -rotate-12 hover:-rotate-6 transition-transform duration-300">
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                  <span className="text-sm font-semibold text-gray-700">25K+ Swaps</span>
                </div>
              </div>

              {/* Background decorative shapes */}
              <div className="absolute -top-8 -right-8 w-32 h-32 bg-gradient-to-br from-emerald-200 to-emerald-300 rounded-full opacity-20 blur-xl"></div>
              <div className="absolute -bottom-8 -left-8 w-40 h-40 bg-gradient-to-br from-blue-200 to-blue-300 rounded-full opacity-20 blur-xl"></div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
