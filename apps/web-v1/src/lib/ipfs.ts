const DEFAULT_IPFS_GATEWAY = process.env.NEXT_PUBLIC_IPFS_GATEWAY || "https://ipfs.io/ipfs/"

export interface QuestMetadataStep {
  title: string
  description: string
}

export interface QuestMetadataParameters {
  actionPlan?: string
  successCriteria?: string
  evidenceHint?: string
}

export interface QuestMetadata {
  title?: string
  summary?: string
  goal?: string
  category?: string
  difficulty?: string
  banner?: string
  requirements?: string[]
  steps?: QuestMetadataStep[]
  parameters?: QuestMetadataParameters
}

export function ipfsToHttp(uri: string) {
  if (!uri.startsWith("ipfs://")) {
    return uri
  }

  const path = uri.replace("ipfs://", "")
  return `${DEFAULT_IPFS_GATEWAY}${path}`
}

export async function fetchIPFSMetadata(uri: string): Promise<QuestMetadata> {
  const url = ipfsToHttp(uri)
  const response = await fetch(url, {
    cache: "no-store",
  })

  if (!response.ok) {
    throw new Error(`Failed to load metadata (${response.status})`)
  }

  return response.json()
}

