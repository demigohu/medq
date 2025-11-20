"use client"

import type { Reward } from "@/lib/types"
import { Card } from "@/components/ui/card"
import { Trophy, Coins, Medal, Gift } from "lucide-react"

interface RewardCardProps {
  reward: Reward
  xpReward?: number
}

const rewardIcons = {
  nft: Trophy,
  token: Coins,
  badge: Medal,
  xp: Gift,
}

export function RewardCard({ reward, xpReward }: RewardCardProps) {
  const Icon = rewardIcons[reward.type]

  return (
    <Card className="overflow-hidden bg-linear-to-br from-card to-card/50 border-primary/30">
      <div className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="p-3 rounded-lg bg-primary/20">
            <Icon className="w-6 h-6 text-primary" />
          </div>
          <span className="text-xs font-semibold text-muted-foreground uppercase">{reward.type}</span>
        </div>

        <h3 className="text-lg font-bold text-foreground mb-2">{reward.name}</h3>
        <p className="text-sm text-muted-foreground mb-4">{reward.description}</p>

        <div className="flex items-center justify-between pt-4 border-t border-border">
          <span className="text-sm text-muted-foreground">Reward Amount</span>
          <span className="text-xl font-bold text-accent">{reward.value}</span>
        </div>

        {xpReward && (
          <div className="flex items-center justify-between pt-3">
            <span className="text-sm text-muted-foreground">XP Points</span>
            <span className="text-lg font-bold text-primary">{xpReward} XP</span>
          </div>
        )}
      </div>
    </Card>
  )
}
