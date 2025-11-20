/**
 * Utility functions to add tokens and NFTs to wallet
 * Supports MetaMask and other EIP-1193 compatible wallets
 */

import { MEDQ_TOKEN_METADATA, BADGE_NFT_METADATA } from "./contracts"

/**
 * Check if wallet supports watchAsset (EIP-1193)
 */
function hasWatchAsset(window: Window & typeof globalThis): boolean {
  return (
    typeof window !== "undefined" &&
    typeof window.ethereum !== "undefined" &&
    typeof window.ethereum.request !== "undefined"
  )
}

/**
 * Add ERC-20 token to wallet (MetaMask, etc.)
 */
export async function addTokenToWallet(): Promise<{ success: boolean; message: string }> {
  if (typeof window === "undefined" || !hasWatchAsset(window)) {
    return {
      success: false,
      message: "Wallet not found. Please install MetaMask or another compatible wallet.",
    }
  }

  if (!MEDQ_TOKEN_METADATA.address || MEDQ_TOKEN_METADATA.address === "0x0000000000000000000000000000000000000000") {
    return {
      success: false,
      message: "MEDQ token address not configured. Please contact support.",
    }
  }

  try {
    const wasAdded = await window.ethereum.request({
      method: "wallet_watchAsset",
      params: {
        type: "ERC20",
        options: {
          address: MEDQ_TOKEN_METADATA.address,
          symbol: MEDQ_TOKEN_METADATA.symbol,
          decimals: MEDQ_TOKEN_METADATA.decimals,
          image: MEDQ_TOKEN_METADATA.image,
        },
      },
    })

    if (wasAdded) {
      return {
        success: true,
        message: `Successfully added ${MEDQ_TOKEN_METADATA.symbol} token to your wallet!`,
      }
    } else {
      return {
        success: false,
        message: "Token was not added. Please try again.",
      }
    }
  } catch (error: any) {
    console.error("Error adding token to wallet:", error)
    return {
      success: false,
      message: error?.message || "Failed to add token to wallet. Please try again.",
    }
  }
}

/**
 * Copy NFT collection address to clipboard for manual import
 * Note: Most wallets require manual import of NFT collections, especially on Hedera
 * This function copies the contract address so users can manually import it in their wallet
 */
export async function addNFTToWallet(): Promise<{ success: boolean; message: string }> {
  if (!BADGE_NFT_METADATA.address || BADGE_NFT_METADATA.address === "0x0000000000000000000000000000000000000000") {
    return {
      success: false,
      message: "Badge NFT address not configured. Please contact support.",
    }
  }

  try {
    // Copy contract address to clipboard
    if (navigator.clipboard && navigator.clipboard.writeText) {
      await navigator.clipboard.writeText(BADGE_NFT_METADATA.address)
      return {
        success: true,
        message: `Badge NFT contract address copied to clipboard! Paste it in your wallet to import the collection. Address: ${BADGE_NFT_METADATA.address.slice(0, 6)}...${BADGE_NFT_METADATA.address.slice(-4)}`,
      }
    } else {
      // Fallback for browsers without clipboard API
      const textArea = document.createElement("textarea")
      textArea.value = BADGE_NFT_METADATA.address
      textArea.style.position = "fixed"
      textArea.style.opacity = "0"
      document.body.appendChild(textArea)
      textArea.select()
      
      try {
        document.execCommand("copy")
        document.body.removeChild(textArea)
        return {
          success: true,
          message: `Badge NFT contract address copied to clipboard! Paste it in your wallet to import the collection. Address: ${BADGE_NFT_METADATA.address.slice(0, 6)}...${BADGE_NFT_METADATA.address.slice(-4)}`,
        }
      } catch (err) {
        document.body.removeChild(textArea)
        return {
          success: false,
          message: `Failed to copy address. Please manually copy: ${BADGE_NFT_METADATA.address}`,
        }
      }
    }
  } catch (error: any) {
    console.error("Error copying NFT address:", error)
    return {
      success: false,
      message: error?.message || `Failed to copy address. Please manually copy: ${BADGE_NFT_METADATA.address}`,
    }
  }
}

/**
 * Declare window.ethereum type for TypeScript
 */
declare global {
  interface Window {
    ethereum?: {
      request: (args: { method: string; params?: any }) => Promise<any>
      isMetaMask?: boolean
      [key: string]: any
    }
  }
}

