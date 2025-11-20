import { ChatGroq } from "@langchain/groq"
import { ChatPromptTemplate } from "@langchain/core/prompts"
import { z } from "zod"
import { StructuredOutputParser } from "@langchain/core/output_parsers"

import { env } from "../config/env"
import { createQuest, getQuestById } from "./questService"
import { uploadQuestMetadata } from "./ipfsService"
import { logAIGeneration, saveQuest } from "./dbService"
import { getProtocolByAddress, PROTOCOLS } from "../lib/protocols"

const addressRegex = /^0x[a-fA-F0-9]{40}$/

const generationInputSchema = z.object({
  projectName: z.string().min(2),
  goal: z.string().min(10),
  chain: z.string().min(2),
  categoryHint: z.enum(["swap", "liquidity", "stake", "lend"]).optional(),
  protocol: z.string().regex(addressRegex),
  participant: z.string().regex(addressRegex),
  rewardAmount: z.string().min(1),
  badgeLevel: z.number().int().positive().max(10),
  expiry: z.number().int().nonnegative().optional(),
  metadataURI: z.string().min(5).max(200).optional(),
  autoDeploy: z.boolean().optional(),
  extraNotes: z.string().max(500).optional(),
  questType: z.enum(["custom", "daily", "weekly"]).optional(),
})

const questOutputSchema = z.object({
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
})

const parser = StructuredOutputParser.fromZodSchema(questOutputSchema)
type QuestDraft = z.infer<typeof questOutputSchema>

const questPrompt = ChatPromptTemplate.fromMessages([
  [
    "system",
    `You are an AI quest designer for a DeFi quest platform on Hedera. 
Generate concrete, verifiable quests that revolve around on-chain activity. 
Return only valid JSON that matches the required schema.

Available protocols on Hedera Testnet:
- SaucerSwap Finance (0x0000000000000000000000000000000000004b40): Decentralized exchange for token swaps. Website: https://testnet.saucerswap.finance/swap
- Bonzo Finance (0x118dd8f2c0f2375496df1e069af1141fa034251b): Lending and borrowing protocol. Website: https://testnet.bonzo.finance/

When generating quests, consider the specific protocol's features and make quests actionable and verifiable.`,
  ],
  [
    "human",
    `Project: {projectName}
Protocol: {protocol}
Protocol Info: {protocolInfo}
Network: {chain}
Goal: {goal}
Category hint: {categoryHint}
Participant wallet: {participant}
Reward amount: {rewardAmount} MEDQ
Extra context: {extraNotes}

Schema:
{formatInstructions}`,
  ],
])

const groqModel = new ChatGroq({
  apiKey: env.GROQ_API_KEY,
  model: "openai/gpt-oss-20b",
  temperature: 0.3,
})

const chain = questPrompt.pipe(groqModel).pipe(parser)

export async function generateQuestWithGroq(rawInput: unknown) {
  const input = generationInputSchema.parse(rawInput)

  // Validate protocol address
  const protocol = getProtocolByAddress(input.protocol)
  if (!protocol) {
    throw new Error(
      `Invalid protocol address: ${input.protocol}. Supported protocols: ${Object.values(PROTOCOLS)
        .map((p) => `${p.name} (${p.evmAddress})`)
        .join(", ")}`
    )
  }

  // Build protocol info string for AI
  const protocolInfo = `${protocol.name} - ${protocol.description}. Category: ${protocol.category}. Website: ${protocol.website}`

  // Get format instructions to pass as variable
  const formatInstructions = parser.getFormatInstructions()

  const questDraft = (await chain.invoke({
    projectName: input.projectName,
    protocol: protocol.name,
    protocolInfo,
    chain: input.chain,
    goal: input.goal,
    categoryHint: input.categoryHint ?? protocol.category,
    participant: input.participant,
    rewardAmount: input.rewardAmount,
    extraNotes: input.extraNotes ?? "No extra notes",
    formatInstructions,
  })) as QuestDraft

  let onChainResult: Awaited<ReturnType<typeof createQuest>> | undefined

  // Prepare metadata payload (used for both auto-deploy and logging)
  // Include protocol logo as banner if available
  const metadataPayload = {
    title: questDraft.title,
    summary: questDraft.shortSummary,
    projectName: input.projectName,
    chain: input.chain,
    goal: input.goal,
    difficulty: questDraft.difficulty,
    category: questDraft.recommendedCategory,
    requirements: questDraft.requirements,
    steps: questDraft.steps,
    parameters: questDraft.parameters,
    reward: {
      token: "MEDQ",
      amount: input.rewardAmount,
      badgeLevel: input.badgeLevel,
    },
    participant: input.participant,
    extraNotes: input.extraNotes,
    metadataSnippet: questDraft.metadataSnippet,
    banner: protocol.logo || undefined, // Include protocol logo as banner
  }

  if (input.autoDeploy) {
    let metadataURI =
      input.metadataURI ??
      (await uploadQuestMetadata(metadataPayload, `quest-${questDraft.title.slice(0, 32)}`))

    onChainResult = await createQuest({
      category: questDraft.recommendedCategory,
      protocol: input.protocol,
      metadataURI,
      rewardAmount: input.rewardAmount,
      badgeLevel: input.badgeLevel,
      participant: input.participant,
      expiry: input.expiry,
      parameters: questDraft.parameters.actionPlan,
    })

    // Get quest details from on-chain to save to DB
    const questIdOnChain = Number(onChainResult.questId)
    const onChainQuest = await getQuestById(questIdOnChain)

    // Save quest metadata to database
    const questData: Parameters<typeof saveQuest>[0] = {
      quest_id_on_chain: questIdOnChain,
      title: questDraft.title,
      description: questDraft.shortSummary,
      project_name: input.projectName,
      category: questDraft.recommendedCategory,
      protocol_address: input.protocol,
      metadata_uri: metadataURI,
      reward_per_participant: input.rewardAmount,
      badge_level: input.badgeLevel,
      assigned_participant: input.participant,
      status: "active",
    }

    if (onChainQuest.agentId) {
      questData.agent_id = Number(onChainQuest.agentId)
    }
    if (onChainQuest.agentController) {
      questData.agent_controller = onChainQuest.agentController
    }
    if (input.expiry) {
      questData.expiry_timestamp = Number(input.expiry)
    }

    const savedQuest = await saveQuest({
      ...questData,
      quest_type: input.questType || "custom", // Use provided questType or default to custom
    })

    // Log AI generation
    await logAIGeneration({
      quest_id_on_chain: questIdOnChain,
      prompt_input: input,
      ai_output: questDraft,
      metadata_uri: metadataURI,
      deployed_on_chain: true,
      deployment_tx_hash: onChainResult.transactionHash,
    })
  } else {
    // Upload metadata to IPFS even if not auto-deploying
    const metadataURIForLog =
      input.metadataURI ??
      (await uploadQuestMetadata(metadataPayload, `quest-${questDraft.title.slice(0, 32)}`))

    // Log AI generation even if not deployed
    await logAIGeneration({
      prompt_input: input,
      ai_output: questDraft,
      metadata_uri: metadataURIForLog,
      deployed_on_chain: false,
    })
  }

  return {
    questDraft,
    onChainResult,
  }
}

