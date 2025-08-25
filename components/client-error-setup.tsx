'use client'

import { useEffect } from 'react'
import { setupClientErrorHandling } from '@/lib/error-handler'

export function ClientErrorSetup() {
  useEffect(() => {
    setupClientErrorHandling()
  }, [])

  return null
}