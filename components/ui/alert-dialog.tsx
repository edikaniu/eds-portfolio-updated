"use client"

import * as React from "react"
import { Button } from "./button"
import { Card } from "./card"

interface AlertDialogProps {
  children: React.ReactNode
}

interface AlertDialogTriggerProps {
  children: React.ReactNode
  asChild?: boolean
}

interface AlertDialogContentProps {
  children: React.ReactNode
}

interface AlertDialogHeaderProps {
  children: React.ReactNode
}

interface AlertDialogTitleProps {
  children: React.ReactNode
}

interface AlertDialogDescriptionProps {
  children: React.ReactNode
}

interface AlertDialogFooterProps {
  children: React.ReactNode
}

interface AlertDialogActionProps {
  children: React.ReactNode
  onClick?: () => void
  className?: string
}

interface AlertDialogCancelProps {
  children: React.ReactNode
}

const AlertDialogContext = React.createContext<{
  open: boolean
  setOpen: (open: boolean) => void
}>({
  open: false,
  setOpen: () => {}
})

export function AlertDialog({ children }: AlertDialogProps) {
  const [open, setOpen] = React.useState(false)
  
  return (
    <AlertDialogContext.Provider value={{ open, setOpen }}>
      {children}
    </AlertDialogContext.Provider>
  )
}

export function AlertDialogTrigger({ children, asChild }: AlertDialogTriggerProps) {
  const { setOpen } = React.useContext(AlertDialogContext)
  
  if (asChild && React.isValidElement(children)) {
    return React.cloneElement(children, {
      ...((children.props as any) || {}),
      onClick: () => setOpen(true)
    })
  }
  
  return (
    <button onClick={() => setOpen(true)}>
      {children}
    </button>
  )
}

export function AlertDialogContent({ children }: AlertDialogContentProps) {
  const { open, setOpen } = React.useContext(AlertDialogContext)
  
  if (!open) return null
  
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div 
        className="fixed inset-0 bg-black/50" 
        onClick={() => setOpen(false)}
      />
      <Card className="relative z-50 p-6 min-w-[400px] max-w-[500px] mx-4">
        {children}
      </Card>
    </div>
  )
}

export function AlertDialogHeader({ children }: AlertDialogHeaderProps) {
  return (
    <div className="space-y-2 mb-4">
      {children}
    </div>
  )
}

export function AlertDialogTitle({ children, className }: AlertDialogTitleProps & { className?: string }) {
  return (
    <h2 className={`text-lg font-semibold ${className || ''}`}>
      {children}
    </h2>
  )
}

export function AlertDialogDescription({ children, className }: AlertDialogDescriptionProps & { className?: string }) {
  return (
    <p className={`text-sm text-gray-600 ${className || ''}`}>
      {children}
    </p>
  )
}

export function AlertDialogFooter({ children }: AlertDialogFooterProps) {
  return (
    <div className="flex justify-end space-x-2 mt-4">
      {children}
    </div>
  )
}

export function AlertDialogAction({ children, onClick, className }: AlertDialogActionProps) {
  const { setOpen } = React.useContext(AlertDialogContext)
  
  return (
    <Button 
      onClick={() => {
        onClick?.()
        setOpen(false)
      }}
      className={className}
    >
      {children}
    </Button>
  )
}

export function AlertDialogCancel({ children, className }: AlertDialogCancelProps & { className?: string }) {
  const { setOpen } = React.useContext(AlertDialogContext)
  
  return (
    <Button 
      variant="outline"
      onClick={() => setOpen(false)}
      className={className}
    >
      {children}
    </Button>
  )
}