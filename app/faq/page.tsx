import type { Metadata } from "next"
import Link from "next/link"
import { BookOpen, MessageCircle, Shield, CreditCard, Users, HelpCircle } from "lucide-react"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"

export const metadata: Metadata = {
  title: "FAQ - Frequently Asked Questions | BookSwap",
  description: "Find answers to common questions about buying, selling, swapping, and donating books on BookSwap.",
}

const faqCategories = [
  {
    category: "Getting Started",
    icon: BookOpen,
    questions: [
      {
        question: "How do I sign up for BookSwap?",
        answer:
          "You can sign up for BookSwap using your Google account or phone number (Malaysia only). Simply click the 'Sign Up' button in the navigation bar, choose your preferred method, and follow the prompts. It's quick, free, and easy!",
      },
      {
        question: "Is BookSwap free to use?",
        answer:
          "Yes! BookSwap is completely free to use. You can list books, browse listings, and connect with other book lovers at no cost. We only facilitate the connection between buyers and sellers - any payment arrangements are made directly between users.",
      },
      {
        question: "What types of books can I list?",
        answer:
          "You can list any type of book on BookSwap - fiction, non-fiction, textbooks, comics, magazines, and more. We support all genres and categories. Just make sure the books are in reasonable condition and accurately described.",
      },
    ],
  },
  {
    category: "Buying & Selling",
    icon: CreditCard,
    questions: [
      {
        question: "How do I buy a book?",
        answer:
          "Browse available books, click on one you're interested in, and click the 'Buy Now' button. You'll be redirected to complete the purchase. After purchase, you can coordinate delivery or pickup with the seller through our messaging system.",
      },
      {
        question: "How do I list a book for sale?",
        answer:
          "Go to your Dashboard, click 'Add New Book', fill in the book details (title, author, condition, price, etc.), upload a cover image, and select 'Sale' as the listing type. Your book will be visible to all BookSwap users immediately!",
      },
      {
        question: "How do payments work?",
        answer:
          "Currently, BookSwap facilitates connections between buyers and sellers. Payment arrangements, delivery, and pickup are coordinated directly between users. We recommend meeting in public places and using secure payment methods.",
      },
      {
        question: "Can I edit or delete my listings?",
        answer:
          "Yes! Go to your Dashboard, find 'My Books', and you'll see options to edit or delete any of your listings. You can update prices, descriptions, availability, and more at any time.",
      },
    ],
  },
  {
    category: "Book Swapping",
    icon: Users,
    questions: [
      {
        question: "How does book swapping work?",
        answer:
          "Find a book you want that's listed for 'Exchange', click 'Request Swap', select one of your books to offer in exchange, and send a message to the owner. If they accept, you can coordinate the swap details through our messaging system.",
      },
      {
        question: "Can I swap multiple books at once?",
        answer:
          "Currently, each swap request is for a single book exchange. However, you can send multiple swap requests and coordinate bundle swaps through our messaging system with the other user.",
      },
      {
        question: "What if someone wants to swap with me?",
        answer:
          "You'll receive a notification when someone requests to swap with you. Go to your Dashboard > Swap Requests to view all incoming requests. You can accept, decline, or negotiate through messages.",
      },
      {
        question: "How do I list a book for swapping?",
        answer:
          "When adding a book, select 'Exchange' as the listing type. This makes your book visible to others looking to swap rather than buy or receive donations.",
      },
    ],
  },
  {
    category: "Donations",
    icon: HelpCircle,
    questions: [
      {
        question: "Can I donate books on BookSwap?",
        answer:
          "When listing a book, select 'Donation' as the listing type and set the price to RM 0. This lets others know you're giving the book away for free. It's a great way to share the joy of reading!",
      },
      {
        question: "How do I claim a donated book?",
        answer:
          "Browse books with the 'Donation' listing type, click on one you want, and use the messaging feature to contact the donor. Coordinate pickup or delivery details directly with them.",
      },
    ],
  },
  {
    category: "Account & Safety",
    icon: Shield,
    questions: [
      {
        question: "How do I manage my profile?",
        answer:
          "Click on your profile icon in the navigation bar and select 'Profile' or 'Settings'. Here you can update your display name, bio, profile picture, and other account preferences.",
      },
      {
        question: "Is my personal information safe?",
        answer:
          "Yes! We take privacy seriously. Your email and phone number are never shared with other users. Only your display name and bio are visible on your public profile. Read our Privacy Policy for more details.",
      },
      {
        question: "How do I report a problem or suspicious activity?",
        answer:
          "If you encounter any issues or suspicious behavior, please contact us immediately through the Contact page or email us. We take all reports seriously and will investigate promptly.",
      },
      {
        question: "Can I delete my account?",
        answer:
          "Yes, you can delete your account from the Settings page. Please note that this action is permanent and will remove all your listings, messages, and account data.",
      },
    ],
  },
  {
    category: "Features & Tools",
    icon: MessageCircle,
    questions: [
      {
        question: "How does the wishlist work?",
        answer:
          "Click the heart icon on any book listing to add it to your wishlist. Access your wishlist from your Dashboard to keep track of books you're interested in. You'll also be notified if the price drops or availability changes.",
      },
      {
        question: "How do I message other users?",
        answer:
          "Click on a book listing and use the 'Contact Seller' button, or go to Dashboard > Messages to view all your conversations. Our messaging system keeps all communication secure and organized.",
      },
      {
        question: "What are notifications for?",
        answer:
          "You'll receive notifications for swap requests, purchase confirmations, messages, wishlist updates, and other important activity. Manage notification preferences in your Settings.",
      },
      {
        question: "Can I search for specific books?",
        answer:
          "Yes! Use the search bar to find books by title, author, or category. You can also filter by listing type (Sale, Exchange, Donation), price range, and condition to narrow down results.",
      },
    ],
  },
]

export default function FAQPage() {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-emerald-50 via-white to-blue-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 py-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 px-4 py-2 rounded-full text-sm font-medium mb-6">
            <HelpCircle className="h-4 w-4" />
            <span>Frequently Asked Questions</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-emerald-600 to-blue-600 bg-clip-text text-transparent">
            How Can We Help You?
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-300 mb-8 max-w-2xl mx-auto">
            Find answers to common questions about buying, selling, swapping, and donating books on BookSwap.
          </p>
        </div>
      </section>

      {/* FAQ Content */}
      <section className="py-16 px-4">
        <div className="max-w-5xl mx-auto space-y-12">
          {faqCategories.map((category, categoryIndex) => (
            <div key={categoryIndex}>
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-emerald-100 dark:bg-emerald-900/30 rounded-lg">
                  <category.icon className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{category.category}</h2>
              </div>

              <Card>
                <CardContent className="p-6">
                  <Accordion type="single" collapsible className="w-full">
                    {category.questions.map((faq, faqIndex) => (
                      <AccordionItem
                        key={faqIndex}
                        value={`item-${categoryIndex}-${faqIndex}`}
                        className="border-b last:border-b-0"
                      >
                        <AccordionTrigger className="text-left hover:no-underline py-4">
                          <span className="font-medium text-gray-900 dark:text-white pr-4">{faq.question}</span>
                        </AccordionTrigger>
                        <AccordionContent className="text-gray-600 dark:text-gray-300 pb-4">
                          {faq.answer}
                        </AccordionContent>
                      </AccordionItem>
                    ))}
                  </Accordion>
                </CardContent>
              </Card>
            </div>
          ))}
        </div>
      </section>

      {/* Still Have Questions CTA */}
      <section className="py-16 px-4 bg-gradient-to-r from-emerald-600 to-blue-600">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">Still Have Questions?</h2>
          <p className="text-lg text-white/90 mb-8 max-w-2xl mx-auto">
            Can't find what you're looking for? Our support team is here to help you with any questions or concerns.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" variant="secondary" asChild>
              <Link href="/contact">
                <MessageCircle className="mr-2 h-5 w-5" />
                Contact Support
              </Link>
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="bg-white/10 text-white border-white/30 hover:bg-white/20"
              asChild
            >
              <Link href="/dashboard">Go to Dashboard</Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  )
}
