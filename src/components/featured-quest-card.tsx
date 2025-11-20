"use client"

import type { Quest } from "@/lib/types"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ArrowRight, Zap } from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import { ipfsToHttp } from "@/lib/ipfs"

interface FeaturedQuestCardProps {
  quest: Quest
}

export function FeaturedQuestCard({ quest }: FeaturedQuestCardProps) {
  // Convert IPFS URI to HTTP URL if needed
  const bannerUri = quest.banner || "/placeholder.svg?height=192&width=384&query=quest banner"
  const bannerUrl = bannerUri.startsWith("ipfs://") ? ipfsToHttp(bannerUri) : bannerUri

  return (
    <Link href={`/quests/${quest.id}`}>
      <Card className="overflow-hidden hover:shadow-lg hover:shadow-primary/20 transition-all duration-300 cursor-pointer group">
        {/* Banner */}
        <div className="relative w-full h-48 bg-gradient-to-br from-muted/30 to-muted/10 overflow-hidden flex items-center justify-center">
          <Image
            src={bannerUrl}
            alt={quest.title || quest.description || "Quest banner"}
            width={1536}
            height={1536}
            className="h-3/4 w-auto object-contain group-hover:scale-105 transition-transform duration-300"
            unoptimized={bannerUrl.includes("ipfs.io") || bannerUrl.startsWith("ipfs://")}
          />
          <div className="absolute inset-0 bg-linear-to-t from-background/80 to-transparent" />
        </div>

        {/* Content */}
        <div className="p-6">
          <div className="flex items-start justify-between mb-3">
            <div>
              <h3 className="font-bold text-lg text-foreground group-hover:text-primary transition">{quest.title}</h3>
              <p className="text-sm text-muted-foreground">{quest.projectName}</p>
            </div>
            <Badge variant="outline" className="ml-2">
              {quest.difficulty}
            </Badge>
          </div>

          <p className="text-sm text-muted-foreground mb-4 line-clamp-2">{quest.description}</p>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1">
                <Zap className="w-4 h-4 text-accent" />
                <span className="text-sm font-semibold text-accent">{quest.xpReward} XP</span>
              </div>
              <span className="text-xs text-muted-foreground">
                {quest.completed} / {quest.participants}
              </span>
            </div>
            <ArrowRight className="w-4 h-4 text-primary group-hover:translate-x-1 transition-transform" />
          </div>
        </div>
      </Card>
    </Link>
  )
}
