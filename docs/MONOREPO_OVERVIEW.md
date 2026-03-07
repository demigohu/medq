# Medq Turborepo – Overview

Ringkasan struktur monorepo setelah migrasi.

---

## Struktur

```
medq/
├── apps/
│   ├── web/           # Frontend v2 (redesign) – port 3001
│   ├── web-v1/        # Frontend v1 (legacy) – port 3000
│   └── api/           # Backend Express – port 4000
├── backend/           # Legacy backend (ada dist/, kemungkinan deprecated)
├── contracts/         # Foundry (QuestManager, CampaignEscrow, dll)
├── docs/
├── package.json       # Root – turbo scripts
├── pnpm-workspace.yaml
├── turbo.json
└── .env               # Shared env (NEXT_PUBLIC_* untuk frontend)
```

---

## Apps

### apps/web (Frontend v2 – redesign)

| Aspek | Detail |
|-------|--------|
| **Port** | 3001 |
| **Wallet** | RainbowKit + wagmi |
| **Design** | Baru, 3D (three.js), Dither, FaultyTerminal, TipTap |
| **Routes** | `(main)/` – page, quests, leaderboard, profile; `dashboard/studio` – create/edit quest |

**Lib:**
- `api.ts` – API client (getProtocols, getQuest, submitProof, getUserStats, getLeaderboard, getUserQuests, getAllQuests, **listCampaigns**)
- `contracts.ts` – CAMPAIGN_ESCROW, USDC
- `protocols.ts`, `utils.ts`

**Kurang di v2:**
- Campaign: `createCampaign`, `getCampaign`, `joinCampaign`, `activateCampaign`
- `campaignEscrow.ts` (helper bytes32, parseUsdcAmount)
- `useCampaignEscrow` hook
- Quest contract: `useQuestContract`, acceptQuest
- `ipfs.ts`, `store.ts`, `types.ts` (banyak)
- Reown (v2 pakai RainbowKit)

### apps/web-v1 (Frontend v1 – legacy)

| Aspek | Detail |
|-------|--------|
| **Port** | 3000 |
| **Wallet** | Reown AppKit + wagmi |
| **Design** | Layout lama |

**Lib:** Full – api (campaign methods), campaignEscrow, useQuestContract, useCampaignEscrow, ipfs, store, types, reownConfig.

### apps/api (Backend)

| Aspek | Detail |
|-------|--------|
| **Port** | 4000 |
| **Stack** | Express, Supabase, Groq, Pinata, viem |

**Routes:**
- `/health`
- `/ai` – AI quest generation
- `/campaigns` – CRUD, join, activate
- `/quests` – get, progress, submit-proof, users/*, leaderboard, complete

**Services:** dbService, questService, campaignService, campaignEscrowService, campaignCompletionService, mirrorNodeService, autoVerifyService, ipfsService, dll.

**Env:** `apps/api/.env` (atau copy dari `backend/.env`)

### backend/ (legacy?)

Folder `backend/` masih ada dengan `dist/` dan `.env`. Kemungkinan:
- Backend yang sama dengan `apps/api` (duplikat/copy)
- Atau dipakai untuk deploy terpisah

**Rekomendasi:** Pastikan satu source of truth. Jika `apps/api` sudah lengkap, `backend/` bisa dihapus atau dijadikan alias.

---

## Commands

| Command | Aksi |
|---------|------|
| `pnpm dev` | Jalankan semua (web, web-v1, api) |
| `pnpm dev:v1` | Hanya web-v1 (port 3000) |
| `pnpm dev:v2` | Hanya web (port 3001) |
| `pnpm dev:api` | Hanya API (port 4000) |
| `pnpm build` | Build semua |
| `pnpm lint` | Lint semua |

---

## Env & Ports

| App | Port | Env file |
|-----|------|----------|
| web (v2) | 3001 | `apps/web/.env`, root `.env` |
| web-v1 | 3000 | `apps/web-v1/.env` |
| api | 4000 | `apps/api/.env` |

**Root `.env`** berisi `NEXT_PUBLIC_*` yang dipakai frontend.

**Backend (api)** butuh: RPC_URL, contract addresses, keys, Supabase, GROQ_API_KEY, PINATA_JWT, MIRROR_NODE_URL.

---

## Packages (shared)

Belum ada `packages/`. Semua logic ada di masing-masing app.

**Opsi ke depan:** Buat `packages/api` dan `packages/contracts` agar web dan web-v1 pakai shared code.

---

## Yang Perlu Dilakukan untuk web (v2)

1. **API methods campaign** – Tambah `createCampaign`, `getCampaign`, `joinCampaign`, `activateCampaign` ke `apps/web/src/lib/api.ts`
2. **campaignEscrow.ts** – Copy dari web-v1: `campaignIdToBytes32`, `parseUsdcAmount`, ABI
3. **useCampaignEscrow** – Copy dari web-v1 untuk deposit flow partner
4. **Quest on-chain** – Jika v2 butuh accept quest, perlu `useQuestContract` (wallet sign)
5. **RainbowKit vs Reown** – v2 pakai RainbowKit. Pastikan Hedera Testnet dikonfigurasi (sudah ada di providers)

---

## Contracts

- `contracts/` – Foundry, QuestManager, CampaignEscrow, dll.
- Bukan bagian workspace pnpm (tetap di root)
- Deploy manual: `cd contracts && forge script ...`

---

## Hosting (saran)

| Service | Deploy |
|---------|--------|
| Frontend v2 | Vercel – root dir `apps/web` |
| Frontend v1 | (opsional) Vercel – root dir `apps/web-v1` |
| API | Railway / Render / Fly.io – root dir `apps/api` |
