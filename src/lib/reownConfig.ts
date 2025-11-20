import { createAppKit } from '@reown/appkit/react'
import { WagmiAdapter } from '@reown/appkit-adapter-wagmi'
import { mainnet, arbitrum, polygon, optimism, base, sepolia } from '@reown/appkit/networks'

// Hedera Testnet Network Configuration
const hederaTestnet = {
  id: 296,
  name: 'Hedera Testnet',
  nativeCurrency: {
    decimals: 18,
    name: 'HBAR',
    symbol: 'HBAR',
  },
  rpcUrls: {
    default: {
      http: ['https://testnet.hashio.io/api'],
    },
    public: {
      http: ['https://testnet.hashio.io/api'],
    },
  },
  blockExplorers: {
    default: {
      name: 'HashScan Testnet',
      url: 'https://hashscan.io/testnet',
    },
  },
  testnet: true,
} as const

// WagmiAdapter configuration
export const wagmiAdapter = new WagmiAdapter({
  ssr: true,
  networks: [hederaTestnet, sepolia, mainnet, arbitrum, polygon, optimism, base],
  projectId: process.env.NEXT_PUBLIC_REOWN_PROJECT_ID || 'YOUR_PROJECT_ID', // Get from https://cloud.reown.com
})

// Get base URL for metadata (avoid SSR hydration issues)
const getMetadataUrl = () => {
  if (typeof window !== 'undefined') {
    return window.location.origin
  }
  // Fallback for SSR
  return process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
}

export const metadata = {
  name: 'Medq Quest',
  description: 'Decentralized Quest Platform on Hedera',
  url: getMetadataUrl(),
  icons: ['/favicon.ico'],
}

// Create AppKit
export const appKit = createAppKit({
  adapters: [wagmiAdapter],
  networks: [hederaTestnet, sepolia, mainnet, arbitrum, polygon, optimism, base],
  projectId: process.env.NEXT_PUBLIC_REOWN_PROJECT_ID || 'YOUR_PROJECT_ID',
  defaultNetwork: hederaTestnet,
  metadata,
  features: {
    analytics: false, // Disabled - often blocked by ad blockers, causes console errors
  },
  // themeMode: 'auto', // Removed - may cause type issues, default is fine
  themeVariables: {
    '--w3m-accent': '#6366f1', // Primary color
    '--w3m-border-radius-master': '8px',
  },
})

// Export Wagmi config for direct access
export const wagmiConfig = wagmiAdapter.wagmiConfig

