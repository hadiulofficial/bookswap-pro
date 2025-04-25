import type React from "react"
import "./globals.css"
import { AuthProvider } from "@/contexts/auth-context"

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
      <body>
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  )
}
