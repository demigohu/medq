"use client"

import { useState, useEffect, useCallback } from "react"
import { api } from "@/lib/api"

export function useCampaigns(params?: { status?: string; limit?: number }) {
  const [campaigns, setCampaigns] = useState<Record<string, unknown>[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchCampaigns = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await api.listCampaigns(params)
      setCampaigns(res.campaigns || [])
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to fetch campaigns")
    } finally {
      setLoading(false)
    }
  }, [params?.status, params?.limit])

  useEffect(() => {
    fetchCampaigns()
  }, [fetchCampaigns])

  return { campaigns, loading, error, refetch: fetchCampaigns }
}
