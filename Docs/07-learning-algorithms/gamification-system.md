# Gamification System
## Points, Streaks, Levels, and Achievement Engine

---

## 🎯 **Module Overview**

The Gamification System provides consistent motivation across all 6 AIdioma pages through points, streaks, level progression, and achievement tracking.

### **Core API**
```typescript
interface GamificationService {
  // Points calculation
  calculatePoints(activity: ActivityType, performance: Performance): Promise<PointsResult>
  
  // Streak management
  updateStreak(userId: string, activityDate: Date): Promise<StreakStatus>
  
  // Level progression
  checkLevelUp(userId: string): Promise<LevelProgression>
  
  // Achievement system
  triggerAchievements(userId: string, activity: ActivityType, data: any): Promise<Achievement[]>
}
```

---

## 📊 **Points System Implementation**

### **Activity-Based Point Calculation**
```typescript
type ActivityType = 'translation' | 'reading' | 'conversation' | 'flashcard'

interface Performance {
  accuracy: number        // 0.0 to 1.0
  hintsUsed: number      // Number of hints used
  timeSpent: number      // Seconds taken
  difficulty: number     // 1-9 difficulty level
}

interface PointsResult {
  basePoints: number
  bonusPoints: number
  penaltyPoints: number
  totalPoints: number
  multipliers: PointsMultiplier[]
}

function calculatePoints(activity: ActivityType, performance: Performance): PointsResult {
  const basePoints = getBasePoints(activity, performance.difficulty)
  const accuracyBonus = performance.accuracy * 2.0
  const hintPenalty = performance.hintsUsed * getHintPenalty(performance.hintsUsed)
  const speedBonus = calculateSpeedBonus(performance.timeSpent, activity)
  
  return {
    basePoints,
    bonusPoints: accuracyBonus + speedBonus,
    penaltyPoints: hintPenalty,
    totalPoints: Math.max(0.1, basePoints + accuracyBonus + speedBonus - hintPenalty),
    multipliers: getActiveMultipliers(activity)
  }
}

// Base points by activity and difficulty
function getBasePoints(activity: ActivityType, difficulty: number): number {
  const baseRates = {
    translation: 10,    // 10 points per sentence
    reading: 5,         // 5 points per sentence read
    conversation: 15,   // 15 points per conversation turn
    flashcard: 3        // 3 points per card reviewed
  }
  
  return baseRates[activity] * (1 + (difficulty - 1) * 0.1) // +10% per difficulty level
}
```

### **Hint Penalty Calculation**
```typescript
function getHintPenalty(hintsUsed: number): number {
  const penalties = [0, 1.0, 1.5, 2.0] // Progressive penalties
  if (hintsUsed >= penalties.length) {
    return penalties[penalties.length - 1] + (hintsUsed - penalties.length + 1) * 0.5
  }
  return penalties[hintsUsed] || 0
}
```

---

## 🔥 **Streak System Implementation**

### **Streak Types and Logic**
```typescript
interface StreakStatus {
  currentStreak: number
  longestStreak: number
  streakType: 'learning' | 'perfect' | 'broken'
  lastActivity: Date
  streakRecovery?: StreakRecovery
}

interface StreakRecovery {
  grace_period_hours: number
  recovery_activity_required: ActivityType
  recovery_deadline: Date
}

async function updateStreak(userId: string, activityDate: Date): Promise<StreakStatus> {
  const user = await storage.getUser(userId)
  const lastActivity = user.lastPracticeDate
  const hoursSinceLastActivity = (activityDate.getTime() - lastActivity.getTime()) / (1000 * 60 * 60)
  
  if (hoursSinceLastActivity <= 24) {
    // Maintain streak
    return {
      currentStreak: user.streakCount + 1,
      longestStreak: Math.max(user.longestStreak || 0, user.streakCount + 1),
      streakType: 'learning',
      lastActivity: activityDate
    }
  } else if (hoursSinceLastActivity <= 48) {
    // Grace period - offer streak recovery
    return {
      currentStreak: user.streakCount,
      longestStreak: user.longestStreak || 0,
      streakType: 'broken',
      lastActivity: activityDate,
      streakRecovery: {
        grace_period_hours: 24,
        recovery_activity_required: 'translation',
        recovery_deadline: new Date(Date.now() + 24 * 60 * 60 * 1000)
      }
    }
  } else {
    // Streak broken - start over
    return {
      currentStreak: 1,
      longestStreak: user.longestStreak || 0,
      streakType: 'learning',
      lastActivity: activityDate
    }
  }
}
```

---

## 📈 **Level Progression System**

### **Level Calculation and Progression**
```typescript
interface LevelProgression {
  currentLevel: number
  currentPoints: number
  pointsToNextLevel: number
  levelUpRewards?: LevelReward[]
  newAbilitiesUnlocked?: string[]
}

interface LevelReward {
  type: 'points' | 'multiplier' | 'feature_unlock' | 'achievement'
  value: number | string
  description: string
}

function calculateLevel(totalPoints: number): number {
  // Exponential level progression: Level = floor(sqrt(points / 100))
  return Math.floor(Math.sqrt(totalPoints / 100)) + 1
}

function getPointsForLevel(level: number): number {
  // Points required for level: (level - 1)^2 * 100
  return Math.pow(level - 1, 2) * 100
}

async function checkLevelUp(userId: string): Promise<LevelProgression> {
  const user = await storage.getUser(userId)
  const newLevel = calculateLevel(user.totalPoints)
  const currentLevel = user.currentLevel || 1
  
  const progression: LevelProgression = {
    currentLevel: newLevel,
    currentPoints: user.totalPoints,
    pointsToNextLevel: getPointsForLevel(newLevel + 1) - user.totalPoints
  }
  
  if (newLevel > currentLevel) {
    progression.levelUpRewards = getLevelRewards(newLevel)
    progression.newAbilitiesUnlocked = getUnlockedFeatures(newLevel)
    
    // Update user level
    await storage.updateUser(userId, { currentLevel: newLevel })
  }
  
  return progression
}
```

---

## 🏆 **Achievement System Implementation**

### **Achievement Definitions and Triggers**
```typescript
interface Achievement {
  id: string
  name: string
  description: string
  icon: string
  category: 'progress' | 'streak' | 'skill' | 'exploration'
  points: number
  rarity: 'common' | 'rare' | 'epic' | 'legendary'
  unlocked: boolean
  unlockedAt?: Date
}

const ACHIEVEMENTS: Achievement[] = [
  {
    id: 'first_translation',
    name: 'First Steps',
    description: 'Complete your first translation',
    icon: '🎯',
    category: 'progress',
    points: 50,
    rarity: 'common'
  },
  {
    id: 'week_streak',
    name: 'Consistent Learner',
    description: 'Maintain a 7-day learning streak',
    icon: '🔥',
    category: 'streak',
    points: 200,
    rarity: 'rare'
  },
  {
    id: 'no_hints_master',
    name: 'Independent Thinker',
    description: 'Complete 10 sentences without using hints',
    icon: '🧠',
    category: 'skill',
    points: 300,
    rarity: 'epic'
  }
]

async function triggerAchievements(userId: string, activity: ActivityType, data: any): Promise<Achievement[]> {
  const userProgress = await storage.getUserProgress(userId)
  const unlockedAchievements: Achievement[] = []
  
  for (const achievement of ACHIEVEMENTS) {
    if (await checkAchievementCondition(achievement, userProgress, activity, data)) {
      const unlocked = await unlockAchievement(userId, achievement.id)
      if (unlocked) {
        unlockedAchievements.push({
          ...achievement,
          unlocked: true,
          unlockedAt: new Date()
        })
      }
    }
  }
  
  return unlockedAchievements
}
```

### **Achievement Condition Checking**
```typescript
async function checkAchievementCondition(
  achievement: Achievement, 
  userProgress: UserProgress, 
  activity: ActivityType, 
  data: any
): Promise<boolean> {
  switch (achievement.id) {
    case 'first_translation':
      return activity === 'translation' && userProgress.totalSentences === 1
      
    case 'week_streak':
      return userProgress.streakCount >= 7
      
    case 'no_hints_master':
      return userProgress.sentencesWithoutHints >= 10
      
    case 'conversation_starter':
      return activity === 'conversation' && userProgress.conversationTurns === 1
      
    case 'speed_demon':
      return activity === 'translation' && data.timeSpent < 30 && data.accuracy > 0.9
      
    default:
      return false
  }
}
```

---

## 🎮 **React Components Integration**

### **Points Display Component**
```typescript
interface PointsDisplayProps {
  userId: string
  recentActivity?: ActivityType
}

export function PointsDisplay({ userId, recentActivity }: PointsDisplayProps) {
  const [points, setPoints] = useState(0)
  const [recentGain, setRecentGain] = useState<number | null>(null)
  
  const { data: userProgress } = useQuery({
    queryKey: ['userProgress', userId],
    queryFn: () => storage.getUserProgress(userId)
  })
  
  useEffect(() => {
    if (userProgress?.totalPoints) {
      setPoints(userProgress.totalPoints)
    }
  }, [userProgress])
  
  return (
    <div className="points-display">
      <div className="points-value">
        ⭐ {points.toLocaleString()} pts
        {recentGain && (
          <span className="recent-gain animate-bounce">
            +{recentGain}
          </span>
        )}
      </div>
    </div>
  )
}
```

### **Streak Display Component**
```typescript
export function StreakDisplay({ userId }: { userId: string }) {
  const { data: streakStatus } = useQuery({
    queryKey: ['streak', userId],
    queryFn: () => gamificationService.getStreakStatus(userId)
  })
  
  if (!streakStatus) return null
  
  return (
    <div className={`streak-display ${streakStatus.streakType}`}>
      <div className="streak-icon">
        {streakStatus.streakType === 'broken' ? '💔' : '🔥'}
      </div>
      <div className="streak-info">
        <span className="streak-count">{streakStatus.currentStreak} day streak</span>
        {streakStatus.streakRecovery && (
          <span className="recovery-notice">
            Practice within {streakStatus.streakRecovery.grace_period_hours}h to recover!
          </span>
        )}
      </div>
    </div>
  )
}
```

### **Achievement Notification Component**
```typescript
interface AchievementNotificationProps {
  achievement: Achievement
  onClose: () => void
}

export function AchievementNotification({ achievement, onClose }: AchievementNotificationProps) {
  useEffect(() => {
    const timer = setTimeout(onClose, 5000) // Auto-close after 5 seconds
    return () => clearTimeout(timer)
  }, [onClose])
  
  return (
    <div className="achievement-notification animate-slide-up">
      <div className="achievement-header">
        <span className="achievement-icon">{achievement.icon}</span>
        <span className="achievement-text">Achievement Unlocked!</span>
      </div>
      <div className="achievement-details">
        <h3 className="achievement-name">{achievement.name}</h3>
        <p className="achievement-description">{achievement.description}</p>
        <span className="achievement-points">+{achievement.points} points</span>
      </div>
    </div>
  )
}
```

---

## 📊 **Database Integration**

### **Storage Interface Methods**
```typescript
interface IGamificationStorage {
  // Points tracking
  updateUserPoints(userId: string, pointsToAdd: number): Promise<void>
  getUserPoints(userId: string): Promise<number>
  
  // Streak management
  updateUserStreak(userId: string, streakData: StreakStatus): Promise<void>
  getUserStreak(userId: string): Promise<StreakStatus>
  
  // Achievement tracking
  unlockAchievement(userId: string, achievementId: string): Promise<boolean>
  getUserAchievements(userId: string): Promise<Achievement[]>
  
  // Level progression
  updateUserLevel(userId: string, level: number): Promise<void>
  getUserLevel(userId: string): Promise<number>
}
```

---

## 🎯 **Integration Points**

### **Practice Page Integration**
```typescript
// In translation evaluation handler
const pointsResult = await gamificationService.calculatePoints('translation', {
  accuracy: evaluationResult.score / 10,
  hintsUsed: hintUsage.count,
  timeSpent: sessionData.timeSpent,
  difficulty: sentence.difficultyLevel
})

const achievements = await gamificationService.triggerAchievements(userId, 'translation', {
  accuracy: pointsResult.totalPoints,
  timeSpent: sessionData.timeSpent,
  hintsUsed: hintUsage.count
})

// Update UI with points and achievements
updateUserProgress(pointsResult, achievements)
```

### **Cross-Page Consistency**
```typescript
// Use same gamification service across all pages
const gamificationService = new GamificationService(storage)

// Text page reading points
await gamificationService.calculatePoints('reading', readingPerformance)

// Conversation page points
await gamificationService.calculatePoints('conversation', conversationPerformance)

// Flash card points
await gamificationService.calculatePoints('flashcard', cardPerformance)
```

---

This gamification system provides consistent motivation across all AIdioma features while tracking meaningful learning progress and encouraging positive study habits.