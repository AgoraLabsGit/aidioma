# Cross-Page Integration Patterns
## Universal Activity Tracking & Unified Analytics Architecture

*Complete system integration guide for cross-page data flow, unified progress tracking, and analytics aggregation across all learning modalities.*

**Location**: `Docs/05-development/cross-page-integration.md`

---

## 🎯 **Integration Architecture Overview**

This guide implements the universal activity tracking system that enables unified progress tracking, cross-page goals, and comprehensive analytics across Practice, Reading, Memorize, and Conversation pages.

### **Core Integration Principles**
- **Universal Events**: Standardized activity events from all pages
- **Unified Goals**: Cross-page goal tracking and progress aggregation
- **Real-Time Updates**: Immediate progress updates across all learning activities
- **Cost-Aware Analytics**: Integration with AI cost optimization metrics

---

## 📊 **Database Schema for Universal Tracking**

### **Universal Activity Events Schema**

```typescript
// shared/schema.ts - ADD TO EXISTING SCHEMA
import { sqliteTable, text, integer, real, index } from 'drizzle-orm/sqlite-core'

// 🆕 NEW TABLE: Universal activity events
export const universalActivityEvents = sqliteTable('universal_activity_events', {
  id: text('id').primaryKey(),
  userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  
  // Activity classification
  activityType: text('activity_type').notNull(), // 'sentence_translated', 'word_memorized', 'conversation_turn'
  contentType: text('content_type').notNull(),   // 'practice', 'reading', 'memorize', 'conversation'
  pageSource: text('page_source').notNull(),     // Which page generated this event
  
  // Universal performance metrics
  score: integer('score').notNull(),              // 0-100 score
  hintsUsed: integer('hints_used').default(0),
  timeSpent: integer('time_spent').notNull(),     // milliseconds
  difficultyLevel: integer('difficulty_level'),
  attemptsRequired: integer('attempts_required').default(1),
  
  // Content metadata
  contentId: text('content_id'),                  // sentence_id, flashcard_id, conversation_id
  grammarConcepts: text('grammar_concepts', { mode: 'json' }), // ['present_tense', 'ser_vs_estar']
  vocabularyWords: text('vocabulary_words', { mode: 'json' }), // ['caminar', 'mesa', 'gusta']
  
  // AI cost tracking integration
  aiResponseType: text('ai_response_type'),       // 'cached', 'similarity', 'ai'
  aiCost: real('ai_cost'),                       // Cost in dollars
  aiResponseTime: integer('ai_response_time'),    // Response time in ms
  
  // Goal contribution tracking
  contributesToDaily: text('contributes_to_daily', { mode: 'json' }),   // ['sentences_translated', 'practice_minutes']
  contributesToWeekly: text('contributes_to_weekly', { mode: 'json' }), // ['learning_streak', 'total_score']
  contributesToMonthly: text('contributes_to_monthly', { mode: 'json' }), // ['skill_advancement']
  
  // Session context
  sessionId: text('session_id'),                  // Groups activities by session
  deviceType: text('device_type'),               // 'desktop', 'mobile', 'tablet'
  
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
}, (table) => ({
  userIdIdx: index('activity_user_id_idx').on(table.userId),
  contentTypeIdx: index('activity_content_type_idx').on(table.contentType),
  createdAtIdx: index('activity_created_at_idx').on(table.createdAt),
  sessionIdIdx: index('activity_session_id_idx').on(table.sessionId),
}))

// 🆕 NEW TABLE: Cross-page unified goals
export const unifiedGoals = sqliteTable('unified_goals', {
  id: text('id').primaryKey(),
  userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  
  // Goal definition
  goalType: text('goal_type').notNull(),          // 'daily', 'weekly', 'monthly'
  goalCategory: text('goal_category').notNull(),  // 'sentences_translated', 'words_memorized', 'conversation_turns'
  targetValue: integer('target_value').notNull(),
  currentValue: integer('current_value').default(0),
  
  // Goal metadata
  title: text('title').notNull(),                 // Human-readable goal title
  description: text('description'),               // Goal description
  icon: text('icon'),                            // Icon identifier
  
  // Time boundaries
  startDate: integer('start_date', { mode: 'timestamp' }).notNull(),
  endDate: integer('end_date', { mode: 'timestamp' }).notNull(),
  
  // Goal status
  isActive: integer('is_active', { mode: 'boolean' }).default(true),
  completedAt: integer('completed_at', { mode: 'timestamp' }),
  achievementUnlocked: text('achievement_unlocked'), // Reference to achievement
  
  // Progress tracking
  progressHistory: text('progress_history', { mode: 'json' }), // Daily progress snapshots
  
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull(),
}, (table) => ({
  userGoalTypeIdx: index('unified_goals_user_type_idx').on(table.userId, table.goalType),
  activeGoalsIdx: index('unified_goals_active_idx').on(table.userId, table.isActive),
}))

// 🆕 NEW TABLE: Cross-page analytics aggregations
export const analyticsAggregations = sqliteTable('analytics_aggregations', {
  id: text('id').primaryKey(),
  userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  
  // Aggregation metadata
  aggregationType: text('aggregation_type').notNull(), // 'daily', 'weekly', 'monthly'
  aggregationDate: integer('aggregation_date', { mode: 'timestamp' }).notNull(),
  
  // Cross-page activity metrics
  totalActivities: integer('total_activities').default(0),
  totalTimeSpent: integer('total_time_spent').default(0), // milliseconds
  averageScore: real('average_score').default(0),
  totalPoints: integer('total_points').default(0),
  
  // Page-specific breakdowns
  practiceMetrics: text('practice_metrics', { mode: 'json' }),   // {activities: 10, avgScore: 85, timeSpent: 1200000}
  readingMetrics: text('reading_metrics', { mode: 'json' }),     // {activities: 5, avgScore: 90, timeSpent: 800000}
  memorizeMetrics: text('memorize_metrics', { mode: 'json' }),   // {activities: 15, avgScore: 75, timeSpent: 600000}
  conversationMetrics: text('conversation_metrics', { mode: 'json' }), // {activities: 3, avgScore: 80, timeSpent: 400000}
  
  // AI cost analytics
  totalAICost: real('total_ai_cost').default(0),
  totalAISavings: real('total_ai_savings').default(0),
  cacheHitRate: real('cache_hit_rate').default(0),
  averageResponseTime: integer('average_response_time').default(0),
  
  // Learning progress indicators
  goalsCompleted: integer('goals_completed').default(0),
  achievementsUnlocked: integer('achievements_unlocked').default(0),
  streakDays: integer('streak_days').default(0),
  
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
}, (table) => ({
  userDateIdx: index('analytics_user_date_idx').on(table.userId, table.aggregationDate),
  typeIdx: index('analytics_type_idx').on(table.aggregationType),
}))

// Export TypeScript types
export type UniversalActivityEvent = typeof universalActivityEvents.$inferSelect
export type NewUniversalActivityEvent = typeof universalActivityEvents.$inferInsert
export type UnifiedGoal = typeof unifiedGoals.$inferSelect
export type NewUnifiedGoal = typeof unifiedGoals.$inferInsert
export type AnalyticsAggregation = typeof analyticsAggregations.$inferSelect
export type NewAnalyticsAggregation = typeof analyticsAggregations.$inferInsert
```

---

## 🔄 **Universal Activity Service**

### **Core Activity Tracking Service**

```typescript
// server/src/services/universal-activity-service.ts
import { db } from '../database'
import { universalActivityEvents, unifiedGoals, analyticsAggregations } from '../../../shared/schema'
import { eq, and, gte, lte, desc, sum, avg, count } from 'drizzle-orm'

export interface ActivityEventInput {
  userId: string
  activityType: string
  contentType: 'practice' | 'reading' | 'memorize' | 'conversation'
  pageSource: string
  score: number
  hintsUsed?: number
  timeSpent: number
  difficultyLevel?: number
  contentId?: string
  grammarConcepts?: string[]
  vocabularyWords?: string[]
  aiResponseType?: 'cached' | 'similarity' | 'ai'
  aiCost?: number
  aiResponseTime?: number
  sessionId?: string
  deviceType?: string
}

export interface ActivityResult {
  activityId: string
  goalsUpdated: string[]
  goalsCompleted: string[]
  achievements?: string[]
  nextGoalProgress?: {
    goalId: string
    title: string
    progress: number
    target: number
    percentComplete: number
  }[]
}

export class UniversalActivityService {
  // 📊 Record activity and update all related systems
  async recordActivity(input: ActivityEventInput): Promise<ActivityResult> {
    const activityId = `activity_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    
    // 1. Calculate goal contributions
    const goalContributions = this.calculateGoalContributions(input)
    
    // 2. Create activity event
    const activityEvent: NewUniversalActivityEvent = {
      id: activityId,
      userId: input.userId,
      activityType: input.activityType,
      contentType: input.contentType,
      pageSource: input.pageSource,
      score: input.score,
      hintsUsed: input.hintsUsed || 0,
      timeSpent: input.timeSpent,
      difficultyLevel: input.difficultyLevel,
      attemptsRequired: 1,
      contentId: input.contentId,
      grammarConcepts: JSON.stringify(input.grammarConcepts || []),
      vocabularyWords: JSON.stringify(input.vocabularyWords || []),
      aiResponseType: input.aiResponseType,
      aiCost: input.aiCost,
      aiResponseTime: input.aiResponseTime,
      contributesToDaily: JSON.stringify(goalContributions.daily),
      contributesToWeekly: JSON.stringify(goalContributions.weekly),
      contributesToMonthly: JSON.stringify(goalContributions.monthly),
      sessionId: input.sessionId || this.generateSessionId(),
      deviceType: input.deviceType || 'desktop',
      createdAt: new Date()
    }

    await db.insert(universalActivityEvents).values(activityEvent)

    // 3. Update unified goals
    const { goalsUpdated, goalsCompleted } = await this.updateUnifiedGoals(input.userId, goalContributions)

    // 4. Update analytics aggregations
    await this.updateAnalyticsAggregations(input.userId, input)

    // 5. Check for achievements
    const achievements = await this.checkAchievements(input.userId, input)

    // 6. Get next goal progress for UI feedback
    const nextGoalProgress = await this.getNextGoalProgress(input.userId)

    return {
      activityId,
      goalsUpdated,
      goalsCompleted,
      achievements,
      nextGoalProgress
    }
  }

  // 🎯 Calculate which goals this activity contributes to
  private calculateGoalContributions(input: ActivityEventInput) {
    const contributions = {
      daily: [] as string[],
      weekly: [] as string[],
      monthly: [] as string[]
    }

    // Universal contributions (all activities)
    contributions.daily.push('practice_minutes', 'activities_completed')
    contributions.weekly.push('learning_streak', 'total_score', 'total_time')
    contributions.monthly.push('skill_advancement', 'consistency_score')

    // Content-specific contributions
    switch (input.contentType) {
      case 'practice':
        contributions.daily.push('sentences_translated', 'grammar_practice')
        contributions.weekly.push('grammar_concepts_practiced', 'translation_accuracy')
        contributions.monthly.push('grammar_mastery')
        break
        
      case 'reading':
        contributions.daily.push('reading_time', 'texts_engaged')
        contributions.weekly.push('reading_comprehension', 'texts_completed')
        contributions.monthly.push('reading_fluency', 'vocabulary_expansion')
        break
        
      case 'memorize':
        contributions.daily.push('cards_reviewed', 'vocabulary_practice')
        contributions.weekly.push('words_memorized', 'retention_rate')
        contributions.monthly.push('vocabulary_mastery', 'spaced_repetition_consistency')
        break
        
      case 'conversation':
        contributions.daily.push('conversation_turns', 'speaking_practice')
        contributions.weekly.push('conversation_duration', 'dialogue_completed')
        contributions.monthly.push('conversation_fluency', 'communication_confidence')
        break
    }

    // Score-based contributions
    if (input.score >= 80) {
      contributions.daily.push('high_accuracy_activities')
      contributions.weekly.push('mastery_demonstrations')
    }

    // AI cost efficiency contributions
    if (input.aiResponseType === 'cached') {
      contributions.daily.push('cache_efficiency')
    }

    return contributions
  }

  // 🏆 Update unified goals across all pages
  private async updateUnifiedGoals(userId: string, contributions: any): Promise<{
    goalsUpdated: string[]
    goalsCompleted: string[]
  }> {
    const goalsUpdated: string[] = []
    const goalsCompleted: string[] = []
    const today = new Date()
    
    // Get active goals for this user
    const activeGoals = await db.select()
      .from(unifiedGoals)
      .where(
        and(
          eq(unifiedGoals.userId, userId),
          eq(unifiedGoals.isActive, true),
          lte(unifiedGoals.startDate, today),
          gte(unifiedGoals.endDate, today)
        )
      )

    // Update each relevant goal
    for (const goal of activeGoals) {
      const contributionList = contributions[goal.goalType] || []
      
      if (contributionList.includes(goal.goalCategory)) {
        // Calculate increment based on goal type
        const increment = this.getGoalIncrement(goal.goalCategory)
        const newValue = goal.currentValue + increment
        const isCompleted = newValue >= goal.targetValue

        // Update progress history
        const progressHistory = goal.progressHistory ? JSON.parse(goal.progressHistory) : []
        progressHistory.push({
          date: today.toISOString().split('T')[0],
          value: newValue,
          increment: increment
        })

        await db.update(unifiedGoals)
          .set({
            currentValue: newValue,
            completedAt: isCompleted ? new Date() : null,
            progressHistory: JSON.stringify(progressHistory),
            updatedAt: new Date()
          })
          .where(eq(unifiedGoals.id, goal.id))

        goalsUpdated.push(goal.id)
        
        if (isCompleted) {
          goalsCompleted.push(goal.id)
        }
      }
    }

    return { goalsUpdated, goalsCompleted }
  }

  // 📈 Update analytics aggregations for real-time dashboard
  private async updateAnalyticsAggregations(userId: string, input: ActivityEventInput): Promise<void> {
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    // Update daily aggregation
    await this.updateAggregation(userId, 'daily', today, input)
    
    // Update weekly aggregation (start of week)
    const weekStart = new Date(today)
    weekStart.setDate(today.getDate() - today.getDay())
    await this.updateAggregation(userId, 'weekly', weekStart, input)
    
    // Update monthly aggregation (start of month)
    const monthStart = new Date(today.getFullYear(), today.getMonth(), 1)
    await this.updateAggregation(userId, 'monthly', monthStart, input)
  }

  private async updateAggregation(
    userId: string, 
    type: 'daily' | 'weekly' | 'monthly', 
    date: Date, 
    input: ActivityEventInput
  ): Promise<void> {
    // Check if aggregation exists
    const existing = await db.select()
      .from(analyticsAggregations)
      .where(
        and(
          eq(analyticsAggregations.userId, userId),
          eq(analyticsAggregations.aggregationType, type),
          eq(analyticsAggregations.aggregationDate, date)
        )
      )
      .limit(1)

    if (existing.length === 0) {
      // Create new aggregation
      const pageMetrics = this.createPageMetrics(input)
      
      await db.insert(analyticsAggregations).values({
        id: `agg_${type}_${userId}_${date.getTime()}`,
        userId,
        aggregationType: type,
        aggregationDate: date,
        totalActivities: 1,
        totalTimeSpent: input.timeSpent,
        averageScore: input.score,
        totalPoints: input.score,
        [input.contentType + 'Metrics']: JSON.stringify(pageMetrics),
        totalAICost: input.aiCost || 0,
        totalAISavings: this.calculateSavings(input.aiResponseType, input.aiCost),
        cacheHitRate: input.aiResponseType === 'cached' ? 1 : 0,
        averageResponseTime: input.aiResponseTime || 0,
        createdAt: new Date()
      })
    } else {
      // Update existing aggregation
      const current = existing[0]
      const newTotalActivities = current.totalActivities + 1
      const newTotalTimeSpent = current.totalTimeSpent + input.timeSpent
      const newAverageScore = ((current.averageScore * current.totalActivities) + input.score) / newTotalActivities
      
      // Update page-specific metrics
      const pageKey = input.contentType + 'Metrics' as keyof AnalyticsAggregation
      const currentPageMetrics = current[pageKey] ? JSON.parse(current[pageKey] as string) : { activities: 0, totalScore: 0, totalTime: 0 }
      const updatedPageMetrics = {
        activities: currentPageMetrics.activities + 1,
        totalScore: currentPageMetrics.totalScore + input.score,
        totalTime: currentPageMetrics.totalTime + input.timeSpent,
        avgScore: (currentPageMetrics.totalScore + input.score) / (currentPageMetrics.activities + 1)
      }

      await db.update(analyticsAggregations)
        .set({
          totalActivities: newTotalActivities,
          totalTimeSpent: newTotalTimeSpent,
          averageScore: newAverageScore,
          totalPoints: current.totalPoints + input.score,
          [pageKey]: JSON.stringify(updatedPageMetrics),
          totalAICost: current.totalAICost + (input.aiCost || 0),
          totalAISavings: current.totalAISavings + this.calculateSavings(input.aiResponseType, input.aiCost),
          cacheHitRate: this.updateCacheHitRate(current, input.aiResponseType),
          averageResponseTime: this.updateAverageResponseTime(current, input.aiResponseTime)
        })
        .where(eq(analyticsAggregations.id, current.id))
    }
  }

  // 📊 Utility methods for analytics calculations
  private createPageMetrics(input: ActivityEventInput) {
    return {
      activities: 1,
      totalScore: input.score,
      totalTime: input.timeSpent,
      avgScore: input.score
    }
  }

  private calculateSavings(responseType?: string, cost?: number): number {
    if (!responseType || !cost) return 0
    
    // Baseline AI cost assumption: $0.01 per evaluation
    const baselineCost = 0.01
    
    switch (responseType) {
      case 'cached': return baselineCost - 0.0001 // 99% savings
      case 'similarity': return baselineCost - 0.002 // 80% savings
      case 'ai': return 0 // No savings
      default: return 0
    }
  }

  private updateCacheHitRate(current: AnalyticsAggregation, responseType?: string): number {
    const isHit = responseType === 'cached' || responseType === 'similarity'
    const totalRequests = current.totalActivities + 1
    const totalHits = (current.cacheHitRate * current.totalActivities) + (isHit ? 1 : 0)
    return totalHits / totalRequests
  }

  private updateAverageResponseTime(current: AnalyticsAggregation, responseTime?: number): number {
    if (!responseTime) return current.averageResponseTime
    
    const totalRequests = current.totalActivities + 1
    const totalTime = (current.averageResponseTime * current.totalActivities) + responseTime
    return totalTime / totalRequests
  }

  // 📈 Get user analytics across all pages
  async getUserUnifiedAnalytics(userId: string, timeRange: 'day' | 'week' | 'month' = 'week') {
    const endDate = new Date()
    const startDate = this.getStartDate(endDate, timeRange)

    // Get aggregated analytics
    const aggregations = await db.select()
      .from(analyticsAggregations)
      .where(
        and(
          eq(analyticsAggregations.userId, userId),
          eq(analyticsAggregations.aggregationType, timeRange === 'day' ? 'daily' : timeRange === 'week' ? 'weekly' : 'monthly'),
          gte(analyticsAggregations.aggregationDate, startDate)
        )
      )
      .orderBy(desc(analyticsAggregations.aggregationDate))

    // Get recent activities for detailed view
    const recentActivities = await db.select()
      .from(universalActivityEvents)
      .where(
        and(
          eq(universalActivityEvents.userId, userId),
          gte(universalActivityEvents.createdAt, startDate)
        )
      )
      .orderBy(desc(universalActivityEvents.createdAt))
      .limit(50)

    return {
      aggregations: aggregations,
      recentActivities: recentActivities,
      activitiesByType: this.groupActivitiesByType(recentActivities),
      dailyPerformance: this.calculateDailyPerformance(recentActivities),
      timeByPage: this.calculateTimeByPage(recentActivities),
      pageProgress: this.calculatePageProgress(recentActivities),
      costEfficiency: this.calculateCostEfficiency(recentActivities)
    }
  }

  // 🎯 Get active goals with progress for UI display
  async getActiveGoalsWithProgress(userId: string) {
    const today = new Date()
    
    const activeGoals = await db.select()
      .from(unifiedGoals)
      .where(
        and(
          eq(unifiedGoals.userId, userId),
          eq(unifiedGoals.isActive, true),
          lte(unifiedGoals.startDate, today),
          gte(unifiedGoals.endDate, today)
        )
      )
      .orderBy(unifiedGoals.goalType, unifiedGoals.targetValue)

    return {
      daily: activeGoals.filter(g => g.goalType === 'daily'),
      weekly: activeGoals.filter(g => g.goalType === 'weekly'),
      monthly: activeGoals.filter(g => g.goalType === 'monthly')
    }
  }

  // Helper methods
  private getGoalIncrement(goalCategory: string): number {
    const increments: Record<string, number> = {
      'sentences_translated': 1,
      'practice_minutes': 1,
      'activities_completed': 1,
      'cards_reviewed': 1,
      'conversation_turns': 1,
      'reading_time': 5, // 5 minutes per activity
      'words_memorized': 1,
      'total_score': 10,
      'high_accuracy_activities': 1,
      'cache_efficiency': 1
    }
    return increments[goalCategory] || 1
  }

  private generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }

  private async getNextGoalProgress(userId: string) {
    // Get goals that are close to completion for motivation
    const activeGoals = await this.getActiveGoalsWithProgress(userId)
    
    return [...activeGoals.daily, ...activeGoals.weekly]
      .filter(goal => goal.currentValue / goal.targetValue > 0.3) // At least 30% progress
      .sort((a, b) => (b.currentValue / b.targetValue) - (a.currentValue / a.targetValue))
      .slice(0, 3)
      .map(goal => ({
        goalId: goal.id,
        title: goal.title,
        progress: goal.currentValue,
        target: goal.targetValue,
        percentComplete: Math.round((goal.currentValue / goal.targetValue) * 100)
      }))
  }

  private async checkAchievements(userId: string, input: ActivityEventInput): Promise<string[]> {
    // Placeholder for achievement system
    // TODO: Implement achievement checking logic
    return []
  }

  private getStartDate(endDate: Date, timeRange: string): Date {
    const startDate = new Date(endDate)
    switch (timeRange) {
      case 'day':
        startDate.setHours(0, 0, 0, 0)
        break
      case 'week':
        startDate.setDate(endDate.getDate() - 7)
        break
      case 'month':
        startDate.setMonth(endDate.getMonth() - 1)
        break
    }
    return startDate
  }

  private groupActivitiesByType(activities: UniversalActivityEvent[]) {
    return activities.reduce((acc, activity) => {
      acc[activity.contentType] = (acc[activity.contentType] || 0) + 1
      return acc
    }, {} as Record<string, number>)
  }

  private calculateDailyPerformance(activities: UniversalActivityEvent[]) {
    const dailyData = activities.reduce((acc, activity) => {
      const date = activity.createdAt.toISOString().split('T')[0]
      if (!acc[date]) {
        acc[date] = { date, totalScore: 0, count: 0 }
      }
      acc[date].totalScore += activity.score
      acc[date].count += 1
      return acc
    }, {} as Record<string, { date: string, totalScore: number, count: number }>)

    return Object.values(dailyData).map(day => ({
      date: day.date,
      averageScore: Math.round(day.totalScore / day.count)
    }))
  }

  private calculateTimeByPage(activities: UniversalActivityEvent[]) {
    const pageTime = activities.reduce((acc, activity) => {
      const timeInMinutes = Math.round(activity.timeSpent / 60000)
      acc[activity.pageSource] = (acc[activity.pageSource] || 0) + timeInMinutes
      return acc
    }, {} as Record<string, number>)

    return Object.entries(pageTime).map(([page, timeSpent]) => ({
      page,
      timeSpent
    }))
  }

  private calculatePageProgress(activities: UniversalActivityEvent[]) {
    const pageData = activities.reduce((acc, activity) => {
      if (!acc[activity.contentType]) {
        acc[activity.contentType] = {
          totalActivities: 0,
          totalScore: 0,
          totalTime: 0
        }
      }
      
      acc[activity.contentType].totalActivities += 1
      acc[activity.contentType].totalScore += activity.score
      acc[activity.contentType].totalTime += Math.round(activity.timeSpent / 60000)
      
      return acc
    }, {} as Record<string, { totalActivities: number, totalScore: number, totalTime: number }>)

    const result: Record<string, any> = {}
    Object.entries(pageData).forEach(([page, data]) => {
      result[page] = {
        totalActivities: data.totalActivities,
        averageScore: Math.round(data.totalScore / data.totalActivities),
        timeSpent: data.totalTime
      }
    })

    return result
  }

  private calculateCostEfficiency(activities: UniversalActivityEvent[]) {
    const totalActivities = activities.length
    const cachedActivities = activities.filter(a => a.aiResponseType === 'cached').length
    const similarityActivities = activities.filter(a => a.aiResponseType === 'similarity').length
    const aiActivities = activities.filter(a => a.aiResponseType === 'ai').length
    
    return {
      totalActivities,
      cacheHitRate: Math.round(((cachedActivities + similarityActivities) / totalActivities) * 100),
      costBreakdown: {
        cached: cachedActivities,
        similarity: similarityActivities,
        ai: aiActivities
      }
    }
  }
}

export const universalActivityService = new UniversalActivityService()
```

---

## 📊 **Enhanced Progress Page with Unified Analytics**

### **Unified Progress Dashboard**

```typescript
// client/src/pages/ProgressPage.tsx - COMPLETE UNIFIED VERSION
import React from 'react'
import { useQuery } from '@tanstack/react-query'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from 'recharts'

export default function ProgressPage({ currentUser }: any) {
  // 📊 Fetch unified analytics from all pages
  const { data: unifiedAnalytics, isLoading } = useQuery({
    queryKey: ['unifiedAnalytics', currentUser?.id],
    queryFn: async () => {
      const response = await fetch(`http://localhost:5001/api/analytics/unified/${currentUser.id}`)
      const data = await response.json()
      return data.success ? data.data : null
    },
    enabled: !!currentUser?.id,
    refetchInterval: 30000 // Refresh every 30 seconds for real-time updates
  })

  const { data: activeGoals } = useQuery({
    queryKey: ['activeGoals', currentUser?.id],
    queryFn: async () => {
      const response = await fetch(`http://localhost:5001/api/goals/active/${currentUser.id}`)
      const data = await response.json()
      return data.success ? data.data : null
    },
    enabled: !!currentUser?.id
  })

  if (isLoading) {
    return (
      <div className="progress-page max-w-6xl mx-auto p-6">
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading your learning progress...</p>
        </div>
      </div>
    )
  }

  const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444']

  return (
    <div className="progress-page max-w-6xl mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Your Learning Journey</h1>
        <p className="text-gray-600">Track your progress across all learning activities</p>
      </div>

      {/* 🎯 Today's Goals Overview */}
      <div className="goals-overview mb-8">
        <h2 className="text-2xl font-semibold mb-4 flex items-center">
          <span className="mr-2">🎯</span>
          Today's Goals
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {activeGoals?.daily?.map((goal: any) => (
            <div key={goal.id} className="goal-card bg-white rounded-lg p-4 shadow-sm border hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center">
                  <span className="text-2xl mr-2">{goal.icon || '📚'}</span>
                  <h3 className="font-medium text-gray-900">{goal.title}</h3>
                </div>
                <span className="text-sm text-gray-500 font-medium">
                  {goal.currentValue}/{goal.targetValue}
                </span>
              </div>
              
              <div className="progress-bar w-full bg-gray-200 rounded-full h-2 mb-2">
                <div 
                  className={`h-2 rounded-full transition-all duration-500 ${
                    goal.currentValue >= goal.targetValue ? 'bg-green-500' : 'bg-blue-600'
                  }`}
                  style={{ width: `${Math.min((goal.currentValue / goal.targetValue) * 100, 100)}%` }}
                />
              </div>
              
              <div className="text-xs text-gray-600">
                {goal.currentValue >= goal.targetValue ? (
                  <span className="text-green-600 font-medium">✅ Completed!</span>
                ) : (
                  <span>{Math.round((goal.currentValue / goal.targetValue) * 100)}% complete</span>
                )}
              </div>
            </div>
          ))}
          
          {(!activeGoals?.daily || activeGoals.daily.length === 0) && (
            <div className="col-span-full text-center py-8 text-gray-500">
              <span className="text-4xl mb-2 block">🎯</span>
              No daily goals set. Create some goals to track your progress!
            </div>
          )}
        </div>
      </div>

      {/* 📊 Quick Stats Cards */}
      <div className="quick-stats grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="stat-card bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-100 text-sm">Total Activities</p>
              <p className="text-2xl font-bold">{unifiedAnalytics?.aggregations?.[0]?.totalActivities || 0}</p>
            </div>
            <span className="text-3xl opacity-80">📚</span>
          </div>
        </div>
        
        <div className="stat-card bg-gradient-to-br from-green-500 to-green-600 text-white rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-100 text-sm">Average Score</p>
              <p className="text-2xl font-bold">{Math.round(unifiedAnalytics?.aggregations?.[0]?.averageScore || 0)}</p>
            </div>
            <span className="text-3xl opacity-80">⭐</span>
          </div>
        </div>
        
        <div className="stat-card bg-gradient-to-br from-purple-500 to-purple-600 text-white rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-100 text-sm">Time Spent</p>
              <p className="text-2xl font-bold">{Math.round((unifiedAnalytics?.aggregations?.[0]?.totalTimeSpent || 0) / 60000)}m</p>
            </div>
            <span className="text-3xl opacity-80">⏱️</span>
          </div>
        </div>
        
        <div className="stat-card bg-gradient-to-br from-orange-500 to-orange-600 text-white rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-orange-100 text-sm">Cache Hit Rate</p>
              <p className="text-2xl font-bold">{Math.round((unifiedAnalytics?.costEfficiency?.cacheHitRate || 0))}%</p>
            </div>
            <span className="text-3xl opacity-80">🚀</span>
          </div>
        </div>
      </div>

      {/* 📈 Performance Trends */}
      <div className="performance-trends mb-8">
        <h2 className="text-2xl font-semibold mb-4 flex items-center">
          <span className="mr-2">📈</span>
          Performance Trends
        </h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Daily Performance Chart */}
          <div className="bg-white rounded-lg p-6 shadow-sm border">
            <h3 className="text-lg font-medium mb-4">Daily Average Scores</h3>
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={unifiedAnalytics?.dailyPerformance || []}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" tickFormatter={(date) => new Date(date).toLocaleDateString()} />
                <YAxis domain={[0, 100]} />
                <Tooltip 
                  labelFormatter={(date) => new Date(date).toLocaleDateString()}
                  formatter={(value) => [`${value}/100`, 'Average Score']}
                />
                <Line 
                  type="monotone" 
                  dataKey="averageScore" 
                  stroke="#3B82F6" 
                  strokeWidth={3} 
                  dot={{ fill: '#3B82F6', strokeWidth: 2, r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Activity Distribution */}
          <div className="bg-white rounded-lg p-6 shadow-sm border">
            <h3 className="text-lg font-medium mb-4">Learning Activity Distribution</h3>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={Object.entries(unifiedAnalytics?.activitiesByType || {}).map(([type, count]) => ({
                    name: type.charAt(0).toUpperCase() + type.slice(1),
                    value: count
                  }))}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {Object.entries(unifiedAnalytics?.activitiesByType || {}).map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* 📋 Page-Specific Progress */}
      <div className="page-progress mb-8">
        <h2 className="text-2xl font-semibold mb-4 flex items-center">
          <span className="mr-2">📋</span>
          Progress by Learning Mode
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {['practice', 'reading', 'memorize', 'conversation'].map(pageType => {
            const pageData = unifiedAnalytics?.pageProgress?.[pageType] || {}
            const hasData = pageData.totalActivities > 0
            
            return (
              <div key={pageType} className="page-card bg-white rounded-lg p-6 shadow-sm border hover:shadow-md transition-shadow">
                <div className="text-center mb-4">
                  <span className="text-3xl mb-2 block">
                    {pageType === 'practice' && '📝'}
                    {pageType === 'reading' && '📖'}
                    {pageType === 'memorize' && '🧠'}
                    {pageType === 'conversation' && '💬'}
                  </span>
                  <h3 className="font-medium capitalize text-gray-900">{pageType}</h3>
                </div>
                
                {hasData ? (
                  <div className="stats space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Activities</span>
                      <span className="font-semibold text-gray-900">{pageData.totalActivities}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Avg Score</span>
                      <span className={`font-semibold ${
                        pageData.averageScore >= 80 ? 'text-green-600' : 
                        pageData.averageScore >= 60 ? 'text-yellow-600' : 'text-red-600'
                      }`}>
                        {pageData.averageScore}/100
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Time</span>
                      <span className="font-semibold text-gray-900">{pageData.timeSpent}m</span>
                    </div>
                  </div>
                ) : (
                  <div className="text-center text-gray-500">
                    <p className="text-sm">No activity yet</p>
                    <p className="text-xs mt-1">Start practicing to see progress!</p>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>

      {/* 💰 Cost Efficiency Dashboard */}
      <div className="cost-efficiency mb-8">
        <h2 className="text-2xl font-semibold mb-4 flex items-center">
          <span className="mr-2">💰</span>
          Learning Efficiency
        </h2>
        <div className="bg-white rounded-lg p-6 shadow-sm border">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-green-600 mb-2">
                {unifiedAnalytics?.costEfficiency?.cacheHitRate || 0}%
              </div>
              <p className="text-sm text-gray-600">Cache Hit Rate</p>
              <p className="text-xs text-gray-500 mt-1">Cost optimization efficiency</p>
            </div>
            
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600 mb-2">
                {unifiedAnalytics?.costEfficiency?.costBreakdown?.cached || 0}
              </div>
              <p className="text-sm text-gray-600">Instant Responses</p>
              <p className="text-xs text-gray-500 mt-1">Cached evaluations</p>
            </div>
            
            <div className="text-center">
              <div className="text-3xl font-bold text-purple-600 mb-2">
                ${((unifiedAnalytics?.aggregations?.[0]?.totalAISavings || 0) * 100).toFixed(2)}
              </div>
              <p className="text-sm text-gray-600">Cost Savings</p>
              <p className="text-xs text-gray-500 mt-1">vs. pure AI costs</p>
            </div>
          </div>
        </div>
      </div>

      {/* 🏆 Achievements & Milestones */}
      <div className="achievements">
        <h2 className="text-2xl font-semibold mb-4 flex items-center">
          <span className="mr-2">🏆</span>
          Recent Achievements
        </h2>
        <div className="bg-white rounded-lg p-6 shadow-sm border">
          {unifiedAnalytics?.recentAchievements?.length > 0 ? (
            <div className="achievements-list space-y-4">
              {unifiedAnalytics.recentAchievements.map((achievement: any, index: number) => (
                <div key={index} className="achievement-item flex items-center space-x-4 p-4 bg-gradient-to-r from-yellow-50 to-yellow-100 rounded-lg border border-yellow-200">
                  <span className="text-3xl">{achievement.icon || '🏆'}</span>
                  <div className="flex-1">
                    <h4 className="font-semibold text-gray-900">{achievement.title}</h4>
                    <p className="text-sm text-gray-600">{achievement.description}</p>
                    <p className="text-xs text-gray-500 mt-1">{achievement.date}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <span className="text-4xl mb-4 block">🎯</span>
              <p className="text-lg font-medium mb-2">Keep Learning to Unlock Achievements!</p>
              <p className="text-sm">Complete activities across different learning modes to earn your first achievement.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
```

---

## 🔗 **Integration Usage Examples**

### **Recording Activity from Practice Page**

```typescript
// client/src/pages/PracticePage.tsx - Integration Example
import { universalActivityService } from '../services/universal-activity-service'

const handleEvaluationComplete = async (result: any) => {
  // Record activity for unified tracking
  const activityResult = await universalActivityService.recordActivity({
    userId: currentUser.id,
    activityType: 'sentence_translated',
    contentType: 'practice',
    pageSource: 'practice',
    score: result.score,
    hintsUsed: hintsUsedCount,
    timeSpent: Date.now() - startTime,
    difficultyLevel: currentSentence.difficulty,
    contentId: currentSentence.id,
    grammarConcepts: ['present_tense', 'ser_vs_estar'],
    vocabularyWords: ['caminar', 'casa', 'gusta'],
    aiResponseType: result.responseType, // 'cached', 'similarity', 'ai'
    aiCost: result.cost,
    aiResponseTime: result.responseTime,
    sessionId: sessionId
  })

  // Show goal progress feedback to user
  if (activityResult.goalsCompleted.length > 0) {
    showGoalCompletionNotification(activityResult.goalsCompleted)
  }
  
  if (activityResult.nextGoalProgress) {
    updateGoalProgressUI(activityResult.nextGoalProgress)
  }
}
```

### **Cross-Page Goal Creation API**

```typescript
// server/src/routes/goals.ts - API Implementation
import { Router } from 'express'
import { universalActivityService } from '../services/universal-activity-service'

const router = Router()

// Create daily goals for user
router.post('/daily/:userId', async (req, res) => {
  const { userId } = req.params
  const { goals } = req.body

  try {
    const createdGoals = await Promise.all(
      goals.map(async (goal: any) => {
        const goalId = `goal_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
        
        return db.insert(unifiedGoals).values({
          id: goalId,
          userId,
          goalType: 'daily',
          goalCategory: goal.category,
          targetValue: goal.target,
          title: goal.title,
          description: goal.description,
          icon: goal.icon,
          startDate: new Date(),
          endDate: new Date(Date.now() + 24 * 60 * 60 * 1000), // Tomorrow
          createdAt: new Date(),
          updatedAt: new Date()
        })
      })
    )

    res.json({ success: true, data: createdGoals })
  } catch (error) {
    res.status(500).json({ success: false, error: error.message })
  }
})

// Get unified analytics
router.get('/analytics/unified/:userId', async (req, res) => {
  const { userId } = req.params
  const { timeRange = 'week' } = req.query

  try {
    const analytics = await universalActivityService.getUserUnifiedAnalytics(
      userId, 
      timeRange as 'day' | 'week' | 'month'
    )
    
    res.json({ success: true, data: analytics })
  } catch (error) {
    res.status(500).json({ success: false, error: error.message })
  }
})

export default router
```

---

This cross-page integration system provides the foundation for unified progress tracking, real-time analytics, and cross-page goal management that creates a cohesive learning experience across all AIdioma pages.