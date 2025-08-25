import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { withAdminAuth } from '@/lib/admin-middleware'
import { prisma } from '@/lib/prisma'

const SettingsSchema = z.object({
  openaiApiKey: z.string().min(1, 'API key is required'),
  modelName: z.string().min(1, 'Model is required'),
  temperature: z.number().min(0).max(2).default(0.7),
  maxTokens: z.number().min(1).max(4000).default(1000),
  isActive: z.boolean().default(true),
  fallbackEnabled: z.boolean().default(true),
  costLimit: z.number().min(0).default(100)
})

// GET - Fetch current AI settings
export const GET = withAdminAuth(async (request: NextRequest) => {
  try {
    const settings = await prisma.chatbotSettings.findFirst({
      orderBy: { updatedAt: 'desc' }
    })

    if (!settings) {
      return NextResponse.json({
        success: true,
        data: {
          isActive: false,
          modelName: 'gpt-3.5-turbo',
          temperature: 0.7,
          maxTokens: 1000,
          fallbackEnabled: true,
          costLimit: 100,
          hasApiKey: false
        }
      })
    }

    // Don't return the API key in responses
    const { openaiApiKey, ...publicSettings } = settings
    
    return NextResponse.json({
      success: true,
      data: {
        ...publicSettings,
        hasApiKey: !!openaiApiKey
      }
    })
  } catch (error) {
    console.error('Error fetching AI settings:', error)
    return NextResponse.json(
      { success: false, message: 'Failed to fetch AI settings' },
      { status: 500 }
    )
  }
})

// POST - Update AI settings
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

    // Encrypt API key for storage (in production, use proper encryption)
    const encryptedApiKey = Buffer.from(data.openaiApiKey).toString('base64')

    const settings = await prisma.chatbotSettings.upsert({
      where: { id: 'default' },
      update: {
        openaiApiKey: encryptedApiKey,
        modelName: data.modelName,
        temperature: data.temperature,
        maxTokens: data.maxTokens,
        isActive: data.isActive,
        fallbackEnabled: data.fallbackEnabled,
        costLimit: data.costLimit
      },
      create: {
        id: 'default',
        openaiApiKey: encryptedApiKey,
        modelName: data.modelName,
        temperature: data.temperature,
        maxTokens: data.maxTokens,
        isActive: data.isActive,
        fallbackEnabled: data.fallbackEnabled,
        costLimit: data.costLimit
      }
    })

    return NextResponse.json({
      success: true,
      message: 'AI settings updated successfully',
      data: {
        ...settings,
        openaiApiKey: undefined,
        hasApiKey: true
      }
    })
  } catch (error) {
    console.error('Error updating AI settings:', error)
    return NextResponse.json(
      { success: false, message: 'Failed to update AI settings' },
      { status: 500 }
    )
  }
})

// DELETE - Remove API key
export const DELETE = withAdminAuth(async (request: NextRequest) => {
  try {
    await prisma.chatbotSettings.update({
      where: { id: 'default' },
      data: {
        openaiApiKey: null,
        isActive: false
      }
    })

    return NextResponse.json({
      success: true,
      message: 'API key removed successfully'
    })
  } catch (error) {
    console.error('Error removing API key:', error)
    return NextResponse.json(
      { success: false, message: 'Failed to remove API key' },
      { status: 500 }
    )
  }
})