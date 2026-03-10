# Contoh 4 Campaign Quest untuk Testing

Referensi data untuk membuat campaign di Studio. Isi form Create Quest sesuai contoh di bawah.

**Protocol addresses:**
- **SaucerSwap** (swap): `0x0000000000000000000000000000000000004b40`
- **Bonzo** (lend): `0x118dd8f2c0f2375496df1e069af1141fa034251b`

---

## 1. SaucerSwap – Swap USDC

| Field | Value |
|-------|-------|
| **Partner name** | SaucerSwap |
| **Title** | Swap USDC on SaucerSwap |
| **Description** | Complete a swap on SaucerSwap Finance to earn USDC rewards. Connect wallet, navigate to SaucerSwap, and swap at least 10 USDC to Karate. |
| **Start date** | (pilih tanggal mulai) |
| **End date** | (pilih tanggal akhir) |
| **Quest type** | Swap |
| **Protocol address** | `0x0000000000000000000000000000000000004b40` |
| **Token** | USDC |
| **Token amount per winner** | 5 |
| **Winners** | 10 |
| **Thumbnail URL** | `https://images.unsplash.com/photo-1639762681485-074b7f938ba0?w=800` (atau URL gambar lain) |

---

## 2. SaucerSwap – Swap HBAR

| Field | Value |
|-------|-------|
| **Partner name** | SaucerSwap |
| **Title** | Swap HBAR on SaucerSwap |
| **Description** | Swap HBAR for any token on SaucerSwap Finance. Perfect for beginners to explore DeFi on Hedera. |
| **Start date** | (pilih tanggal mulai) |
| **End date** | (pilih tanggal akhir) |
| **Quest type** | Swap |
| **Protocol address** | `0x0000000000000000000000000000000000004b40` |
| **Token** | HBAR |
| **Token amount per winner** | 10 |
| **Winners** | 20 |
| **Thumbnail URL** | `https://images.unsplash.com/photo-1518546305927-5a555bb7020d?w=800` |

---

## 3. Bonzo Finance – Deposit (Lending)

| Field | Value |
|-------|-------|
| **Partner name** | Bonzo Finance |
| **Title** | Supply USDC on Bonzo Finance |
| **Description** | Deposit USDC into Bonzo Finance lending protocol. Supply at least 5 USDC to earn rewards. |
| **Start date** | (pilih tanggal mulai) |
| **End date** | (pilih tanggal akhir) |
| **Quest type** | Deposit |
| **Protocol address** | `0x118dd8f2c0f2375496df1e069af1141fa034251b` |
| **Token** | USDC |
| **Token amount per winner** | 8 |
| **Winners** | 15 |
| **Thumbnail URL** | `https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=800` |

---

## 4. Bonzo Finance – Borrow

| Field | Value |
|-------|-------|
| **Partner name** | Bonzo Finance |
| **Title** | Borrow on Bonzo Finance |
| **Description** | Borrow assets from Bonzo Finance lending protocol. Complete a borrow transaction to earn USDC rewards. |
| **Start date** | (pilih tanggal mulai) |
| **End date** | (pilih tanggal akhir) |
| **Quest type** | Borrow |
| **Protocol address** | `0x118dd8f2c0f2375496df1e069af1141fa034251b` |
| **Token** | USDC |
| **Token amount per winner** | 6 |
| **Winners** | 12 |
| **Thumbnail URL** | `https://images.unsplash.com/photo-1559526324-4b87b5e36e44?w=800` |

---

## Langkah Buat Campaign

1. Buka **Dashboard → Studio → Create Quest**
2. Connect wallet
3. Step 1 (Quest Info): isi Partner name, Title, Description, dates, thumbnail
4. Step 2 (Rewards Info): pilih template type, masukkan protocol address, token, amount, winners
5. Submit → Campaign dibuat
6. Step 3: Deposit USDC ke escrow dan Activate campaign

Setelah di-activate, campaign akan muncul di **Partnership Quests** carousel di halaman Quests. User bisa Join dan quest akan di-generate per participant.
