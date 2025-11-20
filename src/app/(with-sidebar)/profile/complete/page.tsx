"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useUserStore } from "@/lib/store"
import { useReownWallet } from "@/hooks/useReownWallet"
import { api } from "@/lib/api"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/card"
import { Loader2, User, Mail, CheckCircle2, AlertCircle } from "lucide-react"
import { motion } from "framer-motion"

export default function ProfileCompletePage() {
  const router = useRouter()
  const { wallet } = useReownWallet()
  const { user, syncUserStats } = useUserStore()
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  useEffect(() => {
    // Redirect if wallet not connected
    if (!wallet.isConnected || !wallet.address) {
      router.push("/")
      return
    }

    // Redirect if profile already complete
    if (user?.profileComplete) {
      router.push("/quests")
      return
    }

    // Pre-fill if user has existing data
    if (user?.name) setName(user.name)
    if (user?.email) setEmail(user.email)
  }, [wallet, user, router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!wallet.address) return

    setLoading(true)
    setError(null)
    setSuccess(false)

    try {
      // Validate
      if (!name.trim()) {
        throw new Error("Name is required")
      }
      if (!email.trim()) {
        throw new Error("Email is required")
      }
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
        throw new Error("Invalid email format")
      }

      // Save profile
      const response = await api.saveProfile(wallet.address, {
        name: name.trim(),
        email: email.trim(),
      })

      // Update user state immediately
      useUserStore.setState((state) => {
        if (state.user) {
          return {
            user: {
              ...state.user,
              name: response.user.name,
              email: response.user.email,
              avatar: response.user.avatar_url || state.user.avatar, // Include avatar from response
              profileComplete: true,
            },
          }
        }
        return state
      })

      // Sync user stats to ensure everything is up to date (including avatar)
      await syncUserStats(wallet.address)

      setSuccess(true)

      // Quest generation happens in background on backend after profile save
      // Frontend will fetch quests when redirected to /quests page

      // Redirect after 1 second
      setTimeout(() => {
        router.push("/quests")
      }, 1000)
    } catch (err: any) {
      setError(err.message || "Failed to save profile")
    } finally {
      setLoading(false)
    }
  }

  if (!wallet.isConnected || !wallet.address) {
    return null // Will redirect
  }

  return (
    <main className="bg-background text-foreground min-h-screen">
      <section className="px-4 sm:px-6 lg:px-8 py-12">
        <div className="max-w-2xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-8"
          >
            <h1 className="text-4xl font-bold text-foreground mb-2">
              Complete Your Profile
            </h1>
            <p className="text-muted-foreground">
              Let's get to know you better! Fill in your details to start earning rewards.
            </p>
          </motion.div>

          <Card className="p-8 bg-card/50">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Wallet Address Display */}
              <div className="pb-4 border-b border-border">
                <label className="text-sm text-muted-foreground mb-1 block">
                  Wallet Address
                </label>
                <p className="font-mono text-sm text-foreground">
                  {wallet.address.slice(0, 6)}...{wallet.address.slice(-4)}
                </p>
              </div>

              {/* Name Input */}
              <div>
                <label htmlFor="name" className="text-sm font-medium text-foreground mb-2 block">
                  <User className="w-4 h-4 inline mr-2" />
                  Full Name
                </label>
                <Input
                  id="name"
                  type="text"
                  placeholder="Enter your full name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  disabled={loading || success}
                  className="w-full"
                />
              </div>

              {/* Email Input */}
              <div>
                <label htmlFor="email" className="text-sm font-medium text-foreground mb-2 block">
                  <Mail className="w-4 h-4 inline mr-2" />
                  Email Address
                </label>
                <Input
                  id="email"
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  disabled={loading || success}
                  className="w-full"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  We'll use this to send you quest updates and rewards notifications.
                </p>
              </div>

              {/* Error Message */}
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-4 rounded-lg bg-destructive/10 border border-destructive/50 flex items-start gap-3"
                >
                  <AlertCircle className="w-5 h-5 text-destructive shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold text-destructive">Error</p>
                    <p className="text-sm text-destructive/80">{error}</p>
                  </div>
                </motion.div>
              )}

              {/* Success Message */}
              {success && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-4 rounded-lg bg-accent/10 border border-accent/50 flex items-start gap-3"
                >
                  <CheckCircle2 className="w-5 h-5 text-accent shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold text-accent">Profile Saved!</p>
                    <p className="text-sm text-accent/80">Redirecting to quests...</p>
                  </div>
                </motion.div>
              )}

              {/* Submit Button */}
              <Button
                type="submit"
                disabled={loading || success || !name.trim() || !email.trim()}
                className="w-full"
                size="lg"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : success ? (
                  <>
                    <CheckCircle2 className="w-4 h-4 mr-2" />
                    Profile Saved!
                  </>
                ) : (
                  "Save Profile & Start Questing"
                )}
              </Button>
            </form>
          </Card>
        </div>
      </section>
    </main>
  )
}

