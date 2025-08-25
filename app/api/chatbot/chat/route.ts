import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'

const ChatSchema = z.object({
  message: z.string().min(1, 'Message is required').max(1000, 'Message too long'),
  conversationId: z.string().optional()
})

interface OpenAIMessage {
  role: 'system' | 'user' | 'assistant'
  content: string
}

async function getOpenAIResponse(messages: OpenAIMessage[], settings: any): Promise<string> {
  try {
    // Decrypt API key (in production, use proper decryption)
    const apiKey = Buffer.from(settings.openaiApiKey, 'base64').toString()
    
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: settings.modelName || 'gpt-3.5-turbo',
        messages,
        temperature: settings.temperature || 0.7,
        max_tokens: settings.maxTokens || 1000
      })
    })

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.statusText}`)
    }

    const data = await response.json()
    return data.choices[0]?.message?.content || 'I apologize, but I could not generate a response.'
  } catch (error) {
    console.error('OpenAI API error:', error)
    throw error
  }
}

async function searchKnowledgeBase(query: string): Promise<string> {
  try {
    const searchTerms = query.toLowerCase().split(' ').filter(term => term.length > 2)
    
    if (searchTerms.length === 0) {
      return "I don't have specific information about that topic. Could you please rephrase your question?"
    }

    // Search in knowledge base (case-insensitive for SQLite using contains)
    const knowledgeItems = await prisma.chatbotKnowledge.findMany({
      where: {
        isActive: true,
        OR: searchTerms.flatMap(term => [
          { title: { contains: term } },
          { content: { contains: term } },
          { category: { contains: term } }
        ])
      },
      orderBy: [
        { priority: 'desc' },
        { createdAt: 'desc' }
      ],
      take: 3
    })

    if (knowledgeItems.length === 0) {
      return "I don't have specific information about that topic in my knowledge base. However, Edikan would be happy to discuss this with you directly. Would you like me to help you connect with him?"
    }

    // Return the most relevant knowledge item's content
    return knowledgeItems[0].content
  } catch (error) {
    console.error('Knowledge base search error:', error)
    return "I'm experiencing some technical difficulties right now. Please try asking your question again."
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const validationResult = ChatSchema.safeParse(body)

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

    const { message, conversationId } = validationResult.data

    // Get AI settings
    const settings = await prisma.chatbotSettings.findFirst({
      orderBy: { updatedAt: 'desc' }
    })

    let response = ''
    let responseSource = 'knowledge_base'

    // Try OpenAI if enabled and API key exists
    if (settings?.isActive && settings?.openaiApiKey) {
      try {
        const systemPrompt = 'You are a helpful assistant for Edikan Udoibuot\'s portfolio website. Provide professional and informative responses about his skills, experience, and projects.'

        const knowledgeContext = await searchKnowledgeBase(message)
        
        const messages: OpenAIMessage[] = [
          {
            role: 'system',
            content: `${systemPrompt}\n\nKnowledge base context:\n${knowledgeContext}`
          },
          {
            role: 'user',
            content: message
          }
        ]

        response = await getOpenAIResponse(messages, settings)
        responseSource = 'openai'
      } catch (error) {
        console.error('OpenAI error, falling back to knowledge base:', error)
        if (settings.fallbackEnabled) {
          response = await searchKnowledgeBase(message)
          responseSource = 'knowledge_base_fallback'
        } else {
          response = 'I apologize, but I\'m currently unable to process your request. Please try again later.'
          responseSource = 'error'
        }
      }
    } else {
      // Use knowledge base only
      response = await searchKnowledgeBase(message)
    }

    // Create conversation record
    const conversation = await prisma.chatbotConversation.create({
      data: {
        sessionId: conversationId || `conv_${Date.now()}`,
        question: message,
        response: response,
        responseSource,
        aiUsed: responseSource === 'openai',
        responseTime: null
      }
    })

    return NextResponse.json({
      success: true,
      data: {
        response,
        conversationId: conversation.sessionId,
        source: responseSource
      }
    })
  } catch (error) {
    console.error('Chat error:', error)
    return NextResponse.json(
      { success: false, message: 'Failed to process chat request' },
      { status: 500 }
    )
  }
}