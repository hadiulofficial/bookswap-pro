"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { BookOpen, Menu, X } from "lucide-react"
import { NavbarUserMenu } from "./navbar-user-menu"
import { useState } from "react"

export function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  return (
    <nav className="bg-white/95 backdrop-blur-sm border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <Link href="/" className="flex items-center space-x-2">
              <BookOpen className="h-8 w-8 text-emerald-600" />
              <span className="text-2xl font-bold text-gray-900">BookSwap</span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            <Link href="/books" className="text-gray-700 hover:text-emerald-600 font-medium transition-colors">
              Browse Books
            </Link>
            <Link href="/dashboard" className="text-gray-700 hover:text-emerald-600 font-medium transition-colors">
              Dashboard
            </Link>
            <Link href="/contact" className="text-gray-700 hover:text-emerald-600 font-medium transition-colors">
              Contact
            </Link>
          </div>

          {/* Desktop Auth Buttons */}
          <div className="hidden md:flex items-center space-x-4">
            <NavbarUserMenu />
            <Link href="/login">
              <Button variant="ghost" className="text-gray-700 hover:text-emerald-600">
                Login
              </Button>
            </Link>
            <Link href="/signup">
              <Button className="bg-emerald-600 hover:bg-emerald-700 text-white">Sign Up</Button>
            </Link>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <Button variant="ghost" size="sm" onClick={() => setIsMenuOpen(!isMenuOpen)}>
              {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </Button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden py-4 border-t border-gray-200">
            <div className="flex flex-col space-y-4">
              <Link href="/books" className="text-gray-700 hover:text-emerald-600 font-medium">
                Browse Books
              </Link>
              <Link href="/dashboard" className="text-gray-700 hover:text-emerald-600 font-medium">
                Dashboard
              </Link>
              <Link href="/contact" className="text-gray-700 hover:text-emerald-600 font-medium">
                Contact
              </Link>
              <div className="flex flex-col space-y-2 pt-4 border-t border-gray-200">
                <Link href="/login">
                  <Button variant="ghost" className="w-full justify-start text-gray-700 hover:text-emerald-600">
                    Login
                  </Button>
                </Link>
                <Link href="/signup">
                  <Button className="w-full bg-emerald-600 hover:bg-emerald-700 text-white">Sign Up</Button>
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}
