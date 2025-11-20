import Link from "next/link"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"

export default function TermsPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 py-16 md:py-24 bg-gray-50 dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col items-center justify-center space-y-4 text-center mb-12">
            <div className="space-y-3 max-w-[800px]">
              <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">Terms of Service</h1>
              <p className="text-gray-500 md:text-xl dark:text-gray-400">
                Last updated:{" "}
                {new Date().toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}
              </p>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 md:p-8 lg:p-10 mb-8">
            <div className="prose prose-emerald dark:prose-invert max-w-none">
              <h2>1. Introduction</h2>
              <p>
                Welcome to BookSwap. These Terms of Service ("Terms") govern your use of our website, services, and
                applications (collectively, the "Service"). By accessing or using the Service, you agree to be bound by
                these Terms. If you disagree with any part of the Terms, you may not access the Service.
              </p>

              <h2>2. Definitions</h2>
              <p>
                <strong>"BookSwap"</strong> (or "we", "us", "our") refers to the company BookSwap Inc., operating the
                book exchange platform.
              </p>
              <p>
                <strong>"Service"</strong> refers to the website, applications, and services provided by BookSwap.
              </p>
              <p>
                <strong>"User"</strong> (or "you", "your") refers to the individual or entity using our Service.
              </p>
              <p>
                <strong>"Books"</strong> refers to physical books listed, exchanged, sold, or purchased through our
                Service.
              </p>

              <h2>3. Account Registration</h2>
              <p>
                To use certain features of the Service, you must register for an account. You agree to provide accurate,
                current, and complete information during the registration process and to update such information to keep
                it accurate, current, and complete.
              </p>
              <p>
                You are responsible for safeguarding the password that you use to access the Service and for any
                activities or actions under your password. You agree not to disclose your password to any third party.
                You must notify us immediately upon becoming aware of any breach of security or unauthorized use of your
                account.
              </p>

              <h2>4. Book Listings and Exchanges</h2>
              <p>
                Users may list books for exchange, sale, or donation. By listing a book, you represent and warrant that:
              </p>
              <ul>
                <li>You own the book or have the right to sell, exchange, or donate it</li>
                <li>The book is in the condition described in your listing</li>
                <li>The book does not violate any applicable laws or regulations</li>
                <li>The book does not infringe on any intellectual property rights</li>
              </ul>
              <p>
                BookSwap reserves the right to remove any listing that violates these Terms or for any other reason at
                our sole discretion.
              </p>

              <h2>5. Transactions Between Users</h2>
              <p>
                BookSwap facilitates transactions between users but is not a party to any transaction. Users are solely
                responsible for all aspects of their transactions, including but not limited to:
              </p>
              <ul>
                <li>Communicating with other users</li>
                <li>Arranging payment and delivery</li>
                <li>Resolving disputes</li>
                <li>Ensuring the quality and condition of books</li>
              </ul>
              <p>
                While we strive to create a safe platform, BookSwap cannot guarantee the identity, statements, or
                conduct of users. You agree to take reasonable precautions in all transactions.
              </p>

              <h2>6. Fees and Payments</h2>
              <p>
                BookSwap may charge fees for certain services. All fees are listed on our website and are subject to
                change with notice. You agree to pay all applicable fees and taxes associated with your use of the
                Service.
              </p>
              <p>
                For transactions between users, BookSwap may collect payment from buyers and remit payment to sellers
                after deducting applicable fees. Payments are processed through our third-party payment processors.
              </p>

              <h2>7. Prohibited Activities</h2>
              <p>You agree not to engage in any of the following prohibited activities:</p>
              <ul>
                <li>Violating any laws or regulations</li>
                <li>Infringing on the intellectual property rights of others</li>
                <li>Posting false, inaccurate, or misleading content</li>
                <li>Impersonating another person or entity</li>
                <li>Harassing, threatening, or intimidating other users</li>
                <li>Using the Service for any illegal purpose</li>
                <li>Attempting to gain unauthorized access to the Service or other users' accounts</li>
                <li>Interfering with the proper functioning of the Service</li>
              </ul>

              <h2>8. Intellectual Property</h2>
              <p>
                The Service and its original content, features, and functionality are and will remain the exclusive
                property of BookSwap and its licensors. The Service is protected by copyright, trademark, and other
                laws.
              </p>
              <p>
                Users retain ownership of any content they submit to the Service, but grant BookSwap a worldwide,
                non-exclusive, royalty-free license to use, reproduce, modify, adapt, publish, translate, and distribute
                such content in connection with the Service.
              </p>

              <h2>9. Termination</h2>
              <p>
                We may terminate or suspend your account and bar access to the Service immediately, without prior notice
                or liability, under our sole discretion, for any reason whatsoever, including but not limited to a
                breach of the Terms.
              </p>
              <p>
                If you wish to terminate your account, you may simply discontinue using the Service or contact us to
                request account deletion.
              </p>

              <h2>10. Limitation of Liability</h2>
              <p>
                In no event shall BookSwap, nor its directors, employees, partners, agents, suppliers, or affiliates, be
                liable for any indirect, incidental, special, consequential or punitive damages, including without
                limitation, loss of profits, data, use, goodwill, or other intangible losses, resulting from:
              </p>
              <ul>
                <li>Your access to or use of or inability to access or use the Service</li>
                <li>Any conduct or content of any third party on the Service</li>
                <li>Any content obtained from the Service</li>
                <li>Unauthorized access, use, or alteration of your transmissions or content</li>
              </ul>

              <h2>11. Disclaimer</h2>
              <p>
                Your use of the Service is at your sole risk. The Service is provided on an "AS IS" and "AS AVAILABLE"
                basis. The Service is provided without warranties of any kind, whether express or implied.
              </p>

              <h2>12. Governing Law</h2>
              <p>
                These Terms shall be governed and construed in accordance with the laws of [Your Jurisdiction], without
                regard to its conflict of law provisions.
              </p>

              <h2>13. Changes to Terms</h2>
              <p>
                We reserve the right, at our sole discretion, to modify or replace these Terms at any time. We will
                provide notice of any changes by posting the new Terms on this page and updating the "last updated"
                date.
              </p>
              <p>
                Your continued use of the Service after any such changes constitutes your acceptance of the new Terms.
              </p>

              <h2>14. Contact Us</h2>
              <p>If you have any questions about these Terms, please contact us at:</p>
              <p>
                Telegram:{" "}
                <a href="https://t.me/+447476933400" target="_blank" rel="noopener noreferrer">
                  +44 7476 933400
                </a>
              </p>
            </div>
          </div>

          <div className="flex justify-center">
            <Button variant="outline" asChild>
              <Link href="/" className="inline-flex items-center">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Home
              </Link>
            </Button>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}
