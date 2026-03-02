import { env } from "../config/env"
import { getProtocolByAddress } from "../lib/protocols"

/**
 * Convert Hedera account ID (0.0.xxxxx) to EVM address (0x...).
 * Mirror Node returns entity_id and transfers[].account in Hedera format,
 * but routerSet uses EVM format.
 */
function hederaIdToEvmAddress(hederaId: string | undefined): string | null {
  if (!hederaId || typeof hederaId !== "string") return null
  const parts = hederaId.trim().toLowerCase().split(".")
  const numStr = parts[2]
  if (parts.length !== 3 || parts[0] !== "0" || parts[1] !== "0" || numStr == null) return null
  const num = parseInt(numStr, 10)
  if (isNaN(num) || num < 0) return null
  return "0x" + num.toString(16).padStart(40, "0").toLowerCase()
}

/**
 * Normalize address for routerSet comparison: accept both Hedera (0.0.x) and EVM (0x...).
 */
function toEvmForCompare(addr: string): string | null {
  if (!addr) return null
  const s = addr.trim().toLowerCase()
  if (s.startsWith("0x")) return s
  return hederaIdToEvmAddress(s)
}

interface MirrorNodeTransaction {
  transaction_id: string
  status: string
  name: string
  entity_id?: string
  memo_base64?: string
  transaction_hash: string
  charged_tx_fee: number
  max_fee: string
  valid_start_timestamp: string
  transfers?: Array<{
    account: string
    amount: number
    is_approval?: boolean
  }>
  token_transfers?: Array<{
    token_id: string
    account: string
    amount: number
    decimals: number
  }>
  nft_transfers?: Array<{
    token_id: string
    sender_account_id?: string
    receiver_account_id?: string
    serial_number: number
  }>
}

interface ContractResult {
  contract_id?: string
  function_parameters?: string
  gas_used?: number
  error_message?: string
  contract_actions?: Array<{
    call_operation_type?: string
    call_type?: string
    call_depth?: number
    from?: string
    gas?: number
    gas_used?: number
    input?: string
    recipient?: string
    result_data?: string
    result_data_type?: string
    to?: string
    value?: number
  }>
}

/**
 * Query Hedera Mirror Node untuk verifikasi transaction hash dari user
 * Mendukung format Hedera transaction ID (0.0.xxx-xxx-xxx) atau EVM tx hash (0x...)
 */
export async function verifyTransactionHash(
  txHashOrId: string,
  expectedFrom?: string,
  expectedTo?: string
): Promise<{ valid: boolean; transaction?: MirrorNodeTransaction; error?: string }> {
  try {
    const resolvedFrom = await resolveAccountId(expectedFrom)
    const resolvedTo = await resolveAccountId(expectedTo)
    const protocol = expectedTo ? getProtocolByAddress(expectedTo) : null
    const routerSet = new Set<string>()
    for (const addr of protocol?.routerAddresses ?? []) {
      routerSet.add(addr.toLowerCase())
    }
    if (resolvedTo) {
      routerSet.add(resolvedTo.toLowerCase())
    }
    if (protocol?.hederaId) {
      routerSet.add(protocol.hederaId.toLowerCase())
    }
    if (expectedTo?.toLowerCase().startsWith("0x")) {
      routerSet.add(expectedTo.toLowerCase())
    }

    // Try querying as Hedera transaction ID first (format: 0.0.xxx-xxx-xxx)
    let txId = txHashOrId
    if (txHashOrId.startsWith("0x")) {
      // If it's an EVM hash, we need to query differently
      // Hedera Mirror Node can query by transaction hash
      const response = await fetch(`${env.MIRROR_NODE_URL}/transactions/${txHashOrId}`, {
        headers: {
          Accept: "application/json",
        },
      })

      if (!response.ok) {
        // Try querying via contract results endpoint for EVM transactions
        const contractResponse = await fetch(
          `${env.MIRROR_NODE_URL}/contracts/results/${txHashOrId}`,
          {
            headers: {
              Accept: "application/json",
            },
          }
        )

        if (!contractResponse.ok) {
          return {
            valid: false,
            error: `Transaction not found in Mirror Node: ${response.statusText}`,
          }
        }

        const contractResult = (await contractResponse.json()) as ContractResult
        // For EVM transactions, we can check contract calls
        return {
          valid: true,
          transaction: {
            transaction_id: txHashOrId,
            transaction_hash: txHashOrId,
            status: contractResult.error_message ? "FAILED" : "SUCCESS",
            name: "CONTRACTCALL",
          } as MirrorNodeTransaction,
        }
      }

      const data = (await response.json()) as { transactions?: MirrorNodeTransaction[] }
      const transactions = data.transactions || []

      if (transactions.length === 0) {
        return {
          valid: false,
          error: "Transaction not found in Mirror Node",
        }
      }

      const transaction = transactions[0] as MirrorNodeTransaction
      const normalizedStatus = (transaction.status || (transaction as any).result || "").toUpperCase()

      // Verify transaction status (treat undefined as success to avoid false negatives)
      if (normalizedStatus && normalizedStatus !== "SUCCESS") {
        return {
          valid: false,
          error: `Transaction failed with status: ${transaction.status ?? (transaction as any).result}`,
        }
      }

      // Verify from address if provided
      if (resolvedFrom) {
        const fromMatch = transaction.transfers?.some(
          (t) => t.account.toLowerCase() === resolvedFrom && t.amount < 0
        )
        if (!fromMatch) {
          return {
            valid: false,
            error: `Transaction from address mismatch. Expected: ${expectedFrom}`,
          }
        }
      }

      // Verify to address (allow protocol router list)
      // Mirror Node returns entity_id/account in Hedera format (0.0.x). Check both Hedera and EVM.
      if (routerSet.size > 0) {
        const entityId = (transaction.entity_id ?? "").trim().toLowerCase()
        const entityEvm = toEvmForCompare(transaction.entity_id ?? "")
        const toMatch =
          (entityId && routerSet.has(entityId)) ||
          (entityEvm && routerSet.has(entityEvm)) ||
          transaction.transfers?.some((t) => {
            const acc = t.account.trim().toLowerCase()
            const accEvm = toEvmForCompare(t.account)
            return ((acc && routerSet.has(acc)) || (accEvm && routerSet.has(accEvm))) && t.amount > 0
          })
        if (!toMatch) {
          return {
            valid: false,
            error: `Transaction to address mismatch. Expected: ${expectedTo}`,
          }
        }
      }

      return {
        valid: true,
        transaction,
      }
    } else {
      // Standard Hedera transaction ID format
      const response = await fetch(`${env.MIRROR_NODE_URL}/transactions/${txId}`, {
        headers: {
          Accept: "application/json",
        },
      })

      if (!response.ok) {
        return {
          valid: false,
          error: `Transaction not found in Mirror Node: ${response.statusText}`,
        }
      }

      const data = (await response.json()) as { transactions?: MirrorNodeTransaction[] }
      const transactions = data.transactions || []

      if (transactions.length === 0) {
        return {
          valid: false,
          error: "Transaction not found in Mirror Node",
        }
      }

      const transaction = transactions[0] as MirrorNodeTransaction
      const normalizedStatus = (transaction.status || (transaction as any).result || "").toUpperCase()

      if (normalizedStatus && normalizedStatus !== "SUCCESS") {
        return {
          valid: false,
          error: `Transaction failed with status: ${transaction.status ?? (transaction as any).result}`,
        }
      }

      // Verify addresses for Hedera native transactions
      // Mirror Node returns entity_id/account in Hedera format (0.0.x). Check both Hedera and EVM.
      if (resolvedFrom || routerSet.size > 0) {
        const fromMatch = resolvedFrom
          ? transaction.transfers?.some(
              (t) => t.account.toLowerCase() === resolvedFrom && t.amount < 0
            )
          : true
        const entityId = (transaction.entity_id ?? "").trim().toLowerCase()
        const entityEvm = toEvmForCompare(transaction.entity_id ?? "")
        const toMatch =
          routerSet.size === 0 ||
          (entityId && routerSet.has(entityId)) ||
          (entityEvm && routerSet.has(entityEvm)) ||
          (transaction.transfers?.some((t) => {
            const acc = t.account.trim().toLowerCase()
            const accEvm = toEvmForCompare(t.account)
            return ((acc && routerSet.has(acc)) || (accEvm && routerSet.has(accEvm))) && t.amount > 0
          }) ?? false)

        if (!fromMatch || !toMatch) {
          return {
            valid: false,
            error: `Transaction address verification failed. From: ${expectedFrom}, To: ${expectedTo}`,
          }
        }
      }

      return {
        valid: true,
        transaction,
      }
    }
  } catch (error) {
    console.error("Error querying Mirror Node:", error)
    return {
      valid: false,
      error: error instanceof Error ? error.message : "Unknown error querying Mirror Node",
    }
  }
}

export async function resolveAccountId(address?: string | null): Promise<string | null> {
  if (!address) return null
  if (!address.startsWith("0x")) {
    return address.toLowerCase()
  }

  try {
    const response = await fetch(`${env.MIRROR_NODE_URL}/accounts/${address}`, {
      headers: { Accept: "application/json" },
    })

    if (!response.ok) {
      return null
    }

    const data = (await response.json()) as {
      account?: string
      accounts?: Array<{ account: string }>
    }
    if (data?.account) {
      return (data.account as string).toLowerCase()
    }
    if (Array.isArray(data.accounts) && data.accounts.length > 0) {
      const accountId = data.accounts[0]?.account as string | undefined
      if (accountId) {
        return accountId.toLowerCase()
      }
    }
  } catch (error) {
    console.warn("Failed to resolve account id for address:", address, error)
  }

  return null
}

export async function findMatchingTransactionHash(
  participant: string,
  expectedTo?: string,
  sinceEpochSeconds?: number
): Promise<string | null> {
  const resolvedFrom = await resolveAccountId(participant)
  if (!resolvedFrom) return null

  const since = sinceEpochSeconds ?? Math.floor(Date.now() / 1000) - 24 * 60 * 60
  const url = `${env.MIRROR_NODE_URL}/transactions?account.id=${resolvedFrom}&timestamp=gte:${since}&order=desc&limit=25`

  try {
    console.log(`[AUTO-VERIFY] Mirror Node query: ${url}`)
    const response = await fetch(url, { headers: { Accept: "application/json" } })
    if (!response.ok) {
      console.warn(`[AUTO-VERIFY] Mirror Node error: ${response.status} ${response.statusText}`)
      return null
    }

    const data = (await response.json()) as { transactions?: MirrorNodeTransaction[] }
    const transactions = data.transactions || []
    console.log(`[AUTO-VERIFY] Mirror Node returned ${transactions.length} tx(s)`)

    for (const tx of transactions) {
      const txId = tx.transaction_id
      if (!txId) continue
      console.log(`[AUTO-VERIFY] Checking tx ${txId}`)
      const verified = await verifyTransactionHash(txId, participant, expectedTo)
      if (verified.valid) {
        console.log(`[AUTO-VERIFY] Matched tx ${txId}`)
        return txId
      }
    }
  } catch (error) {
    console.warn("Mirror Node polling failed:", error)
  }

  return null
}

