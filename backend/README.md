# Medq Quest Backend

Express + TypeScript service yang memegang kredensial agent/oracle untuk berinteraksi dengan kontrak Hedera testnet.

## Menjalankan

1. Setup Supabase Database:
   - Buat project baru di [Supabase](https://supabase.com)
   - Copy SQL schema dari `database/schema.sql` dan jalankan di SQL Editor
   - Ambil `SUPABASE_URL` dan `SUPABASE_SERVICE_ROLE_KEY` dari Project Settings → API

2. Salin `env.example` menjadi `.env` dan isi:
   - RPC, private key controller/agent, alamat kontrak
   - `GROQ_API_KEY` (untuk AI quest generation)
   - `PINATA_JWT` (untuk upload metadata ke IPFS)
   - `SUPABASE_URL` dan `SUPABASE_SERVICE_ROLE_KEY` (untuk database)
3. Instal dependensi:
   ```bash
   cd backend
   npm install
   ```
3. Jalankan mode pengembangan:
   ```bash
   npm run dev
   ```
   atau build + start:
   ```bash
   npm run build
   npm start
   ```

## Supported DeFi Protocols

Backend mendukung quest generation untuk protokol DeFi berikut di Hedera Testnet:

- **SaucerSwap Finance** (`0x0000000000000000000000000000000000004b40`)
  - Category: Swap
  - Website: https://testnet.saucerswap.finance/swap
  - Description: Decentralized exchange for token swaps

- **Bonzo Finance** (`0x118dd8f2c0f2375496df1e069af1141fa034251b`)
  - Category: Lending & Borrowing
  - Website: https://testnet.bonzo.finance/
  - Description: Lending and borrowing protocol

Gunakan alamat protokol ini saat membuat quest via `POST /ai/quests`. Lihat `GET /ai/protocols` untuk list lengkap.

## Endpoint

- `GET /health` – cek status backend.
- `GET /ai/protocols` – get list protocol yang tersedia untuk quest generation.
- `GET /quests/:id` – baca detail quest langsung dari kontrak.
- `GET /quests/:id/progress/:participant` – baca status accepted/completed untuk participant tertentu.
- `GET /quests/leaderboard?limit=100` – get leaderboard top users by XP (dari database).
- `GET /quests/users/:address/stats` – get user stats (XP, completed quests, level, rank).
- `POST /ai/quests` – minta AI (Groq) menyusun & (opsional) langsung deploy quest ke chain (upload metadata ke Pinata IPFS → `createQuest` on-chain → save ke database).
- `POST /quests/:id/submit-proof` – user kirim tx hash sebagai bukti penyelesaian quest. Backend akan:
  1. Query quest details untuk verifikasi participant & status (harus aktif, belum expired).
  2. Verifikasi progress participant (sudah accept, belum completed).
  3. Cek duplikasi tx hash via database (prevent double submission).
  4. Simpan submission ke database (status: pending).
  5. Verifikasi tx hash via Hedera Mirror Node (cek status SUCCESS, from/to addresses).
  6. Update submission status ke verified/failed di database.
  7. Auto trigger `recordCompletion` jika verifikasi sukses (oracle sign completion → RewardVault transfer MEDQ, BadgeNFT mint, ReputationRegistry update).
  8. Record XP gain ke database (auto-update user_stats via trigger).
- `POST /quests/:id/complete` – endpoint manual khusus oracle untuk menyelesaikan quest (jika tidak pakai auto-completion flow).

Semua endpoint menerima/merespons JSON. Pastikan wallet yang dipakai sudah didaftarkan sebagai agent serta completion oracle di kontrak. Set `MIRROR_NODE_URL` di `.env` untuk verifikasi tx hash (default: Hedera testnet Mirror Node). Semua data (quest metadata, submissions, XP, leaderboard) tersimpan di Supabase database.

## Testing

Backend menggunakan Jest + Supertest untuk testing. Test files berada di `src/**/__tests__/` dan `src/**/*.test.ts`.

### Menjalankan Tests

```bash
# Run semua tests
npm test

# Run tests dengan watch mode (auto-reload saat file berubah)
npm run test:watch

# Run tests dengan coverage report
npm run test:coverage
```

### Test Files

- `src/__tests__/health.test.ts` - Health check endpoint test
- `src/__tests__/helpers.ts` - Test utilities & helpers
- `src/lib/__tests__/protocols.test.ts` - Protocol definitions unit tests
- `src/routes/__tests__/ai.test.ts` - AI routes integration tests

### Test Environment

Untuk tests yang memerlukan external services (Supabase, Groq, Mirror Node), pastikan:
1. Buat file `.env.test` dengan test credentials (opsional, atau gunakan mocks)
2. Untuk unit tests, gunakan mocks untuk external services
3. Untuk integration tests, gunakan test credentials yang terpisah

### Menulis Test Baru

Contoh test endpoint:

```typescript
import { testApp } from "../../__tests__/helpers"
import express from "express"

const app = express()
app.get("/test", (req, res) => res.json({ ok: true }))

describe("Test Endpoint", () => {
  it("should return ok", async () => {
    const response = await testApp(app).get("/test")
    expect(response.status).toBe(200)
    expect(response.body).toEqual({ ok: true })
  })
})
```

## Manual Testing (API Testing)

Untuk menguji fitur-fitur utama backend sebelum integrasi ke frontend:

### Quick Start

1. Pastikan backend server running:
   ```bash
   npm run dev
   ```

2. Jalankan automated test flow:
   ```bash
   npm run test:flow
   ```
   Ini akan test semua endpoint utama kecuali submit-proof (karena memerlukan tx hash real).

3. Atau gunakan HTTP file untuk manual testing:
   - Install REST Client extension di VS Code
   - Buka `test-api.http`
   - Edit variables (`@questId`, `@txHash`, `@participant`)
   - Klik "Send Request" di atas setiap request

4. Untuk testing lengkap (termasuk quest completion):
   - Lihat `TESTING.md` untuk panduan lengkap
   - Flow: Generate Quest → Accept Quest (on-chain) → Complete Action → Submit Proof

### Test Endpoints Secara Manual

**1. Test AI Quest Generation:**
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

**2. Test Read Quest:**
```bash
curl http://localhost:4000/quests/1
```

**3. Test Submit Proof (setelah user accept & complete action):**
```bash
curl -X POST http://localhost:4000/quests/1/submit-proof \
  -H "Content-Type: application/json" \
  -d '{
    "transactionHash": "0xYourTxHash",
    "participant": "0xYourWalletAddress"
  }'
```

Lihat `TESTING.md` untuk dokumentasi lengkap testing semua fitur utama.


