"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Menu, X, BookOpen } from "lucide-react"
import { NavbarUserMenu } from "./navbar-user-menu"
import { useAuth } from "@/contexts/auth-context"

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false)
  const { user, loading } = useAuth()

  return (
    <nav className="bg-white shadow-sm border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link href="/" className="flex items-center space-x-2">
              <BookOpen className="h-8 w-8 text-emerald-600" />
              <span className="text-xl font-bold text-gray-900">BookSwap</span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            <Link href="/books" className="text-gray-700 hover:text-emerald-600 transition-colors">
              Browse Books
            </Link>
            <Link href="/blog" className="text-gray-700 hover:text-emerald-600 transition-colors">
              Blog
            </Link>
            <Link href="/contact" className="text-gray-700 hover:text-emerald-600 transition-colors">
              Contact
            </Link>

            {!loading && (
              <>
                {user ? (
                  <NavbarUserMenu />
                ) : (
                  <div className="flex items-center space-x-4">
                    <Link href="/login">
                      <Button variant="ghost">Sign In</Button>
                    </Link>
                    <Link href="/signup">
                      <Button>Get Started</Button>
                    </Link>
                  </div>
                )}
              </>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center">
            <button onClick={() => setIsOpen(!isOpen)} className="text-gray-700 hover:text-emerald-600">
              {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isOpen && (
          <div className="md:hidden">
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 bg-white border-t">
              <Link
                href="/books"
                className="block px-3 py-2 text-gray-700 hover:text-emerald-600"
                onClick={() => setIsOpen(false)}
              >
                Browse Books
              </Link>
              <Link
                href="/blog"
                className="block px-3 py-2 text-gray-700 hover:text-emerald-600"
                onClick={() => setIsOpen(false)}
              >
                Blog
              </Link>
              <Link
                href="/contact"
                className="block px-3 py-2 text-gray-700 hover:text-emerald-600"
                onClick={() => setIsOpen(false)}
              >
                Contact
              </Link>

              {!loading && (
                <>
                  {user ? (
                    <div className="px-3 py-2">
                      <NavbarUserMenu />
                    </div>
                  ) : (
                    <div className="px-3 py-2 space-y-2">
                      <Link href="/login" onClick={() => setIsOpen(false)}>
                        <Button variant="ghost" className="w-full justify-start">
                          Sign In
                        </Button>
                      </Link>
                      <Link href="/signup" onClick={() => setIsOpen(false)}>
                        <Button className="w-full">Get Started</Button>
                      </Link>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}
