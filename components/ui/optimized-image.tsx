"use client"

import { useState, forwardRef } from 'react'
import Image, { ImageProps } from 'next/image'
import { cn } from '@/lib/utils'
import { 
  IMAGE_CONFIGS, 
  generateBlurPlaceholder, 
  trackImagePerformance 
} from '@/lib/image-optimization'

interface OptimizedImageProps extends Omit<ImageProps, 'placeholder' | 'blurDataURL'> {
  config?: keyof typeof IMAGE_CONFIGS
  fallback?: string
  showLoader?: boolean
  className?: string
  containerClassName?: string
}

export const OptimizedImage = forwardRef<HTMLImageElement, OptimizedImageProps>(
  ({ 
    config = 'card',
    fallback = '/placeholder.svg',
    showLoader = true,
    className,
    containerClassName,
    alt,
    onLoad,
    onError,
    ...props 
  }, ref) => {
    const [isLoading, setIsLoading] = useState(true)
    const [hasError, setHasError] = useState(false)
    const [loadStartTime] = useState(Date.now())
    
    const imageConfig = IMAGE_CONFIGS[config]
    
    const handleLoad = (event: React.SyntheticEvent<HTMLImageElement>) => {
      setIsLoading(false)
      trackImagePerformance(props.src as string, loadStartTime)
      onLoad?.(event)
    }
    
    const handleError = (event: React.SyntheticEvent<HTMLImageElement>) => {
      setIsLoading(false)
      setHasError(true)
      onError?.(event)
    }
    
    // Generate blur placeholder if not provided
    const blurDataURL = props.blurDataURL || generateBlurPlaceholder()
    
    if (hasError && fallback) {
      return (
        <div className={cn(
          "relative overflow-hidden bg-muted flex items-center justify-center",
          containerClassName
        )}>
          <Image
            ref={ref}
            {...props}
            src={fallback}
            alt={alt}
            className={cn("object-cover", className)}
            onLoad={handleLoad}
            {...imageConfig}
            placeholder="blur"
            blurDataURL={blurDataURL}
          />
        </div>
      )
    }
    
    return (
      <div className={cn(
        "relative overflow-hidden",
        containerClassName
      )}>
        {/* Loading skeleton */}
        {showLoader && isLoading && (
          <div 
            className="absolute inset-0 bg-gradient-to-r from-muted/50 via-muted to-muted/50 animate-pulse"
            style={{
              backgroundSize: '200% 100%',
              animation: 'shimmer 1.5s infinite linear'
            }}
          />
        )}
        
        <Image
          ref={ref}
          {...props}
          alt={alt}
          className={cn(
            "object-cover transition-opacity duration-300",
            isLoading ? "opacity-0" : "opacity-100",
            className
          )}
          onLoad={handleLoad}
          onError={handleError}
          {...imageConfig}
          placeholder="blur"
          blurDataURL={blurDataURL}
        />
        
        <style jsx>{`
          @keyframes shimmer {
            0% {
              background-position: -200% 0;
            }
            100% {
              background-position: 200% 0;
            }
          }
        `}</style>
      </div>
    )
  }
)

OptimizedImage.displayName = "OptimizedImage"

// Specialized components for different use cases
export function HeroImage(props: Omit<OptimizedImageProps, 'config'>) {
  return <OptimizedImage {...props} config="hero" />
}

export function CardImage(props: Omit<OptimizedImageProps, 'config'>) {
  return <OptimizedImage {...props} config="card" />
}

export function ThumbnailImage(props: Omit<OptimizedImageProps, 'config'>) {
  return <OptimizedImage {...props} config="thumbnail" />
}

export function GalleryImage(props: Omit<OptimizedImageProps, 'config'>) {
  return <OptimizedImage {...props} config="gallery" />
}

export function AvatarImage(props: Omit<OptimizedImageProps, 'config'>) {
  return <OptimizedImage {...props} config="avatar" />
}

// Picture component with multiple format support
interface PictureProps {
  src: string
  alt: string
  width: number
  height: number
  className?: string
  formats?: Array<'avif' | 'webp' | 'jpeg'>
}

export function PictureElement({ 
  src, 
  alt, 
  width, 
  height, 
  className,
  formats = ['avif', 'webp', 'jpeg']
}: PictureProps) {
  return (
    <picture>
      {formats.slice(0, -1).map((format) => (
        <source
          key={format}
          srcSet={`${src}?format=${format}&w=${width}&h=${height}`}
          type={`image/${format}`}
        />
      ))}
      <img
        src={`${src}?format=${formats[formats.length - 1]}&w=${width}&h=${height}`}
        alt={alt}
        width={width}
        height={height}
        className={className}
      />
    </picture>
  )
}