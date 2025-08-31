"use client"

import { Loader2 } from "lucide-react"
import { AdminLayout } from "@/components/admin/admin-layout"

interface AdminLoadingProps {
  title?: string
  message?: string
  height?: string
}

export function AdminLoading({ 
  title = "Loading", 
  message = "Loading content...", 
  height = "h-64" 
}: AdminLoadingProps) {
  return (
    <AdminLayout title={title}>
      <div className={`flex items-center justify-center ${height}`}>
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-primary" />
          <p className="text-muted-foreground">{message}</p>
        </div>
      </div>
    </AdminLayout>
  )
}

// Inline loading spinner for sections within admin pages
export function AdminSpinner({ 
  size = "sm", 
  message = "Loading..." 
}: { 
  size?: "sm" | "md" | "lg"
  message?: string 
}) {
  const sizeClasses = {
    sm: "w-4 h-4",
    md: "w-6 h-6", 
    lg: "w-8 h-8"
  }

  return (
    <div className="flex items-center justify-center p-4">
      <div className="text-center">
        <Loader2 className={`${sizeClasses[size]} animate-spin mx-auto mb-2 text-primary`} />
        <p className="text-sm text-muted-foreground">{message}</p>
      </div>
    </div>
  )
}