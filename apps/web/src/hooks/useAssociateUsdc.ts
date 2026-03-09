"use client"

import { useCallback } from "react"
import { useWriteContract, useWaitForTransactionReceipt } from "wagmi"
import { useAccount, useChainId } from "wagmi"
import { USDC_ADDRESS } from "@/lib/campaignEscrow"

const HEDERA_TESTNET_CHAIN_ID = 296

/** Hedera HTS precompile - associateToken(address account, address token) */
const HTS_PRECOMPILE = "0x0000000000000000000000000000000000000167" as const

const HTS_ASSOCIATE_ABI = [
  {
    type: "function",
    name: "associateToken",
    inputs: [
      { name: "account", type: "address", internalType: "address" },
      { name: "token", type: "address", internalType: "address" },
    ],
    outputs: [],
    stateMutability: "nonpayable",
  },
] as const

/** Hook to associate USDC (HTS token) with user's wallet on Hedera. Required before receiving USDC rewards. */
export function useAssociateUsdc() {
  const { address, isConnected } = useAccount()
  const chainId = useChainId()
  const isHederaNetwork = chainId === HEDERA_TESTNET_CHAIN_ID

  const { writeContract, data: hash, isPending, error: writeError } = useWriteContract()
  const { isLoading: isConfirming } = useWaitForTransactionReceipt({ hash })

  const associateUsdc = useCallback(async () => {
    if (!isConnected || !address) {
      throw new Error("Wallet not connected")
    }
    if (!isHederaNetwork) {
      throw new Error("Please switch to Hedera Testnet")
    }
    writeContract({
      address: HTS_PRECOMPILE,
      abi: HTS_ASSOCIATE_ABI,
      functionName: "associateToken",
      args: [address, USDC_ADDRESS],
    })
  }, [isConnected, address, isHederaNetwork, writeContract])

  return {
    associateUsdc,
    loading: isPending || isConfirming,
    error: (writeError as Error)?.message ?? null,
    isConnected,
    isHederaNetwork,
    hash,
  }
}
