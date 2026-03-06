# Panduan Migrasi ke Turborepo

Dokumen ini menjelaskan cara migrasi proyek Medq dari struktur flat ke monorepo Turborepo, termasuk perubahan struktur folder dan penanganan environment variables.

---

## Struktur Saat Ini vs Target

### Saat Ini

```
medq/
├── .env                    # Frontend (NEXT_PUBLIC_*)
├── package.json            # Frontend deps
├── src/                    # Frontend v1 (Next.js)
├── public/
├── backend/
│   ├── .env                # Backend
│   ├── package.json
│   └── src/
├── contracts/
│   ├── .env                # Contracts (Foundry deploy)
│   └── ...
└── medq-v2/                # Frontend v2 (Next.js)
```

### Target (Monorepo)

```
medq/
├── apps/
│   ├── web/                # Frontend v2 (medq-v2)
│   │   ├── .env.local
│   │   └── src/
│   ├── web-v1/             # Frontend v1
│   │   ├── .env.local
│   │   └── src/
│   └── api/                # Backend
│       ├── .env
│       └── src/
├── packages/
│   ├── shared/
│   └── wallet/
├── contracts/              # Tetap di root
│   └── .env
├── package.json
├── pnpm-workspace.yaml
└── turbo.json
```

---

## Environment Variables

### Saat Ini

| Lokasi | File | Variabel |
|--------|------|----------|
| Root | .env | NEXT_PUBLIC_API_URL, NEXT_PUBLIC_QUEST_MANAGER_ADDRESS, NEXT_PUBLIC_REOWN_PROJECT_ID, NEXT_PUBLIC_MEDQ_TOKEN_ADDRESS, NEXT_PUBLIC_BADGE_NFT_ADDRESS, NEXT_PUBLIC_CAMPAIGN_ESCROW_ADDRESS, NEXT_PUBLIC_USDC_ADDRESS |
| backend/ | .env | RPC_URL, QUEST_MANAGER_ADDRESS, REWARD_VAULT_ADDRESS, COMPLETION_ORACLE, AGENT_CONTROLLER_PRIVATE_KEY, COMPLETION_ORACLE_PRIVATE_KEY, GROQ_API_KEY, PINATA_JWT, MIRROR_NODE_URL, SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, PORT |
| contracts/ | .env | HEDERA_RPC_URL, PRIVATE_KEY, COMPLETION_ORACLE, IDENTITY_REGISTRY_ADDRESS, AGENT_CONTROLLER_ADDRESS, AGENT_METADATA_URI, CAMPAIGN_REWARD_TOKEN |

### Setelah Migrasi

| App | File | Variabel |
|-----|------|----------|
| apps/web | .env.local | Copy dari root .env (NEXT_PUBLIC_*) |
| apps/web-v1 | .env.local | Copy dari root .env (NEXT_PUBLIC_*) |
| apps/api | .env | Copy dari backend/.env |
| contracts/ | .env | Tidak berubah |

---

## Langkah Migrasi

### Phase 1: Persiapan

```bash
git checkout -b migration/turborepo
git add -A && git commit -m "chore: pre-migration snapshot"
npm install -g pnpm
pnpm add -D turbo -w
```

### Phase 2: Setup Workspace

Buat `pnpm-workspace.yaml`:

```yaml
packages:
  - "apps/*"
  - "packages/*"
```

Update root `package.json`:

```json
{
  "name": "medq",
  "private": true,
  "packageManager": "pnpm@9.0.0",
  "scripts": {
    "dev": "turbo run dev",
    "dev:v1": "pnpm --filter web-v1 dev",
    "dev:v2": "pnpm --filter web dev",
    "dev:api": "pnpm --filter api dev",
    "build": "turbo run build"
  },
  "devDependencies": {
    "turbo": "^2.3.0"
  }
}
```

Buat `turbo.json`:

```json
{
  "$schema": "https://turbo.build/schema.json",
  "tasks": {
    "build": {
      "dependsOn": ["^build"],
      "outputs": [".next/**", "dist/**"]
    },
    "dev": {
      "cache": false,
      "persistent": true
    }
  }
}
```

### Phase 3: Pindah ke apps/

```bash
mkdir -p apps
mv backend apps/api
# Pindah src, public, next.config, tsconfig, dll ke apps/web-v1
mv medq-v2 apps/web
```

Update package.json di setiap app: `apps/api` → name "api", `apps/web-v1` → name "web-v1", `apps/web` → name "web"

### Phase 4: Environment Variables

- Copy root .env ke `apps/web/.env.local` dan `apps/web-v1/.env.local`
- Copy backend/.env ke `apps/api/.env` (atau sudah ikut pindah)
- contracts/.env tetap

### Phase 5: Port

- apps/web-v1: port 3000
- apps/web: port 3001 (tambah di package.json: `"dev": "next dev -p 3001"`)
- apps/api: port 4000

### Phase 6: Test

```bash
pnpm install
pnpm dev:api
pnpm dev:v1
pnpm dev:v2
pnpm build
```

---

## Checklist

- [ ] pnpm-workspace.yaml
- [ ] turbo.json
- [ ] backend → apps/api
- [ ] src → apps/web-v1
- [ ] medq-v2 → apps/web
- [ ] Env di-copy ke tiap app
- [ ] Port dibedakan
- [ ] pnpm install & run sukses

---

---

## Template Env per App

### apps/web/.env.local & apps/web-v1/.env.local

Copy dari root `.env`:

```
NEXT_PUBLIC_API_URL=http://localhost:4000/
NEXT_PUBLIC_QUEST_MANAGER_ADDRESS=0x...
NEXT_PUBLIC_REOWN_PROJECT_ID=...
NEXT_PUBLIC_MEDQ_TOKEN_ADDRESS=0x...
NEXT_PUBLIC_BADGE_NFT_ADDRESS=0x...
NEXT_PUBLIC_CAMPAIGN_ESCROW_ADDRESS=0x...
NEXT_PUBLIC_USDC_ADDRESS=0x...
```

### apps/api/.env

Copy dari `backend/.env` (RPC, contract addresses, oracle keys, Groq, Pinata, Supabase, Mirror Node, PORT).

### contracts/.env

Tetap; tidak perlu diubah.

---

## Catatan Penting

1. **Backend dotenv**: Saat run `pnpm --filter api dev` dari root, `process.cwd()` bisa mengarah ke root. Pastikan backend load `.env` dari `apps/api/` (path relatif ke file entry point).

2. **Root .env**: Bisa dihapus setelah migration. Semua variabel frontend pindah ke `apps/web/` dan `apps/web-v1/`.

3. **Gitignore**: Pastikan `.env`, `.env.local`, `.env*.local` ada di `.gitignore`. Jangan commit secrets.

4. **medq-v2 (apps/web)**: Saat ini pakai RainbowKit. Setelah migrasi, rencanakan ganti ke Reown supaya konsisten dengan v1.

---

## Referensi

- https://turbo.build/repo/docs
- https://pnpm.io/workspaces
