import { CheckCircle2 } from "lucide-react"
import Image from "next/image"

export function HowItWorksSection() {
  return (
    <section id="how-it-works" className="py-16 md:py-24 bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center justify-center space-y-4 text-center mb-10 md:mb-16">
          <div className="space-y-3 max-w-[800px]">
            <div className="inline-block rounded-lg bg-emerald-100 px-3 py-1 text-sm text-emerald-700 dark:bg-emerald-800/30 dark:text-emerald-400">
              How It Works
            </div>
            <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
              Simple Steps to Start Swapping
            </h2>
            <p className="text-gray-500 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed dark:text-gray-400">
              Getting started with BookSwap is easy. Follow these simple steps to begin your book swapping journey.
            </p>
          </div>
        </div>
        <div className="grid gap-8 md:gap-12 py-8 lg:grid-cols-3">
          <StepCard
            number="1"
            title="Create an Account"
            description="Sign up for a free account to start listing and browsing books."
            image="/online-registration.png"
          />
          <StepCard
            number="2"
            title="List Your Books"
            description="Add books you want to sell, donate, or exchange to your collection."
            image="/online-book-listing.png"
          />
          <StepCard
            number="3"
            title="Connect & Swap"
            description="Find books you want, connect with other users, and arrange your swap."
            image="/book-exchange-park.png"
          />
        </div>
        <div className="mx-auto max-w-3xl space-y-6 mt-16 text-center">
          <h3 className="text-2xl font-bold">Why Users Love BookSwap</h3>
          <ul className="grid gap-3 py-4 sm:grid-cols-2">
            <BenefitItem text="Save money on books you want to read" />
            <BenefitItem text="Reduce waste by giving books a second life" />
            <BenefitItem text="Connect with a community of book lovers" />
            <BenefitItem text="Discover new books and authors" />
            <BenefitItem text="Free up space in your home" />
            <BenefitItem text="Support sustainable reading habits" />
          </ul>
        </div>
      </div>
    </section>
  )
}

function StepCard({ number, title, description, image }) {
  return (
    <div className="flex flex-col space-y-4 rounded-xl border p-6 shadow-sm bg-white dark:bg-gray-800">
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-600 text-xl font-bold text-white">
        {number}
      </div>
      <div className="relative w-full aspect-[4/3] rounded-lg overflow-hidden">
        <Image src={image || "/placeholder.svg"} fill alt={title} className="object-cover" />
      </div>
      <div className="space-y-2">
        <h3 className="text-xl font-bold">{title}</h3>
        <p className="text-gray-500 dark:text-gray-400">{description}</p>
      </div>
    </div>
  )
}

function BenefitItem({ text }) {
  return (
    <li className="flex items-center gap-2 p-2 rounded-lg bg-white dark:bg-gray-800 shadow-sm border">
      <CheckCircle2 className="h-5 w-5 flex-shrink-0 text-emerald-600" />
      <span className="text-sm">{text}</span>
    </li>
  )
}
