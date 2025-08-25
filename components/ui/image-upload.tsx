"use client"

import { useState, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { Upload, X, Link, Image as ImageIcon, Loader2, Info, Check, AlertTriangle } from 'lucide-react'
import Image from 'next/image'

interface ImageUploadProps {
  value: string
  onChange: (value: string) => void
  label?: string
  placeholder?: string
  id?: string
  className?: string
  folder?: string
  maxSize?: number // in MB
  recommendedDimensions?: {
    width: number
    height: number
    aspectRatio?: string
  }
  required?: boolean
}

export function ImageUpload({ 
  value, 
  onChange, 
  label = "Image",
  placeholder = "Enter image URL",
  id = "image",
  className = "",
  folder = "general",
  maxSize = 5,
  recommendedDimensions,
  required = false
}: ImageUploadProps) {
  const [isUploading, setIsUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [urlInput, setUrlInput] = useState(value)
  const [previewUrl, setPreviewUrl] = useState(value)
  const [dragOver, setDragOver] = useState(false)
  const [error, setError] = useState("")
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileSelect = async (file: File) => {
    setError("")
    
    // Validate file type (enhanced with AVIF support)
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif', 'image/avif']
    if (!allowedTypes.includes(file.type)) {
      setError(`Invalid file type. Please use: ${allowedTypes.map(t => t.split('/')[1].toUpperCase()).join(', ')}`)
      return
    }

    // Validate file size
    const maxBytes = maxSize * 1024 * 1024
    if (file.size > maxBytes) {
      setError(`File too large. Maximum size is ${maxSize}MB`)
      return
    }

    setIsUploading(true)
    setUploadProgress(0)

    try {
      // Show progress simulation
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => Math.min(prev + 10, 90))
      }, 100)

      const formData = new FormData()
      formData.append('file', file)
      formData.append('folder', folder)

      const response = await fetch('/api/admin/upload', {
        method: 'POST',
        body: formData
      })

      clearInterval(progressInterval)
      setUploadProgress(100)

      const result = await response.json()

      if (result.success) {
        const imageUrl = result.data.url
        onChange(imageUrl)
        setPreviewUrl(imageUrl)
        setUrlInput(imageUrl)
      } else {
        setError(result.message || 'Upload failed')
      }
    } catch (error) {
      setError('Upload failed. Please try again.')
      console.error('Upload error:', error)
    } finally {
      setIsUploading(false)
      setUploadProgress(0)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(false)
    
    const files = Array.from(e.dataTransfer.files)
    if (files.length > 0) {
      handleFileSelect(files[0])
    }
  }

  const handleUrlChange = (url: string) => {
    setUrlInput(url)
    setError("")
    
    // Validate URL format
    if (url && !url.match(/^https?:\/\/.+\.(jpg|jpeg|png|webp|gif)(\?.*)?$/i)) {
      setError("Please enter a valid image URL ending with .jpg, .png, .webp, or .gif")
      return
    }
    
    onChange(url)
    setPreviewUrl(url)
  }

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      handleFileSelect(file)
    }
  }

  const clearImage = () => {
    onChange("")
    setPreviewUrl("")
    setUrlInput("")
    setError("")
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  return (
    <div className={`space-y-4 ${className}`}>
      <div className="flex items-center justify-between">
        <Label className="text-base font-semibold">{label} {required && <span className="text-red-500">*</span>}</Label>
        {previewUrl && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={clearImage}
            className="text-red-500 hover:text-red-700 hover:bg-red-50"
          >
            <X className="w-4 h-4 mr-1" />
            Clear
          </Button>
        )}
      </div>

      {/* Guidelines Card */}
      <Card className="p-4 bg-blue-50 border-blue-200">
        <div className="flex items-start gap-3">
          <Info className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
          <div className="space-y-2 text-sm">
            <div className="flex flex-wrap gap-2">
              <Badge variant="outline" className="bg-white border-blue-200 text-blue-700">
                Max {maxSize}MB
              </Badge>
              {recommendedDimensions && (
                <Badge variant="outline" className="bg-white border-blue-200 text-blue-700">
                  {recommendedDimensions.width}×{recommendedDimensions.height}px
                  {recommendedDimensions.aspectRatio && ` (${recommendedDimensions.aspectRatio})`}
                </Badge>
              )}
              <Badge variant="outline" className="bg-white border-blue-200 text-blue-700">
                JPG, PNG, WebP, AVIF, GIF
              </Badge>
            </div>
            <p className="text-blue-600 leading-relaxed">
              {recommendedDimensions 
                ? `For best results, use images with ${recommendedDimensions.width}×${recommendedDimensions.height} pixels. Images will be automatically optimized for web display.`
                : "Upload high-quality images for best results. Images will be automatically optimized for web display."
              }
            </p>
          </div>
        </div>
      </Card>

      {/* Preview */}
      {previewUrl && (
        <Card className="overflow-hidden border-2 border-green-200 bg-green-50">
          <div className="p-4">
            <div className="flex items-center gap-2 mb-3">
              <Check className="w-4 h-4 text-green-600" />
              <span className="text-sm font-medium text-green-700">Image Preview</span>
            </div>
            <div className="relative rounded-lg overflow-hidden bg-white shadow-sm">
              <Image 
                src={previewUrl} 
                alt="Preview" 
                width={400}
                height={200}
                className="w-full h-48 object-cover"
                onError={() => {
                  setError("Failed to load image. Please check the URL or try a different image.")
                  setPreviewUrl("")
                }}
              />
              {recommendedDimensions && (
                <div className="absolute bottom-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded">
                  {recommendedDimensions.width}×{recommendedDimensions.height}
                </div>
              )}
            </div>
          </div>
        </Card>
      )}

      {/* Error Display */}
      {error && (
        <Card className="p-4 bg-red-50 border-red-200">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-red-600" />
            <span className="text-sm text-red-700">{error}</span>
          </div>
        </Card>
      )}

      {/* Upload Interface */}
      <Tabs defaultValue="upload" className="w-full">
        <TabsList className="grid w-full grid-cols-2 mb-4">
          <TabsTrigger value="upload" className="flex items-center gap-2">
            <Upload className="w-4 h-4" />
            Upload File
          </TabsTrigger>
          <TabsTrigger value="url" className="flex items-center gap-2">
            <Link className="w-4 h-4" />
            Online URL
          </TabsTrigger>
        </TabsList>

        <TabsContent value="upload" className="space-y-4">
          <div
            className={`relative border-2 border-dashed rounded-lg p-8 text-center transition-all duration-200 ${
              dragOver 
                ? 'border-blue-400 bg-blue-50' 
                : 'border-gray-300 hover:border-blue-400 hover:bg-gray-50'
            } ${isUploading ? 'pointer-events-none opacity-50' : 'cursor-pointer'}`}
            onDrop={handleDrop}
            onDragOver={(e) => { e.preventDefault(); setDragOver(true) }}
            onDragLeave={() => setDragOver(false)}
            onClick={() => fileInputRef.current?.click()}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileInputChange}
              className="hidden"
            />
            
            {isUploading ? (
              <div className="space-y-4">
                <Loader2 className="w-12 h-12 text-blue-600 animate-spin mx-auto" />
                <div className="space-y-2">
                  <p className="text-blue-600 font-medium">Uploading image...</p>
                  <div className="w-full bg-blue-100 rounded-full h-2 max-w-xs mx-auto">
                    <div 
                      className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${uploadProgress}%` }}
                    ></div>
                  </div>
                  <p className="text-sm text-blue-500">{uploadProgress}% complete</p>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="bg-blue-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto">
                  <Upload className="w-8 h-8 text-blue-600" />
                </div>
                <div>
                  <p className="text-lg font-semibold text-gray-700 mb-2">
                    Drop your image here or click to browse
                  </p>
                  <p className="text-sm text-gray-500">
                    Supports JPG, PNG, WebP, GIF up to {maxSize}MB
                  </p>
                  {recommendedDimensions && (
                    <p className="text-xs text-blue-600 mt-1">
                      Recommended: {recommendedDimensions.width}×{recommendedDimensions.height}px
                    </p>
                  )}
                </div>
                <Button 
                  type="button"
                  variant="outline" 
                  className="border-blue-300 text-blue-600 hover:bg-blue-50"
                >
                  Choose File
                </Button>
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="url" className="space-y-4">
          <div className="space-y-3">
            <Label htmlFor={`${id}-url`}>Image URL</Label>
            <div className="flex gap-2">
              <Input
                id={`${id}-url`}
                type="url"
                value={urlInput}
                onChange={(e) => setUrlInput(e.target.value)}
                placeholder="https://example.com/image.jpg"
                className="flex-1"
              />
              <Button 
                type="button"
                onClick={() => handleUrlChange(urlInput)}
                className="bg-blue-600 hover:bg-blue-700 text-white px-6"
              >
                <Link className="w-4 h-4 mr-2" />
                Load
              </Button>
            </div>
            <p className="text-xs text-gray-500">
              Enter a direct link to an image file (JPG, PNG, WebP, GIF)
            </p>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}