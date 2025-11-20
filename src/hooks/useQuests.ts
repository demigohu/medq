"use client"

import { useState, useEffect, useCallback } from "react"
import { api } from "@/lib/api"

export interface QuestData {
  id: string
  title?: string
  description?: string
  category: string
  protocol: string
  metadataURI: string
  rewardPerParticipant: string
  badgeLevel: string
  assignedParticipant: string
  status: string
  createdAt: string
  banner?: string
  type?: string
  difficulty?: string
  expiry?: string
  acceptedCount?: string | number
  completedCount?: string | number
}

export interface QuestProgress {
  accepted: boolean
  completed: boolean
}

export function useQuest(questId: number | null) {
  const [quest, setQuest] = useState<QuestData | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchQuest = useCallback(async () => {
    if (!questId) return

    setLoading(true)
    setError(null)
    try {
      const response = await api.getQuest(questId)
      setQuest(response.quest as any)
    } catch (err: any) {
      setError(err.message || "Failed to fetch quest")
    } finally {
      setLoading(false)
    }
  }, [questId])

  useEffect(() => {
    fetchQuest()
  }, [fetchQuest])

  return { quest, loading, error, refetch: fetchQuest }
}

export function useQuestProgress(questId: number | null, participant: string | null) {
  const [progress, setProgress] = useState<QuestProgress | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchProgress = useCallback(async () => {
    if (!questId || !participant) return

    setLoading(true)
    setError(null)
    try {
      const response = await api.getQuestProgress(questId, participant)
      setProgress(response.progress)
    } catch (err: any) {
      setError(err.message || "Failed to fetch progress")
    } finally {
      setLoading(false)
    }
  }, [questId, participant])

  useEffect(() => {
    fetchProgress()
  }, [fetchProgress])

  return { progress, loading, error, refetch: fetchProgress }
}

export function useSubmitProof() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const submitProof = useCallback(async (questId: number, transactionHash: string, participant?: string) => {
    setLoading(true)
    setError(null)
    try {
      const result = await api.submitProof(questId, {
        transactionHash,
        participant,
      })
      return result
    } catch (err: any) {
      setError(err.message || "Failed to submit proof")
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  return { submitProof, loading, error }
}

export function useGenerateQuest() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const generateQuest = useCallback(async (input: {
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
  }) => {
    setLoading(true)
    setError(null)
    try {
      const result = await api.generateQuest(input)
      return result
    } catch (err: any) {
      setError(err.message || "Failed to generate quest")
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  return { generateQuest, loading, error }
}

export interface UserQuest {
  id: string
  quest_id_on_chain: number
  title: string
  description?: string
  category?: string
  reward_per_participant?: string
  badge_level?: number
  quest_type: "daily" | "weekly" | "custom"
  status: string
  expiry_timestamp?: number
  created_at: string
}

export interface UserQuestsData {
  daily: UserQuest | null
  weekly: UserQuest | null
  all: UserQuest[]
}

export function useUserQuests(walletAddress: string | null) {
  const [quests, setQuests] = useState<UserQuestsData | null>(null)
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
      const response = await api.getUserQuests(walletAddress)
      const questsData = response.quests as any
      setQuests(questsData)

      // Backend automatically generates quests after profile save
      // No need to auto-generate here to avoid duplicate calls
    } catch (err: any) {
      setError(err.message || "Failed to fetch user quests")
      setQuests(null)
    } finally {
      setLoading(false)
    }
  }, [walletAddress])

  useEffect(() => {
    fetchQuests()
  }, [fetchQuests])

  return { quests, loading, error, refetch: fetchQuests }
}

