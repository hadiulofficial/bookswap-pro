import { BookOpen, Search, CreditCard, Star, Heart, ImageIcon, Lock, RefreshCw } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export function FeaturesSection() {
  return (
    <section id="features" className="py-16 md:py-24 bg-white dark:bg-gray-950">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center justify-center space-y-4 text-center mb-10 md:mb-16">
          <div className="space-y-3 max-w-[800px]">
            <div className="inline-block rounded-lg bg-emerald-100 px-3 py-1 text-sm text-emerald-700 dark:bg-emerald-800/30 dark:text-emerald-400">
              Features
            </div>
            <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
              Everything You Need to Swap Books
            </h2>
            <p className="text-gray-500 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed dark:text-gray-400">
              BookSwap provides all the tools you need to manage your book collection and connect with other readers.
            </p>
          </div>
        </div>
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          <FeatureCard
            icon={<BookOpen className="h-10 w-10 text-emerald-600" />}
            title="Book Listings"
            description="Create, edit, and manage your book listings with ease."
          />
          <FeatureCard
            icon={<Search className="h-10 w-10 text-emerald-600" />}
            title="Advanced Search"
            description="Find books by genre, author, location, and more."
          />
          <FeatureCard
            icon={<CreditCard className="h-10 w-10 text-emerald-600" />}
            title="Secure Payments"
            description="Buy and sell books with our secure payment system."
          />
          <FeatureCard
            icon={<Heart className="h-10 w-10 text-emerald-600" />}
            title="Wishlist & Favorites"
            description="Save books you're interested in for later."
          />
          <FeatureCard
            icon={<Star className="h-10 w-10 text-emerald-600" />}
            title="Reviews & Ratings"
            description="Rate books and sellers to help the community."
          />
          <FeatureCard
            icon={<ImageIcon className="h-10 w-10 text-emerald-600" />}
            title="Image Uploads"
            description="Upload book covers to make your listings stand out."
          />
          <FeatureCard
            icon={<Lock className="h-10 w-10 text-emerald-600" />}
            title="User Profiles"
            description="Create your profile and build your reputation."
          />
          <FeatureCard
            icon={<RefreshCw className="h-10 w-10 text-emerald-600" />}
            title="Book Exchanges"
            description="Exchange books with other readers in your area."
          />
        </div>
      </div>
    </section>
  )
}

function FeatureCard({ icon, title, description }) {
  return (
    <Card className="flex flex-col h-full">
      <CardHeader className="pb-2">
        <div className="p-2 mb-2">{icon}</div>
        <CardTitle className="text-xl">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <CardDescription className="text-base">{description}</CardDescription>
      </CardContent>
    </Card>
  )
}
