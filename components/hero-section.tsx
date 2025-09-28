import { Button } from "@/components/ui/button"
import Image from "next/image"
import Link from "next/link"

export function HeroSection() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-emerald-50 via-white to-blue-50 py-20 sm:py-32">
      <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center [mask-image:linear-gradient(180deg,white,rgba(255,255,255,0))]" />
      <div className="relative mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto grid max-w-2xl grid-cols-1 gap-x-14 gap-y-16 sm:gap-y-20 lg:mx-0 lg:max-w-none lg:grid-cols-2 lg:items-center">
          <div className="lg:pr-8">
            <div className="lg:max-w-lg">
              <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-6xl">
                Share Books, <span className="text-emerald-600">Convert Readers</span>, And{" "}
                <span className="text-blue-600">Connect</span>
              </h1>
              <p className="mt-6 text-lg leading-8 text-gray-600">
                Join thousands of book lovers in our community. Buy, sell, donate, or swap books with fellow readers.
                Discover your next favorite read while giving books a second life.
              </p>
              <div className="mt-10 flex items-center gap-x-6">
                <Link href="/signup">
                  <Button size="lg" className="bg-emerald-600 hover:bg-emerald-700">
                    Get started
                  </Button>
                </Link>
                <Link href="/books">
                  <Button variant="outline" size="lg">
                    Browse books
                  </Button>
                </Link>
              </div>
            </div>
          </div>
          <div className="relative">
            <Image
              src="/colorful-bookshelf.png"
              alt="Colorful bookshelf with various books"
              width={600}
              height={400}
              className="w-full rounded-xl shadow-xl ring-1 ring-gray-400/10"
              priority
            />
            <div className="absolute -bottom-4 -right-4 h-24 w-24 rounded-full bg-emerald-100 opacity-60" />
            <div className="absolute -top-4 -left-4 h-16 w-16 rounded-full bg-blue-100 opacity-60" />
          </div>
        </div>
      </div>
    </section>
  )
}
