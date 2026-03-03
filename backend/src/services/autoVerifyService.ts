import { env } from "../config/env"
import { findMatchingTransactionHash } from "./mirrorNodeService"
import { getParticipantProgress, recordCompletion } from "./questService"
import { fetchQuestMetadataFromIpfs } from "./ipfsService"
import {
  getActiveQuestsForAutoVerify,
  isTransactionHashSubmitted,
  isTransactionHashUsedByParticipant,
  saveQuestSubmission,
  updateSubmissionCompletion,
  recordXP,
  getQuestByOnChainId,
} from "./dbService"

function toEpochSeconds(value?: number | string | null) {
  if (!value) return 0
  if (typeof value === "number") return Math.floor(value)
  const parsed = Date.parse(value)
  return Number.isNaN(parsed) ? 0 : Math.floor(parsed / 1000)
}

export async function runAutoVerifyOnce() {
  if (!env.MIRROR_NODE_URL) {
    console.warn("[AUTO-VERIFY] MIRROR_NODE_URL missing, skipping")
    return
  }

  const quests = await getActiveQuestsForAutoVerify(50)
  if (!quests.length) {
    console.log("[AUTO-VERIFY] No active quests to verify")
    return
  }

  console.log(`[AUTO-VERIFY] Checking ${quests.length} active quests`)

  for (const quest of quests) {
    try {
      if (!quest.assigned_participant || !quest.protocol_address) {
        console.log(
          `[AUTO-VERIFY] Skip quest ${quest.quest_id_on_chain}: missing participant/protocol`
        )
        continue
      }

      const progress = await getParticipantProgress(
        Number(quest.quest_id_on_chain),
        quest.assigned_participant
      )
      if (!progress.accepted || progress.completed) {
        console.log(
          `[AUTO-VERIFY] Skip quest ${quest.quest_id_on_chain}: accepted=${progress.accepted} completed=${progress.completed}`
        )
        continue
      }

      const acceptedAtEpoch = toEpochSeconds(quest.accepted_at)
      if (!acceptedAtEpoch) {
        console.log(
          `[AUTO-VERIFY] Skip quest ${quest.quest_id_on_chain}: no accepted_at (waiting for QuestAccepted event)`
        )
        continue
      }

      const sinceEpoch = acceptedAtEpoch

      const metadata = await fetchQuestMetadataFromIpfs(quest.metadata_uri)

      console.log(
        `[AUTO-VERIFY] Searching tx for quest ${quest.quest_id_on_chain} (participant=${quest.assigned_participant}, protocol=${quest.protocol_address}, since=${sinceEpoch})`
      )

      const txHash = await findMatchingTransactionHash(
        quest.assigned_participant,
        quest.protocol_address,
        sinceEpoch,
        {
          verificationParams: metadata?.verificationParams ?? null,
          ...((metadata?.category ?? quest.category) && {
            protocolCategory: metadata?.category ?? quest.category,
          }),
        }
      )

      if (!txHash) {
        console.log(`[AUTO-VERIFY] No matching tx for quest ${quest.quest_id_on_chain}`)
        continue
      }

      const alreadySubmitted = await isTransactionHashSubmitted(
        Number(quest.quest_id_on_chain),
        txHash
      )
      if (alreadySubmitted) {
        console.log(
          `[AUTO-VERIFY] Tx already submitted for quest ${quest.quest_id_on_chain}: ${txHash}`
        )
        continue
      }

      const usedByParticipant = await isTransactionHashUsedByParticipant(
        quest.assigned_participant,
        txHash
      )
      if (usedByParticipant) {
        console.log(
          `[AUTO-VERIFY] Tx already used by participant for another quest, skip quest ${quest.quest_id_on_chain}: ${txHash}`
        )
        continue
      }

      await saveQuestSubmission({
        quest_id_on_chain: Number(quest.quest_id_on_chain),
        participant_address: quest.assigned_participant,
        transaction_hash: txHash,
        verification_status: "verified",
      })

      const evidenceURI = `ipfs://proof_${quest.quest_id_on_chain}_${txHash.substring(0, 10)}`
      const completionResult = await recordCompletion(Number(quest.quest_id_on_chain), {
        participant: quest.assigned_participant,
        evidenceURI,
      })

      await updateSubmissionCompletion(
        Number(quest.quest_id_on_chain),
        txHash,
        completionResult.transactionHash
      )

      const dbQuest = await getQuestByOnChainId(Number(quest.quest_id_on_chain))
      if (dbQuest) {
        const badgeLevel = dbQuest.badge_level ?? 1
        const questType = dbQuest.quest_type
        let xpAmount = 75
        if (questType === "weekly" || badgeLevel >= 2) xpAmount = 100
        if (questType === "daily" || badgeLevel === 1) xpAmount = 50

        await recordXP(
          quest.assigned_participant,
          Number(quest.quest_id_on_chain),
          xpAmount,
          dbQuest.reward_per_participant,
          undefined,
          completionResult.transactionHash
        )
      }

      console.log(`[AUTO-VERIFY] ✓ Completed quest ${quest.quest_id_on_chain}`)
    } catch (error: any) {
      console.error(
        `[AUTO-VERIFY] ✗ Failed quest ${quest.quest_id_on_chain}:`,
        error?.message || error
      )
    }
  }
}
