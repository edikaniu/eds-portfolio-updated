"use client"

import { Card } from "@/components/ui/card"

interface SkeletonProps {
  className?: string
}

function Skeleton({ className = "" }: SkeletonProps) {
  return (
    <div className={`animate-pulse bg-gray-200 rounded ${className}`} />
  )
}

// Blog post skeleton
export function BlogPostSkeleton() {
  return (
    <Card className="p-6">
      <div className="space-y-4">
        <Skeleton className="h-6 w-3/4" />
        <Skeleton className="h-4 w-1/2" />
        <div className="space-y-2">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-2/3" />
        </div>
        <div className="flex gap-2">
          <Skeleton className="h-6 w-16" />
          <Skeleton className="h-6 w-20" />
        </div>
      </div>
    </Card>
  )
}

// Project card skeleton
export function ProjectSkeleton() {
  return (
    <Card className="p-6">
      <div className="space-y-4">
        <Skeleton className="h-48 w-full rounded" />
        <Skeleton className="h-6 w-3/4" />
        <div className="space-y-2">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-2/3" />
        </div>
        <div className="flex justify-between items-center">
          <div className="flex gap-2">
            <Skeleton className="h-6 w-12" />
            <Skeleton className="h-6 w-16" />
          </div>
          <Skeleton className="h-8 w-24" />
        </div>
      </div>
    </Card>
  )
}

// Case study skeleton
export function CaseStudySkeleton() {
  return (
    <Card className="p-6">
      <div className="space-y-4">
        <div className="flex items-start gap-4">
          <Skeleton className="h-12 w-12 rounded-full" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-6 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
          </div>
        </div>
        <div className="space-y-2">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-3/4" />
        </div>
        <div className="flex justify-between">
          <Skeleton className="h-8 w-20" />
          <Skeleton className="h-8 w-16" />
        </div>
      </div>
    </Card>
  )
}

// Experience timeline skeleton
export function ExperienceTimelineSkeleton() {
  return (
    <div className="space-y-8">
      {[1, 2, 3].map((index) => (
        <div key={index} className="flex gap-6">
          <div className="flex flex-col items-center">
            <Skeleton className="h-12 w-12 rounded-full" />
            {index !== 3 && <Skeleton className="h-20 w-0.5 mt-4" />}
          </div>
          <div className="flex-1 space-y-3 pb-8">
            <Skeleton className="h-6 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
            <div className="space-y-2">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-2/3" />
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}

// Skills grid skeleton
export function SkillsGridSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {[1, 2, 3, 4, 5, 6].map((index) => (
        <Card key={index} className="p-6">
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <Skeleton className="h-8 w-8 rounded" />
              <Skeleton className="h-6 w-32" />
            </div>
            <div className="space-y-2">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-3/4" />
            </div>
            <div className="space-y-2">
              {[1, 2, 3, 4].map((skillIndex) => (
                <div key={skillIndex} className="flex justify-between items-center">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-4 w-16" />
                </div>
              ))}
            </div>
          </div>
        </Card>
      ))}
    </div>
  )
}

// Tools grid skeleton
export function ToolsGridSkeleton() {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
      {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((index) => (
        <Card key={index} className="p-4 text-center">
          <div className="space-y-3">
            <Skeleton className="h-12 w-12 mx-auto rounded" />
            <Skeleton className="h-4 w-16 mx-auto" />
          </div>
        </Card>
      ))}
    </div>
  )
}

// Generic content skeleton
export function ContentSkeleton({ 
  lines = 3, 
  showTitle = true, 
  className = "" 
}: { 
  lines?: number
  showTitle?: boolean
  className?: string 
}) {
  return (
    <div className={`space-y-4 ${className}`}>
      {showTitle && <Skeleton className="h-8 w-3/4" />}
      <div className="space-y-2">
        {Array.from({ length: lines }, (_, index) => (
          <Skeleton 
            key={index} 
            className={`h-4 ${
              index === lines - 1 ? 'w-2/3' : 'w-full'
            }`} 
          />
        ))}
      </div>
    </div>
  )
}

// Loading state for lists
export function ListSkeleton({ 
  count = 5, 
  itemComponent: ItemComponent = ContentSkeleton 
}: { 
  count?: number
  itemComponent?: React.ComponentType<any>
}) {
  return (
    <div className="space-y-6">
      {Array.from({ length: count }, (_, index) => (
        <ItemComponent key={index} />
      ))}
    </div>
  )
}