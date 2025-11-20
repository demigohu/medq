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

