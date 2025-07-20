# Analytics Components
## Progress Tracking and Statistics Display

*Components for displaying learning analytics, progress metrics, and performance statistics across all pages.*

---

## 📊 **Stats Box Component**

### **Core Statistics Display**
```typescript
interface StatsBoxProps {
  icon: React.ComponentType<{ className?: string }>
  iconColor: string
  value: string | number
  label: string
  className?: string
}

export function StatsBox({ icon: Icon, iconColor, value, label, className = '' }: StatsBoxProps) {
  return (
    <div className={`flex items-center gap-3 p-2 md:p-3 bg-muted rounded-lg ${className}`}>
      <Icon className={`w-6 h-6 ${iconColor}`} />
      <div>
        <div className="text-base md:text-lg font-semibold text-foreground">
          {value}
        </div>
        <div className="text-xs text-muted-foreground">{label}</div>
      </div>
    </div>
  )
}
```

### **Usage Example**
```tsx
// Practice page stats implementation
<div className="flex justify-center">
  <div className="grid grid-cols-2 md:grid-cols-4 gap-3 max-w-2xl">
    <StatsBox
      icon={BookOpen}
      iconColor="text-blue-500"
      value={`${currentSentence}/${totalSentences}`}
      label="Sentences"
    />
    <StatsBox
      icon={CheckCircle}
      iconColor="text-green-500"
      value={correctCount}
      label="Correct"
    />
    <StatsBox
      icon={Zap}
      iconColor="text-purple-500"
      value={streak}
      label="Streak"
    />
    <StatsBox
      icon={Target}
      iconColor="text-orange-500"
      value={`${accuracy}%`}
      label="Accuracy"
    />
  </div>
</div>
```

---

## 📈 **Session Stats Component**

### **Real-time Session Analytics**
```typescript
interface SessionStatsProps {
  currentSentence: number
  totalSentences: number
  correctCount: number
  streak: number
  accuracy: number
  timeSpent: number // in minutes
  className?: string
}

export function SessionStats({
  currentSentence,
  totalSentences,
  correctCount,
  streak,
  accuracy,
  timeSpent,
  className = ''
}: SessionStatsProps) {
  return (
    <div className={`bg-card border border-border rounded-lg p-4 ${className}`}>
      <h3 className="text-sm font-medium text-muted-foreground mb-3">Session Progress</h3>
      
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        <StatsBox
          icon={BookOpen}
          iconColor="text-blue-500"
          value={`${currentSentence}/${totalSentences}`}
          label="Progress"
        />
        <StatsBox
          icon={CheckCircle}
          iconColor="text-green-500"
          value={correctCount}
          label="Correct"
        />
        <StatsBox
          icon={Zap}
          iconColor="text-purple-500"
          value={streak}
          label="Streak"
        />
        <StatsBox
          icon={Target}
          iconColor="text-orange-500"
          value={`${accuracy}%`}
          label="Accuracy"
        />
        <StatsBox
          icon={Clock}
          iconColor="text-yellow-500"
          value={`${timeSpent}m`}
          label="Time"
        />
        <StatsBox
          icon={TrendingUp}
          iconColor="text-indigo-500"
          value={Math.round(correctCount / Math.max(timeSpent, 1))}
          label="Per Min"
        />
      </div>
    </div>
  )
}
```

---

## 🏆 **Achievement Badge Component**

### **Gamification Progress Display**
```typescript
interface AchievementBadgeProps {
  title: string
  description: string
  icon: React.ComponentType<{ className?: string }>
  progress?: number
  maxProgress?: number
  completed?: boolean
  rarity?: 'common' | 'rare' | 'epic' | 'legendary'
}

export function AchievementBadge({
  title,
  description,
  icon: Icon,
  progress = 0,
  maxProgress = 100,
  completed = false,
  rarity = 'common'
}: AchievementBadgeProps) {
  const rarityColors = {
    common: 'border-gray-500 bg-gray-800',
    rare: 'border-blue-500 bg-blue-900/20',
    epic: 'border-purple-500 bg-purple-900/20',
    legendary: 'border-yellow-500 bg-yellow-900/20'
  }
  
  const iconColors = {
    common: 'text-gray-400',
    rare: 'text-blue-400',
    epic: 'text-purple-400',
    legendary: 'text-yellow-400'
  }
  
  return (
    <div className={`p-4 border-2 rounded-lg ${rarityColors[rarity]} ${completed ? 'opacity-100' : 'opacity-60'}`}>
      <div className="flex items-start space-x-3">
        <Icon className={`w-8 h-8 ${iconColors[rarity]} mt-1`} />
        <div className="flex-1">
          <h4 className="font-semibold text-white">{title}</h4>
          <p className="text-sm text-gray-400 mb-2">{description}</p>
          
          {!completed && maxProgress > 0 && (
            <div className="space-y-1">
              <div className="flex justify-between text-xs text-gray-400">
                <span>Progress</span>
                <span>{progress}/{maxProgress}</span>
              </div>
              <div className="w-full bg-gray-700 rounded-full h-2">
                <div 
                  className={`h-2 rounded-full transition-all duration-300 ${
                    rarity === 'legendary' ? 'bg-yellow-500' :
                    rarity === 'epic' ? 'bg-purple-500' :
                    rarity === 'rare' ? 'bg-blue-500' : 'bg-gray-500'
                  }`}
                  style={{ width: `${(progress / maxProgress) * 100}%` }}
                />
              </div>
            </div>
          )}
          
          {completed && (
            <div className="text-xs text-green-400 font-medium">
              ✅ Completed
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
```

---

## 📋 **Performance Chart Component**

### **Learning Trends Visualization**
```typescript
interface PerformanceChartProps {
  data: Array<{
    date: string
    score: number
    accuracy: number
    timeSpent: number
  }>
  metric: 'score' | 'accuracy' | 'timeSpent'
  title: string
  className?: string
}

export function PerformanceChart({ data, metric, title, className = '' }: PerformanceChartProps) {
  const maxValue = Math.max(...data.map(d => d[metric]))
  const minValue = Math.min(...data.map(d => d[metric]))
  
  return (
    <div className={`bg-card border border-border rounded-lg p-4 ${className}`}>
      <h3 className="text-sm font-medium text-muted-foreground mb-4">{title}</h3>
      
      <div className="relative h-32">
        {/* Simple line chart visualization */}
        <svg className="w-full h-full" viewBox="0 0 300 100">
          <defs>
            <linearGradient id="chartGradient" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="rgb(59, 130, 246)" stopOpacity="0.3" />
              <stop offset="100%" stopColor="rgb(59, 130, 246)" stopOpacity="0" />
            </linearGradient>
          </defs>
          
          {/* Chart line */}
          <polyline
            fill="none"
            stroke="rgb(59, 130, 246)"
            strokeWidth="2"
            points={data.map((d, i) => {
              const x = (i / (data.length - 1)) * 280 + 10
              const y = 90 - ((d[metric] - minValue) / (maxValue - minValue)) * 80
              return `${x},${y}`
            }).join(' ')}
          />
          
          {/* Chart area fill */}
          <polygon
            fill="url(#chartGradient)"
            points={[
              '10,90',
              ...data.map((d, i) => {
                const x = (i / (data.length - 1)) * 280 + 10
                const y = 90 - ((d[metric] - minValue) / (maxValue - minValue)) * 80
                return `${x},${y}`
              }),
              '290,90'
            ].join(' ')}
          />
        </svg>
      </div>
      
      {/* Chart summary */}
      <div className="flex justify-between text-xs text-gray-400 mt-2">
        <span>7 days ago</span>
        <span className="text-blue-400">
          Latest: {data[data.length - 1]?.[metric]}
        </span>
        <span>Today</span>
      </div>
    </div>
  )
}
```

---

## 🎯 **Component Standards**

### **Icon Standards**
- **Size**: `w-6 h-6` (24px) for enhanced visibility in stats
- **Colors**: Semantic colors (blue, green, purple, orange, yellow) for different metrics
- **Spacing**: `gap-3` (12px) between icon and text for better visual balance

### **Color Coding**
- **Blue**: Progress/Navigation (sentences, paragraphs)
- **Green**: Success/Accuracy (correct answers, completion)
- **Purple**: Engagement (streaks, consistency)
- **Orange**: Performance (accuracy percentages, targets)
- **Yellow**: Time-based (session duration, speed)
- **Indigo**: Derived metrics (calculated values)

### **Responsive Behavior**
- **Mobile**: 2-column grid for stats
- **Tablet**: 3-column grid for balanced layout
- **Desktop**: 4-6 column grid for full visibility
- **Text Scaling**: Responsive text sizes with `md:` breakpoints 