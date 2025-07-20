# Content Processing System
## Text Analysis, Categorization, and Enhancement Pipeline

---

## 🎯 **System Overview**

Intelligent content processing pipeline that transforms raw text into structured learning materials for the Text page, with automatic difficulty assessment, vocabulary extraction, and AI enhancement.

### **Core API**
```typescript
interface ContentProcessingService {
  processText(content: ProcessingInput): Promise<ProcessingResult>
  analyzeVocabulary(text: string): Promise<VocabularyAnalysis>
  assessDifficulty(content: string): Promise<DifficultyAssessment>
  extractTopics(content: string): Promise<TopicExtraction>
  generateMetadata(content: ProcessedContent): Promise<ContentMetadata>
}
```

### **Data Types**
```typescript
interface ProcessingInput {
  title: string
  content: string
  contentType: 'ai_story' | 'web_story' | 'book' | 'conversation' | 'article'
  authorInfo?: string
  sourceUrl?: string
  targetLevel?: number  // 1-9 difficulty target
  processingOptions: ProcessingOptions
}

interface ProcessingOptions {
  generateHints: boolean
  extractVocabulary: boolean
  assessDifficulty: boolean
  createSentences: boolean
  enhanceWithAI: boolean
  maxSentences?: number
}

interface ProcessingResult {
  contentId: number
  metadata: ContentMetadata
  sentences: ProcessedSentence[]
  vocabulary: VocabularyItem[]
  analytics: ProcessingAnalytics
  processingTime: number
}
```

---

## 📝 **Text Analysis Engine**

### **Sentence Segmentation**
```typescript
class SentenceSegmenter {
  private spanishSentencePatterns = [
    /[.!?]+\s+(?=[A-ZÁÉÍÓÚÑÜ])/g,  // Standard sentence endings
    /[.!?]+\s*$/g,                   // End of text
    /(?<=[.!?])\s*["']\s*(?=[A-ZÁÉÍÓÚÑÜ])/g,  // Quoted sentences
    /(?<=Sr\.|Sra\.|Dr\.)\s+(?=[A-ZÁÉÍÓÚÑÜ])/g // Handle abbreviations
  ]
  
  segmentText(text: string): SentenceSegment[] {
    // Clean and normalize text
    const normalized = this.normalizeText(text)
    
    // Split into potential sentences
    const rawSentences = this.splitBySentenceMarkers(normalized)
    
    // Refine segmentation and add metadata
    return rawSentences.map((sentence, index) => ({
      id: index + 1,
      text: sentence.trim(),
      startPosition: this.findPositionInOriginal(text, sentence),
      endPosition: this.findPositionInOriginal(text, sentence) + sentence.length,
      wordCount: this.countWords(sentence),
      hasDialogue: this.detectDialogue(sentence),
      punctuationMarks: this.extractPunctuation(sentence)
    }))
  }
  
  private normalizeText(text: string): string {
    return text
      .replace(/\s+/g, ' ')           // Normalize whitespace
      .replace(/([.!?])\s*([.!?])/g, '$1 $2')  // Fix multiple punctuation
      .replace(/\s+([.!?])/g, '$1')   // Remove space before punctuation
      .trim()
  }
  
  private detectDialogue(sentence: string): boolean {
    return /^[—\-"']|[—\-"']$/.test(sentence.trim())
  }
  
  private countWords(sentence: string): number {
    return sentence.trim().split(/\s+/).filter(word => word.length > 0).length
  }
}
```

### **Vocabulary Analysis**
```typescript
interface VocabularyItem {
  word: string
  lemma: string
  frequency: number
  difficulty: number    // 1-5 scale
  wordType: 'noun' | 'verb' | 'adjective' | 'adverb' | 'preposition' | 'article' | 'pronoun'
  gender?: 'masculine' | 'feminine'
  conjugations?: string[]
  translations: string[]
  contextSentences: string[]
}

class VocabularyAnalyzer {
  private spanishFrequencyData: Map<string, number> = new Map()
  private commonWords: Set<string> = new Set()
  
  async analyzeVocabulary(text: string): Promise<VocabularyAnalysis> {
    const words = this.extractWords(text)
    const vocabularyItems: VocabularyItem[] = []
    
    for (const word of words) {
      const analysis = await this.analyzeWord(word, text)
      if (analysis && !this.isCommonWord(word)) {
        vocabularyItems.push(analysis)
      }
    }
    
    return {
      totalWords: words.length,
      uniqueWords: new Set(words).size,
      vocabularyItems: vocabularyItems.sort((a, b) => b.frequency - a.frequency),
      difficultyDistribution: this.calculateDifficultyDistribution(vocabularyItems),
      readingLevel: this.estimateReadingLevel(vocabularyItems)
    }
  }
  
  private async analyzeWord(word: string, context: string): Promise<VocabularyItem | null> {
    const lemma = await this.getLemma(word)
    const frequency = this.getWordFrequency(word, context)
    const difficulty = this.assessWordDifficulty(word, lemma)
    const wordType = await this.determineWordType(word, context)
    
    return {
      word,
      lemma,
      frequency,
      difficulty,
      wordType,
      gender: await this.determineGender(word, wordType),
      conjugations: wordType === 'verb' ? await this.getConjugations(lemma) : undefined,
      translations: await this.getTranslations(lemma),
      contextSentences: this.findContextSentences(word, context)
    }
  }
  
  private assessWordDifficulty(word: string, lemma: string): number {
    // Combine multiple factors for difficulty assessment
    const frequencyScore = this.getFrequencyScore(lemma)
    const lengthScore = Math.min(word.length / 10, 1) // Longer words tend to be harder
    const syllableScore = this.countSyllables(word) / 5
    const cognateScore = this.isCognate(word) ? -0.5 : 0 // Cognates are easier
    
    const combined = (frequencyScore + lengthScore + syllableScore + cognateScore) / 3
    return Math.max(1, Math.min(5, Math.round(combined * 5)))
  }
}
```

---

## 🎯 **Difficulty Assessment Engine**

### **Multi-Factor Difficulty Calculation**
```typescript
interface DifficultyFactors {
  vocabularyComplexity: number
  grammarComplexity: number
  sentenceLength: number
  culturalContext: number
  idiomsAndExpressions: number
}

interface DifficultyAssessment {
  overallDifficulty: number  // 1-9 scale
  factors: DifficultyFactors
  recommendations: string[]
  targetAudience: string
  estimatedReadingTime: number
}

class DifficultyAssessor {
  async assessDifficulty(content: string): Promise<DifficultyAssessment> {
    const sentences = this.segmentIntoSentences(content)
    const vocabulary = await this.analyzeVocabulary(content)
    const grammar = await this.analyzeGrammar(content)
    
    const factors: DifficultyFactors = {
      vocabularyComplexity: this.calculateVocabularyComplexity(vocabulary),
      grammarComplexity: this.calculateGrammarComplexity(grammar),
      sentenceLength: this.calculateSentenceLengthComplexity(sentences),
      culturalContext: this.assessCulturalComplexity(content),
      idiomsAndExpressions: this.detectIdiomsComplexity(content)
    }
    
    const overallDifficulty = this.computeOverallDifficulty(factors)
    
    return {
      overallDifficulty,
      factors,
      recommendations: this.generateRecommendations(factors, overallDifficulty),
      targetAudience: this.determineTargetAudience(overallDifficulty),
      estimatedReadingTime: this.calculateReadingTime(content, overallDifficulty)
    }
  }
  
  private calculateVocabularyComplexity(vocabulary: VocabularyAnalysis): number {
    const averageDifficulty = vocabulary.vocabularyItems.reduce((sum, item) => sum + item.difficulty, 0) / vocabulary.vocabularyItems.length
    const rareLevelWords = vocabulary.vocabularyItems.filter(item => item.difficulty >= 4).length
    const rareWordRatio = rareLevelWords / vocabulary.vocabularyItems.length
    
    return (averageDifficulty * 0.7) + (rareWordRatio * 10 * 0.3)
  }
  
  private calculateGrammarComplexity(grammar: GrammarAnalysis): number {
    const complexityFactors = {
      subjunctive: grammar.hasSubjunctive ? 3 : 0,
      conditionals: grammar.conditionalCount * 0.5,
      complexTenses: grammar.complexTenseCount * 0.3,
      passiveVoice: grammar.passiveVoiceCount * 0.4,
      subordinateClauses: grammar.subordinateClauseCount * 0.2
    }
    
    const totalComplexity = Object.values(complexityFactors).reduce((sum, val) => sum + val, 0)
    return Math.min(9, totalComplexity)
  }
  
  private computeOverallDifficulty(factors: DifficultyFactors): number {
    const weights = {
      vocabularyComplexity: 0.35,
      grammarComplexity: 0.30,
      sentenceLength: 0.15,
      culturalContext: 0.10,
      idiomsAndExpressions: 0.10
    }
    
    const weightedSum = Object.entries(factors).reduce((sum, [key, value]) => {
      return sum + (value * weights[key as keyof DifficultyFactors])
    }, 0)
    
    return Math.max(1, Math.min(9, Math.round(weightedSum)))
  }
}
```

---

## 🏷️ **Topic Classification System**

### **AI-Enhanced Topic Extraction**
```typescript
interface TopicExtraction {
  primaryTopic: string
  secondaryTopics: string[]
  confidence: number
  keywords: string[]
  culturalElements: string[]
  grammarFocus: string[]
}

class TopicClassifier {
  private readonly TOPIC_CATEGORIES = [
    'daily_life', 'family', 'food', 'travel', 'work', 'education',
    'health', 'entertainment', 'sports', 'technology', 'politics',
    'culture', 'history', 'science', 'art', 'literature'
  ]
  
  async extractTopics(content: string): Promise<TopicExtraction> {
    // Use AI for initial topic identification
    const aiTopics = await this.getAITopicSuggestions(content)
    
    // Combine with keyword-based classification
    const keywordTopics = this.classifyByKeywords(content)
    
    // Merge and validate results
    const topics = this.mergeTopicResults(aiTopics, keywordTopics)
    
    return {
      primaryTopic: topics.primary,
      secondaryTopics: topics.secondary,
      confidence: topics.confidence,
      keywords: this.extractKeywords(content),
      culturalElements: this.identifyCulturalElements(content),
      grammarFocus: this.identifyGrammarFocus(content)
    }
  }
  
  private async getAITopicSuggestions(content: string): Promise<any> {
    const prompt = `
Analyze this Spanish text and identify:
1. Primary topic (main subject matter)
2. Secondary topics (related themes)
3. Cultural elements mentioned
4. Grammar concepts present

Text: "${content.substring(0, 500)}..."

Respond with JSON:
{
  "primaryTopic": "category",
  "secondaryTopics": ["category1", "category2"],
  "culturalElements": ["element1", "element2"],
  "grammarConcepts": ["concept1", "concept2"],
  "confidence": 0.85
}

Available categories: ${this.TOPIC_CATEGORIES.join(', ')}`
    
    // This would use the AI integration service
    return await this.aiService.getTopicClassification(prompt)
  }
  
  private classifyByKeywords(content: string): TopicClassification {
    const topicKeywords = {
      daily_life: ['casa', 'familia', 'trabajo', 'rutina', 'día'],
      food: ['comida', 'restaurante', 'cocinar', 'comer', 'bebida'],
      travel: ['viaje', 'hotel', 'aeropuerto', 'vacaciones', 'turismo'],
      work: ['oficina', 'reunión', 'proyecto', 'empresa', 'negocio']
      // ... more categories
    }
    
    const scores = new Map<string, number>()
    
    for (const [topic, keywords] of Object.entries(topicKeywords)) {
      const score = keywords.reduce((count, keyword) => {
        const regex = new RegExp(`\\b${keyword}\\b`, 'gi')
        const matches = content.match(regex)
        return count + (matches ? matches.length : 0)
      }, 0)
      scores.set(topic, score)
    }
    
    const sortedTopics = Array.from(scores.entries())
      .sort(([,a], [,b]) => b - a)
      .filter(([,score]) => score > 0)
    
    return {
      primary: sortedTopics[0]?.[0] || 'general',
      secondary: sortedTopics.slice(1, 4).map(([topic]) => topic),
      confidence: sortedTopics[0]?.[1] > 2 ? 0.8 : 0.6
    }
  }
}
```

---

## 🔄 **Content Enhancement Pipeline**

### **AI-Powered Content Enhancement**
```typescript
interface ContentEnhancement {
  improvedText: string
  addedContext: string[]
  vocabularyNotes: VocabularyNote[]
  culturalNotes: CulturalNote[]
  grammarExplanations: GrammarExplanation[]
}

class ContentEnhancer {
  constructor(
    private aiService: AIService,
    private storage: IStorage
  ) {}
  
  async enhanceContent(content: ProcessedContent): Promise<ContentEnhancement> {
    const enhancements = await Promise.all([
      this.generateVocabularyNotes(content),
      this.addCulturalContext(content),
      this.createGrammarExplanations(content),
      this.improveReadability(content)
    ])
    
    return {
      improvedText: enhancements[3].improvedText,
      addedContext: enhancements[3].contextualAdditions,
      vocabularyNotes: enhancements[0],
      culturalNotes: enhancements[1],
      grammarExplanations: enhancements[2]
    }
  }
  
  private async generateVocabularyNotes(content: ProcessedContent): Promise<VocabularyNote[]> {
    const difficultWords = content.vocabulary.filter(word => word.difficulty >= 3)
    const notes: VocabularyNote[] = []
    
    for (const word of difficultWords) {
      const note = await this.createVocabularyNote(word, content.text)
      notes.push(note)
    }
    
    return notes
  }
  
  private async createVocabularyNote(word: VocabularyItem, context: string): Promise<VocabularyNote> {
    const prompt = `
Create a helpful vocabulary note for Spanish learners:

Word: "${word.word}"
Context: "${context}"
Difficulty: ${word.difficulty}/5

Include:
- Simple definition in English
- Example sentence in Spanish
- Memory tip or mnemonic
- Related words

Format as JSON:
{
  "definition": "simple English definition",
  "example": "Spanish example sentence",
  "memoryTip": "helpful memory aid",
  "relatedWords": ["word1", "word2"]
}`
    
    const aiResponse = await this.aiService.generateVocabularyNote(prompt)
    
    return {
      word: word.word,
      position: this.findWordPosition(word.word, context),
      ...aiResponse
    }
  }
}
```

---

## 📊 **Processing Service Implementation**

### **Main Processing Service**
```typescript
export class ContentProcessingService {
  constructor(
    private storage: IStorage,
    private aiService: AIService,
    private segmenter: SentenceSegmenter,
    private vocabularyAnalyzer: VocabularyAnalyzer,
    private difficultyAssessor: DifficultyAssessor,
    private topicClassifier: TopicClassifier,
    private contentEnhancer: ContentEnhancer
  ) {}
  
  async processText(input: ProcessingInput): Promise<ProcessingResult> {
    const startTime = Date.now()
    
    try {
      // Step 1: Basic text analysis
      const sentences = this.segmenter.segmentText(input.content)
      const vocabulary = await this.vocabularyAnalyzer.analyzeVocabulary(input.content)
      
      // Step 2: Advanced analysis
      const difficulty = await this.difficultyAssessor.assessDifficulty(input.content)
      const topics = await this.topicClassifier.extractTopics(input.content)
      
      // Step 3: AI enhancement (if requested)
      let enhancement: ContentEnhancement | null = null
      if (input.processingOptions.enhanceWithAI) {
        enhancement = await this.contentEnhancer.enhanceContent({
          text: input.content,
          vocabulary,
          difficulty,
          topics
        })
      }
      
      // Step 4: Create processeds sentences
      const processedSentences = await this.createProcessedSentences(
        sentences, 
        input, 
        difficulty,
        enhancement
      )
      
      // Step 5: Store in database
      const contentId = await this.storeProcessedContent(input, {
        sentences: processedSentences,
        vocabulary,
        difficulty,
        topics,
        enhancement
      })
      
      const processingTime = Date.now() - startTime
      
      return {
        contentId,
        metadata: this.generateMetadata(input, difficulty, topics),
        sentences: processedSentences,
        vocabulary: vocabulary.vocabularyItems,
        analytics: {
          processingTime,
          sentenceCount: sentences.length,
          vocabularyCount: vocabulary.vocabularyItems.length,
          averageDifficulty: difficulty.overallDifficulty,
          primaryTopic: topics.primaryTopic
        },
        processingTime
      }
    } catch (error) {
      console.error('Content processing failed:', error)
      throw new Error('Failed to process content. Please try again.')
    }
  }
  
  private async createProcessedSentences(
    sentences: SentenceSegment[],
    input: ProcessingInput,
    difficulty: DifficultyAssessment,
    enhancement: ContentEnhancement | null
  ): Promise<ProcessedSentence[]> {
    const processedSentences: ProcessedSentence[] = []
    
    for (const [index, sentence] of sentences.entries()) {
      if (input.processingOptions.maxSentences && index >= input.processingOptions.maxSentences) {
        break
      }
      
      const processed: ProcessedSentence = {
        id: index + 1,
        englishText: '', // Would be generated by AI translation
        spanishText: sentence.text,
        difficultyLevel: this.calculateSentenceDifficulty(sentence, difficulty),
        hints: input.processingOptions.generateHints ? await this.generateHints(sentence) : {},
        grammarConcepts: this.extractGrammarConcepts(sentence.text),
        vocabularyHighlights: this.identifyVocabularyHighlights(sentence.text),
        culturalNotes: enhancement?.culturalNotes.filter(note => 
          sentence.text.includes(note.keyword)
        ) || []
      }
      
      processedSentences.push(processed)
    }
    
    return processedSentences
  }
}
```

### **React Component Integration**
```typescript
interface ContentProcessorProps {
  onProcessingComplete: (result: ProcessingResult) => void
  onError: (error: string) => void
}

export function ContentProcessor({ onProcessingComplete, onError }: ContentProcessorProps) {
  const [isProcessing, setIsProcessing] = useState(false)
  const [progress, setProgress] = useState(0)
  const [currentStep, setCurrentStep] = useState('')
  
  const processingSteps = [
    'Analyzing text structure...',
    'Extracting vocabulary...',
    'Assessing difficulty...',
    'Classifying topics...',
    'Enhancing with AI...',
    'Creating sentences...',
    'Storing content...'
  ]
  
  const processContent = async (input: ProcessingInput) => {
    setIsProcessing(true)
    setProgress(0)
    
    try {
      for (let i = 0; i < processingSteps.length; i++) {
        setCurrentStep(processingSteps[i])
        setProgress((i / processingSteps.length) * 100)
        
        // Small delay to show progress
        await new Promise(resolve => setTimeout(resolve, 500))
      }
      
      const result = await contentProcessingService.processText(input)
      setProgress(100)
      onProcessingComplete(result)
    } catch (error) {
      onError(error.message)
    } finally {
      setIsProcessing(false)
    }
  }
  
  return (
    <div className="content-processor">
      {isProcessing && (
        <div className="processing-overlay">
          <div className="processing-content">
            <LoadingSpinner size="lg" />
            <p className="mt-4 text-lg">{currentStep}</p>
            <ProgressBar current={progress} total={100} className="mt-4 w-64" />
          </div>
        </div>
      )}
      
      {/* Processing interface would go here */}
    </div>
  )
}
```

---

This content processing system provides comprehensive text analysis and enhancement capabilities, transforming raw Spanish content into structured learning materials optimized for the AIdioma learning experience.