# Session Stats Component
## Progress Tracking Display

### **Overview**
The SessionStats component displays progress information for learning activities. It shows current item position, progress bar, and success/error counts in a responsive layout.

### **Implementation**
```tsx
interface SessionStatsProps {
  currentSentence: number
  totalSentences: number
  correctCount: number
  incorrectCount: number
}

function SessionStats({ currentSentence, totalSentences, correctCount, incorrectCount }: SessionStatsProps) {
  return (
    <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-6 gap-4 md:gap-0">
      <div className="flex items-center gap-3">
        <span className="text-sm text-muted-foreground">
          Sentence <span className="text-blue-400 font-medium">{currentSentence}</span> of <span className="text-blue-400 font-medium">{totalSentences}</span>
        </span>
        <div className="w-16 h-2 bg-muted rounded-full">
          <div 
            className="h-2 bg-blue-500 rounded-full transition-all duration-300"
            style={{ width: `${(currentSentence / totalSentences) * 100}%` }}
          />
        </div>
      </div>
      
      <div className="text-sm text-muted-foreground">
        <span className="text-green-400 font-medium">{correctCount} correct</span> • <span className="text-red-400 font-medium">{incorrectCount} incorrect</span>
      </div>
    </div>
  )
}
```

### **Props Interface**
```tsx
interface SessionStatsProps {
  currentSentence: number    // Current item position (1-based)
  totalSentences: number     // Total items in session
  correctCount: number       // Number of correct answers
  incorrectCount: number     // Number of incorrect answers
}
```

### **Key Features**
- **Responsive Layout**: Stacked on mobile, side-by-side on desktop
- **Progress Bar**: Visual representation of completion percentage
- **Color-Coded Stats**: Green for correct, red for incorrect
- **Smooth Animations**: Progress bar transitions smoothly
- **Flexible Labels**: Can be adapted for different content types

### **Visual Elements**

#### **Progress Section (Left)**
- Current position indicator with blue highlighting
- Mini progress bar (w-16 h-2) with blue fill
- Smooth transitions on progress changes

#### **Stats Section (Right)**
- Success count in green (`text-green-400`)
- Error count in red (`text-red-400`)
- Bullet separator between counts

### **Responsive Behavior**
```css
/* Mobile (default) */
flex flex-col items-start gap-4

/* Desktop (md:+) */
md:flex-row md:items-center md:gap-0
```

### **Color Usage**
- **Progress Numbers**: `text-blue-400` for current/total
- **Progress Bar**: `bg-blue-500` for fill, `bg-muted` for track
- **Success Count**: `text-green-400`
- **Error Count**: `text-red-400`
- **Labels**: `text-muted-foreground`

### **Usage Examples**

#### **Practice Page**
```tsx
<SessionStats 
  currentSentence={1}
  totalSentences={10}
  correctCount={8}
  incorrectCount={2}
/>
```

#### **Reading Page**
```tsx
<SessionStats 
  currentSentence={currentParagraph}
  totalSentences={totalParagraphs}
  correctCount={readingProgress.correct}
  incorrectCount={readingProgress.incorrect}
/>
```

#### **Memorize Page**
```tsx
<SessionStats 
  currentSentence={currentCard}
  totalSentences={totalCards}
  correctCount={memoryStats.correct}
  incorrectCount={memoryStats.incorrect}
/>
```

### **Customization Options**

#### **Different Content Types**
The labels can be customized for different contexts:
```tsx
// For reading
"Paragraph {currentSentence} of {totalSentences}"

// For memorization  
"Card {currentSentence} of {totalSentences}"

// For conversations
"Turn {currentSentence} of {totalSentences}"
```

### **Animation Details**
```css
transition-all duration-300
```
- Progress bar fills smoothly when `currentSentence` changes
- 300ms duration for comfortable visual feedback
- Uses CSS transitions for performance

### **Layout Integration**
- Positioned at the top of main content area
- Uses `mb-6` for consistent spacing below
- Full width with internal responsive layout
- Sits above filter/content components

### **Accessibility**
- Descriptive text for screen readers
- Color information supplemented with text labels
- Proper semantic structure
- High contrast colors for visibility

### **Implementation Checklist**
- [ ] Uses exact responsive classes (`flex flex-col md:flex-row`)
- [ ] Implements smooth progress bar animation
- [ ] Color-codes success/error counts correctly
- [ ] Maintains consistent spacing (`mb-6`, `gap-4 md:gap-0`)
- [ ] Progress bar calculates percentage correctly
- [ ] Works with 1-based indexing for current position

### **Dependencies**
- React for state management
- Tailwind CSS for styling
- No external libraries required
