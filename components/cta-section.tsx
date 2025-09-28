import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

export function CtaSection() {
  return (
    <section className="py-16 md:py-24 bg-emerald-50 dark:bg-emerald-950/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center justify-center space-y-6 text-center">
          <div className="space-y-3 max-w-[800px]">
            <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">Ready to Start Swapping?</h2>
            <p className="text-gray-500 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed dark:text-gray-400">
              Join thousands of book lovers already using BookSwap to share their love of reading.
            </p>
          </div>
          <div className="w-full max-w-md space-y-3">
            <form className="flex flex-col sm:flex-row gap-3">
              <Input className="flex-1" placeholder="Enter your email" type="email" required />
              <Button type="submit" className="sm:w-auto w-full">
                Get Started
              </Button>
            </form>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              By signing up, you agree to our{" "}
              <Link href="#" className="underline underline-offset-2 hover:text-emerald-600">
                Terms & Conditions
              </Link>
            </p>
          </div>
        </div>
        <div className="mt-16 grid grid-cols-1 gap-8 border-t pt-10 sm:grid-cols-3">
          <div className="flex flex-col items-center gap-2 text-center">
            <div className="text-3xl font-bold">10,000+</div>
            <p className="text-gray-500 dark:text-gray-400">Active Users</p>
          </div>
          <div className="flex flex-col items-center gap-2 text-center">
            <div className="text-3xl font-bold">50,000+</div>
            <p className="text-gray-500 dark:text-gray-400">Books Exchanged</p>
          </div>
          <div className="flex flex-col items-center gap-2 text-center">
            <div className="text-3xl font-bold">1,000+</div>
            <p className="text-gray-500 dark:text-gray-400">Book Clubs</p>
          </div>
        </div>
      </div>
    </section>
  )
}
