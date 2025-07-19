import React, { useState, useRef, useEffect } from 'react'
import { Check, X, Volume2 } from 'lucide-react'
import { Input } from './Input'
import { Button } from './Button'

interface TranslationInputProps {
  sentence: string
  targetLanguage: string
  sourceLanguage: string
  onSubmit: (translation: string) => void
  onSkip?: () => void
  placeholder?: string
  showHint?: boolean
  hint?: string
  disabled?: boolean
  autoFocus?: boolean
}

interface AudioButtonProps {
  text: string
  language: string
  className?: string
}

function AudioButton({ text, language, className = '' }: AudioButtonProps) {
  const [isPlaying, setIsPlaying] = useState(false)

  const handlePlay = () => {
    if ('speechSynthesis' in window) {
      setIsPlaying(true)
      const utterance = new SpeechSynthesisUtterance(text)
      utterance.lang = language === 'spanish' ? 'es-ES' : 'en-US'
      utterance.onend = () => setIsPlaying(false)
      utterance.onerror = () => setIsPlaying(false)
      speechSynthesis.speak(utterance)
    }
  }

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={handlePlay}
      disabled={isPlaying}
      className={`h-8 w-8 p-0 ${className}`}
    >
      <Volume2 className={`h-4 w-4 ${isPlaying ? 'animate-pulse' : ''}`} />
    </Button>
  )
}

export function TranslationInput({
  sentence,
  targetLanguage,
  sourceLanguage,
  onSubmit,
  onSkip,
  placeholder,
  showHint = false,
  hint,
  disabled = false,
  autoFocus = true
}: TranslationInputProps) {
  const [value, setValue] = useState('')
  const [showHintText, setShowHintText] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (autoFocus && inputRef.current) {
      inputRef.current.focus()
    }
  }, [autoFocus])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (value.trim()) {
      onSubmit(value.trim())
      setValue('')
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSubmit(e)
    }
  }

  const actualPlaceholder = placeholder || `Translate to ${targetLanguage}...`

  return (
    <div className="w-full space-y-4">
      {/* Source sentence */}
      <div className="flex items-center space-x-2 p-4 bg-muted rounded-lg">
        <p className="flex-1 text-foreground font-medium">{sentence}</p>
        <AudioButton 
          text={sentence} 
          language={sourceLanguage}
          className="flex-shrink-0"
        />
      </div>

      {/* Translation form */}
      <form onSubmit={handleSubmit} className="space-y-3">
        <div className="flex space-x-2">
          <Input
            ref={inputRef}
            value={value}
            onChange={(e) => setValue(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={actualPlaceholder}
            disabled={disabled}
            className="flex-1"
          />
          <AudioButton 
            text={value} 
            language={targetLanguage}
            className="flex-shrink-0"
          />
        </div>

        {/* Hint section */}
        {showHint && hint && (
          <div className="space-y-2">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setShowHintText(!showHintText)}
              className="text-xs text-muted-foreground hover:text-foreground"
            >
              {showHintText ? 'Hide hint' : 'Show hint'}
            </Button>
            {showHintText && (
              <p className="text-sm text-muted-foreground p-3 bg-accent rounded-md">
                💡 {hint}
              </p>
            )}
          </div>
        )}

        {/* Action buttons */}
        <div className="flex space-x-2">
          <Button
            type="submit"
            disabled={!value.trim() || disabled}
            className="flex-1"
          >
            <Check className="h-4 w-4 mr-2" />
            Submit
          </Button>
          {onSkip && (
            <Button
              type="button"
              variant="ghost"
              onClick={onSkip}
              disabled={disabled}
            >
              <X className="h-4 w-4 mr-2" />
              Skip
            </Button>
          )}
        </div>
      </form>
    </div>
  )
}
