"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Menu, X } from "lucide-react"
import { useAuth } from "@/contexts/auth-context"
import { NavbarUserMenu } from "@/components/navbar-user-menu"

export function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isScrolled, setIsScrolled] = useState(false)
  const pathname = usePathname()
  const { user, isLoading, signOut } = useAuth()

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10)
    }

    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen)
  }

  const closeMenu = () => {
    setIsMenuOpen(false)
  }

  const handleSignOut = () => {
    closeMenu()
    signOut()
  }

  // Update the navLinks array to include the books page
  const navLinks = [
    { href: "/", label: "Home" },
    { href: "/books", label: "Browse Books" },
    { href: "/how-it-works", label: "How It Works" },
    { href: "/blog", label: "Blog" },
    { href: "/contact", label: "Contact" },
  ]

  return (
    <header
      className={`sticky top-0 z-50 w-full transition-all duration-200 ${
        isScrolled ? "bg-white/90 dark:bg-gray-900/90 backdrop-blur-md shadow-sm" : "bg-white dark:bg-gray-900"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center">
            <Link href="/" className="flex items-center" onClick={closeMenu}>
              <span className="text-2xl font-bold text-emerald-600">BookSwap</span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`px-3 py-2 rounded-md text-sm font-medium ${
                  pathname === link.href
                    ? "text-emerald-600 dark:text-emerald-500"
                    : "text-gray-700 hover:text-emerald-600 dark:text-gray-300 dark:hover:text-emerald-500"
                }`}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          <div className="hidden md:flex items-center space-x-4">
            {isLoading ? (
              <div className="h-10 w-10 rounded-full bg-gray-200 animate-pulse"></div>
            ) : user ? (
              <NavbarUserMenu />
            ) : (
              <>
                <Button variant="ghost" asChild>
                  <Link href="/login">Sign in</Link>
                </Button>
                <Button asChild>
                  <Link href="/signup">Sign up</Link>
                </Button>
              </>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="flex md:hidden">
            <button
              type="button"
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-700 hover:text-emerald-600 dark:text-gray-300 dark:hover:text-emerald-500"
              aria-controls="mobile-menu"
              aria-expanded={isMenuOpen}
              onClick={toggleMenu}
            >
              <span className="sr-only">Open main menu</span>
              {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation */}
      {isMenuOpen && (
        <div className="md:hidden" id="mobile-menu">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`block px-3 py-2 rounded-md text-base font-medium ${
                  pathname === link.href
                    ? "text-emerald-600 dark:text-emerald-500"
                    : "text-gray-700 hover:text-emerald-600 dark:text-gray-300 dark:hover:text-emerald-500"
                }`}
                onClick={closeMenu}
              >
                {link.label}
              </Link>
            ))}
          </div>
          <div className="pt-4 pb-3 border-t border-gray-200 dark:border-gray-700">
            <div className="px-2 space-y-1">
              {user ? (
                <>
                  <Link
                    href="/dashboard"
                    className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-emerald-600 dark:text-gray-300 dark:hover:text-emerald-500"
                    onClick={closeMenu}
                  >
                    Dashboard
                  </Link>
                  <Link
                    href="/profile"
                    className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-emerald-600 dark:text-gray-300 dark:hover:text-emerald-500"
                    onClick={closeMenu}
                  >
                    Profile
                  </Link>
                  <button
                    className="block w-full text-left px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-emerald-600 dark:text-gray-300 dark:hover:text-emerald-500"
                    onClick={handleSignOut}
                  >
                    Sign out
                  </button>
                </>
              ) : (
                <>
                  <Link
                    href="/login"
                    className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-emerald-600 dark:text-gray-300 dark:hover:text-emerald-500"
                    onClick={closeMenu}
                  >
                    Sign in
                  </Link>
                  <Link
                    href="/signup"
                    className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-emerald-600 dark:text-gray-300 dark:hover:text-emerald-500"
                    onClick={closeMenu}
                  >
                    Sign up
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  )
}
