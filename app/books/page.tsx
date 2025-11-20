import type { Metadata } from "next"
import ClientBooksPage from "./client"

export const metadata: Metadata = {
  title: "Browse Books - Buy, Sell & Exchange Used Books Online | BookSwap Malaysia",
  description:
    "Browse 50,000+ used books available for sale, exchange, or donation in Malaysia. Find affordable second-hand books from romance to textbooks. Free book listings!",
  keywords: [
    "buy used books Malaysia",
    "sell second hand books",
    "exchange books online",
    "cheap books Malaysia",
    "preloved books",
    "book marketplace",
  ],
  openGraph: {
    title: "Browse 50,000+ Books - Buy, Sell & Exchange | BookSwap",
    description:
      "Find your next great read from thousands of used books. Buy, sell, or exchange books with readers across Malaysia.",
    url: "https://www.bookswap.pro/books",
  },
  alternates: {
    canonical: "https://www.bookswap.pro/books",
  },
}

export default function BooksPage() {
  return <ClientBooksPage />
}
