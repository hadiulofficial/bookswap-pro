import Link from "next/link"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { FileQuestion, Home, Search } from "lucide-react"

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 py-16 md:py-24 bg-gray-50 dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col items-center justify-center text-center">
            <div className="rounded-full bg-amber-100 p-6 dark:bg-amber-900/20 mb-6">
              <FileQuestion className="h-16 w-16 text-amber-600" />
            </div>
            <h1 className="text-4xl font-bold tracking-tighter sm:text-5xl md:text-6xl mb-4">Page Not Found</h1>
            <p className="max-w-md text-gray-500 md:text-xl dark:text-gray-400 mb-8">
              The page you're looking for doesn't exist or has been moved.
            </p>

            <div className="flex flex-col sm:flex-row gap-4">
              <Button asChild size="lg">
                <Link href="/">
                  <Home className="mr-2 h-5 w-5" />
                  Back to Home
                </Link>
              </Button>
              <Button variant="outline" asChild size="lg">
                <Link href="/books">
                  <Search className="mr-2 h-5 w-5" />
                  Browse Books
                </Link>
              </Button>
            </div>

            <div className="mt-12 grid gap-8 md:grid-cols-3 max-w-3xl">
              <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm">
                <h3 className="font-bold mb-2">Explore Books</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                  Discover books available for swap, sale, or donation.
                </p>
                <Link href="/books" className="text-emerald-600 text-sm font-medium hover:underline">
                  Browse Books →
                </Link>
              </div>

              <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm">
                <h3 className="font-bold mb-2">Join Community</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                  Connect with fellow book lovers in your area.
                </p>
                <Link href="/community" className="text-emerald-600 text-sm font-medium hover:underline">
                  Find Readers →
                </Link>
              </div>

              <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm">
                <h3 className="font-bold mb-2">Get Help</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                  Need assistance? Our support team is here to help.
                </p>
                <Link href="/contact" className="text-emerald-600 text-sm font-medium hover:underline">
                  Contact Support →
                </Link>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}
