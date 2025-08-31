"use client"

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { BeehiveEmbed } from './beehive-embed'
import { Mail, Users, TrendingUp, X } from 'lucide-react'

interface NewsletterCTAProps {
  variant?: 'inline' | 'card' | 'minimal' | 'sidebar'
  title?: string
  description?: string
  showStats?: boolean
  showBenefits?: boolean
  className?: string
}

export function NewsletterCTA({
  variant = 'card',
  title = "Get Marketing Insights That Scale",
  description = "Join 2,000+ marketers getting weekly case studies, growth tactics, and AI-powered strategies that I don't share publicly.",
  showStats = true,
  showBenefits = true,
  className = ""
}: NewsletterCTAProps) {
  const [showEmbed, setShowEmbed] = useState(false)
  const [isSubscribed, setIsSubscribed] = useState(false)

  const benefits = [
    "Weekly case studies from real campaigns",
    "AI-powered marketing tools & templates", 
    "Growth tactics that scaled 50+ products",
    "Exclusive strategies not shared publicly"
  ]

  const stats = [
    { icon: <Users className="h-4 w-4" />, value: "2,000+", label: "Marketers" },
    { icon: <TrendingUp className="h-4 w-4" />, value: "95%", label: "Open Rate" },
    { icon: <Mail className="h-4 w-4" />, value: "Weekly", label: "Insights" }
  ]

  if (showEmbed) {
    return (
      <div className={`newsletter-embed-container ${className}`}>
        <div className="relative">
          <Button
            variant="ghost"
            size="sm"
            className="absolute -top-2 -right-2 z-10 h-8 w-8 p-0 bg-background shadow-md hover:bg-muted"
            onClick={() => setShowEmbed(false)}
          >
            <X className="h-4 w-4" />
          </Button>
          <BeehiveEmbed 
            className="w-full" 
            width="100%" 
            height="420px"
          />
        </div>
      </div>
    )
  }

  if (variant === 'minimal') {
    return (
      <div className={`text-center py-6 ${className}`}>
        <h3 className="text-lg font-semibold text-foreground mb-2">{title}</h3>
        <p className="text-sm text-muted-foreground mb-4 max-w-md mx-auto">{description}</p>
        <Button onClick={() => setShowEmbed(true)}>
          <Mail className="h-4 w-4 mr-2" />
          Subscribe Free
        </Button>
      </div>
    )
  }

  if (variant === 'inline') {
    return (
      <div className={`bg-gradient-to-r from-primary/5 to-primary/10 rounded-lg p-6 border border-primary/20 ${className}`}>
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="text-center md:text-left">
            <h3 className="text-xl font-bold text-foreground mb-2">{title}</h3>
            <p className="text-muted-foreground">{description}</p>
          </div>
          <div className="flex-shrink-0">
            <Button onClick={() => setShowEmbed(true)} size="lg">
              <Mail className="h-4 w-4 mr-2" />
              Join Newsletter
            </Button>
          </div>
        </div>
        {showStats && (
          <div className="flex flex-wrap justify-center md:justify-start gap-4 mt-4 pt-4 border-t border-primary/20">
            {stats.map((stat, index) => (
              <div key={index} className="flex items-center gap-2 text-sm">
                <span className="text-primary">{stat.icon}</span>
                <span className="font-semibold text-foreground">{stat.value}</span>
                <span className="text-muted-foreground">{stat.label}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    )
  }

  if (variant === 'sidebar') {
    return (
      <Card className={`p-6 ${className}`}>
        <div className="text-center">
          <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <Mail className="h-6 w-6 text-primary" />
          </div>
          <h3 className="text-lg font-semibold text-foreground mb-2">{title}</h3>
          <p className="text-sm text-muted-foreground mb-4">{description}</p>
          
          {showStats && (
            <div className="grid grid-cols-3 gap-2 mb-4">
              {stats.map((stat, index) => (
                <div key={index} className="text-center">
                  <div className="text-lg font-bold text-primary">{stat.value}</div>
                  <div className="text-xs text-muted-foreground">{stat.label}</div>
                </div>
              ))}
            </div>
          )}

          <Button onClick={() => setShowEmbed(true)} className="w-full">
            Subscribe Free
          </Button>
        </div>
      </Card>
    )
  }

  // Default 'card' variant
  return (
    <Card className={`p-8 ${className}`}>
      <div className="text-center">
        <div className="w-16 h-16 bg-gradient-to-r from-primary/20 to-primary/30 rounded-full flex items-center justify-center mx-auto mb-6">
          <Mail className="h-8 w-8 text-primary" />
        </div>
        
        <h2 className="text-2xl font-bold text-foreground mb-4">{title}</h2>
        <p className="text-muted-foreground mb-6 max-w-2xl mx-auto leading-relaxed">{description}</p>

        {showStats && (
          <div className="flex flex-wrap justify-center gap-6 mb-6">
            {stats.map((stat, index) => (
              <div key={index} className="flex items-center gap-2 bg-muted/50 px-4 py-2 rounded-lg">
                <span className="text-primary">{stat.icon}</span>
                <span className="font-semibold text-foreground">{stat.value}</span>
                <span className="text-muted-foreground text-sm">{stat.label}</span>
              </div>
            ))}
          </div>
        )}

        {showBenefits && (
          <div className="grid md:grid-cols-2 gap-3 mb-8 text-left">
            {benefits.map((benefit, index) => (
              <div key={index} className="flex items-start gap-3">
                <div className="w-5 h-5 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <div className="w-2 h-2 bg-green-500 rounded-full" />
                </div>
                <span className="text-sm text-muted-foreground">{benefit}</span>
              </div>
            ))}
          </div>
        )}

        <Button onClick={() => setShowEmbed(true)} size="lg" className="px-8">
          <Mail className="h-4 w-4 mr-2" />
          Join 2,000+ Marketers
        </Button>
        
        <p className="text-xs text-muted-foreground mt-4">
          Free newsletter • Unsubscribe anytime • No spam, ever
        </p>
      </div>
    </Card>
  )
}