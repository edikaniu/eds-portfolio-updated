"use client"

import { Button } from "@/components/ui/button"
import { Share2 } from "lucide-react"

interface BlogPostActionsProps {
  title: string
  excerpt: string
  url?: string
}

interface ShareButtonProps {
  title: string
  excerpt: string
}

interface ShareSectionProps {
  title: string
  excerpt: string
}

export function ShareButton({ title, excerpt }: ShareButtonProps) {
  const handleShare = async () => {
    const currentUrl = typeof window !== 'undefined' ? window.location.href : ''
    
    try {
      if (typeof navigator !== 'undefined' && navigator.share) {
        await navigator.share({
          title,
          text: excerpt,
          url: currentUrl,
        })
      } else {
        // Fallback: copy to clipboard
        if (typeof navigator !== 'undefined' && navigator.clipboard) {
          await navigator.clipboard.writeText(currentUrl)
          alert("Link copied to clipboard!")
        } else {
          // Final fallback: show the URL
          prompt("Copy this link:", currentUrl)
        }
      }
    } catch (error) {
      // If sharing fails, fallback to copying to clipboard
      try {
        if (typeof navigator !== 'undefined' && navigator.clipboard) {
          await navigator.clipboard.writeText(currentUrl)
          alert("Link copied to clipboard!")
        } else {
          // Final fallback: show the URL
          prompt("Copy this link:", currentUrl)
        }
      } catch (clipboardError) {
        // Final fallback: show the URL
        prompt("Copy this link:", currentUrl)
      }
    }
  }

  return (
    <Button variant="outline" size="sm" onClick={handleShare}>
      <Share2 className="h-4 w-4 mr-2" />
      Share
    </Button>
  )
}

export function ShareSection({ title, excerpt }: ShareSectionProps) {
  const handleShare = async () => {
    const currentUrl = typeof window !== 'undefined' ? window.location.href : ''
    
    try {
      if (typeof navigator !== 'undefined' && navigator.share) {
        await navigator.share({
          title,
          text: excerpt,
          url: currentUrl,
        })
      } else {
        // Fallback: copy to clipboard
        if (typeof navigator !== 'undefined' && navigator.clipboard) {
          await navigator.clipboard.writeText(currentUrl)
          alert("Link copied to clipboard!")
        } else {
          // Final fallback: show the URL
          prompt("Copy this link:", currentUrl)
        }
      }
    } catch (error) {
      // If sharing fails, fallback to copying to clipboard
      try {
        if (typeof navigator !== 'undefined' && navigator.clipboard) {
          await navigator.clipboard.writeText(currentUrl)
          alert("Link copied to clipboard!")
        } else {
          // Final fallback: show the URL
          prompt("Copy this link:", currentUrl)
        }
      } catch (clipboardError) {
        // Final fallback: show the URL
        prompt("Copy this link:", currentUrl)
      }
    }
  }

  const handleTwitterShare = () => {
    if (typeof window !== 'undefined') {
      const currentUrl = window.location.href
      const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(title)}&url=${encodeURIComponent(currentUrl)}&via=edikanudoibuot`
      window.open(twitterUrl, "_blank", "noopener,noreferrer")
    }
  }

  const handleLinkedInShare = () => {
    if (typeof window !== 'undefined') {
      const currentUrl = window.location.href
      const linkedinUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(currentUrl)}`
      window.open(linkedinUrl, "_blank", "noopener,noreferrer")
    }
  }

  return (
    <div className="mt-8 pt-8 border-t border-border">
      <div className="flex items-center justify-between">
        <h4 className="font-semibold text-foreground">Share this article</h4>
        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm" onClick={handleShare}>
            <Share2 className="h-4 w-4 mr-2" />
            Share
          </Button>
          <Button variant="outline" size="sm" onClick={handleTwitterShare}>
            Twitter
          </Button>
          <Button variant="outline" size="sm" onClick={handleLinkedInShare}>
            LinkedIn
          </Button>
        </div>
      </div>
    </div>
  )
}

export function BlogPostActions({ title, excerpt }: BlogPostActionsProps) {
  return null // This is now handled by separate components
}