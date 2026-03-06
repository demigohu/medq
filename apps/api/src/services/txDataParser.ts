/**
 * Parse full transaction data from Mirror Node untuk verifikasi quest.
 * Menggunakan transfers + token_transfers dari seluruh child records.
 */

export type ActionType = "swap" | "deposit" | "borrow" | "stake"

export interface ParsedTxData {
  /** Total HBAR (tinybars) participant KIRIM (selalu positif) */
  participantHbarSent: number
  /** Total HBAR (tinybars) participant TERIMA */
  participantHbarReceived: number
  /** Per-token: net amount participant terima (positif) atau kirim (negatif), smallest unit */
  tokenFlow: Array<{ tokenId: string; netAmount: number; decimals?: number }>
  /** Inferred action dari structure: swap/deposit/borrow/stake */
  inferredAction: ActionType | null
  /** Entity/contract yang dipanggil di record pertama (ETHEREUMTRANSACTION) */
  primaryEntityId: string | null
}

export interface TxRecord {
  entity_id?: string
  name?: string
  transfers?: Array<{ account: string; amount: number; is_approval?: boolean }>
  token_transfers?: Array<{
    token_id: string
    account: string
    amount: number
    decimals?: number
    is_approval?: boolean
  }>
}

/**
 * Parse full transactions array dari Mirror Node response.
 * Aggregates transfers & token_transfers across all child records.
 */
export function parseFullTxData(
  transactions: TxRecord[],
  participantHederaId: string
): ParsedTxData {
  const participant = participantHederaId.toLowerCase().trim()
  let hbarSent = 0
  let hbarReceived = 0
  const tokenMap = new Map<string, { netAmount: number; decimals?: number }>()
  function getOrCreateToken(tokenId: string, decimals?: number) {
    const existing = tokenMap.get(tokenId)
    if (existing) return existing
    const neu: { netAmount: number; decimals?: number } = { netAmount: 0 }
    if (decimals != null) neu.decimals = decimals
    tokenMap.set(tokenId, neu)
    return neu
  }
  let primaryEntityId: string | null = null

  for (const rec of transactions) {
    if (rec.name === "ETHEREUMTRANSACTION" && rec.entity_id) {
      primaryEntityId = rec.entity_id
    }

    for (const t of rec.transfers ?? []) {
      if (t.account.toLowerCase() !== participant) continue
      if (t.amount < 0) {
        hbarSent += Math.abs(t.amount)
      } else {
        hbarReceived += t.amount
      }
    }

    for (const tt of rec.token_transfers ?? []) {
      if (tt.is_approval) continue
      if (tt.account.toLowerCase() !== participant) continue
      const existing = getOrCreateToken(tt.token_id, tt.decimals)
      existing.netAmount += tt.amount
      if (tt.decimals != null) existing.decimals = tt.decimals
    }
  }

  const tokenFlow = Array.from(tokenMap.entries()).map(([tokenId, v]) => {
    const item: { tokenId: string; netAmount: number; decimals?: number } = {
      tokenId,
      netAmount: v.netAmount,
    }
    if (v.decimals != null) item.decimals = v.decimals
    return item
  })

  const inferredAction = inferActionType(transactions, participant)
  return {
    participantHbarSent: hbarSent,
    participantHbarReceived: hbarReceived,
    tokenFlow,
    inferredAction,
    primaryEntityId,
  }
}

function inferActionType(transactions: TxRecord[], participant: string): ActionType | null {
  const first = transactions[0]
  if (!first) return null
  const name = (first.name ?? "").toUpperCase()
  if (name === "ETHEREUMTRANSACTION" || name === "CONTRACTCALL") {
    const hasTokenIn = transactions.some((r) =>
      (r.token_transfers ?? []).some(
        (t) => t.account.toLowerCase() === participant && t.amount < 0 && !t.is_approval
      )
    )
    const hasTokenOut = transactions.some((r) =>
      (r.token_transfers ?? []).some(
        (t) => t.account.toLowerCase() === participant && t.amount > 0 && !t.is_approval
      )
    )
    const hasHbarIn = transactions.some((r) =>
      (r.transfers ?? []).some((t) => t.account.toLowerCase() === participant && t.amount < 0)
    )
    const hasHbarOut = transactions.some((r) =>
      (r.transfers ?? []).some((t) => t.account.toLowerCase() === participant && t.amount > 0)
    )
    if (hasTokenIn && hasTokenOut) return "swap"
    if (hasHbarIn && hasTokenOut) return "swap"
    if (hasTokenIn && !hasTokenOut) return "deposit"
    if (hasTokenOut && !hasTokenIn) return "borrow"
    if (hasHbarIn || hasHbarOut) return "swap"
  }
  return null
}

export interface VerificationParams {
  minAmountTinybars?: number
  minTokenAmount?: number
  tokenIds?: string[]
  actionType?: ActionType
}

/**
 * Match parsed tx data terhadap quest verification params.
 * Jika params kosong, return true (fallback ke address-only verification).
 */
export function matchQuestRequirements(
  parsed: ParsedTxData,
  params: VerificationParams | null | undefined,
  protocolCategory?: string
): { match: boolean; reason?: string } {
  if (!params || Object.keys(params).length === 0) {
    return { match: true }
  }

  if (params.minAmountTinybars != null && params.minAmountTinybars > 0) {
    if (parsed.participantHbarSent < params.minAmountTinybars) {
      return {
        match: false,
        reason: `Minimum HBAR not met: sent ${parsed.participantHbarSent}, required ${params.minAmountTinybars}`,
      }
    }
  }

  if (params.tokenIds != null && params.tokenIds.length > 0) {
    const involvedTokens = new Set(parsed.tokenFlow.map((t) => t.tokenId.toLowerCase()))
    const required = params.tokenIds.map((id) => id.toLowerCase())
    const hasAll = required.some((r) => involvedTokens.has(r))
    if (!hasAll) {
      return {
        match: false,
        reason: `Required token not involved. Required one of: ${params.tokenIds.join(", ")}`,
      }
    }
  }

  if (params.minTokenAmount != null && params.minTokenAmount > 0) {
    const totalTokenVolume = parsed.tokenFlow.reduce(
      (s, t) => s + Math.abs(t.netAmount),
      0
    )
    if (totalTokenVolume < params.minTokenAmount) {
      return {
        match: false,
        reason: `Minimum token amount not met: volume ${totalTokenVolume}, required ${params.minTokenAmount}`,
      }
    }
  }

  if (params.actionType != null && parsed.inferredAction != null) {
    const expected = params.actionType
    const inferred = parsed.inferredAction
    const categoryMap: Record<string, ActionType> = {
      swap: "swap",
      lend: "deposit",
      liquidity: "deposit",
      stake: "stake",
    }
    const fromCategory = protocolCategory ? categoryMap[protocolCategory] : null
    const acceptable =
      inferred === expected ||
      (fromCategory && inferred === fromCategory) ||
      (expected === "swap" && inferred === "swap")
    if (!acceptable) {
      return {
        match: false,
        reason: `Action type mismatch: expected ${expected}, inferred ${inferred}`,
      }
    }
  }

  return { match: true }
}
