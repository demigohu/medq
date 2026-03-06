"use client"

import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Trash2, Edit, Users, Zap } from "lucide-react"
import { useState } from "react"
import { Quest } from "@/lib/types"

interface AdminQuestListProps {
  quests: Quest[]
  onDelete: (questId: string) => void
}

export function AdminQuestList({ quests, onDelete }: AdminQuestListProps) {
  const [deletingId, setDeletingId] = useState<string | null>(null)

  const handleDelete = (id: string) => {
    setDeletingId(id)
    setTimeout(() => {
      onDelete(id)
      setDeletingId(null)
    }, 500)
  }

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-bold text-foreground">Existing Quests</h3>

      {quests.length > 0 ? (
        <div className="space-y-3">
          {quests.map((quest) => (
            <Card
              key={quest.id}
              className={`p-4 bg-card/50 transition-all ${deletingId === quest.id ? "opacity-50 scale-95" : ""}`}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h4 className="font-semibold text-foreground">{quest.title}</h4>
                    <Badge variant="secondary" className="text-xs">
                      {quest.difficulty}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground mb-2">
                    {quest.projectName} • {quest.category}
                  </p>

                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Users className="w-3 h-3" />
                      {quest.participants} participants
                    </div>
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Zap className="w-3 h-3" />
                      {quest.xpReward} XP
                    </div>
                  </div>
                </div>

                <div className="flex gap-2 shrink-0">
                  <Button size="sm" variant="outline" className="text-xs bg-transparent">
                    <Edit className="w-3 h-3 mr-1" />
                    Edit
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleDelete(quest.id)}
                    className="text-xs text-destructive hover:text-destructive"
                  >
                    <Trash2 className="w-3 h-3 mr-1" />
                    Delete
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <div className="text-center py-8">
          <p className="text-muted-foreground">No quests created yet</p>
        </div>
      )}
    </div>
  )
}
