import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

const CONTACT_SECTION_NAME = 'contact_page_content'

// Get contact page content (public endpoint)
export async function GET(request: NextRequest) {
  try {
    // Try to get existing content from database
    const existingContent = await prisma.contentSection.findUnique({
      where: {
        sectionName: CONTACT_SECTION_NAME
      }
    })

    if (!existingContent) {
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
          projectsDelivered: "50+"
        }
      })
    }

    // Parse the stored JSON content
    const content = JSON.parse(existingContent.content)

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
}