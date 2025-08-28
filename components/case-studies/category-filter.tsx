"use client"

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

interface CategoryFilterProps {
  currentCategory: string
}

export function CategoryFilter({ currentCategory }: CategoryFilterProps) {
  const categories = [
    'AI & Automation',
    'Email Marketing',
    'Social Media',
    'Conversion Optimization',
    'Paid Advertising',
    'Content Marketing',
    'Growth Marketing',
    'E-commerce',
    'Mobile Marketing',
    'Video Marketing',
    'Brand Strategy',
    'Analytics'
  ]

  const handleCategoryChange = (category: string) => {
    if (category === 'all') {
      window.location.href = '/case-studies'
    } else {
      window.location.href = `/case-studies?category=${encodeURIComponent(category)}`
    }
  }

  return (
    <Select value={currentCategory || 'all'} onValueChange={handleCategoryChange}>
      <SelectTrigger className="w-[200px]">
        <SelectValue placeholder="All Categories" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="all">All Categories</SelectItem>
        {categories.map((category) => (
          <SelectItem key={category} value={category}>
            {category}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}