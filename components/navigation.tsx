"use client"

import { useState, useEffect } from "react"
import { useRouter, usePathname } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ThemeToggle, ThemeToggleWithText } from "@/components/ui/theme-toggle"
import { SearchDialog, SearchButton } from "@/components/ui/search"
import { Menu, X, ArrowUp } from "lucide-react"

const navItems = [
  { name: "About", href: "/#about", isSection: true },
  { name: "Projects", href: "/projects", isSection: false },
  { name: "Case Studies", href: "/case-studies", isSection: false },
  { name: "Blog", href: "/blog", isSection: false },
  { name: "Contact", href: "/contact", isSection: false },
]

export function Navigation() {
  const [isOpen, setIsOpen] = useState(false)
  const [activeSection, setActiveSection] = useState("home")
  const [isScrolled, setIsScrolled] = useState(false)
  const [showBackToTop, setShowBackToTop] = useState(false)
  const [isSearchOpen, setIsSearchOpen] = useState(false)
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        setIsSearchOpen(true)
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [])

  useEffect(() => {
    const handleScroll = () => {
      const scrolled = window.scrollY > 50
      setIsScrolled(scrolled)
      setShowBackToTop(window.scrollY > 500)

      const sections = navItems.map((item) => item.href.substring(1))
      const currentSection = sections.find((section) => {
        const element = document.getElementById(section)
        if (element) {
          const rect = element.getBoundingClientRect()
          return rect.top <= 100 && rect.bottom >= 100
        }
        return false
      })

      if (currentSection) {
        setActiveSection(currentSection)
      }
    }

    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  const handleNavigation = (href: string, isSection: boolean) => {
    if (isSection) {
      // Handle section scrolling on homepage
      if (pathname === "/") {
        const sectionId = href.substring(2) // Remove "/#"
        const element = document.getElementById(sectionId)
        if (element) {
          element.scrollIntoView({ behavior: "smooth" })
        }
      } else {
        // Navigate to homepage first, then scroll to section
        router.push(href)
      }
    } else {
      // Handle page navigation
      router.push(href)
    }
    setIsOpen(false)
  }

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" })
  }

  return (
    <>
      {/* Navigation Bar */}
      <nav
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          isScrolled ? "bg-background/95 backdrop-blur-md border-b border-border/50" : "bg-transparent"
        }`}
      >
        <div className="container mx-auto px-6 lg:px-12 xl:px-16">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <div className="flex items-center">
              <Link
                href="/"
                className="text-xl font-bold text-foreground hover:text-primary transition-colors"
              >
                Edikan Udoibuot
              </Link>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-6">
              <div className="flex items-center space-x-8">
                {navItems.map((item) => (
                  <Link
                    key={item.name}
                    href={item.href}
                    onClick={(e) => {
                      if (item.isSection) {
                        e.preventDefault()
                        handleNavigation(item.href, item.isSection)
                      }
                    }}
                    className={`text-sm font-medium transition-colors hover:text-primary ${
                      (item.isSection && pathname === "/" && activeSection === item.href.substring(2)) ||
                      (!item.isSection && pathname === item.href)
                        ? "text-primary"
                        : "text-muted-foreground"
                    }`}
                  >
                    {item.name}
                  </Link>
                ))}
              </div>
              <div className="border-l border-border h-5" />
              <SearchButton onClick={() => setIsSearchOpen(true)} />
              <div className="border-l border-border h-5" />
              <ThemeToggle />
            </div>

            {/* Mobile Menu Button */}
            <div className="md:hidden">
              <Button variant="ghost" size="sm" onClick={() => setIsOpen(!isOpen)}>
                {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </Button>
            </div>
          </div>

          {/* Mobile Navigation */}
          {isOpen && (
            <div className="md:hidden border-t border-border/50 bg-background/95 backdrop-blur-md">
              <div className="px-2 pt-2 pb-3 space-y-1">
                {navItems.map((item) => (
                  <Link
                    key={item.name}
                    href={item.href}
                    onClick={(e) => {
                      if (item.isSection) {
                        e.preventDefault()
                        handleNavigation(item.href, item.isSection)
                      } else {
                        setIsOpen(false)
                      }
                    }}
                    className={`block px-3 py-2 text-base font-medium transition-colors hover:text-primary w-full text-left ${
                      (item.isSection && pathname === "/" && activeSection === item.href.substring(2)) ||
                      (!item.isSection && pathname === item.href)
                        ? "text-primary"
                        : "text-muted-foreground"
                    }`}
                  >
                    {item.name}
                  </Link>
                ))}
                <div className="px-3 py-2 space-y-2">
                  <SearchButton onClick={() => setIsSearchOpen(true)} />
                  <ThemeToggleWithText />
                </div>
              </div>
            </div>
          )}
        </div>
      </nav>

      {/* Back to Top Button */}
      {showBackToTop && (
        <Button
          onClick={scrollToTop}
          size="sm"
          className="fixed bottom-8 right-8 z-50 rounded-full w-12 h-12 bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg"
          aria-label="Back to top"
        >
          <ArrowUp className="h-5 w-5" />
        </Button>
      )}
      
      {/* Search Dialog */}
      <SearchDialog 
        isOpen={isSearchOpen} 
        onClose={() => setIsSearchOpen(false)} 
      />
    </>
  )
}
