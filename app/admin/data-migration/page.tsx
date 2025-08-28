"use client"

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { CheckCircle, AlertCircle, Database, Download, RefreshCw } from 'lucide-react'
import { AdminLayout } from '@/components/admin/admin-layout'

interface MigrationResult {
  blogPosts: number
  caseStudies: number
  projects: number
  skillCategories: number
  tools: number
  errors: string[]
}

export default function DataMigrationPage() {
  const [isLoading, setIsLoading] = useState(false)
  const [progress, setProgress] = useState(0)
  const [results, setResults] = useState<MigrationResult | null>(null)
  const [migrationComplete, setMigrationComplete] = useState(false)

  const startMigration = async () => {
    setIsLoading(true)
    setProgress(0)
    setResults(null)
    setMigrationComplete(false)

    try {
      // Simulate progress for better UX
      const progressInterval = setInterval(() => {
        setProgress(prev => {
          if (prev < 90) return prev + 10
          return prev
        })
      }, 500)

      const response = await fetch('/api/admin/migrate-fallback-data', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        }
      })

      const data = await response.json()
      clearInterval(progressInterval)
      setProgress(100)

      if (data.success) {
        setResults(data.data)
        setMigrationComplete(true)
      } else {
        throw new Error(data.message || 'Migration failed')
      }

    } catch (error) {
      console.error('Migration error:', error)
      setResults({
        blogPosts: 0,
        caseStudies: 0,
        projects: 0,
        skillCategories: 0,
        tools: 0,
        errors: [error instanceof Error ? error.message : 'Unknown error occurred']
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <AdminLayout title="Data Migration">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header */}
        <div className="bg-gradient-to-br from-blue-50 to-indigo-100 rounded-xl p-8 shadow-lg border border-blue-200">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center">
              <Database className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-blue-900">Fallback Data Migration</h1>
              <p className="text-lg text-blue-700">Migrate all fallback content to the live database</p>
            </div>
          </div>
        </div>

        {/* Migration Content */}
        <Card className="p-8 bg-white border border-gray-200 rounded-xl shadow-sm">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Content Migration Process</h2>
          
          <div className="space-y-6">
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <AlertCircle className="h-5 w-5 text-amber-600 mt-0.5 flex-shrink-0" />
                <div>
                  <h3 className="font-semibold text-amber-800">Important Information</h3>
                  <p className="text-amber-700 mt-1">
                    This process will migrate all fallback content from your frontend into the live database. 
                    This includes blog posts, case studies, projects, skills, and tools data.
                  </p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                <h4 className="font-semibold text-blue-900">Blog Posts</h4>
                <p className="text-blue-700 text-sm">18 comprehensive marketing articles</p>
              </div>
              <div className="bg-purple-50 rounded-lg p-4 border border-purple-200">
                <h4 className="font-semibold text-purple-900">Case Studies</h4>
                <p className="text-purple-700 text-sm">14 detailed project case studies</p>
              </div>
              <div className="bg-green-50 rounded-lg p-4 border border-green-200">
                <h4 className="font-semibold text-green-900">Projects</h4>
                <p className="text-green-700 text-sm">Portfolio projects and tools</p>
              </div>
              <div className="bg-indigo-50 rounded-lg p-4 border border-indigo-200">
                <h4 className="font-semibold text-indigo-900">Skills</h4>
                <p className="text-indigo-700 text-sm">Skill categories and proficiencies</p>
              </div>
              <div className="bg-rose-50 rounded-lg p-4 border border-rose-200">
                <h4 className="font-semibold text-rose-900">Tools</h4>
                <p className="text-rose-700 text-sm">Professional tools and technologies</p>
              </div>
            </div>

            {/* Progress Section */}
            {isLoading && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900">Migration Progress</h3>
                <Progress value={progress} className="h-3" />
                <p className="text-sm text-gray-600 flex items-center gap-2">
                  <RefreshCw className="h-4 w-4 animate-spin" />
                  Migrating content to database... {progress}%
                </p>
              </div>
            )}

            {/* Results Section */}
            {results && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                  {migrationComplete && results.errors.length === 0 ? (
                    <CheckCircle className="h-5 w-5 text-green-600" />
                  ) : (
                    <AlertCircle className="h-5 w-5 text-yellow-600" />
                  )}
                  Migration Results
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-green-50 rounded-lg p-4 border border-green-200">
                    <div className="text-2xl font-bold text-green-900">{results.blogPosts}</div>
                    <div className="text-green-700">Blog Posts Migrated</div>
                  </div>
                  <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                    <div className="text-2xl font-bold text-blue-900">{results.caseStudies}</div>
                    <div className="text-blue-700">Case Studies Migrated</div>
                  </div>
                  <div className="bg-purple-50 rounded-lg p-4 border border-purple-200">
                    <div className="text-2xl font-bold text-purple-900">{results.projects}</div>
                    <div className="text-purple-700">Projects Migrated</div>
                  </div>
                  <div className="bg-indigo-50 rounded-lg p-4 border border-indigo-200">
                    <div className="text-2xl font-bold text-indigo-900">{results.skillCategories}</div>
                    <div className="text-indigo-700">Skill Categories</div>
                  </div>
                  <div className="bg-rose-50 rounded-lg p-4 border border-rose-200">
                    <div className="text-2xl font-bold text-rose-900">{results.tools}</div>
                    <div className="text-rose-700">Tools Migrated</div>
                  </div>
                </div>

                {results.errors.length > 0 && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                    <h4 className="font-semibold text-red-800 mb-2">Errors Encountered:</h4>
                    <ul className="space-y-1">
                      {results.errors.map((error, index) => (
                        <li key={index} className="text-red-700 text-sm">• {error}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {migrationComplete && results.errors.length === 0 && (
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <div className="flex items-center gap-3">
                      <CheckCircle className="h-6 w-6 text-green-600" />
                      <div>
                        <h4 className="font-semibold text-green-800">Migration Completed Successfully!</h4>
                        <p className="text-green-700">All content has been migrated to the database. You can now edit content through the admin portal.</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Action Button */}
            <div className="pt-4 border-t border-gray-200">
              <Button 
                onClick={startMigration} 
                disabled={isLoading}
                size="lg"
                className="w-full bg-blue-600 hover:bg-blue-700 text-white"
              >
                {isLoading ? (
                  <>
                    <RefreshCw className="h-5 w-5 mr-2 animate-spin" />
                    Migrating Data...
                  </>
                ) : (
                  <>
                    <Download className="h-5 w-5 mr-2" />
                    Start Data Migration
                  </>
                )}
              </Button>
            </div>
          </div>
        </Card>
      </div>
    </AdminLayout>
  )
}