import { NextRequest, NextResponse } from 'next/server'
import { readdir, stat } from 'fs/promises'
import { existsSync } from 'fs'
import path from 'path'

interface MediaFile {
  id: string
  filename: string
  originalName: string
  url: string
  size: number
  type: string
  folder: string
  uploadedAt: string
}

export async function GET(request: NextRequest) {
  try {
    const uploadsDir = path.join(process.cwd(), 'public', 'uploads')
    
    if (!existsSync(uploadsDir)) {
      return NextResponse.json({
        success: true,
        data: [],
        message: 'No uploads directory found'
      })
    }

    const files: MediaFile[] = []
    const folders = ['general', 'profile', 'portfolio', 'blog', 'projects']

    // Scan each folder
    for (const folder of folders) {
      const folderPath = path.join(uploadsDir, folder)
      
      if (!existsSync(folderPath)) {
        continue
      }

      try {
        const folderFiles = await readdir(folderPath)
        
        for (const filename of folderFiles) {
          const filePath = path.join(folderPath, filename)
          const fileStats = await stat(filePath)
          
          if (fileStats.isFile() && isImageFile(filename)) {
            // Extract original name from the filename pattern (timestamp_random_originalname)
            const parts = filename.split('_')
            const originalName = parts.length >= 3 ? parts.slice(2).join('_') : filename
            
            files.push({
              id: `${folder}/${filename}`,
              filename,
              originalName: originalName || filename,
              url: `/uploads/${folder}/${filename}`,
              size: fileStats.size,
              type: getFileType(filename),
              folder,
              uploadedAt: fileStats.mtime.toISOString()
            })
          }
        }
      } catch (error) {
        console.warn(`Error reading folder ${folder}:`, error)
      }
    }

    // Sort by upload date (newest first)
    files.sort((a, b) => new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime())

    return NextResponse.json({
      success: true,
      data: files,
      total: files.length
    })

  } catch (error) {
    console.error('Error fetching media files:', error)
    return NextResponse.json(
      { success: false, message: 'Failed to fetch media files' },
      { status: 500 }
    )
  }
}

function isImageFile(filename: string): boolean {
  const imageExtensions = ['.jpg', '.jpeg', '.png', '.webp', '.gif', '.avif']
  const ext = path.extname(filename).toLowerCase()
  return imageExtensions.includes(ext)
}

function getFileType(filename: string): string {
  const ext = path.extname(filename).toLowerCase()
  switch (ext) {
    case '.jpg':
    case '.jpeg':
      return 'image/jpeg'
    case '.png':
      return 'image/png'
    case '.webp':
      return 'image/webp'
    case '.gif':
      return 'image/gif'
    case '.avif':
      return 'image/avif'
    default:
      return 'application/octet-stream'
  }
}