/**
 * Dynamic imports for code splitting and lazy loading
 * Reduces initial bundle size by loading components on demand
 */

import dynamic from 'next/dynamic'

// Admin components (heavy, load on demand)
export const DynamicTinyMCEEditor = dynamic(
  () => import('@/components/ui/wysiwyg-editor').then(mod => ({ default: mod.WYSIWYGEditor })),
  {
    ssr: false,
    loading: () => (
      <div className="min-h-[300px] bg-muted animate-pulse rounded-md flex items-center justify-center">
        <div className="text-muted-foreground">Loading editor...</div>
      </div>
    ),
  }
)

export const DynamicImageUpload = dynamic(
  () => import('@/components/ui/image-upload').then(mod => ({ default: mod.ImageUpload })),
  {
    ssr: false,
    loading: () => (
      <div className="h-32 bg-muted animate-pulse rounded-md flex items-center justify-center">
        <div className="text-muted-foreground">Loading uploader...</div>
      </div>
    ),
  }
)

export const DynamicDataTable = dynamic(
  () => import('@/components/ui/data-table'),
  {
    ssr: false,
    loading: () => (
      <div className="h-64 bg-muted animate-pulse rounded-md flex items-center justify-center">
        <div className="text-muted-foreground">Loading table...</div>
      </div>
    ),
  }
)

// Chart components (load when needed)
export const DynamicChart = dynamic(
  () => import('@/components/ui/chart'),
  {
    ssr: false,
    loading: () => (
      <div className="h-48 bg-muted animate-pulse rounded-md flex items-center justify-center">
        <div className="text-muted-foreground">Loading chart...</div>
      </div>
    ),
  }
)

// Search component (load when search is triggered)
export const DynamicSearch = dynamic(
  () => import('@/components/ui/search').then(mod => ({ default: mod.SearchDialog })),
  {
    ssr: false,
    loading: () => (
      <div className="fixed inset-0 bg-black/50 flex items-start justify-center pt-20 z-50">
        <div className="bg-background p-6 rounded-lg shadow-lg">
          <div className="animate-pulse">Loading search...</div>
        </div>
      </div>
    ),
  }
)

// Analytics dashboard (admin only)
export const DynamicAnalyticsDashboard = dynamic(
  () => import('@/components/analytics-dashboard'),
  {
    ssr: false,
    loading: () => (
      <div className="grid gap-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="h-32 bg-muted animate-pulse rounded-md" />
        ))}
      </div>
    ),
  }
)

// Contact form with validation (load when needed)
export const DynamicContactForm = dynamic(
  () => import('@/components/contact-form'),
  {
    ssr: false,
    loading: () => (
      <div className="space-y-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-12 bg-muted animate-pulse rounded-md" />
        ))}
        <div className="h-8 bg-muted animate-pulse rounded-md w-32" />
      </div>
    ),
  }
)

// Comments section (load when user scrolls to it)
export const DynamicComments = dynamic(
  () => import('@/components/comments-section'),
  {
    ssr: false,
    loading: () => (
      <div className="space-y-4">
        <div className="h-6 bg-muted animate-pulse rounded w-32" />
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="border rounded-lg p-4 space-y-3">
            <div className="h-4 bg-muted animate-pulse rounded w-24" />
            <div className="space-y-2">
              <div className="h-3 bg-muted animate-pulse rounded" />
              <div className="h-3 bg-muted animate-pulse rounded w-4/5" />
            </div>
          </div>
        ))}
      </div>
    ),
  }
)

// Code syntax highlighter (load when needed)
export const DynamicCodeBlock = dynamic(
  () => import('@/components/ui/code-block'),
  {
    ssr: false,
    loading: () => (
      <div className="bg-muted rounded-md p-4">
        <div className="font-mono text-sm animate-pulse">
          Loading code block...
        </div>
      </div>
    ),
  }
)

// PDF viewer (load when needed)
export const DynamicPDFViewer = dynamic(
  () => import('@/components/ui/pdf-viewer'),
  {
    ssr: false,
    loading: () => (
      <div className="aspect-video bg-muted animate-pulse rounded-md flex items-center justify-center">
        <div className="text-muted-foreground">Loading PDF viewer...</div>
      </div>
    ),
  }
)

// Calendar component (admin scheduling)
export const DynamicCalendar = dynamic(
  () => import('@/components/ui/calendar'),
  {
    ssr: false,
    loading: () => (
      <div className="h-80 bg-muted animate-pulse rounded-md flex items-center justify-center">
        <div className="text-muted-foreground">Loading calendar...</div>
      </div>
    ),
  }
)

// Performance monitor (development only)
export const DynamicPerformanceMonitor = dynamic(
  () => import('@/components/performance-monitor').then(mod => ({ default: mod.PerformanceMonitor })),
  {
    ssr: false,
  }
)

// Chatbot (if implemented)
export const DynamicChatbot = dynamic(
  () => import('@/components/chatbot'),
  {
    ssr: false,
    loading: () => (
      <div className="fixed bottom-4 right-4 w-12 h-12 bg-primary rounded-full animate-pulse" />
    ),
  }
)

// Newsletter signup
export const DynamicNewsletterSignup = dynamic(
  () => import('@/components/newsletter-signup'),
  {
    ssr: false,
    loading: () => (
      <div className="space-y-3">
        <div className="h-4 bg-muted animate-pulse rounded w-3/4" />
        <div className="flex gap-2">
          <div className="flex-1 h-10 bg-muted animate-pulse rounded" />
          <div className="w-20 h-10 bg-muted animate-pulse rounded" />
        </div>
      </div>
    ),
  }
)

// Social share buttons
export const DynamicSocialShare = dynamic(
  () => import('@/components/social-share'),
  {
    ssr: false,
    loading: () => (
      <div className="flex gap-2">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="w-10 h-10 bg-muted animate-pulse rounded" />
        ))}
      </div>
    ),
  }
)

// Theme customizer (admin)
export const DynamicThemeCustomizer = dynamic(
  () => import('@/components/theme-customizer'),
  {
    ssr: false,
    loading: () => (
      <div className="space-y-4">
        <div className="h-6 bg-muted animate-pulse rounded w-32" />
        <div className="grid grid-cols-3 gap-2">
          {Array.from({ length: 9 }).map((_, i) => (
            <div key={i} className="h-8 bg-muted animate-pulse rounded" />
          ))}
        </div>
      </div>
    ),
  }
)

// Export all dynamic imports for easy use
export const DynamicComponents = {
  TinyMCEEditor: DynamicTinyMCEEditor,
  ImageUpload: DynamicImageUpload,
  DataTable: DynamicDataTable,
  Chart: DynamicChart,
  Search: DynamicSearch,
  AnalyticsDashboard: DynamicAnalyticsDashboard,
  ContactForm: DynamicContactForm,
  Comments: DynamicComments,
  CodeBlock: DynamicCodeBlock,
  PDFViewer: DynamicPDFViewer,
  Calendar: DynamicCalendar,
  PerformanceMonitor: DynamicPerformanceMonitor,
  Chatbot: DynamicChatbot,
  NewsletterSignup: DynamicNewsletterSignup,
  SocialShare: DynamicSocialShare,
  ThemeCustomizer: DynamicThemeCustomizer,
} as const

// Utility function to preload components
export function preloadComponent(componentName: keyof typeof DynamicComponents) {
  const component = DynamicComponents[componentName]
  
  // Preload the component
  if (typeof window !== 'undefined') {
    component.preload?.()
  }
}

// Preload critical components on idle
export function preloadCriticalComponents() {
  if (typeof window !== 'undefined' && 'requestIdleCallback' in window) {
    requestIdleCallback(() => {
      preloadComponent('Search')
      preloadComponent('ContactForm')
    })
  }
}