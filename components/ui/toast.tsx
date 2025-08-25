"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

// Simple toast implementation without dependencies
export interface ToastProps {
  id: string
  title?: React.ReactNode
  description?: React.ReactNode
  variant?: 'default' | 'destructive'
  duration?: number
}

export function ToastViewport({ children }: { children: React.ReactNode }) {
  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2">
      {children}
    </div>
  )
}

export function Toast({ 
  id, 
  title, 
  description, 
  variant = 'default',
  onClose 
}: ToastProps & { onClose: (id: string) => void }) {
  const [isVisible, setIsVisible] = React.useState(true)

  React.useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false)
      setTimeout(() => onClose(id), 300)
    }, 5000)

    return () => clearTimeout(timer)
  }, [id, onClose])

  if (!isVisible) return null

  return (
    <div
      className={cn(
        "pointer-events-auto relative flex w-full max-w-md items-center justify-between space-x-4 overflow-hidden rounded-md border p-4 shadow-lg transition-all",
        {
          "border-border bg-background text-foreground": variant === 'default',
          "border-red-500 bg-red-50 text-red-900": variant === 'destructive',
        }
      )}
    >
      <div className="flex-1">
        {title && <div className="text-sm font-semibold">{title}</div>}
        {description && <div className="text-sm opacity-90">{description}</div>}
      </div>
      <button
        onClick={() => {
          setIsVisible(false)
          setTimeout(() => onClose(id), 300)
        }}
        className="ml-2 text-sm opacity-50 hover:opacity-100"
      >
        ×
      </button>
    </div>
  )
}