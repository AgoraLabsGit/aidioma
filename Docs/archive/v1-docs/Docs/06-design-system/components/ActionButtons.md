# Action Buttons Component
## Primary/Secondary Action Buttons

### **Overview**
The ActionButtons component provides consistent action button layouts for learning activities. It adapts based on evaluation state and includes proper disabled states for user flow control.

### **Implementation**
```tsx
interface ActionButtonsProps {
  isEvaluated: boolean
  userTranslation: string
  onSubmit: () => void
  onSkip: () => void
  onNext: () => void
  currentSentence: number
  totalSentences: number
}

function ActionButtons({ 
  isEvaluated, 
  userTranslation, 
  onSubmit, 
  onSkip, 
  onNext, 
  currentSentence, 
  totalSentences 
}: ActionButtonsProps) {
  if (isEvaluated) {
    return (
      <div className="flex justify-center gap-4 mb-8">
        <button
          onClick={onSkip}
          className="btn-secondary px-6 py-3 rounded-lg font-medium transition-all duration-200"
        >
          Skip
        </button>
        <button
          onClick={onNext}
          disabled={currentSentence >= totalSentences}
          className="btn-primary px-8 py-3 rounded-lg font-medium transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Next
        </button>
      </div>
    )
  }

  return (
    <div className="flex items-center justify-center gap-4 mb-8">
      <button
        onClick={onSubmit}
        disabled={!userTranslation.trim()}
        className="btn-primary px-8 py-3 rounded-lg font-medium transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        Check Translation
      </button>
      <button
        onClick={onSkip}
        className="btn-secondary px-6 py-3 rounded-lg font-medium transition-all duration-200"
      >
        Skip
      </button>
    </div>
  )
}
```

### **Props Interface**
```tsx
interface ActionButtonsProps {
  isEvaluated: boolean        // Whether current item is evaluated
  userTranslation: string     // Current user input for validation
  onSubmit: () => void        // Submit/check action handler
  onSkip: () => void          // Skip action handler  
  onNext: () => void          // Next item handler
  currentSentence: number     // Current position for end detection
  totalSentences: number      // Total items for end detection
}
```

### **Key Features**
- **State-Based Rendering**: Different layouts for pre/post evaluation
- **Smart Disabling**: Context-aware button disable logic
- **Consistent Spacing**: Standardized button sizes and gaps
- **Visual Hierarchy**: Primary action stands out from secondary
- **Smooth Transitions**: All state changes animate smoothly

### **Button States**

#### **Pre-Evaluation State**
When `isEvaluated` is `false`:
```tsx
[Check Translation] [Skip]
```
- **Check Translation**: Primary button, disabled if input empty
- **Skip**: Secondary button, always enabled

#### **Post-Evaluation State**  
When `isEvaluated` is `true`:
```tsx
[Skip] [Next]
```
- **Skip**: Secondary button, always enabled
- **Next**: Primary button, disabled at end of session

### **Button Styling**

#### **Primary Button (`btn-primary`)**
```css
px-8 py-3 rounded-lg font-medium transition-all duration-200
```
- Wider padding (`px-8`) for prominence
- Primary background color
- Higher visual weight

#### **Secondary Button (`btn-secondary`)**
```css
px-6 py-3 rounded-lg font-medium transition-all duration-200
```
- Standard padding (`px-6`)
- Secondary background color
- Subtle appearance

#### **Disabled State**
```css
disabled:opacity-50 disabled:cursor-not-allowed
```
- 50% opacity for visual feedback
- Cursor indicates non-interactive state

### **Layout Patterns**

#### **Container Styles**
```css
flex justify-center gap-4 mb-8
```
- Centered button group
- 16px gap between buttons
- 32px bottom margin for spacing

#### **Responsive Behavior**
- **All Screens**: Centered layout maintains consistency
- **Mobile**: Touch-friendly button sizes (py-3)
- **Desktop**: Optimized for mouse interaction

### **Usage Examples**

#### **Practice Page**
```tsx
<ActionButtons 
  isEvaluated={isEvaluated}
  userTranslation={userTranslation}
  onSubmit={handleSubmit}
  onSkip={handleSkip}
  onNext={handleNext}
  currentSentence={sessionStats.currentSentence}
  totalSentences={sessionStats.totalSentences}
/>
```

#### **Reading Page**
```tsx
<ActionButtons 
  isEvaluated={sentenceEvaluated}
  userTranslation={sentenceInput}
  onSubmit={evaluateSentence}
  onSkip={skipSentence}
  onNext={nextSentence}
  currentSentence={currentParagraph}
  totalSentences={totalParagraphs}
/>
```

### **Disable Logic**

#### **Check Translation Button**
```tsx
disabled={!userTranslation.trim()}
```
- Disabled when input is empty or only whitespace
- Prevents accidental empty submissions

#### **Next Button**
```tsx
disabled={currentSentence >= totalSentences}
```
- Disabled when reaching end of session
- Prevents navigation beyond available content

### **Accessibility Features**
- **Semantic Buttons**: Uses proper `<button>` elements
- **Disabled States**: Proper ARIA handling of disabled buttons
- **Keyboard Navigation**: Tab order flows naturally
- **Visual Feedback**: Clear disabled state indication
- **Focus Management**: Maintains focus on primary action

### **User Flow Integration**

#### **Typical Interaction Flow**
1. User enters translation
2. "Check Translation" becomes enabled
3. User clicks to evaluate
4. Buttons switch to "Skip"/"Next" layout
5. User proceeds to next item

#### **Skip Flow**
1. User can skip at any time (pre or post evaluation)
2. Skip always available as secondary action
3. Maintains user agency in learning process

### **Customization Options**

#### **Different Action Labels**
```tsx
// For reading
"Check Sentence" / "Next Paragraph"

// For conversation  
"Send Message" / "Continue Chat"

// For memorization
"Check Answer" / "Next Card"
```

#### **Different Disable Logic**
Components can be adapted for different validation needs:
```tsx
// Conversation: disable if message too short
disabled={message.length < 3}

// Memorization: disable if no selection made
disabled={!selectedAnswer}
```

### **Performance Considerations**
- **Conditional Rendering**: Efficient state-based rendering
- **Event Handlers**: Passed as props for parent control
- **No Side Effects**: Pure component with external state management

### **Implementation Checklist**
- [ ] Implements state-based button layout switching
- [ ] Proper disable logic for both buttons
- [ ] Consistent button styling (`btn-primary`/`btn-secondary`)
- [ ] Smooth transitions on all state changes
- [ ] Centered layout with proper spacing
- [ ] Accessibility-compliant disabled states
- [ ] Touch-friendly sizing for mobile

### **Dependencies**
- React for component logic
- Tailwind CSS classes (`btn-primary`, `btn-secondary`)
- Parent component for state management
