"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import Image from "next/image"
import { useAuth } from "@/contexts/auth-context"

export function HeroSection() {
  const { user } = useAuth()

  // Determine the destination for the "Get Started" button
  const getStartedHref = "/books"

  return (
    <section className="relative overflow-hidden py-16 md:py-24 lg:py-32 bg-gradient-to-b from-white to-gray-50 dark:from-gray-950 dark:to-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid gap-8 lg:grid-cols-[1fr_400px] lg:gap-12 xl:grid-cols-[1fr_600px]">
          <div className="flex flex-col justify-center space-y-6">
            <div className="space-y-4">
              <h1 className="text-4xl font-bold tracking-tighter sm:text-5xl xl:text-6xl/none">
                Share Books, <span className="text-emerald-600">Connect</span> Communities
              </h1>
              <p className="max-w-[600px] text-gray-500 md:text-xl dark:text-gray-400">
                Buy, sell, donate, or exchange books with fellow readers. Join BookSwap and give your books a new life.
              </p>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row">
              <Button size="lg" className="px-8" asChild>
                <Link href={getStartedHref}>Get Started</Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link href="#features">Learn More</Link>
              </Button>
            </div>
          </div>
          <div className="relative mx-auto lg:mx-0 max-w-md">
            <div className="aspect-[4/5] relative rounded-lg overflow-hidden shadow-xl">
              <Image
                src="/colorful-bookshelf.png"
                fill
                alt="BookSwap hero image showing a bookshelf"
                className="object-cover"
                priority
              />
            </div>
            <div className="absolute -left-6 -top-6 h-16 w-16 rounded-full bg-emerald-600 flex items-center justify-center text-white font-bold shadow-lg">
              New
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
