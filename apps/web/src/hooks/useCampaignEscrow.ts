"use client"

import { useCallback } from "react"
import {
  useWriteContract,
  useReadContract,
  useWaitForTransactionReceipt,
  useAccount,
  useChainId,
} from "wagmi"
import {
  CAMPAIGN_ESCROW_ADDRESS,
  USDC_ADDRESS,
  CAMPAIGN_ESCROW_ABI,
  ERC20_APPROVE_ABI,
  campaignIdToBytes32,
  parseUsdcAmount,
} from "@/lib/campaignEscrow"

const HEDERA_TESTNET_CHAIN_ID = 296

/** Hook for CampaignEscrow: deposit, approve USDC, read balance */
export function useCampaignEscrow() {
  const { address, isConnected } = useAccount()
  const chainId = useChainId()
  const isHederaNetwork = chainId === HEDERA_TESTNET_CHAIN_ID

  const { writeContract, data: hash, isPending, error: writeError } = useWriteContract()
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash })

  const waitForTx = useCallback(
    () =>
      new Promise<`0x${string}`>((resolve, reject) => {
        if (isSuccess && hash) {
          resolve(hash)
          return
        }
        if (writeError) {
          reject(new Error((writeError as Error)?.message || "Transaction failed"))
          return
        }
        const interval = setInterval(() => {
          if (isSuccess && hash) {
            clearInterval(interval)
            resolve(hash)
          } else if (writeError) {
            clearInterval(interval)
            reject(new Error((writeError as Error)?.message || "Transaction failed"))
          }
        }, 500)
        setTimeout(() => {
          clearInterval(interval)
          if (!isSuccess && !writeError) {
            reject(new Error("Transaction timeout"))
          }
        }, 60000)
      }),
    [hash, isSuccess, writeError]
  )

  const approveUsdc = useCallback(
    async (amount: number | string) => {
      if (!isConnected || !address) {
        throw new Error("Wallet not connected")
      }
      if (!isHederaNetwork) {
        throw new Error("Please switch to Hedera Testnet")
      }
      const amountWei = parseUsdcAmount(amount)
      writeContract({
        address: USDC_ADDRESS,
        abi: ERC20_APPROVE_ABI,
        functionName: "approve",
        args: [CAMPAIGN_ESCROW_ADDRESS, amountWei],
      })
      return waitForTx()
    },
    [isConnected, address, isHederaNetwork, writeContract, waitForTx]
  )

  const deposit = useCallback(
    async (campaignId: string, amount: number | string) => {
      if (!isConnected || !address) {
        throw new Error("Wallet not connected")
      }
      if (!isHederaNetwork) {
        throw new Error("Please switch to Hedera Testnet")
      }
      const campaignIdBytes = campaignIdToBytes32(campaignId)
      const amountWei = parseUsdcAmount(amount)
      writeContract({
        address: CAMPAIGN_ESCROW_ADDRESS,
        abi: CAMPAIGN_ESCROW_ABI,
        functionName: "deposit",
        args: [campaignIdBytes, amountWei],
      })
      return waitForTx()
    },
    [isConnected, address, isHederaNetwork, writeContract, waitForTx]
  )

  return {
    approveUsdc,
    deposit,
    loading: isPending || isConfirming,
    error: (writeError as Error)?.message || null,
    isConnected,
    isHederaNetwork,
    transactionHash: hash,
    campaignIdToBytes32,
  }
}

/** Read campaign balance from escrow */
export function useCampaignBalance(campaignId: string | null) {
  const campaignIdBytes = campaignId ? campaignIdToBytes32(campaignId) : undefined
  const { data, error, isPending } = useReadContract({
    address: CAMPAIGN_ESCROW_ADDRESS,
    abi: CAMPAIGN_ESCROW_ABI,
    functionName: "campaignBalance",
    args: campaignIdBytes ? [campaignIdBytes] : undefined,
  })
  return {
    balance: data,
    balanceFormatted: data != null ? Number(data) / 1e6 : null,
    error,
    isPending,
  }
}
