"use client"

import { useState, useEffect, useCallback } from "react"
import { api } from "@/lib/api"

export function useAllQuests(participant?: string | null) {
  const [quests, setQuests] = useState<Record<string, unknown>[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchQuests = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await api.getAllQuests(participant)
      setQuests(res.quests || [])
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to fetch quests")
    } finally {
      setLoading(false)
    }
  }, [participant])

  useEffect(() => {
    fetchQuests()
  }, [fetchQuests])

  return { quests, loading, error, refetch: fetchQuests }
}

export function useUserQuests(walletAddress: string | null) {
  const [quests, setQuests] = useState<{
    daily: Record<string, unknown> | null
    weekly: Record<string, unknown> | null
    all: Record<string, unknown>[]
  } | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchQuests = useCallback(async () => {
    if (!walletAddress) {
      setQuests(null)
      return
    }
    setLoading(true)
    setError(null)
    try {
      const res = await api.getUserQuests(walletAddress)
      setQuests(res.quests)
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to fetch quests")
    } finally {
      setLoading(false)
    }
  }, [walletAddress])

  useEffect(() => {
    fetchQuests()
  }, [fetchQuests])

  return { quests, loading, error, refetch: fetchQuests }
}
