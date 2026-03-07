import { createAppKit } from "@reown/appkit/react"
import { WagmiAdapter } from "@reown/appkit-adapter-wagmi"

// Hedera Testnet only (same as previous RainbowKit config)
const hederaTestnet = {
  id: 296,
  name: "Hedera Testnet",
  nativeCurrency: {
    decimals: 18,
    name: "HBAR",
    symbol: "HBAR",
  },
  rpcUrls: {
    default: {
      http: ["https://testnet.hashio.io/api"],
    },
    public: {
      http: ["https://testnet.hashio.io/api"],
    },
  },
  blockExplorers: {
    default: {
      name: "HashScan Testnet",
      url: "https://hashscan.io/testnet",
    },
  },
  testnet: true,
} as const

// WagmiAdapter configuration - Hedera Testnet only
export const wagmiAdapter = new WagmiAdapter({
  ssr: true,
  networks: [hederaTestnet],
  projectId:
    process.env.NEXT_PUBLIC_REOWN_PROJECT_ID ||
    process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID ||
    "YOUR_PROJECT_ID",
})

// Get base URL for metadata (avoid SSR hydration issues)
const getMetadataUrl = () => {
  if (typeof window !== "undefined") return window.location.origin
  return process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3001"
}

export const metadata = {
  name: "Medq",
  description: "Complete quests, earn rewards, and grow your on-chain health reputation.",
  url: getMetadataUrl(),
  icons: ["/favicon.ico"],
}

// Create AppKit - Hedera Testnet only
export const appKit = createAppKit({
  adapters: [wagmiAdapter],
  networks: [hederaTestnet],
  projectId:
    process.env.NEXT_PUBLIC_REOWN_PROJECT_ID ||
    process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID ||
    "YOUR_PROJECT_ID",
  defaultNetwork: hederaTestnet,
  metadata,
  features: {
    analytics: false,
  },
  themeVariables: {
    "--w3m-accent": "#ffffff",
    "--w3m-border-radius-master": "8px",
  },
})

// Export Wagmi config for direct access
export const wagmiConfig = wagmiAdapter.wagmiConfig
