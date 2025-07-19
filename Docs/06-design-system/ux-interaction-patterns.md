# UX Interaction Patterns - AIdioma v2

## Overview
This document defines the established user experience and interaction patterns implemented across AIdioma v2, ensuring consistent behavior and intuitive user flows.

---

## Core UX Principles

### **1. Learning-First Interactions**
- **Minimal Cognitive Load**: Reduce interface complexity to focus attention on language learning
- **Clear Feedback**: Immediate visual confirmation for all user actions
- **Progressive Disclosure**: Reveal information and options as needed, not all at once
- **Error Prevention**: Design patterns that prevent common user mistakes

### **2. Consistent Behavior Patterns**
- **Predictable Navigation**: Same interaction patterns across all pages
- **State Persistence**: Maintain user context when moving between sections
- **Responsive Feedback**: Visual acknowledgment of all button presses and interactions
- **Keyboard Accessibility**: Full keyboard navigation support

---

## Established Interaction Patterns

### **ActionButtons Interaction Flow**

**Button Sequence & Behavior:**
1. **Previous Button**
   - Disabled at first item (`currentParagraph === 0`)
   - Navigates to previous content with state reset
   - Visual: `disabled:opacity-50 disabled:cursor-not-allowed`

2. **Check/Try Again Button**
   - Check: Disabled when no user input (`disabled={!userTranslation.trim()}`)
   - Try Again: Appears after evaluation, resets practice state
   - State transition provides clear progression feedback

3. **Next Button** (Primary Action)
   - White text treatment (`text-white`) indicates primary action
   - Disabled at last item (`currentParagraph === totalParagraphs - 1`)
   - Advances content with state reset

4. **Hint Button**
   - Toggle behavior: "Hint" ↔ "Hide"
   - Persistent state until user navigates or resets
   - Non-disruptive information disclosure

5. **Skip/Next Sentence Button**
   - Skip: Available before evaluation, advances without checking
   - Next Sentence: Available after evaluation, continues flow
   - Contextual label change based on evaluation state

6. **Bookmark Button**
   - Always available for content saving
   - Immediate feedback (console log/API call)
   - No state change to current exercise

### **Content Navigation Patterns**

**Three-Box Scrolling System:**
- **Previous Content**: 50% opacity, clickable for quick navigation
- **Current Content**: Full opacity, highlighted focus area
- **Next Content**: 50% opacity, clickable for preview/skip ahead
- **Boundary States**: "[Beginning of article]" and "[End of article]" placeholders

**Context Preservation:**
- Navigation actions reset translation practice state
- Hint state cleared on navigation
- Evaluation state cleared on navigation
- User input cleared on navigation

### **Form Interaction Patterns**

**TranslationInput Behavior:**
- **Focus Management**: Automatic focus on component mount (optional)
- **Disabled State**: Only when specifically disabled, NOT when evaluated
- **Placeholder Guidance**: Context-specific placeholder text
- **Font Treatment**: `font-mono` for user input to distinguish from UI text

**Input Validation:**
- **Real-time Validation**: Button states update based on input content
- **Trim Validation**: `!userTranslation.trim()` prevents empty submissions
- **Error Prevention**: Disabled states prevent invalid actions

### **Visual Feedback Patterns**

**Hover States:**
- **Buttons**: Color transition (`hover:text-gray-300`, `hover:text-white`)
- **Background**: Subtle background change (`hover:bg-accent`)
- **Clickable Words**: Background highlight (`hover:bg-primary/20 hover:text-primary`)
- **Navigation Items**: Multi-property transitions for rich feedback

**Loading & State Transitions:**
- **Evaluation Display**: Immediate visual feedback with score indicators
- **Progress Updates**: Real-time progress bar updates
- **State Changes**: Clear visual transitions between Check/Try Again modes

**Word-Level Interactions:**
- **Clickable Words**: Individual word hints with popup display
- **Hint Persistence**: Word hints remain until manually dismissed
- **Context Preservation**: General hints and word hints coexist

### **Responsive Interaction Adaptations**

**Mobile-First Touch Interactions:**
- **Touch Targets**: Minimum 44px touch targets (`px-6 py-3` ensures compliance)
- **Gesture Support**: Swipe gestures for navigation (future enhancement)
- **Touch Feedback**: Visual press states for all interactive elements

**Desktop Enhancements:**
- **Keyboard Navigation**: Tab order follows logical flow
- **Hover States**: Rich hover feedback for precision pointing
- **Click Precision**: Smaller interactive elements acceptable on desktop

---

## Error Handling & Edge Cases

### **Boundary Conditions**
- **First Item**: Previous button disabled, clear visual indication
- **Last Item**: Next button disabled, completion messaging
- **Empty Input**: Check button disabled, preventing empty submissions
- **Network Errors**: Graceful degradation with offline functionality

### **State Recovery**
- **Navigation Reset**: Clean state when moving between content
- **Evaluation Recovery**: Try Again button restores input capability
- **Hint Management**: Clear, consistent hint state across interactions

### **Accessibility Considerations**
- **Screen Reader Support**: Proper ARIA labels and descriptions
- **Keyboard Navigation**: Logical tab order and enter/space activation
- **Color Independence**: Interactive states don't rely solely on color
- **Focus Management**: Clear focus indicators and logical focus flow

---

## Performance & Optimization Patterns

### **Interaction Performance**
- **Immediate Feedback**: No loading states for local interactions
- **Smooth Transitions**: 60fps animations using CSS transitions
- **Debounced Actions**: Prevent double-clicks and rapid submissions
- **State Optimization**: Minimal re-renders for state changes

### **Content Loading Patterns**
- **Progressive Loading**: Content loads as needed, not all at once
- **Cache Strategy**: Previous/next content preloaded for smooth navigation
- **Offline Support**: Core interactions work without network connectivity

---

## Future Interaction Enhancements

### **Planned UX Improvements**
- **Gesture Navigation**: Swipe left/right for previous/next on mobile
- **Keyboard Shortcuts**: Power user shortcuts for common actions
- **Voice Input**: Speech-to-text for translation practice
- **Adaptive Hints**: AI-powered personalized hint system

### **Analytics & Learning**
- **Interaction Tracking**: User behavior patterns for UX optimization
- **A/B Testing**: Button placement and interaction flow testing
- **Performance Metrics**: Interaction speed and error rate monitoring
- **User Preference Learning**: Adaptive interface based on usage patterns

---

## Implementation Guidelines

### **Component Development**
- All interactive components must follow established patterns
- New interaction patterns require documentation update
- Cross-page consistency is mandatory for shared components
- Accessibility testing required for all interactive elements

### **Testing Requirements**
- **Interaction Testing**: All button states and transitions
- **Accessibility Testing**: Keyboard navigation and screen reader support
- **Mobile Testing**: Touch interaction validation
- **Edge Case Testing**: Boundary conditions and error states

### **Documentation Maintenance**
- Update this document when adding new interaction patterns
- Maintain pattern consistency across component library
- Regular review of established patterns for optimization opportunities
