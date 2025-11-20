import cron from "node-cron"
import { generateDailyQuest, generateWeeklyQuest } from "../services/dailyWeeklyQuestService"
import { getUserActiveQuests } from "../services/dailyWeeklyQuestService"
import { supabase } from "../lib/supabase"

// Helper function untuk get active users (yang sudah complete profile)
async function getActiveUsers() {
  const { data, error } = await supabase
    .from("users")
    .select("wallet_address")
    .not("name", "is", null)
    .not("email", "is", null)

  if (error) {
    throw new Error(`Failed to get active users: ${error.message}`)
  }

  return data || []
}

// Generate daily quests setiap hari jam 00:00 UTC
// Format cron: "minute hour day month weekday"
// "0 0 * * *" = jam 00:00 setiap hari
cron.schedule("0 0 * * *", async () => {
  console.log("[CRON] Running daily quest generation...", new Date().toISOString())
  try {
    const users = await getActiveUsers()
    console.log(`[CRON] Found ${users.length} active users`)
    
    for (const user of users) {
      try {
        // Check if user already has active daily quest
        const existingQuests = await getUserActiveQuests(user.wallet_address)
        if (existingQuests.daily) {
          console.log(`[CRON] User ${user.wallet_address} already has active daily quest, skipping`)
          continue
        }

        await generateDailyQuest(user.wallet_address)
        console.log(`[CRON] ✓ Generated daily quest for ${user.wallet_address}`)
      } catch (error: any) {
        console.error(`[CRON] ✗ Failed for ${user.wallet_address}:`, error.message)
      }
    }
    console.log("[CRON] Daily quest generation completed")
  } catch (error: any) {
    console.error("[CRON] Daily quest generation failed:", error.message)
  }
})

// Generate weekly quests setiap Senin jam 00:00 UTC
// "0 0 * * 1" = jam 00:00 setiap Senin (1 = Monday)
cron.schedule("0 0 * * 1", async () => {
  console.log("[CRON] Running weekly quest generation...", new Date().toISOString())
  try {
    const users = await getActiveUsers()
    console.log(`[CRON] Found ${users.length} active users`)
    
    for (const user of users) {
      try {
        // Check if user already has active weekly quest
        const existingQuests = await getUserActiveQuests(user.wallet_address)
        if (existingQuests.weekly) {
          console.log(`[CRON] User ${user.wallet_address} already has active weekly quest, skipping`)
          continue
        }

        await generateWeeklyQuest(user.wallet_address)
        console.log(`[CRON] ✓ Generated weekly quest for ${user.wallet_address}`)
      } catch (error: any) {
        console.error(`[CRON] ✗ Failed for ${user.wallet_address}:`, error.message)
      }
    }
    console.log("[CRON] Weekly quest generation completed")
  } catch (error: any) {
    console.error("[CRON] Weekly quest generation failed:", error.message)
  }
})

console.log("[CRON] Scheduler initialized:")
console.log("  - Daily quests: Every day at 00:00 UTC (0 0 * * *)")
console.log("  - Weekly quests: Every Monday at 00:00 UTC (0 0 * * 1)")

