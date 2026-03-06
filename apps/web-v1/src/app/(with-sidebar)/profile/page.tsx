"use client"

import { ProfileHeader } from "@/components/profile-header"
import { StatsGrid } from "@/components/stats-grid"
import { ProfileTabs } from "@/components/profile-tabs"
import { useUserStore } from "@/lib/store"
import { useReownWallet } from "@/hooks/useReownWallet"
import { useRouter } from "next/navigation"
import { User, Loader2 } from "lucide-react"
import { useEffect } from "react"

export default function ProfilePage() {
  const { user, isConnected, syncUserStats, walletAddress } = useUserStore()
  const { wallet } = useReownWallet()
  const router = useRouter()

  // Sync user stats when component mounts or wallet changes
  useEffect(() => {
    if (wallet.isConnected && wallet.address && (!user || user.walletAddress !== wallet.address)) {
      // Sync user stats to get latest data including name & email
      syncUserStats(wallet.address).catch((err) => {
        console.error("Failed to sync user stats:", err)
      })
    }
  }, [wallet.isConnected, wallet.address]) // Removed syncUserStats and user from deps to avoid infinite loop

  // Redirect if not connected or profile incomplete (must be in useEffect, not during render)
  useEffect(() => {
    // Wait a bit to ensure wallet state is loaded (avoid hydration issues on refresh)
    const checkRedirect = setTimeout(() => {
      // Check if wallet is not connected
      if (!wallet.isConnected || !wallet.address) {
        router.push("/")
        return
      }

      // Check if profile is incomplete and redirect to complete page
      // Only redirect if user data has been loaded (to avoid redirect loop on refresh)
      if (user !== null) {
        if (!user.profileComplete) {
          router.push("/profile/complete")
          return
        }
      }
    }, 300) // Small delay to ensure state is hydrated and avoid redirect on refresh

    return () => clearTimeout(checkRedirect)
  }, [wallet.isConnected, wallet.address, user, router])

  // Show loading while checking wallet state or syncing user data
  if (!wallet.isConnected || !wallet.address) {
    return (
      <main className="bg-background text-foreground min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin" />
      </main>
    )
  }

  // Show loading while user data is being synced
  if (user === null && wallet.isConnected && wallet.address) {
    return (
      <main className="bg-background text-foreground min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin" />
      </main>
    )
  }

    // Type guard: user must not be null at this point
    if (!user) {
      return (
        <main className="bg-background text-foreground min-h-screen flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin" />
        </main>
      )
    }

  return (
    <main className="bg-background text-foreground">
      {/* Header */}
      <section className="border-b border-border bg-card/30 px-4 sm:px-6 lg:px-8 py-12">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center gap-2 mb-4">
            <User className="w-5 h-5 text-primary" />
            <span className="text-sm font-semibold text-primary uppercase">Your Profile</span>
          </div>
          <h1 className="text-4xl font-bold text-foreground">Dashboard</h1>
          <p className="text-muted-foreground mt-2">Manage your profile and quests</p>
        </div>
      </section>

      {/* Content */}
      <section className="px-4 sm:px-6 lg:px-8 py-12">
        <div className="max-w-7xl mx-auto space-y-8">
          {/* Profile Header */}
          <ProfileHeader user={user} />

          {/* Stats Grid */}
          <StatsGrid user={user} />

          {/* Tabs Section */}
          <div>
            <ProfileTabs completedQuestCount={user.completedQuests} />
          </div>
        </div>
      </section>
    </main>
  )
}
