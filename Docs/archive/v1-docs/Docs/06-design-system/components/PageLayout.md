# Page Layout Template
## Base Layout Structure for All Pages

### **Overview**
The PageLayout template provides the foundational structure that all pages in the AIdioma application must follow. It ensures consistent header, sidebar, and content organization across the entire application.

### **Complete Implementation**
```tsx
export default function PageName() {
  const [location, setLocation] = useLocation()
  
  // Page-specific state
  const [currentUser] = useState({
    email: 'user@example.com',
    level: 1,
    points: 0
  })

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Unified Header - MANDATORY */}
      <header className="flex border-b border-border bg-muted">
        {/* Desktop Logo Section */}
        <div className="w-64 px-6 py-4 border-r border-border hidden md:flex items-center justify-center">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
              <PageIcon className="w-6 h-6 text-primary-foreground" />
            </div>
            <h1 className="text-2xl font-normal text-foreground">AIdioma</h1>
          </div>
        </div>
        
        {/* Mobile Logo */}
        <div className="md:hidden px-4 py-4 flex items-center">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <PageIcon className="w-5 h-5 text-primary-foreground" />
            </div>
            <h1 className="text-lg font-normal text-foreground">AIdioma</h1>
          </div>
        </div>
        
        {/* Page Title Section */}
        <div className="flex-1 px-6 py-4 flex items-center justify-start pl-4 md:pl-12">
          <h1 className="text-xl md:text-2xl font-semibold text-foreground tracking-tight">
            Page Title
          </h1>
        </div>
        
        {/* Page-Specific Actions/Stats */}
        <div className="px-4 md:px-6 py-4 flex items-center gap-2 md:gap-4">
          {/* Page-specific header content */}
        </div>
      </header>

      {/* Content Area */}
      <div className="flex flex-1">
        {/* Sidebar - Desktop Only */}
        <aside className="hidden md:flex w-64 bg-muted border-r border-border flex-col">
          {/* Navigation */}
          <nav className="flex-1 p-4 pt-8">
            <ul className="space-y-2">
              {navigationItems.map((item) => (
                <li key={item.path}>
                  <button
                    onClick={() => setLocation(item.path)}
                    className={`w-full flex items-center gap-3 px-3 py-3 rounded-lg transition-colors ${
                      isActive 
                        ? 'bg-accent text-accent-foreground font-medium' 
                        : 'text-muted-foreground hover:text-foreground hover:bg-accent/50'
                    }`}
                  >
                    <item.icon className="w-5 h-5" />
                    <span className="text-sm">{item.label}</span>
                  </button>
                </li>
              ))}
            </ul>
          </nav>

          {/* User Profile */}
          <div className="p-4 border-t border-border">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-gray-200 text-sm font-semibold">
                {getInitials(currentUser.email)}
              </div>
              <div className="flex-1">
                <div className="text-sm text-foreground">{currentUser.email}</div>
                <div className="text-xs text-muted-foreground">
                  Level {currentUser.level} • {currentUser.points} pts
                </div>
              </div>
            </div>
            <button className="text-xs text-muted-foreground hover:text-foreground transition-colors block w-full text-center">
              Sign Out
            </button>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 flex flex-col">
          <div className="flex-1 flex flex-col p-4 md:p-6 bg-background">
            {/* Page Stats - Responsive */}
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-6 gap-4 md:gap-0">
              {/* Page-specific stats content */}
            </div>

            {/* Filters/Controls - Aligned Width */}
            <div className="mb-6 max-w-4xl mx-auto w-full">
              {/* Page-specific filter components */}
            </div>

            {/* Main Content Container - Matching Width */}
            <div className="max-w-4xl mx-auto w-full">
              <div className="w-full card p-4 md:p-8">
                {/* Page-specific content */}
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
```

### **Required Structure Elements**

#### **1. Root Container**
```tsx
<div className="min-h-screen bg-background flex flex-col">
```
- **Full Height**: `min-h-screen` ensures full viewport coverage
- **Background**: `bg-background` applies consistent dark theme
- **Flex Layout**: `flex flex-col` stacks header and content vertically

#### **2. Unified Header**
```tsx
<header className="flex border-b border-border bg-muted">
```
- **Flex Layout**: Horizontal arrangement of logo, title, actions
- **Border**: Bottom border separates from content
- **Background**: `bg-muted` distinguishes from main content

#### **3. Content Area**
```tsx
<div className="flex flex-1">
```
- **Flex Layout**: Horizontal arrangement of sidebar and main
- **Flex Grow**: `flex-1` fills remaining vertical space

#### **4. Sidebar (Desktop Only)**
```tsx
<aside className="hidden md:flex w-64 bg-muted border-r border-border flex-col">
```
- **Responsive**: Hidden on mobile, visible on desktop
- **Fixed Width**: `w-64` matches header logo section
- **Vertical Layout**: `flex-col` stacks navigation and profile

#### **5. Main Content**
```tsx
<main className="flex-1 flex flex-col">
```
- **Flex Grow**: Takes remaining horizontal space
- **Vertical Layout**: Stacks content sections

### **Critical Width Alignment**

#### **Content Container Standards**
```tsx
{/* Stats Section - Full Width */}
<div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-6 gap-4 md:gap-0">

{/* Filters Section - Constrained Width */}
<div className="mb-6 max-w-4xl mx-auto w-full">

{/* Main Content - Matching Width */}
<div className="max-w-4xl mx-auto w-full">
  <div className="w-full card p-4 md:p-8">
```

**All content components must use `max-w-4xl mx-auto w-full` for perfect alignment.**

### **Responsive Patterns**

#### **Header Responsive Behavior**
- **Desktop**: Logo section visible with `w-64` width
- **Mobile**: Logo section hidden, mobile logo shown
- **Title**: Responsive text sizing (`text-xl md:text-2xl`)

#### **Content Responsive Behavior**
- **Sidebar**: Hidden on mobile (`hidden md:flex`)
- **Main Content**: Responsive padding (`p-4 md:p-6`)
- **Stats Layout**: Stacked on mobile (`flex-col md:flex-row`)

### **Page-Specific Customizations**

#### **Header Content Examples**

**Practice Page:**
```tsx
<div className="px-4 md:px-6 py-4 flex items-center gap-2 md:gap-4">
  <div className="px-2 md:px-3 py-1 bg-yellow-500 text-black rounded-lg text-xs font-medium">
    0 day streak
  </div>
  <div className="px-2 md:px-3 py-1 bg-blue-500 text-gray-200 rounded-lg text-xs font-medium">
    ⭐ 0 pts
  </div>
</div>
```

**Reading Page:**
```tsx
<div className="px-4 md:px-6 py-4 flex items-center gap-2 md:gap-4">
  <div className="text-sm text-muted-foreground">
    Reading Progress: 67%
  </div>
</div>
```

#### **Stats Section Examples**

**Practice Page:**
```tsx
<SessionStats 
  currentSentence={sessionStats.currentSentence}
  totalSentences={sessionStats.totalSentences}
  correctCount={sessionStats.correctCount}
  incorrectCount={sessionStats.incorrectCount}
/>
```

**Reading Page:**
```tsx
<ReadingStats 
  currentParagraph={readingState.currentParagraph}
  totalParagraphs={readingState.totalParagraphs}
  readingTime={readingState.timeSpent}
  comprehensionScore={readingState.comprehension}
/>
```

### **Navigation Items Standard**
```tsx
const navigationItems = [
  { icon: BookOpen, label: 'Practice', path: '/practice' },
  { icon: Book, label: 'Reading', path: '/reading' },
  { icon: Brain, label: 'Memorize', path: '/memorize' },
  { icon: MessageCircle, label: 'Conversations', path: '/conversations' },
  { icon: TrendingUp, label: 'Progress', path: '/progress' },
  { icon: Award, label: 'Achievements', path: '/achievements' },
  { icon: Settings, label: 'Settings', path: '/settings' },
]
```

### **Implementation Checklist**

#### **Header Requirements**
- [ ] Uses exact header structure with 4 sections
- [ ] Desktop logo section exactly `w-64`
- [ ] Mobile logo properly hidden/shown
- [ ] Page title uses `flex-1` and responsive text
- [ ] Actions section adapts to content

#### **Layout Requirements**
- [ ] Root container uses `min-h-screen bg-background flex flex-col`
- [ ] Content area uses `flex flex-1`
- [ ] Sidebar uses `hidden md:flex w-64`
- [ ] Main content uses responsive padding

#### **Width Alignment**
- [ ] Stats section spans full width with responsive layout
- [ ] Filter components use `max-w-4xl mx-auto w-full`
- [ ] Main content container uses matching width
- [ ] No left padding on content containers

#### **Responsive Design**
- [ ] Mobile-first approach throughout
- [ ] Proper `md:` breakpoint usage
- [ ] Touch-friendly sizing on mobile
- [ ] Desktop-optimized layouts

### **Dependencies**
- React with TypeScript
- Wouter for routing (`useLocation`)
- Lucide React for icons
- Tailwind CSS for styling
- User state management system

### **Usage Notes**
- This template should be the starting point for ALL new pages
- Customize the page-specific sections while maintaining the structure
- Never deviate from the width alignment patterns
- Always test responsive behavior on mobile and desktop
