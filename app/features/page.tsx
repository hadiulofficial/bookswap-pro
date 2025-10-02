import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import {
  ShoppingCart,
  RefreshCw,
  Heart,
  User,
  Bell,
  MessageSquare,
  Shield,
  TrendingUp,
  Search,
  BookOpen,
  Star,
  CheckCircle2,
  ArrowRight,
} from "lucide-react"

export default function FeaturesPage() {
  const features = [
    {
      icon: ShoppingCart,
      title: "Buy & Sell Books",
      description:
        "List your books for sale and browse thousands of books from other users. Set your own prices and manage your inventory easily.",
      color: "text-emerald-600",
      bgColor: "bg-emerald-50",
    },
    {
      icon: RefreshCw,
      title: "Book Swapping",
      description:
        "Exchange books with other readers. Find the perfect swap match and keep your reading list fresh without spending money.",
      color: "text-blue-600",
      bgColor: "bg-blue-50",
    },
    {
      icon: Heart,
      title: "Wishlist Management",
      description:
        "Create and manage your wishlist. Get notified when the books you want become available from other users.",
      color: "text-pink-600",
      bgColor: "bg-pink-50",
    },
    {
      icon: User,
      title: "User Profiles",
      description:
        "Build your reader profile, showcase your collection, and connect with other book enthusiasts in the community.",
      color: "text-purple-600",
      bgColor: "bg-purple-50",
    },
    {
      icon: Bell,
      title: "Smart Notifications",
      description:
        "Stay updated with real-time notifications for swap requests, purchase confirmations, and new books from your favorite sellers.",
      color: "text-orange-600",
      bgColor: "bg-orange-50",
    },
    {
      icon: MessageSquare,
      title: "In-App Messaging",
      description:
        "Chat directly with buyers and sellers. Negotiate prices, arrange meetups, and discuss book conditions before making a deal.",
      color: "text-cyan-600",
      bgColor: "bg-cyan-50",
    },
    {
      icon: Shield,
      title: "Secure Transactions",
      description:
        "All transactions are secure and protected. We ensure safe exchanges and provide buyer/seller protection.",
      color: "text-red-600",
      bgColor: "bg-red-50",
    },
    {
      icon: TrendingUp,
      title: "Price Insights",
      description:
        "Get real-time market insights and pricing recommendations based on book condition, demand, and historical data.",
      color: "text-indigo-600",
      bgColor: "bg-indigo-50",
    },
    {
      icon: Search,
      title: "Advanced Search",
      description:
        "Find exactly what you're looking for with powerful filters by genre, author, condition, price range, and location.",
      color: "text-green-600",
      bgColor: "bg-green-50",
    },
  ]

  const benefits = [
    "Free to list and browse books",
    "No commission on sales",
    "Unlimited book listings",
    "Community-driven platform",
    "Eco-friendly book recycling",
    "Local pickup options",
  ]

  return (
    <div className="min-h-screen flex flex-col bg-[#f7f7f7] dark:bg-gray-950">
      <Navbar />
      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative py-20 px-4 sm:px-6 lg:px-8 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-emerald-50 to-blue-50 dark:from-gray-900 dark:to-gray-800 -z-10" />
          <div className="max-w-7xl mx-auto text-center">
            <Badge className="mb-4 bg-emerald-100 text-emerald-700 hover:bg-emerald-100">Powerful Features</Badge>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-emerald-600 to-blue-600">
              Everything You Need to
              <br />
              Buy, Sell & Swap Books
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-300 mb-8 max-w-3xl mx-auto">
              BookSwap provides all the tools you need to manage your book collection, connect with readers, and
              discover your next great read.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button asChild size="lg" className="bg-emerald-600 hover:bg-emerald-700">
                <Link href="/signup">
                  Get Started Free
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline">
                <Link href="/books">Browse Books</Link>
              </Button>
            </div>
          </div>
        </section>

        {/* Main Features Grid */}
        <section className="py-20 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-3xl sm:text-4xl font-bold mb-4">Comprehensive Features for Book Lovers</h2>
              <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
                Our platform is designed to make buying, selling, and swapping books as easy and enjoyable as possible.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {features.map((feature, index) => (
                <Card
                  key={index}
                  className="group hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border-2 hover:border-emerald-200"
                >
                  <CardContent className="p-6">
                    <div
                      className={`w-14 h-14 rounded-2xl ${feature.bgColor} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300`}
                    >
                      <feature.icon className={`h-7 w-7 ${feature.color}`} />
                    </div>
                    <h3 className="text-xl font-bold mb-2">{feature.title}</h3>
                    <p className="text-gray-600 dark:text-gray-300">{feature.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Benefits Section */}
        <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white dark:bg-gray-900">
          <div className="max-w-7xl mx-auto">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <div>
                <Badge className="mb-4 bg-emerald-100 text-emerald-700 hover:bg-emerald-100">Why Choose Us</Badge>
                <h2 className="text-3xl sm:text-4xl font-bold mb-6">Join Thousands of Happy Readers</h2>
                <p className="text-lg text-gray-600 dark:text-gray-300 mb-8">
                  BookSwap is more than just a marketplace. It's a community of book lovers who believe in sharing
                  stories, saving money, and protecting the environment.
                </p>
                <div className="space-y-4">
                  {benefits.map((benefit, index) => (
                    <div key={index} className="flex items-center gap-3">
                      <div className="w-6 h-6 rounded-full bg-emerald-100 flex items-center justify-center flex-shrink-0">
                        <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                      </div>
                      <span className="text-gray-700 dark:text-gray-300">{benefit}</span>
                    </div>
                  ))}
                </div>
                <Button asChild size="lg" className="mt-8 bg-emerald-600 hover:bg-emerald-700">
                  <Link href="/signup">
                    Start Your Journey
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Link>
                </Button>
              </div>

              <div className="relative">
                <div className="grid grid-cols-2 gap-4">
                  <Card className="p-6 bg-gradient-to-br from-emerald-50 to-emerald-100 border-emerald-200">
                    <BookOpen className="h-8 w-8 text-emerald-600 mb-3" />
                    <h3 className="text-2xl font-bold mb-1">50K+</h3>
                    <p className="text-sm text-gray-600">Books Listed</p>
                  </Card>
                  <Card className="p-6 bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200 mt-8">
                    <User className="h-8 w-8 text-blue-600 mb-3" />
                    <h3 className="text-2xl font-bold mb-1">10K+</h3>
                    <p className="text-sm text-gray-600">Active Users</p>
                  </Card>
                  <Card className="p-6 bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
                    <RefreshCw className="h-8 w-8 text-purple-600 mb-3" />
                    <h3 className="text-2xl font-bold mb-1">25K+</h3>
                    <p className="text-sm text-gray-600">Book Swaps</p>
                  </Card>
                  <Card className="p-6 bg-gradient-to-br from-pink-50 to-pink-100 border-pink-200 mt-8">
                    <Star className="h-8 w-8 text-pink-600 mb-3" />
                    <h3 className="text-2xl font-bold mb-1">4.8/5</h3>
                    <p className="text-sm text-gray-600">User Rating</p>
                  </Card>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl sm:text-4xl font-bold mb-6">Ready to Start Your Book Journey?</h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 mb-8">
              Join our community of book lovers today and discover a new way to buy, sell, and swap books.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button asChild size="lg" className="bg-emerald-600 hover:bg-emerald-700">
                <Link href="/signup">
                  Create Free Account
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline">
                <Link href="/contact">Contact Us</Link>
              </Button>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  )
}
