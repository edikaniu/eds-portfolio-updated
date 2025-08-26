"use client"

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'

export default function AdminDebugPage() {
  const [debugInfo, setDebugInfo] = useState<any>(null)
  const [loading, setLoading] = useState(false)

  const checkAuth = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/admin/debug-auth', {
        credentials: 'include',
        headers: {
          'Cache-Control': 'no-cache'
        }
      })
      const data = await response.json()
      setDebugInfo(data)
      console.log('Debug info:', data)
    } catch (error) {
      console.error('Debug check failed:', error)
      setDebugInfo({ error: error.message })
    } finally {
      setLoading(false)
    }
  }

  const testMeEndpoint = async () => {
    try {
      const response = await fetch('/api/admin/auth/me', {
        credentials: 'include'
      })
      const data = await response.json()
      console.log('Me endpoint result:', data)
      alert(`Me endpoint: ${JSON.stringify(data, null, 2)}`)
    } catch (error) {
      console.error('Me endpoint failed:', error)
      alert(`Me endpoint error: ${error.message}`)
    }
  }

  const clearCookies = () => {
    document.cookie.split(";").forEach(function(c) { 
      document.cookie = c.replace(/^ +/, "").replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/"); 
    })
    alert('Cookies cleared')
  }

  useEffect(() => {
    checkAuth()
  }, [])

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold mb-8">Admin Authentication Debug</h1>
        
        <div className="grid gap-4 mb-8">
          <Button onClick={checkAuth} disabled={loading}>
            {loading ? 'Checking...' : 'Check Auth Status'}
          </Button>
          
          <Button onClick={testMeEndpoint} variant="outline">
            Test /api/admin/auth/me
          </Button>
          
          <Button onClick={clearCookies} variant="destructive">
            Clear All Cookies
          </Button>
        </div>

        {debugInfo && (
          <Card className="p-6">
            <h2 className="text-lg font-semibold mb-4">Debug Information</h2>
            <pre className="bg-gray-100 p-4 rounded text-sm overflow-x-auto">
              {JSON.stringify(debugInfo, null, 2)}
            </pre>
          </Card>
        )}

        <div className="mt-8 p-4 bg-blue-50 rounded">
          <h3 className="font-semibold mb-2">Current cookies:</h3>
          <p className="text-sm font-mono">{typeof window !== 'undefined' ? document.cookie : 'Loading...'}</p>
        </div>
      </div>
    </div>
  )
}