"use client"

import { useState, useEffect, useRef } from "react"
import { Search, X, Loader2, FileText, Briefcase, Award, User } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { logger } from "@/lib/logger"
import Link from "next/link"

interface SearchResult {
  id: string
  title: string
  content: string
  type: 'blog' | 'project' | 'case-study' | 'experience'
  slug?: string
  category?: string
  excerpt?: string
  url: string
  relevanceScore: number
}

interface SearchResponse {
  success: boolean
  results: SearchResult[]
  totalResults: number
  query: string
  suggestions?: string[]
}

export function SearchDialog({ 
  isOpen, 
  onClose 
}: { 
  isOpen: boolean
  onClose: () => void 
}) {
  const [query, setQuery] = useState("")
  const [results, setResults] = useState<SearchResult[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [totalResults, setTotalResults] = useState(0)
  const [suggestions, setSuggestions] = useState<string[]>([])
  const [selectedIndex, setSelectedIndex] = useState(-1)
  const inputRef = useRef<HTMLInputElement>(null)
  const resultsRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus()
    }
  }, [isOpen])

  useEffect(() => {
    if (query.trim().length >= 2) {
      const debounceTimer = setTimeout(() => {
        performSearch(query.trim())
      }, 300)
      
      return () => clearTimeout(debounceTimer)
    } else {
      setResults([])
      setTotalResults(0)
      setSuggestions([])
    }
  }, [query])

  const performSearch = async (searchQuery: string) => {
    if (!searchQuery.trim()) return

    setIsLoading(true)
    try {
      const response = await fetch(`/api/search?q=${encodeURIComponent(searchQuery)}&limit=20`)
      const data: SearchResponse = await response.json()
      
      if (data.success) {
        setResults(data.results)
        setTotalResults(data.totalResults)
        setSuggestions(data.suggestions || [])
      } else {
        logger.error('Search API failed', { query: searchQuery, response: data })
        setResults([])
        setTotalResults(0)
      }
    } catch (error) {
      logger.error('Search request failed', error, { query: searchQuery })
      setResults([])
      setTotalResults(0)
    } finally {
      setIsLoading(false)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      onClose()
    } else if (e.key === 'ArrowDown') {
      e.preventDefault()
      setSelectedIndex(prev => {
        const newIndex = Math.min(prev + 1, results.length - 1)
        // Scroll selected item into view
        setTimeout(() => {
          const element = resultsRef.current?.querySelector(`[data-index="${newIndex}"]`)
          if (element) {
            element.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
          }
        }, 0)
        return newIndex
      })
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setSelectedIndex(prev => {
        const newIndex = Math.max(prev - 1, -1)
        // Scroll selected item into view
        setTimeout(() => {
          if (newIndex >= 0) {
            const element = resultsRef.current?.querySelector(`[data-index="${newIndex}"]`)
            if (element) {
              element.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
            }
          } else {
            // Scroll to top if nothing selected
            resultsRef.current?.scrollTo({ top: 0, behavior: 'smooth' })
          }
        }, 0)
        return newIndex
      })
    } else if (e.key === 'Enter' && selectedIndex >= 0) {
      e.preventDefault()
      const selectedResult = results[selectedIndex]
      window.open(selectedResult.url, '_blank')
      onClose()
    }
  }

  const clearSearch = () => {
    setQuery("")
    setResults([])
    setTotalResults(0)
    setSuggestions([])
    setSelectedIndex(-1)
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'blog': return <FileText className="h-4 w-4" />
      case 'project': return <Briefcase className="h-4 w-4" />
      case 'case-study': return <Award className="h-4 w-4" />
      case 'experience': return <User className="h-4 w-4" />
      default: return <Search className="h-4 w-4" />
    }
  }

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'blog': return 'bg-blue-100 text-blue-700'
      case 'project': return 'bg-green-100 text-green-700'
      case 'case-study': return 'bg-purple-100 text-purple-700'
      case 'experience': return 'bg-orange-100 text-orange-700'
      default: return 'bg-gray-100 text-gray-700'
    }
  }

  const highlightText = (text: string, query: string) => {
    if (!query.trim()) return text
    
    const regex = new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi')
    const parts = text.split(regex)
    
    return parts.map((part, index) => 
      regex.test(part) ? (
        <mark key={index} className="bg-yellow-200 text-yellow-900 rounded px-1">
          {part}
        </mark>
      ) : part
    )
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-start justify-center pt-4 sm:pt-20">
      <Card className="w-full max-w-2xl mx-2 sm:mx-4 h-[90vh] sm:h-[70vh] max-h-[90vh] sm:max-h-[70vh] flex flex-col">
        {/* Search Header */}
        <div className="flex items-center gap-2 sm:gap-3 p-3 sm:p-4 border-b">
          <Search className="h-5 w-5 text-muted-foreground hidden sm:block" />
          <div className="relative flex-1">
            <Input
              ref={inputRef}
              type="text"
              placeholder="Search content..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={handleKeyDown}
              className="text-base sm:text-base text-sm"
              autoComplete="off"
              spellCheck={false}
            />
            {query && (
              <Button
                variant="ghost"
                size="sm"
                className="absolute right-2 top-1/2 -translate-y-1/2 h-6 w-6 p-0 touch-target-44"
                onClick={clearSearch}
              >
                <X className="h-3 w-3" />
              </Button>
            )}
          </div>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={onClose}
            className="touch-target-44 p-2"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Search Results */}
        <div className="flex-1 min-h-0 flex flex-col">
          {isLoading ? (
            <div className="flex items-center justify-center p-8 flex-1">
              <Loader2 className="h-6 w-6 animate-spin mr-2" />
              <span className="text-muted-foreground">Searching...</span>
            </div>
          ) : query.trim().length < 2 ? (
            <div className="p-8 text-center text-muted-foreground flex-1 flex flex-col justify-center">
              <Search className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p className="text-lg font-medium mb-2">Search Portfolio</p>
              <p className="text-sm">
                Find blogs, projects, case studies, and more. Start typing to search...
              </p>
            </div>
          ) : results.length === 0 ? (
            <div className="p-8 text-center flex-1 flex flex-col justify-center">
              <div className="text-muted-foreground mb-4">
                <Search className="h-8 w-8 mx-auto mb-3 opacity-50" />
                <p className="text-base font-medium">No results found</p>
                <p className="text-sm">Try different keywords or check your spelling</p>
              </div>
              {suggestions.length > 0 && (
                <div className="mt-6">
                  <p className="text-sm font-medium mb-2">Did you mean:</p>
                  <div className="flex flex-wrap gap-2 justify-center">
                    {suggestions.map((suggestion, index) => (
                      <Button
                        key={index}
                        variant="outline"
                        size="sm"
                        onClick={() => setQuery(suggestion)}
                        className="text-xs"
                      >
                        {suggestion}
                      </Button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="flex-1 min-h-0 flex flex-col">
              {/* Results Header */}
              <div className="px-4 py-2 border-b bg-muted/30 flex-shrink-0">
                <p className="text-sm text-muted-foreground">
                  {totalResults} result{totalResults !== 1 ? 's' : ''} for "{query}"
                </p>
              </div>

              {/* Results List - Scrollable */}
              <div ref={resultsRef} className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-muted scrollbar-track-transparent">
                <div className="divide-y">
                  {results.map((result, index) => (
                    <div
                      key={result.id}
                      data-index={index}
                      className={`p-3 sm:p-4 hover:bg-muted/50 cursor-pointer transition-colors touch-target-44 ${
                        index === selectedIndex ? 'bg-muted/50 ring-2 ring-primary/20' : ''
                      }`}
                      onClick={() => {
                        window.open(result.url, '_blank')
                        onClose()
                      }}
                    >
                      <div className="flex items-start gap-2 sm:gap-3">
                        <div className={`p-1.5 sm:p-2 rounded-lg ${getTypeColor(result.type)} flex-shrink-0`}>
                          {getTypeIcon(result.type)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2 mb-1">
                            <h3 className="font-medium text-foreground text-sm sm:text-base line-clamp-1">
                              {highlightText(result.title, query)}
                            </h3>
                            <div className="flex gap-1 sm:gap-2">
                              <Badge variant="secondary" className="text-xs capitalize flex-shrink-0">
                                {result.type.replace('-', ' ')}
                              </Badge>
                              {result.category && (
                                <Badge variant="outline" className="text-xs flex-shrink-0 hidden sm:inline-flex">
                                  {result.category}
                                </Badge>
                              )}
                            </div>
                          </div>
                          <p className="text-xs sm:text-sm text-muted-foreground line-clamp-2">
                            {highlightText(
                              result.excerpt || result.content.slice(0, 120) + '...', 
                              query
                            )}
                          </p>
                          <div className="mt-2 flex items-center gap-2 text-xs">
                            <span className="text-muted-foreground hidden sm:inline">
                              Relevance: {(result.relevanceScore * 100).toFixed(0)}%
                            </span>
                            <span className="text-muted-foreground hidden sm:inline">•</span>
                            <Link
                              href={result.url}
                              className="text-primary hover:underline"
                              onClick={(e) => e.stopPropagation()}
                            >
                              View →
                            </Link>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Search Footer */}
        <div className="border-t p-3 flex-shrink-0">
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <div className="flex items-center gap-4">
              <span>↑↓ Navigate</span>
              <span>↵ Open</span>
              <span>ESC Close</span>
              {results.length > 0 && (
                <span className="hidden sm:inline">• {results.length} shown</span>
              )}
            </div>
            <span>Powered by Portfolio Search</span>
          </div>
        </div>
      </Card>
    </div>
  )
}

export function SearchButton({ onClick }: { onClick: () => void }) {
  return (
    <Button
      variant="outline"
      size="sm"
      onClick={onClick}
      className="relative w-64 justify-start text-muted-foreground hover:text-foreground"
    >
      <Search className="h-4 w-4 mr-2" />
      <span className="flex-1 text-left">Search portfolio...</span>
      <kbd className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 hidden h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium opacity-100 sm:flex">
        <span className="text-xs">⌘</span>K
      </kbd>
    </Button>
  )
}