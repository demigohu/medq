/**
 * Contract addresses for Medq platform on Hedera Testnet
 * These should match the deployed contract addresses
 * Set NEXT_PUBLIC_MEDQ_TOKEN_ADDRESS and NEXT_PUBLIC_BADGE_NFT_ADDRESS in .env.local
 */

export const CONTRACT_ADDRESSES = {
  MEDQ_TOKEN: (process.env.NEXT_PUBLIC_MEDQ_TOKEN_ADDRESS || "") as `0x${string}`, // ERC-20 MEDQ Token
  BADGE_NFT: (process.env.NEXT_PUBLIC_BADGE_NFT_ADDRESS || "") as `0x${string}`, // ERC-721 Badge NFT
  QUEST_MANAGER: (process.env.NEXT_PUBLIC_QUEST_MANAGER_ADDRESS || "") as `0x${string}`,
  REWARD_VAULT: (process.env.NEXT_PUBLIC_REWARD_VAULT_ADDRESS || "") as `0x${string}`,
  /** CampaignEscrow – partner USDC rewards (Hedera testnet) */
  CAMPAIGN_ESCROW: (process.env.NEXT_PUBLIC_CAMPAIGN_ESCROW_ADDRESS ||
    "0x66fb7f3f5e7148D94D846890d898eb06dCfE8fa2") as `0x${string}`,
  /** USDC on Hedera testnet (token 0.0.5449) */
  USDC: (process.env.NEXT_PUBLIC_USDC_ADDRESS ||
    "0x0000000000000000000000000000000000001549") as `0x${string}`,
} as const

/**
 * Token metadata for MEDQ token
 */
export const MEDQ_TOKEN_METADATA = {
  address: CONTRACT_ADDRESSES.MEDQ_TOKEN,
  symbol: "MEDQ",
  decimals: 18,
  image: "/medq.svg", // Optional: token logo URL
}

/**
 * NFT collection metadata for Badge NFT
 */
export const BADGE_NFT_METADATA = {
  address: CONTRACT_ADDRESSES.BADGE_NFT,
  symbol: "MQB",
  name: "MEDQ Quest Badges",
  image: "/medq.svg", // Optional: collection logo URL
}

