import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowRight, BookOpen, Users, Repeat } from "lucide-react"

export function HeroSection() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-emerald-50 via-white to-blue-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <div className="absolute inset-0 bg-grid-slate-100 [mask-image:linear-gradient(0deg,white,rgba(255,255,255,0.6))] dark:bg-grid-slate-700/25 dark:[mask-image:linear-gradient(0deg,rgba(255,255,255,0.1),rgba(255,255,255,0.5))]" />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="pb-16 pt-16 sm:pb-24 sm:pt-24 lg:pb-32 lg:pt-32">
          <div className="mx-auto max-w-2xl text-center lg:max-w-4xl">
            <div className="mb-8 flex justify-center">
              <div className="relative rounded-full px-3 py-1 text-sm leading-6 text-gray-600 ring-1 ring-gray-900/10 hover:ring-gray-900/20 dark:text-gray-300 dark:ring-gray-100/10 dark:hover:ring-gray-100/20">
                Join thousands of book lovers worldwide.{" "}
                <Link href="/signup" className="font-semibold text-emerald-600 dark:text-emerald-400">
                  <span className="absolute inset-0" aria-hidden="true" />
                  Get started <ArrowRight className="inline h-4 w-4" />
                </Link>
              </div>
            </div>

            <h1 className="text-4xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-6xl lg:text-7xl">
              Your Next Great Read is Just a{" "}
              <span className="bg-gradient-to-r from-emerald-600 to-blue-600 bg-clip-text text-transparent">
                Swap Away
              </span>
            </h1>

            <p className="mt-6 text-lg leading-8 text-gray-600 dark:text-gray-300 sm:text-xl">
              Exchange, buy, and donate books with fellow book enthusiasts. Turn your finished reads into new adventures
              while building a sustainable reading community.
            </p>

            <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row sm:gap-6">
              <Button asChild size="lg" className="w-full sm:w-auto">
                <Link href="/signup">
                  Start Swapping Books
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>

              <Button asChild variant="outline" size="lg" className="w-full sm:w-auto bg-transparent">
                <Link href="/books">
                  Browse Available Books
                  <BookOpen className="ml-2 h-5 w-5" />
                </Link>
              </Button>
            </div>

            {/* Stats */}
            <div className="mt-16 grid grid-cols-1 gap-8 sm:grid-cols-3">
              <div className="flex flex-col items-center">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-emerald-100 dark:bg-emerald-900/20">
                  <BookOpen className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
                </div>
                <dt className="mt-4 text-base font-medium text-gray-900 dark:text-white">10,000+</dt>
                <dd className="text-sm text-gray-600 dark:text-gray-300">Books Available</dd>
              </div>

              <div className="flex flex-col items-center">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-blue-100 dark:bg-blue-900/20">
                  <Users className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                </div>
                <dt className="mt-4 text-base font-medium text-gray-900 dark:text-white">5,000+</dt>
                <dd className="text-sm text-gray-600 dark:text-gray-300">Active Members</dd>
              </div>

              <div className="flex flex-col items-center">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-purple-100 dark:bg-purple-900/20">
                  <Repeat className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                </div>
                <dt className="mt-4 text-base font-medium text-gray-900 dark:text-white">25,000+</dt>
                <dd className="text-sm text-gray-600 dark:text-gray-300">Successful Swaps</dd>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Hero Image */}
      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-4xl">
          <div className="relative">
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="h-full w-full rounded-xl bg-gradient-to-r from-emerald-400 to-blue-500 opacity-20 blur-3xl" />
            </div>
            <div className="relative rounded-xl bg-white/80 p-2 shadow-2xl ring-1 ring-gray-900/10 backdrop-blur dark:bg-gray-800/80 dark:ring-gray-100/10">
              <Image
                src="/colorful-bookshelf.png"
                width={800}
                height={600}
                alt="BookSwap - Colorful bookshelf with various books"
                className="rounded-lg shadow-lg"
                priority
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
