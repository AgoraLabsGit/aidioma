# Design System Rules
## Prescriptive Standards for UI Components and Styling

*This document contains mandatory design system rules that complement the main .cursorrules file.*

---

## Mandatory Design Standards

### Color System (REQUIRED)
You MUST use only these design tokens:
```css
--background: 220 13% 8%;            /* Deep black main content */
--foreground: 220 8% 95%;            /* White text */
--card: 220 8% 15%;                  /* Dark charcoal cards */
--border: 220 13% 25%;               /* Subtle dark borders */
--primary: 220 8% 40%;               /* Blue-grey primary */
--muted: 220 8% 9%;                  /* Nearly black muted */
```

Custom colors are FORBIDDEN. You MUST use className properties only:
```typescript
// REQUIRED
<div className="bg-background text-foreground border-border">

// FORBIDDEN
<div style={{ backgroundColor: '#123456', color: '#abcdef' }}>
```

### Component Consistency (MANDATORY)
You MUST ensure identical styling across all pages:
- ActionButtons MUST be identical on Practice, Reading, Conversation pages
- Headers MUST be consistent across all main pages
- Navigation patterns MUST be uniform throughout the application

### Button Standards (REQUIRED)
All buttons MUST follow these specifications:
- Size: `px-6 py-3` for standard buttons
- Spacing: `gap-3` between button groups
- Styling: `rounded-lg font-medium transition-colors`
- Touch targets: MINIMUM 44px height for accessibility

### Typography Scale (MANDATORY)
You MUST use only these established classes:
- `text-xs` (12px) - Captions, helper text
- `text-sm` (14px) - Body text, form labels
- `text-base` (16px) - Default body text
- `text-lg` (18px) - Subheadings
- `text-xl` (20px) - Page headings
- `text-2xl` (24px) - Section titles
- `text-3xl` (30px) - Main headings

Custom font sizes are FORBIDDEN.

### Responsive Layout (REQUIRED)
You MUST follow this mobile-first pattern:
```typescript
<div className="
  w-full max-w-sm mx-auto          // Mobile: constrained width
  sm:max-w-md                      // Small: wider
  lg:max-w-4xl lg:mx-0            // Large: full width
  grid grid-cols-1 gap-4          // Mobile: single column
  lg:grid-cols-3 lg:gap-6         // Large: three columns
">
```

### Component Reusability (MANDATORY)
You MUST create components that work across multiple pages:
- PageLayout: MUST work on ALL 6 pages (100% reusability)
- ActionButtons: MUST work on Practice, Reading, Conversation (75% reusability)
- SessionStats: MUST work on all pages with metrics (85% reusability)

Page-specific components are FORBIDDEN unless absolutely necessary.

### Accessibility (REQUIRED)
You MUST implement:
- ARIA labels for all interactive elements
- Keyboard navigation support
- WCAG AA color contrast compliance
- Minimum 44px touch targets
- Proper focus indicators

### Animation Standards (REQUIRED)
You MUST use Framer Motion for animations:
```typescript
<motion.div
  initial={{ opacity: 0, y: 20 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ duration: 0.2 }}
>
```

CSS animations for complex interactions are FORBIDDEN.

### Design System Violations (FORBIDDEN)
These practices are NOT PERMITTED:
- Custom color values outside the design token system
- Inconsistent button styling across pages
- Breaking the established typography scale
- Component styling that doesn't work across multiple pages
- Missing accessibility attributes
- Non-responsive design patterns

---

*These rules ensure consistent, accessible, and maintainable UI across all AIdioma pages.* 