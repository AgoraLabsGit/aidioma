# Pages Index - AIdioma Application

This document provides a comprehensive overview of all pages in the AIdioma Spanish learning application, their purposes, features, and navigation structure.

## Navigation Structure

The application uses a sidebar navigation with the following main sections:

```
📖 Practice         (Main sentence practice)
📚 Content          (Content management & reading)
💬 Conversations    (AI-powered chat practice)
📈 Progress         (Learning analytics)
🏆 Achievements     (Gamification)
⚙️ Settings         (User preferences)
```

## Page Definitions

```
📖 Practice         (Main sentence practice)
� Content          (Content management & reading)
� Conversations    (AI-powered chat practice)
📈 Progress         (Learning analytics)
🏆 Achievements     (Gamification)
⚙️ Settings         (User preferences)
```

## Page Definitions

### 1. Landing Page (`/`)
**File:** `client/src/pages/landing.tsx`
**Purpose:** Authentication and onboarding for new users
**Features:**
- User login/registration
- Application introduction
- Feature highlights
- Getting started guidance

**Navigation:** Entry point for unauthenticated users

---

### 2. Practice Page (`/practice`)
**File:** `client/src/pages/practice.tsx`
**Purpose:** Core sentence translation practice functionality
**Features:**
- Sentence-by-sentence translation practice
- Real-time AI evaluation with scoring
- Hint system with penalty tracking
- Progress tracking per sentence
- Difficulty filtering (1-5 scale)
- Topic-based filtering
- Streak tracking and point system

**Key Components:**
- Sentence display with Spanish text
- Translation input field
- Hint revelation system
- Evaluation feedback with explanations
- Progress indicators

**API Endpoints Used:**
- `GET /api/sentences` - Fetch practice sentences
- `POST /api/evaluate-translation` - Submit translations for AI evaluation
- `POST /api/hint-used` - Track hint usage

---

### 3. Content Page (`/content`) - **NEW**
**File:** `client/src/pages/ContentPage.tsx`
**Purpose:** Comprehensive content management and reading system
**Features:**
- **Content Upload Interface:**
  - Multi-format file support (txt, pdf, etc.)
  - Content type classification (AI Story, Web Story, Book, Conversation)
  - Metadata entry (title, author, topics)
  - Real-time processing status

- **Content Browser:**
  - Grid view of all uploaded content
  - Filtering by content type
  - Metadata display (difficulty, reading time, topics)
  - Content statistics

- **Interactive Reader:**
  - Sentence-by-sentence navigation
  - Clickable words with instant hints
  - Translation toggle
  - Progress tracking per sentence
  - User feedback system (Known/Needs Review)

**View Modes:**
- `browser` - Content library view
- `upload` - File upload interface  
- `reader` - Interactive reading mode

**Content Types Supported:**
- **AI Stories** - Generated Spanish narratives
- **Web Stories** - Scraped online content
- **Books** - Literary texts and novels
- **Conversation Scripts** - Dialog practice materials

**API Endpoints Used:**
- `POST /api/content/upload` - Upload and process content
- `GET /api/content` - Browse content library
- `GET /api/content/:id/sentences` - Get sentences for reading
- `POST /api/content/progress` - Track reading progress

**Components:**
- `ContentUpload` - File upload and processing
- `ContentBrowser` - Content library grid
- `ContentReader` - Interactive reading interface

**Note:** This page replaces the previous Text Mode functionality with a more comprehensive content management and reading system.

---

### 4. Conversations Page (`/conversations`) - **PLANNED**
**File:** `client/src/pages/ConversationsPage.tsx`
**Purpose:** AI-powered conversation practice with Spanish speakers
**Features:**
- **Topic Selection:**
  - Pre-defined conversation topics (travel, food, work, family, etc.)
  - Difficulty-based topic filtering
  - Custom topic creation

- **AI Persona System:**
  - Multiple Spanish speaker personalities
  - Regional accent variations (Mexico, Spain, Argentina, etc.)
  - Different speaking styles (formal, casual, professional)
  - Age and background variations

- **Real-time Chat Interface:**
  - Text-based conversations with AI
  - Voice input/output support (planned)
  - Real-time grammar and vocabulary suggestions
  - Context-aware responses

- **Conversation Features:**
  - Turn-by-turn evaluation
  - Grammar correction with explanations
  - Vocabulary suggestions
  - Cultural context tips
  - Conversation flow guidance

- **Progress Tracking:**
  - Conversation history
  - Topics mastered
  - Speaking confidence metrics
  - Vocabulary usage tracking

**Planned API Endpoints:**
- `POST /api/conversations/start` - Initialize new conversation
- `POST /api/conversations/:id/message` - Send message and get AI response
- `GET /api/conversations/history` - Get conversation history
- `GET /api/conversations/topics` - Get available topics
- `POST /api/conversations/evaluate` - Evaluate conversation performance

**Components (Planned):**
- `ConversationStarter` - Topic and persona selection
- `ChatInterface` - Real-time messaging
- `ConversationHistory` - Past conversations browser
- `PerformanceAnalytics` - Conversation skill metrics

---

### 5. Progress Page (`/progress`)
**File:** `client/src/pages/progress.tsx`
**Purpose:** Learning analytics and progress visualization
**Features:**
- Overall learning statistics
- Performance trends over time
- Streak tracking
- Points and level system
- Difficulty progression analysis
- Time spent learning
- Areas for improvement identification

**Metrics Tracked:**
- Total sentences practiced
- Average accuracy scores
- Learning streaks
- Points earned
- Current level
- Time spent practicing
- Hint usage patterns

**API Endpoints Used:**
- `GET /api/progress` - Get user statistics
- `GET /api/progress/history` - Get detailed progress history

---

### 6. Achievements Page (`/achievements`) - **PLANNED**
**File:** Not yet implemented
**Purpose:** Gamification and motivation system
**Planned Features:**
- Achievement badges and milestones
- Learning challenges
- Progress celebrations
- Social features (future)
- Leaderboards (future)

---

### 7. Settings Page (`/settings`) - **PLANNED**
**File:** Not yet implemented
**Purpose:** User preferences and application configuration
**Planned Features:**
- Learning preferences
- Difficulty settings
- Audio/visual preferences
- Progress tracking options
- Account management
- Privacy settings

---

### 8. Not Found Page (`/404`)
**File:** `client/src/pages/not-found.tsx`
**Purpose:** Handle invalid routes gracefully
**Features:**
- Friendly error message
- Navigation back to main pages
- Suggestions for valid routes

---

## Page Routing Structure

The application uses `wouter` for client-side routing with the following structure:

```typescript
// Unauthenticated routes
<Route path="/" component={Landing} />

// Authenticated routes (wrapped in ProtectedLayout)
<Route path="/practice" component={Practice} />
<Route path="/content" component={ContentPage} />
<Route path="/conversations" component={ConversationsPage} />
<Route path="/progress" component={Progress} />

// Catch-all for invalid routes
<Route component={NotFound} />
```

## Layout Components

### ProtectedLayout
**Purpose:** Wrapper for authenticated pages
**Features:**
- Sidebar navigation
- Top bar with user info
- Consistent spacing and styling
- Responsive design

**Components:**
- `Sidebar` - Main navigation menu
- `Topbar` - User info and quick actions

## Page State Management

### Authentication State
- Managed by `useAuth` hook
- Determines route access
- Provides user information

### Content State  
- Managed by TanStack Query
- Caches API responses
- Handles loading/error states
- Optimistic updates

### Progress Tracking
- Real-time updates to user progress
- Integration with point system
- Streak maintenance
- Performance analytics

## Future Page Additions

### Vocabulary Builder (`/vocabulary`)
**Purpose:** Dedicated vocabulary learning
**Planned Features:**
- Personal vocabulary lists
- Spaced repetition system
- Word association games
- Etymology and context
- Visual memory aids

### Grammar Guide (`/grammar`)
**Purpose:** Spanish grammar reference and practice
**Planned Features:**
- Interactive grammar rules
- Conjugation practice
- Sentence construction
- Common error patterns
- Progressive complexity

## Technical Implementation Notes

### Responsive Design
- All pages implement mobile-first design
- Sidebar collapses on mobile devices
- Touch-friendly interfaces
- Optimized for various screen sizes

### Performance Considerations
- Lazy loading for content-heavy pages
- Optimized API calls with caching
- Progressive enhancement
- Minimal bundle sizes

### Accessibility
- Keyboard navigation support
- Screen reader compatibility
- High contrast mode support
- Focus management

### State Persistence
- Progress automatically saved
- Settings preserved across sessions
- Offline capability (planned)
- Sync across devices (planned)

---

This pages index serves as a reference for developers and stakeholders to understand the application structure, feature set, and development roadmap for the AIdioma Spanish learning platform.
