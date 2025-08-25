"use client"

import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { cn } from '@/lib/utils'

interface FormFieldProps {
  label: string
  id: string
  required?: boolean
  description?: string
  error?: string
  className?: string
  children?: React.ReactNode
}

export function FormField({ 
  label, 
  id, 
  required = false, 
  description, 
  error, 
  className,
  children 
}: FormFieldProps) {
  return (
    <div className={cn("space-y-2", className)}>
      <Label 
        htmlFor={id} 
        className="text-sm font-semibold text-gray-900 block"
      >
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </Label>
      {description && (
        <p className="text-sm text-gray-600">{description}</p>
      )}
      {children}
      {error && (
        <p className="text-sm text-red-600 font-medium">{error}</p>
      )}
    </div>
  )
}

interface FormInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string
  error?: string
  description?: string
  containerClassName?: string
}

export function FormInput({ 
  label, 
  error, 
  description, 
  containerClassName,
  className,
  required,
  ...props 
}: FormInputProps) {
  return (
    <FormField
      label={label}
      id={props.id || props.name || ''}
      required={required}
      description={description}
      error={error}
      className={containerClassName}
    >
      <Input
        {...props}
        className={cn(
          "bg-white border-gray-300 text-gray-900 placeholder-gray-500",
          "focus:border-blue-500 focus:ring-blue-500",
          "disabled:bg-gray-50 disabled:text-gray-500",
          error && "border-red-300 focus:border-red-500 focus:ring-red-500",
          className
        )}
      />
    </FormField>
  )
}

interface FormTextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label: string
  error?: string
  description?: string
  containerClassName?: string
}

export function FormTextarea({ 
  label, 
  error, 
  description, 
  containerClassName,
  className,
  required,
  ...props 
}: FormTextareaProps) {
  return (
    <FormField
      label={label}
      id={props.id || props.name || ''}
      required={required}
      description={description}
      error={error}
      className={containerClassName}
    >
      <Textarea
        {...props}
        className={cn(
          "bg-white border-gray-300 text-gray-900 placeholder-gray-500",
          "focus:border-blue-500 focus:ring-blue-500",
          "disabled:bg-gray-50 disabled:text-gray-500",
          error && "border-red-300 focus:border-red-500 focus:ring-red-500",
          className
        )}
      />
    </FormField>
  )
}

interface FormSelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label: string
  error?: string
  description?: string
  containerClassName?: string
  options: { value: string; label: string }[]
}

export function FormSelect({ 
  label, 
  error, 
  description, 
  containerClassName,
  className,
  required,
  options,
  ...props 
}: FormSelectProps) {
  return (
    <FormField
      label={label}
      id={props.id || props.name || ''}
      required={required}
      description={description}
      error={error}
      className={containerClassName}
    >
      <select
        {...props}
        className={cn(
          "flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2",
          "text-sm text-gray-900 placeholder-gray-500",
          "focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500",
          "disabled:cursor-not-allowed disabled:bg-gray-50 disabled:text-gray-500",
          error && "border-red-300 focus:border-red-500 focus:ring-red-500",
          className
        )}
      >
        <option value="" className="text-gray-500">
          Select {label.toLowerCase()}...
        </option>
        {options.map((option) => (
          <option key={option.value} value={option.value} className="text-gray-900">
            {option.label}
          </option>
        ))}
      </select>
    </FormField>
  )
}