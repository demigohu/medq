import { env } from "../config/env"
import { getCronCursor, setCronCursor, setQuestAcceptedAt } from "./dbService"

const QUEST_ACCEPTED_TOPIC =
  "0x7d422f3e3149564cf96cfeab23ae433b6b1d7259c2873096244209f9b40befee"

type LogEntry = {
  timestamp?: string
  consensus_timestamp?: string
  data?: string
  topics?: string[]
}

type MirrorLogResponse = {
  logs?: LogEntry[]
  links?: { next?: string | null }
}

function hexToBigInt(value?: string) {
  if (!value || !value.startsWith("0x")) return null
  try {
    return BigInt(value)
  } catch {
    return null
  }
}

function hexToAddress(topic?: string) {
  if (!topic || !topic.startsWith("0x")) return null
  return `0x${topic.slice(-40)}`.toLowerCase()
}

function getTimestamp(log: LogEntry): string | null {
  const raw = log.consensus_timestamp || log.timestamp
  if (!raw) return null
  const parts = raw.split(".")
  const seconds = Number(parts[0])
  if (Number.isNaN(seconds)) return null
  return new Date(seconds * 1000).toISOString()
}

export async function runQuestAcceptedWatcherOnce() {
  const contractId = env.QUEST_MANAGER_CONTRACT_ID
  if (!contractId) {
    console.warn("[WATCHER] QUEST_MANAGER_CONTRACT_ID missing, skipping")
    return
  }

  const cursorKey = "quest_accepted_cursor"
  const existingCursor = await getCronCursor(cursorKey)
  const since = existingCursor ?? `${Math.floor(Date.now() / 1000) - 24 * 60 * 60}`

  const baseUrl = `${env.MIRROR_NODE_URL}/contracts/${contractId}/results/logs?order=asc&limit=100&timestamp=gt:${since}`

  let nextUrl: string | null = baseUrl
  let latestTimestamp = since
  let matched = 0

  while (nextUrl) {
    const response = await fetch(nextUrl, { headers: { Accept: "application/json" } })
    if (!response.ok) {
      console.warn("[WATCHER] Mirror Node logs fetch failed:", response.statusText)
      break
    }

    const payload = (await response.json()) as MirrorLogResponse
    const logs = payload.logs || []

    for (const log of logs) {
      const topics = log.topics || []
      if (!topics.length || topics[0] !== QUEST_ACCEPTED_TOPIC) {
        continue
      }

      const questId = hexToBigInt(topics[1])
      const participant = hexToAddress(topics[2])
      const acceptedAt = getTimestamp(log)
      if (!questId || !participant || !acceptedAt) {
        continue
      }

      try {
        await setQuestAcceptedAt(Number(questId), acceptedAt)
        matched += 1
      } catch (error: any) {
        console.warn("[WATCHER] Failed to update accepted_at:", error?.message || error)
      }
    }

    const lastLog = logs[logs.length - 1]
    const lastTimestamp = lastLog?.consensus_timestamp || lastLog?.timestamp
    if (lastTimestamp) {
      const [seconds] = lastTimestamp.split(".")
      if (seconds) {
        latestTimestamp = seconds
      }
    }

    nextUrl = payload.links?.next ? `${env.MIRROR_NODE_URL}${payload.links.next}` : null
  }

  await setCronCursor(cursorKey, latestTimestamp)
  if (matched > 0) {
    console.log(`[WATCHER] QuestAccepted updates: ${matched}`)
  }
}
