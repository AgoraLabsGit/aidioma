# Frontend Components

## Component Architecture

### Page Components
- Landing: Landing page for logged-out users
- Practice: Main translation practice interface
- Progress: User progress tracking and analytics
- NotFound: 404 error handling

### Practice Components
- TranslationPractice: Main practice orchestration
- SentenceDisplay: English sentence presentation
- TranslationInput: Spanish input with validation
- HintSystem: Interactive word hints
- Feedback: AI evaluation results
- Filters: Content filtering interface

### Layout Components
- Sidebar: Navigation and user context
- Topbar: Header with user actions
- ProtectedLayout: Authentication wrapper

### UI Components
Comprehensive shadcn/ui component library for consistent design.

## State Management
- TanStack Query for server state
- React Hook Form for form management
- Custom hooks for reusable logic

## Component Guidelines
- TypeScript for all components
- Responsive design patterns
- Accessibility considerations
- Performance optimization

*Component implementation details in client/src/components/*