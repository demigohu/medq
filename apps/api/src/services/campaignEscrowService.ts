import { keccak256, stringToHex, parseUnits } from "viem"

import {
  publicClient,
  oracleWalletClient,
  campaignEscrowAddress,
  campaignEscrowAbi,
} from "../lib/contracts"

/**
 * Convert campaign UUID to bytes32 for contract.
 */
export function campaignIdToBytes32(campaignId: string): `0x${string}` {
  return keccak256(stringToHex(campaignId))
}

/**
 * Release USDC reward from CampaignEscrow to participant.
 * USDC uses 6 decimals.
 */
export async function releaseCampaignReward(
  campaignId: string,
  recipient: string,
  amountUsdc: number | string
): Promise<string> {
  if (!campaignEscrowAddress) {
    throw new Error("CAMPAIGN_ESCROW_ADDRESS not configured")
  }

  const amount = parseUnits(String(amountUsdc), 6) // USDC 6 decimals
  const campaignIdBytes = campaignIdToBytes32(campaignId)

  const { request } = await publicClient.simulateContract({
    account: oracleWalletClient!.account!,
    address: campaignEscrowAddress,
    abi: campaignEscrowAbi,
    functionName: "releaseReward",
    args: [campaignIdBytes, recipient as `0x${string}`, amount],
  })

  const hash = await oracleWalletClient!.writeContract(request)
  const receipt = await publicClient.waitForTransactionReceipt({ hash })
  return receipt.transactionHash
}
