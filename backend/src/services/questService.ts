import { keccak256, parseUnits, stringToHex, getAddress } from "viem"
import { z } from "zod"

import { env } from "../config/env"
import {
  agentControllerAccount,
  agentControllerWalletClient,
  getOracleAddress,
  oracleAccount,
  oracleWalletClient,
  publicClient,
  questManagerAbi,
  questManagerAddress,
} from "../lib/contracts"
import { QuestCategoryToValue, serializeQuest } from "../lib/quest"

const addressRegex = /^0x[a-fA-F0-9]{40}$/
const bytes32Regex = /^0x[a-fA-F0-9]{64}$/

const createQuestSchema = z.object({
  category: z.enum(["swap", "liquidity", "stake", "lend"]),
  protocol: z.string().regex(addressRegex),
  metadataURI: z.string().min(1).max(200),
  rewardAmount: z.string().min(1),
  badgeLevel: z.number().int().positive(),
  participant: z.string().regex(addressRegex),
  expiry: z.number().int().nonnegative().optional(),
  parametersHash: z.string().regex(bytes32Regex).optional(),
  parameters: z.string().min(1).optional(),
})

const completionSchema = z.object({
  participant: z.string().regex(addressRegex),
  evidenceURI: z.string().min(1).max(200),
})

export async function createQuest(input: unknown) {
  const parsed = createQuestSchema.parse(input)

  const parametersHash =
    parsed.parametersHash ??
    keccak256(stringToHex(parsed.parameters ?? parsed.metadataURI))

  const rewardPerParticipant = parseUnits(parsed.rewardAmount, 18)

  const questParams = {
    category: QuestCategoryToValue[parsed.category],
    protocol: parsed.protocol as `0x${string}`,
    parametersHash,
    metadataURI: parsed.metadataURI,
    rewardPerParticipant,
    expiry: parsed.expiry ?? 0,
    badgeLevel: BigInt(parsed.badgeLevel),
    participant: parsed.participant as `0x${string}`,
  }

  // Use agent controller wallet for createQuest
  const simulation = await publicClient.simulateContract({
    account: agentControllerAccount,
    address: questManagerAddress,
    abi: questManagerAbi,
    functionName: "createQuest",
    args: [questParams],
  })

  const hash = await agentControllerWalletClient.writeContract(simulation.request)
  const receipt = await publicClient.waitForTransactionReceipt({ hash })

  return {
    questId: (simulation.result as bigint).toString(),
    transactionHash: receipt.transactionHash,
  }
}

export async function getQuestById(questId: number) {
  const quest = await publicClient.readContract({
    address: questManagerAddress,
    abi: questManagerAbi,
    functionName: "getQuest",
    args: [BigInt(questId)],
  })
  return serializeQuest(quest, questId)
}

export async function getParticipantProgress(questId: number, participant: string) {
  const normalizedAddress = getAddress(participant)
  const progress = (await publicClient.readContract({
    address: questManagerAddress,
    abi: questManagerAbi,
    functionName: "participantProgress",
    args: [BigInt(questId), normalizedAddress],
  })) as { accepted: boolean; completed: boolean }

  return {
    accepted: progress.accepted,
    completed: progress.completed,
  }
}

export async function recordCompletion(questId: number, input: unknown) {
  const parsed = completionSchema.parse(input)

  // Verify oracle address matches
  const oracleAddress = getOracleAddress()
  if (env.COMPLETION_ORACLE && env.COMPLETION_ORACLE.toLowerCase() !== oracleAddress.toLowerCase()) {
    throw new Error(`Wallet is not the registered completion oracle. Expected: ${env.COMPLETION_ORACLE}, Got: ${oracleAddress}`)
  }

  // Use oracle wallet for recordCompletion
  const completionSimulation = await publicClient.simulateContract({
    account: oracleAccount,
    address: questManagerAddress,
    abi: questManagerAbi,
    functionName: "recordCompletion",
    args: [BigInt(questId), parsed.participant as `0x${string}`, parsed.evidenceURI],
  })

  const hash = await oracleWalletClient.writeContract(completionSimulation.request)
  const receipt = await publicClient.waitForTransactionReceipt({ hash })

  return { transactionHash: receipt.transactionHash }
}

