#!/usr/bin/env tsx

import { config } from 'dotenv'
config()

import { db, checkDatabaseConnection } from '../db/connection'
import { 
  sentences, 
  users, 
  userProgress, 
  practiceSessions, 
  evaluations,
  evaluationCache,
  learningAnalytics 
} from '../../../shared/schema'
import { seedSentences } from '../data/seed-sentences'
import { eq } from 'drizzle-orm'
import { v4 as uuidv4 } from 'uuid'

// Test users for development (compatible with Stack Auth)
const testUsers = [
  {
    id: 'user_dev_mike_001',
    email: 'mike@aidioma.dev',
    name: 'Mike Developer',
    level: 'intermediate' as const,
    streak: 7,
    totalScore: 850,
    preferences: JSON.stringify({
      targetLanguage: 'spanish',
      nativeLanguage: 'english',
      learningGoals: ['conversation', 'reading'],
      preferredDifficulty: 'intermediate'
    })
  },
  {
    id: 'user_dev_anna_002',
    email: 'anna@aidioma.dev',
    name: 'Anna Beginner',
    level: 'beginner' as const,
    streak: 3,
    totalScore: 245,
    preferences: JSON.stringify({
      targetLanguage: 'spanish',
      nativeLanguage: 'english',
      learningGoals: ['basics', 'vocabulary'],
      preferredDifficulty: 'beginner'
    })
  },
  {
    id: 'user_dev_carlos_003',
    email: 'carlos@aidioma.dev', 
    name: 'Carlos Advanced',
    level: 'advanced' as const,
    streak: 21,
    totalScore: 1450,
    preferences: JSON.stringify({
      targetLanguage: 'spanish',
      nativeLanguage: 'english',
      learningGoals: ['fluency', 'business', 'literature'],
      preferredDifficulty: 'advanced'
    })
  }
]

// Generate realistic user progress data
function generateUserProgress(userId: string, userLevel: 'beginner' | 'intermediate' | 'advanced') {
  const progress: Array<{
    id: string
    userId: string
    sentenceId: string
    attempts: number
    bestScore: number
    lastAttemptAt: Date
    mastered: boolean
    averageScore: string
  }> = []
  const now = new Date()
  
  // Determine sentences based on user level
  const userSentences = seedSentences.filter(sentence => {
    if (userLevel === 'beginner') return sentence.difficulty === 'beginner'
    if (userLevel === 'intermediate') return ['beginner', 'intermediate'].includes(sentence.difficulty)
    return true // Advanced users see all levels
  })

  userSentences.forEach((sentence, index) => {
    // Simulate varying levels of mastery
    const attempts = Math.floor(Math.random() * 8) + 1
    const bestScore = Math.floor(Math.random() * 40) + 60 // 60-100 score range
    const averageScore = (bestScore - Math.floor(Math.random() * 15)).toString()
    
    const lastAttemptAt = new Date(now.getTime() - Math.random() * 7 * 24 * 60 * 60 * 1000) // Within last week
    
    progress.push({
      id: `progress_${userId}_${sentence.id}`,
      userId,
      sentenceId: sentence.id,
      attempts,
      bestScore,
      lastAttemptAt,
      mastered: bestScore >= 85,
      averageScore
    })
  })

  return progress
}

// Generate sample practice sessions
function generatePracticeSessions(userId: string, userLevel: 'beginner' | 'intermediate' | 'advanced') {
  const sessions: Array<{
    id: string
    userId: string
    startedAt: Date
    completedAt: Date
    totalSentences: number
    completedSentences: number
    averageScore: string
    sessionType: string
  }> = []
  const now = new Date()

  // Generate sessions for the last week
  for (let day = 0; day < 7; day++) {
    const sessionDate = new Date(now.getTime() - day * 24 * 60 * 60 * 1000)
    
    // Skip some days randomly for realism
    if (Math.random() < 0.3) continue

    const totalSentences = Math.floor(Math.random() * 8) + 3 // 3-10 sentences per session
    const completedSentences = Math.floor(totalSentences * (0.7 + Math.random() * 0.3)) // 70-100% completion
    const averageScore = (60 + Math.random() * 35).toFixed(2) // 60-95 average score

    sessions.push({
      id: `session_${userId}_${day}`,
      userId,
      startedAt: sessionDate,
      completedAt: new Date(sessionDate.getTime() + (15 + Math.random() * 30) * 60 * 1000), // 15-45 minutes
      totalSentences,
      completedSentences,
      averageScore,
      sessionType: 'standard'
    })
  }

  return sessions
}

// Generate sample evaluations
function generateEvaluations(userId: string, sessionIds: string[]) {
  const evaluations: Array<{
    id: string
    userId: string
    sentenceId: string
    sessionId: string
    userTranslation: string
    aiEvaluation: string
    score: number
    feedback: string
    hintsUsed: number
    timeSpent: number
  }> = []
  
  sessionIds.forEach((sessionId, sessionIndex) => {
    // Generate 3-8 evaluations per session
    const numEvaluations = Math.floor(Math.random() * 6) + 3
    
    for (let i = 0; i < numEvaluations; i++) {
      const randomSentence = seedSentences[Math.floor(Math.random() * seedSentences.length)]
      const score = Math.floor(Math.random() * 40) + 60 // 60-100 score range
      
      const evaluation = {
        id: `eval_${userId}_${sessionIndex}_${i}`,
        userId,
        sentenceId: randomSentence.id,
        sessionId,
        userTranslation: generateRandomUserTranslation(randomSentence.english),
        aiEvaluation: JSON.stringify({
          score,
          feedback: generateFeedback(score),
          grammarAnalysis: 'Sample grammar analysis',
          improvements: ['Sample improvement suggestion']
        }),
        score,
        feedback: generateFeedback(score),
        hintsUsed: Math.floor(Math.random() * 3),
        timeSpent: Math.floor(Math.random() * 120) + 30, // 30-150 seconds
      }
      
      evaluations.push(evaluation)
    }
  })
  
  return evaluations
}

function generateRandomUserTranslation(english: string): string {
  // Simple translation variations for demo purposes
  const translations: Record<string, string[]> = {
    'Hello, how are you?': ['Hola, ¿cómo estás?', 'Hola, ¿como estas?', 'Hola, que tal?'],
    'My name is María.': ['Me llamo María.', 'Mi nombre es María.', 'Soy María.'],
    'I want a coffee, please.': ['Quiero un café, por favor.', 'Yo quiero café, por favor.', 'Quiero café por favor.'],
    'The house is big.': ['La casa es grande.', 'La casa esta grande.', 'El casa es grande.'],
    'I have two brothers.': ['Tengo dos hermanos.', 'Yo tengo dos hermanos.', 'Tengo 2 hermanos.']
  }
  
  const variations = translations[english]
  return variations ? variations[Math.floor(Math.random() * variations.length)] : english
}

function generateFeedback(score: number): string {
  if (score >= 90) return 'Excellent! Your translation is accurate and natural.'
  if (score >= 80) return 'Very good! Minor improvements possible in word choice.'
  if (score >= 70) return 'Good effort! Pay attention to grammar details.'
  if (score >= 60) return 'Fair attempt. Review the grammar patterns and try again.'
  return 'Keep practicing! Focus on basic sentence structure.'
}

// Generate learning analytics
function generateLearningAnalytics(userId: string) {
  const analytics: Array<{
    id: string
    userId: string
    date: string
    practiceTime: number
    sentencesCompleted: number
    averageScore: string
    hintsUsed: number
    streakDay: number
    difficultiesEncountered: string
  }> = []
  const now = new Date()
  
  // Generate daily analytics for the last week
  for (let day = 0; day < 7; day++) {
    const date = new Date(now.getTime() - day * 24 * 60 * 60 * 1000)
    const dateString = date.toISOString().split('T')[0] // YYYY-MM-DD format
    
    analytics.push({
      id: `analytics_${userId}_${day}`,
      userId,
      date: dateString,
      practiceTime: Math.floor(Math.random() * 60) + 15, // 15-75 minutes
      sentencesCompleted: Math.floor(Math.random() * 15) + 5, // 5-20 sentences
      averageScore: (60 + Math.random() * 35).toFixed(2), // 60-95 score
      hintsUsed: Math.floor(Math.random() * 8),
      streakDay: Math.max(0, 7 - day),
      difficultiesEncountered: JSON.stringify(['grammar', 'vocabulary', 'pronunciation'])
    })
  }
  
  return analytics
}

// Main seeding function
async function seedDatabase() {
  console.log('🌱 Starting database seeding...')
  
  try {
    // Check database connection
    const dbCheck = await checkDatabaseConnection()
    if (!dbCheck.connected) {
      throw new Error(`Database connection failed: ${dbCheck.error}`)
    }
    console.log('✅ Database connection verified')

    // 1. Seed sentences
    console.log('📝 Seeding sentences...')
    
    // Clear existing sentences first
    await db.delete(sentences)
    
    // Insert new sentences
    await db.insert(sentences).values(
      seedSentences.map(sentence => ({
        ...sentence,
        createdAt: new Date()
      }))
    )
    console.log(`✅ Inserted ${seedSentences.length} sentences`)

    // 2. Seed test users
    console.log('👥 Seeding test users...')
    
    // Clear existing users first
    await db.delete(users)
    
    // Insert test users
    await db.insert(users).values(
      testUsers.map(user => ({
        ...user,
        createdAt: new Date(),
        updatedAt: new Date()
      }))
    )
    console.log(`✅ Inserted ${testUsers.length} test users`)

    // 3. Seed user progress
    console.log('📊 Seeding user progress...')
    
    await db.delete(userProgress)
    
    for (const user of testUsers) {
      const progress = generateUserProgress(user.id, user.level)
      if (progress.length > 0) {
        await db.insert(userProgress).values(progress)
        console.log(`✅ Inserted ${progress.length} progress records for ${user.name}`)
      }
    }

    // 4. Seed practice sessions
    console.log('🎯 Seeding practice sessions...')
    
    await db.delete(practiceSessions)
    
    const allSessionIds: string[] = []
    
    for (const user of testUsers) {
      const sessions = generatePracticeSessions(user.id, user.level)
      if (sessions.length > 0) {
        await db.insert(practiceSessions).values(sessions)
        allSessionIds.push(...sessions.map(s => s.id))
        console.log(`✅ Inserted ${sessions.length} practice sessions for ${user.name}`)
      }
    }

    // 5. Seed evaluations
    console.log('🤖 Seeding evaluations...')
    
    await db.delete(evaluations)
    
    for (const user of testUsers) {
      const userSessionIds = allSessionIds.filter(id => id.includes(user.id))
      const evals = generateEvaluations(user.id, userSessionIds)
      if (evals.length > 0) {
        await db.insert(evaluations).values(evals)
        console.log(`✅ Inserted ${evals.length} evaluations for ${user.name}`)
      }
    }

    // 6. Seed learning analytics
    console.log('📈 Seeding learning analytics...')
    
    await db.delete(learningAnalytics)
    
    for (const user of testUsers) {
      const analytics = generateLearningAnalytics(user.id)
      if (analytics.length > 0) {
        await db.insert(learningAnalytics).values(analytics)
        console.log(`✅ Inserted ${analytics.length} analytics records for ${user.name}`)
      }
    }

    console.log('\n🎉 Database seeding completed successfully!')
    console.log('\n📋 Summary:')
    console.log(`   • ${seedSentences.length} sentences (beginner to advanced)`)
    console.log(`   • ${testUsers.length} test users`)
    console.log(`   • User progress data for realistic testing`)
    console.log(`   • Practice sessions with completion data`)
    console.log(`   • AI evaluations and feedback`)
    console.log(`   • Learning analytics for progress tracking`)
    
    console.log('\n🔗 Test users for frontend:')
    testUsers.forEach(user => {
      console.log(`   • ${user.name} (${user.level}): ${user.email}`)
    })
    
    console.log('\n🚀 Ready for frontend testing!')
    console.log('   • Frontend: http://localhost:5000')
    console.log('   • Backend API: http://localhost:3001')
    console.log('   • Health check: http://localhost:3001/health')

  } catch (error) {
    console.error('❌ Seeding failed:', error)
    process.exit(1)
  }
}

// Run seeding if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  seedDatabase().then(() => {
    console.log('✅ Seeding completed')
    process.exit(0)
  }).catch(error => {
    console.error('❌ Seeding failed:', error)
    process.exit(1)
  })
}

export { seedDatabase }

