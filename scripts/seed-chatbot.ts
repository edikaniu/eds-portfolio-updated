// Script to seed chatbot knowledge and questions from frontend into the database
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// Knowledge base data from the current hardcoded aiKnowledge
const knowledgeData = [
  {
    title: "Professional Experience",
    content: "Edikan has 7+ years in marketing and growth, currently Marketing Manager at Suretree Systems. He specializes in scaling products through data-driven growth strategies and AI-powered marketing automation.",
    category: "experience",
    sourceType: "manual",
    priority: 10
  },
  {
    title: "Core Skills & Expertise",
    content: "Edikan's core skills include: Growth marketing, AI implementation, product strategy, team leadership, email marketing, SEO, PPC. He's particularly strong in implementing AI tools to optimize marketing workflows and drive growth.",
    category: "skills",
    sourceType: "manual",
    priority: 9
  },
  {
    title: "Key Achievements & Results",
    content: "Some of Edikan's key achievements: Scaled users from 100 to 10,000+, grew email list by 733%, increased organic traffic by 200%, boosted productivity by 20%. These results demonstrate his ability to drive significant growth across multiple channels.",
    category: "achievements",
    sourceType: "manual",
    priority: 8
  },
  {
    title: "Tools & Technologies",
    content: "Edikan works with various tools including: ChatGPT, Claude, HubSpot, Google Analytics, Mailchimp, n8n, Zapier. He's particularly skilled at leveraging AI tools for marketing automation and productivity enhancement.",
    category: "tools",
    sourceType: "manual",
    priority: 7
  },
  {
    title: "Contact Information",
    content: "You can reach Edikan at: edikanudoibuot@gmail.com, LinkedIn: /in/edikanudoibuot, Twitter: @edikanudoibuot. Feel free to connect for collaboration opportunities or to discuss growth strategies.",
    category: "contact",
    sourceType: "manual",
    priority: 6
  },
  {
    title: "AI & Automation Expertise",
    content: "Edikan has implemented AI initiatives that boosted team productivity by 20%. He uses tools like ChatGPT, Claude, and n8n to automate marketing workflows and optimize campaigns.",
    category: "ai",
    sourceType: "manual",
    priority: 5
  },
  {
    title: "Growth Marketing Specialization",
    content: "Edikan specializes in growth marketing, having scaled products from hundreds to thousands of users. His approach combines data-driven strategies with AI-powered automation for maximum impact.",
    category: "marketing",
    sourceType: "manual",
    priority: 4
  }
]

// Predefined questions based on the current chat patterns
const questionsData = [
  {
    questionText: "What's your professional background?",
    icon: "User",
    category: "experience",
    order: 1
  },
  {
    questionText: "Tell me about your experience",
    icon: "Briefcase",
    category: "experience",
    order: 2
  },
  {
    questionText: "What are your core skills?",
    icon: "Star",
    category: "skills",
    order: 3
  },
  {
    questionText: "What's your expertise in?",
    icon: "Target",
    category: "skills",
    order: 4
  },
  {
    questionText: "What are your key achievements?",
    icon: "Trophy",
    category: "achievements",
    order: 5
  },
  {
    questionText: "Can you share some results you've delivered?",
    icon: "TrendingUp",
    category: "achievements",
    order: 6
  },
  {
    questionText: "What tools do you work with?",
    icon: "Wrench",
    category: "tools",
    order: 7
  },
  {
    questionText: "Tell me about the technologies you use",
    icon: "Settings",
    category: "tools",
    order: 8
  },
  {
    questionText: "How can I contact you?",
    icon: "Mail",
    category: "contact",
    order: 9
  },
  {
    questionText: "How can I reach out to you?",
    icon: "MessageSquare",
    category: "contact",
    order: 10
  },
  {
    questionText: "What's your experience with AI?",
    icon: "Bot",
    category: "ai",
    order: 11
  },
  {
    questionText: "Tell me about automation in your work",
    icon: "Zap",
    category: "ai",
    order: 12
  },
  {
    questionText: "What's your approach to growth marketing?",
    icon: "BarChart3",
    category: "marketing",
    order: 13
  },
  {
    questionText: "How do you drive marketing growth?",
    icon: "TrendingUp",
    category: "marketing",
    order: 14
  }
]

async function seedChatbot() {
  try {
    console.log('Starting to seed chatbot data...')
    
    // Seed knowledge base
    console.log('Seeding knowledge base...')
    for (const knowledge of knowledgeData) {
      const existingKnowledge = await prisma.chatbotKnowledge.findFirst({
        where: { 
          title: knowledge.title,
          category: knowledge.category
        }
      })

      if (existingKnowledge) {
        // Update existing knowledge
        await prisma.chatbotKnowledge.update({
          where: { id: existingKnowledge.id },
          data: {
            title: knowledge.title,
            content: knowledge.content,
            category: knowledge.category,
            sourceType: knowledge.sourceType,
            priority: knowledge.priority,
            isActive: true
          }
        })
        console.log(`Updated knowledge: ${knowledge.title}`)
      } else {
        // Create new knowledge
        await prisma.chatbotKnowledge.create({
          data: {
            title: knowledge.title,
            content: knowledge.content,
            category: knowledge.category,
            sourceType: knowledge.sourceType,
            priority: knowledge.priority,
            isActive: true
          }
        })
        console.log(`Created knowledge: ${knowledge.title}`)
      }
    }
    
    // Seed questions
    console.log('Seeding questions...')
    for (const question of questionsData) {
      const existingQuestion = await prisma.chatbotQuestion.findFirst({
        where: { 
          questionText: question.questionText
        }
      })

      if (existingQuestion) {
        // Update existing question
        await prisma.chatbotQuestion.update({
          where: { id: existingQuestion.id },
          data: {
            questionText: question.questionText,
            icon: question.icon,
            category: question.category,
            order: question.order,
            isActive: true,
            usageCount: 0
          }
        })
        console.log(`Updated question: ${question.questionText}`)
      } else {
        // Create new question
        await prisma.chatbotQuestion.create({
          data: {
            questionText: question.questionText,
            icon: question.icon,
            category: question.category,
            order: question.order,
            isActive: true,
            usageCount: 0
          }
        })
        console.log(`Created question: ${question.questionText}`)
      }
    }
    
    console.log('Chatbot data seeded successfully!')
  } catch (error) {
    console.error('Error seeding chatbot:', error)
  } finally {
    await prisma.$disconnect()
  }
}

seedChatbot()