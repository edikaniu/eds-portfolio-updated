"use client"

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Mail, CheckCircle, Loader2 } from 'lucide-react'

interface BeehiveEmbedProps {
  className?: string
  width?: string
  height?: string
}

export function BeehiveEmbed({ 
  className = "", 
  width = "100%", 
  height = "auto"
}: BeehiveEmbedProps) {
  const [email, setEmail] = useState('')
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const [message, setMessage] = useState('')
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!email || !email.includes('@')) {
      setStatus('error')
      setMessage('Please enter a valid email address')
      return
    }

    setStatus('loading')
    
    try {
      // Open Beehive subscription form in new window/tab with email pre-filled
      const beehiveUrl = `https://subscribe-forms.beehiiv.com/d6ed7510-b199-42ed-816a-ef341a71139c?email=${encodeURIComponent(email)}`
      window.open(beehiveUrl, '_blank', 'width=600,height=700,scrollbars=yes,resizable=yes')
      
      // Show success message
      setTimeout(() => {
        setStatus('success')
        setMessage('A subscription window has opened. Please complete your subscription there and check your email for confirmation.')
        setEmail('')
      }, 500)
      
    } catch (error) {
      setStatus('error')
      setMessage('Something went wrong. Please try again.')
    }
  }

  if (status === 'success') {
    return (
      <div className={`bg-green-50 border border-green-200 rounded-lg p-6 text-center ${className}`}>
        <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-green-800 mb-2">Almost there!</h3>
        <p className="text-green-700">{message}</p>
        <Button
          onClick={() => setStatus('idle')}
          variant="outline"
          className="mt-4"
        >
          Subscribe Another Email
        </Button>
      </div>
    )
  }

  return (
    <div className={`bg-white border rounded-lg p-6 ${className}`} style={{ width }}>
      <div className="text-center mb-6">
        <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
          <Mail className="h-6 w-6 text-primary" />
        </div>
        <h3 className="text-xl font-bold text-foreground mb-2">
          Join the Newsletter
        </h3>
        <p className="text-muted-foreground text-sm">
          Get weekly marketing insights, case studies, and growth tactics delivered to your inbox.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <Input
            type="email"
            placeholder="Enter your email address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full"
            disabled={status === 'loading'}
            required
          />
        </div>
        
        {status === 'error' && (
          <p className="text-red-600 text-sm">{message}</p>
        )}
        
        <Button
          type="submit"
          className="w-full"
          disabled={status === 'loading'}
        >
          {status === 'loading' ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Subscribing...
            </>
          ) : (
            <>
              <Mail className="h-4 w-4 mr-2" />
              Subscribe Free
            </>
          )}
        </Button>
      </form>
      
      <p className="text-xs text-muted-foreground text-center mt-4">
        Free newsletter • Unsubscribe anytime • No spam, ever
      </p>
      
      {/* Attribution tracking */}
      <script 
        type="text/javascript" 
        async 
        src="https://subscribe-forms.beehiiv.com/attribution.js"
      />
    </div>
  )
}