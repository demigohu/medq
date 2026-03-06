/**
 * API Client untuk backend Medq Quest
 */

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000"

export interface APIError {
  message: string
  error?: string
}

class APIClient {
  private baseURL: string

  constructor(baseURL: string = API_BASE_URL) {
    this.baseURL = baseURL
  }

  private async request<T>(
    endpoint: string,
    options?: RequestInit
  ): Promise<T> {
    const url = `${this.baseURL}${endpoint}`
    const response = await fetch(url, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...options?.headers,
      },
    })

    if (!response.ok) {
      const error = (await response.json().catch(() => ({
        message: response.statusText,
      }))) as APIError
      throw new Error(error.message || `HTTP ${response.status}`)
    }

    return response.json()
  }

  async health() {
    return this.request<{ status: string; network: string }>("/health")
  }

  // AI Quest Generation
  async generateQuest(input: {
    projectName: string
    goal: string
    chain: string
    protocol: string
    participant: string
    rewardAmount: string
    badgeLevel: number
    autoDeploy?: boolean
    categoryHint?: "swap" | "liquidity" | "stake" | "lend"
    expiry?: number
    extraNotes?: string
  }) {
    return this.request<{
      questDraft: {
        title: string
        shortSummary: string
        recommendedCategory: string
        difficulty: string
        requirements: string[]
        steps: Array<{ title: string; description: string }>
        parameters: {
          actionPlan: string
          successCriteria: string
          evidenceHint: string
        }
        metadataSnippet: string
      }
      onChainResult?: {
        questId: string
        transactionHash: string
      }
    }>("/ai/quests", {
      method: "POST",
      body: JSON.stringify(input),
    })
  }

  async getProtocols() {
    return this.request<{
      protocols: Array<{
        name: string
        hederaId: string
        evmAddress: string
        category: string
        website: string
        description: string
      }>
    }>("/ai/protocols")
  }

  // Quest Operations
  async getQuest(questId: number) {
    return this.request<{
      quest: {
        id: string
        agentId: string
        agentController: string
        categoryValue: number
        category: string
        protocol: string
        parametersHash: string
        metadataURI: string
        rewardToken: string
        rewardPerParticipant: string
        badgeLevel: string
        assignedParticipant: string
        acceptedCount: string
        completedCount: string
        expiry: string
        statusValue: number
        status: string
        createdAt: string
      }
    }>(`/quests/${questId}`)
  }

  async getQuestProgress(questId: number, participant: string) {
    return this.request<{
      questId: number
      participant: string
      progress: {
        accepted: boolean
        completed: boolean
      }
    }>(`/quests/${questId}/progress/${participant}`)
  }

  async submitProof(questId: number, data: { transactionHash: string; participant?: string }) {
    return this.request<{
      message: string
      questId: string
      transactionHash: string
      verification: {
        transactionHash: string
        mirrorNodeTx?: any
      }
    }>(`/quests/${questId}/submit-proof`, {
      method: "POST",
      body: JSON.stringify(data),
    })
  }

  // User & Leaderboard
  async getUserStats(walletAddress: string) {
    return this.request<{
      stats: {
        user_id: string
        wallet_address: string
        total_xp: number
        completed_quests: number
        level: number
        rank: number | null
        updated_at: string
        name?: string
        email?: string
      }
    }>(`/quests/users/${walletAddress}/stats`)
  }

  async saveProfile(walletAddress: string, data: { name: string; email: string }) {
    return this.request<{
      success: boolean
      message: string
      user: {
        user_id: string
        wallet_address: string
        name: string
        email: string
        avatar_url?: string
      }
    }>(`/quests/users/${walletAddress}/profile`, {
      method: "POST",
      body: JSON.stringify(data),
    })
  }

  async updateAvatar(walletAddress: string, avatarUrl: string) {
    return this.request<{
      success: boolean
      message: string
      user: {
        user_id: string
        wallet_address: string
        avatar_url?: string
      }
    }>(`/quests/users/${walletAddress}/avatar`, {
      method: "PATCH",
      body: JSON.stringify({ avatar_url: avatarUrl }),
    })
  }

  async getLeaderboard(limit: number = 100) {
    return this.request<{
      leaderboard: Array<{
        user_id: string
        wallet_address: string
        total_xp: number
        completed_quests: number
        level: number
        rank: number
        updated_at: string
        name?: string
        email?: string
        avatar_url?: string
      }>
    }>(`/quests/leaderboard?limit=${limit}`)
  }

  // Daily & Weekly Quests
  async generateUserQuests(walletAddress: string) {
    return this.request<{
      success: boolean
      message: string
      quests: {
        daily?: { questId: number; transactionHash: string } | null
        weekly?: { questId: number; transactionHash: string } | null
      }
      errors?: { daily?: string; weekly?: string }
    }>(`/quests/users/${walletAddress}/generate-quests`, {
      method: "POST",
    })
  }

  async getUserQuests(walletAddress: string) {
    return this.request<{
      quests: {
        daily: any | null
        weekly: any | null
        all: any[]
      }
    }>(`/quests/users/${walletAddress}/quests`)
  }

  // Get all active quests
  // Optional: filter by participant wallet address
  async getAllQuests(participant?: string | null) {
    const url = participant 
      ? `/quests?participant=${encodeURIComponent(participant)}`
      : `/quests`
    return this.request<{
      quests: any[]
    }>(url)
  }

  // Get completed quests for a user
  async getCompletedQuests(walletAddress: string) {
    return this.request<{
      quests: Array<{
        id?: number
        quest_id_on_chain: number
        title: string
        description?: string
        project_name?: string
        category?: string
        quest_type?: string
        reward_per_participant?: string
        badge_level?: number
        completionTxHash?: string
        completedAt?: string
      }>
    }>(`/quests/users/${walletAddress}/completed`)
  }

  // Get user rewards (badge NFTs)
  async getUserRewards(walletAddress: string) {
    return this.request<{
      rewards: Array<{
        tokenId?: number
        questId: number
        questTitle: string
        badgeLevel: number
        questType: string
        rewardAmount?: string
        badgeImageUri?: string
        transactionHash: string
        earnedAt: string
      }>
      totalMedq: string // Total MEDQ earned across all quests
    }>(`/quests/users/${walletAddress}/rewards`)
  }

  // ─── Campaign Marketplace (Partner Campaign) ───────────────────────────

  async createCampaign(data: {
    partner_wallet: string
    title: string
    template_type: "swap" | "deposit" | "borrow" | "stake"
    description?: string
    thumbnail?: string
    template_params: Record<string, unknown>
    pool_amount: number
    max_participants: number
    period_start?: string
    period_end?: string
  }) {
    return this.request<Campaign>(`/campaigns`, {
      method: "POST",
      body: JSON.stringify(data),
    })
  }

  async listCampaigns(params?: {
    status?: string
    partner?: string
    limit?: number
  }) {
    const search = new URLSearchParams()
    if (params?.status) search.set("status", params.status)
    if (params?.partner) search.set("partner", params.partner)
    if (params?.limit) search.set("limit", String(params.limit))
    const q = search.toString()
    return this.request<{ campaigns: Campaign[] }>(
      `/campaigns${q ? `?${q}` : ""}`
    )
  }

  async getCampaign(id: string) {
    return this.request<Campaign>(`/campaigns/${id}`)
  }

  async joinCampaign(id: string, participant: string) {
    return this.request<{
      message: string
      questIdOnChain: number
      deploymentTxHash: string
    }>(`/campaigns/${id}/join`, {
      method: "POST",
      body: JSON.stringify({ participant }),
    })
  }

  async activateCampaign(id: string, escrowTxHash?: string) {
    return this.request<{ message: string }>(`/campaigns/${id}/activate`, {
      method: "POST",
      body: JSON.stringify({ escrow_tx_hash: escrowTxHash }),
    })
  }
}

export interface Campaign {
  id: string
  partner_wallet: string
  title: string
  status: "draft" | "pending" | "active" | "completed" | "cancelled"
  template_type: "swap" | "deposit" | "borrow" | "stake"
  template_params: Record<string, unknown>
  pool_token: string
  pool_amount: string | number
  max_participants: number
  reward_per_quest_usdc: string | number
  medq_per_quest?: number | null
  participant_count: number
  claimed_count: number
  thumbnail?: string | null
  description?: string | null
  start_at?: string | null
  end_at?: string | null
  created_at: string
  updated_at: string
}

export const api = new APIClient()

