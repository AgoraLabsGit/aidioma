import React from 'react'
import { BookOpen, CheckCircle, TrendingUp, Award } from 'lucide-react'

interface ProgressStatsProps {
  currentSentence: number
  totalSentences: number
  correctCount: number
  streakCount: number
  className?: string
}

export function ProgressStats({ 
  currentSentence, 
  totalSentences, 
  correctCount, 
  streakCount, 
  className = '' 
}: ProgressStatsProps) {
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
      icon: Award,
      value: streakCount.toString(),
      label: 'Mastered',
      color: 'text-orange-500'
    },
    {
      icon: TrendingUp,
      value: `${accuracy}%`,
      label: 'Progress',
      color: 'text-purple-500'
    }
  ]

  return (
    <div className={`bg-card border border-border rounded-lg shadow-sm p-4 h-full ${className}`}>
      <div className="flex flex-col justify-center gap-6 h-full">
        {stats.map((stat, index) => {
          const Icon = stat.icon
          return (
                      <div key={index} className="flex items-center justify-between">
            <div className="text-left flex-1">
              <div className="text-lg font-bold text-foreground leading-tight">
                {stat.value}
              </div>
              <div className="text-xs text-muted-foreground leading-tight">
                {stat.label}
              </div>
            </div>
            <Icon className={`w-6 h-6 ${stat.color} ml-2`} />
          </div>
          )
        })}
      </div>
    </div>
  )
} 