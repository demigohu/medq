# Medq Quest — Rencana Improvement Legacy Builder (Apex 2026)

Dokumen ini fokus pada **Delta Score** untuk track Legacy Builders:
- **Peningkatan scope produk & UX (25%)**
- **Robustness teknis (15%)**
- **Traction / validasi (15%)**
- **Pendalaman integrasi Hedera (15%)**

---

## 1) Delta Product Scope & UX (25%)

### A. Quest Templates per Protokol
**Tujuan:** langkah quest lebih konsisten + bukti lebih jelas.
- **Tambahkan:** template quest untuk SaucerSwap/Bonzo + hint evidence
- **Lokasi:** `backend/src/lib/protocols.ts` + prompt metadata AI
- **Dampak:** user lebih cepat paham, tingkat completion naik

---

### B. Progress Tracker UI (Timeline)
**Tujuan:** progres quest jelas untuk user & juri.
- **Tambahkan:** “Accepted → Proof Submitted → Verified → Rewarded”
- **Lokasi:** `src/app/(with-sidebar)/quests/[id]/page.tsx`
- **Data:** `progress` + status submission dari backend

---

### C. Quest Marketplace (Partner Publishing)
**Tujuan:** partner/protocol bisa publish quest + alokasi budget.
- **Tambahkan:** dashboard partner + flow create quest
- **Data:** budget quest disimpan di Supabase
- **Catatan penting:** **disarankan bikin kontrak baru untuk partnership.**  
  - Kontrak “QuestMarketplace” menahan budget on‑chain (escrow).  
  - Partner deposit MEDQ → backend hanya menginisiasi createQuest.  
  - Transparansi & trust meningkat, cocok untuk narrative Legacy Builder.

---

### D. User Profiles v2
**Tujuan:** progression lebih terlihat.
- **Tambahkan:** badge showcase, XP history, streak daily/weekly
- **Sumber:** `/quests/users/:address/rewards` + table XP

---

### E. Onboarding Flow
**Tujuan:** mengurangi drop‑off user baru.
- **Tambahkan:** guided walkthrough + sample quest pertama
- **Dampak:** retensi awal lebih tinggi

---

## 2) Delta Technical Robustness (15%)

### A. Proof Verification v2
**Tujuan:** tx hash benar-benar cocok dengan quest.
- Validasi: status tx + **to address** + **event logs** (swap/mint/borrow)
- Decode log dengan ABI protocol
- Fallback ke transfer jika ABI tidak cocok

**Lokasi:** `backend/src/services/mirrorNodeService.ts`

---

### B. Anti‑Replay (Cross‑quest)
**Tujuan:** mencegah reuse hash untuk quest lain.
- Cek hash global (bukan hanya per quest)
- Reject tx hash yang sudah pernah dipakai

**Lokasi:** `backend/src/services/dbService.ts`

---

### C. Rate Limiting + Retry/Backoff
**Tujuan:** kurangi false negative dari Mirror Node.
- Retry 3–5x
- Exponential backoff

---

### D. Observability
**Tujuan:** visibility performa verifikasi.
- Log success/failure rate + latency
- Dashboard sederhana (Supabase + Grafana)

---

### E. Auto‑Verify via Mirror Node Polling
**Tujuan:** verifikasi otomatis tanpa input tx hash dari user.
- Cron/poller scan tx wallet participant → protocol address
- Filter by window waktu quest (accept_time → expiry)
- Jika match action → auto `recordCompletion`

**Catatan MVP:** cukup polling tiap 3–5 menit, lalu cache last_tx per wallet untuk efisiensi.

---

## 3) Delta Traction & Validation (15%)

### A. Program Tester Awal
**Tujuan:** 5–10 tester menyelesaikan quest real.
- Track completion rate + friction points
- Kutipan feedback untuk pitch deck

---

### B. Feedback In‑App
**Tujuan:** tangkap sentiment user.
- Rating 1–5 + komentar singkat
- Simpan di Supabase `quest_feedback`
- Export untuk juri

---

### C. Mini Survey
**Tujuan:** menemukan bottleneck UX.
- Pertanyaan: wallet connect, submit proof, kejelasan steps
- Ringkas di 1 slide pitch deck

---

## 4) Delta Hedera Integration Depth (15%)

### A. Pendalaman Agent Kit (Multi‑Agent)
**Tujuan:** memperlihatkan kekuatan Agent Kit.
- Protocol Agent → generate quest
- Validator Agent → verifikasi evidence
- Oracle Agent → trigger completion

---

### B. Scheduled Tx (Opsional)
**Tujuan:** tambahan Hedera service.
- Payout otomatis via scheduled tx
- Hanya jika scope memungkinkan

---

### C. Mirror Node Indexing Improvements
**Tujuan:** verifikasi lebih cepat.
- Cache query
- Event-based validation
- Batch lookups

---

## 5) Execution Polish (20%)

### A. Pre‑seeded Demo Environment
**Tujuan:** demo stabil.
- Seed 3 quest sebelum demo
- Siapkan 1 tx hash “fast proof”

---

### B. Video Demo (E2E)
**Tujuan:** tunjukkan flow lengkap + bukti on-chain.
- Wallet connect → quest → proof → reward
- HashScan link ditampilkan

---

### C. CI / Tests
**Tujuan:** bukti robustness.
- Unit test (quest service, mirror node)
- Integration test (submit‑proof)

---

### D. Logs + Dashboard
**Tujuan:** reliability terlihat jelas.
- Proof verification success rate
- Cron health + last run time

---

# MVP Plan (Sprint 2 Minggu)

## Minggu 1 (Core Product & Trust)
- Progress Timeline UI
- Proof Verification v2 (log decoding)
- Anti‑Replay
- Retry/Backoff Mirror Node

## Minggu 2 (Validation & Polish)
- Feedback widget
- Badge gallery / rewards page
- Pre‑seeded demo data
- Update demo & pitch deck

---

# Strategi Manajemen Quest (Daily / Weekly / Custom)

## 1) Lifecycle Status (standar)
- `draft` → `active` → `accepted` → `proof_submitted` → `verified` → `completed` → `expired/cancelled`

## 2) Batas per user
- **Daily:** maksimal 1 quest aktif  
- **Weekly:** maksimal 1 quest aktif  
- **Custom:** sesuai partner / campaign

## 3) Idempotency
- Generate quest hanya jika tidak ada quest aktif yang sejenis  
- Quest expired otomatis ditandai `expired` dan tidak dipakai lagi

## 4) Rules reward & difficulty
- **Daily:** easy, reward kecil  
- **Weekly:** medium/hard, reward lebih besar  
- **Custom:** fleksibel (by partner budget)

## 5) Auto‑Verify (Mirror Node Polling)
- Polling tx participant → protocol  
- Filter by window waktu quest (accepted_at → expiry)  
- Jika cocok → auto `recordCompletion`

---

# Flow Partnership (Quest Marketplace)

## 1) Deposit Budget oleh Partner
- Partner deposit MEDQ ke kontrak **QuestMarketplace** (escrow on‑chain).
- Backend mencatat campaign + metadata (title, protocol, reward, expiry).

## 2) Partner Membuat Campaign Quest
- Partner memilih protocol, reward per quest, target user, durasi.
- Quest yang dibuat **kategori Custom** (bukan daily/weekly).

## 3) Distribusi Quest ke User (pilih salah satu)

### A. Random + Quota
- Backend pilih user secara random dari pool user aktif.
- Batasi: 1 quest per user per campaign.

### B. Targeted
- Berdasarkan syarat tertentu (XP level, kategori favorit, aktivitas on‑chain).

### C. Opt‑in
- Quest muncul di tab “Partner Quests”, user pilih sendiri.

---

# Ringkasan Singkat
- **Daily/Weekly** = auto‑generated internal system.
- **Partner Quest** = custom campaign dari partner.
- Semua quest tetap dideploy ke **QuestManager** on‑chain.
- Budget partner aman di escrow kontrak marketplace.


---

# Deliverables untuk Legacy Track

✅ **Delta Features**
- Progress timeline
- Proof verification v2
- Feedback system
- Multi‑agent narrative (minimal)

✅ **Evidence**
- 3–5 feedback user
- Screenshot tx verified di Mirror Node
- Before/after demo video

✅ **Narasi untuk Juri**
> “Ascension MVP membuktikan flow. Apex upgrade membuatnya lebih reliable, lebih mudah dipakai, lebih scalable — dengan proof yang valid, progress jelas, marketplace growth, dan feedback nyata.”

---

## ✅ Checklist Implementasi (Markdown)

### Product Scope & UX
- [ ] Template quest per protokol (steps + evidence hints)
- [ ] Progress Tracker UI (timeline Accepted → Verified → Rewarded)
- [ ] Quest Marketplace UI (partner publish + budget config)
- [ ] Profile v2 (badge showcase, XP history, streak)
- [ ] Onboarding walkthrough + sample quest

### Technical Robustness
- [ ] Proof verification v2 (decode logs + protocol ABI)
- [ ] Anti‑replay tx hash global
- [ ] Mirror Node retry/backoff
- [ ] Rate limiting untuk submit‑proof
- [ ] Observability: success/fail rate + latency logs

### Traction & Validation
- [ ] Early-user test program (5–10 tester)
- [ ] In-app feedback widget (rating + komentar)
- [ ] Mini survey friction points
- [ ] Dokumentasi feedback (quote + angka)

### Hedera Integration Depth
- [ ] Multi‑agent flow (protocol agent → validator agent → oracle agent)
- [ ] Scheduled tx payout (optional)
- [ ] Mirror Node indexing improvements (cache + batch)

### Execution Polish
- [ ] Pre‑seeded demo data (3 quest aktif)
- [ ] Fast proof tx hash untuk demo
- [ ] Video demo E2E + HashScan links
- [ ] CI/tests (unit + integration)
- [ ] Update pitch deck & narrative Legacy

---

Kalau mau, saya bisa pecah lagi jadi checklist sprint mingguan atau issue tracker.
