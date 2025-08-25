import type { Metadata } from 'next'
import { Toaster } from 'sonner'

export const metadata: Metadata = {
  title: 'Admin Portal - Edikan Udoibuot',
  description: 'Portfolio management system',
  robots: 'noindex,nofollow'
}

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="admin-layout">
      {children}
      <Toaster 
        position="bottom-right" 
        toastOptions={{
          style: { background: 'white' },
          className: 'border border-gray-200 shadow-lg',
        }}
      />
    </div>
  )
}