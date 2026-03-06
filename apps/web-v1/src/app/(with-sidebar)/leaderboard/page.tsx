"use client"

import { useState, useMemo } from "react"
import { LeaderboardEntry } from "@/components/leaderboard-entry"
import { LeaderboardSearch } from "@/components/leaderboard-search"
import { useLeaderboard } from "@/hooks/useLeaderboard"
import { useUserStore } from "@/lib/store"
import { Trophy, Zap, Users, TrendingUp, Loader2 } from "lucide-react"
import { Card } from "@/components/ui/card"
import Image from "next/image"

export default function LeaderboardPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const { leaderboard, loading, error } = useLeaderboard(100)
  const { user, walletAddress } = useUserStore()

  // Transform backend leaderboard to frontend format
  const allEntries = useMemo(() => {
    return leaderboard.map((entry) => ({
      rank: entry.rank,
      user: {
        id: entry.user_id,
        walletAddress: entry.wallet_address,
        xpPoints: entry.total_xp,
        level: entry.level,
        completedQuests: entry.completed_quests,
        rank: entry.rank,
        joinDate: entry.updated_at,
        name: entry.name,
        email: entry.email,
        avatar: entry.avatar_url,
      },
      xpPoints: entry.total_xp,
    }))
  }, [leaderboard])

  const filteredEntries = useMemo(() => {
    if (!searchTerm) return allEntries

    const term = searchTerm.toLowerCase()
    return allEntries.filter((entry) => {
      const addressMatch = entry.user.walletAddress.toLowerCase().includes(term)
      return addressMatch
    })
  }, [searchTerm, allEntries])

  // Sort by rank
  const sortedEntries = [...filteredEntries].sort((a, b) => a.rank - b.rank)

  const topEntry = sortedEntries[0]
  
  // Find current user in leaderboard, or use rank from user store if not in top 100
  const currentUserEntry = user
    ? sortedEntries.find((e) => e.user.walletAddress.toLowerCase() === walletAddress?.toLowerCase()) || 
      (user.rank && user.rank > 0
        ? {
            rank: user.rank,
            user: user,
            xpPoints: user.xpPoints,
          }
        : null)
    : null

  return (
    <main className="bg-background text-foreground">
      {/* Header */}
      <section className="border-b border-border bg-card/30 px-4 sm:px-6 lg:px-8 py-12">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center gap-2 mb-4">
          <Trophy className="w-5 h-5 text-primary" />
            <span className="text-sm font-semibold text-primary uppercase tracking-wider">
            Rankings
            </span>
          </div>
          <h1 className="text-4xl font-bold text-foreground">Leaderboard</h1>
          <p className="text-muted-foreground mt-2">Compete with the community and climb the ranks</p>
        </div>
      </section>

      {/* Content */}
      <section className="px-4 sm:px-6 lg:px-8 py-12">
        <div className="max-w-7xl mx-auto">
          {loading && (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin" />
            </div>
          )}

          {error && (
            <div className="text-center py-12">
              <p className="text-muted-foreground">Failed to load leaderboard: {error}</p>
            </div>
          )}

          {!loading && !error && (
            <>
          {/* Top Player Highlight */}
          {topEntry && (
            <div className="mb-12">
              <h2 className="text-lg font-bold text-foreground mb-4">Top Performer</h2>
              <Card className="overflow-hidden bg-linear-to-r from-yellow-500/20 via-yellow-600/20 to-yellow-700/20 border-yellow-500/50 p-6">
                <div className="flex flex-col md:flex-row items-center gap-6">
                  {/* Avatar */}
                  <div className="relative">
                    <div className="absolute inset-0 bg-linear-to-r from-yellow-500 to-yellow-600 rounded-2xl blur-lg opacity-50" />
                    <div className="relative w-24 h-24 rounded-2xl overflow-hidden border-4 border-background bg-gradient-to-br from-yellow-500 to-yellow-600 flex items-center justify-center">
                      <Trophy className="w-12 h-12 text-white" />
                    </div>
                  </div>

                  {/* Info */}
                  <div className="flex-1 text-center md:text-left">
                    <div className="flex items-center justify-center md:justify-start gap-2 mb-2">
                      <Trophy className="w-6 h-6 text-yellow-500" />
                      <h3 className="text-2xl font-bold text-foreground">
                        {topEntry.user.name || `${topEntry.user.walletAddress.slice(0, 6)}...${topEntry.user.walletAddress.slice(-4)}`}
                      </h3>
                    </div>
                    <p className="text-muted-foreground mb-4">
                      Level {topEntry.user.level} • {topEntry.user.completedQuests} quests completed
                    </p>

                    <div className="flex justify-center md:justify-start gap-4">
                      <div className="text-center md:text-left">
                        <p className="text-2xl font-bold text-yellow-500">{topEntry.xpPoints.toLocaleString()}</p>
                        <p className="text-xs text-muted-foreground">XP</p>
                      </div>
                      <div className="text-center md:text-left">
                        <p className="text-2xl font-bold text-foreground">#{topEntry.rank}</p>
                        <p className="text-xs text-muted-foreground">Rank</p>
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            </div>
          )}

          {/* Stats Overview */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-12">
            <Card className="p-4 bg-card/50">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Total Players</p>
                  <p className="text-2xl font-bold text-foreground">{allEntries.length}</p>
                </div>
                <Users className="w-8 h-8 text-primary opacity-50" />
              </div>
            </Card>
            <Card className="p-4 bg-card/50">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Your Rank</p>
                  <p className="text-2xl font-bold text-accent">#{currentUserEntry?.rank || "—"}</p>
                </div>
                <TrendingUp className="w-8 h-8 text-accent opacity-50" />
              </div>
            </Card>
            <Card className="p-4 bg-card/50">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Your XP</p>
                  <p className="text-2xl font-bold text-primary">
                    {currentUserEntry?.xpPoints.toLocaleString() || "0"}
                  </p>
                </div>
                <Zap className="w-8 h-8 text-primary opacity-50" />
              </div>
            </Card>
          </div>

          {/* Search and Filter */}
          <div className="mb-6">
            <LeaderboardSearch onSearch={setSearchTerm} />
          </div>

          {/* Leaderboard List */}
          {sortedEntries.length > 0 ? (
            <div className="space-y-3">
              {sortedEntries.map((entry, index) => (
                <LeaderboardEntry
                  key={entry.user.id}
                  entry={entry}
                  index={index}
                  isCurrentUser={user ? entry.user.walletAddress.toLowerCase() === walletAddress?.toLowerCase() : false}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <Trophy className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-50" />
              <h3 className="text-lg font-semibold text-foreground mb-2">No players found</h3>
              <p className="text-muted-foreground">Try adjusting your search term</p>
            </div>
          )}
            </>
          )}
        </div>
      </section>
    </main>
  )
}
