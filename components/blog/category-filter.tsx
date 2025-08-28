"use client"

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

interface CategoryFilterProps {
  currentCategory: string
}

export function CategoryFilter({ currentCategory }: CategoryFilterProps) {
  const categories = [
    'AI & Marketing',
    'Growth Marketing', 
    'Email Marketing',
    'Analytics',
    'Social Media',
    'Content Marketing',
    'Marketing Automation',
    'Customer Retention',
    'Performance Marketing',
    'Conversion Optimization',
    'Influencer Marketing',
    'Paid Advertising',
    'Brand Strategy',
    'Mobile Marketing',
    'Video Marketing',
    'E-commerce',
    'MarTech'
  ]

  const handleCategoryChange = (category: string) => {
    if (category === 'all') {
      window.location.href = '/blog'
    } else {
      window.location.href = `/blog?category=${encodeURIComponent(category)}`
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