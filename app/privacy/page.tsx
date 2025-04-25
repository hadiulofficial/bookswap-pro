import Link from "next/link"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"

export default function PrivacyPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 py-16 md:py-24 bg-gray-50 dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col items-center justify-center space-y-4 text-center mb-12">
            <div className="space-y-3 max-w-[800px]">
              <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">Privacy Policy</h1>
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
                At BookSwap, we respect your privacy and are committed to protecting your personal data. This Privacy
                Policy explains how we collect, use, disclose, and safeguard your information when you use our Service.
              </p>
              <p>
                Please read this Privacy Policy carefully. If you do not agree with the terms of this Privacy Policy,
                please do not access the Service.
              </p>

              <h2>2. Information We Collect</h2>
              <h3>2.1 Personal Data</h3>
              <p>We may collect personal information that you voluntarily provide to us when you:</p>
              <ul>
                <li>Register for an account</li>
                <li>Express interest in obtaining information about us or our products</li>
                <li>Participate in activities on the Service</li>
                <li>Contact us</li>
              </ul>
              <p>The personal information we collect may include:</p>
              <ul>
                <li>Name</li>
                <li>Email address</li>
                <li>Postal address</li>
                <li>Phone number</li>
                <li>Payment information</li>
                <li>Profile picture</li>
                <li>User-generated content (such as book listings, reviews, and messages)</li>
              </ul>

              <h3>2.2 Automatically Collected Information</h3>
              <p>
                We automatically collect certain information when you visit, use, or navigate the Service. This
                information does not reveal your specific identity but may include:
              </p>
              <ul>
                <li>Device and usage information</li>
                <li>IP address</li>
                <li>Browser and device characteristics</li>
                <li>Operating system</li>
                <li>Language preferences</li>
                <li>Referring URLs</li>
                <li>Information about how and when you use our Service</li>
              </ul>
              <p>
                This information is primarily needed to maintain the security and operation of our Service, and for our
                internal analytics and reporting purposes.
              </p>

              <h2>3. How We Use Your Information</h2>
              <p>We use the information we collect or receive:</p>
              <ul>
                <li>To facilitate account creation and authentication</li>
                <li>To provide, operate, and maintain our Service</li>
                <li>To improve, personalize, and expand our Service</li>
                <li>To understand and analyze how you use our Service</li>
                <li>To develop new products, services, features, and functionality</li>
                <li>To communicate with you about updates, security alerts, and support</li>
                <li>To process transactions and send related information</li>
                <li>To find and prevent fraud</li>
                <li>For compliance purposes, including enforcing our Terms of Service</li>
              </ul>

              <h2>4. Sharing Your Information</h2>
              <p>We may share your information with:</p>
              <h3>4.1 Other Users</h3>
              <p>
                When you share personal information (for example, by posting a book listing or sending messages) on the
                Service, such information may be viewed by other users.
              </p>

              <h3>4.2 Third-Party Service Providers</h3>
              <p>
                We may share your information with third-party vendors, service providers, contractors, or agents who
                perform services for us or on our behalf and require access to such information to do that work.
                Examples include payment processing, data analysis, email delivery, hosting services, customer service,
                and marketing efforts.
              </p>

              <h3>4.3 Business Transfers</h3>
              <p>
                If we are involved in a merger, acquisition, or sale of all or a portion of our assets, your information
                may be transferred as part of that transaction.
              </p>

              <h3>4.4 Legal Requirements</h3>
              <p>
                We may disclose your information where we are legally required to do so in order to comply with
                applicable law, governmental requests, a judicial proceeding, court order, or legal process.
              </p>

              <h2>5. Data Security</h2>
              <p>
                We have implemented appropriate technical and organizational security measures designed to protect the
                security of any personal information we process. However, despite our safeguards and efforts to secure
                your information, no electronic transmission over the Internet or information storage technology can be
                guaranteed to be 100% secure.
              </p>

              <h2>6. Data Retention</h2>
              <p>
                We will only keep your personal information for as long as it is necessary for the purposes set out in
                this Privacy Policy, unless a longer retention period is required or permitted by law.
              </p>
              <p>
                When we have no ongoing legitimate business need to process your personal information, we will either
                delete or anonymize such information.
              </p>

              <h2>7. Your Privacy Rights</h2>
              <p>Depending on your location, you may have certain rights regarding your personal information:</p>
              <ul>
                <li>The right to access information we hold about you</li>
                <li>The right to request that we correct any inaccurate personal information</li>
                <li>The right to request that we delete your personal information</li>
                <li>The right to opt out of marketing communications</li>
                <li>The right to data portability</li>
                <li>The right to object to processing of your personal information</li>
                <li>The right to withdraw consent</li>
              </ul>
              <p>
                To exercise these rights, please contact us using the contact information provided at the end of this
                Privacy Policy.
              </p>

              <h2>8. Children's Privacy</h2>
              <p>
                Our Service is not directed to children under 13 (or 16 in the European Union). We do not knowingly
                collect personal information from children. If you are a parent or guardian and you are aware that your
                child has provided us with personal information, please contact us.
              </p>

              <h2>9. International Data Transfers</h2>
              <p>
                Your information may be transferred to, and maintained on, computers located outside of your state,
                province, country, or other governmental jurisdiction where the data protection laws may differ from
                those of your jurisdiction.
              </p>
              <p>
                If you are located outside the United States and choose to provide information to us, please note that
                we transfer the data to the United States and process it there.
              </p>

              <h2>10. Changes to This Privacy Policy</h2>
              <p>
                We may update our Privacy Policy from time to time. We will notify you of any changes by posting the new
                Privacy Policy on this page and updating the "Last updated" date.
              </p>
              <p>
                You are advised to review this Privacy Policy periodically for any changes. Changes to this Privacy
                Policy are effective when they are posted on this page.
              </p>

              <h2>11. Contact Us</h2>
              <p>If you have any questions about this Privacy Policy, please contact us at:</p>
              <p>
                Email: <a href="mailto:privacy@bookswap.com">privacy@bookswap.com</a>
                <br />
                Address: 123 Book Street, Reading, CA 94000
                <br />
                Phone: (555) 123-4567
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
