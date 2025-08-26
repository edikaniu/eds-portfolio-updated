"use client"

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { X, Download, Smartphone, Monitor } from 'lucide-react'
import { logger } from '@/lib/logger'

interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[]
  readonly userChoice: Promise<{
    outcome: 'accepted' | 'dismissed'
    platform: string
  }>
  prompt(): Promise<void>
}

declare global {
  interface WindowEventMap {
    beforeinstallprompt: BeforeInstallPromptEvent
  }
}

export function PWAInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null)
  const [showPrompt, setShowPrompt] = useState(false)
  const [isInstalled, setIsInstalled] = useState(false)
  const [isStandalone, setIsStandalone] = useState(false)

  useEffect(() => {
    // Check if app is running in standalone mode
    setIsStandalone(window.matchMedia('(display-mode: standalone)').matches)
    
    // Check if app is already installed
    setIsInstalled('serviceWorker' in navigator && window.matchMedia('(display-mode: standalone)').matches)

    const handleBeforeInstallPrompt = (e: BeforeInstallPromptEvent) => {
      e.preventDefault()
      setDeferredPrompt(e)
      
      // Show install prompt after a delay (only if not already installed)
      if (!isInstalled && !isStandalone) {
        setTimeout(() => setShowPrompt(true), 3000)
      }
    }

    const handleAppInstalled = () => {
      setIsInstalled(true)
      setShowPrompt(false)
      setDeferredPrompt(null)
      logger.info('PWA installed successfully')
    }

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
    window.addEventListener('appinstalled', handleAppInstalled)

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
      window.removeEventListener('appinstalled', handleAppInstalled)
    }
  }, [isInstalled, isStandalone])

  useEffect(() => {
    // Register service worker
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js')
        .then((registration) => {
          logger.info('Service Worker registered successfully', {
            scope: registration.scope
          })
        })
        .catch((error) => {
          logger.error('Service Worker registration failed', error)
        })
    }
  }, [])

  const handleInstallClick = async () => {
    if (!deferredPrompt) return

    try {
      await deferredPrompt.prompt()
      const { outcome } = await deferredPrompt.userChoice
      
      logger.info('PWA install prompt result', { outcome })
      
      if (outcome === 'accepted') {
        setShowPrompt(false)
      }
      
      setDeferredPrompt(null)
    } catch (error) {
      logger.error('PWA install prompt failed', error)
    }
  }

  const handleDismiss = () => {
    setShowPrompt(false)
    
    // Don't show again for this session
    sessionStorage.setItem('pwa-prompt-dismissed', 'true')
  }

  // Don't show if already installed, in standalone mode, or dismissed
  if (
    isInstalled || 
    isStandalone || 
    !showPrompt || 
    !deferredPrompt ||
    sessionStorage.getItem('pwa-prompt-dismissed') === 'true'
  ) {
    return null
  }

  return (
    <div className="fixed bottom-4 left-4 right-4 z-50 max-w-sm mx-auto">
      <div className="bg-background border border-border rounded-lg shadow-lg p-4">
        <div className="flex items-start gap-3">
          <div className="bg-primary/10 p-2 rounded-lg flex-shrink-0">
            <Download className="h-5 w-5 text-primary" />
          </div>
          
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-foreground text-sm mb-1">
              Install Portfolio App
            </h3>
            <p className="text-xs text-muted-foreground mb-3">
              Add to your home screen for quick access and offline viewing
            </p>
            
            <div className="flex items-center gap-2">
              <Button
                size="sm"
                onClick={handleInstallClick}
                className="h-8 px-3 text-xs"
              >
                <Download className="h-3 w-3 mr-1" />
                Install
              </Button>
              
              <Button
                variant="ghost"
                size="sm"
                onClick={handleDismiss}
                className="h-8 px-2 text-xs text-muted-foreground"
              >
                Later
              </Button>
            </div>
          </div>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={handleDismiss}
            className="h-6 w-6 p-0 flex-shrink-0"
          >
            <X className="h-3 w-3" />
          </Button>
        </div>
      </div>
    </div>
  )
}

// Installation instructions component for browsers that don't support the install prompt
export function PWAInstructions() {
  const [showInstructions, setShowInstructions] = useState(false)
  const [platform, setPlatform] = useState<'ios' | 'android' | 'desktop' | 'unknown'>('unknown')

  useEffect(() => {
    const userAgent = navigator.userAgent.toLowerCase()
    
    if (/iphone|ipad|ipod/.test(userAgent)) {
      setPlatform('ios')
    } else if (/android/.test(userAgent)) {
      setPlatform('android')
    } else if (/chrome|firefox|safari|edge/.test(userAgent)) {
      setPlatform('desktop')
    }
  }, [])

  if (!showInstructions) {
    return (
      <Button
        variant="outline"
        size="sm"
        onClick={() => setShowInstructions(true)}
        className="gap-2"
      >
        <Download className="h-4 w-4" />
        Install App
      </Button>
    )
  }

  const instructions = {
    ios: {
      icon: <Smartphone className="h-5 w-5" />,
      steps: [
        'Tap the Share button in Safari',
        'Scroll down and tap "Add to Home Screen"',
        'Tap "Add" to install the app'
      ]
    },
    android: {
      icon: <Smartphone className="h-5 w-5" />,
      steps: [
        'Tap the menu button (⋮) in Chrome',
        'Select "Add to Home screen"',
        'Tap "Add" to install the app'
      ]
    },
    desktop: {
      icon: <Monitor className="h-5 w-5" />,
      steps: [
        'Look for the install icon in your browser\'s address bar',
        'Click the install button',
        'Follow the prompts to add to your applications'
      ]
    }
  }

  const currentInstructions = instructions[platform] || instructions.desktop

  return (
    <div className="bg-muted/50 border border-border rounded-lg p-4 max-w-sm">
      <div className="flex items-center gap-2 mb-3">
        {currentInstructions.icon}
        <h3 className="font-semibold text-sm">Install as App</h3>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setShowInstructions(false)}
          className="ml-auto h-6 w-6 p-0"
        >
          <X className="h-3 w-3" />
        </Button>
      </div>
      
      <ol className="text-xs text-muted-foreground space-y-1">
        {currentInstructions.steps.map((step, index) => (
          <li key={index} className="flex gap-2">
            <span className="bg-primary/10 text-primary rounded-full w-4 h-4 flex items-center justify-center text-[10px] font-bold flex-shrink-0 mt-0.5">
              {index + 1}
            </span>
            {step}
          </li>
        ))}
      </ol>
    </div>
  )
}