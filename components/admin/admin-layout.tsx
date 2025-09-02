"use client"

import { useState, useEffect } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { AdminErrorBoundary } from '@/components/error-boundary'
import { 
  LayoutDashboard,
  FileText,
  MessageSquare,
  Navigation,
  Settings,
  Users,
  BarChart3,
  LogOut,
  User,
  Menu,
  X,
  Globe,
  FolderOpen,
  Briefcase,
  Award,
  Bot,
  PieChart,
  BookOpen,
  Wrench,
  TrendingUp,
  Database,
  Bug,
  Mail,
  Phone
} from 'lucide-react'

interface AdminUser {
  id: string
  email: string
  name: string
  role: string
}

interface AdminLayoutProps {
  children: React.ReactNode
  title?: string
}

export function AdminLayout({ children, title = "Dashboard" }: AdminLayoutProps) {
  const [user, setUser] = useState<AdminUser | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [csrfToken, setCsrfToken] = useState<string>('')
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    checkAuth()
  }, [])

  const checkAuth = async () => {
    try {
      const response = await fetch('/api/admin/auth/me', {
        credentials: 'include',
        headers: {
          'Cache-Control': 'no-cache'
        }
      })
      const data = await response.json()

      if (data.success) {
        setUser(data.user)
        // Get CSRF token from cookie
        const csrfCookie = document.cookie
          .split('; ')
          .find(row => row.startsWith('csrf-token='))
        if (csrfCookie) {
          setCsrfToken(csrfCookie.split('=')[1])
        }
      } else {
        console.warn('Admin authentication failed', response.status)
        router.push('/admin/login')
      }
    } catch (error) {
      console.error('Admin auth check failed', error)
      router.push('/admin/login')
    } finally {
      setIsLoading(false)
    }
  }

  const handleLogout = async () => {
    try {
      await fetch('/api/admin/auth/logout', { 
        method: 'POST',
        credentials: 'include',
        headers: {
          'X-CSRF-Token': csrfToken,
          'Content-Type': 'application/json'
        }
      })
      // Clear local state
      setUser(null)
      setCsrfToken('')
      router.push('/admin/login')
      router.refresh()
    } catch (error) {
      console.error('Admin logout failed', error)
      // Force redirect even if logout API fails
      setUser(null)
      setCsrfToken('')
      router.push('/admin/login')
    }
  }

  const sidebarItems = [
    { icon: LayoutDashboard, label: 'Dashboard', href: '/admin/dashboard' },
    { icon: Database, label: 'Data Migration', href: '/admin/data-migration' },
    { icon: Globe, label: 'Frontend Content', href: '/admin/frontend-content' },
    { icon: FolderOpen, label: 'Content Management', href: '/admin/content' },
    { icon: BookOpen, label: 'Blog Posts', href: '/admin/blog' },
    { icon: FileText, label: 'Projects', href: '/admin/projects' },
    { icon: Briefcase, label: 'Experience', href: '/admin/experience' },
    { icon: Award, label: 'Skills', href: '/admin/skills' },
    { icon: Wrench, label: 'Tools & Technology', href: '/admin/tools' },
    { icon: Users, label: 'Case Studies', href: '/admin/case-studies' },
    { icon: TrendingUp, label: 'Case Studies Stats', href: '/admin/case-studies-stats' },
    { icon: Bot, label: 'Chatbot', href: '/admin/chatbot' },
    { icon: Mail, label: 'Newsletter', href: '/admin/newsletter' },
    { icon: Phone, label: 'Contact Page', href: '/admin/contact' },
    { icon: Navigation, label: 'Navigation & Footer', href: '/admin/navigation' },
    { icon: PieChart, label: 'Analytics', href: '/admin/analytics' },
    { icon: Settings, label: 'Settings', href: '/admin/settings' }
  ]

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading admin dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={`fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg transform transition-transform duration-300 ease-in-out ${
        sidebarOpen ? 'translate-x-0' : '-translate-x-full'
      } lg:translate-x-0`}>
        <div className="flex items-center justify-between h-16 px-4 sm:px-6 bg-gradient-to-r from-blue-600 to-blue-700">
          <h1 className="text-lg sm:text-xl font-bold text-white truncate">Admin Portal</h1>
          <Button
            variant="ghost"
            size="sm"
            className="lg:hidden text-white hover:bg-blue-500/20 flex-shrink-0"
            onClick={() => setSidebarOpen(false)}
          >
            <X className="h-5 w-5" />
          </Button>
        </div>

        <nav className="mt-8 overflow-y-auto h-full pb-24">
          {sidebarItems.map((item) => {
            const Icon = item.icon
            const isActive = pathname === item.href
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center px-6 py-3.5 mx-2 rounded-lg text-gray-700 hover:bg-gray-50 transition-all duration-200 ${
                  isActive ? 'bg-blue-50 text-blue-700 shadow-sm border-l-4 border-blue-600 font-medium' : 'hover:text-gray-900'
                }`}
                onClick={() => setSidebarOpen(false)}
              >
                <Icon className={`h-5 w-5 mr-3 ${isActive ? 'text-blue-600' : 'text-gray-500'}`} />
                <span className="text-sm">{item.label}</span>
              </Link>
            )
          })}
        </nav>

        {/* User info */}
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t bg-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                <User className="h-4 w-4 text-white" />
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-700">{user?.name}</p>
                <p className="text-xs text-gray-500">{user?.email}</p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleLogout}
              className="text-gray-500 hover:text-red-600"
            >
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="lg:ml-64 min-h-screen">
        {/* Top bar with dashboard styling */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 shadow-sm border-b px-4 sm:px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center min-w-0 flex-1">
              <Button
                variant="ghost"
                size="sm"
                className="lg:hidden mr-2 sm:mr-4 text-white hover:bg-blue-500/20 flex-shrink-0"
                onClick={() => setSidebarOpen(true)}
              >
                <Menu className="h-5 w-5" />
              </Button>
              <h2 className="text-lg sm:text-xl lg:text-2xl font-bold text-white truncate">{title}</h2>
            </div>
            <div className="flex items-center space-x-2 sm:space-x-4 flex-shrink-0">
              <span className="text-xs sm:text-sm text-blue-100 hidden sm:block">Welcome back, {user?.name}</span>
              <span className="text-xs sm:text-sm text-blue-100 sm:hidden">Hi, {user?.name?.split(' ')[0]}</span>
            </div>
          </div>
        </div>

        {/* Page content with proper background */}
        <div className="bg-gray-50 min-h-screen p-4 sm:p-6 lg:p-8">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </div>
      </div>
    </div>
  )
}