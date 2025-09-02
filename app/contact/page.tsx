"use client"

import { useState, useEffect } from 'react'
import { ContactSection } from "@/components/contact-section"
import { Navigation } from "@/components/navigation"
import { Footer } from "@/components/footer"

interface ContactContent {
  heroTitle: string
  heroSubtitle: string
  heroDescription: string
  email: string
  phone: string
  location: string
  linkedinUrl: string
  twitterUrl: string
  whyWorkTitle: string
  whyWorkDescription: string
  benefits: Array<{
    icon: string
    text: string
  }>
  responseTime: string
  yearsExperience: string
  projectsDelivered: string
}

export default function ContactPage() {
  const [content, setContent] = useState<ContactContent | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetchContent()
  }, [])

  const fetchContent = async () => {
    try {
      const response = await fetch('/api/contact/content')
      if (response.ok) {
        const data = await response.json()
        if (data.success) {
          setContent(data.data)
        }
      }
    } catch (error) {
      console.error('Failed to fetch contact content:', error)
    } finally {
      setIsLoading(false)
    }
  }

  if (isLoading) {
    return (
      <>
        <Navigation />
        <main className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading contact page...</p>
          </div>
        </main>
        <Footer />
      </>
    )
  }

  // Use content or fallback to defaults
  const displayContent = content || {
    heroTitle: "Let's Create Something Extraordinary",
    heroSubtitle: "Available for New Projects", 
    heroDescription: "Ready to transform your marketing strategy and accelerate growth? Let's discuss how we can scale your business with innovative, data-driven solutions.",
    email: "edikanudoibuot@gmail.com",
    phone: "",
    location: "Nigeria",
    linkedinUrl: "https://www.linkedin.com/in/edikanudoibuot/",
    twitterUrl: "https://x.com/edikanudoibuot",
    whyWorkTitle: "Why Work With Me?",
    whyWorkDescription: "Here's what sets me apart and makes our collaboration successful",
    benefits: [
      { icon: "Users", text: "7+ years of proven growth marketing experience" },
      { icon: "Zap", text: "AI-powered strategies for maximum efficiency" },
      { icon: "Target", text: "Data-driven approach with measurable results" },
      { icon: "CheckCircle", text: "Cross-functional leadership and collaboration" },
    ],
    responseTime: "24h",
    yearsExperience: "7+",
    projectsDelivered: "50+"
  }

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
                {displayContent.heroSubtitle}
              </div>
              
              {/* Main Heading */}
              <h1 className="text-5xl md:text-7xl font-bold text-foreground mb-8 bg-gradient-to-r from-foreground via-primary to-foreground bg-clip-text text-transparent leading-tight">
                {displayContent.heroTitle}
              </h1>
              
              {/* Description */}
              <p className="text-xl md:text-2xl text-muted-foreground max-w-4xl mx-auto leading-relaxed mb-8">
                {displayContent.heroDescription}
              </p>
              
              {/* Quick Stats */}
              <div className="flex flex-wrap justify-center gap-8 text-center">
                <div className="flex flex-col items-center">
                  <div className="text-3xl font-bold text-primary mb-1">{displayContent.responseTime}</div>
                  <div className="text-sm text-muted-foreground">Response Time</div>
                </div>
                <div className="flex flex-col items-center">
                  <div className="text-3xl font-bold text-primary mb-1">{displayContent.yearsExperience}</div>
                  <div className="text-sm text-muted-foreground">Years Experience</div>
                </div>
                <div className="flex flex-col items-center">
                  <div className="text-3xl font-bold text-primary mb-1">{displayContent.projectsDelivered}</div>
                  <div className="text-sm text-muted-foreground">Projects Delivered</div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Contact Section */}
        <ContactSection dynamicContent={{
          email: displayContent.email,
          phone: displayContent.phone,
          location: displayContent.location,
          linkedinUrl: displayContent.linkedinUrl,
          twitterUrl: displayContent.twitterUrl,
          whyWorkTitle: displayContent.whyWorkTitle,
          whyWorkDescription: displayContent.whyWorkDescription,
          benefits: displayContent.benefits
        }} />
      </main>
      <Footer />
    </>
  )
}