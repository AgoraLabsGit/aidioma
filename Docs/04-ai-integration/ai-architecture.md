# AIdioma AI Architecture
## Unified AI System with Specialized Provider Integration

---

## 🎯 **System Overview**

AIdioma's AI architecture combines a universal service layer with specialized AI providers to deliver cost-effective, high-quality language learning experiences across all pages.

### **Design Principles**
- **Universal Interface**: Single API works across Practice, Reading, Memorize, and Conversation pages
- **Specialized Providers**: Use the best AI service for each specific task
- **Cost Optimization**: 80-95% cost reduction through intelligent provider selection
- **Consistent Experience**: Same quality standards across all learning activities
- **Flexible Extensions**: Add new content types without code changes

---

## 🏗️ **Architecture Overview**

```typescript
┌─────────────────────────────────────────────────┐
│              UNIVERSAL AI SERVICE               │
│         Single API • Intelligent Routing       │
├─────────────────────────────────────────────────┤
│  Speech & Pronunciation  │  Grammar & Writing   │
│  • Speechmatics API      │  • LanguageTool API  │
│  • Azure Speech Services │  • Ginger API        │
├─────────────────────────────────────────────────┤
│  Translation & Context   │  Educational AI      │
│  • DeepL API (primary)   │  • Anthropic Claude  │
│  • OpenAI (fallback)     │  • OpenAI (complex)  │
├─────────────────────────────────────────────────┤
│           INTELLIGENT CACHING LAYER             │
│   Vector Embeddings • Semantic Similarity      │
│           90%+ Cache Hit Rate Target            │
└─────────────────────────────────────────────────┘
```

---

## 🔧 **Universal Service Interface**

### **Single Evaluation Method**
```typescript
// ✨ ONE API - ALL PAGES
interface UniversalAIService {
  evaluate(request: LearningRequest): Promise<LearningResponse>
  getCacheStats(): Promise<CacheMetrics>
  getProviderHealth(): Promise<ProviderStatus[]>
}

interface LearningRequest {
  userId: string
  contentId: string
  contentType: 'sentence' | 'text' | 'flashcard' | 'scenario' | 'video' | 'podcast'
  activityType: 'translation' | 'comprehension' | 'pronunciation' | 'conversation'
  
  userInput: string
  expectedOutput?: string
  context: LearningContext
  userProfile: UserLearningProfile
}

interface LearningResponse {
  // Universal fields (all activities)
  score: number                    // 0-100 consistent scoring
  feedback: string                 // User-facing feedback
  isCorrect: boolean
  
  // Provider information
  provider: string                 // 'deepl', 'languagetool', 'speechmatics'
  cached: boolean
  responseTime: number
  
  // Activity-specific analysis
  analysisDetails: {
    translation?: TranslationAnalysis
    grammar?: GrammarAnalysis  
    pronunciation?: PronunciationAnalysis
    comprehension?: ComprehensionAnalysis
  }
  
  // Learning insights
  learningInsights: {
    strengths: string[]
    improvements: string[]
    recommendations: string[]
  }
}
```

---

## 🎯 **Specialized Provider Integration**

### **Provider Selection Logic**
```typescript
class ProviderRouter {
  private providers = {
    pronunciation: {
      primary: new SpeechmanticsProvider(),
      fallback: new AzureSpeechProvider()
    },
    grammar: {
      primary: new LanguageToolProvider(),
      fallback: new GingerProvider()
    },
    translation: {
      primary: new DeepLProvider(),
      fallback: new OpenAIProvider()
    },
    comprehension: {
      primary: new AnthropicProvider(),
      fallback: new OpenAIProvider()
    }
  }
  
  async routeRequest(request: LearningRequest): Promise<LearningResponse> {
    const provider = this.selectProvider(request.activityType)
    
    try {
      // Try primary provider
      return await provider.primary.process(request)
    } catch (error) {
      // Fallback to secondary provider
      console.warn(`Primary provider failed, using fallback: ${error.message}`)
      return await provider.fallback.process(request)
    }
  }
  
  private selectProvider(activityType: string) {
    const mapping = {
      'pronunciation': this.providers.pronunciation,
      'translation': this.providers.translation,
      'grammar_check': this.providers.grammar,
      'comprehension': this.providers.comprehension
    }
    
    return mapping[activityType] || this.providers.translation
  }
}
```

### **Provider Implementations**

#### **DeepL Translation Provider**
```typescript
class DeepLProvider implements AIProvider {
  async process(request: LearningRequest): Promise<LearningResponse> {
    const translation = await this.deepl.translate({
      text: request.userInput,
      source_lang: 'ES',
      target_lang: 'EN',
      formality: this.getFormality(request.context)
    })
    
    const analysis = await this.evaluateTranslationQuality(
      request.userInput,
      request.expectedOutput,
      translation.text
    )
    
    return {
      score: analysis.score,
      feedback: this.generateFeedback(analysis),
      provider: 'deepl',
      cached: false,
      analysisDetails: {
        translation: analysis
      }
    }
  }
}
```

#### **LanguageTool Grammar Provider**
```typescript
class LanguageToolProvider implements AIProvider {
  async process(request: LearningRequest): Promise<LearningResponse> {
    const grammarCheck = await this.languageTool.check({
      text: request.userInput,
      language: 'es',
      level: request.userProfile.level
    })
    
    return {
      score: this.calculateGrammarScore(grammarCheck),
      feedback: this.formatGrammarFeedback(grammarCheck),
      provider: 'languagetool',
      cached: false,
      analysisDetails: {
        grammar: {
          errors: grammarCheck.matches,
          suggestions: grammarCheck.replacements
        }
      }
    }
  }
}
```

---

## 🧠 **Intelligent Caching with Vector Embeddings**

### **Multi-Tier Caching Strategy**
```typescript
class IntelligentCache {
  private vectorStore: VectorStore
  private exactCache: Map<string, LearningResponse>
  
  async getCachedResponse(request: LearningRequest): Promise<LearningResponse | null> {
    // Tier 1: Exact match cache
    const exactKey = this.generateCacheKey(request)
    const exactMatch = this.exactCache.get(exactKey)
    if (exactMatch) {
      return { ...exactMatch, cached: true, responseTime: 5 }
    }
    
    // Tier 2: Semantic similarity search
    const embedding = await this.generateEmbedding(request.userInput)
    const similarResults = await this.vectorStore.similaritySearch(
      embedding,
      { threshold: 0.85, limit: 5 }
    )
    
    if (similarResults.length > 0) {
      const bestMatch = similarResults[0]
      const adjustedResponse = this.adjustForSimilarity(bestMatch, request)
      
      // Cache the exact match for next time
      this.exactCache.set(exactKey, adjustedResponse)
      
      return { ...adjustedResponse, cached: true, responseTime: 15 }
    }
    
    return null
  }
  
  async cacheResponse(request: LearningRequest, response: LearningResponse): Promise<void> {
    // Store exact match
    const exactKey = this.generateCacheKey(request)
    this.exactCache.set(exactKey, response)
    
    // Store vector embedding for semantic search
    const embedding = await this.generateEmbedding(request.userInput)
    await this.vectorStore.add({
      id: exactKey,
      embedding,
      metadata: {
        userInput: request.userInput,
        activityType: request.activityType,
        contentType: request.contentType,
        response
      }
    })
  }
}
```

---

## 📄 **Page Integration Examples**

### **Practice Page**
```typescript
class PracticePageController {
  async evaluateTranslation(userTranslation: string, sentence: Sentence) {
    const result = await this.aiService.evaluate({
      userId: this.user.id,
      contentId: sentence.id,
      contentType: 'sentence',
      activityType: 'translation',
      userInput: userTranslation,
      expectedOutput: sentence.english,
      context: {
        difficulty: sentence.difficulty,
        grammarConcepts: sentence.grammarConcepts,
        hints: sentence.hints
      },
      userProfile: await this.getUserProfile()
    })
    
    // Same integration pattern as before
    this.updateUI(result)
    this.trackProgress(result)
  }
}
```

### **Reading Page**
```typescript
class ReadingPageController {
  async checkComprehension(userAnswer: string, question: ComprehensionQuestion) {
    const result = await this.aiService.evaluate({
      userId: this.user.id,
      contentId: question.id,
      contentType: 'text',
      activityType: 'comprehension',
      userInput: userAnswer,
      expectedOutput: question.correctAnswer,
      context: {
        fullText: this.currentText.content,
        questionType: question.type
      },
      userProfile: await this.getUserProfile()
    })
    
    this.displayComprehensionFeedback(result)
  }
  
  async getWordDefinition(word: string, context: string) {
    const result = await this.aiService.evaluate({
      userId: this.user.id,
      contentId: word,
      contentType: 'vocabulary',
      activityType: 'definition',
      userInput: word,
      context: { surrounding: context },
      userProfile: await this.getUserProfile()
    })
    
    this.showWordDefinition(result.feedback)
  }
}
```

### **Pronunciation Assessment**
```typescript
class PronunciationController {
  async assessPronunciation(audioBlob: Blob, targetText: string) {
    const result = await this.aiService.evaluate({
      userId: this.user.id,
      contentId: targetText,
      contentType: 'audio',
      activityType: 'pronunciation',
      userInput: await this.convertToBase64(audioBlob),
      expectedOutput: targetText,
      context: {
        targetDialect: this.user.preferences.dialect,
        nativeAudio: this.getNativeAudioReference(targetText)
      },
      userProfile: await this.getUserProfile()
    })
    
    this.displayPronunciationFeedback(result)
  }
}
```

---

## 💰 **Cost Optimization Strategy**

### **Cost Comparison by Provider**
| Task | Traditional (OpenAI) | Specialized Provider | Savings |
|------|---------------------|---------------------|---------|
| Translation | $0.03/request | $0.003 (DeepL) | 90% |
| Grammar Check | $0.02/request | $0.001 (LanguageTool) | 95% |
| Pronunciation | $0.05/assessment | $0.01 (Speechmatics) | 80% |
| Text-to-Speech | $0.015/1k chars | $0.003 (ElevenLabs) | 80% |

### **Intelligent Caching Benefits**
```typescript
interface CostMetrics {
  totalRequests: number
  cacheHitRate: number           // Target: 90%+
  costPerRequest: {
    withoutCache: number         // $0.02 average
    withCache: number            // $0.002 average
    savings: number              // 90% savings
  }
  monthlyProjection: {
    requests: number
    costWithoutOptimization: number
    actualCost: number
    totalSavings: number
  }
}
```

---

## 🔄 **Error Handling & Reliability**

### **Graceful Fallbacks**
```typescript
class ReliableAIService {
  async evaluate(request: LearningRequest): Promise<LearningResponse> {
    try {
      // Try cached response first
      const cached = await this.cache.getCachedResponse(request)
      if (cached) return cached
      
      // Try specialized provider
      const result = await this.providerRouter.routeRequest(request)
      await this.cache.cacheResponse(request, result)
      return result
      
    } catch (providerError) {
      console.warn('Provider failed, using fallback:', providerError)
      
      try {
        // Fallback to OpenAI
        return await this.openAIFallback.process(request)
      } catch (fallbackError) {
        console.error('All providers failed:', fallbackError)
        
        // Return template-based response
        return this.generateTemplateResponse(request)
      }
    }
  }
}
```

---

## 📊 **Performance Monitoring**

### **Real-time Metrics**
```typescript
interface AIMetrics {
  responseTime: {
    cached: number              // Target: <50ms
    provider: number            // Target: <500ms
    fallback: number            // Target: <2000ms
  }
  reliability: {
    uptime: number              // Target: 99.9%
    errorRate: number           // Target: <1%
    fallbackRate: number        // Target: <5%
  }
  costEfficiency: {
    cacheHitRate: number        // Target: 90%+
    costReduction: number       // Target: 85%+
    avgCostPerRequest: number   // Target: <$0.005
  }
}
```

---

## 🎯 **Implementation Roadmap**

### **Phase 1: Core Universal Service (Week 1)**
1. Create universal AI service interface
2. Implement provider routing logic
3. Add basic caching layer
4. Migrate Practice page

### **Phase 2: Specialized Providers (Week 2)**
1. Integrate DeepL for translations
2. Add LanguageTool for grammar
3. Implement provider fallbacks
4. Enable Reading and Memorize pages

### **Phase 3: Advanced Features (Week 3)**
1. Add vector embedding cache
2. Implement pronunciation assessment
3. Enable Conversation page
4. Add comprehensive monitoring

### **Phase 4: Optimization (Week 4)**
1. Fine-tune caching strategies
2. Optimize provider selection
3. Monitor cost savings
4. Performance optimization

---

## ✅ **Success Criteria**

### **Technical Goals**
- ✅ 90%+ cache hit rate for cost optimization
- ✅ <500ms average response time for specialized providers
- ✅ 99.9% system reliability with fallbacks
- ✅ Single API interface across all pages

### **Business Goals**
- ✅ 85%+ reduction in AI API costs
- ✅ Consistent user experience across all learning activities
- ✅ Support for any new content types without code changes
- ✅ Superior educational quality through specialized providers

---

This unified AI architecture provides the foundation for AIdioma's evolution into a comprehensive, cost-effective language learning platform that leverages the best AI tools for each specific educational task while maintaining simplicity and reliability.
