# Translation Input Component
## Translation Text Input Field

### **Overview**
The TranslationInput component provides a consistent text input interface for translation practice. It uses a monospace font for clear character distinction and includes proper disabled states.

### **Implementation**
```tsx
interface TranslationInputProps {
  value: string
  onChange: (value: string) => void
  disabled?: boolean
  placeholder?: string
}

function TranslationInput({ 
  value, 
  onChange, 
  disabled = false, 
  placeholder = "Type your Spanish translation here..." 
}: TranslationInputProps) {
  return (
    <div className="mb-6">
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        disabled={disabled}
        className="w-full h-20 px-4 py-3 bg-input border border-border rounded-lg text-foreground placeholder:text-muted-foreground resize-none focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 focus:ring-offset-background transition-all duration-200 font-mono"
      />
    </div>
  )
}
```

### **Props Interface**
```tsx
interface TranslationInputProps {
  value: string                    // Current input value
  onChange: (value: string) => void // Value change handler
  disabled?: boolean               // Disabled state (optional)
  placeholder?: string             // Placeholder text (optional)
}
```

### **Key Features**
- **Monospace Font**: `font-mono` for clear character distinction
- **Fixed Height**: `h-20` (80px) for consistent layout
- **Disabled State**: Visual feedback when input is locked
- **Focus Ring**: Accessible focus indication
- **No Resize**: `resize-none` prevents layout disruption
- **Smooth Transitions**: 200ms transition for all state changes

### **Styling Details**

#### **Base Styles**
```css
w-full h-20 px-4 py-3 bg-input border border-border rounded-lg
```

#### **Typography**
```css
text-foreground placeholder:text-muted-foreground font-mono
```

#### **Focus State**
```css
focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 focus:ring-offset-background
```

#### **Transitions**
```css
transition-all duration-200
```

### **Usage Examples**

#### **Practice Page**
```tsx
<TranslationInput 
  value={userTranslation}
  onChange={setUserTranslation}
  disabled={isEvaluated}
  placeholder="Type your Spanish translation here..."
/>
```

#### **Reading Page**
```tsx
<TranslationInput 
  value={sentenceTranslation}
  onChange={setSentenceTranslation}
  disabled={isProcessing}
  placeholder="Translate this sentence to Spanish..."
/>
```

#### **Conversation Page**
```tsx
<TranslationInput 
  value={chatMessage}
  onChange={setChatMessage}
  disabled={false}
  placeholder="Type your response in Spanish..."
/>
```

### **State Management**

#### **Controlled Component**
The component is fully controlled and requires:
- `value` prop for current state
- `onChange` callback for state updates
- Parent component manages all state

#### **Example State Integration**
```tsx
const [userInput, setUserInput] = useState('')
const [isDisabled, setIsDisabled] = useState(false)

<TranslationInput 
  value={userInput}
  onChange={setUserInput}
  disabled={isDisabled}
/>
```

### **Accessibility Features**
- **Semantic HTML**: Uses `<textarea>` element
- **Focus Management**: Proper focus ring indication
- **Screen Reader**: Placeholder text provides context
- **Keyboard Navigation**: Standard textarea shortcuts work
- **Color Contrast**: Meets WCAG AA standards

### **Visual States**

#### **Default State**
- Light border with dark background
- Placeholder text in muted color
- Normal text color for input

#### **Focus State**
- Blue focus ring with offset
- Maintains border and background
- Enhanced visual feedback

#### **Disabled State**
- Reduced opacity (handled by browser)
- Cursor changes to not-allowed
- Input becomes non-interactive

### **Layout Integration**
```tsx
{/* Content Display */}
<div className="mb-8 text-left">
  <h2 className="text-3xl font-light text-foreground leading-relaxed mb-4">
    {sentence.english}
  </h2>
</div>

{/* Translation Input */}
<TranslationInput 
  value={userTranslation}
  onChange={setUserTranslation}
  disabled={isEvaluated}
/>

{/* Action Buttons */}
<ActionButtons />
```

### **Responsive Behavior**
- **All Screens**: Maintains full width (`w-full`)
- **Mobile**: Touch-friendly with proper sizing
- **Desktop**: Keyboard-optimized experience
- **Consistent Height**: `h-20` prevents layout shifts

### **Typography Considerations**
- **Font**: Monospace (`font-mono`) for language learning
- **Character Spacing**: Consistent spacing aids typing accuracy
- **Readability**: High contrast for extended typing sessions

### **Performance Notes**
- **Controlled Input**: Efficient re-rendering
- **No External Dependencies**: Pure React implementation
- **Smooth Transitions**: Hardware-accelerated CSS transitions

### **Implementation Checklist**
- [ ] Uses monospace font (`font-mono`)
- [ ] Fixed height (`h-20`) for layout consistency
- [ ] Proper focus ring implementation
- [ ] Disabled state handling
- [ ] Placeholder text provided
- [ ] Smooth transitions on state changes
- [ ] No resize capability (`resize-none`)
- [ ] Full width responsive design

### **Dependencies**
- React for component logic
- Tailwind CSS for styling
- No external libraries required
