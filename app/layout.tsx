import type React from "react"
import "./globals.css"
import { AuthProvider } from "@/contexts/auth-context"
import { GeistSans } from "geist/font/sans"
import { GeistMono } from "geist/font/mono"

export const metadata = {
  title: "BookSwap | Share Books, Connect Communities",
  description:
    "Buy, sell, donate, or exchange books with fellow readers. Join BookSwap and give your books a new life.",
    generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <head>
        <style>{`
          html {
            font-family: ${GeistSans.style.fontFamily};
            --font-sans: ${GeistSans.variable};
            --font-mono: ${GeistMono.variable};
          }
        `}</style>
      </head>
      <body>
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  )
}
