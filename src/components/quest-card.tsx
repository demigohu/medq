"use client"

import type { Quest } from "@/lib/types"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Zap, Users, Trophy, BookOpen, Users2, MessageCircle } from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import { ipfsToHttp } from "@/lib/ipfs"

interface QuestCardProps {
  quest: Quest
}

const typeIcons = {
  "on-chain": BookOpen,
  "off-chain": Trophy,
  social: MessageCircle,
  community: Users2,
}

const statusColors = {
  "not-started": "bg-muted/50 text-muted-foreground",
  "in-progress": "bg-primary/20 text-primary",
  completed: "bg-accent/20 text-accent",
  failed: "bg-destructive/20 text-destructive",
}

export function QuestCard({ quest }: QuestCardProps) {
  const Icon = typeIcons[quest.type]
  const progressPercent = (quest.completed / quest.participants) * 100
  // Convert IPFS URI to HTTP URL if needed
  const bannerUri = quest.banner || "/placeholder.svg?height=128&width=384&query=quest"
  const bannerUrl = bannerUri.startsWith("ipfs://") ? ipfsToHttp(bannerUri) : bannerUri

  return (
    <Link href={`/quests/${quest.id}`}>
      <Card className="overflow-hidden hover:shadow-lg hover:shadow-primary/20 transition-all duration-300 cursor-pointer group h-full flex flex-col">
        {/* Image */}
        <div className="relative w-full h-32 bg-gradient-to-br from-muted/30 to-muted/10 overflow-hidden flex items-center justify-center">
          <Image
            src={bannerUrl}
            alt={quest.title || quest.description || "Quest banner"}
            width={1536}
            height={1536}
            className="h-3/4 w-auto object-contain group-hover:scale-105 transition-transform duration-300"
            unoptimized={bannerUrl.includes("ipfs.io") || bannerUrl.startsWith("ipfs://")}
          />
        </div>

        {/* Content */}
        <div className="p-4 flex flex-col grow">
          {/* Header */}
          <div className="flex items-start justify-between mb-3">
            <div className="flex-1">
              <h3 className="font-bold text-foreground group-hover:text-primary transition line-clamp-2">
                {quest.title}
              </h3>
              <p className="text-xs text-muted-foreground mt-1">{quest.projectName}</p>
            </div>
            <Badge variant="secondary" className="ml-2 shrink-0">
              {quest.difficulty}
            </Badge>
          </div>

          {/* Badges */}
          <div className="flex items-center gap-2 mb-3 flex-wrap">
            <Badge variant="outline" className="text-xs">
              <Icon className="w-3 h-3 mr-1" />
              {quest.type}
            </Badge>
            <Badge variant="outline" className="text-xs">
              {quest.category}
            </Badge>
          </div>

          {/* Description */}
          <p className="text-xs text-muted-foreground mb-4 line-clamp-2 grow">{quest.description}</p>

          {/* Progress */}
          <div className="mb-3">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-muted-foreground">Completion Rate</span>
              <span className="text-xs font-semibold text-accent">{Math.round(progressPercent)}%</span>
            </div>
            <Progress value={progressPercent} className="h-1.5" />
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between pt-3 border-t border-border">
            <div className="flex items-center gap-3 text-xs">
              <div className="flex items-center gap-1">
                <Zap className="w-3 h-3 text-accent" />
                <span className="font-semibold text-accent">{quest.xpReward}</span>
              </div>
              <div className="flex items-center gap-1 text-muted-foreground">
                <Users className="w-3 h-3" />
                <span>
                  {quest.completed}/{quest.participants}
                </span>
              </div>
            </div>
            <Badge className={statusColors[quest.status]} variant="outline">
              {quest.status}
            </Badge>
          </div>
        </div>
      </Card>
    </Link>
  )
}
