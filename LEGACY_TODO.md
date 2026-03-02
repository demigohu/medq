# Legacy Builder TODO (Prioritized)

1. **Auto‑Verify via Mirror Node Polling**
   - Poll participant txs → protocol address
   - Filter by accepted_at → expiry window
   - If match → auto `recordCompletion`

2. **Proof Verification v2 (Log Decoding)**
   - Decode protocol logs (swap/mint/borrow)
   - Fallback to transfers if ABI mismatch

3. **Anti‑Replay (Global Tx Hash)**
   - Reject tx hash reused across quests

4. **Progress Tracker UI (Timeline)**
   - Accepted → Proof Submitted → Verified → Rewarded

5. **Quest Templates per Protokol**
   - Steps + evidence hints for SaucerSwap/Bonzo

6. **Rate Limiting + Retry/Backoff (Mirror Node)**
   - 3–5 retries with exponential backoff

7. **Observability**
   - Success/failure rate + latency logs

8. **User Feedback Widget**
   - Rating + comment stored in Supabase

9. **Early‑User Test Program**
   - 5–10 testers + feedback quotes

10. **User Profiles v2**
   - Badge showcase + XP history + streaks

11. **Quest Marketplace (Partner Publishing)**
   - Dashboard + campaign flow
   - Contract escrow (QuestMarketplace) if time allows

12. **Pre‑seeded Demo Data**
   - 3 active quests + fast proof tx hash

13. **Video Demo E2E + Pitch Deck Update**
   - HashScan links included

14. **CI / Tests**
   - Unit + integration tests for submit‑proof

