'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Book,
  Code,
  Copy,
  ExternalLink,
  Globe,
  Key,
  Lock,
  Server,
  Zap
} from 'lucide-react'

interface APIEndpoint {
  method: 'GET' | 'POST' | 'PUT' | 'DELETE'
  path: string
  description: string
  auth?: 'admin' | 'public'
  parameters?: Array<{
    name: string
    type: string
    required: boolean
    description: string
    location: 'query' | 'body' | 'path'
  }>
  requestBody?: {
    contentType: string
    schema: Record<string, any>
    example?: any
  }
  responses: Array<{
    status: number
    description: string
    schema?: Record<string, any>
    example?: any
  }>
  tags: string[]
}

interface DocsData {
  title: string
  version: string
  baseUrl: string
  endpoints: APIEndpoint[]
  formats: {
    json: string
    openapi: string
    html: string
  }
}

export function APIDocumentation() {
  const [docs, setDocs] = useState<DocsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [selectedTag, setSelectedTag] = useState('all')
  const [copiedCode, setCopiedCode] = useState('')

  useEffect(() => {
    fetchDocs()
  }, [])

  const fetchDocs = async () => {
    try {
      const response = await fetch('/api/docs')
      const data = await response.json()
      
      if (data.success) {
        setDocs(data.data)
      }
    } catch (error) {
      console.error('Failed to fetch API documentation:', error)
    } finally {
      setLoading(false)
    }
  }

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text)
    setCopiedCode(id)
    setTimeout(() => setCopiedCode(''), 2000)
  }

  const getMethodColor = (method: string) => {
    switch (method) {
      case 'GET':
        return 'bg-green-100 text-green-800 border-green-200'
      case 'POST':
        return 'bg-blue-100 text-blue-800 border-blue-200'
      case 'PUT':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'DELETE':
        return 'bg-red-100 text-red-800 border-red-200'
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const getAuthIcon = (auth?: string) => {
    if (auth === 'admin') {
      return <Lock className="h-4 w-4 text-red-500" />
    }
    return <Globe className="h-4 w-4 text-green-500" />
  }

  const getAllTags = () => {
    if (!docs) return []
    const tags = new Set<string>()
    docs.endpoints.forEach(endpoint => {
      endpoint.tags.forEach(tag => tags.add(tag))
    })
    return Array.from(tags).sort()
  }

  const getFilteredEndpoints = () => {
    if (!docs) return []
    if (selectedTag === 'all') return docs.endpoints
    return docs.endpoints.filter(endpoint => endpoint.tags.includes(selectedTag))
  }

  const generateCurlExample = (endpoint: APIEndpoint) => {
    let curl = `curl -X ${endpoint.method} "${docs?.baseUrl}${endpoint.path}"`
    
    if (endpoint.auth === 'admin') {
      curl += ' \\\n  --cookie "auth-token=your-jwt-token"'
    }
    
    if (endpoint.requestBody) {
      curl += ' \\\n  -H "Content-Type: application/json"'
      curl += ' \\\n  -d \'' + JSON.stringify(endpoint.requestBody.example, null, 2) + '\''
    }
    
    return curl
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <Book className="h-8 w-8 animate-pulse mx-auto mb-2" />
          <p>Loading API documentation...</p>
        </div>
      </div>
    )
  }

  if (!docs) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">Failed to load API documentation</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">{docs.title}</h1>
          <p className="text-gray-600">Version {docs.version} • Comprehensive REST API</p>
        </div>
        <div className="flex gap-2">
          <Button
            onClick={() => window.open(docs.formats.html, '_blank')}
            variant="outline"
          >
            <ExternalLink className="h-4 w-4 mr-2" />
            Swagger UI
          </Button>
          <Button
            onClick={() => copyToClipboard(docs.baseUrl, 'baseUrl')}
            variant="outline"
          >
            <Copy className="h-4 w-4 mr-2" />
            {copiedCode === 'baseUrl' ? 'Copied!' : 'Base URL'}
          </Button>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Endpoints</p>
                <p className="text-2xl font-bold mt-2">{docs.endpoints.length}</p>
              </div>
              <Server className="h-8 w-8 text-gray-400" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Public APIs</p>
                <p className="text-2xl font-bold mt-2">
                  {docs.endpoints.filter(e => e.auth === 'public').length}
                </p>
              </div>
              <Globe className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Admin APIs</p>
                <p className="text-2xl font-bold mt-2">
                  {docs.endpoints.filter(e => e.auth === 'admin').length}
                </p>
              </div>
              <Lock className="h-8 w-8 text-red-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Categories</p>
                <p className="text-2xl font-bold mt-2">{getAllTags().length}</p>
              </div>
              <Book className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tag Filter */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5" />
            API Endpoints
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2 mb-6">
            <Button
              variant={selectedTag === 'all' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedTag('all')}
            >
              All ({docs.endpoints.length})
            </Button>
            {getAllTags().map(tag => (
              <Button
                key={tag}
                variant={selectedTag === tag ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedTag(tag)}
              >
                {tag} ({docs.endpoints.filter(e => e.tags.includes(tag)).length})
              </Button>
            ))}
          </div>

          <div className="space-y-4">
            {getFilteredEndpoints().map((endpoint, index) => (
              <Card key={index} className="border-l-4 border-l-blue-500">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Badge className={`${getMethodColor(endpoint.method)} font-mono text-xs`}>
                        {endpoint.method}
                      </Badge>
                      <code className="text-sm font-mono bg-gray-100 px-2 py-1 rounded">
                        {endpoint.path}
                      </code>
                      {getAuthIcon(endpoint.auth)}
                    </div>
                    <div className="flex items-center gap-1">
                      {endpoint.tags.map(tag => (
                        <Badge key={tag} variant="secondary" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  <p className="text-gray-600">{endpoint.description}</p>
                </CardHeader>

                <CardContent>
                  <Tabs defaultValue="overview">
                    <TabsList className="mb-4">
                      <TabsTrigger value="overview">Overview</TabsTrigger>
                      <TabsTrigger value="request">Request</TabsTrigger>
                      <TabsTrigger value="response">Response</TabsTrigger>
                      <TabsTrigger value="example">cURL</TabsTrigger>
                    </TabsList>

                    <TabsContent value="overview">
                      <div className="space-y-4">
                        {endpoint.parameters && (
                          <div>
                            <h4 className="font-semibold mb-2">Parameters</h4>
                            <div className="space-y-2">
                              {endpoint.parameters.map((param, i) => (
                                <div key={i} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                                  <div>
                                    <code className="font-mono text-sm">{param.name}</code>
                                    {param.required && (
                                      <Badge variant="destructive" className="ml-2 text-xs">required</Badge>
                                    )}
                                    <p className="text-sm text-gray-600">{param.description}</p>
                                  </div>
                                  <Badge variant="outline" className="text-xs">
                                    {param.type}
                                  </Badge>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        <div>
                          <h4 className="font-semibold mb-2">Authentication</h4>
                          <div className="flex items-center gap-2 p-2 bg-gray-50 rounded">
                            {getAuthIcon(endpoint.auth)}
                            <span className="text-sm">
                              {endpoint.auth === 'admin' ? 'Admin authentication required' : 'Public endpoint'}
                            </span>
                          </div>
                        </div>
                      </div>
                    </TabsContent>

                    <TabsContent value="request">
                      {endpoint.requestBody ? (
                        <div className="space-y-4">
                          <div>
                            <h4 className="font-semibold mb-2">Request Body</h4>
                            <pre className="bg-gray-900 text-gray-100 p-4 rounded text-sm overflow-x-auto">
                              {JSON.stringify(endpoint.requestBody.example, null, 2)}
                            </pre>
                          </div>
                        </div>
                      ) : (
                        <p className="text-gray-500">No request body required</p>
                      )}
                    </TabsContent>

                    <TabsContent value="response">
                      <div className="space-y-4">
                        {endpoint.responses.map((response, i) => (
                          <div key={i}>
                            <h4 className="font-semibold mb-2 flex items-center gap-2">
                              <Badge
                                variant={response.status < 300 ? 'default' : response.status < 400 ? 'secondary' : 'destructive'}
                              >
                                {response.status}
                              </Badge>
                              {response.description}
                            </h4>
                            {response.example && (
                              <pre className="bg-gray-900 text-gray-100 p-4 rounded text-sm overflow-x-auto">
                                {JSON.stringify(response.example, null, 2)}
                              </pre>
                            )}
                          </div>
                        ))}
                      </div>
                    </TabsContent>

                    <TabsContent value="example">
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-semibold">cURL Example</h4>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => copyToClipboard(generateCurlExample(endpoint), `curl-${index}`)}
                          >
                            <Copy className="h-4 w-4 mr-2" />
                            {copiedCode === `curl-${index}` ? 'Copied!' : 'Copy'}
                          </Button>
                        </div>
                        <pre className="bg-gray-900 text-gray-100 p-4 rounded text-sm overflow-x-auto">
                          {generateCurlExample(endpoint)}
                        </pre>
                      </div>
                    </TabsContent>
                  </Tabs>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}