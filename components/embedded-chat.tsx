"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Send, User, Bot, Briefcase, Code, Lightbulb, Heart, Mail } from "lucide-react"

interface Message {
  id: string
  content: string
  isUser: boolean
  timestamp: Date
}

const suggestedQuestions = [
  { icon: User, text: "Tell me about yourself", query: "Tell me about Edikan's background and experience" },
  { icon: Briefcase, text: "Current Work", query: "What is Edikan currently working on?" },
  { icon: Code, text: "Tech Stack", query: "What technologies and tools does Edikan use?" },
  {
    icon: Lightbulb,
    text: "Project Highlights",
    query: "What are Edikan's most impressive projects and achievements?",
  },
  { icon: Heart, text: "Interests", query: "What are Edikan's interests and passions?" },
  { icon: Mail, text: "Contact", query: "How can I get in touch with Edikan?" },
]

const aiResponses: Record<string, string> = {
  "tell me about yourself":
    "I'm Edikan Udoibuot, a dynamic Marketing & Growth Leader with 7+ years of experience delivering scalable growth strategies across fintech, SaaS, media, and emerging tech sectors. I have a proven track record of leading cross-functional teams to drive full-funnel marketing, from go-to-market execution to user acquisition, product positioning, and customer retention. I've successfully scaled product adoption from 100 to 10,000+ users, grew email lists by 733%, and implemented AI-driven process automation that boosted team productivity by over 20%.",
  background:
    "I have 7 years of experience in marketing and growth across various industries including fintech, SaaS, media, and emerging tech. I'm passionate about using data, creativity, and experimentation to build purpose-driven brands. My expertise spans from scaling startups to working with luxury brands like Rolex, Gucci, and Cartier at Polo Limited.",
  "current work":
    "I'm currently the Marketing Manager at Suretree Systems (since August 2023), where I've implemented multiple AI-powered initiatives including keyword research automation, AI-generated blog drafts, avatar video production, and AI-driven design mockups. This has boosted team productivity by over 20% and increased organic traffic by 200% in just 4 months. I'm also the Head of Integrated Communications at Household of David, where I delivered 80% brand awareness growth and grew social audience by 70,000 followers in 6 months.",
  experience:
    "My career progression includes: Marketing Manager at Suretree Systems (2023-Present), Product Marketing Lead at Suretree Systems (2022-2023), Senior Campaign Manager at Suretree Systems (2022), Growth Marketing Lead at Sogital Digital Agency (2020-2022), Senior Digital Marketing Executive at Polo Limited (2019-2020), and various roles at TOY Media Agency, Wild Fusion Agency, and Exquisite Digital Labeling. I've also held leadership positions at Household of David since 2020.",
  achievements:
    "Some of my key achievements include: 733% growth in email subscribers (3,000 to 25,000) in 3 months, scaling product users from 100 to 10,000+ in 2 months, achieving 100X ROAS at Polo Limited, increasing organic traffic by 200% in 4 months, delivering 5X ROAS for multiple clients, growing social audience by 70,000+ followers in 6 months, and reducing customer acquisition costs across multiple campaigns.",
  "project highlights":
    "Major project highlights: At Suretree Systems, I scaled users from 100 to 10,000+ in 2 months and achieved 733% email list growth. At Polo Limited, I generated 600+ luxury leads in 7 months with 100X ROAS working with brands like Rolex and Gucci. At Household of David, I led digital campaigns generating 5,000+ leads each with 68% physical attendance and 20,000+ online attendees. At Sogital, I designed chatbot funnels generating 4,500+ qualified leads in 3 months.",
  "tech stack":
    "My comprehensive tech stack includes: Marketing platforms (HubSpot, Mailchimp, Meta Ads, Google Ads, LinkedIn Ads), Analytics (Google Analytics, performance tracking tools), Automation (Zapier, n8n, marketing automation), AI tools (ChatGPT, Claude for content and strategy), Design (Canva, Adobe Creative Suite), CRM systems, SEO/SEM tools, A/B testing platforms, and various social media management tools.",
  skills:
    "My core skills include: Growth Marketing, Funnel Optimization, SEO/SEM, Paid Advertising (Meta, Google, LinkedIn), Performance Marketing, Product Marketing, Marketing Analytics, A/B Testing, Budget Management, Brand Strategy, Go-to-Market Strategy, Campaign Management, CRM, Public Relations, Cross-functional Team Leadership, Marketing Automation, Customer Acquisition, Retention Strategy, and Generative AI implementation.",
  education:
    "I'm currently pursuing a Masters in Sales and Marketing at Rome Business School (expected 2026). I completed a Diploma in Product Marketing from AltSchool Africa (2024), studied Blockchain Revolution in Financial Services at INSEAD (2022), and hold a Bachelor's in Mechanical Engineering from University of Nigeria (2016). I've also completed various certifications in prompt engineering, product marketing, design thinking, agile methodology, and blockchain.",
  training:
    "Recent training includes: Introduction to Prompt Engineering for Generative AI (LinkedIn), Become a Product Marketing Manager (Udemy), Design Thinking (IBMI), Introduction to Agile (IBM), Blockchain for Managers (Product School), How to Achieve Product-Market Fit (Product School), How to Build Digital Products (Product School), and Content Marketing (HubSpot).",
  suretree:
    "At Suretree Systems, I've held three progressive roles: Marketing Manager (2023-Present), Product Marketing Lead (2022-2023), and Senior Campaign Manager (2022). Key achievements include implementing AI initiatives that boosted productivity by 20%, scaling users from 100 to 10,000+ in 2 months, achieving 733% email growth, increasing organic traffic by 200%, and improving conversion rates by 30% through performance optimization.",
  "polo limited":
    "At Polo Limited, I worked as Senior Digital Marketing Executive managing luxury brands including Rolex, Gucci, Cartier, and Swarovski. I generated 600+ luxury leads in 7 months, achieved 100X ROAS, improved email open rates by 40% and click-through rates by 30%, and led cross-functional teams resulting in 20% engagement boost and 15% conversion uplift.",
  "household of david":
    "At Household of David, I currently serve as Head of Integrated Communications and previously as Head of Social Media. I delivered 80% brand awareness growth, led 60+ volunteers, grew social audience by 70,000+ followers in 6 months, achieved 60% engagement growth, and led digital campaigns for major conferences generating 5,000+ leads each with 500,000+ post-event reach.",
  "ai marketing":
    "I'm a pioneer in AI-driven marketing, having implemented multiple AI initiatives at Suretree Systems including keyword research automation, AI-generated content, avatar video production, and design mockups. These implementations boosted team productivity by over 20% and significantly improved campaign performance. I stay current with AI tools like ChatGPT and Claude for strategy optimization.",
  contact:
    "You can reach me via email at edikanudoibuot@gmail.com, connect with me on LinkedIn at linkedin.com/in/edikanudoibuot, or follow me on X (Twitter) @edikanudoibuot. I'm always open to discussing growth marketing opportunities, AI-powered strategies, and potential collaborations!",
}

export function EmbeddedChat() {
  const [messages, setMessages] = useState<Message[]>([])
  const [inputValue, setInputValue] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const generateResponse = async (query: string): Promise<string> => {
    const lowerQuery = query.toLowerCase()

    // Check for background/about questions
    if (
      lowerQuery.includes("about") ||
      lowerQuery.includes("background") ||
      lowerQuery.includes("who are you") ||
      lowerQuery.includes("tell me about yourself") ||
      lowerQuery.includes("introduce") ||
      lowerQuery.includes("yourself")
    ) {
      return aiResponses["tell me about yourself"]
    }

    // Current work questions
    if (
      lowerQuery.includes("current") ||
      lowerQuery.includes("working on") ||
      lowerQuery.includes("job") ||
      lowerQuery.includes("role") ||
      lowerQuery.includes("position") ||
      lowerQuery.includes("now")
    ) {
      return aiResponses["current work"]
    }

    // Experience questions
    if (
      lowerQuery.includes("experience") ||
      lowerQuery.includes("work history") ||
      lowerQuery.includes("career") ||
      lowerQuery.includes("worked") ||
      lowerQuery.includes("jobs") ||
      lowerQuery.includes("roles")
    ) {
      return aiResponses["experience"]
    }

    // Achievement questions
    if (
      lowerQuery.includes("achievement") ||
      lowerQuery.includes("success") ||
      lowerQuery.includes("results") ||
      lowerQuery.includes("accomplishment") ||
      lowerQuery.includes("highlight") ||
      lowerQuery.includes("impressive") ||
      lowerQuery.includes("project") ||
      lowerQuery.includes("growth") ||
      lowerQuery.includes("scaled")
    ) {
      return aiResponses["achievements"]
    }

    // Skills questions
    if (
      lowerQuery.includes("skill") ||
      lowerQuery.includes("expertise") ||
      lowerQuery.includes("capabilities") ||
      lowerQuery.includes("good at") ||
      lowerQuery.includes("specializ") ||
      lowerQuery.includes("talent")
    ) {
      return aiResponses["skills"]
    }

    // Education questions
    if (
      lowerQuery.includes("education") ||
      lowerQuery.includes("school") ||
      lowerQuery.includes("degree") ||
      lowerQuery.includes("study") ||
      lowerQuery.includes("university") ||
      lowerQuery.includes("college") ||
      lowerQuery.includes("learn") ||
      lowerQuery.includes("qualification")
    ) {
      return aiResponses["education"]
    }

    // Training/certification questions
    if (
      lowerQuery.includes("training") ||
      lowerQuery.includes("course") ||
      lowerQuery.includes("certification") ||
      lowerQuery.includes("certificate") ||
      lowerQuery.includes("workshop")
    ) {
      return aiResponses["training"]
    }

    // Company-specific questions
    if (lowerQuery.includes("suretree") || lowerQuery.includes("sure tree")) {
      return aiResponses["suretree"]
    }

    if (
      lowerQuery.includes("polo") ||
      lowerQuery.includes("luxury") ||
      lowerQuery.includes("rolex") ||
      lowerQuery.includes("gucci") ||
      lowerQuery.includes("cartier") ||
      lowerQuery.includes("swarovski")
    ) {
      return aiResponses["polo limited"]
    }

    if (
      lowerQuery.includes("household") ||
      lowerQuery.includes("david") ||
      lowerQuery.includes("communications") ||
      lowerQuery.includes("hod")
    ) {
      return aiResponses["household of david"]
    }

    // AI/Technology questions
    if (
      lowerQuery.includes("ai") ||
      lowerQuery.includes("artificial intelligence") ||
      lowerQuery.includes("automation") ||
      lowerQuery.includes("machine learning") ||
      lowerQuery.includes("chatgpt") ||
      lowerQuery.includes("claude")
    ) {
      return aiResponses["ai marketing"]
    }

    // Tech stack questions
    if (
      lowerQuery.includes("tool") ||
      lowerQuery.includes("technology") ||
      lowerQuery.includes("software") ||
      lowerQuery.includes("platform") ||
      lowerQuery.includes("tech stack") ||
      lowerQuery.includes("use") ||
      lowerQuery.includes("hubspot") ||
      lowerQuery.includes("google") ||
      lowerQuery.includes("meta")
    ) {
      return aiResponses["tech stack"]
    }

    // Contact questions
    if (
      lowerQuery.includes("contact") ||
      lowerQuery.includes("reach") ||
      lowerQuery.includes("email") ||
      lowerQuery.includes("linkedin") ||
      lowerQuery.includes("twitter") ||
      lowerQuery.includes("get in touch") ||
      lowerQuery.includes("connect")
    ) {
      return aiResponses["contact"]
    }

    // Marketing specific questions
    if (
      lowerQuery.includes("marketing") ||
      lowerQuery.includes("campaign") ||
      lowerQuery.includes("growth") ||
      lowerQuery.includes("funnel") ||
      lowerQuery.includes("conversion") ||
      lowerQuery.includes("roi") ||
      lowerQuery.includes("roas") ||
      lowerQuery.includes("acquisition")
    ) {
      return aiResponses["achievements"]
    }

    try {
      await fetch("/api/notify-question", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          question: query,
          userMessage: query,
          timestamp: new Date().toISOString(),
        }),
      })
    } catch (error) {
      console.error("[v0] Failed to send notification:", error)
    }

    return "Thanks for your question! I don't have specific information about that topic in my current knowledge base. I've notified Edikan about your question and he'll be able to provide you with a detailed response. You can also reach out directly at edikanudoibuot@gmail.com for immediate assistance."
  }

  const handleSendMessage = async (content: string) => {
    if (!content.trim()) return

    const userMessage: Message = {
      id: Date.now().toString(),
      content: content.trim(),
      isUser: true,
      timestamp: new Date(),
    }

    setMessages((prev) => [...prev, userMessage])
    setInputValue("")
    setIsLoading(true)

    try {
      const response = await generateResponse(content)

      setTimeout(() => {
        const aiResponse: Message = {
          id: (Date.now() + 1).toString(),
          content: response,
          isUser: false,
          timestamp: new Date(),
        }
        setMessages((prev) => [...prev, aiResponse])
        setIsLoading(false)
      }, 1000)
    } catch (error) {
      console.error("[v0] Error generating response:", error)
      setTimeout(() => {
        const aiResponse: Message = {
          id: (Date.now() + 1).toString(),
          content:
            "I apologize, but I'm experiencing some technical difficulties. Please reach out to Edikan directly at edikanudoibuot@gmail.com.",
          isUser: false,
          timestamp: new Date(),
        }
        setMessages((prev) => [...prev, aiResponse])
        setIsLoading(false)
      }, 1000)
    }
  }

  const handleSuggestedQuestion = (question: (typeof suggestedQuestions)[0]) => {
    handleSendMessage(question.query)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    handleSendMessage(inputValue)
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-card/60 backdrop-blur-md border-2 border-primary/20 rounded-3xl overflow-hidden shadow-2xl ring-1 ring-primary/10">
        {/* Chat Messages */}
        {messages.length > 0 && (
          <div className="max-h-96 overflow-y-auto p-4 sm:p-6 space-y-4">
            {messages.map((message) => (
              <div key={message.id} className={`flex gap-3 ${message.isUser ? "justify-end" : "justify-start"}`}>
                {!message.isUser && (
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <Bot className="w-4 h-4 text-primary" />
                  </div>
                )}
                <div
                  className={`max-w-[85%] sm:max-w-[80%] rounded-2xl px-3 sm:px-4 py-2 ${
                    message.isUser
                      ? "bg-primary text-primary-foreground text-right"
                      : "bg-background/80 text-foreground text-left"
                  }`}
                >
                  <p className="text-sm leading-relaxed break-words">{message.content}</p>
                </div>
                {message.isUser && (
                  <div className="w-8 h-8 rounded-full bg-accent/10 flex items-center justify-center flex-shrink-0">
                    <User className="w-4 h-4 text-accent" />
                  </div>
                )}
              </div>
            ))}
            {isLoading && (
              <div className="flex gap-3 justify-start">
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <Bot className="w-4 h-4 text-primary" />
                </div>
                <div className="bg-background/80 rounded-2xl px-4 py-2">
                  <div className="flex gap-1">
                    <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" />
                    <div
                      className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce"
                      style={{ animationDelay: "0.1s" }}
                    />
                    <div
                      className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce"
                      style={{ animationDelay: "0.2s" }}
                    />
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        )}

        {/* Input Area */}
        <div className="p-4 sm:p-6">
          {/* Input Field */}
          <div className="relative mb-6">
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault()
                  handleSubmit(e as any)
                }
              }}
              placeholder="Ask me about my work, projects, or anything tech..."
              className="w-full bg-background/80 border-2 border-border/60 rounded-2xl px-4 sm:px-6 py-3 sm:py-4 pr-12 sm:pr-14 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary/60 transition-all text-sm sm:text-base shadow-lg backdrop-blur-sm"
              disabled={isLoading}
            />
            <Button
              type="button"
              onClick={(e) => handleSubmit(e as any)}
              size="sm"
              className="absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 rounded-xl bg-primary hover:bg-primary/90 shadow-lg"
              disabled={!inputValue.trim() || isLoading}
            >
              <Send className="w-4 h-4" />
            </Button>
          </div>

          {/* Suggested Questions */}
          {messages.length === 0 && (
            <div className="flex flex-wrap gap-3 justify-center">
              {suggestedQuestions.map((question, index) => {
                const IconComponent = question.icon
                return (
                  <Button
                    key={index}
                    variant="outline"
                    size="sm"
                    className="rounded-full bg-background/60 hover:bg-primary/15 hover:border-primary/40 border-border/60 text-muted-foreground hover:text-foreground transition-all text-sm px-4 py-2 h-auto shadow-md backdrop-blur-sm hover:shadow-lg"
                    onClick={() => handleSuggestedQuestion(question)}
                    disabled={isLoading}
                  >
                    <IconComponent className="w-4 h-4 mr-2" />
                    {question.text}
                  </Button>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
