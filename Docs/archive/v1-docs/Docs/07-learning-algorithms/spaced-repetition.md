# Spaced Repetition Algorithm - AIdioma Learning System

*File: `docs/07-learning-algorithms/spaced-repetition.md`*

## Overview

The Spaced Repetition Algorithm is a core learning component that optimizes review scheduling based on forgetting curves and individual performance patterns. This system ensures long-term retention by presenting content at increasingly spaced intervals, adapting to each user's learning progress and difficulty areas.

## Algorithm Foundation

### Modified SM-2 Algorithm
Based on SuperMemo's SM-2 algorithm with Spanish language learning optimizations:

```typescript
interface SpacedRepetitionState {
  easeFactor: number;        // 1.3 - 2.5 (difficulty adjustment)
  interval: number;          // Days until next review
  repetitions: number;       // Consecutive successful reviews
  nextReviewDate: Date;      // Calculated next review
  lastAccuracy: number;      // 0-100 last performance score
  conceptType: string;       // 'grammar', 'vocabulary', 'structure'
}

interface ReviewResult {
  accuracy: number;          // 0-100 performance score
  responseTime: number;      // Milliseconds to complete
  hintsUsed: number;         // Number of hints requested
  difficulty: number;        // User-reported difficulty (1-5)
}
```

### Core Algorithm Implementation
```typescript
class SpacedRepetitionEngine {
  private readonly INITIAL_INTERVAL = 1;     // 1 day
  private readonly INITIAL_EASE_FACTOR = 2.5;
  private readonly MIN_EASE_FACTOR = 1.3;
  private readonly MAX_EASE_FACTOR = 2.8;

  calculateNextReview(
    currentState: SpacedRepetitionState,
    result: ReviewResult
  ): SpacedRepetitionState {
    
    const quality = this.calculateQuality(result);
    const newState = { ...currentState };

    if (quality >= 3) {
      // Successful review
      newState.repetitions += 1;
      
      if (newState.repetitions === 1) {
        newState.interval = 1;
      } else if (newState.repetitions === 2) {
        newState.interval = 6;
      } else {
        newState.interval = Math.round(
          newState.interval * newState.easeFactor
        );
      }
      
      // Adjust ease factor based on performance
      newState.easeFactor = Math.max(
        this.MIN_EASE_FACTOR,
        newState.easeFactor + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02))
      );
      
    } else {
      // Failed review - reset repetitions
      newState.repetitions = 0;
      newState.interval = 1;
      newState.easeFactor = Math.max(
        this.MIN_EASE_FACTOR,
        newState.easeFactor - 0.2
      );
    }

    newState.nextReviewDate = new Date(
      Date.now() + newState.interval * 24 * 60 * 60 * 1000
    );
    newState.lastAccuracy = result.accuracy;

    return newState;
  }

  private calculateQuality(result: ReviewResult): number {
    // Convert 0-100 accuracy to 0-5 quality scale
    let quality = Math.floor(result.accuracy / 20);
    
    // Adjust for hint usage (penalize dependency)
    if (result.hintsUsed > 0) {
      quality = Math.max(0, quality - result.hintsUsed);
    }
    
    // Adjust for response time (reward quick responses)
    if (result.responseTime < 10000) { // Under 10 seconds
      quality = Math.min(5, quality + 0.5);
    }
    
    return Math.max(0, Math.min(5, quality));
  }
}
```

## Spanish Language Optimizations

### Grammar Concept Scheduling
Different grammar concepts require different repetition patterns:

```typescript
interface GrammarConceptConfig {
  conceptType: string;
  baseInterval: number;       // Starting interval in days
  difficultyMultiplier: number; // Adjustment for concept difficulty
  retentionTarget: number;    // Target retention rate (0-1)
}

const GRAMMAR_CONCEPTS: Record<string, GrammarConceptConfig> = {
  'verb_conjugation': {
    conceptType: 'verb_conjugation',
    baseInterval: 2,           // More frequent for complex conjugations
    difficultyMultiplier: 1.2,
    retentionTarget: 0.85
  },
  'noun_gender': {
    conceptType: 'noun_gender',
    baseInterval: 3,
    difficultyMultiplier: 1.0,
    retentionTarget: 0.90
  },
  'subjunctive_mood': {
    conceptType: 'subjunctive_mood',
    baseInterval: 1,           // Most challenging - frequent review
    difficultyMultiplier: 1.5,
    retentionTarget: 0.80
  },
  'prepositions': {
    conceptType: 'prepositions',
    baseInterval: 2,
    difficultyMultiplier: 1.3,
    retentionTarget: 0.85
  }
};
```

### Adaptive Difficulty Scheduling
```typescript
class AdaptiveScheduler {
  adjustIntervalForDifficulty(
    baseInterval: number,
    userProficiency: number,    // 0-100 overall proficiency
    conceptDifficulty: number,  // 1-9 content difficulty
    personalStruggle: number    // 0-1 individual struggle score
  ): number {
    
    const proficiencyFactor = Math.max(0.5, userProficiency / 100);
    const difficultyFactor = Math.max(0.3, (10 - conceptDifficulty) / 10);
    const struggleFactor = Math.max(0.2, 1 - personalStruggle);
    
    const adjustedInterval = baseInterval * 
      proficiencyFactor * 
      difficultyFactor * 
      struggleFactor;
    
    return Math.max(1, Math.round(adjustedInterval));
  }
  
  calculateStruggleScore(
    recentAccuracyScores: number[],
    hintUsageHistory: number[],
    timeToMasteryTarget: number
  ): number {
    
    const avgAccuracy = recentAccuracyScores.reduce((a, b) => a + b, 0) / recentAccuracyScores.length;
    const avgHints = hintUsageHistory.reduce((a, b) => a + b, 0) / hintUsageHistory.length;
    
    // Higher struggle score means more difficulty
    const accuracyStruggle = Math.max(0, (85 - avgAccuracy) / 85);
    const hintStruggle = Math.min(1, avgHints / 3); // Normalize to 0-1
    
    return Math.min(1, (accuracyStruggle + hintStruggle) / 2);
  }
}
```

## Database Integration

### Review Queue Management
```typescript
interface ReviewQueueItem {
  userId: string;
  sentenceId: number;
  conceptType: string;
  priority: number;           // 1-5 (5 = most urgent)
  scheduledFor: Date;
  lastReviewed: Date;
  easeFactor: number;
  interval: number;
  repetitions: number;
  struggleScore: number;
}

class ReviewQueueManager {
  async generateDailyReviewQueue(
    userId: string,
    targetReviewCount: number = 20
  ): Promise<ReviewQueueItem[]> {
    
    const overdueItems = await this.getOverdueReviews(userId);
    const scheduledItems = await this.getTodaysScheduledReviews(userId);
    const reinforcementItems = await this.getReinforcementReviews(userId);
    
    // Priority order: Overdue > Scheduled > Reinforcement
    const queueItems = [
      ...overdueItems.map(item => ({ ...item, priority: 5 })),
      ...scheduledItems.map(item => ({ ...item, priority: 3 })),
      ...reinforcementItems.map(item => ({ ...item, priority: 1 }))
    ];
    
    // Sort by priority, then by struggle score
    return queueItems
      .sort((a, b) => {
        if (a.priority !== b.priority) return b.priority - a.priority;
        return b.struggleScore - a.struggleScore;
      })
      .slice(0, targetReviewCount);
  }
  
  async updateReviewResult(
    userId: string,
    sentenceId: number,
    result: ReviewResult
  ): Promise<void> {
    
    const currentState = await this.getSpacedRepetitionState(userId, sentenceId);
    const engine = new SpacedRepetitionEngine();
    const newState = engine.calculateNextReview(currentState, result);
    
    await this.saveSpacedRepetitionState(userId, sentenceId, newState);
    await this.updateConceptWeaknesses(userId, sentenceId, result);
  }
}
```

### Database Schema Requirements
```sql
-- Spaced repetition state for each user-sentence combination
CREATE TABLE user_spaced_repetition (
    id SERIAL PRIMARY KEY,
    user_id VARCHAR(255) NOT NULL,
    sentence_id INTEGER NOT NULL REFERENCES sentences(id),
    
    -- Core SR Algorithm State
    ease_factor REAL DEFAULT 2.5 CHECK (ease_factor BETWEEN 1.3 AND 2.8),
    interval_days INTEGER DEFAULT 1 CHECK (interval_days >= 1),
    repetitions INTEGER DEFAULT 0,
    next_review_date TIMESTAMP NOT NULL,
    
    -- Performance Tracking
    last_accuracy REAL DEFAULT 0.0 CHECK (last_accuracy BETWEEN 0.0 AND 100.0),
    struggle_score REAL DEFAULT 0.0 CHECK (struggle_score BETWEEN 0.0 AND 1.0),
    total_reviews INTEGER DEFAULT 0,
    successful_reviews INTEGER DEFAULT 0,
    
    -- Learning Analytics
    concept_type VARCHAR(50), -- 'verb_conjugation', 'noun_gender', etc.
    first_learned TIMESTAMP DEFAULT NOW(),
    last_reviewed TIMESTAMP,
    time_to_proficiency INTEGER, -- Days to reach consistent success
    
    -- Adaptive Features
    user_reported_difficulty REAL DEFAULT 3.0 CHECK (user_reported_difficulty BETWEEN 1.0 AND 5.0),
    avg_response_time INTEGER DEFAULT 0, -- Milliseconds
    hint_dependency_score REAL DEFAULT 0.0, -- 0-1 based on hint usage
    
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    
    UNIQUE(user_id, sentence_id),
    INDEX idx_user_sr_review_date (user_id, next_review_date),
    INDEX idx_user_sr_concept (user_id, concept_type),
    INDEX idx_user_sr_struggle (user_id, struggle_score DESC)
);

-- Daily review queue for efficient batch processing
CREATE TABLE daily_review_queues (
    id SERIAL PRIMARY KEY,
    user_id VARCHAR(255) NOT NULL,
    review_date DATE NOT NULL,
    
    -- Queue Contents
    sentence_ids INTEGER[] NOT NULL,
    priorities INTEGER[] NOT NULL, -- Corresponding priorities
    concept_types VARCHAR(50)[] NOT NULL,
    
    -- Queue Statistics
    total_items INTEGER NOT NULL,
    completed_items INTEGER DEFAULT 0,
    avg_accuracy REAL DEFAULT 0.0,
    session_duration INTEGER DEFAULT 0, -- Minutes
    
    -- Queue Management
    generated_at TIMESTAMP DEFAULT NOW(),
    started_at TIMESTAMP,
    completed_at TIMESTAMP,
    
    UNIQUE(user_id, review_date),
    INDEX idx_daily_queue_user_date (user_id, review_date),
    INDEX idx_daily_queue_completion (user_id, completed_at)
);
```

## Performance Optimization

### Batch Processing
```typescript
class SpacedRepetitionOptimizer {
  async precomputeReviewQueues(): Promise<void> {
    // Run daily at midnight to precompute next day's review queues
    const activeUsers = await this.getActiveUsers();
    
    const batchSize = 100;
    for (let i = 0; i < activeUsers.length; i += batchSize) {
      const userBatch = activeUsers.slice(i, i + batchSize);
      
      await Promise.all(
        userBatch.map(async (user) => {
          const queue = await this.generateDailyReviewQueue(user.id);
          await this.cacheDailyQueue(user.id, queue);
        })
      );
    }
  }
  
  async optimizeReviewTiming(userId: string): Promise<void> {
    // Analyze user's historical performance to optimize review timing
    const history = await this.getUserReviewHistory(userId, 30); // Last 30 days
    
    const optimalTimeSlots = this.analyzePerformanceByTime(history);
    await this.updateUserOptimalReviewTimes(userId, optimalTimeSlots);
  }
  
  private analyzePerformanceByTime(history: ReviewHistory[]): TimeSlot[] {
    const hourlyPerformance = new Map<number, number[]>();
    
    history.forEach(review => {
      const hour = review.completedAt.getHours();
      if (!hourlyPerformance.has(hour)) {
        hourlyPerformance.set(hour, []);
      }
      hourlyPerformance.get(hour)!.push(review.accuracy);
    });
    
    return Array.from(hourlyPerformance.entries())
      .map(([hour, accuracies]) => ({
        hour,
        avgAccuracy: accuracies.reduce((a, b) => a + b, 0) / accuracies.length,
        sampleSize: accuracies.length
      }))
      .filter(slot => slot.sampleSize >= 5) // Require minimum sample size
      .sort((a, b) => b.avgAccuracy - a.avgAccuracy);
  }
}
```

### Memory Management
```typescript
class MemoryManager {
  private reviewStateCache = new Map<string, SpacedRepetitionState>();
  private queueCache = new Map<string, ReviewQueueItem[]>();
  
  async getReviewState(
    userId: string, 
    sentenceId: number
  ): Promise<SpacedRepetitionState> {
    const cacheKey = `${userId}-${sentenceId}`;
    
    if (this.reviewStateCache.has(cacheKey)) {
      return this.reviewStateCache.get(cacheKey)!;
    }
    
    const state = await this.loadFromDatabase(userId, sentenceId);
    this.reviewStateCache.set(cacheKey, state);
    
    // Auto-expire cache entries after 1 hour
    setTimeout(() => {
      this.reviewStateCache.delete(cacheKey);
    }, 60 * 60 * 1000);
    
    return state;
  }
  
  async invalidateUserCache(userId: string): Promise<void> {
    // Remove all cached data for a user (after completing reviews)
    for (const [key] of this.reviewStateCache) {
      if (key.startsWith(`${userId}-`)) {
        this.reviewStateCache.delete(key);
      }
    }
    this.queueCache.delete(userId);
  }
}
```

## User Experience Integration

### Progressive Difficulty Adjustment
```typescript
class ProgressiveDifficultyManager {
  async adjustUserDifficulty(
    userId: string,
    recentPerformance: ReviewResult[]
  ): Promise<DifficultyAdjustment> {
    
    const avgAccuracy = this.calculateAverageAccuracy(recentPerformance);
    const avgHintUsage = this.calculateAverageHintUsage(recentPerformance);
    const consistencyScore = this.calculateConsistency(recentPerformance);
    
    let recommendation: DifficultyAdjustment;
    
    if (avgAccuracy > 90 && avgHintUsage < 0.5 && consistencyScore > 0.8) {
      recommendation = {
        action: 'increase',
        amount: 1,
        reason: 'Strong consistent performance with minimal hint usage'
      };
    } else if (avgAccuracy < 70 || avgHintUsage > 2.0) {
      recommendation = {
        action: 'decrease',
        amount: 1,
        reason: 'Performance below target or high hint dependency'
      };
    } else {
      recommendation = {
        action: 'maintain',
        amount: 0,
        reason: 'Performance within optimal range'
      };
    }
    
    await this.applyDifficultyAdjustment(userId, recommendation);
    return recommendation;
  }
}
```

### Motivation and Engagement
```typescript
class MotivationSystem {
  async generateReviewMotivation(
    userId: string,
    queueSize: number,
    streak: number
  ): Promise<MotivationMessage> {
    
    if (queueSize === 0) {
      return {
        type: 'celebration',
        message: `¡Excelente! You're all caught up! Your ${streak}-day streak is strong.`,
        icon: '🎉'
      };
    }
    
    if (queueSize > 50) {
      return {
        type: 'encouragement',
        message: `You have ${queueSize} reviews waiting. Start with just 10 to build momentum!`,
        icon: '💪'
      };
    }
    
    if (streak > 10) {
      return {
        type: 'streak_maintenance',
        message: `Your ${streak}-day streak is impressive! ${queueSize} quick reviews to keep it going.`,
        icon: '🔥'
      };
    }
    
    return {
      type: 'standard',
      message: `${queueSize} sentences ready for review. Let's strengthen your Spanish!`,
      icon: '📚'
    };
  }
}
```

## Implementation Phases

### Phase 1: Core Algorithm (Week 1)
- Implement basic SM-2 algorithm
- Create database schema for spaced repetition state
- Build review queue generation system
- Add basic API endpoints for review scheduling

### Phase 2: Spanish Optimizations (Week 2)
- Implement grammar concept-specific scheduling
- Add adaptive difficulty adjustment
- Create struggle score calculation
- Build performance-based interval optimization

### Phase 3: User Experience (Week 3)
- Add daily review queue precomputation
- Implement motivation and engagement features
- Create review analytics and progress visualization
- Add optimal timing recommendations

### Phase 4: Advanced Features (Week 4)
- Implement batch processing for performance
- Add memory management and caching
- Create advanced analytics and reporting
- Build admin tools for monitoring system performance

## Success Metrics

### Learning Effectiveness
- **Retention Rate**: >85% accuracy on reviews after 30+ days
- **Time to Mastery**: Average reduction of 25% in time to reach proficiency
- **Long-term Retention**: >90% retention of concepts after 90 days
- **Hint Dependency Reduction**: 50% decrease in hint usage over 2 weeks

### System Performance
- **Queue Generation**: <500ms for daily queue creation
- **Review Processing**: <100ms per review result processing
- **Database Performance**: <50ms average query time for review state
- **Memory Usage**: <100MB cache memory per 1000 active users

### User Engagement
- **Daily Review Completion**: >80% of generated queues completed
- **Streak Maintenance**: >70% of users maintain 7+ day streaks
- **User Satisfaction**: >4.5/5 rating for review experience
- **Session Duration**: Optimal 15-20 minute review sessions

## Integration with Existing Systems

### Practice System Integration
```typescript
// Update practice session to include spaced repetition tracking
export async function completePracticeSession(
  userId: string,
  results: PracticeResult[]
): Promise<void> {
  
  // Process each sentence result for spaced repetition
  const srEngine = new SpacedRepetitionEngine();
  
  for (const result of results) {
    await srEngine.updateReviewResult(userId, result.sentenceId, {
      accuracy: result.score,
      responseTime: result.timeSpent,
      hintsUsed: result.hintsUsed,
      difficulty: result.userRatedDifficulty || 3
    });
  }
  
  // Check if difficulty adjustment is needed
  const recentResults = await getRecentResults(userId, 10);
  const difficultyManager = new ProgressiveDifficultyManager();
  await difficultyManager.adjustUserDifficulty(userId, recentResults);
}
```

### Content Processing Integration
```typescript
// Automatically tag new content with spaced repetition metadata
export async function processNewContent(content: ContentUpload): Promise<void> {
  const sentences = await extractSentences(content);
  
  for (const sentence of sentences) {
    // Analyze grammar concepts for spaced repetition scheduling
    const concepts = await analyzeGrammarConcepts(sentence.spanish_text);
    
    // Set initial spaced repetition parameters based on concepts
    const srConfig = determineInitialSRConfig(concepts, sentence.difficulty);
    
    await saveSentenceWithSRConfig(sentence, srConfig);
  }
}
```

This comprehensive spaced repetition system provides the foundation for long-term learning retention while integrating seamlessly with AIdioma's existing practice and content management systems.