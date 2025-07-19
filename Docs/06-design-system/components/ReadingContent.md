# Reading Content Component
## Contextual Translation Practice Interface

### **Overview**
The ReadingContent component provides a comprehensive reading and translation practice interface that combines contextual reading with sentence-by-sentence translation practice. It displays articles, books, or stories with visual scrolling context while allowing users to practice translating individual sentences.

### **Implementation**
```tsx
interface ReadingContentProps {
  title: string
  content: string[]
  currentParagraph: number
  onParagraphChange: (index: number) => void
  userTranslation: string
  onTranslationChange: (value: string) => void
  onCheckAnswer: () => void
  onNextSentence: () => void
  onShowHint: () => void
  onReset: () => void
  isEvaluated: boolean
  showHint: boolean
  evaluation: {score: number, feedback: string} | null
}

function ReadingContent({ 
  title, 
  content, 
  currentParagraph, 
  onParagraphChange,
  userTranslation,
  onTranslationChange,
  onCheckAnswer,
  onNextSentence,
  onShowHint,
  onReset,
  isEvaluated,
  showHint,
  evaluation
}: ReadingContentProps) {
  return (
    <div className="space-y-6">
      {/* Article Header */}
      <div className="border-b border-border pb-4">
        <h2 className="text-2xl md:text-3xl font-semibold text-foreground mb-2">
          {title}
        </h2>
        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <span>Reading Level: Intermediate</span>
          <span>•</span>
          <span>Estimated: 8 minutes</span>
          <span>•</span>
          <span>Genre: Culture</span>
          <span>•</span>
          <span>Sentence {currentParagraph + 1} of {content.length}</span>
        </div>
      </div>

      {/* Context View - Scrolling Effect */}
      <div className="space-y-2">
        <h3 className="text-lg font-medium text-foreground mb-4">Article Context</h3>
        
        {/* Previous sentence (context) */}
        {currentParagraph > 0 && (
          <div className="space-y-2 opacity-50">
            <div
              className="p-3 rounded-lg border border-border/50 bg-muted/30 cursor-pointer hover:bg-muted/50 transition-colors"
              onClick={() => onParagraphChange(currentParagraph - 1)}
            >
              <p className="text-sm text-muted-foreground leading-relaxed">
                {content[currentParagraph - 1]}
              </p>
            </div>
          </div>
        )}

        {/* Current sentence (highlighted) */}
        <div className="p-4 rounded-lg border-2 border-primary bg-primary/5">
          <p className="text-lg md:text-xl leading-relaxed text-foreground font-medium">
            {content[currentParagraph]}
          </p>
          {showHint && (
            <div className="mt-3 p-3 bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 rounded-lg">
              <p className="text-sm text-blue-700 dark:text-blue-300">
                💡 <strong>Hint:</strong> Pay attention to verb tenses and article agreement. Consider the context from previous sentences.
              </p>
            </div>
          )}
        </div>

        {/* Next sentence (context) */}
        {currentParagraph < content.length - 1 && (
          <div className="space-y-2 opacity-50">
            <div
              className="p-3 rounded-lg border border-border/50 bg-muted/30 cursor-pointer hover:bg-muted/50 transition-colors"
              onClick={() => onParagraphChange(currentParagraph + 1)}
            >
              <p className="text-sm text-muted-foreground leading-relaxed">
                {content[currentParagraph + 1]}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Translation Practice Section */}
      <div className="border-t border-border pt-6">
        <h3 className="text-lg font-medium text-foreground mb-4">Translate to English</h3>
        
        {/* Translation Input */}
        <TranslationInput
          value={userTranslation}
          onChange={onTranslationChange}
          disabled={isEvaluated}
          placeholder="Type your English translation of the highlighted sentence..."
        />

        {/* Evaluation Results */}
        {isEvaluated && evaluation && (
          <div className="mb-6 p-4 bg-muted rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <div className={`w-3 h-3 rounded-full ${
                evaluation.score >= 80 ? 'bg-green-500' : 
                evaluation.score >= 60 ? 'bg-yellow-500' : 'bg-red-500'
              }`} />
              <span className="font-medium text-foreground">
                Score: {evaluation.score}% 
                {evaluation.score >= 80 ? ' - Excellent!' : 
                 evaluation.score >= 60 ? ' - Good job!' : ' - Keep practicing!'}
              </span>
            </div>
            <p className="text-sm text-muted-foreground">{evaluation.feedback}</p>
          </div>
        )}

        {/* Action Buttons */}
        <ActionButtons
          onCheck={onCheckAnswer}
          onNext={onNextSentence}
          onHint={onShowHint}
          onReset={onReset}
          isEvaluated={isEvaluated}
          showHint={showHint}
          disabled={!userTranslation.trim()}
        />
      </div>

      {/* Reading Progress */}
      <div className="p-4 bg-muted rounded-lg border-t border-border">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-foreground">Reading Progress</span>
          <span className="text-sm text-muted-foreground">
            {currentParagraph + 1} of {content.length} sentences
          </span>
        </div>
        <div className="w-full bg-background rounded-full h-2">
          <div
            className="bg-primary h-2 rounded-full transition-all duration-300"
            style={{ width: `${((currentParagraph + 1) / content.length) * 100}%` }}
          />
        </div>
      </div>
    </div>
  )
}
```

### **Key Features**

#### **1. Visual Context Scrolling**
- **Previous Context**: Shows 1 sentence before current sentence with reduced opacity
- **Current Sentence**: Highlighted with primary border and background
- **Next Context**: Shows 1 sentence after current sentence with reduced opacity
- **Scrolling Effect**: When user hits "Next", everything shifts up by one sentence
- **Navigation**: Click any context sentence to jump to it

#### **2. Translation Practice Integration**
- **TranslationInput Component**: Same monospace textarea as PracticePage
- **AI Evaluation**: Score and feedback display with color-coded results
- **Hint System**: Contextual hints that consider surrounding sentences
- **Action Buttons**: Check Answer, Next Sentence, Show Hint, Try Again

#### **3. Progress Tracking**
- **Visual Progress Bar**: Shows completion through article
- **Sentence Counter**: Current position and total sentences
- **Article Metadata**: Level, estimated time, genre information

### **Responsive Design**
- **Mobile Optimized**: Touch-friendly context navigation
- **Typography Scaling**: Responsive text sizes for readability
- **Button Layout**: Flexible button wrapping on small screens

### **User Experience Flow**
1. **Read Context**: User sees one previous and one next sentence for context
2. **Focus Current**: Current sentence highlighted and ready for translation
3. **Translate**: User types English translation in input field
4. **Evaluate**: AI provides score and feedback
5. **Next Scroll**: User hits "Next" button - current becomes previous, next becomes current
6. **Navigate**: Jump to any sentence by clicking context paragraphs

### **Integration Points**
- **Reading Filters**: Content filtering by level, genre, length
- **Progress Tracking**: Integration with user analytics
- **Hint System**: Word-level hints with penalty scoring
- **Evaluation API**: AI-powered translation assessment

### **Props Interface**

#### **Required Props**
- `title: string` - Article/book title
- `content: string[]` - Array of sentences to practice
- `currentParagraph: number` - Current sentence index
- `onParagraphChange: (index: number) => void` - Navigate to sentence

#### **Translation Practice Props**
- `userTranslation: string` - User's translation input
- `onTranslationChange: (value: string) => void` - Update translation
- `onCheckAnswer: () => void` - Submit for evaluation
- `onNextSentence: () => void` - Move to next sentence
- `onShowHint: () => void` - Toggle hint display
- `onReset: () => void` - Clear and retry current sentence

#### **State Props**
- `isEvaluated: boolean` - Whether current translation is evaluated
- `showHint: boolean` - Whether hint is currently displayed
- `evaluation: {score: number, feedback: string} | null` - Evaluation results

### **Accessibility**
- **Keyboard Navigation**: Tab through interactive elements
- **Screen Reader Support**: Proper ARIA labels and semantic HTML
- **Focus Management**: Clear focus indicators
- **Color Contrast**: High contrast for evaluation results

### **Performance Considerations**
- **Efficient Scrolling**: Only renders visible context sentences
- **Memoization**: Optimized re-renders for large articles
- **Progressive Loading**: Can handle long-form content efficiently

### **Future Enhancements**
- **Word-Level Hints**: Click individual words for translations
- **Audio Playback**: Text-to-speech for Spanish sentences
- **Vocabulary Bookmarking**: Save difficult words to flash cards
- **Reading Analytics**: Track reading speed and comprehension
