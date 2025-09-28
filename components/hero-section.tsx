"use client"

import { Button } from "@/components/ui/button"
import Image from "next/image"
import Link from "next/link"

export function HeroSection() {
  return (
    <section className="relative bg-gradient-to-b from-emerald-50 to-white py-20 lg:py-32">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-8">
            <div className="space-y-4">
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 leading-tight">
                Share Books, Convert <span className="text-emerald-600">Readers</span>, And Connect
              </h1>
              <p className="text-xl text-gray-600 leading-relaxed">
                Join thousands of book lovers who buy, sell, donate, and exchange books. Turn your passion for reading
                into meaningful connections.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-4">
              <Button asChild size="lg" className="bg-emerald-600 hover:bg-emerald-700 text-white px-8 py-3 text-lg">
                <Link href="/signup">Start Trading Books</Link>
              </Button>
              <Button
                asChild
                variant="outline"
                size="lg"
                className="border-emerald-600 text-emerald-600 hover:bg-emerald-50 px-8 py-3 text-lg bg-transparent"
              >
                <Link href="/books">Browse Collection</Link>
              </Button>
            </div>
            <div className="flex items-center space-x-8 text-sm text-gray-600">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
                <span>10,000+ Books Available</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
                <span>5,000+ Happy Readers</span>
              </div>
            </div>
          </div>
          <div className="lg:justify-self-end">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-tr from-emerald-400 to-blue-500 rounded-3xl transform rotate-3 opacity-20"></div>
              <Image
                src="/colorful-bookshelf.png"
                alt="Colorful bookshelf with various books"
                width={600}
                height={600}
                className="rounded-3xl shadow-2xl relative z-10"
                priority
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
