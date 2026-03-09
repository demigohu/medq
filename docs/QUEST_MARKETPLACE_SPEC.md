# Quest Marketplace (Partner Campaign) – Spesifikasi Fitur

## 1. Ringkasan

Quest Marketplace memungkinkan **partner** (protocol, brand) untuk membuat **campaign** dengan pool USDC. User yang complete quest dapat **USDC dari pool** + **MEDQ dari platform** (jumlah MEDQ ditentukan AI berdasarkan pool).

Quest dari campaign tampil sebagai **custom quest** di UI (bukan daily/weekly).

---

## 2. Aktor

| Aktor | Peran |
|-------|-------|
| **Partner** | Buat campaign, deposit USDC ke escrow, isi template params |
| **Participant** | User yang ikut campaign, complete quest, dapat reward |
| **Platform (MedQ)** | Operasikan marketplace, MEDQ dari RewardVault, kurasi |

---

## 3. Model Data

### 3.1 Campaign (DB)

```
campaigns
├── id
├── partner_id / partner_wallet
├── title
├── status (draft | pending | active | completed | cancelled)
├── template_type (swap | deposit | borrow | stake)
├── template_params (JSONB)
│   ├── amount
│   ├── token_in (HBAR, USDC, ...)
│   ├── token_out (SAUCE, ...)
│   ├── protocol_address
│   └── ...
├── pool_token (USDC)
├── pool_amount (1000)
├── max_participants (10)
├── reward_per_quest_usdc (100)  // pool_amount / max_participants
├── medq_per_quest (NULL - diisi AI saat generate)
├── escrow_address / escrow_tx_hash
├── start_at, end_at
├── created_at, updated_at
└── metadata_uri (IPFS, setelah quest pertama)
```

### 3.2 Template Params (per template type)

**Swap:**
- `amount`: number (e.g. 100)
- `token_in`: string (e.g. "HBAR")
- `token_out`: string (e.g. "SAUCE")
- `protocol_address`: string

**Deposit / Borrow / Stake:**
- `amount`, `token`, `protocol_address`
- (disesuaikan per aksi)

---

## 4. Flow

### 4.1 Partner Create Campaign

```
1. Partner login (wallet connect) di Partner Dashboard
2. Pilih "Create Campaign"
3. Isi form:
   - Title
   - Template type: swap | deposit | borrow | stake
   - Template params (amount, token_in, token_out, protocol)
   - Pool: 1000 USDC
   - Max participants: 10
4. Submit → Campaign saved (status: pending)
5. Deposit 1000 USDC ke CampaignEscrow
6. Setelah deposit confirmed → status: active
7. Campaign live, user bisa join
```

### 4.2 User Join Campaign & Generate Quest

```
1. User lihat campaign di discovery (custom quest section)
2. Klik "Join Campaign"
3. Backend:
   - Cek slot tersedia
   - Panggil AI dengan:
     - Campaign template params
     - Pool: 1000 USDC, 10 participants, 100 USDC/quest
     - Participant wallet
   - AI output: quest metadata + medqAmountPerQuest
   - createQuest() on-chain (reward = MEDQ dari AI)
   - Reserve slot di campaign (participant_count++)
   - Assign participant ke quest
4. User dapat quest di list, flow accept → complete sama seperti sekarang
```

### 4.3 Completion & Reward

```
1. User complete quest (auto-verify / submit-proof)
2. recordCompletion() → MEDQ dari RewardVault (seperti biasa)
3. Release 100 USDC dari CampaignEscrow ke user
4. Update campaign: claimed_count++
5. Jika claimed_count >= max_participants → campaign status: completed
```

---

## 5. AI Integration

### 5.1 Input ke AI (Campaign Context)

```
Campaign: {title}
Template: {template_type}
Params: swap {amount} {token_in} → {token_out} di {protocol}
Pool: {pool_amount} USDC
Max participants: {max_participants}
Reward per quest: {reward_per_quest_usdc} USDC (dari pool)
Participant: {participant_wallet}

Tugas AI: Generate quest metadata + tentukan medqAmountPerQuest yang wajar 
berdasarkan nilai pool dan engagement.
```

### 5.2 Output AI (Extended Schema)

Tambahkan ke `questOutputSchema`:

```ts
medqAmountPerQuest: z.number().int().min(0).optional()
```

AI mengembalikan jumlah MEDQ per quest berdasarkan:
- Total pool USDC
- Jumlah participants
- Difficulty/effort quest
- Engagement incentive

### 5.3 Fallback

Jika AI tidak return `medqAmountPerQuest` atau invalid:
- Gunakan formula default: `min(50, floor(poolAmountUsdc / maxParticipants / 2))`
- Atau nilai konstan (e.g. 25 MEDQ)

---

## 6. Smart Contract

### 6.1 RewardVault (Existing)

- Tetap untuk MEDQ
- `fundQuest` / `releaseReward` dipakai untuk MEDQ per quest

### 6.2 CampaignEscrow (Baru)

```
- Deposit USDC dari partner
- Platform fee: 0.5% (50 bps) deducted on deposit; goes to feeCollector
- Mapping: campaignId → balance
- getDepositAmountForPool(poolAmount) → total to deposit (includes fee)
- releaseReward(campaignId, participant, amount) → transfer USDC ke participant
- Hanya authorized (oracle/backend) yang bisa release
```

### 6.3 QuestManager (Existing)

- Tetap dipakai untuk createQuest
- `rewardPerParticipant` = MEDQ (dari AI)
- USDC payout handled terpisah di CampaignEscrow

---

## 7. Backend

### 7.1 Route Baru

| Method | Path | Purpose |
|--------|------|---------|
| POST | /campaigns | Create campaign (partner) |
| GET | /campaigns | List campaigns (filter: active) |
| GET | /campaigns/:id | Campaign detail |
| POST | /campaigns/:id/join | User join → generate quest, assign |
| POST | /campaigns/:id/deposit | Webhook / confirm deposit (atau poll) |

### 7.2 Service Baru

- `campaignService.ts`: CRUD campaign, join flow
- `campaignQuestGenerator.ts`: Generate quest dari campaign (panggil AI dengan context campaign)
- Integrasi `CampaignEscrow` untuk release USDC saat complete

---

## 8. Frontend

### 8.1 Partner Dashboard

- Create campaign form
- List campaign milik partner
- Deposit USDC (connect wallet, approve, transfer ke escrow)
- Analytics: joins, completions, remaining slots

### 8.2 User – Custom Quest Section

- Section "Partner Campaigns" / "Custom Quests"
- Card campaign dengan template params, reward (USDC + MEDQ)
- CTA "Join" → generate quest → redirect ke quest detail

---

## 9. Verification

- Quest dari campaign tetap memakai Proof Verification v2
- `verificationParams` di metadata: `minAmountTinybars`, `tokenIds`, `actionType`
- Di-generate dari template params (swap 100 HBAR → minAmountTinybars = 100 * 10^8)

---

## 10. Hedera HTS Token Association

USDC di Hedera adalah HTS token. Sebelum akun bisa **menerima** HTS token, akun harus **associate** dengan token tersebut.

### Contract (CampaignEscrow)
- Saat `setRewardToken()` dipanggil, contract otomatis memanggil HTS precompile `associateToken(contract, token)` sehingga contract bisa menerima deposit dari partner.
- Deploy script tidak perlu step tambahan; association terjadi di dalam `setRewardToken`.

### Participant (User yang claim reward)
- **Participant wajib associate USDC dengan wallet mereka** sebelum bisa menerima reward dari escrow.
- Jika belum associate, `releaseReward()` akan gagal (transfer HTS ke akun yang belum associate = error).
- Frontend harus menyediakan tombol/flow "Associate USDC" sebelum user join campaign atau sebelum claim. Bisa via:
  - Hedera SDK: `TokenAssociateTransaction` dengan wallet participant
  - Atau pakai HashPack / Blade yang punya built-in associate

### Partner (Depositor)
- Partner juga harus associate USDC sebelum `deposit()` ke escrow (untuk `transferFrom`).

---

## 11. Checklist Implementasi

- [x] DB: tabel `campaigns`, `campaign_participants`
- [x] Smart contract: CampaignEscrow (USDC + HTS auto-associate)
- [x] Backend: campaign CRUD, join flow, AI integration
- [x] Backend: generate quest dari campaign (campaignQuestGenerator)
- [x] Backend: hook on completion (USDC release stub – butuh contract)
- [ ] Frontend: Partner Dashboard
- [ ] Frontend: Custom quest / campaign discovery
- [x] AI: extend schema `medqAmountPerQuest`
- [x] AI: prompt untuk campaign context

---

## 12. Contoh End-to-End

**SaucerSwap campaign:**
- Pool: 1000 USDC, 10 slots
- Template: Swap 100 HBAR → SAUCE
- User A join → AI generate quest, assign, output 30 MEDQ
- User A complete → dapat 100 USDC + 30 MEDQ
- Sampai 10 user complete → campaign completed, pool habis
