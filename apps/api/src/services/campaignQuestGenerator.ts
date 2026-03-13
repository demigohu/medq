import { ChatGroq } from "@langchain/groq"
import { ChatPromptTemplate } from "@langchain/core/prompts"
import { z } from "zod"
import { StructuredOutputParser } from "@langchain/core/output_parsers"

import { env } from "../config/env"
import { createQuest, getQuestById } from "./questService"
import { uploadQuestMetadata } from "./ipfsService"
import { logAIGeneration, saveQuest } from "./dbService"
import { getProtocolByAddress, getProtocolRouterAddress, PROTOCOLS } from "../lib/protocols"
import { HEDERA_TOKENS } from "./txDataParser"
import type { Campaign } from "./dbService"

const addressRegex = /^0x[a-fA-F0-9]{40}$/

const TOKEN_ID_MAP = [
  ...Object.entries(HEDERA_TOKENS).map(([sym, t]) => `${sym}=${t.tokenId}`),
  "HBAR=WHBAR (same as 0.0.15058)",
].join(", ")

const campaignQuestOutputSchema = z.object({
  title: z.string(),
  goal: z.string().describe("One-line goal matching the quest action, e.g. 'Deposit 10 USDC on Bonzo Finance' or 'Swap 10 USDC to Karate on SaucerSwap Finance'"),
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
      tokenIn: z.string().optional().describe("Token participant sends. Symbol or tokenId. Swap/deposit: input. HBAR=WHBAR."),
      tokenOut: z.string().optional().describe("Token participant receives. Swap: output. Borrow: borrowed asset. HBAR=WHBAR."),
      minAmountIn: z.number().optional().describe("Min human units of tokenIn. E.g. 10 = 10 USDC."),
      minAmountOut: z.number().optional().describe("Min human units of tokenOut. For borrow."),
      minAmountTinybars: z.number().optional().describe("1 HBAR = 100000000. For HBAR-min quests."),
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
    `You are a DeFi quest designer for Medq, a Hedera-based quest platform. Your task is to generate ONE concrete, on-chain verifiable quest from partner campaign data. Output ONLY valid JSON — no markdown, no commentary.

## Output Format
Return strictly valid JSON matching the schema. No code blocks, no explanation.

## Available Protocols (Hedera Testnet)
- SaucerSwap Finance (0x0000000000000000000000000000000000004b40): DEX — swaps, liquidity
- Bonzo Finance (0x118dd8f2c0f2375496df1e069af1141fa034251b): Lending — deposit, borrow

## Field Rules

**goal** (required): One-line quest objective. Format: "[Action] [amount] [token] [optional: to/on/from] [protocol]". Must use real values from campaign (pool_amount, pool_token, template_type). Never use placeholders (e.g. "Swap ? ? to ?").

**verificationParams** (required for auto-verify): On-chain verification will fail without this.
- tokenIn: Token participant SENDS. Swap/deposit input. Use symbol or tokenId. Mapping: ${TOKEN_ID_MAP}. HBAR and WHBAR are equivalent.
- tokenOut: Token participant RECEIVES. Swap output or borrow asset.
- minAmountIn: Min human units of tokenIn (e.g. 10 = 10 USDC). Use for swap, deposit.
- minAmountOut: ONLY for borrow — min tokenOut received. NEVER use for swap (output depends on market, cannot be predicted).
- minAmountTinybars: Only for HBAR-native. 1 HBAR = 100000000.
- actionType: swap | deposit | borrow | stake — must match templateType.
Examples: swap USDC→Karate: tokenIn=USDC, tokenOut=KARATE, minAmountIn=10 (no minAmountOut). Deposit USDC: tokenIn=USDC, minAmountIn=10. Borrow USDC: tokenOut=USDC, minAmountOut=100.

**difficulty**: easy (≤3 steps, low amount) | medium (4–5 steps, moderate) | hard (complex, high amount).

**requirements**: 2–5 actionable prerequisites (wallet, tokens, protocol access). Be specific.

**steps**: 3–6 ordered steps. Each step: clear action + what to verify. Last step often: confirm tx on Hedera Explorer.

**medqAmountPerQuest**: MEDQ reward. Consider pool size, difficulty, engagement. Range 10–100. Favor generosity.`,
  ],
  [
    "human",
    `## Campaign Data
{campaignContext}

## Context
- Protocol: {protocol}
- Protocol info: {protocolInfo}
- Participant: {participant}

Generate a quest from the campaign above. Every value (goal, verificationParams, amounts) must be derived from the campaign data. No placeholders.

## Schema
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

  const goal =
    questDraft.goal?.trim() ||
    buildGoalFromTemplate(campaign, protocol.name)

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
