"use client"

import { useState, useEffect, useCallback } from "react"
import { api } from "@/lib/api"

export interface LeaderboardEntry {
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
}

export interface UserStats {
  user_id: string
  wallet_address: string
  total_xp: number
  completed_quests: number
  level: number
  rank: number | null
  updated_at: string
}

export function useLeaderboard(limit: number = 100) {
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchLeaderboard = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const response = await api.getLeaderboard(limit)
      setLeaderboard(response.leaderboard)
    } catch (err: any) {
      setError(err.message || "Failed to fetch leaderboard")
    } finally {
      setLoading(false)
    }
  }, [limit])

  useEffect(() => {
    fetchLeaderboard()
  }, [fetchLeaderboard])

  return { leaderboard, loading, error, refetch: fetchLeaderboard }
}

export function useUserStats(walletAddress: string | null) {
  const [stats, setStats] = useState<UserStats | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchStats = useCallback(async () => {
    if (!walletAddress) return

    setLoading(true)
    setError(null)
    try {
      const response = await api.getUserStats(walletAddress)
      setStats(response.stats)
    } catch (err: any) {
      setError(err.message || "Failed to fetch user stats")
    } finally {
      setLoading(false)
    }
  }, [walletAddress])

  useEffect(() => {
    fetchStats()
  }, [fetchStats])

  return { stats, loading, error, refetch: fetchStats }
}

