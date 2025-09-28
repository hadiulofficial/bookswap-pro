import { Globe, BookHeart, Users, Library } from "lucide-react"

export function TrustedBySection() {
  return (
    <section className="py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <p className="text-sm font-semibold text-gray-500 uppercase tracking-wider">
            Trusted by a global community of readers
          </p>
          <div className="mt-6 grid grid-cols-2 gap-8 md:grid-cols-4">
            <div className="col-span-1 flex justify-center items-center gap-2">
              <Globe className="h-6 w-6 text-gray-400" />
              <span className="text-gray-500 font-medium">Global Readers</span>
            </div>
            <div className="col-span-1 flex justify-center items-center gap-2">
              <BookHeart className="h-6 w-6 text-gray-400" />
              <span className="text-gray-500 font-medium">Book Lovers Inc.</span>
            </div>
            <div className="col-span-1 flex justify-center items-center gap-2">
              <Users className="h-6 w-6 text-gray-400" />
              <span className="text-gray-500 font-medium">Readers United</span>
            </div>
            <div className="col-span-1 flex justify-center items-center gap-2">
              <Library className="h-6 w-6 text-gray-400" />
              <span className="text-gray-500 font-medium">The Library Hub</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
