import type React from "react"
import type { Metadata, Viewport } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { AuthProvider } from "@/contexts/auth-context"
import { Toaster } from "@/components/ui/toaster"
import { Analytics } from "@vercel/analytics/next"

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
})

export const metadata: Metadata = {
  metadataBase: new URL("https://www.bookswap.pro"),
  title: {
    default: "BookSwap - Buy, Sell, Exchange & Donate Books Online | Malaysia Book Marketplace",
    template: "%s | BookSwap",
  },
  description:
    "BookSwap is Malaysia's leading online book marketplace. Buy used books, sell your books, exchange books with readers, and donate books to the community. Join 10,000+ book lovers today!",
  keywords: [
    "bookswap",
    "book swap",
    "book exchange",
    "book donate",
    "book donation",
    "buy books online",
    "sell books online",
    "used books Malaysia",
    "second hand books",
    "book marketplace",
    "exchange books",
    "swap books",
    "donate books",
    "book community",
    "book trading",
    "preloved books",
    "cheap books",
    "affordable books",
    "book lovers Malaysia",
    "online book store",
  ],
  authors: [{ name: "BookSwap Team", url: "https://www.bookswap.pro" }],
  creator: "BookSwap",
  publisher: "BookSwap",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  openGraph: {
    type: "website",
    locale: "en_MY",
    url: "https://www.bookswap.pro",
    siteName: "BookSwap",
    title: "BookSwap - Buy, Sell, Exchange & Donate Books Online in Malaysia",
    description:
      "Join Malaysia's largest book community. Buy used books, sell books, exchange with readers, and donate to spread knowledge. 50,000+ books available!",
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "BookSwap - Malaysia's Book Exchange Platform",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "BookSwap - Buy, Sell, Exchange & Donate Books Online",
    description: "Malaysia's leading book marketplace. Buy, sell, swap, and donate books. Join 10,000+ readers today!",
    images: ["/og-image.jpg"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  alternates: {
    canonical: "https://www.bookswap.pro",
  },
  verification: {
    google: "google-site-verification-code",
  },
    generator: 'v0.app'
}

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#10b981" },
    { media: "(prefers-color-scheme: dark)", color: "#059669" },
  ],
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={inter.variable}>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "WebSite",
              name: "BookSwap",
              url: "https://www.bookswap.pro",
              description: "Buy, sell, exchange and donate books online in Malaysia",
              potentialAction: {
                "@type": "SearchAction",
                target: "https://www.bookswap.pro/books?search={search_term_string}",
                "query-input": "required name=search_term_string",
              },
              publisher: {
                "@type": "Organization",
                name: "BookSwap",
                url: "https://www.bookswap.pro",
                logo: "https://www.bookswap.pro/logo.png",
                sameAs: [],
              },
            }),
          }}
        />
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
        <Analytics />
      </body>
    </html>
  )
}
