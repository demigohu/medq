/**
 * Contract addresses for Medq platform on Hedera Testnet
 */

export const CONTRACT_ADDRESSES = {
  MEDQ_TOKEN: (process.env.NEXT_PUBLIC_MEDQ_TOKEN_ADDRESS || "") as `0x${string}`,
  BADGE_NFT: (process.env.NEXT_PUBLIC_BADGE_NFT_ADDRESS || "") as `0x${string}`,
  QUEST_MANAGER: (process.env.NEXT_PUBLIC_QUEST_MANAGER_ADDRESS || "") as `0x${string}`,
  CAMPAIGN_ESCROW: (process.env.NEXT_PUBLIC_CAMPAIGN_ESCROW_ADDRESS ||
    "0x66fb7f3f5e7148D94D846890d898eb06dCfE8fa2") as `0x${string}`,
  USDC: (process.env.NEXT_PUBLIC_USDC_ADDRESS ||
    "0x0000000000000000000000000000000000001549") as `0x${string}`,
} as const
