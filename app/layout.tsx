import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { AuthProvider } from "@/contexts/auth-context"
import { Toaster } from "@/components/ui/toaster"

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
})

export const metadata: Metadata = {
  title: "BookSwap - Share Books, Connect Readers",
  description:
    "Buy, sell, donate, or exchange books with fellow readers. Join BookSwap and give your books a new life.",
  keywords: "books, book exchange, book swap, buy books, sell books, donate books",
  authors: [{ name: "BookSwap Team" }],
  openGraph: {
    title: "BookSwap - Share Books, Connect Readers",
    description:
      "Buy, sell, donate, or exchange books with fellow readers. Join BookSwap and give your books a new life.",
    type: "website",
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: "BookSwap - Share Books, Connect Readers",
    description:
      "Buy, sell, donate, or exchange books with fellow readers. Join BookSwap and give your books a new life.",
  },
  robots: {
    index: true,
    follow: true,
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
      <body className={`${inter.className} antialiased`}>
        <AuthProvider>
          {children}
          <Toaster />
        </AuthProvider>
      </body>
    </html>
  )
}
