import { NextRequest, NextResponse } from 'next/server'
import { withAdminAuth } from '@/lib/admin-middleware'
import { prisma } from '@/lib/prisma'

// File upload handler for chatbot knowledge
export const POST = withAdminAuth(async (request: NextRequest) => {
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File
    
    if (!file) {
      return NextResponse.json(
        { success: false, message: 'No file provided' },
        { status: 400 }
      )
    }

    // Check file size (10MB limit)
    const maxSize = 10 * 1024 * 1024 // 10MB
    if (file.size > maxSize) {
      return NextResponse.json(
        { success: false, message: 'File size exceeds 10MB limit' },
        { status: 400 }
      )
    }

    // Check file type
    const allowedTypes = ['text/plain', 'application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'text/markdown']
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { success: false, message: 'File type not supported. Please upload PDF, DOC, TXT, or MD files.' },
        { status: 400 }
      )
    }

    // Read file content
    const buffer = Buffer.from(await file.arrayBuffer())
    let content = ''
    
    try {
      if (file.type === 'text/plain' || file.type === 'text/markdown') {
        content = buffer.toString('utf-8')
      } else if (file.type === 'application/pdf') {
        // For PDF files, we'll just store a placeholder for now
        // In a production app, you'd use a PDF parsing library like pdf-parse
        content = `PDF file content from ${file.name}. This is a placeholder - implement PDF parsing for full content extraction.`
      } else {
        // For DOC files, we'll just store a placeholder for now  
        // In a production app, you'd use a library like mammoth.js
        content = `Document file content from ${file.name}. This is a placeholder - implement document parsing for full content extraction.`
      }
    } catch (parseError) {
      console.error('Error parsing file content:', parseError)
      return NextResponse.json(
        { success: false, message: 'Failed to parse file content' },
        { status: 500 }
      )
    }

    // Create knowledge base entry
    const knowledge = await prisma.chatbotKnowledge.create({
      data: {
        title: file.name.replace(/\.[^/.]+$/, ""), // Remove file extension
        content: content.substring(0, 10000), // Limit content to 10k chars
        category: 'upload',
        sourceType: 'file',
        sourceFile: file.name,
        priority: 0,
        isActive: true
      }
    })

    return NextResponse.json({
      success: true,
      message: 'File uploaded and processed successfully',
      data: [knowledge]
    })
  } catch (error) {
    console.error('Error uploading file:', error)
    return NextResponse.json(
      { success: false, message: 'Failed to upload file' },
      { status: 500 }
    )
  }
})