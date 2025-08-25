import { NextRequest, NextResponse } from 'next/server'
import { withAdminAuth } from '@/lib/admin-middleware'
import { withErrorHandling } from '@/lib/error-handler'
import { analyticsService } from '@/lib/analytics/analytics-service'
import { prisma } from '@/lib/prisma'

async function handleAnalyticsRequest(request: NextRequest): Promise<NextResponse> {
  const { searchParams } = new URL(request.url)
  const action = searchParams.get('action') || 'overview'

  switch (request.method) {
    case 'GET':
      return await handleGetRequest(request, action)
    case 'POST':
      return await handlePostRequest(request, action)
    default:
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'METHOD_NOT_ALLOWED',
            message: 'Method not allowed'
          }
        },
        { status: 405 }
      )
  }
}

async function handleGetRequest(
  request: NextRequest,
  action: string
): Promise<NextResponse> {
  const { searchParams } = new URL(request.url)
  
  switch (action) {
    case 'overview':
    case 'chatbot':
      return await getChatbotAnalytics(request)
      
    case 'site-analytics':
      return await getSiteAnalytics(request)
      
    case 'metrics':
      try {
        const metrics = analyticsService.getRealTimeMetrics()
        return NextResponse.json({
          success: true,
          data: metrics
        })
      } catch (error) {
        throw new Error(error instanceof Error ? error.message : 'Failed to get real-time metrics')
      }

    case 'traffic':
      try {
        const period = searchParams.get('period') || '7d'
        const groupBy = searchParams.get('groupBy') || 'hour'
        const trafficData = await analyticsService.getTrafficData(period, groupBy)
        return NextResponse.json({
          success: true,
          data: trafficData
        })
      } catch (error) {
        throw new Error(error instanceof Error ? error.message : 'Failed to get traffic data')
      }

    case 'top-pages':
      try {
        const limit = parseInt(searchParams.get('limit') || '10')
        const startDate = new Date(searchParams.get('startDate') || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString())
        const endDate = new Date(searchParams.get('endDate') || new Date().toISOString())
        const topPages = await analyticsService.getTopPages(startDate, endDate, limit)
        return NextResponse.json({
          success: true,
          data: topPages
        })
      } catch (error) {
        throw new Error(error instanceof Error ? error.message : 'Failed to get top pages')
      }

    case 'export':
      try {
        const format = searchParams.get('format') || 'json'
        const startDate = new Date(searchParams.get('startDate') || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString())
        const endDate = new Date(searchParams.get('endDate') || new Date().toISOString())
        const data = await analyticsService.exportData(startDate, endDate, format)
        const headers: HeadersInit = {
          'Content-Type': format === 'csv' ? 'text/csv' : 'application/json',
          'Content-Disposition': `attachment; filename="analytics-${startDate.toISOString().split('T')[0]}-${endDate.toISOString().split('T')[0]}.${format}"`
        }
        return new NextResponse(data, { headers })
      } catch (error) {
        throw new Error(error instanceof Error ? error.message : 'Failed to export analytics data')
      }

    default:
      return NextResponse.json({
        success: true,
        data: {
          service: 'Analytics API',
          endpoints: {
            'GET /api/admin/analytics?action=overview': 'Get chatbot analytics overview',
            'GET /api/admin/analytics?action=site-analytics': 'Get comprehensive site analytics',
            'GET /api/admin/analytics?action=metrics': 'Get real-time metrics',
            'GET /api/admin/analytics?action=traffic': 'Get traffic data',
            'GET /api/admin/analytics?action=top-pages': 'Get top pages',
            'GET /api/admin/analytics?action=export': 'Export analytics data',
            'POST /api/admin/analytics?action=track': 'Track custom event',
            'POST /api/admin/analytics?action=page-view': 'Track page view'
          }
        }
      })
  }
}

async function handlePostRequest(
  request: NextRequest,
  action: string
): Promise<NextResponse> {
  const body = await request.json()

  switch (action) {
    case 'track':
      try {
        const { eventType, eventData, userId, sessionId, ipAddress, userAgent } = body
        if (!eventType) {
          return NextResponse.json(
            {
              success: false,
              error: { code: 'MISSING_EVENT_TYPE', message: 'Event type is required' }
            },
            { status: 400 }
          )
        }
        await analyticsService.trackEvent({
          eventType,
          eventData: eventData || {},
          userId: userId || null,
          sessionId: sessionId || null,
          ipAddress: ipAddress || null,
          userAgent: userAgent || null,
          page: eventData?.page || null,
          referrer: eventData?.referrer || null
        })
        return NextResponse.json({
          success: true,
          message: 'Event tracked successfully'
        })
      } catch (error) {
        throw new Error(error instanceof Error ? error.message : 'Failed to track event')
      }

    case 'page-view':
      try {
        const { page, title, userId, sessionId, ipAddress, userAgent, referrer, loadTime } = body
        if (!page) {
          return NextResponse.json(
            {
              success: false,
              error: { code: 'MISSING_PAGE', message: 'Page is required' }
            },
            { status: 400 }
          )
        }
        await analyticsService.trackPageView({
          page,
          title: title || '',
          userId: userId || null,
          sessionId: sessionId || null,
          ipAddress: ipAddress || null,
          userAgent: userAgent || null,
          referrer: referrer || null,
          loadTime: loadTime || null
        })
        return NextResponse.json({
          success: true,
          message: 'Page view tracked successfully'
        })
      } catch (error) {
        throw new Error(error instanceof Error ? error.message : 'Failed to track page view')
      }

    default:
      return NextResponse.json(
        {
          success: false,
          error: { code: 'INVALID_ACTION', message: 'Invalid action specified' }
        },
        { status: 400 }
      )
  }
}

async function getSiteAnalytics(request: NextRequest): Promise<NextResponse> {
  try {
    const { searchParams } = new URL(request.url)
    const startDate = new Date(searchParams.get('startDate') || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString())
    const endDate = new Date(searchParams.get('endDate') || new Date().toISOString())
    
    const [report, metrics, topPages, trafficData] = await Promise.all([
      analyticsService.generateReport(startDate, endDate),
      analyticsService.getRealTimeMetrics(),
      analyticsService.getTopPages(startDate, endDate, 10),
      analyticsService.getTrafficData('30d', 'day')
    ])

    return NextResponse.json({
      success: true,
      data: {
        overview: report,
        realTimeMetrics: metrics,
        topPages,
        traffic: trafficData
      }
    })
  } catch (error) {
    throw new Error(error instanceof Error ? error.message : 'Failed to get site analytics')
  }
}

// Legacy chatbot analytics function
async function getChatbotAnalytics(request: NextRequest): Promise<NextResponse> {
  try {
    const { searchParams } = new URL(request.url)
    const days = parseInt(searchParams.get('days') || '30')
    const startDate = new Date()
    startDate.setDate(startDate.getDate() - days)

    // Run all analytics queries in parallel for better performance
    const [
      chatbotConversations,
      recentConversations,
      popularQuestions,
      knowledgeBaseStats,
      contentStats,
      caseStudyStats,
      chatbotSettings,
      responseSourceStats,
      dailyConversations
    ] = await Promise.all([
      // Total conversations
      prisma.chatbotConversation.count({
        where: {
          createdAt: {
            gte: startDate
          }
        }
      }),

      // Recent conversations with details
      prisma.chatbotConversation.findMany({
        where: {
          createdAt: {
            gte: startDate
          }
        },
        orderBy: {
          createdAt: 'desc'
        },
        take: 10
      }),

      // Popular questions from knowledge base
      prisma.chatbotQuestion.findMany({
        where: {
          isActive: true
        },
        orderBy: {
          usageCount: 'desc'
        },
        take: 5
      }),

      // Knowledge base statistics
      prisma.chatbotKnowledge.groupBy({
        by: ['category'],
        _count: {
          id: true
        },
        where: {
          isActive: true
        }
      }),

      // Content section statistics
      prisma.contentSection.count({
        where: {
          isActive: true
        }
      }),

      // Case study statistics
      prisma.caseStudy.count({
        where: {
          isActive: true
        }
      }),

      // Chatbot settings status
      prisma.chatbotSettings.findFirst({
        orderBy: {
          updatedAt: 'desc'
        }
      }),

      // Response source breakdown
      prisma.chatbotConversation.groupBy({
        by: ['responseSource'],
        _count: {
          id: true
        },
        where: {
          createdAt: {
            gte: startDate
          }
        }
      }),

      // Daily conversation trends
      prisma.chatbotConversation.findMany({
        where: {
          createdAt: {
            gte: startDate
          }
        },
        select: {
          createdAt: true,
          responseSource: true,
          satisfactionRating: true,
          responseTime: true
        },
        orderBy: {
          createdAt: 'asc'
        }
      })
    ])

    // Process daily conversation data for charts
    const dailyStats = dailyConversations.reduce((acc, conv) => {
      const date = conv.createdAt.toISOString().split('T')[0]
      if (!acc[date]) {
        acc[date] = { date, count: 0, avgRating: 0, avgResponseTime: 0, ratings: [], responseTimes: [] }
      }
      acc[date].count++
      if (conv.satisfactionRating) {
        acc[date].ratings.push(conv.satisfactionRating)
      }
      if (conv.responseTime) {
        acc[date].responseTimes.push(conv.responseTime)
      }
      return acc
    }, {} as any)

    // Calculate averages
    Object.values(dailyStats).forEach((day: any) => {
      if (day.ratings.length > 0) {
        day.avgRating = day.ratings.reduce((a: number, b: number) => a + b, 0) / day.ratings.length
      }
      if (day.responseTimes.length > 0) {
        day.avgResponseTime = day.responseTimes.reduce((a: number, b: number) => a + b, 0) / day.responseTimes.length
      }
      delete day.ratings
      delete day.responseTimes
    })

    // Calculate satisfaction metrics
    const satisfactionRatings = dailyConversations
      .map(conv => conv.satisfactionRating)
      .filter(rating => rating !== null)
    
    const avgSatisfaction = satisfactionRatings.length > 0 
      ? satisfactionRatings.reduce((a, b) => a + b!, 0) / satisfactionRatings.length 
      : 0

    // Calculate response time metrics
    const responseTimes = dailyConversations
      .map(conv => conv.responseTime)
      .filter(time => time !== null)
    
    const avgResponseTime = responseTimes.length > 0 
      ? responseTimes.reduce((a, b) => a + b!, 0) / responseTimes.length 
      : 0

    // System health metrics
    const systemHealth = {
      chatbotActive: chatbotSettings?.isActive || false,
      aiEnabled: !!(chatbotSettings?.openaiApiKey && chatbotSettings.isActive),
      fallbackEnabled: chatbotSettings?.fallbackEnabled || false,
      knowledgeBaseSize: knowledgeBaseStats.reduce((acc, stat) => acc + stat._count.id, 0)
    }

    const analytics = {
      overview: {
        totalConversations: chatbotConversations,
        avgSatisfactionRating: Number(avgSatisfaction.toFixed(2)),
        avgResponseTime: Number(avgResponseTime.toFixed(0)),
        contentSections: contentStats,
        caseStudies: caseStudyStats,
        knowledgeItems: systemHealth.knowledgeBaseSize
      },
      charts: {
        dailyConversations: Object.values(dailyStats),
        knowledgeByCategory: knowledgeBaseStats.map(stat => ({
          category: stat.category,
          count: stat._count.id
        })),
        responseSourceBreakdown: responseSourceStats.map(stat => ({
          source: stat.responseSource,
          count: stat._count.id
        }))
      },
      systemHealth,
      recentActivity: {
        conversations: recentConversations.map(conv => ({
          id: conv.id,
          question: conv.question.substring(0, 100) + (conv.question.length > 100 ? '...' : ''),
          response: conv.response.substring(0, 100) + (conv.response.length > 100 ? '...' : ''),
          source: conv.responseSource,
          rating: conv.satisfactionRating,
          createdAt: conv.createdAt
        })),
        popularQuestions: popularQuestions.map(q => ({
          id: q.id,
          question: q.questionText,
          usage: q.usageCount,
          category: q.category
        }))
      }
    }

    return NextResponse.json({
      success: true,
      data: analytics
    })
  } catch (error) {
    console.error('Error fetching analytics:', error)
    return NextResponse.json(
      { success: false, message: 'Failed to fetch analytics data' },
      { status: 500 }
    )
  }
}

export const GET = withAdminAuth(withErrorHandling(handleAnalyticsRequest))
export const POST = withAdminAuth(withErrorHandling(handleAnalyticsRequest))