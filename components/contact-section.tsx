"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Mail, Linkedin, MapPin, Send, CheckCircle, AlertCircle, Clock, Users, Target, Zap } from "lucide-react"
import { logger } from "@/lib/logger"

interface FormData {
  name: string
  email: string
  subject: string
  message: string
}

interface FormErrors {
  name?: string
  email?: string
  subject?: string
  message?: string
}

function sanitizeInput(input: string): string {
  return input
    .replace(/[<>]/g, "") // Remove potential HTML tags
    .replace(/javascript:/gi, "") // Remove javascript: protocol
    .replace(/on\w+=/gi, "") // Remove event handlers
    .trim()
}

export function ContactSection() {
  const [formData, setFormData] = useState<FormData>({
    name: "",
    email: "",
    subject: "",
    message: "",
  })
  const [errors, setErrors] = useState<FormErrors>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitStatus, setSubmitStatus] = useState<"idle" | "success" | "error">("idle")

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {}

    const sanitizedName = sanitizeInput(formData.name)
    const sanitizedEmail = sanitizeInput(formData.email)
    const sanitizedSubject = sanitizeInput(formData.subject)
    const sanitizedMessage = sanitizeInput(formData.message)

    if (!sanitizedName || sanitizedName.length < 2) {
      newErrors.name = "Name must be at least 2 characters long"
    } else if (sanitizedName.length > 100) {
      newErrors.name = "Name is too long"
    }

    if (!sanitizedEmail) {
      newErrors.email = "Email is required"
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(sanitizedEmail)) {
      newErrors.email = "Please enter a valid email address"
    } else if (sanitizedEmail.length > 254) {
      newErrors.email = "Email address is too long"
    }

    if (!sanitizedSubject || sanitizedSubject.length < 3) {
      newErrors.subject = "Subject must be at least 3 characters long"
    } else if (sanitizedSubject.length > 200) {
      newErrors.subject = "Subject is too long"
    }

    if (!sanitizedMessage || sanitizedMessage.length < 10) {
      newErrors.message = "Message must be at least 10 characters long"
    } else if (sanitizedMessage.length > 2000) {
      newErrors.message = "Message is too long"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) {
      return
    }

    setIsSubmitting(true)
    setSubmitStatus("idle")

    try {
      const sanitizedData = {
        name: sanitizeInput(formData.name),
        email: sanitizeInput(formData.email),
        subject: sanitizeInput(formData.subject),
        message: sanitizeInput(formData.message),
      }

      // Submit to contact API
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(sanitizedData),
      })

      const result = await response.json()

      if (result.success) {
        setSubmitStatus("success")
        setFormData({ name: "", email: "", subject: "", message: "" })
        logger.info('Contact form submitted successfully', { email: sanitizedData.email })
      } else {
        setSubmitStatus("error")
        logger.error('Contact form submission failed', { 
          error: result.error, 
          message: result.message 
        })
      }
    } catch (error) {
      logger.error("Contact form submission error", error)
      setSubmitStatus("error")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleInputChange = (field: keyof FormData, value: string) => {
    // Prevent extremely long inputs
    if (value.length > 2000) return

    setFormData((prev) => ({ ...prev, [field]: value }))
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }))
    }
  }

  const contactInfo = [
    {
      icon: <Mail className="h-5 w-5" />,
      label: "Email",
      value: "edikanudoibuot@gmail.com",
      href: "mailto:edikanudoibuot@gmail.com",
    },
    {
      icon: (
        <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
          <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
        </svg>
      ),
      label: "X (Twitter)",
      value: "@edikanudoibuot",
      href: "https://x.com/edikanudoibuot",
    },
    {
      icon: <Linkedin className="h-5 w-5" />,
      label: "LinkedIn",
      value: "linkedin.com/in/edikanudoibuot",
      href: "https://www.linkedin.com/in/edikanudoibuot/",
    },
    {
      icon: <MapPin className="h-5 w-5" />,
      label: "Location",
      value: "Nigeria",
      href: null,
    },
  ]

  return (
    <section className="py-16 bg-gradient-to-b from-background to-card/20">
      <div className="container mx-auto px-6 lg:px-12 xl:px-16">
        <div className="max-w-7xl mx-auto">

          {/* Main Contact Section */}
          <div className="grid lg:grid-cols-5 gap-8 mb-12">
            {/* Contact Form */}
            <div className="lg:col-span-3">
              <Card className="p-8 bg-background/80 backdrop-blur-sm border border-border/50 shadow-2xl hover:shadow-3xl transition-all duration-300">
                <div className="mb-8">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-2 bg-primary/10 rounded-lg">
                      <Send className="h-5 w-5 text-primary" />
                    </div>
                    <h3 className="text-2xl font-bold text-foreground">Send a Message</h3>
                  </div>
                  <p className="text-muted-foreground flex items-center gap-2">
                    <Clock className="h-4 w-4 text-primary" />
                    I typically respond within 24 hours
                  </p>
                </div>

              {submitStatus === "success" && (
                <div className="mb-6 p-4 bg-green-500/10 border border-green-500/20 rounded-lg flex items-center gap-3">
                  <CheckCircle className="h-5 w-5 text-green-500" />
                  <div>
                    <p className="text-green-500 font-medium">Message sent successfully!</p>
                    <p className="text-sm text-green-500/80">I'll get back to you within 24 hours.</p>
                  </div>
                </div>
              )}

              {submitStatus === "error" && (
                <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-lg flex items-center gap-3">
                  <AlertCircle className="h-5 w-5 text-red-500" />
                  <div>
                    <p className="text-red-500 font-medium">Failed to send message</p>
                    <p className="text-sm text-red-500/80">Please try again or contact me directly.</p>
                  </div>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="name" className="text-foreground">
                      Name *
                    </Label>
                    <Input
                      id="name"
                      type="text"
                      value={formData.name}
                      onChange={(e) => handleInputChange("name", e.target.value)}
                      className={`mt-1 ${errors.name ? "border-red-500" : ""}`}
                      placeholder="Your full name"
                    />
                    {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
                  </div>
                  <div>
                    <Label htmlFor="email" className="text-foreground">
                      Email *
                    </Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => handleInputChange("email", e.target.value)}
                      className={`mt-1 ${errors.email ? "border-red-500" : ""}`}
                      placeholder="your.email@example.com"
                    />
                    {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
                  </div>
                </div>

                <div>
                  <Label htmlFor="subject" className="text-foreground">
                    Subject *
                  </Label>
                  <Input
                    id="subject"
                    type="text"
                    value={formData.subject}
                    onChange={(e) => handleInputChange("subject", e.target.value)}
                    className={`mt-1 ${errors.subject ? "border-red-500" : ""}`}
                    placeholder="What would you like to discuss?"
                  />
                  {errors.subject && <p className="text-red-500 text-sm mt-1">{errors.subject}</p>}
                </div>

                <div>
                  <Label htmlFor="message" className="text-foreground">
                    Message *
                  </Label>
                  <Textarea
                    id="message"
                    value={formData.message}
                    onChange={(e) => handleInputChange("message", e.target.value)}
                    className={`mt-1 min-h-32 ${errors.message ? "border-red-500" : ""}`}
                    placeholder="Tell me about your project, goals, and how I can help..."
                  />
                  {errors.message && <p className="text-red-500 text-sm mt-1">{errors.message}</p>}
                </div>

                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 text-primary-foreground shadow-lg hover:shadow-xl transition-all duration-300 py-3 text-lg font-semibold"
                >
                  {isSubmitting ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-3" />
                      Sending Message...
                    </>
                  ) : (
                    <>
                      Send Message
                      <Send className="ml-3 h-5 w-5" />
                    </>
                  )}
                </Button>
              </form>
            </Card>
            </div>

            {/* Contact Information Sidebar */}
            <div className="lg:col-span-2 space-y-6">
              {/* Contact Info Card */}
              <Card className="p-6 bg-background/80 backdrop-blur-sm border border-border/50 shadow-lg hover:shadow-xl transition-all duration-300">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <Mail className="h-5 w-5 text-primary" />
                  </div>
                  <h3 className="text-xl font-bold text-foreground">Contact Info</h3>
                </div>
                <div className="space-y-4">
                  {contactInfo.map((info, index) => (
                    <div key={index} className="group hover:bg-card/50 p-3 rounded-lg transition-colors duration-200">
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-primary/10 text-primary group-hover:bg-primary/20 transition-colors duration-200">
                          {info.icon}
                        </div>
                        <div className="flex-1">
                          <p className="font-medium text-foreground text-sm">{info.label}</p>
                          {info.href ? (
                            <a
                              href={info.href}
                              target={info.href.startsWith("http") ? "_blank" : undefined}
                              rel={info.href.startsWith("http") ? "noopener noreferrer" : undefined}
                              className="text-muted-foreground hover:text-primary transition-colors text-sm"
                            >
                              {info.value}
                            </a>
                          ) : (
                            <p className="text-muted-foreground text-sm">{info.value}</p>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>

              {/* Response Time Card */}
              <Card className="p-6 bg-gradient-to-r from-green-500/10 to-emerald-500/10 border border-green-500/20">
                <div className="text-center">
                  <div className="inline-flex items-center justify-center w-12 h-12 bg-green-500/20 rounded-full mb-4">
                    <Clock className="h-6 w-6 text-green-600" />
                  </div>
                  <h4 className="font-bold text-foreground mb-2">Fast Response</h4>
                  <p className="text-sm text-muted-foreground">
                    I typically respond to all inquiries within 24 hours, often much sooner.
                  </p>
                </div>
              </Card>
            </div>
          </div>

          {/* Why Work With Me Section - Full Width Below */}
          <div className="mb-8">
            <Card className="p-8 bg-gradient-to-br from-primary/10 via-accent/10 to-primary/5 border border-primary/20 shadow-lg">
              <div className="text-center mb-8">
                <div className="flex items-center justify-center gap-3 mb-4">
                  <div className="p-3 bg-primary/20 rounded-lg">
                    <Target className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="text-2xl font-bold text-foreground">Why Work With Me?</h3>
                </div>
                <p className="text-muted-foreground max-w-2xl mx-auto">
                  Here's what sets me apart and makes our collaboration successful
                </p>
              </div>
              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                {[
                  { icon: <Users className="h-5 w-5" />, text: "7+ years of proven growth marketing experience" },
                  { icon: <Zap className="h-5 w-5" />, text: "AI-powered strategies for maximum efficiency" },
                  { icon: <Target className="h-5 w-5" />, text: "Data-driven approach with measurable results" },
                  { icon: <CheckCircle className="h-5 w-5" />, text: "Cross-functional leadership and collaboration" },
                ].map((benefit, index) => (
                  <div key={index} className="text-center group hover:bg-background/50 p-4 rounded-lg transition-colors duration-200">
                    <div className="inline-flex items-center justify-center p-3 bg-primary/10 rounded-lg text-primary group-hover:bg-primary/20 transition-colors duration-200 mb-3">
                      {benefit.icon}
                    </div>
                    <p className="text-muted-foreground text-sm leading-relaxed">{benefit.text}</p>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        </div>
      </div>
    </section>
  )
}
