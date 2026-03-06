# Medq Quest Backend

TypeScript + Express service that holds the quest agent/oracle credentials, talks to Hedera (EVM + Mirror Node), orchestrates AI quest generation, and persists metadata in Supabase.

---

## Getting Started

1. **Prepare Supabase**
   - Create a project on [Supabase](https://supabase.com).
   - Run the SQL in `database/schema.sql`.
   - Grab `SUPABASE_URL` + `SUPABASE_SERVICE_ROLE_KEY` from Project Settings → API.

2. **Configure environment**
   - Copy `env.example` → `.env`.
   - Fill in RPC URL, quest agent controller key, completion oracle key, deployed contract addresses, Groq, Pinata, Supabase, and Mirror Node URLs.

3. **Install dependencies**
   ```bash
   cd backend
   npm install
   ```

4. **Run**
   ```bash
   npm run dev         # watch mode on :4000
   npm run build && npm start   # production
   ```

---

## Supported Hedera DeFi Protocols
Used when generating quests via `POST /ai/quests`. See `GET /ai/protocols` for the live list.

| Protocol | Category | Address | Notes |
| --- | --- | --- | --- |
| SaucerSwap Finance | Swap | `0x0000000000000000000000000000000000004b40` | DEX on Hedera Testnet |
| Bonzo Finance | Lending | `0x118dd8f2c0f2375496df1e069af1141fa034251b` | Lending + borrowing |

Add new protocols in `src/lib/protocols.ts`.

---

## REST API Overview

| Endpoint | Description |
| --- | --- |
| `GET /health` | Service & RPC status. |
| `GET /ai/protocols` | Supported DeFi protocols for quest generation. |
| `POST /ai/quests` | Groq-powered quest generator (optionally auto-deploys on-chain + Pinata upload). |
| `GET /quests/:id` | Fetch quest details straight from QuestManager. |
| `GET /quests/:id/progress/:participant` | On-chain accepted/completed flags for a participant. |
| `GET /quests` | List active quests (optionally filter by participant). |
| `GET /quests/leaderboard?limit=100` | Supabase-backed XP leaderboard. |
| `GET /quests/users/:address/stats` | XP, level, completed quests, rank. |
| `POST /quests/:id/submit-proof` | Verify tx hash via Mirror Node, persist submission, auto-call `recordCompletion`. |
| `POST /quests/:id/complete` | Manual oracle completion (fallback if auto flow fails). |
| `POST /quests/users/:address/profile` | Save name/email, then auto-generate daily/weekly quests. |
| `PATCH /quests/users/:address/avatar` | Update avatar URL. |
| `POST /quests/users/:address/generate-quests` | Force-generate daily/weekly quests. |
| `GET /quests/users/:address/rewards` | Read MEDQ payouts + BadgeNFT history. |
| `GET /quests/users/:address/completed` | Completed quest list with submission hashes. |

All endpoints accept/return JSON. Make sure the oracle wallet used by the backend is authorized via `QuestManager.setCompletionOracle`, and that `MIRROR_NODE_URL` points to a Hedera Mirror Node endpoint (default: testnet).

---

## Submit-Proof Flow
When a participant submits a transaction hash (`POST /quests/:id/submit-proof`), the backend:
1. Reads quest info to confirm status + participant assignment.
2. Checks participant progress (must be accepted, not completed).
3. Ensures the tx hash has not been submitted before.
4. Calls Hedera Mirror Node to confirm the transaction (status, from/to).
5. Writes the submission (pending → verified/failed) to Supabase.
6. If verified, calls `recordCompletion` on QuestManager (oracle signs).
7. Rewards MEDQ via `RewardVault`, mints BadgeNFT, stores XP gain in Supabase.

---

## Testing

Tests live under `src/**/__tests__` and `src/**/*.test.ts`. Frameworks: Jest + Supertest.

```bash
npm test            # run once
npm run test:watch  # watch mode
npm run test:coverage
npm run test:flow   # scripted API regression (skips submit-proof because it needs a real tx)
```

Recommended setup for external deps:
1. Create `.env.test` (or mock services) for Groq, Supabase, Mirror Node.
2. Unit tests: mock external calls.
3. Integration tests: use dedicated Supabase schema/test keys.

### Example test snippet
```ts
import { testApp } from "../../__tests__/helpers"
import express from "express"

const app = express()
app.get("/test", (_req, res) => res.json({ ok: true }))

describe("Test Endpoint", () => {
  it("returns ok", async () => {
    const res = await testApp(app).get("/test")
    expect(res.status).toBe(200)
    expect(res.body).toEqual({ ok: true })
  })
})
```

---

## Manual API Testing

1. Start the dev server:
   ```bash
   npm run dev
   ```
2. Run scripted flow:
   ```bash
   npm run test:flow
   ```
3. For ad hoc calls, use `test-api.http` + VS Code REST Client (adjust `@questId`, `@txHash`, `@participant`).
4. Full end-to-end path: **Generate Quest → Accept on-chain → Execute action → Submit Proof**. See `TESTING.md` for detailed walkthroughs and sample hashes.

### Curl examples
**Generate quest**
```bash
curl -X POST http://localhost:4000/ai/quests \
  -H "Content-Type: application/json" \
  -d '{
    "projectName": "SaucerSwap",
    "goal": "Swap tokens on SaucerSwap",
    "chain": "Hedera Testnet",
    "protocol": "0x0000000000000000000000000000000000004b40",
    "participant": "0xYourWalletAddress",
    "rewardAmount": "100",
    "badgeLevel": 1,
    "autoDeploy": true
  }'
```

**Read quest**
```bash
curl http://localhost:4000/quests/1
```

**Submit proof**
```bash
curl -X POST http://localhost:4000/quests/1/submit-proof \
  -H "Content-Type: application/json" \
  -d '{
    "transactionHash": "0xYourTxHash",
    "participant": "0xYourWalletAddress"
  }'
```

---

## Notes
- Keep `.env` synced with the latest contract addresses (QuestManager, RewardVault, BadgeNFT, ERC‑8004 registries).
- Supabase stores quest metadata, submissions, XP stats, and leaderboard.
- Mirror Node URL defaults to Hedera Testnet (`https://testnet.mirrornode.hedera.com/api/v1`); change if you run your own node.
- Groq + Pinata credentials are required if you want `POST /ai/quests` to auto-generate + auto-deploy quests.

For deeper details (cron jobs, DB schema, scripted flows), refer to:
- `database/schema.sql`
- `src/cron/*`
- `scripts/test-flow.ts`
