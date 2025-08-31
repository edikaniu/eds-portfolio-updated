import Link from "next/link"
import { Mail, Linkedin } from "lucide-react"
import { NewsletterCTA } from "@/components/newsletter"

export function Footer() {
  const currentYear = new Date().getFullYear()

  const socialLinks = [
    {
      name: "LinkedIn",
      href: "https://www.linkedin.com/in/edikanudoibuot/",
      icon: <Linkedin className="h-5 w-5" />,
    },
    {
      name: "Email",
      href: "mailto:edikanudoibuot@gmail.com",
      icon: <Mail className="h-5 w-5" />,
    },
    {
      name: "X (Twitter)",
      href: "https://x.com/edikanudoibuot",
      icon: (
        <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
          <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
        </svg>
      ),
    },
  ]

  const quickLinks = [
    { name: "About", href: "/#about", isSection: true },
    { name: "Projects", href: "/projects", isSection: false },
    { name: "Case Studies", href: "/case-studies", isSection: false },
    { name: "Blog", href: "/blog", isSection: false },
    { name: "Contact", href: "/#contact", isSection: true },
  ]

  return (
    <footer className="bg-card/50 border-t border-border/50">
      <div className="container mx-auto px-6 lg:px-12 xl:px-16 py-12">
        <div className="max-w-6xl mx-auto">
          {/* Newsletter Section */}
          <div className="mb-12">
            <NewsletterCTA 
              variant="inline"
              title="Stay Updated with Marketing Insights"
              description="Get weekly case studies, growth tactics, and AI marketing strategies in your inbox."
              showStats={false}
              className="border border-border/50"
            />
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {/* Brand Section */}
            <div className="space-y-4">
              <div>
                <Link href="/">
                  <h3 className="text-2xl font-bold text-foreground hover:text-primary transition-colors cursor-pointer">Edikan Udoibuot</h3>
                </Link>
                <p className="text-primary font-medium">Marketing & Growth Leader</p>
              </div>
              <p className="text-muted-foreground leading-relaxed">
                Scaling products from hundreds to thousands of users through data-driven growth strategies and
                AI-powered marketing.
              </p>
              <div className="flex gap-4">
                {socialLinks.map((link) => (
                  <a
                    key={link.name}
                    href={link.href}
                    target={link.href.startsWith("http") ? "_blank" : undefined}
                    rel={link.href.startsWith("http") ? "noopener noreferrer" : undefined}
                    className="p-2 rounded-lg bg-background/50 text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors"
                    aria-label={link.name}
                  >
                    {link.icon}
                  </a>
                ))}
              </div>
            </div>

            {/* Quick Links */}
            <div>
              <h4 className="text-lg font-semibold text-foreground mb-4">Quick Links</h4>
              <ul className="space-y-2">
                {quickLinks.map((link) => (
                  <li key={link.name}>
                    <Link href={link.href} className="text-muted-foreground hover:text-primary transition-colors">
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Contact Info */}
            <div>
              <h4 className="text-lg font-semibold text-foreground mb-4">Let's Connect</h4>
              <div className="space-y-3">
                <div>
                  <p className="text-sm text-muted-foreground">Email</p>
                  <a
                    href="mailto:edikanudoibuot@gmail.com"
                    className="text-foreground hover:text-primary transition-colors"
                  >
                    edikanudoibuot@gmail.com
                  </a>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">X (Twitter)</p>
                  <a
                    href="https://x.com/edikanudoibuot"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-foreground hover:text-primary transition-colors"
                  >
                    @edikanudoibuot
                  </a>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Location</p>
                  <p className="text-foreground">Nigeria</p>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom Section */}
          <div className="border-t border-border/50 mt-8 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-sm text-muted-foreground">© {currentYear} Edikan Udoibuot. All rights reserved.</p>
            <div className="flex gap-6 text-sm">
              <a href="#" className="text-muted-foreground hover:text-primary transition-colors">
                Privacy Policy
              </a>
              <a href="#" className="text-muted-foreground hover:text-primary transition-colors">
                Terms of Service
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}
