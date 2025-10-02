"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { Book, Menu } from "lucide-react"
import { useAuth } from "@/contexts/auth-context"
import { NavbarUserMenu } from "./navbar-user-menu"

export function Navbar() {
  const { user, loading } = useAuth()

  return (
    <header className="sticky top-4 inset-x-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 bg-white/80 dark:bg-gray-950/80 backdrop-blur-sm rounded-2xl px-6 shadow-sm border border-gray-200 dark:border-gray-800">
          <div className="flex items-center">
            <Link href="/" className="flex items-center gap-2 font-bold text-lg">
              <Book className="h-6 w-6 text-emerald-600" />
              <span className="hidden sm:inline-block">BookSwap</span>
            </Link>
          </div>
          <nav className="hidden md:flex items-center gap-6 text-sm font-medium">
            <Link href="/books" className="hover:text-emerald-600 transition-colors">
              Browse
            </Link>
            <Link href="/features" className="hover:text-emerald-600 transition-colors">
              Features
            </Link>
            <Link href="#how-it-works" className="hover:text-emerald-600 transition-colors">
              How It Works
            </Link>
            <Link href="/contact" className="hover:text-emerald-600 transition-colors">
              Contact
            </Link>
          </nav>
          <div className="flex items-center gap-4">
            {!loading &&
              (user ? (
                <NavbarUserMenu user={user} />
              ) : (
                <Button asChild>
                  <Link href="/login">Get Started</Link>
                </Button>
              ))}
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="outline" size="icon" className="md:hidden bg-transparent">
                  <Menu className="h-6 w-6" />
                  <span className="sr-only">Toggle navigation menu</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="right">
                <div className="grid gap-4 p-4">
                  <Link href="/books" className="font-medium hover:text-emerald-600 transition-colors">
                    Browse
                  </Link>
                  <Link href="/features" className="font-medium hover:text-emerald-600 transition-colors">
                    Features
                  </Link>
                  <Link href="#how-it-works" className="font-medium hover:text-emerald-600 transition-colors">
                    How It Works
                  </Link>
                  <Link href="/contact" className="font-medium hover:text-emerald-600 transition-colors">
                    Contact
                  </Link>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </header>
  )
}
