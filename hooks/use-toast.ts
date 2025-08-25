"use client"

import { toast as sonnerToast } from 'sonner'

interface ToastData {
  title?: string
  description?: string
  variant?: 'default' | 'destructive'
}

function toast({ title, description, variant = 'default' }: ToastData) {
  const message = title ? `${title}${description ? ': ' + description : ''}` : description || ''
  
  if (variant === 'destructive') {
    sonnerToast.error(title || 'Error', {
      description: description,
    })
  } else {
    sonnerToast.success(title || 'Success', {
      description: description,
    })
  }
  
  // Return a simple object for compatibility
  return {
    id: Date.now().toString(),
    dismiss: () => sonnerToast.dismiss(),
    update: () => {}
  }
}

// Hook that uses sonner for toast notifications
function useToast() {
  return {
    toast,
    dismiss: () => sonnerToast.dismiss(),
    toasts: []
  }
}

export { useToast, toast }