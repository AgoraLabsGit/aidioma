import { Router } from 'express'
import { universalAILearningService } from '../services/universal-ai-learning-service'
import { seedSentences } from '../data/seed-sentences'
import { db } from '../db/connection'
import { sentences } from '../../../shared/schema'
import { eq, and } from 'drizzle-orm'

const router = Router()

// ✅ GET /api/sentences - Fetch practice sentences with filtering
router.get('/', async (req, res) => {
  try {
    const { difficulty, category, limit = 10, offset = 0 } = req.query
    
    // Build database query with filters
    let query = db.select().from(sentences).where(eq(sentences.isActive, true))
    
    // Apply filters (we'll chain where conditions)
    const conditions = [eq(sentences.isActive, true)]
    
    if (difficulty && difficulty !== 'all') {
      // Type guard for difficulty enum values
      const validDifficulties = ['beginner', 'intermediate', 'advanced'] as const
      if (validDifficulties.includes(difficulty as any)) {
        conditions.push(eq(sentences.difficulty, difficulty as typeof validDifficulties[number]))
      }
    }
    
    if (category && category !== 'all') {
      conditions.push(eq(sentences.category, category as string))
    }
    
    // Execute query with pagination
    const limitNum = Number(limit)
    const offsetNum = Number(offset)
    
    const [sentenceResults, totalResults] = await Promise.all([
      db.select().from(sentences).where(and(...conditions)).limit(limitNum).offset(offsetNum),
      db.select({ count: sentences.id }).from(sentences).where(and(...conditions))
    ])
    
    const total = totalResults.length
    
    res.json({
      success: true,
      data: {
        sentences: sentenceResults.map(sentence => ({
          ...sentence,
          hints: JSON.parse(sentence.hints),
          grammarPoints: JSON.parse(sentence.grammarPoints || '[]'),
        })),
        total,
        hasMore: offsetNum + limitNum < total,
        currentPage: Math.floor(offsetNum / limitNum) + 1,
        totalPages: Math.ceil(total / limitNum)
      }
    })
  } catch (error) {
    console.error('Error fetching sentences:', error)
    res.status(500).json({
      success: false,
      error: 'Failed to fetch sentences'
    })
  }
})

// ✅ GET /api/sentences/:id - Fetch single sentence
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params
    
    const sentenceResults = await db.select()
      .from(sentences)
      .where(and(eq(sentences.id, id), eq(sentences.isActive, true)))
      .limit(1)
    
    const sentence = sentenceResults[0]
    
    if (!sentence) {
      return res.status(404).json({
        success: false,
        error: 'Sentence not found'
      })
    }
    
    res.json({
      success: true,
      data: {
        ...sentence,
        hints: JSON.parse(sentence.hints),
        grammarPoints: JSON.parse(sentence.grammarPoints || '[]'),
      }
    })
  } catch (error) {
    console.error('Error fetching sentence:', error)
    res.status(500).json({
      success: false,
      error: 'Failed to fetch sentence'
    })
  }
})



// 🎯 ENHANCED WORD EVALUATION with Content-Aware AI
router.post('/evaluate-word', async (req, res) => {
  try {
    const { word, context, difficulty = 'beginner', language = 'spanish', pageContext } = req.body

    if (!word || !context) {
      return res.status(400).json({ 
        success: false, 
        error: 'Word and context are required' 
      })
    }

    // 🤖 Use Enhanced Universal AI Service with content-awareness
    const result = await universalAILearningService.evaluateWord({
      word,
      context,
      difficulty,
      language,
      pageContext // Now supports 'practice', 'reading', 'memorize', 'conversation'
    })

    res.json({
      success: true,
      data: {
        word: result.word,
        status: result.status,
        confidence: result.confidence,
        feedback: result.feedback,
        score: result.score,
        pageContext: result.pageContext,
        needsHint: result.status !== 'correct',
        hintShown: false,
        attempts: result.retryCount || 1,
        errorRecovered: result.errorRecovered
      },
      cached: result.cached,
      evaluationTime: result.evaluationTime,
      fallback: false // We're using the real enhanced service
    })

  } catch (error) {
    console.error('Word evaluation failed:', error)
    res.status(500).json({ 
      success: false, 
      error: 'Evaluation service error' 
    })
  }
})

// ✅ POST /api/sentences/progressive-hint - AI-powered progressive hints
router.post('/progressive-hint', async (req, res) => {
  try {
    const { word, level = 'basic', context, sentenceId } = req.body
    
    // Validate input
    if (!word) {
      return res.status(400).json({
        success: false,
        error: 'word is required'
      })
    }
    
    // Find the sentence for context
    let sentence = null
    if (sentenceId) {
      sentence = seedSentences.find(s => s.id === sentenceId && s.isActive)
    }
    
    // 🇪🇸 ENHANCED: Spanish Learning-Focused Progressive Hints
    const spanishText = sentence?.spanish?.toLowerCase() || context?.toLowerCase() || ''
    const englishWord = word.toLowerCase()
    
    const spanishHintTemplates = {
      basic: {
        content: generateBasicSpanishHint(englishWord, spanishText, sentence),
        penalty: 1
      },
      intermediate: {
        content: generateIntermediateSpanishHint(englishWord, spanishText, sentence),
        penalty: 2
      },
      complete: {
        content: generateCompleteSpanishHint(englishWord, spanishText, sentence),
        penalty: 3
      }
    }
    
    const hintData = spanishHintTemplates[level as keyof typeof spanishHintTemplates] || spanishHintTemplates.basic
    
    res.json({
      success: true,
      data: {
        word,
        level,
        content: hintData.content,
        penalty: hintData.penalty,
        generated: true,
        spanishFocused: true
      }
    })
    
  } catch (error) {
    console.error('Error generating Spanish hint:', error)
    res.status(500).json({
      success: false,
      error: 'Failed to generate Spanish learning hint. Please try again.'
    })
  }
})

// 🇪🇸 NEW: Spanish Learning-Focused Hint Generation Functions
function generateBasicSpanishHint(englishWord: string, spanishText: string, sentence: any): string {
  // Level 1: Spanish Grammar Category Recognition
  if (/^(the|a|an)$/i.test(englishWord)) {
    return `"${englishWord}" is an article in English. In Spanish, articles have gender and number. Look for "el" (masculine), "la" (feminine), "un", or "una" in the Spanish text.`
  }
  
  if (/^(is|are|am|was|were)$/i.test(englishWord)) {
    return `"${englishWord}" is a form of "to be" in English. Spanish has two "to be" verbs: "ser" (permanent states) and "estar" (temporary conditions/locations). Look for "es", "está", "son", or "están".`
  }
  
  if (/^(i|you|he|she|we|they)$/i.test(englishWord)) {
    return `"${englishWord}" is a pronoun. Spanish pronouns include: yo (I), tú (you), él (he), ella (she), nosotros (we), ellos/ellas (they). Often Spanish pronouns are omitted because the verb ending shows who's acting.`
  }
  
  if (/^(my|your|his|her|our|their)$/i.test(englishWord)) {
    return `"${englishWord}" shows possession. In Spanish, possessive words must agree with the noun's gender and number: mi/mis, tu/tus, su/sus, nuestro/nuestra/nuestros/nuestras.`
  }
  
  // Default basic hint
  return `"${englishWord}" needs to be translated to Spanish. Think about Spanish grammar patterns - does this word need gender agreement, verb conjugation, or special Spanish forms?`
}

function generateIntermediateSpanishHint(englishWord: string, spanishText: string, sentence: any): string {
  // Level 2: Spanish Pattern Recognition and Context
  if (spanishText.includes('el ') || spanishText.includes('la ')) {
    if (/^(the|a|an)$/i.test(englishWord)) {
      return `The Spanish text contains definite articles ("el" or "la"). These indicate gender: "el" for masculine nouns, "la" for feminine nouns. Check which gender fits with "${englishWord}" in this context.`
    }
  }
  
  if (spanishText.includes('es ') || spanishText.includes('está')) {
    if (/^(is|are|am)$/i.test(englishWord)) {
      return `The Spanish uses a form of "to be." "Es" = permanent characteristics (nationality, profession, personality). "Está" = temporary states or locations. Which meaning of "${englishWord}" fits this sentence?`
    }
  }
  
  if (spanishText.includes('¿') || spanishText.includes('¡')) {
    return `This Spanish sentence uses special punctuation (¿ or ¡). Spanish questions start with ¿ and end with ?. Exclamations start with ¡ and end with !. Consider how "${englishWord}" fits in this question or exclamation.`
  }
  
  if (/[áéíóúñü]/.test(spanishText)) {
    return `The Spanish text contains accented characters (áéíóúñü). These are crucial for correct Spanish spelling and meaning. Look for patterns where "${englishWord}" might correspond to an accented Spanish word.`
  }
  
  // Pattern-based hints
  if (englishWord.endsWith('ing') && (spanishText.includes('ando') || spanishText.includes('iendo'))) {
    return `"${englishWord}" suggests ongoing action. Spanish uses -ando/-iendo endings for "doing" actions (gerunds). Look for these patterns in the Spanish text.`
  }
  
  // Default intermediate hint
  return `"${englishWord}" in Spanish context: Look at the surrounding Spanish words. Spanish word order might be different from English, and this word needs to fit Spanish grammar patterns for gender, number, or verb agreement.`
}

function generateCompleteSpanishHint(englishWord: string, spanishText: string, sentence: any): string {
  // Level 3: Direct Spanish Translation Guidance
  if (!sentence?.spanish) {
    return `For "${englishWord}": Look for the Spanish equivalent that fits this context. Consider Spanish grammar rules for this type of word.`
  }
  
  const spanishWords = sentence.spanish.toLowerCase().split(/\s+/)
  
  // Specific translation guidance
  if (/^(the|a|an)$/i.test(englishWord)) {
    const articles = spanishWords.filter((w: string) => /^(el|la|los|las|un|una|unos|unas)$/.test(w))
    if (articles.length > 0) {
      return `"${englishWord}" corresponds to "${articles[0]}" in the Spanish text. This article shows the gender and number of the following noun.`
    }
  }
  
  if (/^(is|are|am)$/i.test(englishWord)) {
    const verbs = spanishWords.filter((w: string) => /^(es|está|son|están|soy|eres)$/.test(w))
    if (verbs.length > 0) {
      return `"${englishWord}" translates to "${verbs[0]}" here. Remember: ser (es/son) for permanent traits, estar (está/están) for temporary states and locations.`
    }
  }
  
  // Word length and position clues
  const englishLength = englishWord.length
  const potentialMatches = spanishWords.filter((w: string) => Math.abs(w.length - englishLength) <= 2)
  
  if (potentialMatches.length > 0) {
    return `"${englishWord}" likely corresponds to a Spanish word of similar length. Look for words around ${englishLength} letters in the Spanish text. Consider Spanish spelling patterns.`
  }
  
  // Default complete hint with sentence reference
  return `"${englishWord}" appears in this Spanish sentence: "${sentence.spanish}". Find the Spanish word or phrase that expresses the same meaning as "${englishWord}" in this specific context.`
}

// ✅ GET /api/sentences/categories - Get available categories
router.get('/meta/categories', async (req, res) => {
  try {
    const categories = [...new Set(seedSentences.map(s => s.category))].sort()
    
    res.json({
      success: true,
      data: categories
    })
  } catch (error) {
    console.error('Error fetching categories:', error)
    res.status(500).json({
      success: false,
      error: 'Failed to fetch categories'
    })
  }
})

// ✅ GET /api/sentences/stats - Get content statistics
router.get('/meta/stats', async (req, res) => {
  try {
    const activeSentences = seedSentences.filter(s => s.isActive)
    
    const stats = {
      total: activeSentences.length,
      byDifficulty: {
        beginner: activeSentences.filter(s => s.difficulty === 'beginner').length,
        intermediate: activeSentences.filter(s => s.difficulty === 'intermediate').length,
        advanced: activeSentences.filter(s => s.difficulty === 'advanced').length
      },
      byCategory: activeSentences
        .filter(s => s.category)
        .reduce((acc, sentence) => {
          const category = sentence.category!
          acc[category] = (acc[category] || 0) + 1
          return acc
        }, {} as Record<string, number>),
      categories: [...new Set(activeSentences.map(s => s.category))].sort()
    }
    
    res.json({
      success: true,
      data: stats
    })
  } catch (error) {
    console.error('Error fetching stats:', error)
    res.status(500).json({
      success: false,
      error: 'Failed to fetch statistics'
    })
  }
})

// ✅ POST /api/sentences/evaluate - Complete translation evaluation 
router.post('/evaluate', async (req, res) => {
  try {
    const { sentenceId, userTranslation, correctAnswer, pageContext = 'practice' } = req.body

    if (!sentenceId || !userTranslation) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: sentenceId and userTranslation'
      })
    }

    // Use our Universal AI Service for complete translation evaluation
    const evaluationResult = await universalAILearningService.evaluateWord({
      word: userTranslation.trim(),
      context: correctAnswer || 'Spanish sentence context',
      difficulty: 'beginner',
      language: 'spanish',
      pageContext
    })

    // Convert word evaluation to sentence evaluation format
    const score = Math.round(evaluationResult.score)
    const grade = score >= 90 ? 'A+' : score >= 80 ? 'A' : score >= 70 ? 'B' : score >= 60 ? 'C' : 'D'
    
    res.json({
      success: true,
      data: {
        score,
        grade,
        feedback: evaluationResult.feedback,
        isCorrect: evaluationResult.status === 'correct',
        status: evaluationResult.status,
        confidence: evaluationResult.confidence,
        corrections: [],
        pointsEarned: Math.round(score / 10),
        cached: evaluationResult.cached,
        evaluationTime: evaluationResult.evaluationTime
      }
    })
  } catch (error) {
    console.error('Translation evaluation error:', error)
    res.status(500).json({
      success: false,
      error: 'Translation evaluation failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    })
  }
})

export default router 