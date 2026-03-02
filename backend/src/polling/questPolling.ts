import { runAutoVerifyOnce } from "../services/autoVerifyService"
import { runQuestAcceptedWatcherOnce } from "../services/questEventWatcher"

const POLL_INTERVAL_MS = 60_000

let watcherInProgress = false
let autoVerifyInProgress = false

async function pollQuestAccepted() {
  if (watcherInProgress) {
    console.log("[WATCHER] Skipped (previous run still in progress)")
    return
  }
  watcherInProgress = true
  try {
    await runQuestAcceptedWatcherOnce()
  } catch (error: any) {
    console.error("[WATCHER] Failed:", error?.message || error)
  } finally {
    watcherInProgress = false
  }
}

async function pollAutoVerify() {
  if (autoVerifyInProgress) {
    console.log("[POLL] Auto-verify skipped (previous run still in progress)")
    return
  }
  autoVerifyInProgress = true
  console.log("[POLL] Running auto-verify polling...", new Date().toISOString())
  try {
    await runAutoVerifyOnce()
  } catch (error: any) {
    console.error("[POLL] Auto-verify polling failed:", error?.message || error)
  } finally {
    autoVerifyInProgress = false
  }
}

export function startQuestPolling() {
  // Run watcher first to capture accepted events
  void pollQuestAccepted()
  setInterval(pollQuestAccepted, POLL_INTERVAL_MS)

  // Then run auto-verify
  setTimeout(() => {
    void pollAutoVerify()
    setInterval(pollAutoVerify, POLL_INTERVAL_MS)
  }, 5_000)
}
