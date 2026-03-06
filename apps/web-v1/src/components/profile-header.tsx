"use client"

import type { User } from "@/lib/types"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Copy, ExternalLink, Edit2 } from "lucide-react"
import Image from "next/image"
import { useState } from "react"
import { EditProfileDialog } from "@/components/edit-profile-dialog"

interface ProfileHeaderProps {
  user: User
}

export function ProfileHeader({ user }: ProfileHeaderProps) {
  const [copied, setCopied] = useState(false)

  const copyAddress = () => {
    navigator.clipboard.writeText(user.walletAddress)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <Card className="overflow-hidden bg-linear-to-br from-card to-card/50 border-primary/30">
      {/* Banner Background */}
      <div className="h-32 bg-linear-to-r from-primary/20 to-accent/20 relative overflow-hidden">
        <div className="absolute inset-0 opacity-30">
          <div className="absolute top-2 left-4 w-20 h-20 bg-primary/30 rounded-full blur-2xl" />
          <div className="absolute bottom-2 right-4 w-24 h-24 bg-accent/30 rounded-full blur-2xl" />
        </div>
      </div>

      {/* Profile Info */}
      <div className="px-6 pb-6 -mt-16 relative z-10">
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-6 mb-6">
          {/* Avatar & Name */}
          <div className="flex gap-4">
            <EditProfileDialog user={user}>
              <div className="relative w-32 h-32 rounded-lg border-4 border-background overflow-hidden bg-muted shrink-0 cursor-pointer group">
                <Image
                  src={user.avatar || "/placeholder.svg?height=128&width=128&query=user avatar"}
                  alt={user.name || user.ensName || "User avatar"}
                  width={128}
                  height={128}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <Edit2 className="w-6 h-6 text-white" />
                </div>
              </div>
            </EditProfileDialog>
            <div className="flex flex-col justify-end pb-2">
              <h1 className="text-3xl font-bold text-foreground">
                {user.name || user.ensName || "Web3 User"}
              </h1>
              {user.email && (
                <p className="text-sm text-muted-foreground mt-1">{user.email}</p>
              )}
              <p className="text-sm text-muted-foreground mt-1">
                Joined {new Date(user.joinDate).toLocaleDateString()}
              </p>
              <div className="flex items-center gap-2 mt-3">
                <Badge variant="secondary" className="text-xs">
                  Level {user.level}
                </Badge>
                {user.rank && (
                  <Badge variant="outline" className="text-xs">
                    Rank #{user.rank}
                  </Badge>
                )}
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-2">
            <Button size="sm" variant="outline" onClick={copyAddress} className="w-full sm:w-auto bg-transparent">
              <Copy className="w-4 h-4 mr-2" />
              {copied ? "Copied!" : "Copy Address"}
            </Button>
          </div>
        </div>

        {/* Address & Profile Info */}
        <div className="space-y-3">
        <div className="p-3 rounded-lg bg-muted/50 border border-border">
          <p className="text-xs text-muted-foreground mb-1">Wallet Address</p>
          <p className="font-mono text-sm text-foreground break-all">{user.walletAddress}</p>
          </div>
          {(user.name || user.email) && (
            <div className="p-3 rounded-lg bg-muted/50 border border-border">
              <p className="text-xs text-muted-foreground mb-2">Profile Information</p>
              {user.name && (
                <div className="mb-2">
                  <p className="text-xs text-muted-foreground">Full Name</p>
                  <p className="text-sm text-foreground font-medium">{user.name}</p>
                </div>
              )}
              {user.email && (
                <div>
                  <p className="text-xs text-muted-foreground">Email</p>
                  <p className="text-sm text-foreground font-medium">{user.email}</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </Card>
  )
}
