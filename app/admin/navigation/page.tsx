"use client"

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  Plus,
  Edit,
  Trash2,
  Navigation,
  Link,
  Menu,
  ExternalLink,
  Save,
  Loader2
} from 'lucide-react'
import { AdminLayout } from '@/components/admin/admin-layout'

interface NavigationItem {
  id: string
  title: string
  href: string
  isSection: boolean
  order: number
  isActive: boolean
}

interface SocialLink {
  id: string
  platform: string
  url: string
  isVisible: boolean
  order: number
}

export default function NavigationManagementPage() {
  const [navigationItems, setNavigationItems] = useState<NavigationItem[]>([])
  const [socialLinks, setSocialLinks] = useState<SocialLink[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [activeTab, setActiveTab] = useState("navigation")
  const router = useRouter()

  // Form states
  const [newNavItem, setNewNavItem] = useState({
    title: '',
    href: '',
    isSection: false
  })

  const [newSocialLink, setNewSocialLink] = useState({
    platform: '',
    url: ''
  })

  useEffect(() => {
    checkAuth()
    loadData()
  }, [])

  const checkAuth = async () => {
    try {
      const response = await fetch('/api/admin/auth/me')
      const data = await response.json()
      if (!data.success) {
        router.push('/admin/login')
      }
    } catch (error) {
      router.push('/admin/login')
    }
  }

  const loadData = async () => {
    try {
      // Load navigation items
      const navResponse = await fetch('/api/admin/navigation')
      const navData = await navResponse.json()
      
      if (navData.success) {
        setNavigationItems(navData.data || [])
      }

      // Load social links
      const socialResponse = await fetch('/api/admin/social-links')
      const socialData = await socialResponse.json()
      
      if (socialData.success) {
        setSocialLinks(socialData.data || [])
      }
    } catch (error) {
      console.error('Error loading data:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleAddNavItem = async () => {
    if (!newNavItem.title || !newNavItem.href) return

    try {
      const response = await fetch('/api/admin/navigation', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newNavItem),
      })

      const data = await response.json()

      if (data.success) {
        setNavigationItems([...navigationItems, data.data])
        setNewNavItem({
          title: '',
          href: '',
          isSection: false
        })
      } else {
        console.error('Failed to add navigation item:', data.message)
      }
    } catch (error) {
      console.error('Error adding navigation item:', error)
    }
  }

  const handleAddSocialLink = async () => {
    if (!newSocialLink.platform || !newSocialLink.url) return

    try {
      const response = await fetch('/api/admin/social-links', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newSocialLink),
      })

      const data = await response.json()

      if (data.success) {
        setSocialLinks([...socialLinks, data.data])
        setNewSocialLink({
          platform: '',
          url: ''
        })
      } else {
        console.error('Failed to add social link:', data.message)
      }
    } catch (error) {
      console.error('Error adding social link:', error)
    }
  }

  if (isLoading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-64">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </AdminLayout>
    )
  }

  return (
    <AdminLayout title="Navigation & Footer Management">
      <div className="space-y-6">
        {/* Overview Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Navigation Items</p>
                <p className="text-2xl font-bold text-gray-900">{navigationItems.length}</p>
              </div>
              <Navigation className="h-8 w-8 text-blue-600" />
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Social Links</p>
                <p className="text-2xl font-bold text-gray-900">{socialLinks.length}</p>
              </div>
              <Link className="h-8 w-8 text-green-600" />
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Active Items</p>
                <p className="text-2xl font-bold text-gray-900">
                  {navigationItems.filter(item => item.isActive).length + socialLinks.filter(link => link.isVisible).length}
                </p>
              </div>
              <Menu className="h-8 w-8 text-purple-600" />
            </div>
          </Card>
        </div>

        {/* Main Content */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="navigation">Navigation Menu</TabsTrigger>
            <TabsTrigger value="footer">Footer & Social</TabsTrigger>
          </TabsList>

          {/* Navigation Management */}
          <TabsContent value="navigation" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Add Navigation Item Form */}
              <Card className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Add Navigation Item</h3>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="navTitle">Title</Label>
                    <Input
                      id="navTitle"
                      value={newNavItem.title}
                      onChange={(e) => setNewNavItem({...newNavItem, title: e.target.value})}
                      placeholder="About, Projects, Contact..."
                    />
                  </div>

                  <div>
                    <Label htmlFor="navHref">Link/Href</Label>
                    <Input
                      id="navHref"
                      value={newNavItem.href}
                      onChange={(e) => setNewNavItem({...newNavItem, href: e.target.value})}
                      placeholder="#about, /projects, #contact..."
                    />
                  </div>

                  <div className="flex items-center space-x-2">
                    <input
                      id="isSection"
                      type="checkbox"
                      checked={newNavItem.isSection}
                      onChange={(e) => setNewNavItem({...newNavItem, isSection: e.target.checked})}
                      className="rounded"
                    />
                    <Label htmlFor="isSection">Is page section (smooth scroll)</Label>
                  </div>

                  <Button onClick={handleAddNavItem} className="w-full">
                    <Plus className="w-4 h-4 mr-2" />
                    Add Navigation Item
                  </Button>
                </div>
              </Card>

              {/* Navigation Items List */}
              <Card className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Current Navigation</h3>
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {navigationItems.map((item) => (
                    <div key={item.id} className="border rounded-lg p-3">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <h4 className="font-medium text-gray-900">{item.title}</h4>
                          <div className="flex items-center mt-1">
                            <span className="text-sm text-gray-500">{item.href}</span>
                            {item.isSection && (
                              <span className="ml-2 text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">Section</span>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center space-x-1 ml-2">
                          <Button variant="ghost" size="sm">
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm" className="text-red-600">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                  {navigationItems.length === 0 && (
                    <div className="text-center py-8 text-gray-500">
                      <Navigation className="mx-auto h-12 w-12 text-gray-300 mb-4" />
                      <p>No navigation items yet</p>
                      <p className="text-sm">Add your first navigation item to get started</p>
                    </div>
                  )}
                </div>
              </Card>
            </div>
          </TabsContent>

          {/* Footer & Social Management */}
          <TabsContent value="footer" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Add Social Link Form */}
              <Card className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Add Social Link</h3>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="platform">Platform</Label>
                    <select 
                      id="platform"
                      className="w-full border border-gray-300 rounded-md px-3 py-2"
                      value={newSocialLink.platform}
                      onChange={(e) => setNewSocialLink({...newSocialLink, platform: e.target.value})}
                    >
                      <option value="">Select platform...</option>
                      <option value="github">GitHub</option>
                      <option value="linkedin">LinkedIn</option>
                      <option value="twitter">Twitter</option>
                      <option value="email">Email</option>
                      <option value="instagram">Instagram</option>
                      <option value="youtube">YouTube</option>
                      <option value="website">Website</option>
                    </select>
                  </div>

                  <div>
                    <Label htmlFor="socialUrl">URL</Label>
                    <Input
                      id="socialUrl"
                      value={newSocialLink.url}
                      onChange={(e) => setNewSocialLink({...newSocialLink, url: e.target.value})}
                      placeholder="https://github.com/username"
                    />
                  </div>

                  <Button onClick={handleAddSocialLink} className="w-full">
                    <Plus className="w-4 h-4 mr-2" />
                    Add Social Link
                  </Button>
                </div>
              </Card>

              {/* Social Links List */}
              <Card className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Social Links</h3>
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {socialLinks.map((link) => (
                    <div key={link.id} className="border rounded-lg p-3">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <h4 className="font-medium text-gray-900 capitalize">{link.platform}</h4>
                          <div className="flex items-center mt-1">
                            <ExternalLink className="h-3 w-3 text-gray-400 mr-1" />
                            <span className="text-sm text-gray-500">{link.url}</span>
                          </div>
                        </div>
                        <div className="flex items-center space-x-1 ml-2">
                          <Button variant="ghost" size="sm">
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm" className="text-red-600">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                  {socialLinks.length === 0 && (
                    <div className="text-center py-8 text-gray-500">
                      <Link className="mx-auto h-12 w-12 text-gray-300 mb-4" />
                      <p>No social links yet</p>
                      <p className="text-sm">Add your social media links</p>
                    </div>
                  )}
                </div>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </AdminLayout>
  )
}