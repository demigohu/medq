import { create } from "zustand"
import type { User, QuestStatus } from "./types"
import { api } from "./api"

interface UserState {
  user: User | null
  walletAddress: string | null
  isConnected: boolean
  setUser: (user: User) => void
  setWalletAddress: (address: string | null) => void
  setIsConnected: (connected: boolean) => void
  syncUserStats: (walletAddress: string) => Promise<void>
  updateQuestStatus: (questId: string, status: QuestStatus) => void
  addXP: (amount: number) => void
}

export const useUserStore = create<UserState>((set, get) => ({
  user: null,
  walletAddress: null,
  isConnected: false,
  setUser: (user) => set({ user }),
  setWalletAddress: (address) => set({ walletAddress: address }),
  setIsConnected: (connected) => set({ isConnected: connected }),
  syncUserStats: async (walletAddress: string) => {
    try {
      const response = await api.getUserStats(walletAddress)
      
      // Check if response and stats exist
      if (response && response.stats) {
        const stats = response.stats
        set({
          user: {
            id: stats.user_id || walletAddress,
            walletAddress: stats.wallet_address || walletAddress,
            xpPoints: stats.total_xp || 0,
            level: stats.level || 1,
            completedQuests: stats.completed_quests || 0,
            rank: stats.rank !== null && stats.rank !== undefined ? stats.rank : 0,
            joinDate: stats.updated_at || new Date().toISOString(),
            profileComplete: !!(stats.name && stats.email), // Check if profile is complete
            name: stats.name || undefined,
            email: stats.email || undefined,
            avatar: (stats as any).avatar_url || undefined, // Include avatar_url from backend
          },
          walletAddress,
          isConnected: true,
        })
      } else {
        // User not found - create placeholder user without throwing
        console.log("User not found, creating placeholder. Profile completion required.")
        set({
          user: {
            id: walletAddress,
            walletAddress,
            xpPoints: 0,
            level: 1,
            completedQuests: 0,
            rank: 0,
            joinDate: new Date().toISOString(),
            profileComplete: false,
          },
          walletAddress,
          isConnected: true,
        })
      }
    } catch (error: any) {
      // If user doesn't exist in DB yet or error occurred, create placeholder user
      // Only log error if it's not a network error from wallet extension
      const errorMessage = error?.message || ""
      if (!errorMessage.includes("chrome-extension") && !errorMessage.includes("Failed to fetch")) {
        console.log("Failed to fetch user stats, creating placeholder. Profile completion required.", error)
      }
      set({
        user: {
          id: walletAddress,
          walletAddress,
          xpPoints: 0,
          level: 1,
          completedQuests: 0,
          rank: 0,
          joinDate: new Date().toISOString(),
          profileComplete: false,
        },
        walletAddress,
        isConnected: true,
      })
    }
  },
  updateQuestStatus: (questId, status) =>
    set((state) => {
      if (!state.user) return state
      return {
        user: {
          ...state.user,
          completedQuests: status === "completed" ? state.user.completedQuests + 1 : state.user.completedQuests,
        },
      }
    }),
  addXP: (amount) =>
    set((state) => {
      if (!state.user) return state
      const newXP = state.user.xpPoints + amount
      const newLevel = Math.floor(newXP / 5000) + 1
      return {
        user: {
          ...state.user,
          xpPoints: newXP,
          level: newLevel,
        },
      }
    }),
}))
