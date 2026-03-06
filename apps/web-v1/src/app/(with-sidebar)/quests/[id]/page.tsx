"use client"

import { useParams, useRouter } from "next/navigation"
import { RewardCard } from "@/components/reward-card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { useUserStore } from "@/lib/store"
import { useQuest, useQuestProgress, useSubmitProof } from "@/hooks/useQuests"
import { useQuestContract } from "@/hooks/useQuestContract"
import { useReownWallet } from "@/hooks/useReownWallet"
import { fetchIPFSMetadata, ipfsToHttp, type QuestMetadata } from "@/lib/ipfs"
import { getProtocolByAddress } from "@/lib/protocols"
import { ArrowLeft, Users, Calendar, Zap, BookOpen, CheckCircle2, AlertCircle, Wallet, Loader2 } from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { formatUnits } from "viem"

export default function QuestDetailPage() {
  const params = useParams()
  const router = useRouter()
  const questId = parseInt(params.id as string)
  const { wallet, connect, isHederaNetwork } = useReownWallet()
  const isConnected = wallet.isConnected
  const { walletAddress, syncUserStats } = useUserStore()
  const { quest, loading: questLoading, error: questError, refetch: refetchQuest } = useQuest(questId)
  const { progress, loading: progressLoading, refetch: refetchProgress } = useQuestProgress(
    questId,
    wallet.address || null
  )
  const { acceptQuest, loading: acceptLoading } = useQuestContract()
  const { submitProof, loading: submitLoading } = useSubmitProof()

  const [txHash, setTxHash] = useState("")
  const [metadata, setMetadata] = useState<QuestMetadata | null>(null)
  const [metadataLoading, setMetadataLoading] = useState(false)
  const [metadataError, setMetadataError] = useState<string | null>(null)
  const [hasAccepted, setHasAccepted] = useState(false)
  const [verificationResult, setVerificationResult] = useState<{
    success: boolean
    message: string
  } | null>(null)

  // Sync user stats when wallet connects
  useEffect(() => {
    if (wallet.address && wallet.address !== walletAddress) {
      syncUserStats(wallet.address)
    }
  }, [wallet.address, walletAddress, syncUserStats])

  useEffect(() => {
    const loadMetadata = async () => {
      if (!quest?.metadataURI || !quest.metadataURI.startsWith("ipfs://")) {
        setMetadata(null)
        return
      }

      setMetadataLoading(true)
      setMetadataError(null)
      try {
        const metadataData = await fetchIPFSMetadata(quest.metadataURI)
        setMetadata(metadataData)
      } catch (err: any) {
        console.error("Failed to fetch metadata:", err)
        setMetadataError(err.message || "Failed to load metadata")
      } finally {
        setMetadataLoading(false)
      }
    }

    loadMetadata()
  }, [quest?.metadataURI])

  if (questLoading) {
    return (
      <main className="bg-background text-foreground min-h-screen">
        <div className="flex items-center justify-center h-screen">
          <Loader2 className="w-8 h-8 animate-spin" />
        </div>
      </main>
    )
  }

  if (questError || !quest) {
    return (
      <main className="bg-background text-foreground min-h-screen">
        <div className="flex items-center justify-center h-screen">
          <div className="text-center">
            <h2 className="text-2xl font-bold mb-4">Quest not found</h2>
            <p className="text-muted-foreground mb-4">{questError}</p>
            <Link href="/quests">
              <Button variant="outline">Back to Quests</Button>
            </Link>
          </div>
        </div>
      </main>
    )
  }

  const handleConnectWallet = async () => {
    try {
      await connect()
    } catch (error: any) {
      setVerificationResult({
        success: false,
        message: error?.message || "Failed to open wallet connection",
      })
    }
  }

  const handleAcceptQuest = async () => {
    if (!wallet.isConnected || !wallet.address) {
      setVerificationResult({
        success: false,
        message: "Please connect your wallet first",
      })
      return
    }

    if (!isHederaNetwork) {
      setVerificationResult({
        success: false,
        message: "Please switch to Hedera Testnet",
      })
      return
    }

    try {
      setVerificationResult(null)
      const result = await acceptQuest(questId)
      if (result.success) {
        setHasAccepted(true)
        setVerificationResult({
          success: true,
          message: `Quest accepted! Transaction: ${result.transactionHash}`,
        })
        // Refetch progress after accepting (retry a few times to wait for finality)
        setTimeout(() => {
          refetchProgress()
        }, 2000)
        setTimeout(() => {
          refetchProgress()
        }, 4000)
        setTimeout(() => {
          refetchProgress()
        }, 6000)
      }
    } catch (err: any) {
      setVerificationResult({
        success: false,
        message: err.message || "Failed to accept quest",
      })
    }
  }

  const handleSubmitProof = async () => {
    if (!txHash.trim()) {
      setVerificationResult({
        success: false,
        message: "Please enter a transaction hash",
      })
      return
    }

    if (!wallet.isConnected || !wallet.address) {
      setVerificationResult({
        success: false,
        message: "Please connect your wallet first",
      })
      return
    }

    try {
      setVerificationResult(null)
      const result = await submitProof(questId, txHash, wallet.address)
      setVerificationResult({
        success: true,
        message: `Proof submitted successfully! Quest completion will be processed.`,
      })
      setTxHash("")
      // Refetch quest and progress after submission
      setTimeout(() => {
        refetchQuest()
        refetchProgress()
        syncUserStats(wallet.address!)
      }, 3000)
    } catch (err: any) {
      setVerificationResult({
        success: false,
        message: err.message || "Failed to submit proof",
      })
    }
  }

  const isAccepted = progress?.accepted ?? false
  const isCompleted = progress?.completed ?? false
  const showSubmitForm = (isAccepted || hasAccepted) && !isCompleted
  const rewardAmount = quest.rewardPerParticipant ? formatUnits(BigInt(quest.rewardPerParticipant), 18) : "0"
  const badgeLevel = Number(quest.badgeLevel ?? "1")
  const xpRewardValue = Math.max(50, badgeLevel * 50)
  const questTitle = metadata?.title || quest.title || `Quest #${quest.id}`
  // Get protocol logo as fallback for banner
  const protocol = quest.protocol ? getProtocolByAddress(quest.protocol) : null
  const bannerUri = metadata?.banner || quest.banner || protocol?.logo || "/placeholder.svg?height=256&width=512&query=quest banner"
  // Convert IPFS URI to HTTP URL if needed
  const questBanner = bannerUri.startsWith("ipfs://") ? ipfsToHttp(bannerUri) : bannerUri
  const questCategory = metadata?.category || quest.category
  const questDifficulty = metadata?.difficulty || quest.difficulty || "Medium"

  return (
    <main className="bg-background text-foreground">
      {/* Header */}
      <section className="border-b border-border bg-card/30 px-4 sm:px-6 lg:px-8 py-8">
        <div className="max-w-7xl mx-auto">
          <Link
            href="/quests"
            className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-6 transition"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Quests
          </Link>

              <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-3">
                <BookOpen className="w-5 h-5 text-primary" />
                <span className="text-sm font-semibold text-primary uppercase">{questCategory}</span>
              </div>
              <h1 className="text-4xl font-bold text-foreground mb-2">{questTitle}</h1>
              <p className="text-muted-foreground">Protocol: {quest.protocol}</p>
              {wallet.address && (
                <p className="text-xs text-muted-foreground mt-2">Your wallet: {wallet.address.slice(0, 6)}...{wallet.address.slice(-4)}</p>
              )}
            </div>
            <Badge className="text-base py-1 px-3" variant="secondary">
              {quest.status}
            </Badge>
          </div>
        </div>
      </section>

      {/* Content */}
      <section className="px-4 sm:px-6 lg:px-8 py-12">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-8">
              {/* Banner */}
              <div className="relative w-full h-64 rounded-lg overflow-hidden border border-border bg-gradient-to-br from-muted/30 to-muted/10 flex items-center justify-center">
                <Image
                  src={questBanner}
                  alt={questTitle}
                  width={1536}
                  height={1536}
                  className="h-3/4 w-auto object-contain"
                  unoptimized={questBanner.startsWith("ipfs://") || questBanner.includes("ipfs.io")}
                />
              </div>

              {/* Description */}
              <Card className="p-6 bg-card/50 space-y-4">
                <h2 className="text-2xl font-bold text-foreground">About This Quest</h2>
                {metadataLoading && (
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Loading metadata from IPFS...</span>
                  </div>
                )}
                {metadataError && (
                  <div className="p-3 bg-destructive/10 border border-destructive/30 rounded-lg text-sm text-destructive flex items-center gap-2">
                    <AlertCircle className="w-4 h-4" />
                    <span>{metadataError}</span>
                  </div>
                )}
                {!metadataLoading && !metadataError && metadata?.summary && (
                  <p className="text-muted-foreground leading-relaxed">{metadata.summary}</p>
                )}
                {!metadataLoading && !metadataError && !metadata?.summary && (
                  <p className="text-muted-foreground leading-relaxed">
                    {quest.metadataURI ? "Metadata available. Check back shortly." : "Quest details coming soon..."}
                  </p>
                )}
                {metadata?.goal && (
                  <div>
                    <h3 className="text-lg font-semibold text-foreground mb-1">Goal</h3>
                    <p className="text-muted-foreground">{metadata.goal}</p>
                  </div>
                )}
                {metadata?.parameters?.actionPlan && (
                  <div>
                    <h3 className="text-lg font-semibold text-foreground mb-1">Action Plan</h3>
                    <p className="text-muted-foreground">{metadata.parameters.actionPlan}</p>
                  </div>
                )}
                {metadata?.parameters?.successCriteria && (
                  <div>
                    <h3 className="text-lg font-semibold text-foreground mb-1">Success Criteria</h3>
                    <p className="text-muted-foreground">{metadata.parameters.successCriteria}</p>
                  </div>
                )}
              </Card>

              {/* Quest Info */}
              <Card className="p-6 bg-card/50">
                <h3 className="text-lg font-bold mb-4 text-foreground">Quest Information</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Quest ID:</span>
                    <span className="font-mono text-foreground">{quest.id}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Category:</span>
                    <span className="text-foreground">{quest.category}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Protocol:</span>
                    <span className="font-mono text-foreground">{quest.protocol.slice(0, 10)}...</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Metadata URI:</span>
                    <a href={quest.metadataURI} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline truncate max-w-xs">
                      {quest.metadataURI}
                    </a>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Reward:</span>
                    <span className="text-foreground">{rewardAmount} MEDQ</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Badge Level:</span>
                    <span className="text-foreground">{quest.badgeLevel}</span>
                  </div>
                </div>
              </Card>

              {/* Steps */}
              <Card className="p-6 bg-card/50 space-y-4">
                <h3 className="text-lg font-bold text-foreground">Quest Steps</h3>
                {metadataLoading && (
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Loading quest steps...</span>
                  </div>
                )}
                {!metadataLoading && metadata?.steps && metadata.steps.length > 0 ? (
                  <div className="space-y-3">
                    {metadata.steps.map((step, index) => (
                      <div key={index} className="border-l-2 border-primary/60 pl-4">
                        <p className="text-sm font-semibold text-foreground mb-1">
                          Step {index + 1}: {step.title}
                        </p>
                        <p className="text-sm text-muted-foreground">{step.description}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  !metadataLoading && (
                    <p className="text-muted-foreground">
                      Quest steps will be loaded from IPFS metadata. Check back soon.
                    </p>
                  )
                )}
              </Card>

              {/* Requirements */}
              {metadata?.requirements && metadata.requirements.length > 0 && (
                <Card className="p-6 bg-card/50 space-y-3">
                  <h3 className="text-lg font-bold text-foreground">Requirements</h3>
                  <ul className="space-y-2">
                    {metadata.requirements.map((req, index) => (
                      <li key={index} className="flex items-start gap-2 text-sm text-muted-foreground">
                        <CheckCircle2 className="w-4 h-4 text-accent shrink-0 mt-0.5" />
                        <span>{req}</span>
                      </li>
                    ))}
                  </ul>
                </Card>
              )}

              {/* Verification Result */}
              {verificationResult && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`p-4 rounded-lg border flex items-start gap-3 ${
                    verificationResult.success
                      ? "bg-accent/10 border-accent/50"
                      : "bg-destructive/10 border-destructive/50"
                  }`}
                >
                  {verificationResult.success ? (
                    <CheckCircle2 className="w-5 h-5 text-accent shrink-0 mt-0.5" />
                  ) : (
                    <AlertCircle className="w-5 h-5 text-destructive shrink-0 mt-0.5" />
                  )}
                  <div>
                    <p className={`font-semibold ${verificationResult.success ? "text-accent" : "text-destructive"}`}>
                      {verificationResult.message}
                    </p>
                  </div>
                </motion.div>
              )}
            </div>

            {/* Sidebar */}
            <div className="lg:col-span-1 space-y-6">
              {/* Quest Info */}
              <Card className="p-6 bg-card/50 space-y-4">
                <div>
                  <p className="text-xs text-muted-foreground uppercase mb-1">Quest Type</p>
                  <p className="font-semibold text-foreground capitalize">{quest.type || questCategory || "Custom"}</p>
                </div>
                <div className="border-t border-border pt-4">
                  <p className="text-xs text-muted-foreground uppercase mb-1">Difficulty</p>
                  <p className="font-semibold text-foreground capitalize">{questDifficulty}</p>
                </div>
                <div className="border-t border-border pt-4">
                  <p className="text-xs text-muted-foreground uppercase mb-1">Created At</p>
                  <div className="flex items-center gap-2 text-foreground">
                    <Calendar className="w-4 h-4" />
                    <span className="text-sm">
                      {quest.createdAt ? new Date(Number(quest.createdAt) * 1000).toLocaleDateString() : "N/A"}
                    </span>
                  </div>
                </div>
                {quest.expiry && quest.expiry !== "0" && (
                  <div className="border-t border-border pt-4">
                    <p className="text-xs text-muted-foreground uppercase mb-1">Expires At</p>
                    <div className="flex items-center gap-2 text-foreground">
                      <Calendar className="w-4 h-4" />
                      <span className="text-sm">
                        {new Date(Number(quest.expiry) * 1000).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                )}
              </Card>

              {/* Reward Card */}
              <RewardCard
                reward={{
                  id: quest.id,
                  type: "token",
                  name: "MEDQ",
                  value: rewardAmount,
                  description: `Reward: ${rewardAmount} MEDQ tokens`,
                }}
                xpReward={xpRewardValue}
              />

              {/* Stats */}
              <Card className="p-6 bg-card/50 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground flex items-center gap-2">
                    <Users className="w-4 h-4" />
                    Accepted
                  </span>
                  <span className="font-bold text-foreground">{quest.acceptedCount || "0"}</span>
                </div>
                <div className="border-t border-border pt-3 flex items-center justify-between">
                  <span className="text-sm text-muted-foreground flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4" />
                    Completed
                  </span>
                  <span className="font-bold text-accent">{quest.completedCount || "0"}</span>
                </div>
              </Card>

              {/* Action Buttons */}
              <div className="space-y-3">
                {!isConnected && (
                  <Button onClick={handleConnectWallet} className="w-full">
                    <Wallet className="w-4 h-4 mr-2" />
                    Connect Wallet
                  </Button>
                )}

                {isConnected && !isHederaNetwork && (
                  <Button disabled className="w-full" variant="outline">
                    <AlertCircle className="w-4 h-4 mr-2" />
                    Switch to Hedera Testnet
                  </Button>
                )}

                {isConnected && isHederaNetwork && !(isAccepted || hasAccepted) && (
                  <Button
                    onClick={handleAcceptQuest}
                    disabled={acceptLoading || progressLoading}
                    className="w-full bg-linear-to-r from-primary to-accent hover:opacity-90"
                  >
                    {acceptLoading ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Accepting...
                      </>
                    ) : (
                      <>
                        <Zap className="w-4 h-4 mr-2" />
                        Accept Quest
                      </>
                    )}
                  </Button>
                )}

                {(isAccepted || hasAccepted) && !isCompleted && (
                  <Button disabled className="w-full bg-transparent" variant="outline">
                    <CheckCircle2 className="w-4 h-4 mr-2" />
                    Quest Accepted - Complete the steps above
                  </Button>
                )}

                {isCompleted && (
                  <Button disabled className="w-full bg-transparent" variant="outline">
                    <CheckCircle2 className="w-4 h-4 mr-2" />
                    Quest Completed!
                  </Button>
                )}
              </div>

              {/* Submit Proof Form */}
              {showSubmitForm && (
                <Card className="p-6 bg-card/50">
                  <h3 className="text-lg font-bold mb-4 text-foreground">Submit Proof</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    After completing the quest action (e.g., swap on SaucerSwap), paste your transaction hash below:
                  </p>
                  {metadata?.parameters?.evidenceHint && (
                    <div className="p-3 bg-muted/40 rounded-lg text-xs text-muted-foreground mb-3">
                      <strong className="text-foreground">Hint:</strong> {metadata.parameters.evidenceHint}
                    </div>
                  )}
                  <div className="space-y-3">
                    <Input
                      placeholder="0x..."
                      value={txHash}
                      onChange={(e) => setTxHash(e.target.value)}
                      className="font-mono"
                    />
                    <Button
                      onClick={handleSubmitProof}
                      disabled={submitLoading || !txHash.trim()}
                      className="w-full"
                    >
                      {submitLoading ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Submitting...
                        </>
                      ) : (
                        "Submit Proof"
                      )}
                    </Button>
                  </div>
                  
                  {/* Verification Result */}
                  {verificationResult && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={`mt-3 p-4 rounded-lg border flex items-start gap-3 ${
                        verificationResult.success
                          ? "bg-accent/10 border-accent/50"
                          : "bg-destructive/10 border-destructive/50"
                      }`}
                    >
                      {verificationResult.success ? (
                        <CheckCircle2 className="w-5 h-5 text-accent shrink-0 mt-0.5" />
                      ) : (
                        <AlertCircle className="w-5 h-5 text-destructive shrink-0 mt-0.5" />
                      )}
                      <div>
                        <p className={`text-sm font-semibold ${verificationResult.success ? "text-accent" : "text-destructive"}`}>
                          {verificationResult.message}
                        </p>
                      </div>
                    </motion.div>
                  )}
                </Card>
              )}
            </div>
          </div>
        </div>
      </section>
    </main>
  )
}
