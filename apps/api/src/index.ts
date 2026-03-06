import cors from "cors"
import express from "express"

import { env } from "./config/env"
import { aiRouter } from "./routes/ai"
import { campaignsRouter } from "./routes/campaigns"
import { questProofsRouter } from "./routes/questProofs"
import { questsRouter } from "./routes/quests"
import { recordCompletion } from "./services/questService"
import { startQuestPolling } from "./polling/questPolling"

// Import cron scheduler (akan start otomatis saat server start)
import "./cron/scheduler"
startQuestPolling()

const app = express()

app.use(cors())
app.use(express.json({ limit: "1mb" }))

app.get("/health", (_, res) => {
  res.json({ status: "ok", network: env.RPC_URL })
})

app.use("/ai", aiRouter)
app.use("/campaigns", campaignsRouter)
app.use("/quests", questsRouter)
app.use("/quests", questProofsRouter)

app.post("/quests/:id/complete", async (req, res, next) => {
  try {
    const questId = Number(req.params.id)
    if (Number.isNaN(questId) || questId <= 0) {
      return res.status(400).json({ message: "Invalid quest id" })
    }
    const result = await recordCompletion(questId, req.body)
    return res.json(result)
  } catch (error) {
    next(error)
  }
})

app.use((err: any, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error(err)
  const message = err?.message ?? "Unexpected error"
  res.status(500).json({ message })
})

app.listen(env.PORT, () => {
  console.log(`Backend listening on http://localhost:${env.PORT}`)
})

