"use client"

import { useCallback } from "react"
import { useReownWallet } from "./useReownWallet"
import { useWriteContract, useReadContract, useWaitForTransactionReceipt } from 'wagmi'
import { QuestManager } from "../../contracts/abi/QuestManager"
const QuestManagerABI = QuestManager.abi

const QUEST_MANAGER_ADDRESS = (process.env.NEXT_PUBLIC_QUEST_MANAGER_ADDRESS ||
  "0x2BFA986A1e40f8F2C3a6B518a6DFD570A43905dF") as `0x${string}`

export function useQuestContract() {
  const { wallet, isHederaNetwork } = useReownWallet()
  const { writeContract, data: hash, isPending, error: writeError } = useWriteContract()
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash })

  // Accept quest on-chain
  const acceptQuest = useCallback(
    async (questId: number) => {
      if (!wallet.isConnected || !wallet.address) {
        throw new Error("Wallet not connected")
      }

      if (!isHederaNetwork) {
        throw new Error("Please switch to Hedera Testnet")
      }

      try {
        writeContract({
          address: QUEST_MANAGER_ADDRESS,
          abi: QuestManagerABI as any,
          functionName: "acceptQuest",
          args: [BigInt(questId)],
        })

        // Return promise that resolves when transaction is confirmed
        return new Promise<{ transactionHash: `0x${string}`; success: boolean }>((resolve, reject) => {
          // Check success after a delay to allow transaction to be confirmed
          const checkSuccess = () => {
            if (isSuccess && hash) {
              resolve({
                transactionHash: hash,
                success: true,
              })
            } else if (writeError) {
              reject(new Error(writeError.message || "Failed to accept quest"))
            }
          }

          // Poll for success
          const interval = setInterval(() => {
            checkSuccess()
            if (isSuccess || writeError) {
              clearInterval(interval)
            }
          }, 500)

          // Cleanup after 30 seconds
          setTimeout(() => {
            clearInterval(interval)
            if (!isSuccess) {
              reject(new Error("Transaction timeout"))
            }
          }, 30000)
        })
      } catch (err: any) {
        throw new Error(err.message || "Failed to accept quest")
      }
    },
    [wallet, isHederaNetwork, writeContract, hash, isSuccess, writeError]
  )

  // Read quest from contract - Note: These need to be used in component, not here
  // They're hooks so they must be called at component top level
  // For now, we'll export separate hooks for these

  return {
    acceptQuest,
    loading: isPending || isConfirming,
    error: writeError?.message || null,
    isConnected: wallet.isConnected,
    isHederaNetwork,
    transactionHash: hash,
  }
}

