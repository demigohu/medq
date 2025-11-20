import { Router } from "express"
import { z } from "zod"

import { recordCompletion, getQuestById, getParticipantProgress } from "../services/questService"
import { verifyTransactionHash } from "../services/mirrorNodeService"
import {
  isTransactionHashSubmitted,
  saveQuestSubmission,
  updateSubmissionCompletion,
  recordXP,
  getOrCreateUser,
  getQuestByOnChainId,
  type Quest,
} from "../services/dbService"

export const questProofsRouter = Router()

const submitProofSchema = z.object({
  transactionHash: z.string().min(1),
  participant: z.string().regex(/^0x[a-fA-F0-9]{40}$/).optional(),
})

/**
 * POST /quests/:id/submit-proof
 * User submit tx hash sebagai bukti penyelesaian quest
 * Backend akan:
 * 1. Query quest details
 * 2. Verifikasi tx hash via Hedera Mirror Node
 * 3. Auto trigger recordCompletion jika valid
 */
questProofsRouter.post("/:id/submit-proof", async (req, res, next) => {
  try {
    const questId = Number(req.params.id)
    if (Number.isNaN(questId) || questId <= 0) {
      return res.status(400).json({ message: "Invalid quest id" })
    }

    const parsed = submitProofSchema.parse(req.body)

    // Get quest details to verify participant
    const quest = await getQuestById(questId)
    if (quest.statusValue !== 1) {
      return res.status(400).json({
        message: `Quest status is ${quest.status}. Only active quests can be completed.`,
      })
    }

    const now = Math.floor(Date.now() / 1000)
    const expiry = Number(quest.expiry ?? "0")
    if (expiry !== 0 && expiry < now) {
      return res.status(400).json({
        message: "Quest has expired",
      })
    }

    // Verify participant matches (if provided in request)
    const participant = parsed.participant ?? quest.assignedParticipant
    if (participant.toLowerCase() !== quest.assignedParticipant.toLowerCase()) {
      return res.status(403).json({
        message: "Participant address does not match quest assignment",
      })
    }

    const progress = await getParticipantProgress(questId, participant)
    if (!progress.accepted) {
      return res.status(400).json({
        message: "Quest has not been accepted by this participant",
      })
    }
    if (progress.completed) {
      return res.status(400).json({
        message: "Quest already marked as completed",
      })
    }

    // Check if tx hash already submitted (via DB)
    const alreadySubmitted = await isTransactionHashSubmitted(questId, parsed.transactionHash)
    if (alreadySubmitted) {
      return res.status(409).json({
        message: "This transaction hash has already been submitted for this quest",
      })
    }

    // Verify transaction hash via Hedera Mirror Node (query first before saving)
    const verification = await verifyTransactionHash(
      parsed.transactionHash,
      participant, // expected from address
      quest.protocol // expected to address (protocol address from quest)
    )

    if (!verification.valid) {
      // Record failed attempt only after verification
      await saveQuestSubmission({
        quest_id_on_chain: questId,
        participant_address: participant,
        transaction_hash: parsed.transactionHash,
        mirror_node_payload: verification.transaction,
        verification_status: "failed",
      })

      return res.status(400).json({
        message: "Transaction verification failed",
        error: verification.error,
      })
    }

    // Save verified submission
    await saveQuestSubmission({
      quest_id_on_chain: questId,
      participant_address: participant,
      transaction_hash: parsed.transactionHash,
      mirror_node_payload: verification.transaction,
      verification_status: "verified",
    })

    // Generate evidence URI (can be IPFS link to transaction proof later)
    const evidenceURI = `ipfs://proof_${questId}_${parsed.transactionHash.substring(0, 10)}`

    // Auto trigger recordCompletion
    const completionResult = await recordCompletion(questId, {
      participant,
      evidenceURI,
    })

    // Update submission with completion tx hash
    await updateSubmissionCompletion(questId, parsed.transactionHash, completionResult.transactionHash)

    // Get quest from DB to extract XP reward
    const dbQuest = await getQuestByOnChainId(questId)

    // Record XP gain (triggers user_stats update)
    if (dbQuest) {
      // Get or create user
      await getOrCreateUser(participant)

      const xpAmount = calculateXpReward(dbQuest)

      await recordXP(
        participant,
        questId,
        xpAmount,
        dbQuest.reward_per_participant,
        undefined, // badge_token_id will be available after NFT mint, can update later
        completionResult.transactionHash
      )
    }

    return res.json({
      message: "Quest completed successfully",
      questId: questId.toString(),
      transactionHash: completionResult.transactionHash,
      verification: {
        transactionHash: parsed.transactionHash,
        mirrorNodeTx: verification.transaction,
      },
    })
  } catch (error) {
    next(error)
  }
})

function calculateXpReward(quest?: Quest | null): number {
  if (!quest) {
    return 100
  }

  // Weekly quests (badge level >= 2) earn higher XP
  const badgeLevel = quest.badge_level ?? 0
  if (quest.quest_type === "weekly" || badgeLevel >= 2) {
    return 100
  }

  if (quest.quest_type === "daily" || badgeLevel === 1) {
    return 50
  }

  if (quest.reward_per_participant) {
    const reward = Number(quest.reward_per_participant)
    if (!Number.isNaN(reward)) {
      return Math.max(25, Math.round(reward / 2))
    }
  }

  return 75
}

