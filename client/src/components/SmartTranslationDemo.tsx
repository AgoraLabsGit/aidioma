import React, { useState } from 'react'
import { SmartTranslationInput } from './SmartTranslationInput'
import { DollarSign, Zap, Target, TrendingUp } from 'lucide-react'

interface CostMetrics {
  totalWords: number
  localHits: number
  aiCalls: number
  estimatedCost: number
}

export function SmartTranslationDemo() {
  const [userInput, setUserInput] = useState('')
  const [costMetrics, setCostMetrics] = useState<CostMetrics>({
    totalWords: 0,
    localHits: 0,
    aiCalls: 0,
    estimatedCost: 0
  })

  const exampleSentences = [
    {
      english: "I drink coffee every morning",
      spanish: ["Bebo café todas las mañanas", "Tomo café cada mañana"],
      difficulty: "beginner"
    },
    {
      english: "How are you feeling today?",
      spanish: ["¿Cómo te sientes hoy?", "¿Cómo estás hoy?"],
      difficulty: "beginner"
    },
    {
      english: "We are going to the restaurant",
      spanish: ["Vamos al restaurante", "Nosotros vamos al restaurante"],
      difficulty: "intermediate"
    }
  ]

  const [currentSentence] = useState(exampleSentences[0])

  const handleWordEvaluated = (word: string, evaluation: any) => {
    setCostMetrics(prev => {
      const newMetrics = { ...prev }
      newMetrics.totalWords++
      
      // Local dictionary hits are free
      if (evaluation.status === 'correct' && evaluation.confidence > 0.85) {
        newMetrics.localHits++
      } else {
        // AI evaluation needed
        newMetrics.aiCalls++
        newMetrics.estimatedCost += 0.005 // $0.005 per AI call
      }
      
      return newMetrics
    })
  }

  const costSavings = costMetrics.totalWords > 0 
    ? ((costMetrics.localHits / costMetrics.totalWords) * 100).toFixed(1)
    : '0'

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold text-foreground">Smart Translation Prototype</h2>
        <p className="text-muted-foreground">
          Space-bar triggered word evaluation with clickable hints and auto-help
        </p>
      </div>

      {/* Current Sentence */}
      <div className="p-4 bg-card border border-border rounded-lg">
        <div className="text-sm text-muted-foreground mb-2">Translate this sentence:</div>
        <div className="text-lg font-medium text-foreground mb-4">
          "{currentSentence.english}"
        </div>
        <div className="text-sm text-muted-foreground">
          <strong>Expected:</strong> {currentSentence.spanish.join(' or ')}
        </div>
      </div>

      {/* Smart Input */}
      <SmartTranslationInput
        value={userInput}
        onChange={setUserInput}
        expectedWords={currentSentence.spanish}
        onWordEvaluated={handleWordEvaluated}
        className="max-w-4xl mx-auto"
      />

      {/* Cost Metrics Dashboard */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="p-4 bg-card border border-border rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            <Target className="w-4 h-4 text-blue-500" />
            <span className="text-sm font-medium">Words Evaluated</span>
          </div>
          <div className="text-2xl font-bold text-foreground">{costMetrics.totalWords}</div>
        </div>

        <div className="p-4 bg-card border border-border rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            <Zap className="w-4 h-4 text-green-500" />
            <span className="text-sm font-medium">Local Hits (Free)</span>
          </div>
          <div className="text-2xl font-bold text-green-600">{costMetrics.localHits}</div>
        </div>

        <div className="p-4 bg-card border border-border rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="w-4 h-4 text-orange-500" />
            <span className="text-sm font-medium">AI Calls</span>
          </div>
          <div className="text-2xl font-bold text-orange-600">{costMetrics.aiCalls}</div>
        </div>

        <div className="p-4 bg-card border border-border rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            <DollarSign className="w-4 h-4 text-purple-500" />
            <span className="text-sm font-medium">Est. Cost</span>
          </div>
          <div className="text-2xl font-bold text-purple-600">
            ${costMetrics.estimatedCost.toFixed(3)}
          </div>
        </div>
      </div>

      {/* Cost Analysis */}
      <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <h3 className="text-lg font-semibold text-blue-800 mb-3">Cost Optimization Analysis</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div>
            <div className="font-medium text-blue-700 mb-2">Current Performance:</div>
            <ul className="space-y-1 text-blue-600">
              <li>• Local dictionary hits: {costSavings}%</li>
              <li>• Cost per word: ${costMetrics.totalWords > 0 ? (costMetrics.estimatedCost / costMetrics.totalWords).toFixed(4) : '0.0000'}</li>
              <li>• AI calls avoided: {costMetrics.localHits}</li>
            </ul>
          </div>
          <div>
            <div className="font-medium text-blue-700 mb-2">Projected Savings:</div>
            <ul className="space-y-1 text-blue-600">
              <li>• Without optimization: ${(costMetrics.totalWords * 0.005).toFixed(3)}</li>
              <li>• With optimization: ${costMetrics.estimatedCost.toFixed(3)}</li>
              <li>• Total savings: ${((costMetrics.totalWords * 0.005) - costMetrics.estimatedCost).toFixed(3)}</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Instructions */}
      <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
        <h3 className="text-lg font-semibold text-yellow-800 mb-2">How to Test:</h3>
        <ol className="space-y-1 text-sm text-yellow-700">
          <li>1. <strong>Type Spanish words:</strong> Try "hola", "como", "estas" (these are in local dictionary - free!)</li>
          <li>2. <strong>Press space:</strong> Each space triggers word evaluation with color coding</li>
          <li>3. <strong>Click words:</strong> Click any word for immediate hints (-1.0 pts)</li>
          <li>4. <strong>Test auto-hints:</strong> Type wrong words twice to trigger automatic hints</li>
          <li>5. <strong>Watch costs:</strong> See real-time cost optimization in action</li>
        </ol>
      </div>
    </div>
  )
} 