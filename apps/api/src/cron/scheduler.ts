import cron from "node-cron"
import { processExpiredQuests } from "../services/dailyWeeklyQuestService"

/**
 * Expiry-driven quest regeneration.
 * Trigger = quest expired (bukan jadwal jam 00:00).
 * Job cek periodic: ada quest yang expiry_timestamp < now? -> mark expired, generate baru.
 * Cron: every 15 minutes
 */
cron.schedule("*/5 * * * *", async () => {
  console.log("[CRON] Checking for expired daily/weekly quests...", new Date().toISOString())
  try {
    const stats = await processExpiredQuests()
    if (stats.processed > 0) {
      console.log(
        `[CRON] Processed ${stats.processed} expired quests — daily: ${stats.daily.success} ok, ${stats.daily.failed} failed | weekly: ${stats.weekly.success} ok, ${stats.weekly.failed} failed`
      )
    }
  } catch (error: any) {
    console.error("[CRON] processExpiredQuests failed:", error.message)
  }
})

console.log("[CRON] Scheduler initialized:")
console.log("  - Expiry-driven quest regeneration: Every 15 min, trigger = quest expired")

