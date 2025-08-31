"use client"

import { useEffect, useRef } from 'react'

interface BeehiveEmbedProps {
  className?: string
  width?: string
  height?: string
}

export function BeehiveEmbed({ 
  className = "", 
  width = "100%", 
  height = "504px"
}: BeehiveEmbedProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  
  useEffect(() => {
    // Ensure scripts are loaded first
    const loadScripts = async () => {
      // Load Beehive embed script
      if (!document.querySelector('script[src="https://subscribe-forms.beehiiv.com/embed.js"]')) {
        const script = document.createElement('script')
        script.src = 'https://subscribe-forms.beehiiv.com/embed.js'
        script.async = true
        document.head.appendChild(script)
        
        // Wait for script to load
        await new Promise((resolve) => {
          script.onload = resolve
          script.onerror = resolve // Continue even if script fails
        })
      }

      // Load Beehive attribution tracking
      if (!document.querySelector('script[src="https://subscribe-forms.beehiiv.com/attribution.js"]')) {
        const attributionScript = document.createElement('script')
        attributionScript.src = 'https://subscribe-forms.beehiiv.com/attribution.js'
        attributionScript.async = true
        attributionScript.type = 'text/javascript'
        document.head.appendChild(attributionScript)
      }
    }

    loadScripts()
  }, [])

  // Convert width to pixels if it's a percentage
  const pixelWidth = width === '100%' ? '600px' : width

  return (
    <div className={`beehive-newsletter-container ${className}`} ref={containerRef}>
      <iframe 
        src="https://subscribe-forms.beehiiv.com/d6ed7510-b199-42ed-816a-ef341a71139c"
        className="beehiiv-embed"
        data-test-id="beehiiv-embed"
        frameBorder="0"
        scrolling="no"
        title="Subscribe to Newsletter"
        style={{
          width: width,
          height: height,
          margin: '0',
          borderRadius: '0px 0px 0px 0px',
          backgroundColor: 'transparent',
          boxShadow: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
          maxWidth: '100%',
          border: 'none'
        }}
      />
    </div>
  )
}