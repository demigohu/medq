import { config } from "dotenv"
import { z } from "zod"

config()

const envSchema = z.object({
  PORT: z.coerce.number().int().positive().default(4000),
  RPC_URL: z.string().url(),
  // Agent Controller Private Key (untuk createQuest)
  // Fallback ke PRIVATE_KEY jika tidak di-set (legacy support)
  AGENT_CONTROLLER_PRIVATE_KEY: z.string().min(10).optional(),
  // Completion Oracle Private Key (untuk recordCompletion)
  COMPLETION_ORACLE_PRIVATE_KEY: z.string().min(10),
  // Legacy support: jika masih pakai PRIVATE_KEY, akan digunakan untuk agent controller
  PRIVATE_KEY: z.string().min(10).optional(),
  QUEST_MANAGER_ADDRESS: z.string().regex(/^0x[a-fA-F0-9]{40}$/),
  REWARD_VAULT_ADDRESS: z.string().regex(/^0x[a-fA-F0-9]{40}$/),
  BADGE_NFT_ADDRESS: z.string().regex(/^0x[a-fA-F0-9]{40}$/),
  REPUTATION_REGISTRY_ADDRESS: z.string().regex(/^0x[a-fA-F0-9]{40}$/),
  VALIDATION_REGISTRY_ADDRESS: z.string().regex(/^0x[a-fA-F0-9]{40}$/),
  AGENT_REGISTRY_ADAPTER_ADDRESS: z.string().regex(/^0x[a-fA-F0-9]{40}$/),
  COMPLETION_ORACLE: z.string().regex(/^0x[a-fA-F0-9]{40}$/).optional(),
  GROQ_API_KEY: z.string().min(10),
  PINATA_JWT: z.string().min(10),
  MIRROR_NODE_URL: z.string().url().default("https://testnet.mirrornode.hedera.com/api/v1"),
  SUPABASE_URL: z.string().url(),
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(10),
})

export const env = envSchema.parse(process.env)

