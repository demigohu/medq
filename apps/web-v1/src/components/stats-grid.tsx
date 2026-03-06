"use client"

import type { User } from "@/lib/types"
import { Card } from "@/components/ui/card"
import { Zap, Trophy, CheckCircle2, TrendingUp } from "lucide-react"
import { getXpNeededForNextLevel, getProgressToNextLevel } from "@/lib/levelCalculator"
import { Progress } from "@/components/ui/progress"

interface StatsGridProps {
  user: User
}

export function StatsGrid({ user }: StatsGridProps) {
  const stats = [
    {
      label: "XP Points",
      value: user.xpPoints.toLocaleString(),
      icon: Zap,
      color: "text-primary",
      bgColor: "bg-primary/10",
    },
    {
      label: "Current Level",
      value: `${user.level}`,
      icon: TrendingUp,
      color: "text-accent",
      bgColor: "bg-accent/10",
      subtitle: `${getXpNeededForNextLevel(user.xpPoints).toLocaleString()} XP to Level ${user.level + 1}`,
      progress: getProgressToNextLevel(user.xpPoints),
    },
    {
      label: "Quests Completed",
      value: user.completedQuests,
      icon: CheckCircle2,
      color: "text-primary",
      bgColor: "bg-primary/10",
    },
    {
      label: "Leaderboard Rank",
      value: user.rank ? `#${user.rank}` : "Unranked",
      icon: Trophy,
      color: "text-accent",
      bgColor: "bg-accent/10",
    },
  ]

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((stat) => {
        const Icon = stat.icon
        return (
          <Card key={stat.label} className="p-6 bg-card/50">
            <div className="flex items-start justify-between mb-3">
              <div>
                <p className="text-sm text-muted-foreground mb-1">{stat.label}</p>
                <p className="text-2xl font-bold text-foreground">{stat.value}</p>
                {stat.subtitle && (
                  <p className="text-xs text-muted-foreground mt-1">{stat.subtitle}</p>
                )}
              </div>
              <div className={`p-3 rounded-lg ${stat.bgColor}`}>
                <Icon className={`w-5 h-5 ${stat.color}`} />
              </div>
            </div>
            {stat.progress !== undefined && (
              <Progress value={stat.progress} className="h-2" />
            )}
          </Card>
        )
      })}
    </div>
  )
}
