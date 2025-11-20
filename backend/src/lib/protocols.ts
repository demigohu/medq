export interface Protocol {
  name: string
  hederaId: string // Hedera native account ID (0.0.xxxxx)
  evmAddress: string // EVM-compatible address (0x...)
  category: "swap" | "liquidity" | "stake" | "lend"
  website: string
  description: string
  logo?: string // Protocol logo URL or IPFS path
}

export const PROTOCOLS: Record<string, Protocol> = {
  SAUCERSWAP: {
    name: "SaucerSwap Finance",
    hederaId: "0.0.19264",
    evmAddress: "0x0000000000000000000000000000000000004b40",
    category: "swap",
    website: "https://testnet.saucerswap.finance/swap",
    description: "Decentralized exchange for token swaps on Hedera Testnet",
    logo: "ipfs://bafkreid64ufj4jk7dih5qio5ve6gvprdmfmbgfdxmyxha454pbhdb2wh4m", // TODO: Update with actual logo URL
  },
  BONZO: {
    name: "Bonzo Finance",
    hederaId: "0.0.7154915",
    evmAddress: "0x118dd8f2c0f2375496df1e069af1141fa034251b",
    category: "lend",
    website: "https://testnet.bonzo.finance/",
    description: "Lending and borrowing protocol on Hedera Testnet",
    logo: "ipfs://bafkreiex5codajdbxry4pj2eqhf23qi5yadqdkiptdxcqxwztw3cm2uabm", // TODO: Update with actual logo URL
  },
}

/**
 * Get protocol by EVM address (case-insensitive)
 */
export function getProtocolByAddress(address: string): Protocol | null {
  const normalized = address.toLowerCase()
  return (
    Object.values(PROTOCOLS).find(
      (p) => p.evmAddress.toLowerCase() === normalized
    ) || null
  )
}

/**
 * Get protocol by Hedera ID
 */
export function getProtocolByHederaId(hederaId: string): Protocol | null {
  return (
    Object.values(PROTOCOLS).find((p) => p.hederaId === hederaId) || null
  )
}

/**
 * Get all protocols
 */
export function getAllProtocols(): Protocol[] {
  return Object.values(PROTOCOLS)
}

/**
 * Get protocols by category
 */
export function getProtocolsByCategory(
  category: Protocol["category"]
): Protocol[] {
  return Object.values(PROTOCOLS).filter((p) => p.category === category)
}

