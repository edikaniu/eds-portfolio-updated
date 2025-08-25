'use client'

import { useState, useEffect } from 'react'
import { AdminLayout } from '@/components/admin/admin-layout'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { WysiwygEditor } from '@/components/ui/wysiwyg-editor'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Label } from '@/components/ui/label'
import { Save, User, Code, Mail, Linkedin, MapPin } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import { ImageUpload } from '@/components/ui/image-upload'

interface HeroData {
  name: string
  roles: string[]
  tagline: string
  profileImage: string
  email: string
  linkedin: string
  twitter: string
}

interface AboutData {
  title: string
  description: string
  shortBio: string
  fullBio: string
  stats?: {
    usersScaled: string
    growth: string
    budgetScaled: string
    roas: string
  }
}

interface ContactData {
  email: string
  phone: string
  location: string
  linkedin: string
  twitter: string
  github: string
}

export default function FrontendContentPage() {
  const [loading, setLoading] = useState(false)
  const [activeTab, setActiveTab] = useState('hero')
  const { toast } = useToast()

  // Hero Section Data
  const [heroData, setHeroData] = useState<HeroData>({
    name: 'Edikan Udoibuot',
    roles: [
      'Marketing & Growth Leader',
      'AI-Powered Marketing Strategist', 
      'Product Growth Expert',
      'Vibe Marketing Practitioner',
      'Full-stack Marketer'
    ],
    tagline: '7+ years scaling products from hundreds to thousands of users through data-driven growth strategies and AI-powered marketing',
    profileImage: 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Ed%27s%20Passport.png-x6NE3irYLKlWGZnSaeBC1W5rrT8PmW.jpeg',
    email: 'edikanudoibuot@gmail.com',
    linkedin: 'https://www.linkedin.com/in/edikanudoibuot/',
    twitter: 'https://x.com/edikanudoibuot'
  })

  // About Section Data
  const [aboutData, setAboutData] = useState<AboutData>({
    title: 'About Me',
    description: 'Get to know the person behind the growth',
    shortBio: 'Growth-focused marketing professional with 7+ years of experience scaling products from hundreds to thousands of users. Specialized in AI-driven marketing strategies, cross-functional leadership, and data-driven growth optimization.',
    fullBio: 'Growth-focused marketing professional with 7+ years of experience scaling products from hundreds to thousands of users. Specialized in AI-driven marketing strategies, cross-functional leadership, and data-driven growth optimization.\n\nThroughout my career, I\'ve successfully led marketing initiatives that have driven substantial user growth and revenue increases. My expertise spans across product marketing, growth hacking, AI implementation, and team leadership.\n\nI\'m passionate about leveraging cutting-edge AI technologies to optimize marketing workflows, enhance productivity, and deliver measurable results. My approach combines analytical thinking with creative problem-solving to identify growth opportunities and execute strategies that scale.\n\nCurrently serving as Marketing Manager at Suretree Systems, where I\'ve implemented AI initiatives that boosted team productivity by 20% and led campaigns that scaled our user base from 100 to over 10,000 users in just 2 months.',
    stats: {
      usersScaled: '200k+',
      growth: '733%',
      budgetScaled: '$500k+',
      roas: '5x'
    }
  })

  // Contact Section Data
  const [contactData, setContactData] = useState<ContactData>({
    email: 'edikanudoibuot@gmail.com',
    phone: '',
    location: '',
    linkedin: 'https://www.linkedin.com/in/edikanudoibuot/',
    twitter: 'https://x.com/edikanudoibuot',
    github: ''
  })

  useEffect(() => {
    loadFrontendContent()
  }, [])

  const loadFrontendContent = async () => {
    try {
      // Load existing content from backend
      const response = await fetch('/api/admin/frontend-content')
      const data = await response.json()
      
      if (data.success) {
        // Process and set existing data
        data.data.forEach((section: any) => {
          if (section.sectionName === 'hero' && section.content) {
            setHeroData(prevData => ({ ...prevData, ...section.content }))
          }
          if (section.sectionName === 'about' && section.content) {
            setAboutData(prevData => ({ ...prevData, ...section.content }))
          }
          if (section.sectionName === 'contact' && section.content) {
            setContactData(prevData => ({ ...prevData, ...section.content }))
          }
        })
      }
    } catch (error) {
      console.error('Error loading frontend content:', error)
    }
  }

  const saveHeroData = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/admin/frontend-content', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sectionType: 'hero',
          data: heroData
        })
      })

      const data = await response.json()
      if (data.success) {
        toast({
          title: "Success",
          description: "Hero section updated successfully"
        })
      } else {
        throw new Error(data.message)
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to update hero section",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  const saveAboutData = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/admin/frontend-content', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sectionType: 'about',
          data: aboutData
        })
      })

      const data = await response.json()
      if (data.success) {
        toast({
          title: "Success",
          description: "About section updated successfully"
        })
      } else {
        throw new Error(data.message)
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to update about section",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  const saveContactData = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/admin/frontend-content', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sectionType: 'contact',
          data: contactData
        })
      })

      const data = await response.json()
      if (data.success) {
        toast({
          title: "Success",
          description: "Contact section updated successfully"
        })
      } else {
        throw new Error(data.message)
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to update contact section",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  const addRole = () => {
    setHeroData(prev => ({
      ...prev,
      roles: [...prev.roles, '']
    }))
  }

  const updateRole = (index: number, value: string) => {
    setHeroData(prev => ({
      ...prev,
      roles: prev.roles.map((role, i) => i === index ? value : role)
    }))
  }

  const removeRole = (index: number) => {
    setHeroData(prev => ({
      ...prev,
      roles: prev.roles.filter((_, i) => i !== index)
    }))
  }

  return (
    <AdminLayout title="Frontend Content Management">
      <div className="space-y-6">
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-8 shadow-lg border border-blue-200">
          <h1 className="text-3xl font-bold mb-3 text-blue-900">Frontend Content Management</h1>
          <p className="text-lg text-blue-700">Edit the content that appears on your portfolio website frontend.</p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="hero" className="flex items-center gap-2">
              <User className="h-4 w-4" />
              Hero Section
            </TabsTrigger>
            <TabsTrigger value="about" className="flex items-center gap-2">
              <Code className="h-4 w-4" />
              About Section
            </TabsTrigger>
            <TabsTrigger value="contact" className="flex items-center gap-2">
              <Mail className="h-4 w-4" />
              Contact Section
            </TabsTrigger>
          </TabsList>

          <TabsContent value="hero" className="space-y-4">
            <Card className="shadow-lg border-0 bg-white rounded-xl overflow-hidden">
              <CardHeader className="bg-gradient-to-r from-blue-50 to-blue-100 border-b border-blue-200 pb-4">
                <CardTitle className="text-xl font-bold text-blue-900 flex items-center gap-3">
                  <User className="h-6 w-6 text-blue-600" />
                  Hero Section Content
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6 p-6">
                <div className="space-y-2">
                  <Label htmlFor="name">Name</Label>
                  <Input
                    id="name"
                    value={heroData.name}
                    onChange={(e) => setHeroData(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="Your full name"
                  />
                </div>

                <div className="space-y-2">
                  <Label>Roles/Titles</Label>
                  {heroData.roles.map((role, index) => (
                    <div key={index} className="flex gap-2">
                      <Input
                        value={role}
                        onChange={(e) => updateRole(index, e.target.value)}
                        placeholder="Enter role/title"
                      />
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => removeRole(index)}
                      >
                        Remove
                      </Button>
                    </div>
                  ))}
                  <Button variant="outline" onClick={addRole}>
                    Add Role
                  </Button>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="tagline">Tagline</Label>
                  <WysiwygEditor
                    value={heroData.tagline}
                    onChange={(tagline) => setHeroData(prev => ({ ...prev, tagline }))}
                    placeholder="Brief description about yourself"
                    height={150}
                  />
                </div>

                <div className="md:col-span-2">
                  <ImageUpload
                    label="Profile Image"
                    value={heroData.profileImage}
                    onChange={(url) => setHeroData(prev => ({ ...prev, profileImage: url }))}
                    folder="profile"
                    maxSize={2}
                    recommendedDimensions={{
                      width: 400,
                      height: 400,
                      aspectRatio: "1:1"
                    }}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={heroData.email}
                      onChange={(e) => setHeroData(prev => ({ ...prev, email: e.target.value }))}
                      placeholder="your@email.com"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="linkedin">LinkedIn URL</Label>
                    <Input
                      id="linkedin"
                      value={heroData.linkedin}
                      onChange={(e) => setHeroData(prev => ({ ...prev, linkedin: e.target.value }))}
                      placeholder="LinkedIn profile URL"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="twitter">Twitter/X URL</Label>
                    <Input
                      id="twitter"
                      value={heroData.twitter}
                      onChange={(e) => setHeroData(prev => ({ ...prev, twitter: e.target.value }))}
                      placeholder="Twitter/X profile URL"
                    />
                  </div>
                </div>

                <Button 
                  onClick={saveHeroData} 
                  disabled={loading} 
                  className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white shadow-lg hover:shadow-xl transition-all duration-200 py-3 font-semibold"
                >
                  <Save className="mr-2 h-4 w-4" />
                  Save Hero Section
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="about" className="space-y-4">
            <Card className="shadow-lg border-0 bg-white rounded-xl overflow-hidden">
              <CardHeader className="bg-gradient-to-r from-green-50 to-green-100 border-b border-green-200 pb-4">
                <CardTitle className="text-xl font-bold text-green-900 flex items-center gap-3">
                  <Code className="h-6 w-6 text-green-600" />
                  About Section Content
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6 p-6">
                <div className="space-y-2">
                  <Label htmlFor="aboutTitle">Section Title</Label>
                  <Input
                    id="aboutTitle"
                    value={aboutData.title}
                    onChange={(e) => setAboutData(prev => ({ ...prev, title: e.target.value }))}
                    placeholder="About Me"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="aboutDescription">Section Description</Label>
                  <Input
                    id="aboutDescription"
                    value={aboutData.description}
                    onChange={(e) => setAboutData(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Get to know the person behind the growth"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="shortBio">Short Bio</Label>
                  <WysiwygEditor
                    value={aboutData.shortBio}
                    onChange={(shortBio) => setAboutData(prev => ({ ...prev, shortBio }))}
                    placeholder="Brief professional summary..."
                    height={200}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="fullBio">Full Bio</Label>
                  <WysiwygEditor
                    value={aboutData.fullBio}
                    onChange={(fullBio) => setAboutData(prev => ({ ...prev, fullBio }))}
                    placeholder="Detailed professional background..."
                    height={300}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Statistics</Label>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="usersScaled">Users Scaled</Label>
                      <Input
                        id="usersScaled"
                        value={aboutData.stats?.usersScaled || ''}
                        onChange={(e) => setAboutData(prev => ({ 
                          ...prev, 
                          stats: { ...prev.stats!, usersScaled: e.target.value }
                        }))}
                        placeholder="200k+"
                      />
                    </div>
                    <div>
                      <Label htmlFor="growth">Growth Percentage</Label>
                      <Input
                        id="growth"
                        value={aboutData.stats?.growth || ''}
                        onChange={(e) => setAboutData(prev => ({ 
                          ...prev, 
                          stats: { ...prev.stats!, growth: e.target.value }
                        }))}
                        placeholder="733%"
                      />
                    </div>
                    <div>
                      <Label htmlFor="budgetScaled">Budget Scaled</Label>
                      <Input
                        id="budgetScaled"
                        value={aboutData.stats?.budgetScaled || ''}
                        onChange={(e) => setAboutData(prev => ({ 
                          ...prev, 
                          stats: { ...prev.stats!, budgetScaled: e.target.value }
                        }))}
                        placeholder="$500k+"
                      />
                    </div>
                    <div>
                      <Label htmlFor="roas">ROAS</Label>
                      <Input
                        id="roas"
                        value={aboutData.stats?.roas || ''}
                        onChange={(e) => setAboutData(prev => ({ 
                          ...prev, 
                          stats: { ...prev.stats!, roas: e.target.value }
                        }))}
                        placeholder="5x"
                      />
                    </div>
                  </div>
                </div>

                <Button 
                  onClick={saveAboutData} 
                  disabled={loading} 
                  className="w-full bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white shadow-lg hover:shadow-xl transition-all duration-200 py-3 font-semibold"
                >
                  <Save className="mr-2 h-4 w-4" />
                  Save About Section
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="contact" className="space-y-4">
            <Card className="shadow-lg border-0 bg-white rounded-xl overflow-hidden">
              <CardHeader className="bg-gradient-to-r from-purple-50 to-purple-100 border-b border-purple-200 pb-4">
                <CardTitle className="text-xl font-bold text-purple-900 flex items-center gap-3">
                  <Mail className="h-6 w-6 text-purple-600" />
                  Contact Section Content
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6 p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="contactEmail">Email</Label>
                    <Input
                      id="contactEmail"
                      type="email"
                      value={contactData.email}
                      onChange={(e) => setContactData(prev => ({ ...prev, email: e.target.value }))}
                      placeholder="your@email.com"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone</Label>
                    <Input
                      id="phone"
                      value={contactData.phone}
                      onChange={(e) => setContactData(prev => ({ ...prev, phone: e.target.value }))}
                      placeholder="Your phone number"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="location">Location</Label>
                    <Input
                      id="location"
                      value={contactData.location}
                      onChange={(e) => setContactData(prev => ({ ...prev, location: e.target.value }))}
                      placeholder="City, Country"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="github">GitHub URL</Label>
                    <Input
                      id="github"
                      value={contactData.github}
                      onChange={(e) => setContactData(prev => ({ ...prev, github: e.target.value }))}
                      placeholder="GitHub profile URL"
                    />
                  </div>
                </div>

                <Button 
                  onClick={saveContactData} 
                  disabled={loading} 
                  className="w-full bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white shadow-lg hover:shadow-xl transition-all duration-200 py-3 font-semibold"
                >
                  <Save className="mr-2 h-4 w-4" />
                  Save Contact Section
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AdminLayout>
  )
}