/**
 * Image optimization utilities for Next.js application
 * Handles WebP conversion, lazy loading, and responsive images
 */

import { ImageLoader } from 'next/image'

// Custom image loader for optimized images
export const optimizedImageLoader: ImageLoader = ({ src, width, quality }) => {
  const params = new URLSearchParams()
  
  params.set('url', src)
  params.set('w', width.toString())
  params.set('q', (quality || 75).toString())
  
  // Use Next.js built-in image optimization
  return `/_next/image?${params.toString()}`
}

// Image configuration for different use cases
export const IMAGE_CONFIGS = {
  hero: {
    sizes: '100vw',
    priority: true,
    quality: 85,
    placeholder: 'blur' as const,
  },
  card: {
    sizes: '(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw',
    quality: 80,
    placeholder: 'blur' as const,
  },
  thumbnail: {
    sizes: '(max-width: 768px) 50vw, 25vw',
    quality: 70,
    placeholder: 'blur' as const,
  },
  gallery: {
    sizes: '(max-width: 768px) 100vw, 50vw',
    quality: 85,
    placeholder: 'blur' as const,
  },
  avatar: {
    sizes: '128px',
    quality: 90,
    placeholder: 'blur' as const,
  }
} as const

// Generate blur placeholder for images
export function generateBlurPlaceholder(width: number = 8, height: number = 8): string {
  const canvas = `
    <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:#e5e7eb;stop-opacity:1" />
          <stop offset="100%" style="stop-color:#f3f4f6;stop-opacity:1" />
        </linearGradient>
      </defs>
      <rect width="100%" height="100%" fill="url(#grad)"/>
    </svg>
  `
  
  return `data:image/svg+xml;base64,${Buffer.from(canvas).toString('base64')}`
}

// Responsive image sizes for different breakpoints
export const RESPONSIVE_SIZES = {
  xs: 320,
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
  '2xl': 1536,
} as const

// Generate srcSet for responsive images
export function generateSrcSet(src: string, sizes: number[] = [320, 640, 768, 1024, 1280]): string {
  return sizes
    .map(size => `${optimizedImageLoader({ src, width: size, quality: 75 })} ${size}w`)
    .join(', ')
}

// Image format detection and conversion utilities
export function supportsWebP(): boolean {
  if (typeof window === 'undefined') return false
  
  const canvas = document.createElement('canvas')
  return canvas.toDataURL('image/webp').indexOf('image/webp') === 5
}

export function supportsAvif(): boolean {
  if (typeof window === 'undefined') return false
  
  const canvas = document.createElement('canvas')
  return canvas.toDataURL('image/avif').indexOf('image/avif') === 5
}

// Get optimal image format based on browser support
export function getOptimalImageFormat(): 'avif' | 'webp' | 'jpeg' {
  if (supportsAvif()) return 'avif'
  if (supportsWebP()) return 'webp'
  return 'jpeg'
}

// Generate multiple format sources for picture element
export function generatePictureSources(src: string, width: number = 800): Array<{
  srcSet: string
  type: string
}> {
  const formats = ['avif', 'webp', 'jpeg']
  
  return formats.map(format => ({
    srcSet: `${src}?format=${format}&w=${width}`,
    type: `image/${format}`
  }))
}

// Image optimization middleware for API routes
export async function optimizeImageBuffer(
  buffer: Buffer,
  options: {
    width?: number
    height?: number
    quality?: number
    format?: 'webp' | 'jpeg' | 'png' | 'avif'
  } = {}
): Promise<Buffer> {
  const { width, height, quality = 80, format = 'webp' } = options
  
  // This would typically use a library like Sharp for server-side optimization
  // For now, return the original buffer as Next.js handles optimization
  return buffer
}

// Image preloading utility
export function preloadImage(src: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.onload = () => resolve()
    img.onerror = reject
    img.src = src
  })
}

// Lazy loading intersection observer
export function createImageObserver(
  callback: (entries: IntersectionObserverEntry[]) => void,
  options: IntersectionObserverInit = {}
): IntersectionObserver | null {
  if (typeof window === 'undefined' || !('IntersectionObserver' in window)) {
    return null
  }
  
  return new IntersectionObserver(callback, {
    rootMargin: '50px 0px',
    threshold: 0.1,
    ...options,
  })
}

// Image compression utilities
export function compressImage(
  file: File,
  options: {
    maxWidth?: number
    maxHeight?: number
    quality?: number
    format?: string
  } = {}
): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const {
      maxWidth = 1920,
      maxHeight = 1080,
      quality = 0.8,
      format = 'image/webp'
    } = options
    
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')
    const img = new Image()
    
    img.onload = () => {
      // Calculate new dimensions
      let { width, height } = img
      
      if (width > maxWidth) {
        height = (height * maxWidth) / width
        width = maxWidth
      }
      
      if (height > maxHeight) {
        width = (width * maxHeight) / height
        height = maxHeight
      }
      
      canvas.width = width
      canvas.height = height
      
      // Draw and compress
      ctx?.drawImage(img, 0, 0, width, height)
      
      canvas.toBlob(
        (blob) => {
          if (blob) {
            resolve(blob)
          } else {
            reject(new Error('Failed to compress image'))
          }
        },
        format,
        quality
      )
    }
    
    img.onerror = reject
    img.src = URL.createObjectURL(file)
  })
}

// Image validation utilities
export function isValidImageFile(file: File): boolean {
  const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/avif', 'image/gif']
  return validTypes.includes(file.type)
}

export function getImageDimensions(file: File): Promise<{ width: number; height: number }> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    
    img.onload = () => {
      resolve({
        width: img.naturalWidth,
        height: img.naturalHeight
      })
    }
    
    img.onerror = reject
    img.src = URL.createObjectURL(file)
  })
}

// Performance monitoring for images
export function trackImagePerformance(src: string, startTime: number = Date.now()) {
  const loadTime = Date.now() - startTime
  
  if (typeof window !== 'undefined' && 'performance' in window) {
    // Log to performance API or analytics
    console.log(`Image loaded: ${src} (${loadTime}ms)`)
  }
}