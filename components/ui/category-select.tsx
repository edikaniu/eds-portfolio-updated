"use client"

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { ChevronDown, Plus, X } from 'lucide-react'

interface CategorySelectProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  label?: string
  id?: string
  className?: string
}

export function CategorySelect({ 
  value, 
  onChange, 
  placeholder = "Select or type a category", 
  label = "Category",
  id = "category",
  className = ""
}: CategorySelectProps) {
  const [existingCategories, setExistingCategories] = useState<string[]>([])
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const [isCreating, setIsCreating] = useState(false)
  const [newCategory, setNewCategory] = useState('')
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetchExistingCategories()
  }, [])

  const fetchExistingCategories = async () => {
    try {
      const response = await fetch('/api/admin/blog/metadata')
      const data = await response.json()
      
      if (data.success) {
        setExistingCategories(data.data.categories || [])
      }
    } catch (error) {
      console.error('Error fetching categories:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSelectCategory = (category: string) => {
    onChange(category)
    setIsDropdownOpen(false)
  }

  const handleCreateNew = () => {
    if (newCategory.trim()) {
      onChange(newCategory.trim())
      setExistingCategories(prev => [...prev, newCategory.trim()])
      setNewCategory('')
      setIsCreating(false)
      setIsDropdownOpen(false)
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
      setNewCategory('')
    }
  }

  return (
    <div className={`relative ${className}`}>
      <Label htmlFor={id} className="text-sm font-semibold text-gray-700 mb-2 block">
        {label}
      </Label>
      
      <div className="relative">
        <button
          type="button"
          id={id}
          onClick={() => setIsDropdownOpen(!isDropdownOpen)}
          className="w-full px-3 py-2 text-left bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 flex items-center justify-between"
        >
          <span className={value ? "text-gray-900" : "text-gray-500"}>
            {value || placeholder}
          </span>
          <ChevronDown className={`h-4 w-4 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} />
        </button>

        {isDropdownOpen && (
          <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-auto">
            {isLoading ? (
              <div className="px-3 py-2 text-gray-500">Loading categories...</div>
            ) : (
              <>
                {/* Existing categories */}
                {existingCategories.length > 0 && (
                  <>
                    <div className="px-3 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wide border-b border-gray-200">
                      Existing Categories
                    </div>
                    {existingCategories.map((category) => (
                      <button
                        key={category}
                        type="button"
                        onClick={() => handleSelectCategory(category)}
                        className="w-full px-3 py-2 text-left hover:bg-blue-50 hover:text-blue-700 focus:outline-none focus:bg-blue-50"
                      >
                        {category}
                      </button>
                    ))}
                  </>
                )}

                {/* Create new category */}
                <div className="border-t border-gray-200">
                  {!isCreating ? (
                    <button
                      type="button"
                      onClick={() => setIsCreating(true)}
                      className="w-full px-3 py-2 text-left text-blue-600 hover:bg-blue-50 focus:outline-none focus:bg-blue-50 flex items-center"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Create new category
                    </button>
                  ) : (
                    <div className="p-3">
                      <div className="flex items-center space-x-2">
                        <Input
                          value={newCategory}
                          onChange={(e) => setNewCategory(e.target.value)}
                          onKeyDown={handleKeyDown}
                          placeholder="Enter new category name"
                          className="text-sm"
                          autoFocus
                        />
                        <Button
                          type="button"
                          size="sm"
                          onClick={handleCreateNew}
                          disabled={!newCategory.trim()}
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
                            setNewCategory('')
                          }}
                          className="px-2 py-1"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
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
            setNewCategory('')
          }}
        />
      )}
    </div>
  )
}