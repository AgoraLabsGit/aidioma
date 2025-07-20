# AIdioma Practice Pages Documentation

## Current Practice Pages Overview

AIdioma currently has TWO distinct practice page versions optimized for different user workflows and interface preferences.

### **Practice.v2 (Main Practice Page)**
**URL**: http://localhost:5001/practice

**Features**:
- 🎛️ **Compact Filters** - Clean, collapsible filter interface with standardized spacing
- 📝 **Interactive Clickable Sentence** - Words are clickable for instant hints and translations
- 🎨 **Clean Visual Feedback** - Streamlined color-coded word evaluation without clutter
- 🔘 **Wide ActionButtons Layout** - Check button centered between Prev/Next in single row
- ✨ **Ultra-minimal Practice Box** - Removed all unnecessary elements, focus on content only
- 🎨 **Unified background** - Header and content match menu background color perfectly
- 🎯 **Progress wheels in header** - All main stats consolidated in header only
- 📊 **Translation Statistics** - Dedicated component tracking correct vs incorrect translations
- 🩺 **Translation Health** - Performance indicator with green/orange/red progression
- 📈 **Session Progress** - Clean, standardized progress tracking
- 📏 **Compact Spacing** - Consistent mb-4 spacing between all major components (50% reduction for better density)

### **Practice.v1 (Backup Version)**
**URL**: http://localhost:5001/practice-v1

**Features**:
- 🎛️ **Same Compact Filters** - Identical optimized filter interface
- 📝 **Same Interactive Sentence** - Identical clickable word functionality
- 🎨 **Same Clean Feedback** - Consistent streamlined evaluation
- 🔘 **Enhanced Traditional Layout** - Improved button arrangement with better spacing
- ✅ **Same ultra-minimal Practice Box** - Matching clean design philosophy
- 🎨 **Same unified background** - Consistent color harmony
- 🎯 **Progress wheels in header** - Identical header design
- 📊 **Same Translation Statistics** - Identical statistics tracking component
- 🩺 **Same Translation Health** - Matching health indicator
- 📈 **Same Session Progress** - Consistent progress tracking
- 📏 **Same Compact Spacing** - Identical mb-4 component spacing for better density

## 🔄 When to Use Each Version

- **Practice.v2**: Primary version for standard learning workflows with advanced ActionButtons
- **Practice.v1**: Backup version with traditional button layout for users preferring classic interactions

## 🎮 Interactive Features

### **Smart Word Evaluation**
- Click any word in the sentence for instant translation hints
- Visual feedback with color coding:
  - **Green**: Correct understanding
  - **Orange**: Close/partial understanding  
  - **Red**: Needs improvement
- Hint popups with point penalties for balanced learning

### **Comprehensive Progress Tracking**
- **Header**: Progress wheels showing overall learning stats
- **Translation Statistics**: Dedicated tracking of correct vs incorrect translations with visual progress bar
- **Translation Health**: Performance indicator showing learning effectiveness
- **Session Progress**: Current sentence progress within the session

### **Refined Design System**
- **Background**: Header and content areas match sidebar menu color (`bg-muted`)
- **Typography**: Large, readable sentence display optimized for learning
- **Spacing**: Compact `mb-4` spacing between all major components (50% reduction for better density)
- **Buttons**: Icon-only design with green check mark button (44px circular), arrow navigation buttons (14x14 containers, w-11 h-11 icons), proper accessibility sizing
- **Colors**: Toned-down, less vibrant green/red for better visual harmony
- **Component Order**: Translation Health above Translation Statistics for better UX flow
- **Typography**: Progress components use `text-xs` to match sidebar menu styling
- **Clean Progress Bars**: All right-side text removed for minimalist design ("Excellent", counts, etc.)
- **Muted UI Elements**: Hint boxes, evaluation results, and word hints use subdued colors matching design system

### **Icon Button Specifications**
- **Check Button**: `bg-green-600 hover:bg-green-700 text-white rounded-full min-h-[44px] min-w-[44px]`
- **Navigation Buttons**: `ChevronUp`/`ChevronDown` icons with `w-11 h-11` (optimized size) in `h-14 w-14` containers
- **Secondary Buttons**: Retain text labels (Hint, Skip, Save) for clarity
- **Try Again**: Uses `RotateCcw` icon when in evaluated state
- **Page Spacing**: Substantial header-to-content spacing `pt-20 md:pt-24` (80px/96px visual separation)
- **Logo Positioning**: `justify-start` instead of `justify-center` for left alignment

## 🛠️ Technical Implementation

Both versions share:
- **Reusable Components**: Logo, SharedSidebar, ActionButtons, ProgressWheels
- **Responsive Design**: Mobile-first approach with optimized breakpoints
- **State Management**: React hooks for user input, evaluation state, and UI interactions
- **Interactive Elements**: Clickable words with evaluation feedback system
- **Standard Components**: Three separate progress components with identical layouts
- **Clean Architecture**: Removed redundant elements and optimized component structure

## 📱 Responsive Behavior

- **Mobile (< 768px)**: Single column layout, compact header with mobile logo
- **Tablet (768px - 1024px)**: Two-column layout with expanded filters
- **Desktop (> 1024px)**: Full layout with sidebar, header progress wheels, and wide content

## 🎨 UI Refinements

### **Compact Component Spacing & Reordered Layout**
- **Consistent mb-4**: 50% reduced spacing between all components for better density
- **Reordered Components**: Translation Health now appears above Translation Statistics
- **Menu-Style Typography**: All progress components use text-xs font to match sidebar menu
- **Visual Rhythm**: Tighter, more efficient vertical spacing throughout the page
- **Professional Layout**: Clean, compact component arrangement

### **Icon-Only Button Design**
- **Green Check Button**: Circular 44x44px green button with white check mark icon (w-6 h-6)
- **Arrow Navigation**: Medium 14x14 (56px) up/down arrow buttons with w-11 h-11 icons (30% reduced from peak size)
- **Accessibility**: Proper touch targets for all interactive elements
- **Clean Interface**: Text-free design for modern, minimalist appearance
- **Visual Hierarchy**: Green check mark stands out as primary action
- **Enhanced Spacing**: Sidebar navigation menu pushed down 25% more from header (pt-8 -> pt-10)
- **Logo Alignment**: Left-aligned AIdioma logo to match page text alignment

### **New Translation Statistics Component**
- **Dedicated Tracking**: Separate component for correct vs incorrect translations
- **Visual Progress**: Green progress bar showing accuracy ratio
- **Consistent Layout**: Follows same pattern as Translation Health component
- **Real-time Updates**: Dynamic display of translation performance

### **Ultra-Clean Practice Box**
- **Minimal Content**: Removed circular icons and unnecessary elements
- **Focus on Learning**: Interactive sentence display with clean evaluation
- **Streamlined UI**: Only essential learning elements remain
- **Better UX**: Less visual clutter, more focus on content

### **Enhanced Component Architecture**
- **Three Progress Components**: Translation Statistics, Translation Health, Session Progress
- **Consistent Design**: All follow identical layout patterns
- **Logical Organization**: Clear separation of different progress types
- **Maintainable Code**: Reusable patterns across components

Both practice pages now offer a refined, systematically organized learning experience with comprehensive progress tracking and beautiful, minimalist design. 