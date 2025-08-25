"use client"

import { useState, useEffect } from "react"
import { Mail, Linkedin } from "lucide-react"
import { EmbeddedChat } from "@/components/embedded-chat"
import { logger } from "@/lib/logger"

interface HeroData {
  name: string
  roles: string[]
  tagline: string
  profileImage: string
  email: string
  linkedin: string
  twitter: string
}

const defaultHeroData: HeroData = {
  name: "Edikan Udoibuot",
  roles: [
    "Marketing & Growth Leader",
    "AI-Powered Marketing Strategist",
    "Product Growth Expert",
    "Vibe Marketing Practitioner",
    "Full-stack Marketer",
  ],
  tagline: "7+ years scaling products from hundreds to thousands of users through data-driven growth strategies and AI-powered marketing",
  profileImage: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Ed%27s%20Passport.png-x6NE3irYLKlWGZnSaeBC1W5rrT8PmW.jpeg",
  email: "edikanudoibuot@gmail.com",
  linkedin: "https://www.linkedin.com/in/edikanudoibuot/",
  twitter: "https://x.com/edikanudoibuot"
}

export function HeroSection() {
  const [heroData, setHeroData] = useState<HeroData>(defaultHeroData)
  const [currentRoleIndex, setCurrentRoleIndex] = useState(0)
  const [displayedText, setDisplayedText] = useState("")
  const [isTyping, setIsTyping] = useState(true)
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    setIsVisible(true)
    loadHeroData()
  }, [])

  const loadHeroData = async () => {
    try {
      const response = await fetch('/api/frontend-content?section=hero')
      const data = await response.json()
      
      if (data.success && data.data.hero?.content) {
        setHeroData(prevData => ({ ...prevData, ...data.data.hero.content }))
      }
    } catch (error) {
      logger.error('Failed to load hero data', error, { section: 'hero' })
      // Continue with default data
    }
  }

  // Typewriter effect for roles
  useEffect(() => {
    if (heroData.roles.length === 0) return
    
    const currentRole = heroData.roles[currentRoleIndex]
    let currentIndex = 0
    setIsTyping(true)
    setDisplayedText("")

    const typeInterval = setInterval(() => {
      if (currentIndex <= currentRole.length) {
        setDisplayedText(currentRole.slice(0, currentIndex))
        currentIndex++
      } else {
        clearInterval(typeInterval)
        setIsTyping(false)

        // Wait before starting next role
        setTimeout(() => {
          setCurrentRoleIndex((prev) => (prev + 1) % heroData.roles.length)
        }, 2000)
      }
    }, 100)

    return () => clearInterval(typeInterval)
  }, [currentRoleIndex, heroData.roles])

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId)
    if (element) {
      element.scrollIntoView({ behavior: "smooth" })
    }
  }

  return (
    <>
      <section className="min-h-screen flex items-center justify-center relative overflow-hidden pt-16">
        {/* Background gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-background via-background to-card opacity-90" />

        {/* Animated background elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-primary/10 rounded-full blur-3xl animate-pulse" />
          <div
            className="absolute -bottom-40 -left-40 w-80 h-80 bg-accent/10 rounded-full blur-3xl animate-pulse"
            style={{ animationDelay: "1s" }}
          />
        </div>

        <div className="container mx-auto px-6 lg:px-12 xl:px-16 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            {/* Profile Image */}
            <div className={`mb-6 ${isVisible ? "animate-fade-in-up" : "opacity-0"}`}>
              <div className="w-32 h-32 mx-auto rounded-full bg-gradient-to-r from-primary to-accent p-1">
                <div className="w-full h-full rounded-full bg-card flex items-center justify-center">
                  <img
                    src={heroData.profileImage}
                    alt={heroData.name}
                    className="w-28 h-28 rounded-full object-cover"
                  />
                </div>
              </div>
            </div>

            {/* Greeting */}
            <div
              className={`mb-4 ${isVisible ? "animate-slide-in-left" : "opacity-0"}`}
              style={{ animationDelay: "0.2s" }}
            >
              <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-foreground mb-4">Hi, I'm {heroData.name.split(' ')[0]} 👋</h1>
            </div>

            {/* Animated Role Title with Typewriter Effect */}
            <div
              className={`mb-6 ${isVisible ? "animate-fade-in-up" : "opacity-0"}`}
              style={{ animationDelay: "0.4s" }}
            >
              <div className="h-16 flex items-center justify-center">
                <h2 className="text-xl md:text-2xl lg:text-3xl font-semibold text-primary">
                  {displayedText}
                  {isTyping && <span className="animate-pulse">|</span>}
                </h2>
              </div>
            </div>

            {/* Tagline */}
            <div
              className={`mb-8 ${isVisible ? "animate-fade-in-up" : "opacity-0"}`}
              style={{ animationDelay: "0.6s" }}
            >
              <p className="text-base md:text-lg lg:text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
                {heroData.tagline}
              </p>
            </div>

            {/* Embedded Chat Interface */}
            <div
              className={`mb-12 ${isVisible ? "animate-fade-in-up" : "opacity-0"}`}
              style={{ animationDelay: "0.8s" }}
            >
              <EmbeddedChat />
            </div>

            {/* Contact Links - Added X (Twitter) icon */}
            <div
              className={`mt-12 ${isVisible ? "animate-fade-in-up" : "opacity-0"}`}
              style={{ animationDelay: "1.0s" }}
            >
              <div className="flex justify-center gap-6">
                <a
                  href={`mailto:${heroData.email}`}
                  className="text-muted-foreground hover:text-primary transition-colors"
                  aria-label="Email"
                >
                  <Mail className="h-6 w-6" />
                </a>
                <a
                  href={heroData.linkedin}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-muted-foreground hover:text-primary transition-colors"
                  aria-label="LinkedIn"
                >
                  <Linkedin className="h-6 w-6" />
                </a>
                <a
                  href={heroData.twitter}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-muted-foreground hover:text-primary transition-colors"
                  aria-label="X (Twitter)"
                >
                  <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                  </svg>
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  )
}
