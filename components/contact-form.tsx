"use client"

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { FormInput, FormField } from '@/components/ui/form-field'
import { Textarea } from '@/components/ui/textarea'
import { Send, CheckCircle, AlertCircle, Loader2 } from 'lucide-react'

interface ContactFormData {
  name: string
  email: string
  subject: string
  message: string
  company?: string
  phone?: string
}

interface FormState {
  loading: boolean
  success: boolean
  error: string | null
}

export function ContactForm() {
  const [formData, setFormData] = useState<ContactFormData>({
    name: '',
    email: '',
    subject: '',
    message: '',
    company: '',
    phone: '',
  })

  const [formState, setFormState] = useState<FormState>({
    loading: false,
    success: false,
    error: null,
  })

  const handleInputChange = (field: keyof ContactFormData) => (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setFormData(prev => ({
      ...prev,
      [field]: e.target.value
    }))
    // Clear any previous errors
    if (formState.error) {
      setFormState(prev => ({ ...prev, error: null }))
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    setFormState({ loading: true, success: false, error: null })

    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      const result = await response.json()

      if (result.success) {
        setFormState({ loading: false, success: true, error: null })
        // Reset form
        setFormData({
          name: '',
          email: '',
          subject: '',
          message: '',
          company: '',
          phone: '',
        })
      } else {
        setFormState({ 
          loading: false, 
          success: false, 
          error: result.message || 'Something went wrong. Please try again.' 
        })
      }
    } catch (error) {
      setFormState({ 
        loading: false, 
        success: false, 
        error: 'Network error. Please check your connection and try again.' 
      })
    }
  }

  if (formState.success) {
    return (
      <Card className="p-6 text-center">
        <div className="flex flex-col items-center space-y-4">
          <div className="flex items-center justify-center w-16 h-16 bg-green-100 rounded-full">
            <CheckCircle className="w-8 h-8 text-green-500" />
          </div>
          <div className="space-y-2">
            <h3 className="text-xl font-semibold text-gray-900">
              Message Sent Successfully!
            </h3>
            <p className="text-gray-600 max-w-md">
              Thank you for reaching out. I will get back to you within 24 hours.
            </p>
          </div>
          <Button
            onClick={() => setFormState({ loading: false, success: false, error: null })}
            variant="outline"
          >
            Send Another Message
          </Button>
        </div>
      </Card>
    )
  }

  return (
    <Card className="p-6">
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-4">
          <h2 className="text-2xl font-semibold text-gray-900">
            Get In Touch
          </h2>
          <p className="text-gray-600">
            Have a project in mind? Let's discuss how I can help grow your business.
          </p>
        </div>

        {formState.error && (
          <div className="flex items-center space-x-2 p-4 bg-red-50 border border-red-200 rounded-md">
            <AlertCircle className="w-5 h-5 text-red-500" />
            <p className="text-sm text-red-700">{formState.error}</p>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField label="Name" required>
            <FormInput
              type="text"
              value={formData.name}
              onChange={handleInputChange('name')}
              placeholder="Your full name"
              required
              disabled={formState.loading}
            />
          </FormField>

          <FormField label="Email" required>
            <FormInput
              type="email"
              value={formData.email}
              onChange={handleInputChange('email')}
              placeholder="your.email@example.com"
              required
              disabled={formState.loading}
            />
          </FormField>

          <FormField label="Company">
            <FormInput
              type="text"
              value={formData.company}
              onChange={handleInputChange('company')}
              placeholder="Your company (optional)"
              disabled={formState.loading}
            />
          </FormField>

          <FormField label="Phone">
            <FormInput
              type="tel"
              value={formData.phone}
              onChange={handleInputChange('phone')}
              placeholder="Your phone number (optional)"
              disabled={formState.loading}
            />
          </FormField>
        </div>

        <FormField label="Subject" required>
          <FormInput
            type="text"
            value={formData.subject}
            onChange={handleInputChange('subject')}
            placeholder="What would you like to discuss?"
            required
            disabled={formState.loading}
          />
        </FormField>

        <FormField label="Message" required>
          <Textarea
            value={formData.message}
            onChange={handleInputChange('message')}
            placeholder="Tell me more about your project, goals, and how I can help..."
            rows={5}
            required
            disabled={formState.loading}
            className="resize-none"
          />
        </FormField>

        <div className="flex justify-end">
          <Button
            type="submit"
            disabled={formState.loading}
            className="min-w-[120px]"
          >
            {formState.loading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Sending...
              </>
            ) : (
              <>
                <Send className="w-4 h-4 mr-2" />
                Send Message
              </>
            )}
          </Button>
        </div>

        <div className="text-sm text-gray-500 text-center pt-4 border-t">
          Your information is secure and will never be shared. 
          I typically respond within 24 hours.
        </div>
      </form>
    </Card>
  )
}