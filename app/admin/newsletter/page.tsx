"use client"

import { useState, useEffect } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { toast } from 'sonner'
import { Save, Mail, Code, AlertCircle } from 'lucide-react'

interface NewsletterSettings {
  embedCode: string
  attributionCode: string
}

export default function NewsletterAdminPage() {
  const [settings, setSettings] = useState<NewsletterSettings>({
    embedCode: '',
    attributionCode: ''
  })
  const [isLoading, setIsLoading] = useState(false)
  const [isSaving, setIsSaving] = useState(false)

  useEffect(() => {
    fetchSettings()
  }, [])

  const fetchSettings = async () => {
    try {
      setIsLoading(true)
      const response = await fetch('/api/admin/newsletter')
      if (response.ok) {
        const data = await response.json()
        if (data.success) {
          setSettings(data.data)
        }
      }
    } catch (error) {
      console.error('Failed to fetch newsletter settings:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSave = async () => {
    try {
      setIsSaving(true)
      
      const response = await fetch('/api/admin/newsletter', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(settings),
      })

      const data = await response.json()

      if (data.success) {
        toast.success('Newsletter settings saved successfully!')
      } else {
        toast.error(data.error || 'Failed to save settings')
      }
    } catch (error) {
      toast.error('Error saving newsletter settings')
    } finally {
      setIsSaving(false)
    }
  }

  const handleInputChange = (field: keyof NewsletterSettings, value: string) => {
    setSettings(prev => ({
      ...prev,
      [field]: value
    }))
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-6 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground mb-2">Newsletter Settings</h1>
        <p className="text-muted-foreground">
          Configure your Beehive newsletter embed code and attribution tracking for the subscription forms.
        </p>
      </div>

      <div className="grid gap-6 max-w-4xl">
        <Card className="p-6">
          <div className="space-y-6">
            <div className="flex items-center gap-2 mb-4">
              <Mail className="h-5 w-5 text-primary" />
              <h2 className="text-xl font-semibold">Beehive Integration</h2>
            </div>

            <div className="grid gap-6">
              {/* Embed Code Section */}
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Code className="h-4 w-4" />
                  <Label htmlFor="embedCode" className="text-sm font-medium">
                    Beehive Embed Code
                  </Label>
                </div>
                <Textarea
                  id="embedCode"
                  placeholder="Paste your Beehive embed code here..."
                  value={settings.embedCode}
                  onChange={(e) => handleInputChange('embedCode', e.target.value)}
                  className="min-h-[120px] font-mono text-sm"
                />
                <p className="text-xs text-muted-foreground">
                  Copy the complete embed code from your Beehive dashboard. This should include both the script tag and iframe.
                </p>
              </div>

              {/* Attribution Code Section */}
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Code className="h-4 w-4" />
                  <Label htmlFor="attributionCode" className="text-sm font-medium">
                    Attribution Tracking Code
                  </Label>
                </div>
                <Textarea
                  id="attributionCode"
                  placeholder="Paste your Beehive attribution tracking code here..."
                  value={settings.attributionCode}
                  onChange={(e) => handleInputChange('attributionCode', e.target.value)}
                  className="min-h-[80px] font-mono text-sm"
                />
                <p className="text-xs text-muted-foreground">
                  Copy the attribution tracking script from your Beehive dashboard for proper analytics tracking.
                </p>
              </div>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-start gap-2">
                <AlertCircle className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
                <div className="text-sm text-blue-800">
                  <p className="font-medium mb-1">How this works:</p>
                  <ul className="space-y-1 text-xs">
                    <li>• Users click newsletter subscribe buttons across your site</li>
                    <li>• A popup displays using your Beehive embed code from above</li>
                    <li>• Users complete subscription directly in Beehive's native form</li>
                    <li>• Attribution tracking automatically records subscription sources</li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="flex justify-end">
              <Button 
                onClick={handleSave} 
                disabled={isSaving}
                className="min-w-[120px]"
              >
                {isSaving ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    Save Settings
                  </>
                )}
              </Button>
            </div>
          </div>
        </Card>

        {/* Preview Section */}
        {settings.embedCode && (
          <Card className="p-6">
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Preview</h3>
              <div className="bg-muted/30 rounded-lg p-4">
                <p className="text-sm text-muted-foreground mb-2">
                  This is how your newsletter form will appear in popups:
                </p>
                <div className="bg-white rounded-lg border p-4 max-w-md">
                  <div 
                    dangerouslySetInnerHTML={{ 
                      __html: settings.embedCode + (settings.attributionCode || '') 
                    }} 
                  />
                </div>
              </div>
            </div>
          </Card>
        )}
      </div>
    </div>
  )
}