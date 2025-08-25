"use client"

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { ChevronDown, Plus, X, Tag } from 'lucide-react'

interface TagsSelectProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  label?: string
  id?: string
  className?: string
}

export function TagsSelect({ 
  value, 
  onChange, 
  placeholder = "Select or add tags", 
  label = "Tags",
  id = "tags",
  className = ""
}: TagsSelectProps) {
  const [existingTags, setExistingTags] = useState<string[]>([])
  const [selectedTags, setSelectedTags] = useState<string[]>([])
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const [isCreating, setIsCreating] = useState(false)
  const [newTag, setNewTag] = useState('')
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetchExistingTags()
  }, [])

  useEffect(() => {
    // Parse current value into selected tags array
    if (value) {
      const tags = value.split(',').map(tag => tag.trim()).filter(Boolean)
      setSelectedTags(tags)
    } else {
      setSelectedTags([])
    }
  }, [value])

  const fetchExistingTags = async () => {
    try {
      const response = await fetch('/api/admin/blog/metadata')
      const data = await response.json()
      
      if (data.success) {
        setExistingTags(data.data.tags || [])
      }
    } catch (error) {
      console.error('Error fetching tags:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleToggleTag = (tag: string) => {
    const newSelectedTags = selectedTags.includes(tag)
      ? selectedTags.filter(t => t !== tag)
      : [...selectedTags, tag]
    
    setSelectedTags(newSelectedTags)
    onChange(newSelectedTags.join(', '))
  }

  const handleRemoveTag = (tagToRemove: string) => {
    const newSelectedTags = selectedTags.filter(tag => tag !== tagToRemove)
    setSelectedTags(newSelectedTags)
    onChange(newSelectedTags.join(', '))
  }

  const handleCreateNew = () => {
    if (newTag.trim() && !selectedTags.includes(newTag.trim())) {
      const newSelectedTags = [...selectedTags, newTag.trim()]
      setSelectedTags(newSelectedTags)
      setExistingTags(prev => [...prev, newTag.trim()])
      onChange(newSelectedTags.join(', '))
      setNewTag('')
      setIsCreating(false)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      if (isCreating) {
        handleCreateNew()
      }
    } else if (e.key === 'Escape') {
      setIsDropdownOpen(false)
      setIsCreating(false)
      setNewTag('')
    }
  }

  const availableTags = existingTags.filter(tag => !selectedTags.includes(tag))

  return (
    <div className={`relative ${className}`}>
      <Label htmlFor={id} className="text-sm font-semibold text-gray-700 mb-2 block">
        {label}
      </Label>
      
      {/* Selected tags display */}
      {selectedTags.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-2">
          {selectedTags.map((tag) => (
            <span
              key={tag}
              className="inline-flex items-center px-2 py-1 rounded-md text-sm bg-blue-100 text-blue-800 border border-blue-200"
            >
              <Tag className="h-3 w-3 mr-1" />
              {tag}
              <button
                type="button"
                onClick={() => handleRemoveTag(tag)}
                className="ml-2 text-blue-600 hover:text-blue-800 focus:outline-none"
              >
                <X className="h-3 w-3" />
              </button>
            </span>
          ))}
        </div>
      )}

      <div className="relative">
        <button
          type="button"
          id={id}
          onClick={() => setIsDropdownOpen(!isDropdownOpen)}
          className="w-full px-3 py-2 text-left bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 flex items-center justify-between"
        >
          <span className={selectedTags.length > 0 ? "text-gray-900" : "text-gray-500"}>
            {selectedTags.length > 0 ? `${selectedTags.length} tag(s) selected` : placeholder}
          </span>
          <ChevronDown className={`h-4 w-4 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} />
        </button>

        {isDropdownOpen && (
          <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-auto">
            {isLoading ? (
              <div className="px-3 py-2 text-gray-500">Loading tags...</div>
            ) : (
              <>
                {/* Available tags */}
                {availableTags.length > 0 && (
                  <>
                    <div className="px-3 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wide border-b border-gray-200">
                      Available Tags
                    </div>
                    {availableTags.map((tag) => (
                      <button
                        key={tag}
                        type="button"
                        onClick={() => handleToggleTag(tag)}
                        className="w-full px-3 py-2 text-left hover:bg-blue-50 hover:text-blue-700 focus:outline-none focus:bg-blue-50 flex items-center"
                      >
                        <Tag className="h-4 w-4 mr-2" />
                        {tag}
                      </button>
                    ))}
                  </>
                )}

                {/* Create new tag */}
                <div className={availableTags.length > 0 ? "border-t border-gray-200" : ""}>
                  {!isCreating ? (
                    <button
                      type="button"
                      onClick={() => setIsCreating(true)}
                      className="w-full px-3 py-2 text-left text-blue-600 hover:bg-blue-50 focus:outline-none focus:bg-blue-50 flex items-center"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Create new tag
                    </button>
                  ) : (
                    <div className="p-3">
                      <div className="flex items-center space-x-2">
                        <Input
                          value={newTag}
                          onChange={(e) => setNewTag(e.target.value)}
                          onKeyDown={handleKeyDown}
                          placeholder="Enter new tag name"
                          className="text-sm"
                          autoFocus
                        />
                        <Button
                          type="button"
                          size="sm"
                          onClick={handleCreateNew}
                          disabled={!newTag.trim() || selectedTags.includes(newTag.trim())}
                          className="px-2 py-1"
                        >
                          Add
                        </Button>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setIsCreating(false)
                            setNewTag('')
                          }}
                          className="px-2 py-1"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  )}
                </div>

                {availableTags.length === 0 && !isCreating && (
                  <div className="px-3 py-2 text-gray-500 text-sm">
                    No available tags. Create your first tag above.
                  </div>
                )}
              </>
            )}
          </div>
        )}
      </div>

      {/* Backdrop to close dropdown when clicking outside */}
      {isDropdownOpen && (
        <div 
          className="fixed inset-0 z-0"
          onClick={() => {
            setIsDropdownOpen(false)
            setIsCreating(false)
            setNewTag('')
          }}
        />
      )}
    </div>
  )
}