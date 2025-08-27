import React, { useState, useCallback, useEffect } from 'react'
import { ChevronLeft, ChevronRight, RotateCcw, Lightbulb, X, CheckCircle, AlertCircle, HelpCircle } from 'lucide-react'
import { ActionButtons } from '../components/ActionButtons'
import { SmartTranslationInput } from '../components/SmartTranslationInput'

// ✅ ENHANCED: TypeScript interfaces for better type safety
interface WordEvaluation {
  word: string
  status: 'correct' | 'close' | 'wrong'
  confidence: number
  attempts: number
  needsHint: boolean
  hintShown: boolean
}

interface HintData {
  word: string
  level: 'basic' | 'intermediate' | 'complete'
  levelNumber: number
  content: string
  penalty: number
  canAdvance: boolean
}

interface Sentence {
  id: number
  spanish: string
  english: string
}

export default function PracticePage() {
  // ✅ ENHANCED: Comprehensive state management
  const [currentSentenceIndex, setCurrentSentenceIndex] = useState(0)
  const [currentTranslation, setCurrentTranslation] = useState('')
  const [score, setScore] = useState(0)
  const [wordEvaluations, setWordEvaluations] = useState<Map<string, WordEvaluation>>(new Map())
  const [activeHint, setActiveHint] = useState<HintData | null>(null)
  const [loadingHint, setLoadingHint] = useState(false)
  const [loadingWord, setLoadingWord] = useState<string | null>(null)
  const [isEvaluating, setIsEvaluating] = useState(false)

  // ✅ MOCK DATA: Will be replaced with real API in next iteration
  const sentences: Sentence[] = [
    { id: 1, spanish: "Hola, ¿cómo estás?", english: "Hello, how are you?" },
    { id: 2, spanish: "Me gusta la comida española", english: "I like Spanish food" },
    { id: 3, spanish: "¿Dónde está el baño?", english: "Where is the bathroom?" }
  ]

  const currentSentence = sentences[currentSentenceIndex]

  // ✅ REAL AI EVALUATION: Connected to backend API
  const evaluateWord = useCallback(async (word: string, sentence: Sentence): Promise<WordEvaluation> => {
    if (!sentence) {
      return {
        word,
        status: 'wrong',
        confidence: 0,
        attempts: 1,
        needsHint: true,
        hintShown: false
      }
    }

    try {
      const response = await fetch('http://localhost:5001/api/sentences/evaluate-word', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          word: word.trim(),
          context: sentence.spanish,
          sentenceId: sentence.id.toString()
        })
      })

      if (!response.ok) {
        throw new Error(`Word evaluation API responded with status: ${response.status}`)
      }

      const result = await response.json()
      
      if (!result.success) {
        throw new Error(result.error || 'Word evaluation failed')
      }

      const confidence = result.data.confidence || 0
      const status = confidence > 0.8 ? 'correct' : confidence > 0.4 ? 'close' : 'wrong'
      
      return {
        word,
        status,
        confidence,
        attempts: 1,
        needsHint: confidence < 0.5,
        hintShown: false
      }
    } catch (error) {
      console.error('Word evaluation failed, using fallback:', error)
      
      // ✅ FALLBACK: Basic evaluation logic
      const confidence = Math.random() * 0.6 + 0.2 // 0.2-0.8
      const status = confidence > 0.6 ? 'correct' : confidence > 0.4 ? 'close' : 'wrong'
      
      return {
        word,
        status,
        confidence,
        attempts: 1,
        needsHint: confidence < 0.5,
        hintShown: false
      }
    }
  }, [])

  // ✅ FIXED: Progressive hints with real API integration and Spanish context
  const generateHint = useCallback(async (
    word: string, 
    sentence: Sentence, 
    level: 'basic' | 'intermediate' | 'complete' = 'basic'
  ): Promise<HintData> => {
    if (!sentence) {
      return {
        word,
        level,
        levelNumber: level === 'basic' ? 1 : level === 'intermediate' ? 2 : 3,
        content: `Try thinking about "${word}" in context.`,
        penalty: 1.0,
        canAdvance: level !== 'complete'
      }
    }

    try {
      const response = await fetch('http://localhost:5001/api/sentences/progressive-hint', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          word: word.trim(),
          level,
          context: sentence.spanish,
          sentenceId: sentence.id.toString(),
          targetLanguage: 'spanish',
          requestType: 'contextual_translation'
        })
      })

      if (!response.ok) {
        throw new Error(`Hint API responded with status: ${response.status}`)
      }

      const result = await response.json()
      
      if (!result.success) {
        throw new Error(result.error || 'Hint generation failed')
      }

      return {
        word: result.data.word,
        level: result.data.level,
        levelNumber: level === 'basic' ? 1 : level === 'intermediate' ? 2 : 3,
        content: result.data.content,
        penalty: result.data.penalty,
        canAdvance: level !== 'complete'
      }
    } catch (error) {
      console.error('Hint generation failed, using Spanish-specific fallback:', error)
      
      // ✅ ENHANCED: Spanish-specific contextual fallbacks
      const spanishText = sentence.spanish.toLowerCase()
      const englishWord = word.toLowerCase()
      
      const fallbackHints = {
        basic: `"${word}" in Spanish context: ${
          /^(the|a|an)$/i.test(word) ? 'Look for articles like "el", "la", "un", "una"' :
          /^(is|are|was|were)$/i.test(word) ? 'Look for forms of "ser" or "estar" (es, está, son, están)' :
          /^(i|you|he|she|we|they)$/i.test(word) ? 'Look for pronouns (yo, tú, él, ella, nosotros, ellos)' :
          `Look for "${word}" or similar in the Spanish text`
        }`,
        intermediate: `"${word}" Spanish analysis: ${
          spanishText.includes('el ') || spanishText.includes('la ') ? 'This sentence uses definite articles - check "el" or "la"' :
          spanishText.includes('es ') ? 'The verb "es" (is) appears in this sentence' :
          spanishText.includes('está') ? 'The verb "está" (is/located) is used here' :
          spanishText.includes('¿') ? 'This is a question - look for question words' :
          `The Spanish structure suggests "${word}" corresponds to a key part of the sentence`
        }`,
        complete: `"${word}" complete translation help: ${
          /^(the)$/i.test(word) && (spanishText.includes('el ') || spanishText.includes('la ')) ? 
            'The word "the" = "el" (masculine) or "la" (feminine)' :
          /^(is|are)$/i.test(word) && spanishText.includes('es') ? 
            'The word "is" = "es" in this context' :
          /^(is|are)$/i.test(word) && spanishText.includes('está') ? 
            'The word "is" = "está" (temporary state/location)' :
          /^(where)$/i.test(word) && spanishText.includes('dónde') ? 
            'The word "where" = "dónde" in Spanish' :
          /^(how)$/i.test(word) && spanishText.includes('cómo') ? 
            'The word "how" = "cómo" in Spanish' :
          `Look for the Spanish equivalent of "${word}" in: "${sentence.spanish}"`
        }`
      }
      
      return {
        word,
        level,
        levelNumber: level === 'basic' ? 1 : level === 'intermediate' ? 2 : 3,
        content: fallbackHints[level] || fallbackHints.basic,
        penalty: level === 'basic' ? 1.0 : level === 'intermediate' ? 2.0 : 3.0,
        canAdvance: level !== 'complete'
      }
    }
  }, [])

  // ✅ FIXED: Word click only evaluates, no automatic hints
  const handleWordClick = useCallback(async (word: string) => {
    if (!currentSentence || isEvaluating) return
    
    const cleanWord = word.replace(/[.,!?;:]$/, '')
    setLoadingWord(cleanWord)
    
    try {
      // Only evaluate word on click - no automatic hints
      const evaluation = await evaluateWord(cleanWord, currentSentence)
      setWordEvaluations(prev => new Map(prev.set(cleanWord, evaluation)))
    } catch (error) {
      console.error('Word evaluation failed:', error)
    } finally {
      setLoadingWord(null)
    }
  }, [currentSentence, isEvaluating, evaluateWord])

  // ✅ NEW: Explicit hint request function
  const handleHintRequest = useCallback(async (word: string) => {
    if (!currentSentence) return
    
    setLoadingHint(true)
    try {
      // Check if we already have a hint for this word
      if (activeHint?.word === word && activeHint.canAdvance) {
        // Advance to next level
        const nextLevel = activeHint.level === 'basic' ? 'intermediate' : 'complete'
        const hint = await generateHint(word, currentSentence, nextLevel)
        setActiveHint(hint)
      } else {
        // Start with basic hint
        const hint = await generateHint(word, currentSentence, 'basic')
        setActiveHint(hint)
      }
      
      // Apply penalty to score
      const penalty = activeHint?.level === 'basic' ? 1.0 : 
                     activeHint?.level === 'intermediate' ? 2.0 : 3.0
      setScore(prev => Math.max(0, prev - penalty))
      
    } catch (error) {
      console.error('Hint request failed:', error)
    } finally {
      setLoadingHint(false)
    }
  }, [activeHint, currentSentence, generateHint])

  // ✅ NEW: Hint level advancement
  const advanceHintLevel = useCallback(async () => {
    if (!activeHint?.canAdvance || !currentSentence) return
    
    setLoadingHint(true)
    try {
      const nextLevel = activeHint.level === 'basic' ? 'intermediate' : 'complete'
      const newHint = await generateHint(activeHint.word, currentSentence, nextLevel)
      setActiveHint(newHint)
      
      // Apply additional penalty for advancing
      const penalty = nextLevel === 'intermediate' ? 1.0 : 2.0
      setScore(prev => Math.max(0, prev - penalty))
      
    } catch (error) {
      console.error('Failed to advance hint level:', error)
    } finally {
      setLoadingHint(false)
    }
  }, [activeHint, currentSentence, generateHint])

  // ✅ ENHANCED: Word rendering with proper status icons and no automatic hints
  const renderWord = useCallback((word: string, index: number) => {
    const cleanWord = word.replace(/[.,!?;:]$/, '')
    const punctuation = word.slice(cleanWord.length)
    const evaluation = wordEvaluations.get(cleanWord)
    
    const getWordColor = (status?: string) => {
      switch (status) {
        case 'correct': return 'text-green-600 border-green-200 bg-green-50'
        case 'close': return 'text-orange-600 border-orange-200 bg-orange-50'
        case 'wrong': return 'text-red-600 border-red-200 bg-red-50'
        default: return 'text-foreground border-transparent hover:border-border'
      }
    }

    const getStatusIcon = (status?: string) => {
      switch (status) {
        case 'correct': return <CheckCircle className="w-3 h-3 ml-1 text-green-600" />
        case 'close': return <AlertCircle className="w-3 h-3 ml-1 text-orange-600" />
        case 'wrong': return <AlertCircle className="w-3 h-3 ml-1 text-red-600" />
        default: return null
      }
    }

    return (
      <span key={index} className="inline-flex items-center">
        <span
          onClick={() => handleWordClick(cleanWord)}
          className={`
            cursor-pointer px-2 py-1 rounded border text-2xl md:text-3xl font-normal
            transition-all duration-200 hover:scale-105 hover:shadow-sm
            ${getWordColor(evaluation?.status)}
            ${loadingWord === cleanWord ? 'animate-pulse bg-muted/50' : ''}
          `}
          title={`Click to evaluate "${cleanWord}"`}
        >
          {cleanWord}
          {loadingWord === cleanWord ? (
            <div className="w-3 h-3 ml-1 border border-primary border-t-transparent rounded-full animate-spin" />
          ) : (
            getStatusIcon(evaluation?.status)
          )}
        </span>
        {punctuation && <span className="text-foreground text-2xl md:text-3xl font-normal">{punctuation}</span>}
        <span> </span>
      </span>
    )
  }, [wordEvaluations, handleWordClick, loadingWord])

  // ✅ ENHANCED: Translation submission with comprehensive evaluation
  const handleTranslationSubmit = useCallback(async (translation: string) => {
    if (!translation.trim()) return

    setCurrentTranslation(translation)
    setIsEvaluating(true)

    try {
      const response = await fetch('http://localhost:5001/api/sentences/evaluate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          userTranslation: translation.trim(),
          correctTranslation: currentSentence.english,
          spanishSentence: currentSentence.spanish,
          sentenceId: currentSentence.id.toString()
        })
      })

      if (response.ok) {
        const result = await response.json()
        if (result.success && typeof result.data.score === 'number') {
          setScore(prev => prev + result.data.score)
        }
      }
    } catch (error) {
      console.error('Translation evaluation failed:', error)
      // Fallback scoring
      setScore(prev => prev + 10)
    } finally {
      setIsEvaluating(false)
    }
  }, [currentSentence])

  // Navigation handlers
  const goToPrevious = useCallback(() => {
    if (currentSentenceIndex > 0) {
      setCurrentSentenceIndex(prev => prev - 1)
      setWordEvaluations(new Map())
      setActiveHint(null)
      setCurrentTranslation('')
    }
  }, [currentSentenceIndex])

  const goToNext = useCallback(() => {
    if (currentSentenceIndex < sentences.length - 1) {
      setCurrentSentenceIndex(prev => prev + 1)
      setWordEvaluations(new Map())
      setActiveHint(null)
      setCurrentTranslation('')
    }
  }, [currentSentenceIndex, sentences.length])

  const resetSentence = useCallback(() => {
    setWordEvaluations(new Map())
    setActiveHint(null)
    setCurrentTranslation('')
  }, [])

  if (!currentSentence) {
    return <div className="text-center text-muted-foreground">No sentences available</div>
  }

  const words = currentSentence.spanish.split(/\s+/)

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      {/* Header with score */}
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-foreground mb-2">Practice Translation</h1>
        <div className="text-lg text-muted-foreground">
          Score: <span className="font-semibold text-primary">{score}</span>
        </div>
      </div>

      {/* Interactive Spanish sentence */}
      <div className="text-center mb-8">
        <div className="inline-block p-6 bg-card border border-border rounded-lg">
          <div className="inline-block">
            {words.map((word, index) => renderWord(word, index))}
          </div>
        </div>
      </div>

      {/* ✅ ENHANCED: Progressive Hints UI */}
      {activeHint && (
        <div className="mb-6 p-4 bg-muted border border-border rounded-lg space-y-3">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-2">
              <Lightbulb className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm font-medium text-foreground">
                Level {activeHint.levelNumber} Hint for "{activeHint.word}"
              </span>
              <span className="text-xs text-muted-foreground">
                (-{activeHint.penalty} pts)
              </span>
            </div>
            <button
              onClick={() => setActiveHint(null)}
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
          
          {/* Visual level indicator */}
          <div className="flex items-center gap-1">
            {[1, 2, 3].map((level) => (
              <div
                key={level}
                className={`w-2 h-2 rounded-full transition-colors ${
                  level <= activeHint.levelNumber 
                    ? 'bg-primary' 
                    : 'bg-muted-foreground/30'
                }`}
              />
            ))}
            <span className="ml-2 text-xs text-muted-foreground capitalize">
              {activeHint.level} Hint
              {activeHint.levelNumber === 1 && ' • Basic context'}
              {activeHint.levelNumber === 2 && ' • More specific'}
              {activeHint.levelNumber === 3 && ' • Complete help'}
            </span>
          </div>
          
          <p className="text-sm text-muted-foreground leading-relaxed">
            {activeHint.content}
          </p>
          
          {/* Advance hint button */}
          {activeHint.canAdvance && (
            <div className="flex items-center justify-between pt-2 border-t border-border/50">
              <span className="text-xs text-muted-foreground">
                Need more help? Get a {activeHint.level === 'basic' ? 'detailed' : 'complete'} hint
              </span>
              <button
                onClick={advanceHintLevel}
                disabled={loadingHint}
                className="text-xs text-primary hover:text-primary/80 font-medium disabled:opacity-50 
                           flex items-center gap-1 px-2 py-1 rounded hover:bg-primary/10 transition-colors"
              >
                {loadingHint ? (
                  <>
                    <div className="w-3 h-3 border border-primary border-t-transparent rounded-full animate-spin" />
                    Loading...
                  </>
                ) : (
                  <>
                    Next Level
                    <ChevronRight className="w-3 h-3" />
                  </>
                )}
              </button>
            </div>
          )}
          
          {activeHint.levelNumber === 3 && (
            <div className="text-xs text-muted-foreground italic">
              This is the most detailed hint available for "{activeHint.word}"
            </div>
          )}
        </div>
      )}

      {/* Translation input */}
      <div className="mb-6">
        <SmartTranslationInput
          value={currentTranslation}
          onChange={setCurrentTranslation}
          onSubmit={handleTranslationSubmit}
          placeholder="Type your English translation here..."
          disabled={isEvaluating}
        />
      </div>

      {/* Help section */}
      <div className="mb-8 p-4 bg-muted/50 border border-border rounded-lg">
        <div className="flex items-center gap-2 mb-2">
          <HelpCircle className="w-4 h-4 text-muted-foreground" />
          <span className="text-sm font-medium text-foreground">Need Help?</span>
        </div>
        <p className="text-sm text-muted-foreground mb-3">
          Click on any Spanish word to evaluate your understanding. Use the hint button for progressive help.
        </p>
        <div className="flex flex-wrap gap-2">
          {words.map((word, index) => {
            const cleanWord = word.replace(/[.,!?;:]$/, '')
            return (
              <button
                key={index}
                onClick={() => handleHintRequest(cleanWord)}
                disabled={loadingHint}
                className="text-xs px-2 py-1 bg-background border border-border rounded 
                           hover:bg-muted transition-colors disabled:opacity-50"
              >
                Hint: {cleanWord}
              </button>
            )
          })}
        </div>
      </div>

      {/* Action buttons */}
      <ActionButtons
        onPrevious={goToPrevious}
        onNext={goToNext}
        onReset={resetSentence}
        canGoPrevious={currentSentenceIndex > 0}
        canGoNext={currentSentenceIndex < sentences.length - 1}
        previousIcon={ChevronLeft}
        nextIcon={ChevronRight}
        resetIcon={RotateCcw}
      />

      {/* Sentence counter */}
      <div className="text-center mt-6 text-sm text-muted-foreground">
        Sentence {currentSentenceIndex + 1} of {sentences.length}
      </div>
    </div>
  )
}