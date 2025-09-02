"use client"

import { useState, useEffect } from 'react'
import { AdminLayout } from '@/components/admin/admin-layout'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { toast } from 'sonner'
import { Save, Mail, User, MapPin, Phone, Linkedin, Globe, Target, Users, Zap, CheckCircle } from 'lucide-react'

interface ContactPageContent {
  // Hero Section
  heroTitle: string
  heroSubtitle: string
  heroDescription: string
  
  // Contact Info
  email: string
  phone: string
  location: string
  linkedinUrl: string
  twitterUrl: string
  
  // Why Work With Me
  whyWorkTitle: string
  whyWorkDescription: string
  benefits: Array<{
    icon: string
    text: string
  }>
  
  // Stats
  responseTime: string
  yearsExperience: string
  projectsDelivered: string
}

export default function ContactAdminPage() {
  const [content, setContent] = useState<ContactPageContent>({
    heroTitle: "Let's Create Something Extraordinary",
    heroSubtitle: "Available for New Projects",
    heroDescription: "Ready to transform your marketing strategy and accelerate growth? Let's discuss how we can scale your business with innovative, data-driven solutions.",
    email: "edikanudoibuot@gmail.com",
    phone: "",
    location: "Nigeria",
    linkedinUrl: "https://www.linkedin.com/in/edikanudoibuot/",
    twitterUrl: "https://x.com/edikanudoibuot",
    whyWorkTitle: "Why Work With Me?",
    whyWorkDescription: "Here's what sets me apart and makes our collaboration successful",
    benefits: [
      { icon: "Users", text: "7+ years of proven growth marketing experience" },
      { icon: "Zap", text: "AI-powered strategies for maximum efficiency" },
      { icon: "Target", text: "Data-driven approach with measurable results" },
      { icon: "CheckCircle", text: "Cross-functional leadership and collaboration" },
    ],
    responseTime: "24h",
    yearsExperience: "7+",
    projectsDelivered: "50+"
  })

  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)

  useEffect(() => {
    fetchContent()
  }, [])

  const fetchContent = async () => {
    try {
      const response = await fetch('/api/admin/contact')
      if (response.ok) {
        const data = await response.json()
        if (data.success && data.data) {
          setContent(data.data)
        }
      }
    } catch (error) {
      console.error('Failed to fetch contact content:', error)
      toast.error('Failed to load contact content')
    } finally {
      setIsLoading(false)
    }
  }

  const handleSave = async () => {
    try {
      setIsSaving(true)
      
      const response = await fetch('/api/admin/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(content),
      })

      if (!response.ok) {
        const errorText = await response.text()
        toast.error(`Failed to save: ${errorText}`)
        return
      }

      const data = await response.json()
      if (data.success) {
        toast.success('Contact page content saved successfully!')
      } else {
        toast.error(data.error || 'Failed to save content')
      }
    } catch (error) {
      console.error('Save error:', error)
      toast.error(`Network error: ${error instanceof Error ? error.message : 'Unknown error'}`)
    } finally {
      setIsSaving(false)
    }
  }

  const handleInputChange = (field: keyof ContactPageContent, value: string) => {
    setContent(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleBenefitChange = (index: number, field: 'icon' | 'text', value: string) => {
    setContent(prev => ({
      ...prev,
      benefits: prev.benefits.map((benefit, i) => 
        i === index ? { ...benefit, [field]: value } : benefit
      )
    }))
  }

  const addBenefit = () => {
    setContent(prev => ({
      ...prev,
      benefits: [...prev.benefits, { icon: "CheckCircle", text: "" }]
    }))
  }

  const removeBenefit = (index: number) => {
    setContent(prev => ({
      ...prev,
      benefits: prev.benefits.filter((_, i) => i !== index)
    }))
  }

  if (isLoading) {
    return (
      <AdminLayout title="Contact Page">
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span className="ml-2 text-gray-600">Loading contact content...</span>
        </div>
      </AdminLayout>
    )
  }

  return (
    <AdminLayout title="Contact Page">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Contact Page Settings</h1>
            <p className="mt-2 text-gray-600">
              Manage your contact page content, hero section, and contact information.
            </p>
          </div>
          <Button 
            onClick={handleSave} 
            disabled={isSaving}
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            {isSaving ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Saving...
              </>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                Save Changes
              </>
            )}
          </Button>
        </div>

        <div className="grid gap-6">
          {/* Hero Section */}
          <Card className="shadow-sm border border-gray-200">
            <CardHeader className="border-b border-gray-100 bg-gray-50">
              <CardTitle className="text-lg text-gray-900 flex items-center gap-2">
                <Globe className="h-5 w-5 text-blue-600" />
                Hero Section
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-4">
              <div>
                <Label htmlFor="heroTitle" className="text-sm font-semibold text-gray-900">
                  Main Title
                </Label>
                <Input
                  id="heroTitle"
                  value={content.heroTitle}
                  onChange={(e) => handleInputChange('heroTitle', e.target.value)}
                  placeholder="Let's Create Something Extraordinary"
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="heroSubtitle" className="text-sm font-semibold text-gray-900">
                  Status Badge
                </Label>
                <Input
                  id="heroSubtitle"
                  value={content.heroSubtitle}
                  onChange={(e) => handleInputChange('heroSubtitle', e.target.value)}
                  placeholder="Available for New Projects"
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="heroDescription" className="text-sm font-semibold text-gray-900">
                  Description
                </Label>
                <Textarea
                  id="heroDescription"
                  value={content.heroDescription}
                  onChange={(e) => handleInputChange('heroDescription', e.target.value)}
                  placeholder="Ready to transform your marketing strategy..."
                  className="mt-1 min-h-[80px]"
                />
              </div>
            </CardContent>
          </Card>

          {/* Contact Information */}
          <Card className="shadow-sm border border-gray-200">
            <CardHeader className="border-b border-gray-100 bg-gray-50">
              <CardTitle className="text-lg text-gray-900 flex items-center gap-2">
                <Mail className="h-5 w-5 text-blue-600" />
                Contact Information
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="email" className="text-sm font-semibold text-gray-900">
                    Email Address
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    value={content.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    placeholder="your@email.com"
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="phone" className="text-sm font-semibold text-gray-900">
                    Phone Number (Optional)
                  </Label>
                  <Input
                    id="phone"
                    value={content.phone}
                    onChange={(e) => handleInputChange('phone', e.target.value)}
                    placeholder="+234 xxx xxx xxxx"
                    className="mt-1"
                  />
                </div>
              </div>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="location" className="text-sm font-semibold text-gray-900">
                    Location
                  </Label>
                  <Input
                    id="location"
                    value={content.location}
                    onChange={(e) => handleInputChange('location', e.target.value)}
                    placeholder="Nigeria"
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="linkedinUrl" className="text-sm font-semibold text-gray-900">
                    LinkedIn URL
                  </Label>
                  <Input
                    id="linkedinUrl"
                    value={content.linkedinUrl}
                    onChange={(e) => handleInputChange('linkedinUrl', e.target.value)}
                    placeholder="https://linkedin.com/in/username"
                    className="mt-1"
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="twitterUrl" className="text-sm font-semibold text-gray-900">
                  X (Twitter) URL
                </Label>
                <Input
                  id="twitterUrl"
                  value={content.twitterUrl}
                  onChange={(e) => handleInputChange('twitterUrl', e.target.value)}
                  placeholder="https://x.com/username"
                  className="mt-1"
                />
              </div>
            </CardContent>
          </Card>

          {/* Quick Stats */}
          <Card className="shadow-sm border border-gray-200">
            <CardHeader className="border-b border-gray-100 bg-gray-50">
              <CardTitle className="text-lg text-gray-900 flex items-center gap-2">
                <Target className="h-5 w-5 text-blue-600" />
                Quick Stats
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="grid md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="responseTime" className="text-sm font-semibold text-gray-900">
                    Response Time
                  </Label>
                  <Input
                    id="responseTime"
                    value={content.responseTime}
                    onChange={(e) => handleInputChange('responseTime', e.target.value)}
                    placeholder="24h"
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="yearsExperience" className="text-sm font-semibold text-gray-900">
                    Years Experience
                  </Label>
                  <Input
                    id="yearsExperience"
                    value={content.yearsExperience}
                    onChange={(e) => handleInputChange('yearsExperience', e.target.value)}
                    placeholder="7+"
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="projectsDelivered" className="text-sm font-semibold text-gray-900">
                    Projects Delivered
                  </Label>
                  <Input
                    id="projectsDelivered"
                    value={content.projectsDelivered}
                    onChange={(e) => handleInputChange('projectsDelivered', e.target.value)}
                    placeholder="50+"
                    className="mt-1"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Why Work With Me */}
          <Card className="shadow-sm border border-gray-200">
            <CardHeader className="border-b border-gray-100 bg-gray-50">
              <CardTitle className="text-lg text-gray-900 flex items-center gap-2">
                <Users className="h-5 w-5 text-blue-600" />
                Why Work With Me Section
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-4">
              <div>
                <Label htmlFor="whyWorkTitle" className="text-sm font-semibold text-gray-900">
                  Section Title
                </Label>
                <Input
                  id="whyWorkTitle"
                  value={content.whyWorkTitle}
                  onChange={(e) => handleInputChange('whyWorkTitle', e.target.value)}
                  placeholder="Why Work With Me?"
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="whyWorkDescription" className="text-sm font-semibold text-gray-900">
                  Section Description
                </Label>
                <Textarea
                  id="whyWorkDescription"
                  value={content.whyWorkDescription}
                  onChange={(e) => handleInputChange('whyWorkDescription', e.target.value)}
                  placeholder="Here's what sets me apart..."
                  className="mt-1"
                />
              </div>

              {/* Benefits */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <Label className="text-sm font-semibold text-gray-900">
                    Benefits
                  </Label>
                  <Button
                    type="button"
                    onClick={addBenefit}
                    variant="outline"
                    size="sm"
                    className="text-blue-600 border-blue-600 hover:bg-blue-50"
                  >
                    Add Benefit
                  </Button>
                </div>
                <div className="space-y-3">
                  {content.benefits.map((benefit, index) => (
                    <div key={index} className="flex gap-3 p-3 border border-gray-200 rounded-lg">
                      <div className="flex-1 grid md:grid-cols-2 gap-3">
                        <div>
                          <Label className="text-xs text-gray-600">Icon Name</Label>
                          <Input
                            value={benefit.icon}
                            onChange={(e) => handleBenefitChange(index, 'icon', e.target.value)}
                            placeholder="CheckCircle"
                            className="mt-1"
                          />
                        </div>
                        <div>
                          <Label className="text-xs text-gray-600">Benefit Text</Label>
                          <Input
                            value={benefit.text}
                            onChange={(e) => handleBenefitChange(index, 'text', e.target.value)}
                            placeholder="Your benefit description"
                            className="mt-1"
                          />
                        </div>
                      </div>
                      <Button
                        type="button"
                        onClick={() => removeBenefit(index)}
                        variant="outline"
                        size="sm"
                        className="text-red-600 border-red-600 hover:bg-red-50 mt-6"
                      >
                        Remove
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </AdminLayout>
  )
}