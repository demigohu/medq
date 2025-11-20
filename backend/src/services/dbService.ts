import { supabase } from "../lib/supabase"
import { generateUserAvatar } from "../utils/avatarGenerator"

export interface User {
  id: string
  wallet_address: string
  ens_name?: string
  nickname?: string
  avatar_url?: string
  join_date: string
}

export interface Quest {
  id: string
  quest_id_on_chain: number
  agent_id?: number
  agent_controller?: string
  title: string
  description?: string
  project_name?: string
  category?: string
  protocol_address?: string
  metadata_uri?: string
  parameters_hash?: string
  reward_per_participant?: string
  badge_level?: number
  assigned_participant?: string
  expiry_timestamp?: number
  status: string
  quest_type?: "daily" | "weekly" | "custom"
  created_at: string
}

export interface QuestSubmission {
  id: string
  quest_id_on_chain: number
  participant_address: string
  transaction_hash: string
  mirror_node_payload?: any
  verification_status: string
  evidence_uri?: string
  completion_tx_hash?: string
  created_at: string
}

export interface UserXPEntry {
  id: string
  user_id: string
  wallet_address: string
  quest_id_on_chain: number
  xp_amount: number
  reward_amount?: string
  badge_token_id?: number
  completion_tx_hash?: string
  created_at: string
}

export interface UserStats {
  user_id: string
  wallet_address: string
  total_xp: number
  completed_quests: number
  level: number
  rank?: number
  updated_at: string
}

/**
 * Get or create user by wallet address
 */
export async function getOrCreateUser(walletAddress: string): Promise<User> {
  // Try to get existing user
  const { data: existingUser, error: getError } = await supabase
    .from("users")
    .select("*")
    .eq("wallet_address", walletAddress.toLowerCase())
    .single()

  if (existingUser && !getError) {
    return existingUser as User
  }

  // Create new user if not found
  const { data: newUser, error: createError } = await supabase
    .from("users")
    .insert({
      wallet_address: walletAddress.toLowerCase(),
    })
    .select()
    .single()

  if (createError || !newUser) {
    throw new Error(`Failed to create user: ${createError?.message}`)
  }

  return newUser as User
}

/**
 * Save quest metadata to database after AI generation
 */
export async function saveQuest(questData: {
  quest_id_on_chain: number
  agent_id?: number
  agent_controller?: string
  title: string
  description?: string
  project_name?: string
  category?: string
  protocol_address?: string
  metadata_uri?: string
  parameters_hash?: string
  reward_per_participant?: string
  badge_level?: number
  assigned_participant?: string
  expiry_timestamp?: number
  status?: string
  quest_type?: "custom" | "daily" | "weekly"
}): Promise<Quest> {
  // Check if quest already exists
  const existingQuest = await getQuestByOnChainId(questData.quest_id_on_chain)
  
  if (existingQuest) {
    // Update existing quest instead of creating new one
    const { data, error } = await supabase
      .from("quests")
      .update({
        ...questData,
        assigned_participant: questData.assigned_participant?.toLowerCase(),
        protocol_address: questData.protocol_address?.toLowerCase(),
        status: questData.status || "active",
        quest_type: questData.quest_type || "custom",
        updated_at: new Date().toISOString(),
      })
      .eq("quest_id_on_chain", questData.quest_id_on_chain)
      .select()
      .single()

    if (error || !data) {
      throw new Error(`Failed to update quest: ${error?.message}`)
    }

    return data as Quest
  }

  // Create new quest
  const { data, error } = await supabase
    .from("quests")
    .insert({
      ...questData,
      assigned_participant: questData.assigned_participant?.toLowerCase(),
      protocol_address: questData.protocol_address?.toLowerCase(),
      status: questData.status || "active",
      quest_type: questData.quest_type || "custom",
    })
    .select()
    .single()

  if (error || !data) {
    throw new Error(`Failed to save quest: ${error?.message}`)
  }

  return data as Quest
}

/**
 * Get quest by on-chain quest ID
 */
export async function getQuestByOnChainId(questIdOnChain: number): Promise<Quest | null> {
  const { data, error } = await supabase
    .from("quests")
    .select("*")
    .eq("quest_id_on_chain", questIdOnChain)
    .single()

  if (error || !data) {
    return null
  }

  return data as Quest
}

/**
 * Save quest submission (tx hash proof)
 */
export async function saveQuestSubmission(submission: {
  quest_id_on_chain: number
  participant_address: string
  transaction_hash: string
  mirror_node_payload?: any
  verification_status?: string
  evidence_uri?: string
}): Promise<QuestSubmission> {
  const { data, error } = await supabase
    .from("quest_submissions")
    .insert({
      ...submission,
      participant_address: submission.participant_address.toLowerCase(),
      verification_status: submission.verification_status || "pending",
    })
    .select()
    .single()

  if (error) {
    // Check if it's a duplicate
    if (error.code === "23505") {
      // Unique constraint violation - already exists
      const { data: existing } = await supabase
        .from("quest_submissions")
        .select("*")
        .eq("quest_id_on_chain", submission.quest_id_on_chain)
        .eq("transaction_hash", submission.transaction_hash)
        .single()

      if (existing) {
        return existing as QuestSubmission
      }
    }
    throw new Error(`Failed to save submission: ${error.message}`)
  }

  if (!data) {
    throw new Error("Failed to save submission: no data returned")
  }

  return data as QuestSubmission
}

/**
 * Check if transaction hash already submitted for quest
 */
export async function isTransactionHashSubmitted(
  questIdOnChain: number,
  txHash: string
): Promise<boolean> {
  const { data, error } = await supabase
    .from("quest_submissions")
    .select("id")
    .eq("quest_id_on_chain", questIdOnChain)
    .eq("transaction_hash", txHash)
    .single()

  return !error && !!data
}

/**
 * Update submission with completion tx hash
 */
export async function updateSubmissionCompletion(
  questIdOnChain: number,
  txHash: string,
  completionTxHash: string
): Promise<void> {
  const { error } = await supabase
    .from("quest_submissions")
    .update({
      verification_status: "verified",
      completion_tx_hash: completionTxHash,
      updated_at: new Date().toISOString(),
    })
    .eq("quest_id_on_chain", questIdOnChain)
    .eq("transaction_hash", txHash)

  if (error) {
    throw new Error(`Failed to update submission: ${error.message}`)
  }
}

/**
 * Record XP gain for user (triggers user_stats update)
 */
export async function recordXP(
  walletAddress: string,
  questIdOnChain: number,
  xpAmount: number,
  rewardAmount?: string,
  badgeTokenId?: number,
  completionTxHash?: string
): Promise<UserXPEntry> {
  // Get or create user first
  const user = await getOrCreateUser(walletAddress)

  const { data, error } = await supabase
    .from("user_xp_ledger")
    .insert({
      user_id: user.id,
      wallet_address: walletAddress.toLowerCase(),
      quest_id_on_chain: questIdOnChain,
      xp_amount: xpAmount,
      reward_amount: rewardAmount,
      badge_token_id: badgeTokenId,
      completion_tx_hash: completionTxHash,
    })
    .select()
    .single()

  if (error || !data) {
    throw new Error(`Failed to record XP: ${error?.message}`)
  }

  return data as UserXPEntry
}

/**
 * Get user stats for leaderboard
 * Also calculates rank based on total_xp
 */
export async function getUserStats(walletAddress: string): Promise<(UserStats & { name?: string; email?: string; avatar_url?: string }) | null> {
  // Get user stats and profile data
  const { data: stats, error: statsError } = await supabase
    .from("user_stats")
    .select("*")
    .eq("wallet_address", walletAddress.toLowerCase())
    .single()

  if (statsError || !stats) {
    return null
  }

  // Calculate rank: count how many users have more XP than this user
  // Only calculate rank if user has XP > 0
  let rank: number | null = null
  if (stats.total_xp > 0) {
    const { count, error: rankError } = await supabase
      .from("user_stats")
      .select("*", { count: "exact", head: true })
      .gt("total_xp", stats.total_xp)

    // Rank = number of users with more XP + 1
    // If count is null or error, rank is null (unranked)
    if (count !== null && !rankError) {
      rank = count + 1
    }
  }

  // Get user profile data (name, email, avatar_url)
  const { data: user, error: userError } = await supabase
    .from("users")
    .select("name, email, avatar_url")
    .eq("wallet_address", walletAddress.toLowerCase())
    .single()

  return {
    ...(stats as UserStats),
    rank,
    name: user?.name || undefined,
    email: user?.email || undefined,
    avatar_url: user?.avatar_url || undefined,
  }
}

/**
 * Save user profile (name, email)
 * Auto-generates avatar if not already set
 */
export async function saveProfile(
  walletAddress: string,
  profileData: { name: string; email: string; avatar_url?: string }
): Promise<User> {
  // Validate email format
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailRegex.test(profileData.email)) {
    throw new Error("Invalid email format")
  }

  // Validate name
  if (!profileData.name || profileData.name.trim().length === 0) {
    throw new Error("Name is required")
  }

  // Get existing user to check if avatar already exists
  const existingUser = await getOrCreateUser(walletAddress)

  // Generate avatar if not provided and user doesn't have one
  let avatarUrl = profileData.avatar_url
  if (!avatarUrl && !existingUser.avatar_url) {
    avatarUrl = generateUserAvatar(walletAddress)
  } else if (!avatarUrl) {
    // Keep existing avatar if not updating
    avatarUrl = existingUser.avatar_url
  }

  // Update user profile
  const { data, error } = await supabase
    .from("users")
    .update({
      name: profileData.name.trim(),
      email: profileData.email.trim().toLowerCase(),
      avatar_url: avatarUrl,
      updated_at: new Date().toISOString(),
    })
    .eq("wallet_address", walletAddress.toLowerCase())
    .select()
    .single()

  if (error || !data) {
    throw new Error(`Failed to save profile: ${error?.message || "Unknown error"}`)
  }

  return data as User
}

/**
 * Update user avatar
 */
export async function updateAvatar(
  walletAddress: string,
  avatarUrl: string
): Promise<User> {
  // Get or create user first
  await getOrCreateUser(walletAddress)

  // Update avatar
  const { data, error } = await supabase
    .from("users")
    .update({
      avatar_url: avatarUrl,
      updated_at: new Date().toISOString(),
    })
    .eq("wallet_address", walletAddress.toLowerCase())
    .select()
    .single()

  if (error || !data) {
    throw new Error(`Failed to update avatar: ${error?.message || "Unknown error"}`)
  }

  return data as User
}

/**
 * Get leaderboard (top users by XP)
 * Only includes users with XP > 0 (ranked users)
 */
export async function getLeaderboard(limit: number = 100): Promise<(UserStats & { name?: string; email?: string; avatar_url?: string })[]> {
  // Get user stats ordered by XP, only users with XP > 0 (ranked)
  const { data: statsData, error: statsError } = await supabase
    .from("user_stats")
    .select("user_id, wallet_address, total_xp, completed_quests, level, updated_at")
    .gt("total_xp", 0) // Only show users with XP > 0 (ranked)
    .order("total_xp", { ascending: false })
    .limit(limit)

  if (statsError || !statsData || statsData.length === 0) {
    return []
  }

  // Get profile data (name, email, avatar_url) from users table for all leaderboard entries
  const walletAddresses = statsData.map((s) => s.wallet_address.toLowerCase())
  const { data: usersData } = await supabase
    .from("users")
    .select("wallet_address, name, email, avatar_url")
    .in("wallet_address", walletAddresses)

  // Create a map of wallet_address -> user profile data
  const userProfileMap = new Map<string, { name?: string; email?: string; avatar_url?: string }>()
  usersData?.forEach((user) => {
    userProfileMap.set(user.wallet_address.toLowerCase(), {
      name: user.name || undefined,
      email: user.email || undefined,
      avatar_url: user.avatar_url || undefined,
    })
  })

  // Combine stats with profile data and assign ranks
  return statsData.map((stats, index) => {
    const profile = userProfileMap.get(stats.wallet_address.toLowerCase()) || {}
    return {
      ...(stats as UserStats),
      rank: index + 1,
      name: profile.name,
      email: profile.email,
      avatar_url: profile.avatar_url,
    }
  })
}

/**
 * Log AI generation
 */
export async function logAIGeneration(logData: {
  quest_id_on_chain?: number
  prompt_input?: any
  ai_output?: any
  metadata_uri?: string
  ipfs_cid?: string
  deployed_on_chain?: boolean
  deployment_tx_hash?: string
}): Promise<void> {
  const { error } = await supabase.from("ai_generation_logs").insert(logData)

  if (error) {
    console.error("Failed to log AI generation:", error)
    // Don't throw - logging failures shouldn't break the flow
  }
}

