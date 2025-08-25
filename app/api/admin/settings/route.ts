import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { withAdminAuth } from '@/lib/admin-middleware'
import { prisma } from '@/lib/prisma'

const SettingsSchema = z.object({
  siteName: z.string().min(1, 'Site name is required').max(100, 'Site name too long'),
  siteDescription: z.string().max(300, 'Description too long').optional(),
  contactEmail: z.string().email('Valid email required').max(100, 'Email too long'),
  adminEmail: z.string().email('Valid email required').max(100, 'Email too long'),
  maintenanceMode: z.boolean().default(false),
  analyticsEnabled: z.boolean().default(true)
})

// GET - Fetch current settings
export const GET = withAdminAuth(async (request: NextRequest) => {
  try {
    const settings = await prisma.siteSettings.findFirst({
      orderBy: { updatedAt: 'desc' }
    })

    if (!settings) {
      // Return default settings if none exist
      return NextResponse.json({
        success: true,
        data: {
          siteName: 'Edikan Udoibuot Portfolio',
          siteDescription: 'Software Engineer & Tech Innovator',
          contactEmail: 'contact@edikanudoibuot.com',
          adminEmail: 'admin@edikanudoibuot.com',
          maintenanceMode: false,
          analyticsEnabled: true
        }
      })
    }

    return NextResponse.json({
      success: true,
      data: settings
    })
  } catch (error) {
    console.error('Error fetching settings:', error)
    return NextResponse.json(
      { success: false, message: 'Failed to fetch settings' },
      { status: 500 }
    )
  }
})

// POST - Update settings
export const POST = withAdminAuth(async (request: NextRequest) => {
  try {
    const body = await request.json()
    const validationResult = SettingsSchema.safeParse(body)

    if (!validationResult.success) {
      return NextResponse.json(
        {
          success: false,
          message: 'Invalid input data',
          errors: validationResult.error.errors
        },
        { status: 400 }
      )
    }

    const data = validationResult.data

    const settings = await prisma.siteSettings.upsert({
      where: { id: 'default' },
      update: {
        siteName: data.siteName,
        siteDescription: data.siteDescription,
        contactEmail: data.contactEmail,
        adminEmail: data.adminEmail,
        maintenanceMode: data.maintenanceMode,
        analyticsEnabled: data.analyticsEnabled,
        updatedAt: new Date()
      },
      create: {
        id: 'default',
        siteName: data.siteName,
        siteDescription: data.siteDescription,
        contactEmail: data.contactEmail,
        adminEmail: data.adminEmail,
        maintenanceMode: data.maintenanceMode,
        analyticsEnabled: data.analyticsEnabled
      }
    })

    return NextResponse.json({
      success: true,
      message: 'Settings updated successfully',
      data: settings
    })
  } catch (error) {
    console.error('Error updating settings:', error)
    return NextResponse.json(
      { success: false, message: 'Failed to update settings' },
      { status: 500 }
    )
  }
})