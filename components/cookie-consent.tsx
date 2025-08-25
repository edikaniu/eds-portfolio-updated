"use client"

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { 
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger
} from '@/components/ui/alert-dialog'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { Cookie, Settings, Shield, BarChart3, Target, X } from 'lucide-react'
import { AnalyticsConsent } from '@/lib/analytics'

interface CookieConsentProps {
  position?: 'bottom' | 'top'
  theme?: 'light' | 'dark'
  showDetailsDialog?: boolean
}

export function CookieConsent({ 
  position = 'bottom', 
  theme = 'dark',
  showDetailsDialog = true 
}: CookieConsentProps) {
  const [isVisible, setIsVisible] = useState(false)
  const [showDetails, setShowDetails] = useState(false)
  const [preferences, setPreferences] = useState({
    necessary: true, // Always required
    analytics: false,
    marketing: false,
    functional: false,
  })
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    
    // Check if user has already made a decision
    const shouldShow = AnalyticsConsent.shouldShowConsentBanner()
    setIsVisible(shouldShow)
    
    // Set initial preferences based on existing consent
    if (AnalyticsConsent.hasConsent()) {
      setPreferences(prev => ({
        ...prev,
        analytics: true,
        functional: true,
      }))
    }
  }, [])

  const handleAcceptAll = () => {
    setPreferences({
      necessary: true,
      analytics: true,
      marketing: true,
      functional: true,
    })
    
    AnalyticsConsent.grantConsent()
    setIsVisible(false)
  }

  const handleAcceptSelected = () => {
    if (preferences.analytics) {
      AnalyticsConsent.grantConsent()
    } else {
      AnalyticsConsent.revokeConsent()
    }
    
    setIsVisible(false)
  }

  const handleDeclineAll = () => {
    setPreferences({
      necessary: true,
      analytics: false,
      marketing: false,
      functional: false,
    })
    
    AnalyticsConsent.revokeConsent()
    setIsVisible(false)
  }

  if (!mounted || !isVisible) {
    return null
  }

  const cookieCategories = [
    {
      key: 'necessary',
      title: 'Necessary Cookies',
      description: 'Essential for the website to function properly. These cookies enable core functionality such as security, network management, and accessibility.',
      icon: <Shield className="h-4 w-4" />,
      required: true,
      examples: ['Session management', 'Security tokens', 'Basic functionality'],
    },
    {
      key: 'analytics',
      title: 'Analytics Cookies',
      description: 'Help us understand how visitors interact with our website by collecting and reporting information anonymously.',
      icon: <BarChart3 className="h-4 w-4" />,
      required: false,
      examples: ['Google Analytics', 'Page views', 'User behavior patterns'],
    },
    {
      key: 'functional',
      title: 'Functional Cookies',
      description: 'Enable enhanced functionality and personalization, such as remembering your preferences and settings.',
      icon: <Settings className="h-4 w-4" />,
      required: false,
      examples: ['Theme preferences', 'Language settings', 'User preferences'],
    },
    {
      key: 'marketing',
      title: 'Marketing Cookies',
      description: 'Used to track visitors across websites to display relevant and engaging advertisements.',
      icon: <Target className="h-4 w-4" />,
      required: false,
      examples: ['Ad targeting', 'Social media integration', 'Marketing campaigns'],
    },
  ]

  return (
    <>
      {/* Main consent banner */}
      <Card 
        className={`fixed ${position === 'bottom' ? 'bottom-4' : 'top-4'} left-4 right-4 z-50 max-w-4xl mx-auto shadow-2xl border-2 ${
          theme === 'dark' 
            ? 'bg-gray-900 border-gray-700 text-white' 
            : 'bg-white border-gray-200 text-gray-900'
        }`}
      >
        <div className="p-6">
          <div className="flex items-start gap-4">
            <div className="flex-shrink-0 p-2 bg-blue-100 rounded-lg">
              <Cookie className="h-6 w-6 text-blue-600" />
            </div>
            
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-2">
                <h3 className="text-lg font-semibold">Cookie Preferences</h3>
                <Badge variant="outline" className="text-xs">
                  GDPR Compliant
                </Badge>
              </div>
              
              <p className={`text-sm mb-4 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
                We use cookies to enhance your browsing experience, analyze site traffic, and personalize content. 
                By clicking "Accept All", you consent to our use of cookies as described in our{' '}
                <a 
                  href="/privacy-policy" 
                  className="text-blue-600 hover:underline"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Privacy Policy
                </a>.
              </p>

              <div className="flex flex-wrap gap-3">
                <Button 
                  onClick={handleAcceptAll}
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                >
                  Accept All
                </Button>
                
                <Button 
                  variant="outline" 
                  onClick={handleDeclineAll}
                  className={theme === 'dark' ? 'border-gray-600 hover:bg-gray-800' : ''}
                >
                  Decline All
                </Button>
                
                {showDetailsDialog && (
                  <AlertDialog open={showDetails} onOpenChange={setShowDetails}>
                    <AlertDialogTrigger asChild>
                      <Button 
                        variant="ghost" 
                        className={theme === 'dark' ? 'hover:bg-gray-800' : ''}
                      >
                        <Settings className="h-4 w-4 mr-2" />
                        Customize
                      </Button>
                    </AlertDialogTrigger>
                    
                    <AlertDialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
                      <AlertDialogHeader>
                        <AlertDialogTitle className="flex items-center gap-2">
                          <Cookie className="h-5 w-5 text-blue-600" />
                          Customize Cookie Preferences
                        </AlertDialogTitle>
                        <AlertDialogDescription>
                          Choose which types of cookies you want to allow. You can change these settings at any time.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      
                      <div className="space-y-6">
                        {cookieCategories.map((category) => (
                          <Card key={category.key} className="p-4">
                            <div className="flex items-start justify-between mb-3">
                              <div className="flex items-center gap-3">
                                <div className="p-2 bg-blue-100 rounded-lg">
                                  {category.icon}
                                </div>
                                <div>
                                  <h4 className="font-semibold flex items-center gap-2">
                                    {category.title}
                                    {category.required && (
                                      <Badge variant="secondary" className="text-xs">
                                        Required
                                      </Badge>
                                    )}
                                  </h4>
                                  <p className="text-sm text-muted-foreground mt-1">
                                    {category.description}
                                  </p>
                                </div>
                              </div>
                              
                              <div className="flex items-center space-x-2">
                                <Switch
                                  id={category.key}
                                  checked={preferences[category.key as keyof typeof preferences]}
                                  onCheckedChange={(checked) => {
                                    if (!category.required) {
                                      setPreferences(prev => ({
                                        ...prev,
                                        [category.key]: checked,
                                      }))
                                    }
                                  }}
                                  disabled={category.required}
                                />
                                <Label htmlFor={category.key} className="text-sm">
                                  {preferences[category.key as keyof typeof preferences] ? 'Enabled' : 'Disabled'}
                                </Label>
                              </div>
                            </div>
                            
                            <div className="ml-14">
                              <p className="text-xs text-muted-foreground mb-2">Examples:</p>
                              <div className="flex flex-wrap gap-1">
                                {category.examples.map((example, index) => (
                                  <Badge key={index} variant="outline" className="text-xs">
                                    {example}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                          </Card>
                        ))}
                      </div>
                      
                      <AlertDialogFooter className="flex gap-3">
                        <Button 
                          variant="outline" 
                          onClick={() => setShowDetails(false)}
                        >
                          Cancel
                        </Button>
                        <Button 
                          onClick={() => {
                            handleAcceptSelected()
                            setShowDetails(false)
                          }}
                          className="bg-blue-600 hover:bg-blue-700 text-white"
                        >
                          Save Preferences
                        </Button>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                )}
              </div>
            </div>
            
            <Button
              variant="ghost"
              size="sm"
              onClick={handleDeclineAll}
              className={`flex-shrink-0 ${theme === 'dark' ? 'hover:bg-gray-800' : ''}`}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </Card>
    </>
  )
}

// Hook for managing cookie consent state
export function useCookieConsent() {
  const [hasConsent, setHasConsent] = useState(false)
  const [shouldShowBanner, setShouldShowBanner] = useState(false)

  useEffect(() => {
    setHasConsent(AnalyticsConsent.hasConsent())
    setShouldShowBanner(AnalyticsConsent.shouldShowConsentBanner())
  }, [])

  const grantConsent = () => {
    AnalyticsConsent.grantConsent()
    setHasConsent(true)
    setShouldShowBanner(false)
  }

  const revokeConsent = () => {
    AnalyticsConsent.revokeConsent()
    setHasConsent(false)
    setShouldShowBanner(false)
  }

  return {
    hasConsent,
    shouldShowBanner,
    grantConsent,
    revokeConsent,
  }
}