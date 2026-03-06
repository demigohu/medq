"use client"

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { WagmiProvider } from 'wagmi'
import { wagmiConfig, appKit } from '@/lib/reownConfig'
import { ReactNode } from 'react'

const queryClient = new QueryClient()

export function ReownProvider({ children }: { children: ReactNode }) {
  // Always render providers - Wagmi handles SSR correctly with ssr: true
  // appKit is already created in reownConfig.ts
  
  return (
    <WagmiProvider config={wagmiConfig}>
      <QueryClientProvider client={queryClient}>
        {children}
      </QueryClientProvider>
    </WagmiProvider>
  )
}

