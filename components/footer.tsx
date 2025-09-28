import Link from "next/link"
import { BookOpen, Facebook, Twitter, Instagram, Github } from "lucide-react"

const navigation = {
  main: [
    { name: "About", href: "#" },
    { name: "Blog", href: "/blog" },
    { name: "Contact", href: "/contact" },
    { name: "Privacy", href: "/privacy" },
    { name: "Terms", href: "/terms" },
  ],
  social: [
    {
      name: "Facebook",
      href: "#",
      icon: Facebook,
    },
    {
      name: "Instagram",
      href: "#",
      icon: Instagram,
    },
    {
      name: "Twitter",
      href: "#",
      icon: Twitter,
    },
    {
      name: "GitHub",
      href: "#",
      icon: Github,
    },
  ],
}

export function Footer() {
  return (
    <footer className="bg-gray-900">
      <div className="container">
        <div className="py-12 md:py-16">
          <div className="xl:grid xl:grid-cols-3 xl:gap-8">
            <div className="space-y-8 xl:col-span-1">
              <Link href="/" className="flex items-center space-x-2">
                <BookOpen className="h-8 w-8 text-emerald-400" />
                <span className="text-xl font-bold text-white">BookSwap</span>
              </Link>
              <p className="text-sm leading-6 text-gray-300">
                The ultimate platform for book lovers to buy, sell, donate, and exchange books with fellow readers
                worldwide.
              </p>
              <div className="flex space-x-6">
                {navigation.social.map((item) => (
                  <Link key={item.name} href={item.href} className="text-gray-400 hover:text-gray-300">
                    <span className="sr-only">{item.name}</span>
                    <item.icon className="h-6 w-6" aria-hidden="true" />
                  </Link>
                ))}
              </div>
            </div>
            <div className="mt-16 grid grid-cols-2 gap-8 xl:col-span-2 xl:mt-0">
              <div className="md:grid md:grid-cols-2 md:gap-8">
                <div>
                  <h3 className="text-sm font-semibold leading-6 text-white">Platform</h3>
                  <ul role="list" className="mt-6 space-y-4">
                    <li>
                      <Link href="/books" className="text-sm leading-6 text-gray-300 hover:text-white">
                        Browse Books
                      </Link>
                    </li>
                    <li>
                      <Link href="/dashboard" className="text-sm leading-6 text-gray-300 hover:text-white">
                        Dashboard
                      </Link>
                    </li>
                    <li>
                      <Link href="/signup" className="text-sm leading-6 text-gray-300 hover:text-white">
                        Sign Up
                      </Link>
                    </li>
                    <li>
                      <Link href="/login" className="text-sm leading-6 text-gray-300 hover:text-white">
                        Sign In
                      </Link>
                    </li>
                  </ul>
                </div>
                <div className="mt-10 md:mt-0">
                  <h3 className="text-sm font-semibold leading-6 text-white">Support</h3>
                  <ul role="list" className="mt-6 space-y-4">
                    <li>
                      <Link href="/contact" className="text-sm leading-6 text-gray-300 hover:text-white">
                        Contact
                      </Link>
                    </li>
                    <li>
                      <Link href="#" className="text-sm leading-6 text-gray-300 hover:text-white">
                        Help Center
                      </Link>
                    </li>
                    <li>
                      <Link href="#" className="text-sm leading-6 text-gray-300 hover:text-white">
                        Community
                      </Link>
                    </li>
                  </ul>
                </div>
              </div>
              <div className="md:grid md:grid-cols-2 md:gap-8">
                <div>
                  <h3 className="text-sm font-semibold leading-6 text-white">Company</h3>
                  <ul role="list" className="mt-6 space-y-4">
                    <li>
                      <Link href="#" className="text-sm leading-6 text-gray-300 hover:text-white">
                        About
                      </Link>
                    </li>
                    <li>
                      <Link href="/blog" className="text-sm leading-6 text-gray-300 hover:text-white">
                        Blog
                      </Link>
                    </li>
                    <li>
                      <Link href="#" className="text-sm leading-6 text-gray-300 hover:text-white">
                        Careers
                      </Link>
                    </li>
                  </ul>
                </div>
                <div className="mt-10 md:mt-0">
                  <h3 className="text-sm font-semibold leading-6 text-white">Legal</h3>
                  <ul role="list" className="mt-6 space-y-4">
                    <li>
                      <Link href="/privacy" className="text-sm leading-6 text-gray-300 hover:text-white">
                        Privacy
                      </Link>
                    </li>
                    <li>
                      <Link href="/terms" className="text-sm leading-6 text-gray-300 hover:text-white">
                        Terms
                      </Link>
                    </li>
                    <li>
                      <Link href="/cookies" className="text-sm leading-6 text-gray-300 hover:text-white">
                        Cookies
                      </Link>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="border-t border-gray-700 py-8">
          <p className="text-xs leading-5 text-gray-400 text-center">&copy; 2025 BookSwap. All rights reserved.</p>
        </div>
      </div>
    </footer>
  )
}
