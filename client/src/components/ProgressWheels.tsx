import React from 'react'
import { BookOpen, Brain, Flame } from 'lucide-react'

interface ProgressWheelProps {
  current: number
  target: number
  icon: React.ComponentType<{ className?: string }>
  color: string
  size?: number
}

function ProgressWheel({ current, target, icon: Icon, color, size = 48 }: ProgressWheelProps) {
  const percentage = Math.min((current / target) * 100, 100)
  const circumference = 2 * Math.PI * 18 // radius of 18
  const strokeDasharray = circumference
  const strokeDashoffset = circumference - (percentage / 100) * circumference

  return (
    <div className="relative" style={{ width: size, height: size }}>
      {/* Background circle */}
      <svg className="absolute inset-0 transform -rotate-90" width={size} height={size}>
        <circle
          cx={size / 2}
          cy={size / 2}
          r="18"
          stroke="currentColor"
          strokeWidth="3"
          fill="none"
          className="text-muted-foreground/20"
        />
        {/* Progress circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r="18"
          stroke={color}
          strokeWidth="3"
          fill="none"
          strokeLinecap="round"
          strokeDasharray={strokeDasharray}
          strokeDashoffset={strokeDashoffset}
          className="transition-all duration-300 ease-out"
        />
      </svg>
      
      {/* Icon in center */}
      <div className="absolute inset-0 flex items-center justify-center">
        <Icon className={`w-5 h-5 ${color.replace('stroke-', 'text-')}`} />
      </div>
    </div>
  )
}

interface ProgressWheelsProps {
  className?: string
}

export function ProgressWheels({ className = '' }: ProgressWheelsProps) {
  // Mock data - in real app, these would come from user settings/progress
  const dailySentences = { current: 7, target: 15 }
  const weeklyWords = { current: 12, target: 25 }
  const streakDays = { current: 4, target: 7 }

  return (
    <div className={`flex items-center gap-3 ${className}`}>
      {/* Daily Sentences */}
      <div className="relative group">
        <ProgressWheel
          current={dailySentences.current}
          target={dailySentences.target}
          icon={BookOpen}
          color="stroke-blue-500 text-blue-500"
        />
        {/* Tooltip */}
        <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 
                      opacity-0 group-hover:opacity-100 transition-opacity
                      px-2 py-1 bg-black text-white text-xs rounded whitespace-nowrap">
          {dailySentences.current}/{dailySentences.target} sentences today
        </div>
      </div>

      {/* Weekly Words */}
      <div className="relative group">
        <ProgressWheel
          current={weeklyWords.current}
          target={weeklyWords.target}
          icon={Brain}
          color="stroke-green-500 text-green-500"
        />
        {/* Tooltip */}
        <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 
                      opacity-0 group-hover:opacity-100 transition-opacity
                      px-2 py-1 bg-black text-white text-xs rounded whitespace-nowrap">
          {weeklyWords.current}/{weeklyWords.target} words this week
        </div>
      </div>

      {/* Streak Days */}
      <div className="relative group">
        <ProgressWheel
          current={streakDays.current}
          target={streakDays.target}
          icon={Flame}
          color="stroke-orange-500 text-orange-500"
        />
        {/* Tooltip */}
        <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 
                      opacity-0 group-hover:opacity-100 transition-opacity
                      px-2 py-1 bg-black text-white text-xs rounded whitespace-nowrap">
          {streakDays.current}/{streakDays.target} day streak
        </div>
      </div>
    </div>
  )
} 