"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Trophy, Gift, Loader2 } from "lucide-react"
import Image from "next/image"
import { api } from "@/lib/api"
import { useUserStore } from "@/lib/store"

// Helper function to calculate XP reward based on quest type and badge level
function calculateXpReward(questType: string, badgeLevel: number): number {
  if (questType === "weekly") return 100
  if (questType === "daily") return 50
  // Default: 75 XP for custom quests, or based on badge level
  return 50 + badgeLevel * 25 // Minimum 50 XP, +25 per badge level
}

interface ProfileTabsProps {
  completedQuestCount: number
}

export function ProfileTabs({ completedQuestCount: initialCount }: ProfileTabsProps) {
  const [activeTab, setActiveTab] = useState<"quests" | "rewards">("quests")
  const [completedQuests, setCompletedQuests] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const { walletAddress } = useUserStore()

  // Use actual count from fetched data, fallback to initial count
  const completedQuestCount = completedQuests.length || initialCount

  // Fetch completed quests from backend
  useEffect(() => {
    if (!walletAddress) {
      setLoading(false)
      return
    }

    const fetchCompletedQuests = async () => {
      try {
        setLoading(true)
        const response = await api.getCompletedQuests(walletAddress)
        setCompletedQuests(response.quests || [])
      } catch (error) {
        console.error("Failed to fetch completed quests:", error)
        setCompletedQuests([])
      } finally {
        setLoading(false)
      }
    }

    fetchCompletedQuests()
  }, [walletAddress])

  // Fetch rewards (badges, NFTs) from backend
  const [rewards, setRewards] = useState<any[]>([])
  const [totalMedq, setTotalMedq] = useState<string>("0.00")
  const [loadingRewards, setLoadingRewards] = useState(true)

  useEffect(() => {
    if (!walletAddress) {
      setLoadingRewards(false)
      return
    }

    const fetchRewards = async () => {
      try {
        setLoadingRewards(true)
        const response = await api.getUserRewards(walletAddress)
        setRewards(response.rewards || [])
        setTotalMedq(response.totalMedq || "0.00")
      } catch (error) {
        console.error("Failed to fetch rewards:", error)
        setRewards([])
        setTotalMedq("0.00")
      } finally {
        setLoadingRewards(false)
      }
    }

    fetchRewards()
  }, [walletAddress])

  return (
    <div className="space-y-6">
      {/* Tabs */}
      <div className="flex gap-2 border-b border-border">
        <Button
          variant={activeTab === "quests" ? "default" : "ghost"}
          onClick={() => setActiveTab("quests")}
          className="rounded-b-none"
        >
          <Trophy className="w-4 h-4 mr-2" />
          Completed Quests ({completedQuestCount})
        </Button>
        <Button
          variant={activeTab === "rewards" ? "default" : "ghost"}
          onClick={() => setActiveTab("rewards")}
          className="rounded-b-none"
        >
          <Gift className="w-4 h-4 mr-2" />
          Rewards ({rewards.length})
        </Button>
      </div>

      {/* Content */}
      {activeTab === "quests" && (
        <div className="space-y-3">
          {loading ? (
            <div className="text-center py-8">
              <Loader2 className="w-8 h-8 animate-spin text-muted-foreground mx-auto mb-3" />
              <p className="text-muted-foreground">Loading completed quests...</p>
            </div>
          ) : completedQuests.length > 0 ? (
            completedQuests.map((quest) => {
              const xpReward = calculateXpReward(quest.quest_type || "custom", quest.badge_level || 1)
              return (
                <Card
                  key={quest.quest_id_on_chain || quest.id}
                  className="p-4 bg-card/50 hover:shadow-lg hover:shadow-primary/10 transition-all cursor-pointer group"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <h4 className="font-semibold text-foreground group-hover:text-primary transition">
                        {quest.title || `Quest #${quest.quest_id_on_chain}`}
                      </h4>
                      {quest.project_name && (
                        <p className="text-sm text-muted-foreground mt-1">{quest.project_name}</p>
                      )}
                      {quest.description && (
                        <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{quest.description}</p>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      {quest.badge_level && (
                        <Badge variant="secondary" className="shrink-0">
                          Level {quest.badge_level}
                        </Badge>
                      )}
                      <span className="text-lg font-bold text-accent shrink-0">+{xpReward} XP</span>
                    </div>
                  </div>
                </Card>
              )
            })
          ) : (
            <div className="text-center py-8">
              <Trophy className="w-12 h-12 text-muted-foreground mx-auto mb-3 opacity-50" />
              <p className="text-muted-foreground">No completed quests yet. Start one to earn rewards!</p>
            </div>
          )}
        </div>
      )}

      {activeTab === "rewards" && (
        <div className="space-y-6">
          {/* Total MEDQ Summary */}
          {rewards.length > 0 && (
            <Card className="p-4 bg-linear-to-br from-accent/10 to-primary/10 border-accent/30">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total MEDQ Earned</p>
                  <p className="text-2xl font-bold text-foreground mt-1">{totalMedq} MEDQ</p>
                </div>
                <div className="p-3 rounded-lg bg-accent/20">
                  <Gift className="w-6 h-6 text-accent" />
                </div>
              </div>
            </Card>
          )}

          {/* Rewards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {loadingRewards ? (
              <div className="text-center py-8 md:col-span-2">
                <Loader2 className="w-8 h-8 animate-spin text-muted-foreground mx-auto mb-3" />
                <p className="text-muted-foreground">Loading rewards...</p>
              </div>
            ) : rewards.length > 0 ? (
              rewards.map((reward) => {
                const rewardAmount = reward.rewardAmount ? parseFloat(reward.rewardAmount) : 0
                const earnedDate = new Date(reward.earnedAt).toLocaleDateString()
                const xpReward = calculateXpReward(reward.questType || "custom", reward.badgeLevel)

                return (
                  <Card
                    key={reward.questId}
                    className="p-4 bg-linear-to-br from-primary/10 to-accent/10 border-primary/30 hover:shadow-lg hover:shadow-primary/20 transition-all cursor-pointer"
                  >
                    <div className="flex items-start justify-between gap-3 mb-3">
                      {/* Badge NFT Image */}
                      {reward.badgeImageUri ? (
                        <div className="w-16 h-16 rounded-lg border-2 border-primary/30 overflow-hidden bg-muted shrink-0">
                          <Image
                            src={reward.badgeImageUri}
                            alt={`Badge Level ${reward.badgeLevel}`}
                            width={64}
                            height={64}
                            className="w-full h-full object-cover"
                            unoptimized
                          />
                        </div>
                      ) : (
                        <div className="w-16 h-16 rounded-lg bg-primary/20 flex items-center justify-center shrink-0">
                          <Gift className="w-8 h-8 text-primary" />
                        </div>
                      )}
                      <span className="text-xs text-muted-foreground">{earnedDate}</span>
                    </div>

                    <h4 className="font-semibold text-foreground mb-1">
                      Badge Level {reward.badgeLevel}
                    </h4>
                    <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                      {reward.questTitle}
                    </p>

                    <div className="flex items-center gap-2 mb-3">
                      <Badge variant="outline" className="text-xs">
                        Level {reward.badgeLevel}
                      </Badge>
                      {reward.tokenId && (
                        <Badge variant="secondary" className="text-xs">
                          Token #{reward.tokenId}
                        </Badge>
                      )}
                    </div>

                    <div className="flex items-center gap-3 pt-3 border-t border-border/50">
                      <div>
                        <p className="text-xs text-muted-foreground">XP Earned</p>
                        <p className="text-sm font-semibold text-foreground">+{xpReward} XP</p>
                      </div>
                      {rewardAmount > 0 && (
                        <div>
                          <p className="text-xs text-muted-foreground">MEDQ Reward</p>
                          <p className="text-sm font-semibold text-accent">
                            {rewardAmount.toFixed(2)} MEDQ
                          </p>
                        </div>
                      )}
                    </div>
                  </Card>
                )
              })
            ) : (
              <div className="text-center py-8 md:col-span-2">
                <Gift className="w-12 h-12 text-muted-foreground mx-auto mb-3 opacity-50" />
                <p className="text-muted-foreground">No rewards yet. Complete quests to earn rewards!</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
