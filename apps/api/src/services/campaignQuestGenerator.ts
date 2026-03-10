import { ChatGroq } from "@langchain/groq"
import { ChatPromptTemplate } from "@langchain/core/prompts"
import { z } from "zod"
import { StructuredOutputParser } from "@langchain/core/output_parsers"

import { env } from "../config/env"
import { createQuest, getQuestById } from "./questService"
import { uploadQuestMetadata } from "./ipfsService"
import { logAIGeneration, saveQuest } from "./dbService"
import { getProtocolByAddress, getProtocolRouterAddress, PROTOCOLS } from "../lib/protocols"
import type { Campaign } from "./dbService"

const addressRegex = /^0x[a-fA-F0-9]{40}$/

const campaignQuestOutputSchema = z.object({
  title: z.string(),
  shortSummary: z.string(),
  recommendedCategory: z.enum(["swap", "liquidity", "stake", "lend"]),
  difficulty: z.enum(["easy", "medium", "hard"]),
  requirements: z.array(z.string()).min(2).max(5),
  steps: z
    .array(
      z.object({
        title: z.string(),
        description: z.string(),
      })
    )
    .min(3)
    .max(6),
  parameters: z.object({
    actionPlan: z.string(),
    successCriteria: z.string(),
    evidenceHint: z.string(),
  }),
  metadataSnippet: z.string(),
  verificationParams: z
    .object({
      minAmountTinybars: z.number().optional(),
      minTokenAmount: z.number().optional(),
      tokenIds: z.array(z.string()).optional(),
      actionType: z.enum(["swap", "deposit", "borrow", "stake"]).optional(),
    })
    .optional(),
  medqAmountPerQuest: z.number().int().min(0).optional(),
})

type CampaignQuestDraft = z.infer<typeof campaignQuestOutputSchema>
const parser = StructuredOutputParser.fromZodSchema(campaignQuestOutputSchema)

const campaignQuestPrompt = ChatPromptTemplate.fromMessages([
  [
    "system",
    `You are an AI quest designer for a DeFi quest platform on Hedera.
Generate concrete, verifiable quests for partner campaigns. Return only valid JSON.

Available protocols:
- SaucerSwap Finance (0x0000000000000000000000000000000000004b40): DEX for swaps
- Bonzo Finance (0x118dd8f2c0f2375496df1e069af1141fa034251b): Lending

Include verificationParams with minAmountTinybars when quest has minimum amount (1 HBAR = 100000000 tinybars).
IMPORTANT: Set medqAmountPerQuest - the MEDQ reward per quest. Base it on: pool size (USDC), reward per quest (USDC), 
effort/difficulty. Typical range 10-100 MEDQ. Be generous for engagement.`,
  ],
  [
    "human",
    `Campaign data (full context):
{campaignContext}

Protocol: {protocol}
Protocol Info: {protocolInfo}
Participant wallet: {participant}

Use all campaign data above to generate a tailored quest. Determine medqAmountPerQuest based on pool value and engagement.

Schema:
{formatInstructions}`,
  ],
])

const groqModel = new ChatGroq({
  apiKey: env.GROQ_API_KEY,
  model: "openai/gpt-oss-20b",
  temperature: 0.3,
})

const chain = campaignQuestPrompt.pipe(groqModel).pipe(parser)

/** Serialize campaign for AI context with a compact, curated subset of fields. */
function buildCampaignContext(campaign: Campaign): string {
  const minimal = {
    title: campaign.title,
    description: campaign.description,
    partnerName: campaign.partner_name,
    templateType: campaign.template_type,
    templateParams: campaign.template_params,
    poolToken: campaign.pool_token,
    poolAmountUsdc: campaign.pool_amount,
    rewardPerQuestUsdc: campaign.reward_per_quest_usdc,
    maxParticipants: campaign.max_participants,
    period: {
      start_at: campaign.start_at,
      end_at: campaign.end_at,
    },
  }

  // Compact JSON (no pretty-print) to keep prompt size small.
  return JSON.stringify(minimal)
}

function buildGoalFromTemplate(
  campaign: Campaign,
  protocolName: string
): string {
  const t = campaign.template_type
  const p = campaign.template_params as Record<string, unknown>
  const amount = p.amount ?? "?"
  const tokenIn = (p.token_in as string) ?? "?"
  const tokenOut = (p.token_out as string) ?? "?"
  const token = (p.token as string) ?? tokenIn

  switch (t) {
    case "swap":
      return `Swap ${amount} ${tokenIn} to ${tokenOut} on ${protocolName}`
    case "deposit":
      return `Deposit ${amount} ${token} on ${protocolName}`
    case "borrow":
      return `Borrow ${amount} ${token} from ${protocolName}`
    case "stake":
      return `Stake ${amount} ${token} on ${protocolName}`
    default:
      return `Complete ${t} action on ${protocolName}`
  }
}

function buildVerificationParamsFromTemplate(campaign: Campaign): Record<string, unknown> | undefined {
  const p = campaign.template_params as Record<string, unknown>
  const amount = typeof p.amount === "number" ? p.amount : parseFloat(String(p.amount ?? 0))
  const tokenIn = String(p.token_in ?? "").toUpperCase()

  const params: Record<string, unknown> = {
    actionType: campaign.template_type === "swap" ? "swap" : "deposit",
  }

  if (tokenIn === "HBAR" && amount > 0) {
    params.minAmountTinybars = Math.floor(amount * 100_000_000) // 1 HBAR = 10^8 tinybars
  }

  return Object.keys(params).length > 0 ? params : undefined
}

const MEDQ_FALLBACK = 25

export async function generateQuestFromCampaign(
  campaign: Campaign,
  participant: string
): Promise<{ questId: string; questIdOnChain: number; deploymentTxHash: string }> {
  const protocolAddress = String(
    (campaign.template_params as Record<string, unknown>).protocol_address ?? ""
  )
  if (!protocolAddress || !addressRegex.test(protocolAddress)) {
    throw new Error("Campaign template must include valid protocol_address")
  }

  const protocol = getProtocolByAddress(protocolAddress) ?? {
    name: "Custom Protocol",
    description: `Custom protocol at ${protocolAddress}`,
    evmAddress: protocolAddress,
    hederaId: "",
    category: "swap" as const,
    website: "",
    logo: undefined,
  }

  const goal = buildGoalFromTemplate(campaign, protocol.name)
  const protocolAddressToUse = getProtocolRouterAddress(protocolAddress)

  const questDraft = (await chain.invoke({
    campaignContext: buildCampaignContext(campaign),
    protocol: protocol.name,
    protocolInfo: `${protocol.name} - ${protocol.description}`,
    participant,
    formatInstructions: parser.getFormatInstructions(),
  })) as CampaignQuestDraft

  const medqAmount = questDraft.medqAmountPerQuest ?? MEDQ_FALLBACK
  const verificationParams =
    questDraft.verificationParams ?? buildVerificationParamsFromTemplate(campaign)

  const metadataPayload = {
    title: questDraft.title,
    summary: questDraft.shortSummary,
    projectName: campaign.title,
    chain: "Hedera Testnet",
    goal,
    difficulty: questDraft.difficulty,
    category: questDraft.recommendedCategory,
    requirements: questDraft.requirements,
    steps: questDraft.steps,
    parameters: questDraft.parameters,
    reward: {
      token: "MEDQ",
      amount: String(medqAmount),
      badgeLevel: 1,
    },
    campaignReward: {
      token: campaign.pool_token,
      amount: String(campaign.reward_per_quest_usdc),
    },
    participant,
    metadataSnippet: questDraft.metadataSnippet,
    banner: protocol.logo,
    verificationParams,
  }

  const metadataURI = await uploadQuestMetadata(
    metadataPayload,
    `campaign-quest-${campaign.title.slice(0, 24)}-${Date.now()}`
  )

  const onChainResult = await createQuest({
    category: questDraft.recommendedCategory,
    protocol: protocolAddressToUse,
    metadataURI,
    rewardAmount: String(medqAmount),
    badgeLevel: 1,
    participant,
    expiry: 0,
    parameters: questDraft.parameters.actionPlan,
  })

  const questIdOnChain = Number(onChainResult.questId)
  const onChainQuest = await getQuestById(questIdOnChain)

  const questData: Parameters<typeof saveQuest>[0] = {
    quest_id_on_chain: questIdOnChain,
    campaign_id: campaign.id,
    title: questDraft.title,
    description: questDraft.shortSummary,
    project_name: campaign.title,
    category: questDraft.recommendedCategory,
    protocol_address: protocolAddressToUse,
    metadata_uri: metadataURI,
    reward_per_participant: String(medqAmount),
    badge_level: 1,
    assigned_participant: participant,
    status: "active",
    quest_type: "custom",
  }

  if (onChainQuest.agentId) questData.agent_id = Number(onChainQuest.agentId)
  if (onChainQuest.agentController) questData.agent_controller = onChainQuest.agentController

  await saveQuest(questData)

  await logAIGeneration({
    quest_id_on_chain: questIdOnChain,
    prompt_input: { campaign_id: campaign.id, participant },
    ai_output: questDraft,
    metadata_uri: metadataURI,
    deployed_on_chain: true,
    deployment_tx_hash: onChainResult.transactionHash,
  })

  return {
    questId: String(questIdOnChain),
    questIdOnChain,
    deploymentTxHash: onChainResult.transactionHash,
  }
}
