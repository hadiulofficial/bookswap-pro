import Link from "next/link"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"

export default function CookiesPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 py-16 md:py-24 bg-gray-50 dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col items-center justify-center space-y-4 text-center mb-12">
            <div className="space-y-3 max-w-[800px]">
              <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">Cookie Policy</h1>
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
                This Cookie Policy explains how BookSwap ("we", "us", or "our") uses cookies and similar technologies to
                recognize you when you visit our website. It explains what these technologies are and why we use them,
                as well as your rights to control our use of them.
              </p>

              <h2>2. What Are Cookies?</h2>
              <p>
                Cookies are small data files that are placed on your computer or mobile device when you visit a website.
                Cookies are widely used by website owners in order to make their websites work, or to work more
                efficiently, as well as to provide reporting information.
              </p>
              <p>
                Cookies set by the website owner (in this case, BookSwap) are called "first-party cookies". Cookies set
                by parties other than the website owner are called "third-party cookies". Third-party cookies enable
                third-party features or functionality to be provided on or through the website (e.g., advertising,
                interactive content, and analytics).
              </p>

              <h2>3. Why Do We Use Cookies?</h2>
              <p>We use first-party and third-party cookies for several reasons.</p>
              <p>
                Some cookies are required for technical reasons in order for our website to operate, and we refer to
                these as "essential" or "strictly necessary" cookies.
              </p>
              <p>
                Other cookies enable us to track and target the interests of our users to enhance the experience on our
                website. These are referred to as "performance" or "functionality" cookies.
              </p>
              <p>
                Third parties serve cookies through our website for advertising, analytics, and other purposes. This is
                described in more detail below.
              </p>

              <h2>4. Types of Cookies We Use</h2>
              <p>The specific types of first and third-party cookies served through our website include:</p>

              <h3>4.1 Essential Cookies</h3>
              <p>
                These cookies are strictly necessary to provide you with services available through our website and to
                use some of its features, such as access to secure areas. Because these cookies are strictly necessary
                to deliver the website, you cannot refuse them without impacting how our website functions.
              </p>
              <p>Examples of essential cookies we use:</p>
              <ul>
                <li>Session cookies to operate our service</li>
                <li>Authentication cookies to remember your login status</li>
                <li>Security cookies for fraud prevention and site integrity</li>
              </ul>

              <h3>4.2 Performance and Functionality Cookies</h3>
              <p>
                These cookies are used to enhance the performance and functionality of our website but are non-essential
                to their use. However, without these cookies, certain functionality may become unavailable.
              </p>
              <p>Examples of performance and functionality cookies we use:</p>
              <ul>
                <li>Cookies to remember your preferences (e.g., language, region)</li>
                <li>Cookies to personalize content</li>
                <li>Cookies to improve site performance and speed</li>
              </ul>

              <h3>4.3 Analytics and Customization Cookies</h3>
              <p>
                These cookies collect information that is used either in aggregate form to help us understand how our
                website is being used or how effective our marketing campaigns are, or to help us customize our website
                for you.
              </p>
              <p>Examples of analytics and customization cookies we use:</p>
              <ul>
                <li>Google Analytics cookies to track user behavior and measure site performance</li>
                <li>Cookies to understand how visitors interact with our website</li>
                <li>Cookies to test different designs and features for our site</li>
              </ul>

              <h3>4.4 Advertising Cookies</h3>
              <p>
                These cookies are used to make advertising messages more relevant to you. They perform functions like
                preventing the same ad from continuously reappearing, ensuring that ads are properly displayed, and in
                some cases selecting advertisements that are based on your interests.
              </p>
              <p>Examples of advertising cookies we use:</p>
              <ul>
                <li>Cookies to deliver targeted advertising</li>
                <li>Cookies to measure the effectiveness of advertising campaigns</li>
                <li>Cookies to track referrals from partner websites</li>
              </ul>

              <h3>4.5 Social Media Cookies</h3>
              <p>
                These cookies are used to enable you to share pages and content that you find interesting on our website
                through third-party social networking and other websites. These cookies may also be used for advertising
                purposes.
              </p>
              <p>Examples of social media cookies we use:</p>
              <ul>
                <li>Facebook cookies for sharing and advertising</li>
                <li>Twitter cookies for sharing content</li>
                <li>Pinterest cookies for pinning content</li>
              </ul>

              <h2>5. How Can You Control Cookies?</h2>
              <p>
                You have the right to decide whether to accept or reject cookies. You can exercise your cookie
                preferences by clicking on the appropriate opt-out links provided in the cookie banner on our website.
              </p>
              <p>
                You can also set or amend your web browser controls to accept or refuse cookies. If you choose to reject
                cookies, you may still use our website though your access to some functionality and areas of our website
                may be restricted.
              </p>
              <p>
                Most web browsers allow some control of most cookies through the browser settings. To find out more
                about cookies, including how to see what cookies have been set, visit{" "}
                <a href="https://www.aboutcookies.org" target="_blank" rel="noopener noreferrer">
                  www.aboutcookies.org
                </a>{" "}
                or{" "}
                <a href="https://www.allaboutcookies.org" target="_blank" rel="noopener noreferrer">
                  www.allaboutcookies.org
                </a>
                .
              </p>

              <h2>6. How Often Will We Update This Cookie Policy?</h2>
              <p>
                We may update this Cookie Policy from time to time in order to reflect, for example, changes to the
                cookies we use or for other operational, legal, or regulatory reasons. Please therefore re-visit this
                Cookie Policy regularly to stay informed about our use of cookies and related technologies.
              </p>
              <p>The date at the top of this Cookie Policy indicates when it was last updated.</p>

              <h2>7. Where Can You Get Further Information?</h2>
              <p>If you have any questions about our use of cookies or other technologies, please contact us at:</p>
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
