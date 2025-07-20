# Progress System UI Specifications

## 🎨 Design System Integration

The Progress System UI components integrate seamlessly with AIdioma's existing Strike-inspired dark theme while introducing enhanced visual elements for progress tracking and achievement recognition.

---

## 📱 Component Specifications

### **Enhanced Stats Boxes (Updated)**

#### **Current Implementation (After Spacing Update)**
```tsx
// Updated spacing from gap-2 to gap-3 (50% increase)
<div className="flex items-center gap-3 p-2 md:p-3 bg-muted rounded-lg">
  <Icon className="w-6 h-6 text-{color}-500" />
  <div>
    <div className="text-base md:text-lg font-semibold text-foreground">
      {value}
    </div>
    <div className="text-xs text-muted-foreground">{label}</div>
  </div>
</div>
```

#### **Enhanced Progress-Enabled Version**
```tsx
<div className="bg-muted border border-border rounded-lg p-4 cursor-pointer transition-all duration-200 hover:border-{color}-500/50 hover:bg-accent/50">
  <div className="flex items-center gap-3 mb-3">
    <Icon className="w-6 h-6 text-{color}-500" />
    <div className="flex-1">
      <div className="text-xl font-bold text-foreground">{value}</div>
      <div className="text-sm text-muted-foreground">{label}</div>
    </div>
    {grade && (
      <div className="text-sm font-semibold px-2 py-1 rounded text-{color}-500 bg-{color}-500/10">
        {grade}
      </div>
    )}
  </div>
  
  {progress !== undefined && (
    <div className="mb-2">
      <div className="w-full bg-background rounded-full h-2">
        <div 
          className="bg-{color}-500 h-2 rounded-full transition-all duration-300"
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  )}
  
  {trend && (
    <div className="text-xs text-muted-foreground">{trend}</div>
  )}
</div>
```

**Key Enhancements:**
- **Icon Spacing**: Increased from `gap-2` (8px) to `gap-3` (12px) for better visual breathing room
- **Progress Bars**: Optional progress visualization for metric tracking
- **Grade Badges**: Letter grade display for performance feedback
- **Trend Indicators**: Week-over-week change display
- **Interactive States**: Hover effects for navigation to detail pages

---

## 🏆 Grade Display Components

### **Grade Badge Component**
```tsx
interface GradeBadgeProps {
  grade: GradeCalculation;
  size?: 'sm' | 'md' | 'lg';
}

function GradeBadge({ grade, size = 'md' }: GradeBadgeProps) {
  const sizeClasses = {
    sm: 'px-2 py-1 text-xs',
    md: 'px-4 py-2 text-sm',
    lg: 'px-6 py-3 text-base'
  };

  return (
    <div 
      className={`flex items-center gap-2 rounded-lg border ${sizeClasses[size]}`}
      style={{ 
        backgroundColor: `${grade.color}20`,
        borderColor: grade.color,
        color: grade.color 
      }}
    >
      <Award className="w-4 h-4" />
      <div>
        <div className="font-bold">{grade.letter}</div>
        <div className="text-xs opacity-80">{grade.description}</div>
      </div>
    </div>
  );
}
```

### **Grade Color System**
```typescript
const GRADE_COLORS = {
  'A+': '#10B981', // Emerald-500 (Exceptional)
  'A':  '#059669', // Emerald-600 (Excellent)
  'B+': '#0891B2', // Cyan-600 (Very Good)
  'B':  '#0284C7', // Blue-600 (Good)
  'C+': '#7C3AED', // Violet-600 (Above Average)
  'C':  '#8B5CF6', // Violet-500 (Average)
  'D+': '#F59E0B', // Amber-500 (Below Average)
  'D':  '#D97706', // Amber-600 (Needs Work)
  'F':  '#DC2626'  // Red-600 (Needs Significant Improvement)
};
```

---

## 📊 Level Progression Components

### **Level Progress Bar**
```tsx
interface LevelProgressProps {
  currentLevel: LearnerLevel;
  currentXP: number;
  nextLevel: LearnerLevel;
}

function LevelProgress({ currentLevel, currentXP, nextLevel }: LevelProgressProps) {
  const progress = ((currentXP - currentLevel.xpRequired) / (nextLevel.xpRequired - currentLevel.xpRequired)) * 100;
  const xpToNext = nextLevel.xpRequired - currentXP;

  return (
    <div className="bg-muted border border-border rounded-lg p-6">
      {/* Level Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <span className="text-3xl">{currentLevel.badge}</span>
          <div>
            <h3 className="text-lg font-semibold text-foreground">{currentLevel.title}</h3>
            <p className="text-sm text-muted-foreground">{currentLevel.titleSpanish}</p>
          </div>
        </div>
        <div className="text-right">
          <div className="text-xl font-bold text-foreground">{currentXP.toLocaleString()} XP</div>
          <div className="text-sm text-muted-foreground">{xpToNext.toLocaleString()} to next level</div>
        </div>
      </div>
      
      {/* Progress Bar */}
      <div className="space-y-2">
        <div className="flex justify-between text-sm text-muted-foreground">
          <span>{currentLevel.title}</span>
          <span>{nextLevel.title}</span>
        </div>
        <div className="w-full bg-background rounded-full h-3 overflow-hidden">
          <div 
            className="bg-gradient-to-r from-blue-500 to-purple-500 h-3 rounded-full transition-all duration-500 ease-out"
            style={{ width: `${Math.max(5, Math.min(progress, 100))}%` }}
          />
        </div>
        <div className="text-center text-xs text-muted-foreground">
          {progress.toFixed(1)}% complete
        </div>
      </div>
    </div>
  );
}
```

### **Level Badge Emoji System**
```typescript
const LEVEL_BADGES = {
  principiante: '🌱',     // Beginner - Growing plant
  estudiante: '📚',       // Student - Books
  conversador: '💬',      // Conversationalist - Speech bubble
  intermedio: '🎯',       // Intermediate - Target
  avanzado: '⭐',         // Advanced - Star
  experto: '👑'          // Expert - Crown
};
```

---

## 🏅 Achievement System UI

### **Achievement Card Component**
```tsx
interface AchievementCardProps {
  achievement: Achievement;
  isRecent?: boolean;
  showXP?: boolean;
}

function AchievementCard({ achievement, isRecent = false, showXP = true }: AchievementCardProps) {
  return (
    <div className={`flex items-center gap-3 p-4 rounded-lg border transition-all duration-200 ${
      isRecent 
        ? 'bg-gradient-to-r from-yellow-500/10 to-orange-500/10 border-yellow-500/30 shadow-md' 
        : 'bg-muted border-border hover:border-border/60'
    }`}>
      <div className="relative">
        <span className="text-2xl">{achievement.badge}</span>
        {isRecent && (
          <div className="absolute -top-1 -right-1 w-3 h-3 bg-yellow-500 rounded-full animate-pulse" />
        )}
      </div>
      
      <div className="flex-1">
        <h4 className="font-semibold text-foreground flex items-center gap-2">
          {achievement.title}
          {isRecent && <span className="text-xs bg-yellow-500/20 text-yellow-600 px-2 py-1 rounded">NEW</span>}
        </h4>
        <p className="text-sm text-muted-foreground">{achievement.description}</p>
        {achievement.unlockedAt && (
          <p className="text-xs text-muted-foreground mt-1">
            Unlocked {formatDistanceToNow(achievement.unlockedAt)} ago
          </p>
        )}
      </div>
      
      {showXP && (
        <div className="text-right">
          <div className="text-lg font-bold text-yellow-500">+{achievement.xpReward}</div>
          <div className="text-xs text-muted-foreground">XP</div>
        </div>
      )}
    </div>
  );
}
```

### **Achievement Notification Toast**
```tsx
interface AchievementToastProps {
  achievement: Achievement;
  xpGained: number;
  levelUp?: boolean;
  onClose: () => void;
}

function AchievementToast({ achievement, xpGained, levelUp, onClose }: AchievementToastProps) {
  return (
    <div className="fixed top-4 right-4 z-50 max-w-sm w-full">
      <div className="bg-gradient-to-r from-yellow-500/20 to-orange-500/20 border border-yellow-500/30 rounded-lg p-4 shadow-xl backdrop-blur-sm">
        <div className="flex items-start gap-3">
          <div className="relative">
            <span className="text-3xl">{achievement.badge}</span>
            <div className="absolute -top-1 -right-1 w-4 h-4 bg-yellow-500 rounded-full animate-ping" />
          </div>
          
          <div className="flex-1">
            <h3 className="font-bold text-foreground text-lg">Achievement Unlocked!</h3>
            <h4 className="font-semibold text-yellow-600">{achievement.title}</h4>
            <p className="text-sm text-muted-foreground">{achievement.description}</p>
            
            <div className="flex items-center gap-4 mt-2">
              <div className="text-yellow-500 font-semibold">+{xpGained} XP</div>
              {levelUp && (
                <div className="text-purple-500 font-semibold flex items-center gap-1">
                  <span>Level Up!</span>
                  <span className="text-lg">🎉</span>
                </div>
              )}
            </div>
          </div>
          
          <button 
            onClick={onClose}
            className="text-muted-foreground hover:text-foreground text-xl leading-none"
          >
            ×
          </button>
        </div>
      </div>
    </div>
  );
}
```

---

## 📈 Progress Dashboard Layout

### **Dashboard Grid System**
```tsx
function ProgressDashboard() {
  return (
    <div className="space-y-6">
      {/* Level Progress - Full Width */}
      <LevelProgress {...levelProps} />
      
      {/* Weekly Stats - Responsive Grid */}
      <div>
        <h2 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
          <Calendar className="w-5 h-5 text-blue-500" />
          This Week's Progress
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {weeklyStats.map((stat, index) => (
            <EnhancedMetricCard key={index} {...stat} />
          ))}
        </div>
      </div>
      
      {/* Page Performance - 4 Column Grid */}
      <div>
        <h2 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
          <Target className="w-5 h-5 text-purple-500" />
          Performance by Learning Area
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {pagePerformance.map((page, index) => (
            <EnhancedMetricCard key={index} {...page} />
          ))}
        </div>
      </div>
      
      {/* Two Column Layout for Achievements & Milestones */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Achievements */}
        <div>
          <h2 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
            <Trophy className="w-5 h-5 text-yellow-500" />
            Recent Achievements
          </h2>
          <div className="space-y-3">
            {recentAchievements.map((achievement) => (
              <AchievementCard key={achievement.id} achievement={achievement} isRecent />
            ))}
          </div>
        </div>
        
        {/* Next Milestones */}
        <div>
          <h2 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
            <ChevronRight className="w-5 h-5 text-blue-500" />
            Next Milestones
          </h2>
          <div className="space-y-3">
            {nextMilestones.map((milestone) => (
              <MilestoneCard key={milestone.id} milestone={milestone} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
```

### **Responsive Breakpoints**
```css
/* Mobile First Approach */
.progress-grid {
  display: grid;
  gap: 1rem;
  grid-template-columns: repeat(2, 1fr); /* Mobile: 2 columns */
}

@media (min-width: 768px) {
  .progress-grid {
    grid-template-columns: repeat(3, 1fr); /* Tablet: 3 columns */
  }
}

@media (min-width: 1024px) {
  .progress-grid {
    grid-template-columns: repeat(6, 1fr); /* Desktop: 6 columns */
  }
}

@media (min-width: 1280px) {
  .progress-grid {
    grid-template-columns: repeat(8, 1fr); /* Large Desktop: 8 columns */
  }
}
```

---

## 🎨 Animation Specifications

### **Progress Bar Animations**
```css
/* Smooth progress bar fill animation */
.progress-fill {
  transition: width 0.5s cubic-bezier(0.4, 0, 0.2, 1);
}

/* Pulse animation for level progress */
@keyframes level-pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.8; }
}

.level-progress:hover .progress-fill {
  animation: level-pulse 2s ease-in-out infinite;
}
```

### **Achievement Unlock Animations**
```css
/* Slide in from right for achievement toasts */
@keyframes slide-in-right {
  0% {
    transform: translateX(100%);
    opacity: 0;
  }
  100% {
    transform: translateX(0);
    opacity: 1;
  }
}

.achievement-toast {
  animation: slide-in-right 0.3s ease-out;
}

/* Badge bounce effect */
@keyframes badge-bounce {
  0%, 20%, 50%, 80%, 100% {
    transform: translateY(0);
  }
  40% {
    transform: translateY(-4px);
  }
  60% {
    transform: translateY(-2px);
  }
}

.achievement-badge-new {
  animation: badge-bounce 0.6s ease-in-out;
}
```

### **Hover Interactions**
```css
/* Metric card hover effects */
.metric-card {
  transition: all 0.2s ease-in-out;
}

.metric-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

/* Grade badge glow effect */
.grade-badge:hover {
  box-shadow: 0 0 20px currentColor;
  filter: brightness(1.1);
}
```

---

## 📊 Accessibility Standards

### **ARIA Labels and Roles**
```tsx
// Progress bars with proper ARIA attributes
<div 
  role="progressbar" 
  aria-valuenow={progress} 
  aria-valuemin="0" 
  aria-valuemax="100"
  aria-label={`${label}: ${progress}% complete`}
>
  <div className="progress-fill" style={{ width: `${progress}%` }} />
</div>

// Achievement cards with semantic markup
<div role="article" aria-labelledby="achievement-title">
  <h4 id="achievement-title">{achievement.title}</h4>
  <p>{achievement.description}</p>
</div>
```

### **Keyboard Navigation**
```tsx
// Interactive metric cards with keyboard support
<div 
  tabIndex={0}
  role="button"
  onKeyDown={(e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      onClick?.();
    }
  }}
  className="metric-card"
>
  {/* Card content */}
</div>
```

### **Color Contrast Compliance**
All color combinations meet WCAG 2.1 AA standards:
- **Text on backgrounds**: Minimum 4.5:1 contrast ratio
- **UI components**: Minimum 3:1 contrast ratio
- **Grade colors**: Selected for optimal visibility on dark backgrounds

---

## 🌙 Dark Theme Integration

### **Color System Extension**
```css
:root {
  /* Progress System Colors */
  --progress-primary: #3B82F6;     /* Blue-500 */
  --progress-secondary: #8B5CF6;   /* Violet-500 */
  --progress-success: #10B981;     /* Emerald-500 */
  --progress-warning: #F59E0B;     /* Amber-500 */
  --progress-error: #EF4444;       /* Red-500 */
  
  /* Achievement Colors */
  --achievement-gold: #FCD34D;     /* Yellow-300 */
  --achievement-silver: #D1D5DB;   /* Gray-300 */
  --achievement-bronze: #F97316;   /* Orange-500 */
  
  /* Level Colors */
  --level-beginner: #84CC16;       /* Lime-500 */
  --level-intermediate: #3B82F6;   /* Blue-500 */
  --level-advanced: #8B5CF6;       /* Violet-500 */
  --level-expert: #EC4899;         /* Pink-500 */
}
```

### **Component Theme Integration**
```tsx
// Theme-aware component styling
const getThemeClasses = (color: string) => ({
  background: `bg-${color}-500/10`,
  border: `border-${color}-500/30`,
  text: `text-${color}-400`,
  hover: `hover:bg-${color}-500/20`
});
```

This comprehensive UI specification ensures the Progress System integrates seamlessly with AIdioma's existing design while providing enhanced visual feedback for user progress and achievements! 🎨
