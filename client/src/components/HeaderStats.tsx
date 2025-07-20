import React from 'react'
import { BookOpen, CheckCircle, TrendingUp, Award, Flame, Star } from 'lucide-react'

interface HeaderStatsProps {
  currentSentence: number
  totalSentences: number
  correctCount: number
  streakCount: number
  pointsEarned: number
  className?: string
}

export function HeaderStats({ 
  currentSentence, 
  totalSentences, 
  correctCount, 
  streakCount, 
  pointsEarned,
  className = '' 
}: HeaderStatsProps) {
  const accuracy = totalSentences > 0 ? Math.round((correctCount / totalSentences) * 100) : 0

  const stats = [
    {
      icon: BookOpen,
      value: `${currentSentence}/${totalSentences}`,
      label: 'Cards',
      color: 'text-blue-500'
    },
    {
      icon: CheckCircle,
      value: correctCount.toString(),
      label: 'Today',
      color: 'text-green-500'
    },
    {
      icon: Flame,
      value: `${streakCount}`,
      label: 'Streak',
      color: 'text-orange-500'
    },
    {
      icon: Star,
      value: pointsEarned.toString(),
      label: 'Points',
      color: 'text-yellow-500'
    },
    {
      icon: TrendingUp,
      value: `${accuracy}%`,
      label: 'Progress',
      color: 'text-purple-500'
    }
  ]

  return (
    <div className={`flex items-center gap-4 ${className}`}>
      {stats.map((stat, index) => {
        const Icon = stat.icon
        return (
          <div key={index} className="flex items-center gap-1.5 text-sm">
            <Icon className={`w-4 h-4 ${stat.color}`} />
            <div className="flex flex-col leading-none">
              <span className="text-foreground font-medium text-sm">
                {stat.value}
              </span>
              <span className="text-muted-foreground text-xs">
                {stat.label}
              </span>
            </div>
          </div>
        )
      })}
    </div>
  )
} 