import { useState } from 'react'
import { CheckCircle, XCircle, Lightbulb, RefreshCw, SkipForward } from 'lucide-react'

interface Sentence {
  id: string
  spanish: string
  english: string
  difficulty: 'beginner' | 'intermediate' | 'advanced'
  hints: string[]
}

// Mock data - will be replaced with API calls
const mockSentence: Sentence = {
  id: '1',
  spanish: 'Me gusta leer libros en la biblioteca.',
  english: 'I like to read books in the library.',
  difficulty: 'beginner',
  hints: [
    'Think about what you enjoy doing',
    '"Me gusta" means "I like"',
    '"leer" is the verb "to read"',
    '"biblioteca" is where you borrow books'
  ]
}

export default function PracticeInterface() {
  const [currentSentence] = useState<Sentence>(mockSentence)
  const [userTranslation, setUserTranslation] = useState('')
  const [showHint, setShowHint] = useState(false)
  const [currentHintIndex, setCurrentHintIndex] = useState(0)
  const [isEvaluated, setIsEvaluated] = useState(false)
  const [evaluationResult, setEvaluationResult] = useState<{
    isCorrect: boolean
    feedback: string
    score: number
  } | null>(null)

  const handleSubmit = () => {
    // Mock evaluation - will be replaced with AI evaluation
    const isCorrect = userTranslation.toLowerCase().includes('like') && 
                     userTranslation.toLowerCase().includes('read') &&
                     userTranslation.toLowerCase().includes('library')
    
    setEvaluationResult({
      isCorrect,
      feedback: isCorrect 
        ? 'Excellent! Your translation captures the meaning perfectly.'
        : 'Good attempt! Try focusing on the key verbs and nouns in the sentence.',
      score: isCorrect ? 95 : 65
    })
    setIsEvaluated(true)
  }

  const handleNextSentence = () => {
    // Reset for next sentence
    setUserTranslation('')
    setShowHint(false)
    setCurrentHintIndex(0)
    setIsEvaluated(false)
    setEvaluationResult(null)
    // In real implementation, would fetch next sentence
  }

  const showNextHint = () => {
    if (currentHintIndex < currentSentence.hints.length - 1) {
      setCurrentHintIndex(prev => prev + 1)
    }
    setShowHint(true)
  }

  return (
    <div className="flex-1 flex flex-col max-w-4xl mx-auto p-6">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-3xl font-bold">Spanish Translation Practice</h1>
          <div className="flex items-center gap-4">
            <div className="text-sm text-muted-foreground">
              Difficulty: <span className="capitalize text-primary font-medium">{currentSentence.difficulty}</span>
            </div>
            <div className="text-sm text-muted-foreground">
              Streak: <span className="text-primary font-medium">12</span>
            </div>
          </div>
        </div>
        
        {/* Progress Bar */}
        <div className="w-full bg-muted rounded-full h-2">
          <div className="bg-primary h-2 rounded-full w-1/3"></div>
        </div>
        <p className="text-sm text-muted-foreground mt-2">Session Progress: 5 of 15 sentences</p>
      </div>

      {/* Main Practice Area */}
      <div className="flex-1 space-y-6">
        {/* Spanish Sentence Card */}
        <div className="card p-6">
          <h2 className="text-sm font-medium text-muted-foreground mb-2">Translate this sentence:</h2>
          <p className="text-2xl font-medium text-foreground mb-4">{currentSentence.spanish}</p>
          
          {/* Hint Section */}
          {showHint && (
            <div className="bg-accent/50 border border-border rounded-lg p-4 mb-4">
              <div className="flex items-start gap-2">
                <Lightbulb className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                <div>
                  <h3 className="font-medium text-sm mb-1">Hint {currentHintIndex + 1}:</h3>
                  <p className="text-sm text-muted-foreground">{currentSentence.hints[currentHintIndex]}</p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Translation Input */}
        <div className="card p-6">
          <label htmlFor="translation" className="block text-sm font-medium mb-2">
            Your English translation:
          </label>
          <textarea
            id="translation"
            value={userTranslation}
            onChange={(e) => setUserTranslation(e.target.value)}
            placeholder="Type your translation here..."
            disabled={isEvaluated}
            className={`w-full h-32 p-3 bg-input border border-border rounded-md text-foreground placeholder:text-muted-foreground resize-none focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-background ${
              isEvaluated ? 'opacity-75' : ''
            }`}
          />
        </div>

        {/* Evaluation Result */}
        {isEvaluated && evaluationResult && (
          <div className={`card p-6 border-l-4 ${
            evaluationResult.isCorrect ? 'border-l-green-500' : 'border-l-yellow-500'
          }`}>
            <div className="flex items-start gap-3">
              {evaluationResult.isCorrect ? (
                <CheckCircle className="w-6 h-6 text-green-500 flex-shrink-0" />
              ) : (
                <XCircle className="w-6 h-6 text-yellow-500 flex-shrink-0" />
              )}
              <div className="flex-1">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-medium">
                    {evaluationResult.isCorrect ? 'Correct!' : 'Good attempt!'}
                  </h3>
                  <span className="text-sm font-medium text-primary">
                    Score: {evaluationResult.score}/100
                  </span>
                </div>
                <p className="text-sm text-muted-foreground mb-3">{evaluationResult.feedback}</p>
                <div className="bg-muted/50 rounded-md p-3">
                  <p className="text-sm"><strong>Expected:</strong> {currentSentence.english}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex items-center justify-between pt-4">
          <div className="flex gap-2">
            {!isEvaluated && (
              <button
                onClick={showNextHint}
                disabled={currentHintIndex >= currentSentence.hints.length - 1 && showHint}
                className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-accent rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Lightbulb className="w-4 h-4" />
                {showHint ? 'Next Hint' : 'Show Hint'}
              </button>
            )}
          </div>

          <div className="flex gap-3">
            {!isEvaluated ? (
              <>
                <button
                  onClick={() => {}} // Skip functionality
                  className="flex items-center gap-2 px-4 py-2 text-sm font-medium bg-secondary text-secondary-foreground hover:bg-secondary/80 rounded-md transition-colors"
                >
                  <SkipForward className="w-4 h-4" />
                  Skip
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={!userTranslation.trim()}
                  className="px-6 py-2 text-sm font-medium bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed rounded-md transition-colors"
                >
                  Submit Translation
                </button>
              </>
            ) : (
              <button
                onClick={handleNextSentence}
                className="flex items-center gap-2 px-6 py-2 text-sm font-medium bg-primary text-primary-foreground hover:bg-primary/90 rounded-md transition-colors"
              >
                <RefreshCw className="w-4 h-4" />
                Next Sentence
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
