export interface Protocol {
  name: string
  hederaId: string
  evmAddress: string
  category: "swap" | "liquidity" | "stake" | "lend"
  website: string
  description: string
}

export function getProtocolByAddress(address: string, protocols: Protocol[]): Protocol | null {
  const normalized = address?.toLowerCase()
  if (!normalized) return null
  return protocols.find(
    (p) =>
      p.evmAddress?.toLowerCase() === normalized ||
      (p as { routerAddresses?: string[] }).routerAddresses?.some((r) => r?.toLowerCase() === normalized)
  ) || null
}
