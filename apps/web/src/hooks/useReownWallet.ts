"use client"

import {
  useAccount,
  useConnect,
  useDisconnect,
  useChainId,
  useSwitchChain,
} from "wagmi"

export function useReownWallet() {
  const { address, isConnected, chainId } = useAccount()
  const { connect, connectors, isPending: isConnecting } = useConnect()
  const { disconnect } = useDisconnect()
  const currentChainId = useChainId()
  const { switchChain } = useSwitchChain()

  const isHederaNetwork = currentChainId === 296

  const switchToHedera = async () => {
    if (switchChain && currentChainId !== 296) {
      try {
        await switchChain({ chainId: 296 })
      } catch (error) {
        console.error("Failed to switch to Hedera Testnet:", error)
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
