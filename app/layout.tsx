import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { AuthProvider } from "@/contexts/auth-context"
import { Toaster } from "@/components/ui/toaster"

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
})

export const metadata: Metadata = {
  title: "BookSwap - Exchange, Buy & Donate Books",
  description:
    "Join BookSwap to exchange, buy, and donate books with fellow book lovers. Discover your next great read while giving your books a new home.",
  keywords: "book exchange, book swap, buy books, donate books, book community",
  authors: [{ name: "BookSwap Team" }],
  openGraph: {
    title: "BookSwap - Exchange, Buy & Donate Books",
    description: "Join BookSwap to exchange, buy, and donate books with fellow book lovers.",
    type: "website",
  },
    generator: 'v0.app'
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={inter.variable}>
      <head>
        <style>{`
          html {
            font-family: ${inter.style.fontFamily};
            --font-sans: ${inter.variable};
          }
        `}</style>
      </head>
      <body className={`font-sans ${inter.className}`}>
        <AuthProvider>
          {children}
          <Toaster />
        </AuthProvider>
      </body>
    </html>
  )
}
