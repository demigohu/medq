"use client";

import * as React from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { WagmiProvider } from "wagmi";
import { RainbowKitProvider, getDefaultConfig } from "@rainbow-me/rainbowkit";
import { defineChain } from "viem";
import "@rainbow-me/rainbowkit/styles.css";

// Mantle Sepolia testnet
const hederaTestnet = defineChain({
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
    },
    blockExplorers: {
        default: {
            name: "Hedera Testnet Explorer",
            url: "https://hashscan.io/testnet",
        },
    },
    testnet: true,
});

const config = getDefaultConfig({
    appName: "Medq",
    projectId: process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || "YOUR_PROJECT_ID",
    chains: [hederaTestnet], // Only Mantle Sepolia
    ssr: true,
});

const queryClient = new QueryClient();

export function Providers({ children }: { children: React.ReactNode }) {
    return (
        <WagmiProvider config={config}>
            <QueryClientProvider client={queryClient}>
                <RainbowKitProvider>{children}</RainbowKitProvider>
            </QueryClientProvider>
        </WagmiProvider>
    );
}

