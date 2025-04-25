import Link from "next/link"
import Image from "next/image"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { CalendarIcon, Clock, User } from "lucide-react"
import { Badge } from "@/components/ui/badge"

// Sample blog posts data
const blogPosts = [
  {
    id: "sustainable-reading",
    title: "The Rise of Sustainable Reading: Why Book Swapping is the Future",
    excerpt:
      "Discover how book swapping is not only saving readers money but also helping the environment by reducing waste and promoting a circular economy.",
    date: "May 15, 2023",
    author: "Emma Johnson",
    readTime: "5 min read",
    category: "Sustainability",
    image: "/bookshelf-botanicals.png",
  },
  {
    id: "digital-vs-physical",
    title: "Digital vs. Physical: Finding Balance in Your Reading Habits",
    excerpt:
      "In a world dominated by screens, physical books still hold a special place. Learn how to balance your digital and physical reading habits.",
    date: "April 22, 2023",
    author: "Michael Chen",
    readTime: "7 min read",
    category: "Reading Habits",
    image: "/cozy-reading-nook.png",
  },
  {
    id: "community-book-clubs",
    title: "How Community Book Clubs Are Transforming Neighborhoods",
    excerpt:
      "Book clubs are more than just reading groups - they're building communities and fostering connections between neighbors who might never have met otherwise.",
    date: "March 10, 2023",
    author: "Sarah Williams",
    readTime: "6 min read",
    category: "Community",
    image: "/book-club-discussion.png",
  },
  {
    id: "rare-book-finds",
    title: "Treasure Hunting: Remarkable Stories of Rare Book Finds on BookSwap",
    excerpt:
      "From first editions to signed copies, BookSwap users have discovered some incredible literary treasures. Here are their stories.",
    date: "February 28, 2023",
    author: "David Thompson",
    readTime: "8 min read",
    category: "Book Collecting",
    image: "/antique-book-shelf.png",
  },
  {
    id: "authors-perspective",
    title: "From an Author's Perspective: Why I Support Book Swapping",
    excerpt:
      "Bestselling author Jessica Martinez shares why she believes book swapping helps rather than hurts authors in the long run.",
    date: "January 15, 2023",
    author: "Jessica Martinez",
    readTime: "4 min read",
    category: "Author Insights",
    image: "/focused-author.png",
  },
]

export default function BlogPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1">
        <section className="py-16 md:py-24 bg-gradient-to-b from-white to-gray-50 dark:from-gray-950 dark:to-gray-900">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col items-center justify-center space-y-4 text-center mb-12">
              <div className="space-y-3 max-w-[800px]">
                <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">BookSwap Blog</h1>
                <p className="text-gray-500 md:text-xl dark:text-gray-400">
                  Insights, stories, and tips from the world of books and reading.
                </p>
              </div>
            </div>

            <div className="grid gap-10 md:gap-12">
              {/* Featured Post */}
              <div className="rounded-xl overflow-hidden border bg-white dark:bg-gray-800 shadow-md">
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="relative h-64 md:h-full">
                    <Image
                      src={blogPosts[0].image || "/placeholder.svg"}
                      alt={blogPosts[0].title}
                      fill
                      className="object-cover"
                      priority
                    />
                  </div>
                  <div className="p-6 md:p-8 flex flex-col justify-center">
                    <div className="space-y-4">
                      <Badge
                        variant="outline"
                        className="bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border-emerald-200"
                      >
                        {blogPosts[0].category}
                      </Badge>
                      <h2 className="text-2xl font-bold tracking-tight md:text-3xl">
                        <Link href={`/blog/${blogPosts[0].id}`} className="hover:text-emerald-600 transition-colors">
                          {blogPosts[0].title}
                        </Link>
                      </h2>
                      <p className="text-gray-500 dark:text-gray-400">{blogPosts[0].excerpt}</p>
                      <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
                        <div className="flex items-center gap-1">
                          <User className="h-4 w-4" />
                          <span>{blogPosts[0].author}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <CalendarIcon className="h-4 w-4" />
                          <span>{blogPosts[0].date}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock className="h-4 w-4" />
                          <span>{blogPosts[0].readTime}</span>
                        </div>
                      </div>
                      <Button asChild variant="outline" className="w-fit">
                        <Link href={`/blog/${blogPosts[0].id}`}>Read More</Link>
                      </Button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Regular Posts */}
              <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
                {blogPosts.slice(1).map((post) => (
                  <article
                    key={post.id}
                    className="rounded-xl overflow-hidden border bg-white dark:bg-gray-800 shadow-md flex flex-col"
                  >
                    <div className="relative h-48">
                      <Image src={post.image || "/placeholder.svg"} alt={post.title} fill className="object-cover" />
                    </div>
                    <div className="p-6 flex-1 flex flex-col">
                      <Badge
                        variant="outline"
                        className="w-fit mb-3 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border-emerald-200"
                      >
                        {post.category}
                      </Badge>
                      <h3 className="text-xl font-bold mb-2">
                        <Link href={`/blog/${post.id}`} className="hover:text-emerald-600 transition-colors">
                          {post.title}
                        </Link>
                      </h3>
                      <p className="text-gray-500 dark:text-gray-400 mb-4 flex-1">{post.excerpt}</p>
                      <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400 mt-auto">
                        <div className="flex items-center gap-1">
                          <User className="h-4 w-4" />
                          <span>{post.author}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock className="h-4 w-4" />
                          <span>{post.readTime}</span>
                        </div>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  )
}
