# Component Documentation
## AIdioma v2 React Components

This directory contains detailed documentation for all reusable React components in the AIdioma application.

## 📋 Component Categories

### **Layout Components**
- [`UnifiedHeader`](./UnifiedHeader.md) - Standard header across all pages
- [`Sidebar`](./Sidebar.md) - Navigation sidebar with user profile
- [`PageLayout`](./PageLayout.md) - Base layout template for all pages

### **Practice Components**
- [`SessionStats`](./SessionStats.md) - Progress tracking display
- [`TranslationInput`](./TranslationInput.md) - Translation text input field
- [`ActionButtons`](./ActionButtons.md) - Primary/secondary action buttons
- [`PracticeFilters`](./PracticeFilters.md) - Collapsible filter controls
- [`ReadingContent`](./ReadingContent.md) - Contextual reading and translation practice

### **UI Components**
- [`ErrorToast`](./ErrorToast.md) - Error notification component
- [`NavigationFooter`](./NavigationFooter.md) - Footer navigation (if needed)

### **Content Display**
- [`ContentDisplay`](./ContentDisplay.md) - Sentence/content display
- [`HintsSection`](./HintsSection.md) - Hints and guidance display

## 🎯 Usage Guidelines

### **Import Pattern**
```tsx
// Individual component imports
import { SessionStats } from '@/components/practice/SessionStats'
import { TranslationInput } from '@/components/ui/TranslationInput'

// Or barrel exports (recommended)
import { SessionStats, TranslationInput, ActionButtons } from '@/components'
```

### **Prop Conventions**
- All components use TypeScript interfaces
- Props follow camelCase naming
- Event handlers use `onAction` pattern
- Boolean props use `is/has/should` prefixes

### **Styling Standards**
- All components use Tailwind CSS classes
- Responsive design with `md:` breakpoints
- Dark theme compliance required
- No custom CSS - Tailwind only

## 📱 Responsive Design

All components must implement:
- **Mobile-first design** with base styles
- **Tablet adaptation** using `md:` prefix (768px+)
- **Desktop optimization** using `lg:` prefix when needed
- **Touch-friendly** interactive elements

## ♿ Accessibility

Components must include:
- Proper ARIA labels and roles
- Keyboard navigation support
- Screen reader compatibility
- Color contrast compliance (WCAG AA)
- Focus management

## 🔧 Development Notes

### **Component Structure**
```tsx
// Standard component template
interface ComponentProps {
  // Props definition
}

export function ComponentName({ prop1, prop2 }: ComponentProps) {
  return (
    <div className="responsive-classes">
      {/* Component content */}
    </div>
  )
}
```

### **Testing Requirements**
- Unit tests for all components
- Accessibility testing
- Responsive design verification
- Dark theme validation
