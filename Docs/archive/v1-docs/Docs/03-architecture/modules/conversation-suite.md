# Conversation Suite
## Real-Time AI Chat System for Spanish Practice

---

## 🎯 **Module Overview**

The Conversation Suite enables real-time Spanish practice through AI-powered chat with configurable personas, turn-by-turn evaluation, and adaptive conversation management.

### **Core API**
```typescript
interface ConversationService {
  startConversation(params: ConversationParams): Promise<ConversationSession>
  sendMessage(sessionId: string, message: string): Promise<ConversationResponse>
  evaluateTurn(sessionId: string, turnId: string): Promise<TurnEvaluation>
  getConversationHistory(userId: string): Promise<ConversationHistory[]>
  endConversation(sessionId: string): Promise<ConversationSummary>
}
```

### **Data Types**
```typescript
interface ConversationParams {
  userId: string
  topicId: string
  personaId: string
  difficultyLevel: number  // 1-9
  conversationType: 'guided' | 'free' | 'roleplay'
  maxTurns?: number
}

interface ConversationSession {
  sessionId: string
  userId: string
  persona: ConversationPersona
  topic: ConversationTopic
  status: 'active' | 'paused' | 'completed'
  turns: ConversationTurn[]
  startedAt: Date
  context: ConversationContext
}

interface ConversationResponse {
  turnId: string
  aiMessage: string
  evaluation: TurnEvaluation
  suggestions: string[]
  nextPrompts?: string[]
  conversationStatus: 'continuing' | 'ending' | 'topic_shift'
}
```

---

## 🤖 **AI Persona System**

### **Persona Definitions**
```typescript
interface ConversationPersona {
  id: string
  name: string
  role: string
  personality: PersonalityTraits
  language: LanguageProfile
  backstory: string
  avatar: string
  region: SpanishRegion
}

interface PersonalityTraits {
  formality: number        // 0-1 (informal to formal)
  patience: number         // 0-1 (impatient to very patient)
  enthusiasm: number       // 0-1 (reserved to very enthusiastic)
  supportiveness: number   // 0-1 (neutral to very supportive)
  chattiness: number       // 0-1 (brief to very talkative)
}

interface LanguageProfile {
  region: 'spain' | 'mexico' | 'argentina' | 'colombia' | 'neutral'
  formalityLevel: 'muy_formal' | 'formal' | 'neutral' | 'informal' | 'muy_informal'
  vocabulary: 'simple' | 'standard' | 'advanced' | 'native'
  speakingSpeed: 'slow' | 'normal' | 'fast'
  dialectFeatures: string[]
}

const CONVERSATION_PERSONAS: ConversationPersona[] = [
  {
    id: 'maria_teacher',
    name: 'María',
    role: 'Spanish Teacher',
    personality: {
      formality: 0.7,
      patience: 0.9,
      enthusiasm: 0.8,
      supportiveness: 1.0,
      chattiness: 0.6
    },
    language: {
      region: 'spain',
      formalityLevel: 'formal',
      vocabulary: 'standard',
      speakingSpeed: 'slow',
      dialectFeatures: ['vosotros', 'peninsular_pronunciation']
    },
    backstory: 'Experienced Spanish teacher from Madrid who loves helping students learn',
    avatar: '👩‍🏫',
    region: 'spain'
  },
  {
    id: 'carlos_friend',
    name: 'Carlos',
    role: 'Mexican Friend',
    personality: {
      formality: 0.3,
      patience: 0.7,
      enthusiasm: 0.9,
      supportiveness: 0.8,
      chattiness: 0.8
    },
    language: {
      region: 'mexico',
      formalityLevel: 'informal',
      vocabulary: 'simple',
      speakingSpeed: 'normal',
      dialectFeatures: ['mexican_slang', 'no_vosotros']
    },
    backstory: 'Friendly college student from Mexico City who enjoys meeting new people',
    avatar: '👨‍🎓',
    region: 'mexico'
  }
]
```

### **Persona Behavior Engine**
```typescript
class PersonaBehaviorEngine {
  constructor(private persona: ConversationPersona) {}
  
  generateResponse(
    userMessage: string, 
    context: ConversationContext,
    topic: ConversationTopic
  ): Promise<string> {
    const prompt = this.buildPersonaPrompt(userMessage, context, topic)
    return this.aiService.generateResponse(prompt)
  }
  
  private buildPersonaPrompt(
    userMessage: string, 
    context: ConversationContext,
    topic: ConversationTopic
  ): string {
    return `
You are ${this.persona.name}, a ${this.persona.role} from ${this.persona.region}.

PERSONALITY:
- Formality: ${this.getPersonalityDescription('formality')}
- Patience: ${this.getPersonalityDescription('patience')}
- Enthusiasm: ${this.getPersonalityDescription('enthusiasm')}
- Supportiveness: ${this.getPersonalityDescription('supportiveness')}

LANGUAGE STYLE:
- Region: ${this.persona.language.region}
- Formality: ${this.persona.language.formalityLevel}
- Vocabulary: Use ${this.persona.language.vocabulary} vocabulary
- Features: ${this.persona.language.dialectFeatures.join(', ')}

CONVERSATION CONTEXT:
- Topic: ${topic.name}
- User Level: ${context.userLevel}/9
- Turn: ${context.currentTurn}
- Previous context: ${context.recentMessages.slice(-3).join(' → ')}

USER MESSAGE: "${userMessage}"

INSTRUCTIONS:
1. Respond naturally as ${this.persona.name}
2. Keep vocabulary appropriate for level ${context.userLevel}
3. Stay on topic: ${topic.name}
4. ${this.getResponseStyleGuidance()}
5. Include cultural elements when natural
6. Respond in Spanish only

Response:`
  }
  
  private getPersonalityDescription(trait: keyof PersonalityTraits): string {
    const value = this.persona.personality[trait]
    const descriptions = {
      formality: value > 0.7 ? 'Very formal (use usted)' : value > 0.4 ? 'Somewhat formal' : 'Casual and informal (use tú)',
      patience: value > 0.7 ? 'Very patient with mistakes' : value > 0.4 ? 'Understanding' : 'May show slight impatience',
      enthusiasm: value > 0.7 ? 'Very enthusiastic and energetic' : value > 0.4 ? 'Moderately enthusiastic' : 'Reserved and calm',
      supportiveness: value > 0.7 ? 'Very encouraging and helpful' : value > 0.4 ? 'Supportive' : 'Neutral, factual',
      chattiness: value > 0.7 ? 'Talkative, asks follow-up questions' : value > 0.4 ? 'Conversational' : 'Brief and to the point'
    }
    return descriptions[trait]
  }
}
```

---

## 💬 **Conversation Management System**

### **Topic and Flow Management**
```typescript
interface ConversationTopic {
  id: string
  name: string
  description: string
  difficulty: number
  vocabulary: string[]
  grammarFocus: string[]
  culturalElements: string[]
  prompts: ConversationPrompt[]
  objectives: LearningObjective[]
}

interface ConversationPrompt {
  id: string
  text: string
  difficulty: number
  expectedResponses: string[]
  followUpQuestions: string[]
  grammarTarget?: string
}

const CONVERSATION_TOPICS: ConversationTopic[] = [
  {
    id: 'restaurant_visit',
    name: 'En el Restaurante',
    description: 'Ordering food and drinks at a restaurant',
    difficulty: 3,
    vocabulary: ['menú', 'camarero', 'cuenta', 'plato', 'bebida', 'postre'],
    grammarFocus: ['polite_requests', 'food_preferences', 'present_tense'],
    culturalElements: ['restaurant_etiquette', 'tipping_culture', 'meal_times'],
    prompts: [
      {
        id: 'greeting',
        text: '¡Hola! Bienvenido a nuestro restaurante. ¿Mesa para cuántas personas?',
        difficulty: 2,
        expectedResponses: ['Una mesa para dos', 'Para tres personas', 'Solo para mí'],
        followUpQuestions: ['¿Prefieren sentarse dentro o en la terraza?']
      },
      {
        id: 'ordering',
        text: '¿Ya saben qué van a pedir?',
        difficulty: 4,
        expectedResponses: ['Quiero el pollo', 'Me gustaría la paella', '¿Qué me recomienda?'],
        followUpQuestions: ['¿Y para beber?', '¿Algún postre?'],
        grammarTarget: 'polite_requests'
      }
    ],
    objectives: [
      { skill: 'ordering_food', description: 'Successfully order a meal' },
      { skill: 'polite_interaction', description: 'Use polite forms with service staff' }
    ]
  }
]
```

### **Conversation Flow Controller**
```typescript
class ConversationFlowController {
  constructor(
    private persona: ConversationPersona,
    private topic: ConversationTopic,
    private userLevel: number
  ) {}
  
  async generateNextResponse(
    userMessage: string,
    context: ConversationContext
  ): Promise<ConversationResponse> {
    // Analyze user message
    const messageAnalysis = await this.analyzeUserMessage(userMessage, context)
    
    // Determine conversation direction
    const flowDecision = this.determineFlow(messageAnalysis, context)
    
    // Generate persona-appropriate response
    const aiMessage = await this.generatePersonaResponse(userMessage, context, flowDecision)
    
    // Evaluate the turn
    const evaluation = await this.evaluateTurn(userMessage, messageAnalysis)
    
    // Generate helpful suggestions
    const suggestions = this.generateSuggestions(messageAnalysis, evaluation)
    
    return {
      turnId: generateId(),
      aiMessage,
      evaluation,
      suggestions,
      nextPrompts: this.generateNextPrompts(flowDecision),
      conversationStatus: this.determineConversationStatus(context, flowDecision)
    }
  }
  
  private determineFlow(
    analysis: MessageAnalysis,
    context: ConversationContext
  ): FlowDecision {
    const currentObjective = this.getCurrentObjective(context)
    const topicRelevance = this.assessTopicRelevance(analysis, this.topic)
    
    if (topicRelevance < 0.3) {
      return {
        type: 'redirect_to_topic',
        action: 'gently_guide_back',
        reason: 'off_topic'
      }
    }
    
    if (analysis.grammarErrors.length > 2) {
      return {
        type: 'provide_help',
        action: 'offer_grammar_assistance',
        reason: 'multiple_errors'
      }
    }
    
    if (currentObjective && this.isObjectiveComplete(analysis, currentObjective)) {
      return {
        type: 'advance_conversation',
        action: 'move_to_next_prompt',
        reason: 'objective_achieved'
      }
    }
    
    return {
      type: 'continue_naturally',
      action: 'respond_to_content',
      reason: 'normal_flow'
    }
  }
}
```

---

## 📊 **Turn-by-Turn Evaluation**

### **Real-Time Assessment Engine**
```typescript
interface TurnEvaluation {
  communicationSuccess: number    // 0-1 (message understood?)
  grammarAccuracy: number        // 0-1 (correct grammar?)
  vocabularyUsage: number        // 0-1 (appropriate word choice?)
  conversationFlow: number       // 0-1 (natural response?)
  culturalAwareness: number      // 0-1 (culturally appropriate?)
  overallScore: number           // 0-10 composite score
  errors: ConversationError[]
  achievements: string[]         // What they did well
  improvements: string[]         // Specific suggestions
}

class TurnEvaluator {
  async evaluateTurn(
    userMessage: string,
    context: ConversationContext,
    expectedResponse?: ConversationPrompt
  ): Promise<TurnEvaluation> {
    // Use AI for comprehensive evaluation
    const aiEvaluation = await this.getAIEvaluation(userMessage, context, expectedResponse)
    
    // Apply business rules and adjustments
    const adjustedEvaluation = this.applyConversationRules(aiEvaluation, context)
    
    // Generate constructive feedback
    const feedback = this.generateFeedback(adjustedEvaluation, userMessage)
    
    return {
      ...adjustedEvaluation,
      ...feedback
    }
  }
  
  private async getAIEvaluation(
    userMessage: string,
    context: ConversationContext,
    expectedResponse?: ConversationPrompt
  ): Promise<any> {
    const prompt = `
Evaluate this Spanish conversation turn:

CONTEXT:
- Topic: ${context.topic}
- User Level: ${context.userLevel}/9
- Turn #: ${context.currentTurn}
- Expected response type: ${expectedResponse?.grammarTarget || 'general'}

USER MESSAGE: "${userMessage}"

PREVIOUS CONTEXT: ${context.recentMessages.slice(-2).join(' → ')}

Evaluate on:
1. Communication success (0-1): Did the message convey the intended meaning?
2. Grammar accuracy (0-1): Correct verb conjugations, gender agreement, etc.
3. Vocabulary usage (0-1): Appropriate word choice for context and level
4. Conversation flow (0-1): Natural response to the conversation context
5. Cultural awareness (0-1): Culturally appropriate for Spanish-speaking context

Return JSON:
{
  "communicationSuccess": 0.85,
  "grammarAccuracy": 0.75,
  "vocabularyUsage": 0.90,
  "conversationFlow": 0.80,
  "culturalAwareness": 0.85,
  "errors": [
    {
      "type": "grammar",
      "description": "Verb conjugation error",
      "severity": "minor",
      "suggestion": "Use 'tengo' instead of 'tener'"
    }
  ],
  "strengths": ["Good vocabulary choice", "Natural conversational response"]
}`
    
    return await this.aiService.evaluateConversationTurn(prompt)
  }
  
  private applyConversationRules(evaluation: any, context: ConversationContext): TurnEvaluation {
    let adjustedScore = this.calculateCompositeScore(evaluation)
    
    // Bonus for staying on topic
    if (evaluation.conversationFlow > 0.8) {
      adjustedScore += 0.5
    }
    
    // Penalty for off-topic responses
    if (evaluation.conversationFlow < 0.3) {
      adjustedScore -= 1.0
    }
    
    // Level-appropriate adjustments
    if (context.userLevel <= 3) {
      // More lenient for beginners
      adjustedScore = Math.min(10, adjustedScore + 0.5)
    }
    
    return {
      ...evaluation,
      overallScore: Math.max(0, Math.min(10, adjustedScore))
    }
  }
}
```

---

## 🎮 **React Components Integration**

### **Conversation Interface Component**
```typescript
interface ConversationInterfaceProps {
  userId: string
  topicId: string
  personaId: string
  difficultyLevel: number
}

export function ConversationInterface({ 
  userId, 
  topicId, 
  personaId, 
  difficultyLevel 
}: ConversationInterfaceProps) {
  const [session, setSession] = useState<ConversationSession | null>(null)
  const [messages, setMessages] = useState<ConversationMessage[]>([])
  const [currentMessage, setCurrentMessage] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const [showEvaluation, setShowEvaluation] = useState(false)
  const [lastEvaluation, setLastEvaluation] = useState<TurnEvaluation | null>(null)
  
  const startConversation = async () => {
    try {
      const newSession = await conversationService.startConversation({
        userId,
        topicId,
        personaId,
        difficultyLevel,
        conversationType: 'guided'
      })
      
      setSession(newSession)
      setMessages([{
        id: 'intro',
        sender: 'ai',
        content: newSession.persona.greeting,
        timestamp: new Date(),
        evaluation: null
      }])
    } catch (error) {
      console.error('Failed to start conversation:', error)
    }
  }
  
  const sendMessage = async () => {
    if (!currentMessage.trim() || !session) return
    
    const userMessage: ConversationMessage = {
      id: generateId(),
      sender: 'user',
      content: currentMessage,
      timestamp: new Date(),
      evaluation: null
    }
    
    setMessages(prev => [...prev, userMessage])
    setCurrentMessage('')
    setIsTyping(true)
    
    try {
      const response = await conversationService.sendMessage(session.sessionId, currentMessage)
      
      const aiMessage: ConversationMessage = {
        id: response.turnId,
        sender: 'ai',
        content: response.aiMessage,
        timestamp: new Date(),
        evaluation: response.evaluation
      }
      
      setMessages(prev => [...prev, aiMessage])
      setLastEvaluation(response.evaluation)
      setShowEvaluation(true)
    } catch (error) {
      console.error('Failed to send message:', error)
    } finally {
      setIsTyping(false)
    }
  }
  
  return (
    <div className="conversation-interface h-full flex flex-col">
      {/* Header */}
      <div className="conversation-header p-4 bg-gray-800 border-b border-gray-700">
        {session && (
          <div className="flex items-center space-x-3">
            <span className="text-2xl">{session.persona.avatar}</span>
            <div>
              <h3 className="font-semibold text-white">{session.persona.name}</h3>
              <p className="text-sm text-gray-400">{session.persona.role}</p>
            </div>
            <div className="ml-auto">
              <span className="text-sm text-gray-400">
                Difficulty: {difficultyLevel}/9
              </span>
            </div>
          </div>
        )}
      </div>
      
      {/* Messages */}
      <div className="conversation-messages flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map(message => (
          <ConversationMessage 
            key={message.id} 
            message={message}
            showEvaluation={message.sender === 'user' && message.evaluation}
          />
        ))}
        {isTyping && <TypingIndicator />}
      </div>
      
      {/* Input */}
      <div className="conversation-input p-4 bg-gray-800 border-t border-gray-700">
        <div className="flex space-x-3">
          <input
            type="text"
            value={currentMessage}
            onChange={(e) => setCurrentMessage(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
            placeholder="Escribe tu respuesta en español..."
            className="flex-1 px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white"
            disabled={isTyping}
          />
          <Button onClick={sendMessage} disabled={!currentMessage.trim() || isTyping}>
            Enviar
          </Button>
        </div>
      </div>
      
      {/* Evaluation Modal */}
      {showEvaluation && lastEvaluation && (
        <TurnEvaluationModal 
          evaluation={lastEvaluation}
          onClose={() => setShowEvaluation(false)}
        />
      )}
    </div>
  )
}
```

### **Turn Evaluation Modal**
```typescript
interface TurnEvaluationModalProps {
  evaluation: TurnEvaluation
  onClose: () => void
}

export function TurnEvaluationModal({ evaluation, onClose }: TurnEvaluationModalProps) {
  return (
    <Modal isOpen={true} onClose={onClose} title="Turn Evaluation">
      <div className="space-y-4">
        {/* Overall Score */}
        <div className="text-center">
          <ScoreDisplay score={evaluation.overallScore} size="lg" />
        </div>
        
        {/* Detailed Scores */}
        <div className="grid grid-cols-2 gap-4">
          <ScoreBar label="Communication" value={evaluation.communicationSuccess} />
          <ScoreBar label="Grammar" value={evaluation.grammarAccuracy} />
          <ScoreBar label="Vocabulary" value={evaluation.vocabularyUsage} />
          <ScoreBar label="Flow" value={evaluation.conversationFlow} />
        </div>
        
        {/* Feedback */}
        {evaluation.achievements.length > 0 && (
          <div className="achievements">
            <h4 className="font-semibold text-green-400 mb-2">✨ Great job!</h4>
            <ul className="list-disc list-inside text-sm text-gray-300">
              {evaluation.achievements.map((achievement, index) => (
                <li key={index}>{achievement}</li>
              ))}
            </ul>
          </div>
        )}
        
        {evaluation.improvements.length > 0 && (
          <div className="improvements">
            <h4 className="font-semibold text-yellow-400 mb-2">💡 Try this:</h4>
            <ul className="list-disc list-inside text-sm text-gray-300">
              {evaluation.improvements.map((improvement, index) => (
                <li key={index}>{improvement}</li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </Modal>
  )
}
```

---

This Conversation Suite provides a comprehensive AI-powered chat system that enables natural Spanish practice with intelligent personas, real-time evaluation, and adaptive conversation management.