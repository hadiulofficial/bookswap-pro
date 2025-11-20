import { HeroSection } from "@/components/hero-section"
import { FeaturesSection } from "@/components/features-section"
import { HowItWorksSection } from "@/components/how-it-works-section"
import { TestimonialsSection } from "@/components/testimonials-section"
import { CtaSection } from "@/components/cta-section"
import { Footer } from "@/components/footer"
import { Navbar } from "@/components/navbar"
import { TrustedBySection } from "@/components/trusted-by-section"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "BookSwap - Buy, Sell, Exchange & Donate Books Online | Malaysia's #1 Book Marketplace",
  description:
    "Join 10,000+ book lovers on BookSwap Malaysia. Buy second-hand books, sell your books, exchange with readers, and donate to the community. Browse 50,000+ books today!",
  openGraph: {
    title: "BookSwap - Malaysia's Premier Book Exchange Platform",
    description: "Buy, sell, swap and donate books online. Join Malaysia's largest book community today!",
    url: "https://www.bookswap.pro",
  },
  alternates: {
    canonical: "https://www.bookswap.pro",
  },
}

export default function LandingPage() {
  return (
    <div className="min-h-screen flex flex-col bg-[#f7f7f7] dark:bg-gray-950">
      <Navbar />
      <main className="flex-1">
        <HeroSection />
        <TrustedBySection />
        <FeaturesSection />
        <HowItWorksSection />
        <TestimonialsSection />
        <CtaSection />
      </main>
      <Footer />
    </div>
  )
}
