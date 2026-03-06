"use client";

import { useState, useMemo, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { QuestCard } from "@/components/quest-card";
import { QuestFilters, type FiltersState } from "@/components/quest-filters";
import { DailyWeeklyQuestSection } from "@/components/daily-weekly-quest-section";
import { useUserQuests } from "@/hooks/useQuests";
import { useReownWallet } from "@/hooks/useReownWallet";
import { api } from "@/lib/api";
import { BookOpen, Zap, Loader2 } from "lucide-react";
import { getProtocolByAddress } from "@/lib/protocols";

const deriveXpReward = (quest: any) => {
  const badgeLevel = Number(quest?.badge_level ?? 1)
  if (quest?.quest_type === "weekly" || badgeLevel >= 2) {
    return 100
  }
  if (quest?.quest_type === "daily" || badgeLevel === 1) {
    return 50
  }

  const rewardAmount = Number(quest?.reward_per_participant)
  if (!Number.isNaN(rewardAmount)) {
    return Math.max(25, Math.round(rewardAmount / 2))
  }

  return 75
}

export default function QuestsPage() {
  const { wallet } = useReownWallet()
  const { quests, loading: questsLoading, refetch: refetchQuests } = useUserQuests(
    wallet.isConnected ? wallet.address || null : null
  )
  const [allQuests, setAllQuests] = useState<any[]>([])
  const [loadingQuests, setLoadingQuests] = useState(false)
  const [searchTerm, setSearchTerm] = useState("");
  const [filters, setFilters] = useState<FiltersState>({
    type: [],
    category: [],
    difficulty: [],
    status: [],
  });

  // Fetch all quests from backend (filter by wallet address if connected)
  useEffect(() => {
    const fetchAllQuests = async () => {
      setLoadingQuests(true)
      try {
        // If wallet connected, only fetch quests assigned to this wallet address
        // Otherwise, fetch all active quests
        const participant = wallet.isConnected && wallet.address ? wallet.address : null
        const response = await api.getAllQuests(participant)
        console.log("Fetched quests from backend:", response.quests?.length || 0, participant ? `(for ${participant.slice(0, 6)}...)` : "(all active)")
        setAllQuests(response.quests || [])
      } catch (error) {
        console.error("Failed to fetch all quests:", error)
        setAllQuests([])
      } finally {
        setLoadingQuests(false)
      }
    }
    fetchAllQuests()
  }, [wallet.isConnected, wallet.address])

  // Transform backend quests to match QuestCard interface
  const transformedQuests = useMemo(() => {
    if (!allQuests || allQuests.length === 0) {
      console.log("No quests to transform, allQuests:", allQuests)
      return []
    }
    
    const transformed = allQuests.map((q: any) => {
      // Map reward_per_participant to reward object
      const rewardAmount = q.reward_per_participant ? parseFloat(q.reward_per_participant.toString()) : 0
      
      // Calculate status and completion based on progress (if available)
      let questStatus: "not-started" | "in-progress" | "completed" | "failed" = "not-started"
      let completedCount = 0
      
      if (q.progress) {
        // Progress is available (wallet connected and participant matches)
        if (q.progress.completed) {
          questStatus = "completed"
          completedCount = 1
        } else if (q.progress.accepted) {
          questStatus = "in-progress"
          completedCount = 0
        } else {
          questStatus = "not-started"
          completedCount = 0
        }
      } else {
        // No progress available (wallet not connected or quest not assigned to this user)
        questStatus = q.status === "active" ? "not-started" : (q.status || "not-started") as any
        completedCount = 0
      }
      
      return {
        id: q.quest_id_on_chain?.toString() || q.id?.toString() || "",
        title: q.title || "Untitled Quest",
        description: q.description || "",
        category: q.category || "swap",
        type: (q.quest_type === "daily" || q.quest_type === "weekly") ? "on-chain" : "on-chain",
        difficulty: "medium" as const, // Default since we don't store this
        status: questStatus,
        participants: 1,
        completed: completedCount,
        xpReward: deriveXpReward(q),
        projectName: q.project_name || "Medq Quest",
        banner: (() => {
          // Use protocol logo as fallback banner
          const protocol = q.protocol_address ? getProtocolByAddress(q.protocol_address) : null
          return protocol?.logo || undefined
        })(),
        // Required fields for Quest interface
        reward: {
          id: q.quest_id_on_chain?.toString() || q.id?.toString() || "",
          type: "token" as const,
          name: `${rewardAmount} MEDQ`,
          value: rewardAmount.toString(),
          description: `Reward: ${rewardAmount} MEDQ tokens`,
        },
        requirements: [],
        steps: [],
        startDate: q.created_at || new Date().toISOString(),
        endDate: q.expiry_timestamp ? new Date(q.expiry_timestamp * 1000).toISOString() : new Date().toISOString(),
      }
    })
    
    console.log("Transformed quests:", transformed.length, transformed)
    return transformed
  }, [allQuests])

  const filteredQuests = useMemo(() => {
    const filtered = transformedQuests.filter((quest) => {
      // Search filter
      if (searchTerm) {
        const term = searchTerm.toLowerCase();
        if (
          !quest.title.toLowerCase().includes(term) &&
          !quest.projectName.toLowerCase().includes(term) &&
          !quest.description.toLowerCase().includes(term)
        ) {
          return false;
        }
      }

      // Type filter
      if (filters.type.length > 0 && !filters.type.includes(quest.type)) {
        return false;
      }

      // Category filter
      if (
        filters.category.length > 0 &&
        !filters.category.includes(quest.category)
      ) {
        return false;
      }

      // Difficulty filter
      if (
        filters.difficulty.length > 0 &&
        !filters.difficulty.includes(quest.difficulty)
      ) {
        return false;
      }

      // Status filter
      if (filters.status.length > 0 && !filters.status.includes(quest.status)) {
        return false;
      }

      return true;
    });
    
    console.log("Filtered quests:", filtered.length, "from", transformedQuests.length)
    return filtered
  }, [searchTerm, filters, transformedQuests]);

  return (
    <main className="bg-background text-foreground">
      {/* Header */}
      <section className="border-b border-border bg-card/30 px-4 sm:px-6 lg:px-8 py-12">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center gap-2 mb-4">
            <BookOpen className="w-5 h-5 text-primary" />
            <span className="text-sm font-semibold text-primary uppercase tracking-wider">
              Quest Hub
            </span>
          </div>
          <h1 className="text-4xl font-bold text-foreground">
            Available Quests
          </h1>
          <p className="text-muted-foreground mt-2">
            {loadingQuests ? "Loading..." : wallet.isConnected && wallet.address 
              ? `${filteredQuests.length} quest${filteredQuests.length !== 1 ? "s" : ""} assigned to you`
              : `${filteredQuests.length} quest${filteredQuests.length !== 1 ? "s" : ""} available`}
          </p>
        </div>
      </section>

      {/* Content */}
      <section className="px-4 sm:px-6 lg:px-8 py-12">
        <div className="max-w-7xl mx-auto flex flex-col gap-4">
          {/* Daily & Weekly Quests - Only show if wallet connected */}
          {wallet.isConnected && wallet.address && (
            <DailyWeeklyQuestSection
              dailyQuest={quests?.daily || null}
              weeklyQuest={quests?.weekly || null}
              loading={questsLoading}
            />
          )}

          {/* Message for users without wallet */}
          {!wallet.isConnected && (
            <Card className="p-6 bg-muted/50 border-border mb-8">
              <div className="text-center">
                <BookOpen className="w-12 h-12 text-muted-foreground mx-auto mb-3 opacity-50" />
                <h3 className="text-lg font-semibold text-foreground mb-2">
                  Connect Your Wallet
                </h3>
                <p className="text-muted-foreground">
                  Connect your wallet to see your daily and weekly quests
                </p>
              </div>
            </Card>
          )}

          {/* Sidebar Filters */}
          <div>
            <QuestFilters
              onSearch={setSearchTerm}
              onFilterChange={setFilters}
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Quest Grid */}
            <div className="lg:col-span-3">
              <h2 className="text-2xl font-bold text-foreground mb-4">
                {wallet.isConnected && wallet.address ? "My Quests" : "All Quests"}
              </h2>
              {loadingQuests ? (
                <div className="text-center py-12">
                  <Loader2 className="w-8 h-8 animate-spin text-primary mx-auto mb-4" />
                  <p className="text-muted-foreground">Loading quests...</p>
                </div>
              ) : filteredQuests.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {filteredQuests.map((quest) => (
                    <QuestCard key={quest.id} quest={quest as any} />
                  ))}
                </div>
              ) : allQuests.length > 0 && transformedQuests.length === 0 ? (
                <div className="text-center py-12">
                  <Zap className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-50" />
                  <h3 className="text-lg font-semibold text-foreground mb-2">
                    Failed to Transform Quests
                  </h3>
                  <p className="text-muted-foreground text-sm">
                    Received {allQuests.length} quests from backend but failed to transform them.
                  </p>
                  <p className="text-muted-foreground text-xs mt-2">
                    Check console for errors.
                  </p>
                </div>
              ) : (
                <div className="text-center py-12">
                  <Zap className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-50" />
                  <h3 className="text-lg font-semibold text-foreground mb-2">
                    No quests found
                  </h3>
                  <p className="text-muted-foreground">
                    {searchTerm || filters.type.length > 0 || filters.category.length > 0 || filters.difficulty.length > 0 || filters.status.length > 0
                      ? "Try adjusting your filters or search term"
                      : "No active quests available yet. Check back soon!"}
                  </p>
                  {allQuests.length === 0 && !loadingQuests && (
                    <p className="text-muted-foreground text-xs mt-2">
                      Backend returned 0 quests. Make sure you have active quests in the database.
                    </p>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
