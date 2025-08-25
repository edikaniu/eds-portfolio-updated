"use client"

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { 
  FileText,
  MessageSquare,
  Navigation,
  BarChart3
} from 'lucide-react'
import { AdminLayout } from '@/components/admin/admin-layout'
import { logger } from '@/lib/logger'

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    contentSections: 0,
    conversations: 0,
    caseStudies: 0,
    knowledgeItems: 0
  })
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    loadDashboardStats()
  }, [])

  const loadDashboardStats = async () => {
    try {
      const response = await fetch('/api/admin/dashboard-stats')
      const data = await response.json()
      
      if (data.success) {
        setStats(data.data)
      }
    } catch (error) {
      logger.error('Failed to load dashboard stats', error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <AdminLayout title="Dashboard">
      <div className="space-y-8">
        {/* Welcome Section */}
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-8 shadow-lg border border-blue-200">
          <h1 className="text-3xl font-bold mb-3 text-blue-900">Admin Portal Overview</h1>
          <p className="text-lg text-blue-700">Manage your portfolio content, chatbot, and analytics from here.</p>
        </div>

        {/* Stats cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          <Card className="p-8 bg-white border border-gray-200 shadow-sm hover:shadow-lg transition-all duration-300 rounded-xl">
            <div className="flex items-center">
              <div className="flex-1">
                <p className="text-sm font-semibold text-gray-600 uppercase tracking-wide">Knowledge Base</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">
                  {isLoading ? '...' : stats.knowledgeItems}
                </p>
                <p className="text-sm text-emerald-600 mt-2 font-medium">↗ Active items</p>
              </div>
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center shadow-lg">
                <FileText className="h-8 w-8 text-white" />
              </div>
            </div>
          </Card>

          <Card className="p-8 bg-white border border-gray-200 shadow-sm hover:shadow-lg transition-all duration-300 rounded-xl">
            <div className="flex items-center">
              <div className="flex-1">
                <p className="text-sm font-semibold text-gray-600 uppercase tracking-wide">Conversations</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">
                  {isLoading ? '...' : stats.conversations}
                </p>
                <p className="text-sm text-emerald-600 mt-2 font-medium">↗ Total chats</p>
              </div>
              <div className="w-16 h-16 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-2xl flex items-center justify-center shadow-lg">
                <MessageSquare className="h-8 w-8 text-white" />
              </div>
            </div>
          </Card>

          <Card className="p-8 bg-white border border-gray-200 shadow-sm hover:shadow-lg transition-all duration-300 rounded-xl">
            <div className="flex items-center">
              <div className="flex-1">
                <p className="text-sm font-semibold text-gray-600 uppercase tracking-wide">Case Studies</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">
                  {isLoading ? '...' : stats.caseStudies}
                </p>
                <p className="text-sm text-emerald-600 mt-2 font-medium">↗ Published</p>
              </div>
              <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg">
                <BarChart3 className="h-8 w-8 text-white" />
              </div>
            </div>
          </Card>

          <Card className="p-8 bg-white border border-gray-200 shadow-sm hover:shadow-lg transition-all duration-300 rounded-xl">
            <div className="flex items-center">
              <div className="flex-1">
                <p className="text-sm font-semibold text-gray-600 uppercase tracking-wide">Content Sections</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">
                  {isLoading ? '...' : stats.contentSections}
                </p>
                <p className="text-sm text-emerald-600 mt-2 font-medium">↗ Portfolio sections</p>
              </div>
              <div className="w-16 h-16 bg-gradient-to-br from-amber-500 to-amber-600 rounded-2xl flex items-center justify-center shadow-lg">
                <Navigation className="h-8 w-8 text-white" />
              </div>
            </div>
          </Card>
        </div>

        {/* Quick actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <Card className="p-8 bg-white border border-gray-200 rounded-xl shadow-sm">
            <h3 className="text-xl font-bold text-gray-900 mb-6">Quick Actions</h3>
            <div className="space-y-4">
              <Button 
                className="w-full justify-start bg-blue-50 text-blue-700 hover:bg-blue-100 border-blue-200 h-12 rounded-lg font-medium" 
                variant="outline"
                onClick={() => window.location.href = '/admin/case-studies'}
              >
                <FileText className="h-5 w-5 mr-3" />
                Add New Case Study
              </Button>
              <Button 
                className="w-full justify-start bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border-emerald-200 h-12 rounded-lg font-medium" 
                variant="outline"
                onClick={() => window.location.href = '/admin/chatbot'}
              >
                <MessageSquare className="h-5 w-5 mr-3" />
                Update Chatbot Knowledge
              </Button>
              <Button 
                className="w-full justify-start bg-purple-50 text-purple-700 hover:bg-purple-100 border-purple-200 h-12 rounded-lg font-medium" 
                variant="outline"
                onClick={() => window.location.href = '/admin/navigation'}
              >
                <Navigation className="h-5 w-5 mr-3" />
                Edit Navigation
              </Button>
              <Button 
                className="w-full justify-start bg-amber-50 text-amber-700 hover:bg-amber-100 border-amber-200 h-12 rounded-lg font-medium" 
                variant="outline"
                onClick={() => window.location.href = '/admin/content'}
              >
                <FileText className="h-5 w-5 mr-3" />
                Manage Content
              </Button>
            </div>
          </Card>

          <Card className="p-8 bg-white border border-gray-200 rounded-xl shadow-sm">
            <h3 className="text-xl font-bold text-gray-900 mb-6">System Overview</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-emerald-50 rounded-xl border border-emerald-100">
                <div className="flex items-center">
                  <div className="w-3 h-3 bg-emerald-500 rounded-full mr-4 shadow-sm"></div>
                  <span className="text-sm font-semibold text-emerald-900">Admin System</span>
                </div>
                <span className="text-xs text-emerald-700 font-bold bg-emerald-100 px-3 py-1 rounded-full">ONLINE</span>
              </div>
              
              <div className="flex items-center justify-between p-4 bg-blue-50 rounded-xl border border-blue-100">
                <div className="flex items-center">
                  <div className="w-3 h-3 bg-blue-500 rounded-full mr-4 shadow-sm"></div>
                  <span className="text-sm font-semibold text-blue-900">Database</span>
                </div>
                <span className="text-xs text-blue-700 font-bold bg-blue-100 px-3 py-1 rounded-full">CONNECTED</span>
              </div>
              
              <div className="flex items-center justify-between p-4 bg-purple-50 rounded-xl border border-purple-100">
                <div className="flex items-center">
                  <div className="w-3 h-3 bg-purple-500 rounded-full mr-4 shadow-sm"></div>
                  <span className="text-sm font-semibold text-purple-900">Chatbot AI</span>
                </div>
                <span className="text-xs text-purple-700 font-bold bg-purple-100 px-3 py-1 rounded-full">READY</span>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </AdminLayout>
  )
}