"use client"

import { useState, useEffect } from 'react'
import { AdminLayout } from '@/components/admin/admin-layout'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { toast } from 'sonner'
import { Save, Mail, Code, AlertCircle, CheckCircle, Power } from 'lucide-react'

interface NewsletterSettings {
  embedCode: string
  attributionCode: string
  isEnabled: boolean
}

export default function NewsletterAdminPage() {
  const [settings, setSettings] = useState<NewsletterSettings>({
    embedCode: '',
    attributionCode: '',
    isEnabled: false
  })
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)

  useEffect(() => {
    fetchSettings()
  }, [])

  const fetchSettings = async () => {
    try {
      console.log('Fetching newsletter settings...')
      const response = await fetch('/api/admin/newsletter', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include' // Include cookies for authentication
      })
      
      console.log('Fetch response status:', response.status)
      console.log('Fetch response headers:', Object.fromEntries(response.headers.entries()))
      
      if (response.ok) {
        const data = await response.json()
        console.log('Fetch response data:', data)
        if (data.success) {
          setSettings(data.data)
          console.log('Settings loaded successfully:', data.data)
        } else {
          console.error('API returned error:', data.error)
          toast.error(data.error || 'Failed to load newsletter settings')
        }
      } else {
        const errorText = await response.text()
        console.error('Fetch failed with status:', response.status, 'Error:', errorText)
        toast.error(`Failed to load settings: HTTP ${response.status}`)
      }
    } catch (error) {
      console.error('Failed to fetch newsletter settings:', error)
      toast.error(`Network error: ${error instanceof Error ? error.message : 'Unknown error'}`)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSave = async () => {
    if (settings.isEnabled && !settings.embedCode.trim()) {
      toast.error('Beehiiv embed code is required when newsletter is enabled')
      return
    }

    try {
      setIsSaving(true)
      
      console.log('Sending save request with data:', {
        hasEmbedCode: !!settings.embedCode,
        hasAttributionCode: !!settings.attributionCode
      })
      
      const response = await fetch('/api/admin/newsletter', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include', // Include cookies for authentication
        body: JSON.stringify(settings),
      })

      console.log('Response status:', response.status)
      console.log('Response headers:', Object.fromEntries(response.headers.entries()))

      if (!response.ok) {
        const errorText = await response.text()
        console.error('Response error:', errorText)
        toast.error(`HTTP ${response.status}: ${errorText}`)
        return
      }

      const data = await response.json()
      console.log('Response data:', data)

      if (data.success) {
        toast.success('Newsletter settings saved successfully!')
      } else {
        console.error('API returned error:', data.error)
        toast.error(data.error || 'Failed to save settings')
      }
    } catch (error) {
      console.error('Save error:', error)
      toast.error(`Network error: ${error instanceof Error ? error.message : 'Unknown error'}`)
    } finally {
      setIsSaving(false)
    }
  }

  const handleInputChange = (field: keyof NewsletterSettings, value: string | boolean) => {
    setSettings(prev => ({
      ...prev,
      [field]: value
    }))
  }

  return (
    <AdminLayout title="Newsletter Settings">
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Newsletter Settings</h1>
          <p className="mt-2 text-gray-600">
            Configure your Beehiiv newsletter embed code and attribution tracking for subscription forms.
          </p>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <span className="ml-2 text-gray-600">Loading settings...</span>
          </div>
        ) : (
          <div className="grid gap-6">
            {/* Newsletter Toggle Card */}
            <Card className="shadow-sm border border-gray-200">
              <CardHeader className="border-b border-gray-100 bg-gray-50">
                <div className="flex items-center space-x-2">
                  <Power className="h-5 w-5 text-blue-600" />
                  <CardTitle className="text-lg text-gray-900">Newsletter Control</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <Label htmlFor="newsletter-toggle" className="text-sm font-semibold text-gray-900">
                      Enable Newsletter Popups
                    </Label>
                    <p className="text-xs text-gray-500">
                      Toggle this to enable/disable all newsletter subscription popups across your site
                    </p>
                  </div>
                  <Switch
                    id="newsletter-toggle"
                    checked={settings.isEnabled}
                    onCheckedChange={(checked) => handleInputChange('isEnabled', checked)}
                  />
                </div>
                {!settings.isEnabled && (
                  <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                    <p className="text-sm text-red-800">
                      ⚠️ Newsletter popups are currently disabled across your entire site
                    </p>
                  </div>
                )}
                {settings.isEnabled && (
                  <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
                    <p className="text-sm text-green-800">
                      ✅ Newsletter popups are enabled and will show across your site
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Main Configuration Card */}
            <Card className="shadow-sm border border-gray-200">
              <CardHeader className="border-b border-gray-100 bg-gray-50">
                <div className="flex items-center space-x-2">
                  <Mail className="h-5 w-5 text-blue-600" />
                  <CardTitle className="text-lg text-gray-900">Beehiiv Integration</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="p-6">
                <div className="space-y-6">
                  {/* Embed Code Section */}
                  <div className="space-y-3">
                    <Label htmlFor="embedCode" className="text-sm font-semibold text-gray-900 flex items-center gap-2">
                      <Code className="h-4 w-4 text-gray-500" />
                      Beehiiv Embed Code
                    </Label>
                    <Textarea
                      id="embedCode"
                      placeholder="Paste your Beehiiv embed code here..."
                      value={settings.embedCode}
                      onChange={(e) => handleInputChange('embedCode', e.target.value)}
                      className="min-h-[140px] font-mono text-sm border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                    />
                    <p className="text-xs text-gray-500">
                      Copy the complete embed code from your Beehiiv dashboard. This should include both the script tag and iframe.
                    </p>
                  </div>

                  {/* Attribution Code Section */}
                  <div className="space-y-3">
                    <Label htmlFor="attributionCode" className="text-sm font-semibold text-gray-900 flex items-center gap-2">
                      <Code className="h-4 w-4 text-gray-500" />
                      Attribution Tracking Code
                    </Label>
                    <Textarea
                      id="attributionCode"
                      placeholder="Paste your Beehiiv attribution tracking code here..."
                      value={settings.attributionCode}
                      onChange={(e) => handleInputChange('attributionCode', e.target.value)}
                      className="min-h-[100px] font-mono text-sm border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                    />
                    <p className="text-xs text-gray-500">
                      Copy the attribution tracking script from your Beehiiv dashboard for proper analytics tracking.
                    </p>
                  </div>

                  {/* Info Box */}
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <div className="flex items-start gap-3">
                      <AlertCircle className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
                      <div className="text-sm text-blue-800">
                        <p className="font-medium mb-2">How this works:</p>
                        <ul className="space-y-1 text-sm">
                          <li>• Users click newsletter subscribe buttons across your site</li>
                          <li>• A popup displays using your Beehiiv embed code from above</li>
                          <li>• Users complete subscription directly in Beehiiv's native form</li>
                          <li>• Attribution tracking automatically records subscription sources</li>
                        </ul>
                      </div>
                    </div>
                  </div>

                  {/* Save Button */}
                  <div className="flex justify-end pt-4 border-t border-gray-100">
                    <Button 
                      onClick={handleSave} 
                      disabled={isSaving || (settings.isEnabled && !settings.embedCode.trim())}
                      className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2"
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
              </CardContent>
            </Card>

            {/* Code Preview Section */}
            {settings.embedCode && (
              <Card className="shadow-sm border border-gray-200">
                <CardHeader className="border-b border-gray-100 bg-gray-50">
                  <CardTitle className="text-lg text-gray-900 flex items-center gap-2">
                    <CheckCircle className="h-5 w-5 text-green-600" />
                    Code Preview
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  <p className="text-sm text-gray-600 mb-4">
                    Your saved embed code (this will be used for newsletter popups across your site):
                  </p>
                  <div className="bg-gray-50 rounded-lg p-4 border-2 border-dashed border-gray-300">
                    <pre className="bg-gray-900 text-gray-100 p-4 rounded text-xs overflow-x-auto">
                      <code>{settings.embedCode}</code>
                    </pre>
                    {settings.attributionCode && (
                      <>
                        <p className="text-sm text-gray-600 mt-3 mb-2">Attribution tracking code:</p>
                        <pre className="bg-gray-900 text-gray-100 p-4 rounded text-xs overflow-x-auto">
                          <code>{settings.attributionCode}</code>
                        </pre>
                      </>
                    )}
                  </div>
                  <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
                    <p className="text-sm text-green-800">
                      ✅ Settings saved successfully! The newsletter subscribe buttons across your site will now use this embed code.
                    </p>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        )}
      </div>
    </AdminLayout>
  )
}