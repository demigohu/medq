/**
 * Parse full transaction data from Mirror Node untuk verifikasi quest.
 * Menggunakan transfers + token_transfers dari seluruh child records.
 * Mirror Node tidak mengembalikan decimals di token_transfers, jadi pakai mapping.
 */

export type ActionType = "swap" | "deposit" | "borrow" | "stake"

/** Hedera token: symbol → tokenId + decimals. Pakai ini sebagai sumber kebenaran. */
export const HEDERA_TOKENS = {
  USDC: { tokenId: "0.0.5449", decimals: 6 },
  HCHF: { tokenId: "0.0.4360532", decimals: 8 },
  KARATE: { tokenId: "0.0.3772909", decimals: 8 },
  SAUCE: { tokenId: "0.0.1183558", decimals: 6 },
  WHBAR: { tokenId: "0.0.15058", decimals: 8 },
} as const

/** WHBAR = wrapped HBAR. Same as native HBAR (1:1, 8 decimals). */
export const WHBAR_TOKEN_ID = HEDERA_TOKENS.WHBAR.tokenId

/** tokenId → decimals (diderive dari HEDERA_TOKENS). Mirror Node tidak return decimals. */
export const TOKEN_DECIMALS: Record<string, number> = Object.fromEntries(
  Object.values(HEDERA_TOKENS).map((t) => [t.tokenId, t.decimals])
)

/** Symbol (USDC, HCHF, dll) → tokenId. HBAR maps to WHBAR (same asset). */
export const SYMBOL_TO_TOKEN_ID: Record<string, string> = {
  ...Object.fromEntries(Object.entries(HEDERA_TOKENS).map(([sym, t]) => [sym.toUpperCase(), t.tokenId])),
  HBAR: WHBAR_TOKEN_ID,
}

/** Token IDs that count as HBAR (native HBAR uses transfers, WHBAR uses token_transfers). */
const HBAR_EQUIVALENT_IDS = new Set(["hbar", "whbar", WHBAR_TOKEN_ID.trim().toLowerCase()])

function getTokenDecimals(tokenId: string): number {
  const normalized = tokenId.trim()
  return TOKEN_DECIMALS[normalized] ?? 8
}

/** Resolve symbol (USDC) atau tokenId (0.0.5449) ke tokenId. */
function resolveToTokenId(symbolOrId: string): string {
  const s = symbolOrId.trim().toUpperCase()
  return SYMBOL_TO_TOKEN_ID[s] ?? symbolOrId.trim()
}

function normalizeTokenId(tokenId: string): string {
  return tokenId.trim().toLowerCase()
}

/** HBAR/WHBAR: 1:1, 8 decimals. Returns total amount SENT (tinybars/smallest units). */
function getHbarEquivalentSent(parsed: ParsedTxData): number {
  const whbar = parsed.tokenFlow.find((t) => normalizeTokenId(t.tokenId) === normalizeTokenId(WHBAR_TOKEN_ID))
  const whbarSent = whbar && whbar.netAmount < 0 ? Math.abs(whbar.netAmount) : 0
  return parsed.participantHbarSent + whbarSent
}

/** HBAR/WHBAR: 1:1, 8 decimals. Returns total amount RECEIVED. */
function getHbarEquivalentReceived(parsed: ParsedTxData): number {
  const whbar = parsed.tokenFlow.find((t) => normalizeTokenId(t.tokenId) === normalizeTokenId(WHBAR_TOKEN_ID))
  const whbarRecv = whbar && whbar.netAmount > 0 ? whbar.netAmount : 0
  return parsed.participantHbarReceived + whbarRecv
}

/** Get amount SENT for token. For HBAR/WHBAR returns combined (tinybars). */
function getAmountSent(parsed: ParsedTxData, tokenId: string): number {
  const norm = normalizeTokenId(resolveToTokenId(tokenId))
  if (HBAR_EQUIVALENT_IDS.has(norm)) return getHbarEquivalentSent(parsed)
  const t = parsed.tokenFlow.find((f) => normalizeTokenId(f.tokenId) === norm)
  return t && t.netAmount < 0 ? Math.abs(t.netAmount) : 0
}

/** Get amount RECEIVED for token. For HBAR/WHBAR returns combined (tinybars). */
function getAmountReceived(parsed: ParsedTxData, tokenId: string): number {
  const norm = normalizeTokenId(resolveToTokenId(tokenId))
  if (HBAR_EQUIVALENT_IDS.has(norm)) return getHbarEquivalentReceived(parsed)
  const t = parsed.tokenFlow.find((f) => normalizeTokenId(f.tokenId) === norm)
  return t && t.netAmount > 0 ? t.netAmount : 0
}

/** Get decimals for token. HBAR/WHBAR = 8. */
function getDecimalsForToken(tokenId: string): number {
  const norm = normalizeTokenId(resolveToTokenId(tokenId))
  if (HBAR_EQUIVALENT_IDS.has(norm)) return 8
  return getTokenDecimals(resolveToTokenId(tokenId))
}

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
      if (tt.account.toLowerCase() !== participant) continue
      const decimals = tt.decimals ?? getTokenDecimals(tt.token_id)
      const existing = getOrCreateToken(tt.token_id, decimals)
      existing.netAmount += tt.amount
      existing.decimals = decimals
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
        (t) => t.account.toLowerCase() === participant && t.amount < 0
      )
    )
    const hasTokenOut = transactions.some((r) =>
      (r.token_transfers ?? []).some(
        (t) => t.account.toLowerCase() === participant && t.amount > 0
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
  /** Min HBAR (tinybars). 1 HBAR = 10^8. */
  minAmountTinybars?: number
  /** Token participant must SEND (swap input, deposit asset). Symbol or 0.0.xxx. HBAR=WHBAR. */
  tokenIn?: string
  /** Token participant must RECEIVE (swap output, borrow asset). HBAR=WHBAR. */
  tokenOut?: string
  /** Min amount of tokenIn in human units (e.g. 10 = 10 USDC). */
  minAmountIn?: number
  /** Min amount of tokenOut in human units (for borrow). */
  minAmountOut?: number
  /** @deprecated Use tokenIn/tokenOut. Min token amount. */
  minTokenAmount?: number
  /** @deprecated Use tokenIn. Token for minTokenAmount. */
  tokenIdForMinAmount?: string
  /** @deprecated Use tokenIn+tokenOut. Token IDs involved. */
  tokenIds?: string[]
  actionType?: ActionType
}

/**
 * Match parsed tx data terhadap quest verification params.
 * Jika params kosong, return true (fallback ke address-only verification).
 * tokenIn/tokenOut: HBAR and WHBAR treated as equivalent.
 */
export function matchQuestRequirements(
  parsed: ParsedTxData,
  params: VerificationParams | null | undefined,
  protocolCategory?: string
): { match: boolean; reason?: string } {
  if (!params || Object.keys(params).length === 0) {
    return { match: true }
  }

  const actionType = params.actionType ?? "swap"

  if (params.minAmountTinybars != null && params.minAmountTinybars > 0) {
    const hbarSent = getHbarEquivalentSent(parsed)
    if (hbarSent < params.minAmountTinybars) {
      return {
        match: false,
        reason: `Minimum HBAR not met: sent ${hbarSent}, required ${params.minAmountTinybars}`,
      }
    }
  }

  if (params.tokenIn != null) {
    const sent = getAmountSent(parsed, params.tokenIn)
    const decimals = getDecimalsForToken(params.tokenIn)
    const humanSent = sent / Math.pow(10, decimals)
    const minIn = params.minAmountIn ?? params.minTokenAmount ?? 0
    if (minIn > 0 && humanSent < minIn) {
      return {
        match: false,
        reason: `Minimum ${params.tokenIn} sent not met: ${humanSent.toFixed(4)}, required ${minIn}`,
      }
    }
  }

  if (params.tokenOut != null) {
    const received = getAmountReceived(parsed, params.tokenOut)
    const decimals = getDecimalsForToken(params.tokenOut)
    const humanRecv = received / Math.pow(10, decimals)
    const minOut = params.minAmountOut ?? 0
    if (minOut > 0 && humanRecv < minOut) {
      return {
        match: false,
        reason: `Minimum ${params.tokenOut} received not met: ${humanRecv.toFixed(4)}, required ${minOut}`,
      }
    }
  }

  if (actionType === "swap" && params.tokenIn != null && params.tokenOut != null) {
    const sent = getAmountSent(parsed, params.tokenIn)
    const received = getAmountReceived(parsed, params.tokenOut)
    if (sent === 0 || received === 0) {
      return {
        match: false,
        reason: `Swap requires sending ${params.tokenIn} AND receiving ${params.tokenOut}`,
      }
    }
  }

  if (actionType === "deposit" && params.tokenIn != null) {
    const sent = getAmountSent(parsed, params.tokenIn)
    if (sent === 0) {
      return {
        match: false,
        reason: `Deposit requires sending ${params.tokenIn}`,
      }
    }
  }

  if (actionType === "borrow" && params.tokenOut != null) {
    const received = getAmountReceived(parsed, params.tokenOut)
    if (received === 0) {
      return {
        match: false,
        reason: `Borrow requires receiving ${params.tokenOut}`,
      }
    }
  }

  if (params.tokenIds != null && params.tokenIds.length > 0 && params.tokenIn == null && params.tokenOut == null) {
    const required = params.tokenIds.map((r) => normalizeTokenId(resolveToTokenId(r)))
    const requiredSet = new Set(required)
    const participantTokens = parsed.tokenFlow.filter((t) => requiredSet.has(normalizeTokenId(t.tokenId)))
    const hbarInvolved = required.some((r) => HBAR_EQUIVALENT_IDS.has(r))
    const hasHbarFlow = hbarInvolved && (getHbarEquivalentSent(parsed) > 0 || getHbarEquivalentReceived(parsed) > 0)
    if (!hasHbarFlow && participantTokens.length === 0) {
      return {
        match: false,
        reason: `Required token not involved. Required one of: ${params.tokenIds.join(", ")}`,
      }
    }
    if (actionType === "swap" && required.length >= 2) {
      const hasSent =
        participantTokens.some((t) => t.netAmount < 0) ||
        (hbarInvolved && getHbarEquivalentSent(parsed) > 0)
      const hasReceived =
        participantTokens.some((t) => t.netAmount > 0) ||
        (hbarInvolved && getHbarEquivalentReceived(parsed) > 0)
      if (!hasSent || !hasReceived) {
        return {
          match: false,
          reason: `Swap requires both sending and receiving among tokens ${params.tokenIds.join(", ")}`,
        }
      }
    }
  }

  if (
    params.minTokenAmount != null &&
    params.minTokenAmount > 0 &&
    params.tokenIn == null &&
    (params.tokenIdForMinAmount != null || params.tokenIds?.[0])
  ) {
    const tokenIdRaw = params.tokenIdForMinAmount ?? params.tokenIds?.[0]
    if (tokenIdRaw) {
      const sent = getAmountSent(parsed, tokenIdRaw)
      const decimals = getDecimalsForToken(tokenIdRaw)
      const humanAmount = sent / Math.pow(10, decimals)
      if (humanAmount < params.minTokenAmount) {
        return {
          match: false,
          reason: `Minimum token amount not met: ${humanAmount.toFixed(4)} sent (${tokenIdRaw}), required ${params.minTokenAmount}`,
        }
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
