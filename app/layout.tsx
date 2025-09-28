import type React from "react"
import { GeistSans } from "geist/font/sans"
import { AuthProvider } from "@/contexts/auth-context"
import { Toaster } from "@/components/ui/toaster"
import "./globals.css"

const defaultUrl = process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "http://localhost:3000"

export const metadata = {
  metadataBase: new URL(defaultUrl),
  title: "BookSwap - Buy, Sell, Donate & Exchange Books",
  description: "The ultimate platform for book lovers to buy, sell, donate, and exchange books with fellow readers.",
    generator: 'v0.app'
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={GeistSans.className}>
      <body className="bg-background text-foreground">
        <AuthProvider>
          <main className="min-h-screen flex flex-col">{children}</main>
          <Toaster />
        </AuthProvider>
      </body>
    </html>
  )
}
