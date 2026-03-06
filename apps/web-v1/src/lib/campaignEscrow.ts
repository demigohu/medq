/**
 * CampaignEscrow contract utilities for frontend.
 * Partner deposit flow: approve USDC → CampaignEscrow.deposit(campaignIdBytes32, amount)
 */

import { keccak256, stringToHex, parseUnits } from "viem"
import { CONTRACT_ADDRESSES } from "./contracts"

// Re-export for convenience
export const CAMPAIGN_ESCROW_ADDRESS = CONTRACT_ADDRESSES.CAMPAIGN_ESCROW
export const USDC_ADDRESS = CONTRACT_ADDRESSES.USDC

/** USDC decimals on Hedera */
export const USDC_DECIMALS = 6

/**
 * Convert campaign UUID to bytes32 for contract.
 * Must match backend: campaignEscrowService.campaignIdToBytes32
 */
export function campaignIdToBytes32(campaignId: string): `0x${string}` {
  return keccak256(stringToHex(campaignId))
}

/**
 * Parse USDC amount (6 decimals) for contract calls.
 */
export function parseUsdcAmount(amount: number | string): bigint {
  return parseUnits(String(amount), USDC_DECIMALS)
}

/** CampaignEscrow ABI – functions needed for frontend */
export const CAMPAIGN_ESCROW_ABI = [
  {
    type: "function",
    name: "deposit",
    inputs: [
      { name: "campaignId", type: "bytes32", internalType: "bytes32" },
      { name: "amount", type: "uint256", internalType: "uint256" },
    ],
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "campaignBalance",
    inputs: [{ name: "campaignId", type: "bytes32", internalType: "bytes32" }],
    outputs: [{ name: "", type: "uint256", internalType: "uint256" }],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "rewardToken",
    inputs: [],
    outputs: [{ name: "", type: "address", internalType: "contract IERC20" }],
    stateMutability: "view",
  },
] as const

/** ERC20 approve – for USDC approve before deposit */
export const ERC20_APPROVE_ABI = [
  {
    type: "function",
    name: "approve",
    inputs: [
      { name: "spender", type: "address", internalType: "address" },
      { name: "amount", type: "uint256", internalType: "uint256" },
    ],
    outputs: [{ name: "", type: "bool", internalType: "bool" }],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "allowance",
    inputs: [
      { name: "owner", type: "address", internalType: "address" },
      { name: "spender", type: "address", internalType: "address" },
    ],
    outputs: [{ name: "", type: "uint256", internalType: "uint256" }],
    stateMutability: "view",
  },
] as const
