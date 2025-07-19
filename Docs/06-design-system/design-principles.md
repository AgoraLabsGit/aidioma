# UI Design Principles - AIdioma v2

## Core Philosophy

AIdioma v2 follows a **Strike-inspired minimal dark design philosophy** that prioritizes learning effectiveness over visual decoration.

---

## Design Principles

### 1. **Learning-First Design**
- **Minimize Cognitive Load**: Reduce visual distractions to maintain focus on language learning
- **Content Hierarchy**: Clear visual separation between instruction, practice, and feedback
- **Reading Optimization**: Typography and spacing optimized for language comprehension

### 2. **Ultra-Dark Minimalism**
- **Strike-Inspired Aesthetic**: Deep black backgrounds with subtle surface variations
- **Minimal Color Palette**: Reserve color only for functional states (success, error, warning)
- **Subtle Contrasts**: Use lightness variations in HSL rather than different hues

### 3. **Accessibility & Inclusivity**
- **High Contrast**: WCAG AAA compliance with 21:1 contrast ratios
- **Keyboard Navigation**: Full keyboard accessibility for all interactions
- **Screen Reader Support**: Semantic HTML and proper ARIA attributes
- **Touch-Friendly**: Mobile-first design with appropriate touch targets

### 4. **Consistency & Predictability**
- **Design System**: All components follow established patterns
- **Spacing System**: Consistent rhythm using mathematical spacing scale
- **Typography Scale**: Hierarchical text sizing for clear information architecture
- **Cross-Page Coherence**: Identical styling frameworks across all pages - UI changes must be applied to ALL relevant pages
- **Component Standardization**: ActionButtons, headers, navigation must be identical across ReadingPage and PracticePage

### 5. **Performance & Efficiency**
- **Fast Loading**: Minimal assets and optimized rendering
- **Smooth Interactions**: 60fps animations with hardware acceleration
- **Responsive Design**: Adaptive layouts for all device sizes
- **Explicit Color Classes**: Use `text-gray-400` instead of problematic `text-muted-foreground` classes

---

## Established UI Framework Principles

### **Button Design Standards**
- **Uniform Sizing**: All buttons use `px-6 py-3` for consistent touch targets
- **Color Hierarchy**: `text-gray-400` for secondary actions, `text-white` for primary actions only
- **Hover Feedback**: Consistent hover states (`hover:text-gray-300`, `hover:text-white`)
- **Icon Standards**: `w-4 h-4` for button icons, `gap-2` for icon-text spacing

### **ActionButtons Component Standards**
- **Fixed Order**: Previous, Check, Next, Hint, Skip, Bookmark (left to right)
- **Color Exception**: Only Next button uses white text, all others use gray
- **State Management**: Check/Try Again and Skip/Next Sentence buttons swap based on evaluation state
- **Cross-Page Identity**: Must be identical on ReadingPage and PracticePage

### **Layout Consistency Rules**
- **Fixed Positioning**: Header (`z-50`) and Sidebar (`z-40`) with proper clearance (`pt-16`, `ml-64`)
- **Content Width**: `max-w-4xl mx-auto w-full` for optimal reading experience
- **Responsive Patterns**: `hidden md:flex` for desktop sidebar, mobile-first approach

---

## Visual Hierarchy

### Information Priority
1. **Primary Content**: Spanish sentences and translations (highest contrast)
2. **Interactive Elements**: Buttons, inputs, navigation (medium contrast)
3. **Secondary Information**: Labels, metadata, hints (lower contrast)
4. **Decorative Elements**: Borders, dividers (minimal contrast)

### Color Usage Guidelines
- **Background**: Use lightness scale (8% → 9% → 15% → 25%)
- **Text**: Primary (95%), Secondary (85%), Muted (40%)
- **Functional Colors**: Green (success), Red (error), Amber (warning)
- **Interactive States**: Subtle hover effects, clear focus indicators

---

## Interaction Design

### Micro-Interactions
- **Feedback Timing**: Immediate response to user actions
- **Transition Speeds**: Fast (0.15s), Normal (0.2s), Slow (0.3s)
- **Loading States**: Clear progress indicators for async operations

### User Flow Optimization
- **Linear Progression**: Clear next steps in learning journey
- **Error Recovery**: Helpful error messages with suggested actions
- **Success Reinforcement**: Positive feedback for correct answers

---

## Content Strategy

### Typography Approach
- **Reading Comfort**: Light font weights for extended reading
- **Monospace Inputs**: Clear character distinction for language input
- **Responsive Sizing**: Larger text on desktop, touch-friendly on mobile

### Language Learning Considerations
- **Character Support**: Full Unicode support for accented characters
- **Input Methods**: Multiple keyboard layouts and input methods
- **Text Direction**: Support for LTR languages with future RTL consideration

---

## Technical Implementation

### CSS Architecture
- **CSS Variables**: All design tokens defined as custom properties
- **Utility Classes**: Tailwind CSS for rapid development
- **Component Isolation**: Scoped styles to prevent conflicts

### Responsive Strategy
- **Mobile-First**: Progressive enhancement from mobile to desktop
- **Breakpoints**: 768px major breakpoint for tablet/desktop layouts
- **Flexible Layouts**: CSS Grid and Flexbox for adaptive designs

---

## Design Evolution

### Current State (v2.0)
- Strike-inspired dark theme established
- HSL color system implemented
- Component library documented
- Accessibility standards met

### Future Considerations
- **Light Mode**: Alternative theme for different preferences
- **Customization**: User-selectable accent colors
- **Advanced Animations**: Enhanced micro-interactions
- **Internationalization**: Multi-language UI support

---

This design philosophy ensures AIdioma v2 provides an optimal learning environment while maintaining visual consistency and technical excellence.
