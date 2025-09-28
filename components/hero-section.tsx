import { Button } from "@/components/ui/button"
import { ArrowRight, BookOpen, Users, Repeat } from "lucide-react"
import Link from "next/link"
import Image from "next/image"

export function HeroSection() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-emerald-50 via-white to-emerald-50 py-20 sm:py-32">
      <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center [mask-image:linear-gradient(180deg,white,rgba(255,255,255,0))]" />
      <div className="container relative">
        <div className="mx-auto max-w-4xl text-center">
          <div className="mb-8 flex justify-center">
            <div className="relative rounded-full px-3 py-1 text-sm leading-6 text-emerald-600 ring-1 ring-emerald-600/20 hover:ring-emerald-600/30">
              Join thousands of book lovers worldwide{" "}
              <Link href="/signup" className="font-semibold text-emerald-600">
                <span className="absolute inset-0" aria-hidden="true" />
                Get started <ArrowRight className="inline h-4 w-4" />
              </Link>
            </div>
          </div>
          <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-6xl">
            Buy, Sell, Donate & Exchange <span className="text-emerald-600">Books</span> with Fellow Readers
          </h1>
          <p className="mt-6 text-lg leading-8 text-gray-600 max-w-2xl mx-auto">
            The ultimate platform for book lovers. Discover new reads, find rare editions, and connect with a community
            that shares your passion for books.
          </p>
          <div className="mt-10 flex items-center justify-center gap-x-6">
            <Button size="lg" asChild className="bg-emerald-600 hover:bg-emerald-700">
              <Link href="/signup">
                Start Trading Books
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <Button variant="outline" size="lg" asChild>
              <Link href="/books">Browse Books</Link>
            </Button>
          </div>

          {/* Stats */}
          <div className="mt-16 grid grid-cols-1 gap-8 sm:grid-cols-3">
            <div className="flex flex-col items-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-emerald-100">
                <BookOpen className="h-6 w-6 text-emerald-600" />
              </div>
              <dt className="mt-4 text-base font-semibold text-gray-900">10,000+</dt>
              <dd className="text-sm text-gray-600">Books Available</dd>
            </div>
            <div className="flex flex-col items-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-emerald-100">
                <Users className="h-6 w-6 text-emerald-600" />
              </div>
              <dt className="mt-4 text-base font-semibold text-gray-900">5,000+</dt>
              <dd className="text-sm text-gray-600">Active Users</dd>
            </div>
            <div className="flex flex-col items-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-emerald-100">
                <Repeat className="h-6 w-6 text-emerald-600" />
              </div>
              <dt className="mt-4 text-base font-semibold text-gray-900">25,000+</dt>
              <dd className="text-sm text-gray-600">Successful Exchanges</dd>
            </div>
          </div>
        </div>

        {/* Hero Image */}
        <div className="mt-16 flow-root sm:mt-24">
          <div className="relative -m-2 rounded-xl bg-gray-900/5 p-2 ring-1 ring-inset ring-gray-900/10 lg:-m-4 lg:rounded-2xl lg:p-4">
            <Image
              src="/colorful-bookshelf.png"
              alt="BookSwap Platform"
              width={1200}
              height={600}
              className="rounded-md shadow-2xl ring-1 ring-gray-900/10"
              priority
            />
          </div>
        </div>
      </div>
    </section>
  )
}
