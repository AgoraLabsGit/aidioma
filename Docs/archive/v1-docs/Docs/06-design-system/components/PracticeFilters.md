# Practice Filters Component
## Collapsible Filter Controls

### **Overview**
The PracticeFilters component provides a collapsible interface for filtering learning content. It includes dropdown controls for difficulty, tense, and topic selection with smooth expand/collapse animations.

### **Implementation**
```tsx
interface PracticeFiltersProps {
  isOpen: boolean
  onToggle: () => void
}

function PracticeFilters({ isOpen, onToggle }: PracticeFiltersProps) {
  return (
    <div className="w-full">
      <button
        onClick={onToggle}
        className="flex items-center gap-2 px-4 py-2 card text-muted-foreground hover:text-foreground transition-colors w-full"
      >
        <Filter className="w-4 h-4" />
        <span className="text-sm">Practice Filters</span>
        <ChevronDown className={`w-4 h-4 ml-auto transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div 
          className="mt-2 p-4" 
          style={{
            background: 'var(--background-surface)',
            border: '1px solid var(--border-subtle)',
            borderRadius: 'var(--radius-lg)',
            boxShadow: 'var(--shadow-subtle)'
          }}
        >
          <div className="space-y-3">
            <div>
              <label className="text-sm text-foreground mb-2 block">Difficulty</label>
              <select className="w-full px-3 py-2 bg-input border border-border rounded-lg text-sm text-foreground">
                <option>Beginner</option>
                <option>Intermediate</option>
                <option>Advanced</option>
              </select>
            </div>
            <div>
              <label className="text-sm text-foreground mb-2 block">Tense</label>
              <select className="w-full px-3 py-2 bg-input border border-border rounded-lg text-sm text-foreground">
                <option>Present Tense</option>
                <option>Past Tense</option>
                <option>Future Tense</option>
              </select>
            </div>
            <div>
              <label className="text-sm text-foreground mb-2 block">Topic</label>
              <select className="w-full px-3 py-2 bg-input border border-border rounded-lg text-sm text-foreground">
                <option>Daily Life</option>
                <option>Food & Drink</option>
                <option>Travel</option>
                <option>Work</option>
              </select>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
```

### **Props Interface**
```tsx
interface PracticeFiltersProps {
  isOpen: boolean      // Controls expanded/collapsed state
  onToggle: () => void // Handler for expand/collapse action
}
```

### **Key Features**
- **Collapsible Design**: Saves screen space when not needed
- **Animated Chevron**: Rotates to indicate state
- **Consistent Styling**: Matches card design system
- **Three Filter Types**: Difficulty, Tense, and Topic
- **Full Width**: Adapts to container width
- **Smooth Transitions**: Animated state changes

### **Visual Components**

#### **Header Button**
```tsx
<button className="flex items-center gap-2 px-4 py-2 card text-muted-foreground hover:text-foreground transition-colors w-full">
```
- **Filter Icon**: 16x16px filter icon
- **Label Text**: "Practice Filters" in small text
- **Chevron Icon**: Rotates 180° when expanded
- **Hover State**: Text color brightens on hover

#### **Expanded Panel**
```tsx
<div className="mt-2 p-4" style={{...customStyles}}>
```
- **Custom Styling**: Uses CSS custom properties for theme
- **Consistent Spacing**: `space-y-3` between filter groups
- **Card Appearance**: Elevated with shadow and border

### **Filter Controls**

#### **Difficulty Filter**
Options: Beginner, Intermediate, Advanced
```tsx
<select className="w-full px-3 py-2 bg-input border border-border rounded-lg text-sm text-foreground">
  <option>Beginner</option>
  <option>Intermediate</option>
  <option>Advanced</option>
</select>
```

#### **Tense Filter**
Options: Present Tense, Past Tense, Future Tense
```tsx
<select className="w-full px-3 py-2 bg-input border border-border rounded-lg text-sm text-foreground">
  <option>Present Tense</option>
  <option>Past Tense</option>
  <option>Future Tense</option>
</select>
```

#### **Topic Filter**
Options: Daily Life, Food & Drink, Travel, Work
```tsx
<select className="w-full px-3 py-2 bg-input border border-border rounded-lg text-sm text-foreground">
  <option>Daily Life</option>
  <option>Food & Drink</option>
  <option>Travel</option>
  <option>Work</option>
</select>
```

### **Animation Details**

#### **Chevron Rotation**
```tsx
className={`w-4 h-4 ml-auto transition-transform ${isOpen ? 'rotate-180' : ''}`}
```
- Smooth rotation animation using CSS transforms
- 180-degree rotation when expanded
- `ml-auto` pushes chevron to right edge

#### **Color Transitions**
```tsx
className="text-muted-foreground hover:text-foreground transition-colors"
```
- Smooth color transition on hover
- Brightens from muted to full foreground color

### **Usage Examples**

#### **Practice Page**
```tsx
const [showFilters, setShowFilters] = useState(false)

<div className="mb-6 max-w-4xl mx-auto w-full">
  <PracticeFilters 
    isOpen={showFilters} 
    onToggle={() => setShowFilters(!showFilters)} 
  />
</div>
```

#### **Reading Page**
```tsx
const [filtersExpanded, setFiltersExpanded] = useState(false)

<PracticeFilters 
  isOpen={filtersExpanded}
  onToggle={() => setFiltersExpanded(prev => !prev)}
/>
```

### **Layout Integration**

#### **Container Requirements**
```tsx
<div className="mb-6 max-w-4xl mx-auto w-full">
  <PracticeFilters />
</div>
```
- **Width Alignment**: Must match content container width
- **Spacing**: `mb-6` provides consistent spacing below
- **Centering**: `mx-auto` centers within max-width constraint

#### **Position in Page**
- Positioned between SessionStats and main content
- Provides context before user engages with content
- Maintains consistent spacing with other components

### **Customization Options**

#### **Extended Filter Types**
Additional filters can be added:
```tsx
// Learning Mode
<option>Translation</option>
<option>Listening</option>
<option>Speaking</option>

// Time Limit
<option>No Limit</option>
<option>30 seconds</option>
<option>60 seconds</option>
```

#### **Different Page Adaptations**
```tsx
// Reading Page
<span className="text-sm">Reading Filters</span>

// Conversation Page  
<span className="text-sm">Chat Filters</span>

// Memorize Page
<span className="text-sm">Memory Filters</span>
```

### **State Management Integration**

#### **Filter State Structure**
```tsx
interface FilterState {
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced'
  tense: 'Present Tense' | 'Past Tense' | 'Future Tense'
  topic: 'Daily Life' | 'Food & Drink' | 'Travel' | 'Work'
}

const [filters, setFilters] = useState<FilterState>({
  difficulty: 'Beginner',
  tense: 'Present Tense', 
  topic: 'Daily Life'
})
```

### **Accessibility Features**
- **Semantic Labels**: Each select has descriptive label
- **Keyboard Navigation**: Standard select keyboard controls
- **Screen Reader**: Labels provide context for controls
- **Focus Management**: Proper tab order through controls
- **Color Contrast**: All text meets WCAG standards

### **Responsive Behavior**
- **All Screens**: Full width with adaptive spacing
- **Mobile**: Touch-friendly select controls
- **Desktop**: Mouse-optimized dropdown interactions
- **Consistent**: Same behavior across all screen sizes

### **Implementation Checklist**
- [ ] Uses collapsible design with state management
- [ ] Animated chevron rotation (180°)
- [ ] Three filter categories implemented
- [ ] Consistent select styling across all dropdowns
- [ ] Proper spacing with `space-y-3`
- [ ] Custom CSS properties for theming
- [ ] Full width responsive design
- [ ] Hover states on header button

### **Dependencies**
- React for state management
- Lucide React icons (Filter, ChevronDown)
- Tailwind CSS for base styling
- CSS custom properties for theme variables
