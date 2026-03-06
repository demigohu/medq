"use client"

import { useAccount, useConnect, useDisconnect, useChainId, useSwitchChain } from 'wagmi'
import { useUserStore } from '@/lib/store'
import { useEffect } from 'react'
import { useRouter, usePathname } from 'next/navigation'

export function useReownWallet() {
  const { address, isConnected, chainId } = useAccount()
  const { connect, connectors, isPending: isConnecting } = useConnect()
  const { disconnect } = useDisconnect()
  const currentChainId = useChainId()
  const { switchChain } = useSwitchChain()
  const { syncUserStats, walletAddress, user } = useUserStore()
  const router = useRouter()
  const pathname = usePathname()

  // Sync user stats when wallet connects
  useEffect(() => {
    if (isConnected && address && address !== walletAddress) {
      syncUserStats(address)
    }
  }, [isConnected, address, walletAddress, syncUserStats])

  // Check profile completeness - redirect immediately after wallet connect if profile incomplete
  useEffect(() => {
    if (!isConnected || !address) {
      return
    }
    
    // Skip redirect if already on complete page or homepage
    if (pathname?.includes('/profile/complete') || pathname === '/') {
      return
    }

    // If user data is loaded and profile is incomplete, redirect to complete page
    if (user) {
      if (!user.profileComplete) {
        // Don't redirect if already on profile page (to avoid redirect loop)
        if (!pathname?.includes('/profile')) {
          router.push('/profile/complete')
        }
      }
    } else {
      // If user data not loaded yet, wait for syncUserStats to complete
      // This handles the case where wallet just connected
      const checkProfileAfterSync = setTimeout(() => {
        // Check again after sync should be complete
        const currentState = useUserStore.getState()
        const checkUser = currentState.user
        const currentPath = window.location.pathname
        
        // Only redirect if user still doesn't have complete profile
        if (checkUser && !checkUser.profileComplete) {
          // Don't redirect if already on profile/complete page
          if (!currentPath.includes('/profile/complete')) {
            router.push('/profile/complete')
          }
        }
      }, 1500) // Wait 1.5 seconds for sync to complete

      return () => clearTimeout(checkProfileAfterSync)
    }
  }, [isConnected, address, user, pathname, router])

  const isHederaNetwork = currentChainId === 296

  const switchToHedera = async () => {
    if (switchChain && currentChainId !== 296) {
      try {
        await switchChain({ chainId: 296 })
      } catch (error) {
        console.error('Failed to switch to Hedera Testnet:', error)
      }
    }
  }

  return {
    wallet: {
      address: address || null,
      isConnected,
      chainId: currentChainId,
    },
    connect: (connectorId?: string) => {
      const connector = connectorId 
        ? connectors.find((c) => c.id === connectorId)
        : connectors[0]
      if (connector) {
        connect({ connector })
      }
    },
    disconnect,
    connectors,
    isConnecting,
    isHederaNetwork,
    switchToHedera,
  }
}

