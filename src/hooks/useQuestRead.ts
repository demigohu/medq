"use client"

import { useReadContract } from 'wagmi'
import { QuestManager } from "../../contracts/abi/QuestManager"

const QUEST_MANAGER_ADDRESS = (process.env.NEXT_PUBLIC_QUEST_MANAGER_ADDRESS ||
  "0x2BFA986A1e40f8F2C3a6B518a6DFD570A43905dF") as `0x${string}`

const QuestManagerABI = QuestManager.abi

export function useReadQuest(questId: number) {
  const { data, error, isPending } = useReadContract({
    address: QUEST_MANAGER_ADDRESS,
    abi: QuestManagerABI as any,
    functionName: "getQuest",
    args: [BigInt(questId)],
  })

  return { quest: data, loading: isPending, error }
}

export function useReadQuestProgress(questId: number, participant: string) {
  const { data, error, isPending } = useReadContract({
    address: QUEST_MANAGER_ADDRESS,
    abi: QuestManagerABI as any,
    functionName: "participantProgress",
    args: [BigInt(questId), participant as `0x${string}`],
  })

  return { 
    progress: data as { accepted: boolean; completed: boolean } | undefined, 
    loading: isPending, 
    error 
  }
}

