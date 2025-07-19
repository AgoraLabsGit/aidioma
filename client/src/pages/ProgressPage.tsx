import React, { useState, useEffect } from 'react';
import SharedSidebar from '../components/Sidebar';
import type { CurrentUser } from '../types';
import { 
  Award, 
  TrendingUp, 
  Target, 
  Calendar,
  BookOpen,
  Clock,
  Star,
  Trophy,
  Zap,
  ChevronRight,
  MessageCircle,
  Brain
} from 'lucide-react';

// Types for the Progress System
interface LearnerLevel {
  id: string;
  title: string;
  titleSpanish: string;
  xpRequired: number;
  badge: string;
}

interface GradeCalculation {
  letter: string;
  percentage: number;
  color: string;
  description: string;
  feedback: string;
}

interface PageGrades {
  practice: GradeCalculation;
  reading: GradeCalculation;
  memorize: GradeCalculation;
  conversation: GradeCalculation;
}

interface WeeklyStats {
  wordsMemorized: number;
  sentencesPracticed: number;
  readingTime: number;
  conversationCount: number;
  xpEarned: number;
  streakDays: number;
}

interface Achievement {
  id: string;
  title: string;
  description: string;
  badge: string;
  xpReward: number;
  unlockedAt: Date;
}

interface MetricCardProps {
  icon: React.ComponentType<{ className?: string }>;
  value: string | number;
  label: string;
  progress?: number;
  color: string;
  trend?: string;
  grade?: string;
  onClick?: () => void;
}

// Enhanced Metric Card Component
function MetricCard({ 
  icon: Icon, 
  value, 
  label, 
  progress, 
  color, 
  trend, 
  grade, 
  onClick 
}: MetricCardProps) {
  return (
    <div 
      className={`bg-muted border border-border rounded-lg p-4 cursor-pointer transition-all duration-200 hover:border-${color}-500/50 hover:bg-accent/50`}
      onClick={onClick}
    >
      <div className="flex items-center gap-3 mb-3">
        <Icon className={`w-6 h-6 text-${color}-500`} />
        <div className="flex-1">
          <div className="text-xl font-bold text-foreground">{value}</div>
          <div className="text-sm text-muted-foreground">{label}</div>
        </div>
        {grade && (
          <div className={`text-sm font-semibold px-2 py-1 rounded text-${color}-500 bg-${color}-500/10`}>
            {grade}
          </div>
        )}
      </div>
      
      {progress !== undefined && (
        <div className="mb-2">
          <div className="w-full bg-background rounded-full h-2">
            <div 
              className={`bg-${color}-500 h-2 rounded-full transition-all duration-300`}
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      )}
      
      {trend && (
        <div className="text-xs text-muted-foreground">{trend}</div>
      )}
    </div>
  );
}

// Grade Badge Component
function GradeBadge({ grade }: { grade: GradeCalculation }) {
  return (
    <div 
      className="flex items-center gap-1 px-2 md:px-3 py-1 rounded-lg text-xs font-medium"
      style={{ 
        backgroundColor: `${grade.color}20`,
        borderColor: grade.color,
        color: grade.color 
      }}
    >
      <Award className="w-3 h-3" />
      <div>
        <div className="font-medium">{grade.letter}</div>
      </div>
    </div>
  );
}

// Level Progress Component
function LevelProgress({ 
  currentLevel, 
  currentXP, 
  nextLevel 
}: { 
  currentLevel: LearnerLevel;
  currentXP: number;
  nextLevel: LearnerLevel;
}) {
  const progress = ((currentXP - currentLevel.xpRequired) / (nextLevel.xpRequired - currentLevel.xpRequired)) * 100;
  const xpToNext = nextLevel.xpRequired - currentXP;

  return (
    <div className="bg-muted border border-border rounded-lg p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <span className="text-2xl">{currentLevel.badge}</span>
          <div>
            <h3 className="font-semibold text-foreground">{currentLevel.title}</h3>
            <p className="text-sm text-muted-foreground">{currentLevel.titleSpanish}</p>
          </div>
        </div>
        <div className="text-right">
          <div className="text-lg font-bold text-foreground">{currentXP.toLocaleString()} XP</div>
          <div className="text-xs text-muted-foreground">{xpToNext} to next level</div>
        </div>
      </div>
      
      <div className="mb-2">
        <div className="flex justify-between text-sm text-muted-foreground mb-1">
          <span>{currentLevel.title}</span>
          <span>{nextLevel.title}</span>
        </div>
        <div className="w-full bg-background rounded-full h-3">
          <div 
            className="bg-gradient-to-r from-blue-500 to-purple-500 h-3 rounded-full transition-all duration-500"
            style={{ width: `${Math.max(5, progress)}%` }}
          />
        </div>
      </div>
    </div>
  );
}

// Achievement Item Component
function AchievementItem({ achievement }: { achievement: Achievement }) {
  return (
    <div className="flex items-center gap-3 p-3 bg-muted rounded-lg border border-border">
      <span className="text-xl">{achievement.badge}</span>
      <div className="flex-1">
        <h4 className="font-medium text-foreground">{achievement.title}</h4>
        <p className="text-sm text-muted-foreground">{achievement.description}</p>
      </div>
      <div className="text-sm font-semibold text-yellow-500">+{achievement.xpReward} XP</div>
    </div>
  );
}

// Main Progress Page Component
export default function ProgressPage() {
  // Mock current user data
  const currentUser: CurrentUser = {
    id: 'progress-user-1',
    name: 'Progress Learner',
    email: 'learner@example.com',
    level: 'intermediate',
    totalPoints: 2347,
    streakDays: 7
  };

  // Mock data - would come from your state management system
  const [overallGrade] = useState<GradeCalculation>({
    letter: 'B+',
    percentage: 87,
    color: '#0891B2',
    description: 'Very Good',
    feedback: '¡Bien hecho! Very good understanding.'
  });

  const [currentLevel] = useState<LearnerLevel>({
    id: 'conversationalist',
    title: 'Conversationalist',
    titleSpanish: 'Conversador',
    xpRequired: 1500,
    badge: '💬'
  });

  const [nextLevel] = useState<LearnerLevel>({
    id: 'intermediate',
    title: 'Intermediate',
    titleSpanish: 'Intermedio',
    xpRequired: 3000,
    badge: '🎯'
  });

  const [currentXP] = useState(2347);

  const [pageGrades] = useState<PageGrades>({
    practice: {
      letter: 'A-',
      percentage: 91,
      color: '#059669',
      description: 'Excellent',
      feedback: '¡Muy bien! Excellent progress.'
    },
    reading: {
      letter: 'B+',
      percentage: 86,
      color: '#0891B2', 
      description: 'Very Good',
      feedback: '¡Bien hecho! Very good understanding.'
    },
    memorize: {
      letter: 'A',
      percentage: 93,
      color: '#10B981',
      description: 'Excellent',
      feedback: '¡Excelente! Outstanding vocabulary mastery.'
    },
    conversation: {
      letter: 'B',
      percentage: 82,
      color: '#0284C7',
      description: 'Good', 
      feedback: 'Good progress. Keep practicing!'
    }
  });

  const [weeklyStats] = useState<WeeklyStats>({
    wordsMemorized: 23,
    sentencesPracticed: 156,
    readingTime: 145,
    conversationCount: 8,
    xpEarned: 347,
    streakDays: 5
  });

  const [recentAchievements] = useState<Achievement[]>([
    {
      id: 'vocab_200',
      title: 'Vocabulary Builder',
      description: 'Memorized 200 Spanish words',
      badge: '📚',
      xpReward: 300,
      unlockedAt: new Date()
    },
    {
      id: 'streak_5',
      title: 'Consistency Champion',
      description: '5 days of practice in a row',
      badge: '🔥',
      xpReward: 150,
      unlockedAt: new Date()
    }
  ]);

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Unified Header spanning full width - responsive - Fixed Position */}
      <header className="fixed top-0 left-0 right-0 z-50 flex border-b border-border bg-muted">
        {/* Logo Section - responsive */}
        <div className="w-64 px-6 py-4 border-r border-border hidden md:flex items-center justify-center">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <BookOpen className="w-5 h-5 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-xl font-normal text-foreground">AIdioma</h1>
            </div>
          </div>
        </div>
        
        {/* Mobile Logo - only on mobile */}
        <div className="md:hidden px-4 py-4 flex items-center">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <BookOpen className="w-5 h-5 text-primary-foreground" />
            </div>
            <h1 className="text-lg font-normal text-foreground">AIdioma</h1>
          </div>
        </div>
        
        {/* Header Content - responsive */}
        <div className="flex-1 px-6 py-4 flex items-center justify-start pl-4 md:pl-12">
          <h1 className="text-xl md:text-2xl font-semibold text-foreground tracking-tight">Progress Dashboard</h1>
        </div>
      </header>

      {/* Content Area */}
      <div className="flex flex-1 pt-16">
        {/* Shared Sidebar Component */}
        <SharedSidebar currentUser={currentUser} />

        {/* Main Content */}
        <main className="flex-1 flex flex-col md:ml-64">
          <div className="flex-1 flex flex-col p-4 md:p-6 pt-6 md:pt-8 bg-background">
            
            {/* Level Progress Section */}
            <div className="mb-6 max-w-4xl mx-auto w-full">
              <LevelProgress 
                currentLevel={currentLevel}
                currentXP={currentXP}
                nextLevel={nextLevel}
              />
            </div>

            {/* Weekly Stats Overview */}
            <div className="mb-6 max-w-4xl mx-auto w-full">
              <h2 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
                <Calendar className="w-5 h-5 text-blue-500" />
                This Week's Progress
              </h2>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                <MetricCard
                  icon={Star}
                  value={weeklyStats.wordsMemorized}
                  label="Words Memorized"
                  color="yellow"
                  trend="+5 from last week"
                />
                <MetricCard
                  icon={BookOpen}
                  value={weeklyStats.sentencesPracticed}
                  label="Sentences Practiced"
                  color="blue"
                  trend="+23 from last week"
                />
                <MetricCard
                  icon={Clock}
                  value={`${weeklyStats.readingTime}m`}
                  label="Reading Time"
                  color="green"
                  trend="+12m from last week"
                />
                <MetricCard
                  icon={MessageCircle}
                  value={weeklyStats.conversationCount}
                  label="Conversations"
                  color="purple"
                  trend="+3 from last week"
                />
                <MetricCard
                  icon={Zap}
                  value={weeklyStats.xpEarned}
                  label="XP Earned"
                  color="orange"
                  trend="+89 from last week"
                />
                <MetricCard
                  icon={TrendingUp}
                  value={weeklyStats.streakDays}
                  label="Day Streak"
                  color="red"
                  trend="Current streak"
                />
              </div>
            </div>

            {/* Page Performance Section */}
            <div className="mb-6 max-w-4xl mx-auto w-full">
              <h2 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
                <Target className="w-5 h-5 text-purple-500" />
                Performance by Learning Area
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <MetricCard
                  icon={BookOpen}
                  value="156"
                  label="Practice Sessions"
                  progress={91}
                  color="blue"
                  grade={pageGrades.practice.letter}
                  onClick={() => window.location.href = '/practice'}
                />
                <MetricCard
                  icon={BookOpen}
                  value="12"
                  label="Texts Completed"
                  progress={86}
                  color="green"
                  grade={pageGrades.reading.letter}
                  onClick={() => window.location.href = '/reading'}
                />
                <MetricCard
                  icon={Brain}
                  value="247"
                  label="Words Mastered"
                  progress={93}
                  color="purple"
                  grade={pageGrades.memorize.letter}
                  onClick={() => window.location.href = '/memorize'}
                />
                <MetricCard
                  icon={MessageCircle}
                  value="23"
                  label="Conversations"
                  progress={82}
                  color="orange"
                  grade={pageGrades.conversation.letter}
                  onClick={() => window.location.href = '/conversations'}
                />
              </div>
            </div>

            {/* Recent Achievements */}
            <div className="mb-6 max-w-4xl mx-auto w-full">
              <h2 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
                <Trophy className="w-5 h-5 text-yellow-500" />
                Recent Achievements
              </h2>
              <div className="space-y-3">
                {recentAchievements.map((achievement) => (
                  <AchievementItem key={achievement.id} achievement={achievement} />
                ))}
              </div>
            </div>

            {/* Next Milestones */}
            <div className="mb-6 max-w-4xl mx-auto w-full">
              <h2 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
                <ChevronRight className="w-5 h-5 text-blue-500" />
                Next Milestones
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-muted border border-border rounded-lg p-4">
                  <div className="flex items-center gap-3 mb-2">
                    <Star className="w-5 h-5 text-yellow-500" />
                    <h3 className="font-medium text-foreground">Word Master</h3>
                  </div>
                  <p className="text-sm text-muted-foreground mb-3">Memorize 500 Spanish words</p>
                  <div className="w-full bg-background rounded-full h-2">
                    <div className="bg-yellow-500 h-2 rounded-full" style={{ width: '49.4%' }} />
                  </div>
                  <div className="text-xs text-muted-foreground mt-1">247 / 500 words</div>
                </div>
                
                <div className="bg-muted border border-border rounded-lg p-4">
                  <div className="flex items-center gap-3 mb-2">
                    <TrendingUp className="w-5 h-5 text-purple-500" />
                    <h3 className="font-medium text-foreground">Consistency Champion</h3>
                  </div>
                  <p className="text-sm text-muted-foreground mb-3">Practice for 30 days straight</p>
                  <div className="w-full bg-background rounded-full h-2">
                    <div className="bg-purple-500 h-2 rounded-full" style={{ width: '16.7%' }} />
                  </div>
                  <div className="text-xs text-muted-foreground mt-1">5 / 30 days</div>
                </div>
              </div>
            </div>

          </div>
        </main>
      </div>
    </div>
  );
}
