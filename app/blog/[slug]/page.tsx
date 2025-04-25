import Link from "next/link"
import Image from "next/image"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { CalendarIcon, Clock, User, ArrowLeft, Share2, Bookmark } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { notFound } from "next/navigation"

// Sample blog posts data
const blogPosts = [
  {
    id: "sustainable-reading",
    title: "The Rise of Sustainable Reading: Why Book Swapping is the Future",
    excerpt:
      "Discover how book swapping is not only saving readers money but also helping the environment by reducing waste and promoting a circular economy.",
    content: `
      <p>In a world increasingly concerned with sustainability, book lovers are finding innovative ways to enjoy their passion while reducing their environmental footprint. Book swapping has emerged as a powerful solution that addresses both economic and ecological concerns.</p>
      
      <h2>The Environmental Impact of Books</h2>
      
      <p>The publishing industry, while bringing us the joy of reading, has a significant environmental impact. According to recent studies, producing a single book can consume up to 7 gallons of water and contribute to deforestation. When we consider the millions of books published annually, the numbers become staggering.</p>
      
      <p>Furthermore, many books end up in landfills after being read just once. This wasteful cycle is something that conscious readers are increasingly looking to avoid.</p>
      
      <h2>Enter Book Swapping</h2>
      
      <p>Book swapping platforms like BookSwap offer a sustainable alternative. By enabling readers to exchange books they've finished for ones they haven't read, these platforms extend the lifecycle of each book significantly.</p>
      
      <p>A single book that might have been read once and shelved indefinitely can now bring joy to dozens of readers. This not only reduces the demand for new book production but also prevents perfectly good books from ending up in landfills.</p>
      
      <h2>Economic Benefits</h2>
      
      <p>Beyond the environmental advantages, book swapping makes economic sense. The average reader in the United States spends over $100 annually on books. By participating in book swapping communities, readers can significantly reduce this expense while still enjoying a steady stream of new reading material.</p>
      
      <p>This democratization of reading is particularly important for making literature accessible to those with limited financial resources.</p>
      
      <h2>Building Community</h2>
      
      <p>Perhaps one of the most overlooked benefits of book swapping is the sense of community it fosters. When readers exchange books, they're not just trading physical objects—they're sharing experiences, perspectives, and a piece of themselves.</p>
      
      <p>Many book swapping platforms now include features that allow readers to leave notes or recommendations for future readers, creating a unique form of connection between strangers united by their love of reading.</p>
      
      <h2>The Future of Reading</h2>
      
      <p>As we move toward a more sustainable future, book swapping represents a model for how we can continue to enjoy the things we love while reducing our impact on the planet. It's a simple concept with profound implications: by sharing resources, we can create a more sustainable and connected world.</p>
      
      <p>So the next time you finish a book, consider passing it along through a book swapping platform rather than letting it gather dust on your shelf. Your wallet, the planet, and fellow book lovers will thank you.</p>
    `,
    date: "May 15, 2023",
    author: "Emma Johnson",
    authorImage: "/placeholder.svg?height=100&width=100&query=professional woman portrait",
    authorBio:
      "Emma is an environmental journalist and avid reader with a passion for sustainable living. She has written for numerous publications on the intersection of culture and environmentalism.",
    readTime: "5 min read",
    category: "Sustainability",
    image: "/bookshelf-botanicals.png",
    relatedPosts: ["digital-vs-physical", "community-book-clubs"],
  },
  {
    id: "digital-vs-physical",
    title: "Digital vs. Physical: Finding Balance in Your Reading Habits",
    excerpt:
      "In a world dominated by screens, physical books still hold a special place. Learn how to balance your digital and physical reading habits.",
    content: `
      <p>The debate between digital and physical books has been raging for over a decade now. E-readers promise convenience and portability, while physical books offer a tactile experience that many readers find irreplaceable. But is one truly better than the other, or is there a way to embrace both in our reading lives?</p>
      
      <h2>The Case for Digital</h2>
      
      <p>E-readers and tablets have revolutionized how we access and consume books. The ability to carry thousands of titles in a device lighter than a single hardcover is undeniably appealing, especially for travelers and commuters.</p>
      
      <p>Digital books also offer accessibility features that physical books cannot match. Adjustable font sizes, built-in dictionaries, and text-to-speech capabilities make reading more accessible to people with various needs.</p>
      
      <p>Furthermore, the immediate gratification of purchasing and downloading a book in seconds is hard to beat in our fast-paced world.</p>
      
      <h2>The Case for Physical</h2>
      
      <p>Despite the convenience of digital, physical books continue to hold a special place in many readers' hearts. Studies suggest that reading physical books may lead to better comprehension and retention compared to digital reading.</p>
      
      <p>There's also the undeniable sensory experience of physical books—the smell of paper, the sound of turning pages, the weight of a book in your hands. These elements create a reading experience that many find more immersive and satisfying.</p>
      
      <p>Physical books also don't require charging, are less distracting (no notifications!), and can be shared easily among friends and family.</p>
      
      <h2>Finding Your Balance</h2>
      
      <p>Rather than viewing this as an either/or situation, many readers are finding that a hybrid approach works best. Here are some strategies for balancing digital and physical reading:</p>
      
      <ul>
        <li>Use e-readers for travel and commuting, physical books for home reading</li>
        <li>Choose digital for quick, light reads and physical for books you want to savor</li>
        <li>Opt for digital when price is a factor (e-books are often cheaper)</li>
        <li>Select physical copies of books you want to display or keep long-term</li>
        <li>Consider the reading experience—some genres or formats work better in one medium than the other</li>
      </ul>
      
      <h2>The Role of Book Swapping</h2>
      
      <p>Platforms like BookSwap offer an interesting middle ground in this debate. By facilitating the exchange of physical books, they address some of the sustainability and cost concerns associated with print books while preserving the physical reading experience many people prefer.</p>
      
      <p>Book swapping allows readers to refresh their physical libraries without the environmental and financial costs of constantly buying new books.</p>
      
      <h2>The Future is Flexible</h2>
      
      <p>As technology continues to evolve, the line between digital and physical reading experiences may blur further. Innovations like digital bookplates, augmented reality enhancements to physical books, and improved e-reader technology will likely create even more options for readers.</p>
      
      <p>The key is to remain open to different reading experiences and choose the format that best serves your needs for each particular book and reading situation. By embracing flexibility rather than pledging allegiance to one format, you can enjoy the best of both worlds.</p>
    `,
    date: "April 22, 2023",
    author: "Michael Chen",
    authorImage: "/placeholder.svg?height=100&width=100&query=asian man professional portrait",
    authorBio:
      "Michael is a technology writer and book enthusiast who has been covering the evolution of reading technology for over a decade. He maintains an extensive collection of both digital and physical books.",
    readTime: "7 min read",
    category: "Reading Habits",
    image: "/cozy-reading-nook.png",
    relatedPosts: ["sustainable-reading", "authors-perspective"],
  },
  {
    id: "community-book-clubs",
    title: "How Community Book Clubs Are Transforming Neighborhoods",
    excerpt:
      "Book clubs are more than just reading groups - they're building communities and fostering connections between neighbors who might never have met otherwise.",
    content: `<p>Sample content for community book clubs article...</p>`,
    date: "March 10, 2023",
    author: "Sarah Williams",
    authorImage: "/placeholder.svg?height=100&width=100&query=woman smiling portrait",
    authorBio:
      "Sarah is a community organizer and literature professor who has helped establish over 20 neighborhood book clubs across the country.",
    readTime: "6 min read",
    category: "Community",
    image: "/book-club-discussion.png",
    relatedPosts: ["sustainable-reading", "rare-book-finds"],
  },
  {
    id: "rare-book-finds",
    title: "Treasure Hunting: Remarkable Stories of Rare Book Finds on BookSwap",
    excerpt:
      "From first editions to signed copies, BookSwap users have discovered some incredible literary treasures. Here are their stories.",
    content: `<p>Sample content for rare book finds article...</p>`,
    date: "February 28, 2023",
    author: "David Thompson",
    authorImage: "/placeholder.svg?height=100&width=100&query=older man with glasses portrait",
    authorBio:
      "David is a rare book collector and historian who specializes in 20th century first editions. He has written three books on book collecting.",
    readTime: "8 min read",
    category: "Book Collecting",
    image: "/antique-book-shelf.png",
    relatedPosts: ["authors-perspective", "community-book-clubs"],
  },
  {
    id: "authors-perspective",
    title: "From an Author's Perspective: Why I Support Book Swapping",
    excerpt:
      "Bestselling author Jessica Martinez shares why she believes book swapping helps rather than hurts authors in the long run.",
    content: `<p>Sample content for author's perspective article...</p>`,
    date: "January 15, 2023",
    author: "Jessica Martinez",
    authorImage: "/placeholder.svg?height=100&width=100&query=latina woman author portrait",
    authorBio:
      "Jessica is the author of five bestselling novels. Her work has been translated into 12 languages and adapted for television.",
    readTime: "4 min read",
    category: "Author Insights",
    image: "/focused-author.png",
    relatedPosts: ["digital-vs-physical", "rare-book-finds"],
  },
]

export default function BlogPostPage({ params }: { params: { slug: string } }) {
  const post = blogPosts.find((post) => post.id === params.slug)

  if (!post) {
    notFound()
  }

  const relatedPostsData = post.relatedPosts.map((id) => blogPosts.find((post) => post.id === id)).filter(Boolean)

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1">
        <article>
          {/* Hero Section */}
          <div className="relative h-[40vh] md:h-[50vh] lg:h-[60vh] bg-gray-900">
            <Image
              src={post.image || "/placeholder.svg"}
              alt={post.title}
              fill
              className="object-cover opacity-70"
              priority
            />
            <div className="absolute inset-0 bg-gradient-to-t from-gray-900 to-transparent"></div>
            <div className="absolute inset-0 flex items-end">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16 lg:py-20 w-full">
                <Badge
                  variant="outline"
                  className="mb-4 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border-emerald-200"
                >
                  {post.category}
                </Badge>
                <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-4">{post.title}</h1>
                <div className="flex flex-wrap items-center gap-4 text-sm text-gray-300">
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4" />
                    <span>{post.author}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CalendarIcon className="h-4 w-4" />
                    <span>{post.date}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4" />
                    <span>{post.readTime}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Content Section */}
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-12">
              <div>
                <div
                  className="prose prose-emerald dark:prose-invert max-w-none mb-12"
                  dangerouslySetInnerHTML={{ __html: post.content }}
                />

                {/* Author Bio */}
                <div className="border-t border-b py-8 my-8">
                  <div className="flex items-center gap-4">
                    <div className="relative h-16 w-16 rounded-full overflow-hidden">
                      <Image
                        src={post.authorImage || "/placeholder.svg"}
                        alt={post.author}
                        fill
                        className="object-cover"
                      />
                    </div>
                    <div>
                      <h3 className="font-bold text-lg">About {post.author}</h3>
                      <p className="text-gray-500 dark:text-gray-400 text-sm">{post.authorBio}</p>
                    </div>
                  </div>
                </div>

                {/* Back to Blog */}
                <Button variant="outline" asChild className="mb-8">
                  <Link href="/blog" className="inline-flex items-center">
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back to Blog
                  </Link>
                </Button>
              </div>

              {/* Sidebar */}
              <aside className="space-y-8">
                <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-6">
                  <h3 className="font-bold text-lg mb-4">Share this article</h3>
                  <div className="flex gap-2">
                    <Button variant="outline" size="icon" aria-label="Share on Twitter">
                      <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" />
                      </svg>
                    </Button>
                    <Button variant="outline" size="icon" aria-label="Share on Facebook">
                      <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" />
                      </svg>
                    </Button>
                    <Button variant="outline" size="icon" aria-label="Share via Email">
                      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                        />
                      </svg>
                    </Button>
                    <Button variant="outline" size="icon" aria-label="Copy Link">
                      <Share2 className="h-4 w-4" />
                    </Button>
                    <Button variant="outline" size="icon" aria-label="Save Article">
                      <Bookmark className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                {/* Related Posts */}
                <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-6">
                  <h3 className="font-bold text-lg mb-4">Related Articles</h3>
                  <div className="space-y-4">
                    {relatedPostsData.map((relatedPost) => (
                      <div key={relatedPost.id} className="flex gap-3">
                        <div className="relative h-16 w-16 flex-shrink-0 rounded-md overflow-hidden">
                          <Image
                            src={relatedPost.image || "/placeholder.svg"}
                            alt={relatedPost.title}
                            fill
                            className="object-cover"
                          />
                        </div>
                        <div>
                          <h4 className="font-medium text-sm line-clamp-2">
                            <Link href={`/blog/${relatedPost.id}`} className="hover:text-emerald-600 transition-colors">
                              {relatedPost.title}
                            </Link>
                          </h4>
                          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{relatedPost.date}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Categories */}
                <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-6">
                  <h3 className="font-bold text-lg mb-4">Categories</h3>
                  <div className="flex flex-wrap gap-2">
                    {Array.from(new Set(blogPosts.map((post) => post.category))).map((category) => (
                      <Badge key={category} variant="outline" className="bg-white dark:bg-gray-700">
                        {category}
                      </Badge>
                    ))}
                  </div>
                </div>
              </aside>
            </div>
          </div>
        </article>
      </main>
      <Footer />
    </div>
  )
}
