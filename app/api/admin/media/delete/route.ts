import { NextRequest, NextResponse } from 'next/server'
import { unlink } from 'fs/promises'
import { existsSync } from 'fs'
import path from 'path'

export async function DELETE(request: NextRequest) {
  try {
    const { fileIds } = await request.json()

    if (!fileIds || !Array.isArray(fileIds) || fileIds.length === 0) {
      return NextResponse.json(
        { success: false, message: 'No file IDs provided' },
        { status: 400 }
      )
    }

    const deleteResults = []
    const uploadsDir = path.join(process.cwd(), 'public', 'uploads')

    for (const fileId of fileIds) {
      try {
        // fileId format: "folder/filename.ext"
        const filePath = path.join(uploadsDir, fileId)
        
        if (existsSync(filePath)) {
          await unlink(filePath)
          deleteResults.push({ fileId, success: true })
        } else {
          deleteResults.push({ 
            fileId, 
            success: false, 
            error: 'File not found' 
          })
        }
      } catch (error) {
        deleteResults.push({ 
          fileId, 
          success: false, 
          error: error instanceof Error ? error.message : 'Unknown error' 
        })
      }
    }

    const successCount = deleteResults.filter(r => r.success).length
    const failureCount = deleteResults.filter(r => !r.success).length

    return NextResponse.json({
      success: failureCount === 0,
      message: `Successfully deleted ${successCount} file(s)${failureCount > 0 ? `, ${failureCount} failed` : ''}`,
      data: {
        deleted: successCount,
        failed: failureCount,
        results: deleteResults
      }
    })

  } catch (error) {
    console.error('Error deleting files:', error)
    return NextResponse.json(
      { success: false, message: 'Failed to delete files' },
      { status: 500 }
    )
  }
}