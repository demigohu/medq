# Frontend – Campaign Marketplace

Dokumen ini untuk developer frontend yang mengerjakan fitur **Quest Marketplace (Partner Campaign)**. Backend, contract, dan DB sudah siap.

---

## 1. Ringkasan

- **Partner** buat campaign dengan pool USDC → deposit ke escrow → activate
- **User** lihat campaign → join → dapat quest → complete → dapat USDC + MEDQ
- USDC di Hedera = HTS token → **perlu associate** sebelum terima/kirim

---

## 2. Tech Stack & Struktur

- **Framework**: Next.js
- **Base path**: `src/`
- **API client**: `src/lib/api.ts` (perlu tambah methods campaign)
- **Wallet**: Reown (WalletConnect), HashPack/Blade untuk Hedera
- **Styling**: shadcn/ui, Tailwind (ikuti pola existing)
- **Referensi**: `src/app/(with-sidebar)/quests/page.tsx`, `src/components/quest-card.tsx`

---

## 3. API Endpoints

Base URL: `NEXT_PUBLIC_API_URL` (default: `http://localhost:4000`)

| Method | Endpoint | Deskripsi |
|--------|----------|-----------|
| POST | `/campaigns` | Create campaign (partner) |
| GET | `/campaigns` | List campaigns. Query: `?status=active&partner=0x...&limit=50` |
| GET | `/campaigns/:id` | Campaign detail |
| POST | `/campaigns/:id/join` | User join campaign → generate quest |
| POST | `/campaigns/:id/activate` | Activate campaign (setelah deposit) |

### 3.1 Create Campaign – Request Body

```json
{
  "partner_wallet": "0x10cbafc578a3fac6ba4c9b2b30737cace182ccfc",
  "title": "SaucerSwap Swap Campaign",
  "template_type": "swap",
  "description": "<p>HTML description...</p>",
  "thumbnail": "https://...",
  "period_start": "2026-03-01T10:00:00.000Z",
  "period_end": "2026-03-31T23:59:59.000Z",
  "template_params": {
    "amount": 100,
    "token_in": "HBAR",
    "token_out": "SAUCE",
    "protocol_address": "0x0000000000000000000000000000000000004b40"
  },
  "pool_amount": 1000,
  "max_participants": 10
}
```

`template_type`: `"swap"` | `"deposit"` | `"borrow"` | `"stake"`  
`template_params` harus punya `protocol_address` (EVM address).

### 3.2 Join Campaign – Request Body

```json
{
  "participant": "0x..."
}
```

Response:
```json
{
  "message": "Campaign joined. Quest created.",
  "questIdOnChain": 123,
  "deploymentTxHash": "0x..."
}
```

### 3.3 Activate Campaign – Request Body

```json
{
  "escrow_tx_hash": "0x..."
}
```

---

## 4. Contract & Env

| Variabel | Nilai (Testnet) | Deskripsi |
|----------|-----------------|-----------|
| `NEXT_PUBLIC_CAMPAIGN_ESCROW_ADDRESS` | `0x66fb7f3f5e7148D94D846890d898eb06dCfE8fa2` | CampaignEscrow contract |
| `NEXT_PUBLIC_USDC_ADDRESS` | `0x0000000000000000000000000000000000001549` | USDC HTS (token 0.0.5449) |

---

## 5. Yang Perlu Dibangun

### 5.1 API Client (`src/lib/api.ts`) ✅

Sudah ada methods:

```ts
// Campaigns
async createCampaign(data: CreateCampaignInput) { ... }
async listCampaigns(params?: { status?: string; partner?: string; limit?: number }) { ... }
async getCampaign(id: string) { ... }
async joinCampaign(id: string, participant: string) { ... }
async activateCampaign(id: string, escrowTxHash?: string) { ... }
```

### 5.2 Campaign Escrow (`src/lib/campaignEscrow.ts`) ✅

- `campaignIdToBytes32(campaignId)` – sama dengan backend
- `parseUsdcAmount(amount)` – USDC 6 decimals
- `CAMPAIGN_ESCROW_ADDRESS`, `USDC_ADDRESS`
- `CAMPAIGN_ESCROW_ABI`, `ERC20_APPROVE_ABI`

### 5.3 Hook `useCampaignEscrow` (`src/hooks/useCampaignEscrow.ts`) ✅

- `approveUsdc(amount)` – approve USDC ke escrow
- `deposit(campaignId, amount)` – deposit ke CampaignEscrow
- `useCampaignBalance(campaignId)` – baca balance campaign di escrow

### 5.4 Hedera HTS – Associate USDC

USDC di Hedera = HTS token. Sebelum terima atau kirim USDC, wallet harus **associate** dengan token.

- **Partner**: Associate sebelum deposit
- **Participant**: Associate sebelum bisa terima reward

Opsi implementasi:
- Hedera SDK: `TokenAssociateTransaction` dengan token ID `0.0.5449`
- HashPack/Blade: cek apakah ada built-in associate
- Tombol "Associate USDC" yang memanggil SDK di frontend

---

## 6. Halaman & Komponen

### 6.1 Partner Dashboard (prioritas tinggi)

**Route**: `/partner` atau `/admin/campaigns`

| Fitur | Deskripsi |
|-------|-----------|
| Create campaign form | Form untuk title, template_type, description, thumbnail, period, template_params, pool_amount, max_participants |
| Campaign list | Daftar campaign partner (filter `partner=wallet`) |
| Deposit flow | 1) Associate USDC, 2) Approve USDC, 3) `CampaignEscrow.deposit(campaignIdBytes32, amount)` |
| Activate | Tombol activate + input `escrow_tx_hash` setelah deposit confirmed |
| Stats | Joins, completions, remaining slots |

### 6.2 Campaign Discovery (user)

**Lokasi**: Section di `/quests` atau halaman `/campaigns`

| Fitur | Deskripsi |
|-------|-----------|
| Section "Partner Campaigns" | Card campaign dengan status `active` |
| Campaign card | Title, thumbnail, description (preview), reward (USDC + MEDQ), CTA "Join" |
| Join flow | Tombol Join → `POST /campaigns/:id/join` dengan `participant` = connected wallet |
| Associate USDC | Tombol/flow associate sebelum join (opsional tapi disarankan) |

### 6.3 Quest Detail (modifikasi)

Untuk quest yang punya `campaign_id`:
- Tampilkan badge "Campaign"
- Tampilkan reward USDC + MEDQ
- Flow complete sama seperti quest biasa (auto-verify atau submit proof)

---

## 7. Flow Lengkap

### Partner
1. Connect wallet
2. Associate USDC (jika belum)
3. Create campaign (API)
4. Approve USDC ke CampaignEscrow
5. Deposit: `CampaignEscrow.deposit(campaignIdBytes32, pool_amount)`
6. Activate campaign (API + escrow_tx_hash)

### User
1. Lihat campaign di discovery
2. (Opsional) Associate USDC
3. Join campaign (API) → dapat quest
4. Complete quest seperti biasa
5. Backend otomatis release USDC ke wallet user

---

## 8. Types (saran)

```ts
// src/lib/types.ts atau campaign-specific

interface Campaign {
  id: string
  partner_wallet: string
  title: string
  status: "draft" | "pending" | "active" | "completed" | "cancelled"
  template_type: "swap" | "deposit" | "borrow" | "stake"
  template_params: Record<string, unknown>
  pool_amount: string | number
  max_participants: number
  reward_per_quest_usdc: string | number
  participant_count: number
  claimed_count: number
  thumbnail?: string | null
  description?: string | null
  start_at?: string | null
  end_at?: string | null
  created_at: string
  updated_at: string
}
```

---

## 9. Urutan Implementasi (saran)

1. **API client** – tambah methods campaign
2. **Campaign discovery + join** – user bisa lihat dan join campaign
3. **Quest detail** – tampilkan badge campaign + reward USDC
4. **Partner dashboard** – create, deposit, activate
5. **Associate USDC flow** – untuk partner dan participant

---

## 10. Referensi

- Spec lengkap: `docs/QUEST_MARKETPLACE_SPEC.md`
- HTS association: Section 10 di spec
- Backend routes: `backend/src/routes/campaigns.ts`
- Contract: `contracts/src/CampaignEscrow.sol`
