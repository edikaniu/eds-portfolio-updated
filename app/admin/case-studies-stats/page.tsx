"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Save, RefreshCw, TrendingUp, Users, DollarSign, BarChart3 } from "lucide-react"
import { FormInput } from "@/components/ui/form-field"
import { AdminLayout } from '@/components/admin/admin-layout'

interface CaseStudiesStats {
  usersScaled: string
  subscribersGrowth: string
  budgetScaled: string
  roas: string
}

export default function CaseStudiesStatsPage() {
  const [stats, setStats] = useState<CaseStudiesStats>({
    usersScaled: '',
    subscribersGrowth: '',
    budgetScaled: '',
    roas: ''
  })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  const fetchStats = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/admin/case-studies-stats')
      if (response.ok) {
        const data = await response.json()
        if (data.success) {
          setStats(data.data)
        } else {
          setMessage({ type: 'error', text: data.message || 'Failed to fetch statistics' })
        }
      } else {
        setMessage({ type: 'error', text: 'Failed to fetch statistics' })
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Error fetching statistics' })
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    try {
      setSaving(true)
      setMessage(null)

      const response = await fetch('/api/admin/case-studies-stats', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(stats),
      })

      const data = await response.json()

      if (data.success) {
        setMessage({ type: 'success', text: 'Statistics updated successfully!' })
      } else {
        setMessage({ type: 'error', text: data.message || 'Failed to update statistics' })
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Error updating statistics' })
    } finally {
      setSaving(false)
    }
  }

  const handleInputChange = (field: keyof CaseStudiesStats, value: string) => {
    setStats(prev => ({ ...prev, [field]: value }))
  }

  useEffect(() => {
    fetchStats()
  }, [])

  useEffect(() => {
    if (message) {
      const timer = setTimeout(() => setMessage(null), 5000)
      return () => clearTimeout(timer)
    }
  }, [message])

  if (loading) {
    return (
      <AdminLayout title="Case Studies Statistics">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="w-8 h-8 border-4 border-rose-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600">Loading statistics...</p>
          </div>
        </div>
      </AdminLayout>
    )
  }

  return (
    <AdminLayout title="Case Studies Statistics">
      <div className="space-y-8">
        {/* Header */}
        <div className="bg-gradient-to-br from-rose-50 to-rose-100 rounded-xl p-8 shadow-lg border border-rose-200">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
            <div>
              <h1 className="text-3xl font-bold text-rose-900 mb-3">Case Studies Statistics</h1>
              <p className="text-lg text-rose-700">
                Manage the Combined Impact statistics displayed in the case studies section
              </p>
            </div>
            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={fetchStats}
                disabled={loading}
                className="h-11 px-6 rounded-lg border-rose-300 text-rose-700 hover:bg-rose-50 font-medium"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh
              </Button>
              <Button 
                onClick={handleSave} 
                disabled={saving}
                className="h-11 px-6 rounded-lg bg-gradient-to-r from-rose-600 to-rose-700 hover:from-rose-700 hover:to-rose-800 text-white shadow-lg hover:shadow-xl transition-all duration-200 font-medium"
              >
                <Save className="h-4 w-4 mr-2" />
                {saving ? 'Saving...' : 'Save Changes'}
              </Button>
            </div>
          </div>
        </div>

        {/* Status Message */}
        {message && (
          <Card className={`shadow-lg border-0 rounded-xl overflow-hidden ${
            message.type === 'success' 
              ? 'bg-emerald-50 border-emerald-200' 
              : 'bg-red-50 border-red-200'
          }`}>
            <CardContent className="p-6">
              <div className={`text-center font-medium ${
                message.type === 'success' ? 'text-emerald-800' : 'text-red-800'
              }`}>
                {message.text}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Statistics Cards */}
        <div className="grid md:grid-cols-2 gap-8">
          {/* Users Scaled */}
          <Card className="shadow-lg border-0 bg-white rounded-xl overflow-hidden">
            <CardHeader className="bg-gradient-to-r from-blue-50 to-blue-100 border-b border-blue-200 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg">
                  <Users className="h-6 w-6 text-white" />
                </div>
                <div>
                  <CardTitle className="text-xl font-bold text-blue-900">Users Scaled</CardTitle>
                  <CardDescription className="text-blue-700">
                    Total number of users across all growth campaigns
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <FormInput
                id="usersScaled"
                name="usersScaled"
                label="Users Scaled"
                value={stats.usersScaled}
                onChange={(e) => handleInputChange('usersScaled', e.target.value)}
                placeholder="e.g., 200k+"
                className="text-lg font-semibold"
              />
            </CardContent>
          </Card>

          {/* Subscribers Growth */}
          <Card className="shadow-lg border-0 bg-white rounded-xl overflow-hidden">
            <CardHeader className="bg-gradient-to-r from-emerald-50 to-emerald-100 border-b border-emerald-200 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-xl flex items-center justify-center shadow-lg">
                  <TrendingUp className="h-6 w-6 text-white" />
                </div>
                <div>
                  <CardTitle className="text-xl font-bold text-emerald-900">Subscribers Growth</CardTitle>
                  <CardDescription className="text-emerald-700">
                    Peak growth percentage achieved in email campaigns
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <FormInput
                id="subscribersGrowth"
                name="subscribersGrowth"
                label="Subscribers Growth"
                value={stats.subscribersGrowth}
                onChange={(e) => handleInputChange('subscribersGrowth', e.target.value)}
                placeholder="e.g., 733%"
                className="text-lg font-semibold"
              />
            </CardContent>
          </Card>

          {/* Budget Scaled */}
          <Card className="shadow-lg border-0 bg-white rounded-xl overflow-hidden">
            <CardHeader className="bg-gradient-to-r from-green-50 to-green-100 border-b border-green-200 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center shadow-lg">
                  <DollarSign className="h-6 w-6 text-white" />
                </div>
                <div>
                  <CardTitle className="text-xl font-bold text-green-900">Budget Scaled</CardTitle>
                  <CardDescription className="text-green-700">
                    Total advertising budget managed and scaled
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <FormInput
                id="budgetScaled"
                name="budgetScaled"
                label="Budget Scaled"
                value={stats.budgetScaled}
                onChange={(e) => handleInputChange('budgetScaled', e.target.value)}
                placeholder="e.g., $500k+"
                className="text-lg font-semibold"
              />
            </CardContent>
          </Card>

          {/* ROAS */}
          <Card className="shadow-lg border-0 bg-white rounded-xl overflow-hidden">
            <CardHeader className="bg-gradient-to-r from-orange-50 to-orange-100 border-b border-orange-200 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl flex items-center justify-center shadow-lg">
                  <BarChart3 className="h-6 w-6 text-white" />
                </div>
                <div>
                  <CardTitle className="text-xl font-bold text-orange-900">ROAS (Return on Ad Spend)</CardTitle>
                  <CardDescription className="text-orange-700">
                    Best return on advertising spend achieved
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <FormInput
                id="roas"
                name="roas"
                label="ROAS"
                value={stats.roas}
                onChange={(e) => handleInputChange('roas', e.target.value)}
                placeholder="e.g., 5x"
                className="text-lg font-semibold"
              />
            </CardContent>
          </Card>
        </div>

        {/* Preview Section */}
        <Card className="shadow-lg border-0 bg-white rounded-xl overflow-hidden">
          <CardHeader className="bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200 pb-4">
            <CardTitle className="text-xl font-bold text-gray-900 flex items-center gap-3">
              <BarChart3 className="h-6 w-6 text-gray-600" />
              Live Preview
            </CardTitle>
            <CardDescription className="text-gray-700">
              This is how the statistics will appear in the case studies section
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="p-8 bg-gradient-to-r from-blue-50 via-purple-50 to-green-50 rounded-lg border border-gray-200">
              <div className="text-center mb-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-2">Combined Impact</h3>
                <p className="text-gray-600">Measurable results across all growth initiatives</p>
              </div>
              <div className="grid md:grid-cols-4 gap-6">
                <div className="text-center">
                  <div className="text-3xl font-bold text-blue-600 mb-2">{stats.usersScaled || '200k+'}</div>
                  <div className="text-sm text-gray-600">Users Scaled</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-purple-600 mb-2">{stats.subscribersGrowth || '733%'}</div>
                  <div className="text-sm text-gray-600">Subscribers Growth</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-green-600 mb-2">{stats.budgetScaled || '$500k+'}</div>
                  <div className="text-sm text-gray-600">Budget Scaled</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-orange-600 mb-2">{stats.roas || '5x'}</div>
                  <div className="text-sm text-gray-600">ROAS</div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  )
}