import React, { useEffect } from 'react'
import { X } from 'lucide-react'
import { Button } from './Button'

interface ModalProps {
  isOpen: boolean
  onClose: () => void
  title?: string
  children: React.ReactNode
  size?: 'sm' | 'md' | 'lg' | 'xl'
  showCloseButton?: boolean
}

interface ModalHeaderProps {
  title: string
  onClose: () => void
  showCloseButton?: boolean
}

interface ModalContentProps {
  children: React.ReactNode
}

interface ModalFooterProps {
  children: React.ReactNode
}

export function Modal({ 
  isOpen, 
  onClose, 
  title, 
  children, 
  size = 'md', 
  showCloseButton = true 
}: ModalProps) {
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose()
      }
    }

    if (isOpen) {
      document.addEventListener('keydown', handleEscape)
      document.body.style.overflow = 'hidden'
    }

    return () => {
      document.removeEventListener('keydown', handleEscape)
      document.body.style.overflow = 'unset'
    }
  }, [isOpen, onClose])

  if (!isOpen) return null

  const sizes = {
    sm: 'max-w-md',
    md: 'max-w-lg',
    lg: 'max-w-2xl',
    xl: 'max-w-4xl'
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className={`relative w-full ${sizes[size]} mx-4 bg-background rounded-lg shadow-lg border`}>
        {title && (
          <ModalHeader title={title} onClose={onClose} showCloseButton={showCloseButton} />
        )}
        {children}
      </div>
    </div>
  )
}

export function ModalHeader({ title, onClose, showCloseButton = true }: ModalHeaderProps) {
  return (
    <div className="flex items-center justify-between p-6 border-b">
      <h2 className="text-lg font-semibold text-foreground">{title}</h2>
      {showCloseButton && (
        <Button
          variant="ghost"
          size="sm"
          onClick={onClose}
          className="h-6 w-6 p-0"
        >
          <X className="h-4 w-4" />
        </Button>
      )}
    </div>
  )
}

export function ModalContent({ children }: ModalContentProps) {
  return (
    <div className="p-6">
      {children}
    </div>
  )
}

export function ModalFooter({ children }: ModalFooterProps) {
  return (
    <div className="flex items-center justify-end space-x-2 p-6 border-t">
      {children}
    </div>
  )
}
