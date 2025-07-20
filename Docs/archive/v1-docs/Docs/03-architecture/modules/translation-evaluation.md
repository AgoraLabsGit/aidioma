# Translation Evaluation Engine
## Core AI-Powered Assessment System

---

## 🎯 **Module Overview**

The Translation Evaluation Engine provides multi-criteria assessment of Spanish translations using AI with intelligent caching, supporting Practice, Text, and Conversation pages.

### **Core API**
```typescript
interface TranslationEvaluationService {
  evaluateTranslation(input: EvaluationInput): Promise<EvaluationResult>
  evaluateBatch(inputs: EvaluationInput[]): Promise<EvaluationResult[]>
  getEvaluationHistory(userId: string, limit?: number): Promise<EvaluationHistory[]>
  analyzeWeaknesses(userId: string): Promise<WeaknessAnalysis>
}
```

### **Data Types**
```typescript
interface EvaluationInput {
  userTranslation: string
  correctAnswers: string[]
  sentenceId: number
  userId: string
  context: EvaluationContext
}

interface EvaluationContext {
  englishSentence: string
  difficultyLevel: number        // 1-9
  grammarConcepts: string[]      // ['present_tense', 'ser_vs_estar']
  topicCategory: string          // 'daily_life', 'work', etc.
  hintsUsed: number
  attemptNumber: number
  timeSpent: number              // seconds
}

interface EvaluationResult {
  score: number                  // 0-10 overall score
  feedback: string               // User-facing feedback
  detailedScores: DetailedScores
  errors: TranslationError[]
  suggestions: string[]
  wasHelpful: boolean
}

interface DetailedScores {
  grammarAccuracy: number        // 0.0-1.0
  vocabularyAccuracy: number     // 0.0-1.0
  naturalness: number            // 0.0-1.0
  completeness: number           // 0.0-1.0
  contextAppropriate: boolean
}
```

---

## 🤖 **AI Integration Implementation**

### **Structured Prompt Engineering**
```typescript
class PromptBuilder {
  static buildEvaluationPrompt(input: EvaluationInput): string {
    const { userTranslation, correctAnswers, context } = input
    
    return `
Evaluate this Spanish translation with detailed scoring:

CONTEXT:
- English: "${context.englishSentence}"
- Student answer: "${userTranslation}"
- Correct answers: ${correctAnswers.map(a => `"${a}"`).join(' OR ')}
- Difficulty: ${context.difficultyLevel}/9
- Grammar focus: ${context.grammarConcepts.join(', ')}
- Hints used: ${context.hintsUsed}

EVALUATION CRITERIA:
1. Grammar accuracy (verb conjugation, gender agreement, sentence structure)
2. Vocabulary precision (correct word choice, spelling)
3. Naturalness (sounds like native Spanish)
4. Completeness (includes all necessary elements)

RESPONSE FORMAT (JSON only):
{
  "score": number (0-10, where 10 = perfect),
  "feedback": "encouraging, specific feedback for the student",
  "grammarAccuracy": number (0.0-1.0),
  "vocabularyAccuracy": number (0.0-1.0), 
  "naturalness": number (0.0-1.0),
  "completeness": number (0.0-1.0),
  "errors": [
    {
      "type": "grammar|vocabulary|spelling|structure",
      "description": "specific error explanation",
      "severity": "minor|major|critical",
      "suggestion": "how to fix this error"
    }
  ],
  "suggestions": ["actionable improvement tips"],
  "encouragement": "positive reinforcement message"
}

Be constructive and encouraging while maintaining accuracy standards.`
  }
}
```

### **AI Response Processing**
```typescript
class AIResponseProcessor {
  static async processResponse(
    rawResponse: string, 
    input: EvaluationInput
  ): Promise<EvaluationResult> {
    try {
      // Clean and parse AI response
      const cleanResponse = this.cleanAIResponse(rawResponse)
      const parsed = JSON.parse(cleanResponse)
      
      // Validate response structure
      const validated = this.validateAIResponse(parsed)
      
      // Apply business rules and adjustments
      const adjusted = this.applyBusinessRules(validated, input)
      
      return this.formatFinalResult(adjusted, input)
    } catch (error) {
      // Fallback to template-based evaluation
      return this.fallbackEvaluation(input)
    }
  }
  
  private static cleanAIResponse(response: string): string {
    // Remove common AI formatting issues
    return response
      .replace(/```json\n?/g, '')
      .replace(/```\n?/g, '')
      .replace(/^[^{]*/, '')
      .replace(/[^}]*$/, '')
      .trim()
  }
  
  private static validateAIResponse(response: any): any {
    const schema = z.object({
      score: z.number().min(0).max(10),
      feedback: z.string().min(10),
      grammarAccuracy: z.number().min(0).max(1),
      vocabularyAccuracy: z.number().min(0).max(1),
      naturalness: z.number().min(0).max(1),
      completeness: z.number().min(0).max(1),
      errors: z.array(z.object({
        type: z.string(),
        description: z.string(),
        severity: z.enum(['minor', 'major', 'critical']),
        suggestion: z.string()
      })),
      suggestions: z.array(z.string())
    })
    
    return schema.parse(response)
  }
  
  private static applyBusinessRules(
    aiResult: any, 
    input: EvaluationInput
  ): EvaluationResult {
    let adjustedScore = aiResult.score
    
    // Apply hint penalties
    if (input.context.hintsUsed > 0) {
      const hintPenalty = this.calculateHintPenalty(input.context.hintsUsed)
      adjustedScore = Math.max(0.1, adjustedScore - hintPenalty)
    }
    
    // Apply attempt penalties for multiple tries
    if (input.context.attemptNumber > 1) {
      const attemptPenalty = (input.context.attemptNumber - 1) * 0.2
      adjustedScore = Math.max(0.1, adjustedScore - attemptPenalty)
    }
    
    // Time bonus for quick, accurate responses
    if (adjustedScore >= 8 && input.context.timeSpent < 30) {
      adjustedScore = Math.min(10, adjustedScore + 0.5)
    }
    
    return {
      ...aiResult,
      score: Math.round(adjustedScore * 10) / 10,
      originalScore: aiResult.score,
      adjustments: {
        hintPenalty: input.context.hintsUsed * 0.5,
        attemptPenalty: input.context.attemptNumber > 1 ? (input.context.attemptNumber - 1) * 0.2 : 0,
        timeBonus: adjustedScore >= 8 && input.context.timeSpent < 30 ? 0.5 : 0
      }
    }
  }
}
```

---

## 📊 **Evaluation Logic and Scoring**

### **Multi-Criteria Scoring System**
```typescript
class ScoringEngine {
  static calculateOverallScore(detailed: DetailedScores, context: EvaluationContext): number {
    // Weighted scoring based on difficulty and context
    const weights = this.calculateWeights(context)
    
    const weightedScore = 
      (detailed.grammarAccuracy * weights.grammar) +
      (detailed.vocabularyAccuracy * weights.vocabulary) +
      (detailed.naturalness * weights.naturalness) +
      (detailed.completeness * weights.completeness)
    
    // Convert to 0-10 scale
    return Math.round(weightedScore * 10 * 100) / 100
  }
  
  private static calculateWeights(context: EvaluationContext): ScoringWeights {
    // Adjust weights based on difficulty and focus
    const baseWeights = {
      grammar: 0.35,
      vocabulary: 0.30,
      naturalness: 0.20,
      completeness: 0.15
    }
    
    // For beginner levels, emphasize grammar and vocabulary
    if (context.difficultyLevel <= 3) {
      return {
        grammar: 0.40,
        vocabulary: 0.35,
        naturalness: 0.15,
        completeness: 0.10
      }
    }
    
    // For advanced levels, emphasize naturalness
    if (context.difficultyLevel >= 7) {
      return {
        grammar: 0.25,
        vocabulary: 0.25,
        naturalness: 0.35,
        completeness: 0.15
      }
    }
    
    return baseWeights
  }
}
```

### **Error Classification and Feedback**
```typescript
interface TranslationError {
  type: ErrorType
  description: string
  severity: 'minor' | 'major' | 'critical'
  suggestion: string
  grammarRule?: string
  position?: { start: number, end: number }
}

type ErrorType = 
  | 'verb_conjugation'
  | 'gender_agreement' 
  | 'article_usage'
  | 'vocabulary_choice'
  | 'word_order'
  | 'spelling'
  | 'accent_marks'
  | 'incomplete_translation'

class ErrorAnalyzer {
  static analyzeErrors(
    userTranslation: string, 
    correctAnswers: string[], 
    aiErrors: any[]
  ): TranslationError[] {
    const analyzedErrors: TranslationError[] = []
    
    for (const error of aiErrors) {
      const analyzed = this.enhanceError(error, userTranslation, correctAnswers)
      analyzedErrors.push(analyzed)
    }
    
    return analyzedErrors.sort((a, b) => {
      const severityOrder = { critical: 3, major: 2, minor: 1 }
      return severityOrder[b.severity] - severityOrder[a.severity]
    })
  }
  
  private static enhanceError(
    aiError: any, 
    userTranslation: string, 
    correctAnswers: string[]
  ): TranslationError {
    return {
      type: this.classifyErrorType(aiError.type),
      description: aiError.description,
      severity: aiError.severity,
      suggestion: this.enhanceSuggestion(aiError.suggestion, aiError.type),
      grammarRule: this.getGrammarRule(aiError.type),
      position: this.findErrorPosition(aiError.description, userTranslation)
    }
  }
  
  private static getGrammarRule(errorType: string): string | undefined {
    const rules = {
      'verb_conjugation': 'Verbs must agree with their subject in person and number',
      'gender_agreement': 'Adjectives and articles must match the gender of the noun',
      'article_usage': 'Use definite articles (el/la) or indefinite articles (un/una) appropriately'
    }
    return rules[errorType]
  }
}
```

---

## 🔄 **Service Integration Layer**

### **Evaluation Service Implementation**
```typescript
export class TranslationEvaluationService {
  constructor(
    private aiOptimization: AIOptimizationService,
    private storage: IStorage,
    private gamification: GamificationService
  ) {}
  
  async evaluateTranslation(input: EvaluationInput): Promise<EvaluationResult> {
    const startTime = Date.now()
    
    try {
      // Get evaluation (with caching optimization)
      const result = await this.aiOptimization.evaluateWithOptimization(input)
      
      // Store evaluation for learning analytics
      await this.storeEvaluation(input, result)
      
      // Update user progress
      await this.updateUserProgress(input.userId, result)
      
      // Track performance metrics
      const responseTime = Date.now() - startTime
      await this.trackMetrics(input, result, responseTime)
      
      return result
    } catch (error) {
      // Graceful fallback
      return this.handleEvaluationError(input, error)
    }
  }
  
  async evaluateBatch(inputs: EvaluationInput[]): Promise<EvaluationResult[]> {
    // Process in parallel with concurrency limit
    const concurrency = 5
    const results: EvaluationResult[] = []
    
    for (let i = 0; i < inputs.length; i += concurrency) {
      const batch = inputs.slice(i, i + concurrency)
      const batchResults = await Promise.all(
        batch.map(input => this.evaluateTranslation(input))
      )
      results.push(...batchResults)
    }
    
    return results
  }
  
  private async storeEvaluation(
    input: EvaluationInput, 
    result: EvaluationResult
  ): Promise<void> {
    const evaluation = {
      id: generateId(),
      userId: input.userId,
      sentenceId: input.sentenceId,
      userTranslation: input.userTranslation,
      score: result.score,
      detailedScores: result.detailedScores,
      errors: result.errors,
      feedback: result.feedback,
      context: input.context,
      evaluatedAt: new Date()
    }
    
    await this.storage.storeEvaluation(evaluation)
  }
}
```

### **React Component Integration**
```typescript
interface EvaluationFeedbackProps {
  evaluation: EvaluationResult
  onRetry: () => void
  onNext: () => void
}

export function EvaluationFeedback({ evaluation, onRetry, onNext }: EvaluationFeedbackProps) {
  const getScoreColor = (score: number) => {
    if (score >= 8) return 'text-green-600'
    if (score >= 6) return 'text-yellow-600'
    return 'text-red-600'
  }
  
  const getScoreEmoji = (score: number) => {
    if (score >= 9) return '🎉'
    if (score >= 8) return '✨'
    if (score >= 6) return '👍'
    if (score >= 4) return '📚'
    return '💪'
  }
  
  return (
    <div className="evaluation-feedback bg-gray-50 rounded-lg p-6">
      {/* Score Display */}
      <div className="score-header flex items-center justify-center mb-4">
        <span className="text-4xl mr-2">{getScoreEmoji(evaluation.score)}</span>
        <span className={`text-3xl font-bold ${getScoreColor(evaluation.score)}`}>
          {evaluation.score}/10
        </span>
      </div>
      
      {/* Main Feedback */}
      <div className="feedback-content mb-6">
        <p className="text-lg text-gray-700 text-center">
          {evaluation.feedback}
        </p>
      </div>
      
      {/* Detailed Scores */}
      <div className="detailed-scores grid grid-cols-2 gap-4 mb-6">
        <ScoreBar label="Grammar" value={evaluation.detailedScores.grammarAccuracy} />
        <ScoreBar label="Vocabulary" value={evaluation.detailedScores.vocabularyAccuracy} />
        <ScoreBar label="Naturalness" value={evaluation.detailedScores.naturalness} />
        <ScoreBar label="Completeness" value={evaluation.detailedScores.completeness} />
      </div>
      
      {/* Errors and Suggestions */}
      {evaluation.errors.length > 0 && (
        <ErrorsList errors={evaluation.errors} />
      )}
      
      {evaluation.suggestions.length > 0 && (
        <SuggestionsList suggestions={evaluation.suggestions} />
      )}
      
      {/* Action Buttons */}
      <div className="actions flex justify-center space-x-4 mt-6">
        {evaluation.score < 7 && (
          <button onClick={onRetry} className="btn-secondary">
            Try Again
          </button>
        )}
        <button onClick={onNext} className="btn-primary">
          Next Sentence
        </button>
      </div>
    </div>
  )
}
```

---

## 📈 **Performance and Analytics**

### **Evaluation Analytics**
```typescript
interface EvaluationAnalytics {
  userId: string
  totalEvaluations: number
  averageScore: number
  improvementTrend: 'improving' | 'stable' | 'declining'
  weaknessAreas: WeaknessArea[]
  strengthAreas: string[]
  recommendedFocus: string[]
}

interface WeaknessArea {
  category: string
  frequency: number
  averageScore: number
  commonErrors: string[]
  improvementTips: string[]
}

class EvaluationAnalyzer {
  async analyzeUserWeaknesses(userId: string): Promise<WeaknessAnalysis> {
    const evaluations = await this.storage.getUserEvaluations(userId, 50) // Last 50
    
    const errorsByCategory = this.groupErrorsByCategory(evaluations)
    const scoresByGrammarConcept = this.analyzeGrammarConcepts(evaluations)
    const trendAnalysis = this.calculateImprovementTrend(evaluations)
    
    return {
      userId,
      weaknessAreas: this.identifyWeaknesses(errorsByCategory, scoresByGrammarConcept),
      improvementTrend: trendAnalysis,
      recommendedActions: this.generateRecommendations(errorsByCategory, trendAnalysis)
    }
  }
}
```

---

This Translation Evaluation Engine provides comprehensive, intelligent assessment while optimizing costs and providing actionable feedback to accelerate Spanish learning progress.