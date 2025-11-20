export type QuestType = "on-chain" | "off-chain" | "social" | "community"
export type RewardType = "nft" | "token" | "xp" | "badge"
export type QuestStatus = "not-started" | "in-progress" | "completed" | "failed"
export type ChainType = "ethereum" | "polygon" | "arbitrum" | "optimism" | "base"

export interface Reward {
  id: string
  type: RewardType
  name: string
  value: string
  description?: string
}

export interface QuestStep {
  id: string
  title: string
  description: string
  completed: boolean
}

export interface Quest {
  id: string
  title: string
  description: string
  projectName: string
  projectLogo?: string
  type: QuestType
  category: string
  chain?: ChainType
  reward: Reward
  xpReward: number
  requirements: string[]
  steps: QuestStep[]
  startDate: string
  endDate: string
  participants: number
  completed: number
  status: QuestStatus
  difficulty: "easy" | "medium" | "hard"
  banner?: string
}

export interface User {
  id: string
  walletAddress: string
  ensName?: string
  avatar?: string
  xpPoints: number
  level: number
  completedQuests: number
  rank: number
  joinDate: string
  profileComplete?: boolean
  name?: string
  email?: string
}

export interface LeaderboardEntry {
  rank: number
  user: User
  xpPoints: number
}
