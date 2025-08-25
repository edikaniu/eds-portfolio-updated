import { NextRequest, NextResponse } from 'next/server'
import { writeFile, mkdir } from 'fs/promises'
import { join } from 'path'
import { existsSync } from 'fs'
import { withAdminAuth } from '@/lib/admin-middleware'
import { logger } from '@/lib/logger'
import { isValidImageFile, getImageDimensions, optimizeImageBuffer } from '@/lib/image-optimization'

const MAX_FILE_SIZE = 10 * 1024 * 1024 // 10MB (increased for better quality)
const ALLOWED_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif', 'image/avif']

export const POST = withAdminAuth(async (request: NextRequest) => {
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File
    const folder = formData.get('folder') as string || 'general'

    if (!file) {
      return NextResponse.json(
        { success: false, message: 'No file provided' },
        { status: 400 }
      )
    }

    // Enhanced file validation
    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json(
        { 
          success: false, 
          message: `Invalid file type. Allowed types: ${ALLOWED_TYPES.join(', ')}` 
        },
        { status: 400 }
      )
    }

    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { 
          success: false, 
          message: `File too large. Maximum size is ${MAX_FILE_SIZE / (1024 * 1024)}MB` 
        },
        { status: 400 }
      )
    }

    // Additional validation using our utility
    if (!isValidImageFile(file)) {
      return NextResponse.json(
        { success: false, message: 'Invalid image file format' },
        { status: 400 }
      )
    }

    // Create unique filename
    const timestamp = Date.now()
    const extension = file.name.split('.').pop()
    const filename = `${folder}-${timestamp}.${extension}`
    
    // Ensure upload directory exists
    const uploadDir = join(process.cwd(), 'public', 'uploads', 'images', folder)
    if (!existsSync(uploadDir)) {
      await mkdir(uploadDir, { recursive: true })
    }

    // Process and optimize the image
    const bytes = await file.arrayBuffer()
    let buffer = Buffer.from(bytes)
    
    // Get image dimensions for metadata
    let dimensions = { width: 0, height: 0 }
    try {
      dimensions = await getImageDimensions(file)
    } catch (error) {
      logger.error('Failed to get image dimensions', error)
    }

    // Optimize the image buffer (in a real implementation, this would use Sharp or similar)
    try {
      buffer = await optimizeImageBuffer(buffer, {
        quality: 85,
        format: 'webp'
      })
    } catch (error) {
      logger.error('Image optimization failed, using original', error)
    }
    
    const filepath = join(uploadDir, filename)
    await writeFile(filepath, buffer)

    // Log successful upload
    logger.info('Image uploaded and optimized', {
      filename,
      originalSize: file.size,
      optimizedSize: buffer.length,
      dimensions,
      folder
    })

    // Return the public URL with metadata
    const publicUrl = `/uploads/images/${folder}/${filename}`

    return NextResponse.json({
      success: true,
      message: 'File uploaded and optimized successfully',
      data: {
        url: publicUrl,
        filename,
        originalSize: file.size,
        optimizedSize: buffer.length,
        type: file.type,
        dimensions,
        folder
      }
    })
  } catch (error) {
    logger.error('Image upload failed', error)
    return NextResponse.json(
      { success: false, message: 'Failed to upload file' },
      { status: 500 }
    )
  }
})