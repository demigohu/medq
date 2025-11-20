# Reown AppKit Setup Guide

## Overview

Reown AppKit (formerly WalletConnect) telah diintegrasikan untuk multi-wallet support, termasuk:
- ✅ HashPack (Hedera native wallet)
- ✅ MetaMask
- ✅ Blade (Hedera native wallet)
- ✅ Kabila (Hedera native wallet)
- ✅ WalletConnect mobile wallets

## Setup

### 1. Get Project ID

1. Kunjungi [Reown Cloud](https://cloud.reown.com)
2. Sign up / Login
3. Create a new project
4. Copy Project ID

### 2. Environment Variables

Tambahkan ke `.env.local`:

```bash
NEXT_PUBLIC_REOWN_PROJECT_ID=your_project_id_here
```

### 3. Configuration

File konfigurasi: `src/lib/reownConfig.ts`

- Default network: Hedera Testnet (chainId: 296)
- Supported networks: Hedera Testnet, Ethereum, Arbitrum, Polygon, Optimism, Base, Sepolia

### 4. Usage

#### Connect Button

Reown AppKit menyediakan built-in connect button:

```tsx
import { AppKitButton } from '@reown/appkit/react'

<AppKitButton 
  balance="hide"
  label="Connect Wallet"
/>
```

#### Use Hooks

```tsx
import { useReownWallet } from '@/hooks/useReownWallet'

const { wallet, connect, disconnect, isHederaNetwork, switchToHedera } = useReownWallet()
```

#### Smart Contract Interactions

```tsx
import { useWriteContract, useReadContract } from 'wagmi'

const { writeContract, isPending } = useWriteContract()
const { data, isLoading } = useReadContract({
  address: CONTRACT_ADDRESS,
  abi: CONTRACT_ABI,
  functionName: 'functionName',
})
```

## Features

### Multi-Wallet Support
- User dapat memilih wallet yang mereka inginkan
- Support desktop dan mobile wallets via WalletConnect
- Auto-detect installed wallets

### Network Switching
- Auto-prompt untuk switch ke Hedera Testnet jika di network lain
- Manual switch button tersedia

### State Management
- Wallet state di-manage oleh Reown AppKit
- Sync dengan Zustand store untuk user stats

## Troubleshooting

### Console Warnings/Errors

#### 1. ERR_BLOCKED_BY_CLIENT (Analytics)
**Error**: `POST https://pulse.walletconnect.org/batch... net::ERR_BLOCKED_BY_CLIENT`

**Penyebab**: Ad blocker atau browser extension memblokir analytics requests

**Solusi**: Analytics sudah di-disable di config (`features.analytics: false`). Error ini tidak mempengaruhi fungsionalitas wallet connection.

#### 2. Font Preload Warning
**Warning**: `The resource https://fonts.reown.com/KHTeka-Medium.woff2 was preloaded using link preload but not used within a few seconds`

**Penyebab**: Browser warning bahwa font di-preload tapi tidak segera digunakan

**Solusi**: Ini hanya warning browser, tidak mempengaruhi fungsionalitas. Bisa diabaikan.

#### 3. Coinbase Wallet Analytics Errors
**Error**: `POST https://cca-lite.coinbase.com/amp net::ERR_BLOCKED_BY_CLIENT`

**Penyebab**: Coinbase Wallet SDK mencoba mengirim analytics tapi diblokir

**Solusi**: Tidak mempengaruhi fungsionalitas. Ini dari Coinbase Wallet extension, bukan dari app kita.

## Reference

- [Reown AppKit Docs](https://docs.reown.com/appkit)
- [Hedera DApp with WalletConnect](https://docs.hedera.com/hedera/tutorials/more-tutorials/develop-a-hedera-dapp-integrated-with-walletconnect)
- [HashPack DApp Integration](https://docs.hashpack.app/dapp-developers/walletconnect)

