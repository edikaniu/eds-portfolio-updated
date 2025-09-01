"use client"

import { useState, useEffect } from 'react'
import { AdminLayout } from '@/components/admin/admin-layout'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { toast } from 'sonner'
import { Save, Mail, Code, AlertCircle, CheckCircle } from 'lucide-react'

interface NewsletterSettings {
  embedCode: string
  attributionCode: string
}

export default function NewsletterAdminPage() {
  const [settings, setSettings] = useState<NewsletterSettings>({
    embedCode: '',
    attributionCode: ''
  })
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)

  useEffect(() => {
    fetchSettings()
  }, [])

  const fetchSettings = async () => {
    try {
      const response = await fetch('/api/admin/newsletter')
      if (response.ok) {
        const data = await response.json()
        if (data.success) {
          setSettings(data.data)
        }
      }
    } catch (error) {
      console.error('Failed to fetch newsletter settings:', error)
      toast.error('Failed to load newsletter settings')
    } finally {
      setIsLoading(false)
    }
  }

  const handleSave = async () => {
    if (!settings.embedCode.trim()) {
      toast.error('Beehiiv embed code is required')
      return
    }

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
      console.error('Save error:', error)
      toast.error('Network error. Please try again.')
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
                      disabled={isSaving || !settings.embedCode.trim()}
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

            {/* Preview Section */}
            {settings.embedCode && (
              <Card className="shadow-sm border border-gray-200">
                <CardHeader className="border-b border-gray-100 bg-gray-50">
                  <CardTitle className="text-lg text-gray-900 flex items-center gap-2">
                    <CheckCircle className="h-5 w-5 text-green-600" />
                    Form Preview
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  <p className="text-sm text-gray-600 mb-4">
                    This is how your newsletter form will appear in popups across your site:
                  </p>
                  <div className="bg-gray-50 rounded-lg p-4 border-2 border-dashed border-gray-300">
                    <div className="bg-white rounded-lg border border-gray-200 p-4 max-w-lg mx-auto">
                      <div 
                        dangerouslySetInnerHTML={{ 
                          __html: settings.embedCode + (settings.attributionCode || '') 
                        }} 
                      />
                    </div>
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