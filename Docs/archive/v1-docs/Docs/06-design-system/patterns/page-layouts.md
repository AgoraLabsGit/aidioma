# Page Layout Standards - AIdioma v2

## Overview

This document defines the mandatory page layout order for all practice pages in AIdioma v2. Consistency in layout ensures users can navigate efficiently across different learning modes.

---

## Standard Page Layout Order

### **Main Content Area Layout (MANDATORY)**

All practice pages must follow this exact order:

```
Header (Fixed)
├── Sidebar (Fixed)
└── Main Content
    ├── 1. STATS BAR (Always first)
    ├── 2. FILTERS (Always second)  
    └── 3. CONTENT CONTAINER (Always third)
```

### **Implementation Pattern**

```tsx
<main className="flex-1 flex flex-col md:ml-64">
  <div className="flex-1 flex flex-col p-4 md:p-6 pt-6 md:pt-8 bg-background">
    {/* 1. STATS BAR - Always first */}
    <div className="mb-6">
      <PageStats {...statsProps} />
    </div>

    {/* 2. FILTERS - Always second */}
    <div className="mb-6 max-w-4xl mx-auto w-full">
      <PageFilters {...filterProps} />
    </div>

    {/* 3. MAIN CONTENT - Always third */}
    <div className="max-w-4xl mx-auto w-full">
      <div className="w-full card p-4 md:p-8">
        <MainPageContent />
        {/* Standard Progress Bar at bottom */}
        <StandardProgressBar />
      </div>
    </div>
  </div>
</main>
```

---

## Page-Specific Implementations

### **✅ MemorizePage (Reference Standard)**
```tsx
{/* 1. STATS - MemorizeStats */}
<div className="mb-6">
  <MemorizeStats 
    currentCard={currentCardIndex + 1}
    totalCards={flashCards.length}
    reviewsToday={reviewedToday}
    masteredWords={masteredWords}
  />
</div>

{/* 2. FILTERS - MemorizeFilters */}
<div className="mb-6 max-w-4xl mx-auto w-full">
  <MemorizeFilters {...filterProps} />
</div>

{/* 3. CONTENT - Flash Card Container */}
<div className="max-w-4xl mx-auto w-full">
  <div className="w-full card p-4 md:p-8">
    <FlashCard />
    <StandardProgressBar />
  </div>
</div>
```

### **✅ ReadingPage (Correct Layout)**
```tsx
{/* 1. STATS - ReadingStats */}
<div className="mb-6">
  <ReadingStats 
    currentParagraph={readingState.currentParagraph + 1}
    totalParagraphs={readingState.totalParagraphs}
    readingTime={readingState.timeSpent}
    comprehensionScore={readingState.comprehension}
  />
</div>

{/* 2. FILTERS - ReadingFilters */}
<div className="mb-6 max-w-4xl mx-auto w-full">
  <ReadingFilters {...filterProps} />
</div>

{/* 3. CONTENT - Reading Content */}
<div className="max-w-4xl mx-auto w-full">
  <div className="w-full card p-4 md:p-8">
    <ReadingContent />
    <StandardProgressBar />
  </div>
</div>
```

### **✅ PracticePage (Fixed Layout)**
```tsx
{/* 1. STATS - PracticeStats */}
<div className="mb-6">
  <PracticeStats 
    currentSentence={practiceStats.currentSentence}
    totalSentences={practiceStats.totalSentences}
    correctCount={practiceStats.correctCount}
    streakCount={practiceStats.streakCount}
  />
</div>

{/* 2. FILTERS - PracticeFilters */}
<div className="mb-6 max-w-4xl mx-auto w-full">
  <PracticeFilters {...filterProps} />
</div>

{/* 3. CONTENT - Practice Container */}
<div className="max-w-4xl mx-auto w-full">
  <div className="w-full card p-4 md:p-8">
    <PracticeContent />
    <StandardProgressBar />
  </div>
</div>
```

### **✅ ConversationsPage (Fixed Layout)**
```tsx
{/* 1. STATS - ConversationStats */}
<div className="mb-6">
  <ConversationStats 
    messagesCount={conversationStats.messagesCount}
    vocabularyLearned={conversationStats.vocabularyLearned}
    conversationTime={conversationStats.conversationTime}
    fluencyScore={conversationStats.fluencyScore}
  />
</div>

{/* 2. FILTERS - ConversationFilters */}
<div className="mb-6 max-w-4xl mx-auto w-full">
  <ConversationFilters {...filterProps} />
</div>

{/* 3. CONTENT - Chat Interface */}
<div className="max-w-4xl mx-auto w-full">
  <SpanishChatInterface />
  <StandardProgressBar />
</div>
```

---

## Layout Rules & Rationale

### **1. Stats First**
**Why**: Provides immediate feedback about user progress and current session status
- Users see their performance metrics right away
- Creates motivation and context for the learning session
- Establishes current position in learning journey

### **2. Filters Second**  
**Why**: Allows users to customize content before engaging
- Users can adjust difficulty, topic, or content type
- Filters affect the content below, so logical placement
- Secondary priority after seeing current progress

### **3. Content Third**
**Why**: Main interaction area gets primary focus
- After seeing stats and setting filters, users engage with content
- Largest section requiring most screen real estate
- Contains progress bar at bottom for session tracking

---

## Spacing & Alignment Standards

### **Main Content Container Padding**
- **Mobile**: `p-4 pt-6` (16px sides/bottom, 24px top)
- **Desktop**: `md:p-6 md:pt-8` (24px sides/bottom, 32px top)  
- **Rationale**: Extra top padding provides visual breathing room above stats section

### **Section Spacing**
- **Between major sections**: `mb-6` (24px)
- **Stats to Filters**: 24px consistent spacing
- **Filters to Content**: 24px consistent spacing
- **All sections maintain visual rhythm**

### **Content Width Constraints**
- **Stats**: Full width with internal centering (`flex justify-center`)
- **Filters**: `max-w-4xl mx-auto w-full` for consistent alignment
- **Content**: `max-w-4xl mx-auto w-full` matching filters width
- **Card Padding**: `p-4 md:p-8` for content cards

### **Visual Balance**
- **Top padding > Side padding** creates better visual hierarchy
- **Consistent 24px gaps** between all major sections  
- **Centered alignment** keeps focus on content
- **Responsive scaling** maintains proportions across devices

---

## Spacing & Alignment Standards

### **Consistent Spacing**
- Each section: `mb-6` bottom margin
- Container padding: `p-4 md:p-6` for main area
- Card padding: `p-4 md:p-8` for content containers

### **Consistent Width**
- Filters & Content: `max-w-4xl mx-auto w-full`
- Stats: Full width with internal centering
- All sections align for visual consistency

### **Responsive Behavior**
- Mobile: Single column, full width
- Desktop: Centered content with max-width constraints
- Sidebar: Hidden on mobile, fixed on desktop

---

## Common Mistakes

### **❌ Wrong Order Examples**

**Filters Before Stats (INCORRECT)**:
```tsx
{/* DON'T DO THIS */}
<div className="mb-6 max-w-4xl mx-auto w-full">
  <PracticeFilters />  {/* WRONG: Filters first */}
</div>
<div className="mb-6">
  <PracticeStats />    {/* WRONG: Stats second */}
</div>
```

**Stats After Content (INCORRECT)**:
```tsx
{/* DON'T DO THIS */}
<div className="max-w-4xl mx-auto w-full">
  <PracticeContent />  {/* WRONG: Content first */}
</div>
<div className="mb-6">
  <PracticeStats />    {/* WRONG: Stats after content */}
</div>
```

### **❌ Inconsistent Spacing**
```tsx
{/* DON'T DO THIS */}
<div className="mb-4">  {/* WRONG: Should be mb-6 */}
  <PageStats />
</div>
<div className="mb-8 max-w-6xl mx-auto w-full">  {/* WRONG: Should be mb-6 and max-w-4xl */}
  <PageFilters />
</div>
```

---

## Quality Checklist

When implementing page layouts, verify:

- ✅ Stats component is first in main content area
- ✅ Filters component is second with proper width constraints
- ✅ Main content container is third with card styling
- ✅ All sections use `mb-6` spacing
- ✅ Filters and content use `max-w-4xl mx-auto w-full`
- ✅ Content cards use `w-full card p-4 md:p-8`
- ✅ Standard progress bar is at bottom of content
- ✅ Layout is responsive and works on mobile

This ensures all practice pages provide a consistent navigation experience and logical information hierarchy for effective learning.
