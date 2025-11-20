import { Abi, createPublicClient, createWalletClient, defineChain, http } from "viem"
import { privateKeyToAccount } from "viem/accounts"

import QuestManagerArtifact from "../../../contracts/out/QuestManager.sol/QuestManager.json"
import { env } from "../config/env"

export const hederaTestnet = defineChain({
  id: 296,
  name: "Hedera Testnet",
  nativeCurrency: {
    decimals: 18,
    name: "HBAR",
    symbol: "HBAR",
  },
  rpcUrls: {
    default: { http: [env.RPC_URL] },
    public: { http: [env.RPC_URL] },
  },
})

/**
 * Normalize private key to ensure it has 0x prefix and is valid hex
 */
function normalizePrivateKey(privateKey: string): `0x${string}` {
  if (!privateKey) {
    throw new Error("Private key cannot be empty")
  }

  // Remove whitespace
  const trimmed = privateKey.trim()

  // Ensure 0x prefix
  const normalized = trimmed.startsWith("0x") ? trimmed : `0x${trimmed}`

  // Validate hex format (should be 0x + 64 hex characters = 66 total)
  if (!/^0x[0-9a-fA-F]{64}$/.test(normalized)) {
    throw new Error(
      `Invalid private key format. Expected 64 hex characters (with or without 0x prefix), got: ${trimmed.substring(0, 20)}...`
    )
  }

  return normalized as `0x${string}`
}

// Agent Controller Account (untuk createQuest)
// Fallback ke PRIVATE_KEY jika AGENT_CONTROLLER_PRIVATE_KEY tidak di-set (legacy support)
const agentControllerPrivateKey = env.AGENT_CONTROLLER_PRIVATE_KEY || env.PRIVATE_KEY
if (!agentControllerPrivateKey) {
  throw new Error(
    "AGENT_CONTROLLER_PRIVATE_KEY or PRIVATE_KEY must be set in environment variables"
  )
}
export const agentControllerAccount = privateKeyToAccount(
  normalizePrivateKey(agentControllerPrivateKey)
)

// Completion Oracle Account (untuk recordCompletion)
export const oracleAccount = privateKeyToAccount(
  normalizePrivateKey(env.COMPLETION_ORACLE_PRIVATE_KEY)
)

const transport = http(env.RPC_URL)

// Agent Controller Wallet Client (untuk createQuest)
export const agentControllerWalletClient = createWalletClient({
  account: agentControllerAccount,
  chain: hederaTestnet,
  transport,
})

// Completion Oracle Wallet Client (untuk recordCompletion)
export const oracleWalletClient = createWalletClient({
  account: oracleAccount,
  chain: hederaTestnet,
  transport,
})

// Legacy exports (deprecated, use specific wallet clients instead)
export const account = agentControllerAccount
export const walletClient = agentControllerWalletClient

export const publicClient = createPublicClient({
  chain: hederaTestnet,
  transport,
})

export const questManagerAbi = QuestManagerArtifact.abi as Abi
export const questManagerAddress = env.QUEST_MANAGER_ADDRESS as `0x${string}`

export function getWalletAddress() {
  return agentControllerAccount.address
}

export function getOracleAddress() {
  return oracleAccount.address
}

