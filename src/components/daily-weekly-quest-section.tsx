"use client"

import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Calendar, Clock, Zap, Trophy, ArrowRight } from "lucide-react"
import Link from "next/link"
import { UserQuest } from "@/hooks/useQuests"
import { formatDistanceToNow } from "date-fns"

interface DailyWeeklyQuestSectionProps {
  dailyQuest: UserQuest | null
  weeklyQuest: UserQuest | null
  loading?: boolean
}

export function DailyWeeklyQuestSection({ dailyQuest, weeklyQuest, loading }: DailyWeeklyQuestSectionProps) {
  const formatExpiry = (timestamp?: number) => {
    if (!timestamp) return null
    const expiryDate = new Date(timestamp * 1000)
    return formatDistanceToNow(expiryDate, { addSuffix: true })
  }

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <Card className="p-6 bg-card/50 animate-pulse">
          <div className="h-6 bg-muted rounded mb-4"></div>
          <div className="h-4 bg-muted rounded mb-2"></div>
          <div className="h-4 bg-muted rounded w-2/3"></div>
        </Card>
        <Card className="p-6 bg-card/50 animate-pulse">
          <div className="h-6 bg-muted rounded mb-4"></div>
          <div className="h-4 bg-muted rounded mb-2"></div>
          <div className="h-4 bg-muted rounded w-2/3"></div>
        </Card>
      </div>
    )
  }

  return (
    <div className="mb-8">
      <h2 className="text-2xl font-bold text-foreground mb-4">Your Active Quests</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Daily Quest Card */}
        <Card className="p-6 bg-linear-to-br from-primary/10 to-primary/5 border-primary/30 hover:shadow-lg hover:shadow-primary/20 transition-all">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-2">
              <Calendar className="w-5 h-5 text-primary" />
              <h3 className="text-lg font-semibold text-foreground">Daily Quest</h3>
            </div>
            <Badge variant="secondary" className="bg-primary/20 text-primary">
              Daily
            </Badge>
          </div>
          
          {dailyQuest ? (
            <>
              <h4 className="text-xl font-bold text-foreground mb-2">{dailyQuest.title}</h4>
              {dailyQuest.description && (
                <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                  {dailyQuest.description}
                </p>
              )}
              
              <div className="flex flex-wrap gap-2 mb-4">
                {dailyQuest.reward_per_participant && (
                  <Badge variant="outline" className="bg-accent/10 text-accent border-accent/30 text-white">
                    <Zap className="w-3 h-3 mr-1" />
                    {parseFloat(dailyQuest.reward_per_participant).toLocaleString()} MEDQ
                  </Badge>
                )}
                {dailyQuest.badge_level && (
                  <Badge variant="outline" className="bg-primary/10 text-primary border-primary/30">
                    <Trophy className="w-3 h-3 mr-1" />
                    Level {dailyQuest.badge_level}
                  </Badge>
                )}
                {dailyQuest.expiry_timestamp && (
                  <Badge variant="outline" className="text-muted-foreground">
                    <Clock className="w-3 h-3 mr-1" />
                    Expires {formatExpiry(dailyQuest.expiry_timestamp)}
                  </Badge>
                )}
              </div>
              
              <Link href={`/quests/${dailyQuest.quest_id_on_chain}`}>
                <Button className="w-full bg-primary hover:bg-primary/90">
                  View Quest
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>
            </>
          ) : (
            <div className="text-center py-6">
              <Calendar className="w-12 h-12 text-muted-foreground mx-auto mb-3 opacity-50" />
              <p className="text-muted-foreground text-sm">
                No daily quest available yet. Check back tomorrow!
              </p>
            </div>
          )}
        </Card>

        {/* Weekly Quest Card */}
        <Card className="p-6 bg-linear-to-br from-primary/10 to-primary/5 border-primary/30 hover:shadow-lg hover:shadow-primary/20 transition-all">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-2">
              <Trophy className="w-5 h-5 text-primary" />
              <h3 className="text-lg font-semibold text-foreground">Weekly Quest</h3>
            </div>
            <Badge variant="secondary" className="bg-primary/20 text-primary">
              Weekly
            </Badge>
          </div>
          
          {weeklyQuest ? (
            <>
              <h4 className="text-xl font-bold text-foreground mb-2">{weeklyQuest.title}</h4>
              {weeklyQuest.description && (
                <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                  {weeklyQuest.description}
                </p>
              )}
              
              <div className="flex flex-wrap gap-2 mb-4">
                {weeklyQuest.reward_per_participant && (
                  <Badge variant="outline" className="bg-accent/10 text-accent border-accent/30 text-white">
                    <Zap className="w-3 h-3 mr-1" />
                    {parseFloat(weeklyQuest.reward_per_participant).toLocaleString()} MEDQ
                  </Badge>
                )}
                {weeklyQuest.badge_level && (
                  <Badge variant="outline" className="bg-primary/10 text-primary border-primary/30">
                    <Trophy className="w-3 h-3 mr-1" />
                    Level {weeklyQuest.badge_level}
                  </Badge>
                )}
                {weeklyQuest.expiry_timestamp && (
                  <Badge variant="outline" className="text-muted-foreground">
                    <Clock className="w-3 h-3 mr-1" />
                    Expires {formatExpiry(weeklyQuest.expiry_timestamp)}
                  </Badge>
                )}
              </div>
              
              <Link href={`/quests/${weeklyQuest.quest_id_on_chain}`}>
                <Button className="w-full bg-primary hover:bg-primary/90">
                  View Quest
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>
            </>
          ) : (
            <div className="text-center py-6">
              <Trophy className="w-12 h-12 text-muted-foreground mx-auto mb-3 opacity-50" />
              <p className="text-muted-foreground text-sm">
                No weekly quest available yet. Check back next week!
              </p>
            </div>
          )}
        </Card>
      </div>
    </div>
  )
}

