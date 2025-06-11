"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import Image from "next/image"

export function HeroSection() {
  return (
    <section className="py-16 md:py-24 lg:py-32">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid gap-12 lg:grid-cols-2 lg:gap-16">
          <div className="flex flex-col justify-center space-y-6">
            <div className="inline-flex items-center rounded-full bg-emerald-100 px-4 py-1 text-sm font-medium text-emerald-700 dark:bg-emerald-800/30 dark:text-emerald-400 self-start">
              <span className="w-2 h-2 mr-2 rounded-full bg-green-500"></span>
              Find Your Next Read
            </div>
            <h1 className="text-5xl font-bold tracking-tighter sm:text-6xl xl:text-7xl/none">
              Share Books, Convert Readers, And{" "}
              <span className="inline-block bg-emerald-500 text-white px-2 rounded-md">Connect.</span>
            </h1>
            <p className="max-w-[600px] text-gray-600 md:text-xl dark:text-gray-400">
              Buy, sell, donate, or exchange books with fellow readers. Join BookSwap and give your books a new life.
            </p>
            <div className="flex flex-col gap-3 sm:flex-row">
              <Button size="lg" className="px-8 bg-black hover:bg-gray-800 text-white rounded-full">
                <Link href="/books">View Books</Link>
              </Button>
              <Button size="lg" variant="outline" className="px-8 rounded-full">
                <Link href="#features">Learn More</Link>
              </Button>
            </div>
          </div>
          <div className="relative mx-auto lg:mx-0">
            <Image
              src="/placeholder.svg?width=600&height=750"
              width={600}
              height={750}
              alt="BookSwap App Showcase"
              className="rounded-lg shadow-2xl"
            />
          </div>
        </div>
      </div>
    </section>
  )
}
