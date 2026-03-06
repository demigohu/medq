"use client"

import type { LeaderboardEntry as LeaderboardEntryType } from "@/lib/types"
import { motion } from "framer-motion"
import { Crown, TrendingUp } from "lucide-react"
import Image from "next/image"
import { Badge } from "@/components/ui/badge"

interface LeaderboardEntryProps {
  entry: LeaderboardEntryType
  index: number
  isCurrentUser?: boolean
}

export function LeaderboardEntry({ entry, index, isCurrentUser }: LeaderboardEntryProps) {
  const getRankColor = (rank: number) => {
    if (rank === 1) return "from-yellow-500/20 to-yellow-600/20 border-yellow-500/50"
    if (rank === 2) return "from-gray-400/20 to-gray-500/20 border-gray-400/50"
    if (rank === 3) return "from-orange-600/20 to-orange-700/20 border-orange-600/50"
    return "from-card to-card/50"
  }

  const getRankBadge = (rank: number) => {
    if (rank === 1) return <Crown className="w-5 h-5 text-yellow-500" />
    if (rank <= 3)
      return (
        <div className="w-6 h-6 rounded-full bg-linear-to-br from-muted-foreground to-foreground flex items-center justify-center text-xs font-bold text-background">
          {rank}
        </div>
      )
    return (
      <div className="w-6 h-6 rounded-full border border-border flex items-center justify-center text-xs font-semibold text-muted-foreground">
        {rank}
      </div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.05 }}
      className={`p-4 rounded-lg border bg-linear-to-r transition-all hover:shadow-lg hover:shadow-primary/20 ${getRankColor(
        entry.rank,
      )} ${isCurrentUser ? "ring-2 ring-primary/50" : ""}`}
    >
      <div className="flex items-center gap-4">
        {/* Rank Badge */}
        <div className="shrink-0">{getRankBadge(entry.rank)}</div>

        {/* User Info */}
        <div className="flex items-center gap-3 flex-1">
          <div className="w-10 h-10 rounded-full overflow-hidden border border-border shrink-0">
            <Image
              src={entry.user.avatar || "/placeholder.svg?height=40&width=40&query=user avatar" || "/placeholder.svg"}
              alt={entry.user.ensName || entry.user.name || "User avatar"}
              width={40}
              height={40}
              className="w-full h-full object-cover"
            />
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h4 className="font-semibold text-foreground truncate">
                {entry.user.name || entry.user.ensName || `${entry.user.walletAddress.slice(0, 6)}...${entry.user.walletAddress.slice(-4)}`}
              </h4>
              {isCurrentUser && (
                <Badge variant="secondary" className="text-xs shrink-0">
                  You
                </Badge>
              )}
            </div>
            <p className="text-xs text-muted-foreground">
              Level {entry.user.level} • {entry.user.completedQuests} quests
            </p>
          </div>
        </div>

        {/* XP and Stats */}
        <div className="flex items-center gap-4 shrink-0">
          <div className="text-right">
            <div className="flex items-center justify-end gap-1 mb-1">
              <TrendingUp className="w-3 h-3 text-primary" />
              <p className="text-sm font-bold text-foreground">{entry.xpPoints.toLocaleString()}</p>
            </div>
            <p className="text-xs text-muted-foreground">XP</p>
          </div>
        </div>
      </div>
    </motion.div>
  )
}
