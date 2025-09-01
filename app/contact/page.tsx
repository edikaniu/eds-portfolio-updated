import { ContactSection } from "@/components/contact-section"
import { Navigation } from "@/components/navigation"
import { Footer } from "@/components/footer"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Contact - Edikan Udoibuot",
  description: "Get in touch with Edikan Udoibuot for marketing strategy, AI automation, and growth consulting opportunities.",
  openGraph: {
    title: "Contact - Edikan Udoibuot",
    description: "Get in touch with Edikan Udoibuot for marketing strategy, AI automation, and growth consulting opportunities.",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Contact - Edikan Udoibuot",
    description: "Get in touch with Edikan Udoibuot for marketing strategy, AI automation, and growth consulting opportunities.",
  },
}

export default function ContactPage() {
  return (
    <>
      <Navigation />
      <main className="min-h-screen">
        {/* Header Section */}
        <section className="py-16 bg-gradient-to-b from-background via-card/30 to-background">
          <div className="container mx-auto px-6 lg:px-12 xl:px-16">
            <div className="max-w-4xl mx-auto text-center">
              <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-6">
                Get In Touch
              </h1>
              <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
                Ready to transform your marketing strategy? Let's discuss how we can scale your growth with AI-powered automation and data-driven insights.
              </p>
            </div>
          </div>
        </section>

        {/* Contact Section */}
        <section>
          <ContactSection />
        </section>
      </main>
      <Footer />
    </>
  )
}