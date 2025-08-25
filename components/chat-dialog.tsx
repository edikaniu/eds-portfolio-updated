"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Send, Bot, User, MessageSquare } from "lucide-react"

interface Message {
  id: string
  content: string
  sender: "user" | "ai"
  timestamp: Date
}

interface ChatDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

interface PredefinedQuestion {
  id: string
  questionText: string
  icon: string
  category: string
}

export function ChatDialog({ open, onOpenChange }: ChatDialogProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      content:
        "Hi! I'm Ed's AI assistant. I can answer questions about Edikan's experience, skills, and achievements. What would you like to know?",
      sender: "ai",
      timestamp: new Date(0), // Use epoch time to avoid hydration mismatch
    },
  ])
  const [inputValue, setInputValue] = useState("")
  const [isTyping, setIsTyping] = useState(false)
  const [predefinedQuestions, setPredefinedQuestions] = useState<PredefinedQuestion[]>([])
  const [conversationId, setConversationId] = useState<string>("")

  // Fetch predefined questions when dialog opens
  useEffect(() => {
    if (open) {
      fetchPredefinedQuestions()
      // Generate a unique conversation ID
      setConversationId(`conv_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`)
    }
  }, [open])

  const fetchPredefinedQuestions = async () => {
    try {
      const response = await fetch('/api/chatbot/questions?limit=6')
      const data = await response.json()
      
      if (data.success) {
        setPredefinedQuestions(data.data || [])
      }
    } catch (error) {
      console.error('Error fetching predefined questions:', error)
    }
  }

  const generateAIResponse = async (userMessage: string, questionId?: string): Promise<string> => {
    try {
      const response = await fetch('/api/chatbot/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: userMessage,
          conversationId: conversationId,
          questionId: questionId
        }),
      })

      const data = await response.json()

      if (data.success) {
        return data.data.response || "I apologize, but I couldn't generate a response at this time."
      } else {
        console.error('Chatbot API error:', data.message)
        return "I'm experiencing some technical difficulties. Please try asking your question again."
      }
    } catch (error) {
      console.error('Error calling chatbot API:', error)
      return "I'm having trouble connecting right now. Please check your internet connection and try again."
    }
  }

  const handlePredefinedQuestion = async (question: PredefinedQuestion) => {
    const userMessage: Message = {
      id: Date.now().toString(),
      content: question.questionText,
      sender: "user",
      timestamp: new Date(),
    }

    setMessages((prev) => [...prev, userMessage])
    setIsTyping(true)

    try {
      const response = await generateAIResponse(question.questionText, question.id)
      
      const aiResponse: Message = {
        id: (Date.now() + 1).toString(),
        content: response,
        sender: "ai",
        timestamp: new Date(),
      }

      setMessages((prev) => [...prev, aiResponse])
    } catch (error) {
      console.error('Error handling predefined question:', error)
      const errorResponse: Message = {
        id: (Date.now() + 1).toString(),
        content: "I apologize, but I'm having trouble processing that question right now.",
        sender: "ai",
        timestamp: new Date(),
      }
      setMessages((prev) => [...prev, errorResponse])
    } finally {
      setIsTyping(false)
    }
  }

  const handleSendMessage = async () => {
    if (!inputValue.trim()) return

    const userMessage: Message = {
      id: Date.now().toString(),
      content: inputValue,
      sender: "user",
      timestamp: new Date(),
    }

    setMessages((prev) => [...prev, userMessage])
    const messageText = inputValue
    setInputValue("")
    setIsTyping(true)

    try {
      const response = await generateAIResponse(messageText)
      
      const aiResponse: Message = {
        id: (Date.now() + 1).toString(),
        content: response,
        sender: "ai",
        timestamp: new Date(),
      }

      setMessages((prev) => [...prev, aiResponse])
    } catch (error) {
      console.error('Error sending message:', error)
      const errorResponse: Message = {
        id: (Date.now() + 1).toString(),
        content: "I apologize, but I'm having trouble processing that message right now.",
        sender: "ai",
        timestamp: new Date(),
      }
      setMessages((prev) => [...prev, errorResponse])
    } finally {
      setIsTyping(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md h-[600px] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Bot className="h-5 w-5 text-primary" />
            Chat with Ed's AI
          </DialogTitle>
        </DialogHeader>

        <ScrollArea className="flex-1 pr-4">
          <div className="space-y-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex gap-3 ${message.sender === "user" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`flex gap-2 max-w-[80%] ${message.sender === "user" ? "flex-row-reverse" : "flex-row"}`}
                >
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                      message.sender === "user" ? "bg-primary" : "bg-accent"
                    }`}
                  >
                    {message.sender === "user" ? (
                      <User className="h-4 w-4 text-primary-foreground" />
                    ) : (
                      <Bot className="h-4 w-4 text-accent-foreground" />
                    )}
                  </div>
                  <div
                    className={`rounded-lg p-3 ${
                      message.sender === "user"
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted text-muted-foreground"
                    }`}
                  >
                    <p className="text-sm">{message.content}</p>
                  </div>
                </div>
              </div>
            ))}

            {isTyping && (
              <div className="flex gap-3 justify-start">
                <div className="flex gap-2 max-w-[80%]">
                  <div className="w-8 h-8 rounded-full bg-accent flex items-center justify-center flex-shrink-0">
                    <Bot className="h-4 w-4 text-accent-foreground" />
                  </div>
                  <div className="bg-muted rounded-lg p-3">
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
              </div>
            )}
          </div>
        </ScrollArea>

        {/* Predefined Questions */}
        {predefinedQuestions.length > 0 && messages.length === 1 && (
          <div className="border-t border-b py-3">
            <p className="text-xs text-muted-foreground mb-2 px-1">Quick questions:</p>
            <div className="flex flex-wrap gap-2">
              {predefinedQuestions.map((question) => (
                <Button
                  key={question.id}
                  variant="outline"
                  size="sm"
                  className="text-xs h-7 px-2"
                  onClick={() => handlePredefinedQuestion(question)}
                  disabled={isTyping}
                >
                  <MessageSquare className="h-3 w-3 mr-1" />
                  {question.questionText}
                </Button>
              ))}
            </div>
          </div>
        )}

        <div className="flex gap-2 pt-4 border-t">
          <Input
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Ask about Edikan's experience, skills, or achievements..."
            className="flex-1"
          />
          <Button onClick={handleSendMessage} size="icon" disabled={!inputValue.trim()}>
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
