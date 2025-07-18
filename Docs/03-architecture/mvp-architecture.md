# Create comprehensive architecture specification
cat > 03-architecture/mvp-architecture.md << 'EOF'
# AIdioma MVP Architecture
## Complete Modular System Specification

---

## 🏗️ **System Overview**

AIdioma MVP consists of **6 core pages** powered by **12 reusable modules** organized into 5 categories:

### **Page Architecture**
1. **Practice Page** - Core sentence translation practice
2. **Text Page** - Interactive reading with practice integration  
3. **Conversation Page** - Real-time AI chat practice
4. **Memorize Page** - Spaced repetition flash cards
5. **Progress Page** - Analytics and achievement system
6. **Settings Page** - User preferences and configuration

### **Module Categories**
- **🤖 Language/AI Modules** (5): Translation evaluation, hints, content processing, conversation, topic management
- **👤 User Experience Modules** (2): Gamification system, analytics aggregation  
- **🎨 UI/UX Modules** (5): Reading interface, content upload, text pages, flash cards, conversation UI

---

## 📊 **Module Integration Matrix**

| Page | Translation Eval | Hints | Content Processing | Conversation | Gamification | Analytics |
|------|-----------------|-------|-------------------|--------------|--------------|-----------|
| **Practice** | ✅ Core | ✅ Core | ⚡ Data | ❌ N/A | ✅ Points | ✅ Stats |
| **Text** | ✅ Sentences | ✅ Words | ✅ Core | ❌ N/A | ✅ Reading | ✅ Progress |
| **Conversation** | ✅ Turns | ❌ N/A | ⚡ Topics | ✅ Core | ✅ Chat | ✅ Convo |
| **Memorize** | ❌ N/A | ❌ N/A | ✅ Vocab | ❌ N/A | ✅ Review | ✅ Memory |
| **Progress** | ❌ N/A | ❌ N/A | ❌ N/A | ❌ N/A | ⚡ Display | ✅ Core |
| **Settings** | ❌ N/A | ❌ N/A | ❌ N/A | ❌ N/A | ⚡ Config | ⚡ Config |

**Legend**: ✅ Core Usage | ⚡ Secondary Usage | ❌ Not Used

---

## 🔧 **Core Module Specifications**

### **Translation Evaluation Engine**
**Purpose**: Multi-criteria AI evaluation across pages
**API**: `evaluateTranslation(input, correct, context) → GradingResult`
**Features**: Grammar/vocabulary/naturalness scoring, contextual feedback, penalty calculation
**Optimization**: 3-tier caching (85% cache hit, 10% template, 5% AI calls)

### **Progressive Hints System**  
**Purpose**: 3-level hint delivery with learning analytics
**API**: `provideHint(word, level, context) → HintResponse`
**Features**: Basic/intermediate/complete hints, cost tracking, independence scoring
**Integration**: Practice page (sentences), Text page (words)

### **Gamification System**
**Purpose**: Points, streaks, levels, achievements across all activities
**API**: `calculatePoints(activity, performance) → PointsEarned`
**Features**: Activity-based scoring, streak maintenance, level progression, achievement triggers
**Coverage**: All 6 pages for consistent motivation

### **Content Processing & Indexing**
**Purpose**: Text analysis, vocabulary extraction, difficulty assessment
**API**: `processText(content, options) → ProcessedContent`  
**Features**: Sentence segmentation, topic classification, vocabulary analysis, metadata generation
**Integration**: Text page (core), Practice page (data), Memorize page (vocabulary)

### **Conversation Suite**
**Purpose**: Real-time AI chat with Spanish speakers
**API**: `sendMessage(sessionId, message) → AIResponse`
**Features**: Persona management, context awareness, turn evaluation, conversation history
**Integration**: Conversation page (core), potential Practice page integration

---

## 📱 **Page-Specific Architecture**

### **Practice Page Enhancement**
**Current State**: Functional sentence practice with basic hints
**Required Modules**: Translation Evaluation (enhanced), Progressive Hints (3-level), Gamification (points/streaks)
**New Features**: Advanced filtering, performance analytics, adaptive difficulty

### **Text Page Development** 
**Current State**: Basic content upload and reading
**Required Modules**: Content Processing (core), Reading Interface (vertical scroll), Progressive Hints (word-level)
**New Features**: Interactive reading, sentence practice integration, progress tracking

### **Conversation Page Creation**
**Current State**: Not implemented  
**Required Modules**: Conversation Suite (core), Real-time Evaluation, Gamification (conversation points)
**New Features**: Topic selection, persona system, turn-by-turn feedback

### **Memorize Page Development**
**Current State**: Not implemented
**Required Modules**: Flash Card System, Spaced Repetition Engine, Gamification (review points)
**New Features**: Horizontal swipe interface, intelligent scheduling, vocabulary from reading

---

## 🔄 **Data Flow Architecture**

### **User Action → Module Processing → UI Update**

### **Cross-Module Data Sharing**

