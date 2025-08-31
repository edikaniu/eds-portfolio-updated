"use client"

import { useEffect } from 'react'

interface BeehiveEmbedProps {
  className?: string
  width?: string
  height?: string
  customStyle?: string
}

export function BeehiveEmbed({ 
  className = "", 
  width = "100%", 
  height = "504px",
  customStyle = ""
}: BeehiveEmbedProps) {
  
  useEffect(() => {
    // Load Beehive embed script if not already loaded
    if (!document.querySelector('script[src="https://subscribe-forms.beehiiv.com/embed.js"]')) {
      const script = document.createElement('script')
      script.src = 'https://subscribe-forms.beehiiv.com/embed.js'
      script.async = true
      document.head.appendChild(script)
    }

    // Load Beehive attribution tracking if not already loaded
    if (!document.querySelector('script[src="https://subscribe-forms.beehiiv.com/attribution.js"]')) {
      const attributionScript = document.createElement('script')
      attributionScript.src = 'https://subscribe-forms.beehiiv.com/attribution.js'
      attributionScript.async = true
      attributionScript.type = 'text/javascript'
      document.head.appendChild(attributionScript)
    }
  }, [])

  const iframeStyle = {
    width: width,
    height: height,
    margin: '0',
    borderRadius: '0px 0px 0px 0px',
    backgroundColor: 'transparent',
    boxShadow: '0 0 #0000',
    maxWidth: '100%',
    border: 'none',
    ...customStyle && JSON.parse(`{${customStyle}}`)
  }

  return (
    <div className={`beehive-newsletter-container ${className}`}>
      <iframe 
        src="https://embeds.beehiiv.com/05a6be12-18c2-4c11-86a7-71992ad08d73"
        className="beehiiv-embed"
        data-test-id="beehiiv-embed"
        style={iframeStyle}
        frameBorder="0"
        scrolling="no"
        title="Subscribe to Newsletter"
      />
    </div>
  )
}