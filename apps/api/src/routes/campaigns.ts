import { Router } from "express"
import { z } from "zod"

import {
  createCampaign,
  getCampaignById,
  listCampaigns,
  updateCampaignStatus,
} from "../services/dbService"
import { joinCampaign, activateCampaign } from "../services/campaignService"

export const campaignsRouter: Router = Router()

const createCampaignSchema = z.object({
  partner_wallet: z.string().regex(/^0x[a-fA-F0-9]{40}$/),
  title: z.string().min(2),
  template_type: z.enum(["swap", "deposit", "borrow", "stake", "other"]),
  description: z.string().optional(),
  thumbnail: z.union([z.string().url(), z.literal("")]).optional(),
  template_params: z.record(z.string(), z.unknown()),
  pool_amount: z.number().positive(),
  max_participants: z.number().int().positive(),
  period_start: z.string().datetime().optional(),
  period_end: z.string().datetime().optional(),
  start_at: z.string().datetime().optional(),
  end_at: z.string().datetime().optional(),
})

const joinCampaignSchema = z.object({
  participant: z.string().regex(/^0x[a-fA-F0-9]{40}$/),
})

/**
 * POST /campaigns
 * Create a new campaign (partner)
 */
campaignsRouter.post("/", async (req, res, next) => {
  try {
    const parsed = createCampaignSchema.parse(req.body)
    const tp = parsed.template_params as Record<string, unknown>
    if (!tp?.protocol_address || !/^0x[a-fA-F0-9]{40}$/.test(String(tp.protocol_address))) {
      return res.status(400).json({ message: "template_params must include valid protocol_address" })
    }
    const startAt = parsed.period_start ?? parsed.start_at
    const endAt = parsed.period_end ?? parsed.end_at
    const campaign = await createCampaign({
      partner_wallet: parsed.partner_wallet,
      title: parsed.title,
      template_type: parsed.template_type,
      template_params: parsed.template_params as Record<string, unknown>,
      pool_amount: parsed.pool_amount,
      max_participants: parsed.max_participants,
      ...(parsed.description != null && { description: parsed.description }),
      ...(parsed.thumbnail && { thumbnail: parsed.thumbnail }),
      ...(startAt && { start_at: startAt }),
      ...(endAt && { end_at: endAt }),
    })
    return res.status(201).json(campaign)
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ message: "Invalid input", errors: error.issues })
    }
    next(error)
  }
})

/**
 * GET /campaigns
 * List campaigns. Query: ?status=active&partner=0x...
 */
campaignsRouter.get("/", async (req, res, next) => {
  try {
    const status = req.query.status as string | undefined
    const partner = req.query.partner as string | undefined
    const participant = req.query.participant as string | undefined
    const limit = req.query.limit ? Number(req.query.limit) : 50

    const campaigns = await listCampaigns({
      ...(status && { status }),
      ...(partner && { partner_wallet: partner }),
      ...(participant && /^0x[a-fA-F0-9]{40}$/.test(participant) && { participant }),
      limit,
    })
    return res.json({ campaigns })
  } catch (error) {
    next(error)
  }
})

/**
 * GET /campaigns/:id
 * Get campaign by ID
 */
campaignsRouter.get("/:id", async (req, res, next) => {
  try {
    const campaign = await getCampaignById(req.params.id)
    if (!campaign) {
      return res.status(404).json({ message: "Campaign not found" })
    }
    return res.json(campaign)
  } catch (error) {
    next(error)
  }
})

/**
 * POST /campaigns/:id/join
 * User joins campaign → AI generates quest, assigns to participant
 */
campaignsRouter.post("/:id/join", async (req, res, next) => {
  try {
    const parsed = joinCampaignSchema.parse(req.body)
    const result = await joinCampaign(req.params.id, parsed.participant)
    return res.json({
      message: "Campaign joined. Quest created.",
      questIdOnChain: result.questIdOnChain,
      deploymentTxHash: result.deploymentTxHash,
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ message: "Invalid input", errors: error.issues })
    }
    next(error)
  }
})

/**
 * POST /campaigns/:id/activate
 * Activate campaign (e.g. after deposit confirmed). For MVP, allows manual activate.
 */
campaignsRouter.post("/:id/activate", async (req, res, next) => {
  try {
    const escrowTxHash = (req.body as { escrow_tx_hash?: string } | undefined)?.escrow_tx_hash
    await activateCampaign(req.params.id, escrowTxHash)
    return res.json({ message: "Campaign activated" })
  } catch (error) {
    next(error)
  }
})

const updateCampaignStatusSchema = z.object({
  status: z.enum(["draft", "pending", "active", "completed", "cancelled"]),
})

/**
 * PATCH /campaigns/:id
 * Update campaign status (e.g. cancel)
 */
campaignsRouter.patch("/:id", async (req, res, next) => {
  try {
    const parsed = updateCampaignStatusSchema.parse(req.body)
    const campaign = await getCampaignById(req.params.id)
    if (!campaign) {
      return res.status(404).json({ message: "Campaign not found" })
    }
    await updateCampaignStatus(req.params.id, parsed.status)
    const updated = await getCampaignById(req.params.id)
    return res.json(updated)
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ message: "Invalid input", errors: error.issues })
    }
    next(error)
  }
})
