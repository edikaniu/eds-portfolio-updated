import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { withAdminAuth } from '@/lib/admin-middleware'

interface ContactPageContent {
  // Hero Section
  heroTitle: string
  heroSubtitle: string
  heroDescription: string
  
  // Contact Info
  email: string
  phone: string
  location: string
  linkedinUrl: string
  twitterUrl: string
  
  // Why Work With Me
  whyWorkTitle: string
  whyWorkDescription: string
  benefits: Array<{
    icon: string
    text: string
  }>
  
  // Stats
  responseTime: string
  yearsExperience: string
  projectsDelivered: string
  updatedAt: string
}

const CONTACT_SECTION_NAME = 'contact_page_content'

// Get contact page content
export const GET = withAdminAuth(async (request: NextRequest) => {
  try {
    console.log('GET contact page content request received')
    
    // Try to get existing content from database
    const existingContent = await prisma.contentSection.findUnique({
      where: {
        sectionName: CONTACT_SECTION_NAME
      }
    })

    if (!existingContent) {
      console.log('Contact page content not found in database, returning defaults')
      // Return default content if not found
      return NextResponse.json({
        success: true,
        data: {
          heroTitle: "Let's Create Something Extraordinary",
          heroSubtitle: "Available for New Projects",
          heroDescription: "Ready to transform your marketing strategy and accelerate growth? Let's discuss how we can scale your business with innovative, data-driven solutions.",
          email: "edikanudoibuot@gmail.com",
          phone: "",
          location: "Nigeria",
          linkedinUrl: "https://www.linkedin.com/in/edikanudoibuot/",
          twitterUrl: "https://x.com/edikanudoibuot",
          whyWorkTitle: "Why Work With Me?",
          whyWorkDescription: "Here's what sets me apart and makes our collaboration successful",
          benefits: [
            { icon: "Users", text: "7+ years of proven growth marketing experience" },
            { icon: "Zap", text: "AI-powered strategies for maximum efficiency" },
            { icon: "Target", text: "Data-driven approach with measurable results" },
            { icon: "CheckCircle", text: "Cross-functional leadership and collaboration" },
          ],
          responseTime: "24h",
          yearsExperience: "7+",
          projectsDelivered: "50+",
          updatedAt: new Date().toISOString()
        }
      })
    }

    // Parse the stored JSON content
    const content: ContactPageContent = JSON.parse(existingContent.content)
    console.log('Contact page content loaded successfully from database')

    return NextResponse.json({
      success: true,
      data: content
    })
  } catch (error) {
    console.error('Error reading contact page content:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to load contact page content' },
      { status: 500 }
    )
  }
})

// Save contact page content
export const POST = withAdminAuth(async (request: NextRequest) => {
  try {
    console.log('POST contact page content request received')
    
    const body = await request.json()
    console.log('Request body received:', { 
      hasHeroTitle: !!body.heroTitle,
      hasEmail: !!body.email,
      benefitsCount: body.benefits?.length || 0
    })
    
    // Validate required fields
    if (!body.heroTitle || !body.email) {
      console.log('Validation failed: missing required fields')
      return NextResponse.json(
        { success: false, error: 'Hero title and email are required' },
        { status: 400 }
      )
    }

    const content: ContactPageContent = {
      heroTitle: body.heroTitle?.trim() || '',
      heroSubtitle: body.heroSubtitle?.trim() || '',
      heroDescription: body.heroDescription?.trim() || '',
      email: body.email?.trim() || '',
      phone: body.phone?.trim() || '',
      location: body.location?.trim() || '',
      linkedinUrl: body.linkedinUrl?.trim() || '',
      twitterUrl: body.twitterUrl?.trim() || '',
      whyWorkTitle: body.whyWorkTitle?.trim() || '',
      whyWorkDescription: body.whyWorkDescription?.trim() || '',
      benefits: Array.isArray(body.benefits) ? body.benefits.filter((b: any) => b.text?.trim()) : [],
      responseTime: body.responseTime?.trim() || '',
      yearsExperience: body.yearsExperience?.trim() || '',
      projectsDelivered: body.projectsDelivered?.trim() || '',
      updatedAt: new Date().toISOString()
    }

    console.log('Saving contact page content to database...')
    
    // Use upsert to either create or update the content
    await prisma.contentSection.upsert({
      where: {
        sectionName: CONTACT_SECTION_NAME
      },
      update: {
        content: JSON.stringify(content),
        metadata: 'Contact page content and settings',
        updatedAt: new Date()
      },
      create: {
        sectionName: CONTACT_SECTION_NAME,
        content: JSON.stringify(content),
        metadata: 'Contact page content and settings',
        isActive: true
      }
    })
    
    console.log('Contact page content saved successfully to database')

    return NextResponse.json({
      success: true,
      message: 'Contact page content saved successfully',
      data: content
    })
  } catch (error) {
    console.error('Error saving contact page content:', error)
    return NextResponse.json(
      { success: false, error: `Failed to save contact page content: ${error instanceof Error ? error.message : 'Unknown error'}` },
      { status: 500 }
    )
  }
})