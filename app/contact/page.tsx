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
        {/* Hero Header Section */}
        <section className="py-20 bg-gradient-to-br from-background via-card/20 via-primary/5 to-background relative overflow-hidden">
          {/* Background decorations */}
          <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
          <div className="absolute top-20 right-20 w-64 h-64 bg-primary/5 rounded-full blur-3xl"></div>
          <div className="absolute bottom-10 left-10 w-48 h-48 bg-accent/5 rounded-full blur-2xl"></div>
          
          <div className="container mx-auto px-6 lg:px-12 xl:px-16 relative z-10">
            <div className="max-w-5xl mx-auto text-center">
              {/* Badge */}
              <div className="inline-flex items-center gap-2 px-6 py-3 bg-primary/10 rounded-full text-primary font-medium text-sm mb-8 border border-primary/20">
                <div className="w-2 h-2 bg-primary rounded-full animate-pulse"></div>
                Available for New Projects
              </div>
              
              {/* Main Heading */}
              <h1 className="text-5xl md:text-7xl font-bold text-foreground mb-8 bg-gradient-to-r from-foreground via-primary to-foreground bg-clip-text text-transparent leading-tight">
                Let's Create Something
                <br />
                <span className="text-primary">Extraordinary</span>
              </h1>
              
              {/* Description */}
              <p className="text-xl md:text-2xl text-muted-foreground max-w-4xl mx-auto leading-relaxed mb-8">
                Ready to transform your marketing strategy and accelerate growth? Let's discuss how we can scale your business with innovative, data-driven solutions.
              </p>
              
              {/* Quick Stats */}
              <div className="flex flex-wrap justify-center gap-8 text-center">
                <div className="flex flex-col items-center">
                  <div className="text-3xl font-bold text-primary mb-1">24h</div>
                  <div className="text-sm text-muted-foreground">Response Time</div>
                </div>
                <div className="flex flex-col items-center">
                  <div className="text-3xl font-bold text-primary mb-1">7+</div>
                  <div className="text-sm text-muted-foreground">Years Experience</div>
                </div>
                <div className="flex flex-col items-center">
                  <div className="text-3xl font-bold text-primary mb-1">50+</div>
                  <div className="text-sm text-muted-foreground">Projects Delivered</div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Contact Section */}
        <ContactSection />
      </main>
      <Footer />
    </>
  )
}