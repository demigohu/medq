import { env } from "../config/env"

const PINATA_JSON_ENDPOINT = "https://api.pinata.cloud/pinning/pinJSONToIPFS"

interface PinataResponse {
  IpfsHash: string
}

export async function uploadQuestMetadata(metadata: unknown, name: string) {
  const response = await fetch(PINATA_JSON_ENDPOINT, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${env.PINATA_JWT}`,
    },
    body: JSON.stringify({
      pinataMetadata: {
        name,
      },
      pinataContent: metadata,
    }),
  })

  if (!response.ok) {
    const errorText = await response.text()
    throw new Error(`Pinata upload failed: ${response.status} ${errorText}`)
  }

  const json = (await response.json()) as PinataResponse
  return `ipfs://${json.IpfsHash}`
}

