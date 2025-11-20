"use client"

import { useState } from "react"
import { QuestForm } from "@/components/quest-form"
import { AdminQuestList } from "@/components/admin-quest-list"
import { Card } from "@/components/ui/card"
import { mockQuests } from "@/data/mock-quests"
import { ShieldAlert, Plus } from "lucide-react"
import { Quest } from "@/lib/types"

interface CreatedQuest {
  id: string
  title: string
  projectName: string
  description: string
  category: string
  type: "on-chain" | "off-chain" | "social" | "community"
  difficulty: "easy" | "medium" | "hard"
  xpReward: number
  participants: number
  completed: number
}

export default function AdminPage() {
  const [createdQuests, setCreatedQuests] = useState<CreatedQuest[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleCreateQuest = async (formData: any) => {
    setIsSubmitting(true)
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000))

    const newQuest: CreatedQuest = {
      id: `quest-admin-${Date.now()}`,
      title: formData.title,
      projectName: formData.projectName,
      description: formData.description,
      category: formData.category,
      type: formData.type,
      difficulty: formData.difficulty,
      xpReward: Number.parseInt(formData.xpReward),
      participants: 0,
      completed: 0,
    }

    setCreatedQuests([newQuest, ...createdQuests])
    setIsSubmitting(false)
  }

  const handleDeleteQuest = (questId: string) => {
    setCreatedQuests(createdQuests.filter((q) => q.id !== questId))
  }

  const allQuests = [...createdQuests, ...mockQuests]

  return (
    <main className="bg-background text-foreground">
      {/* Header */}
      <section className="border-b border-border bg-card/30 px-4 sm:px-6 lg:px-8 py-8">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center gap-2 mb-4">
            <ShieldAlert className="w-5 h-5 text-primary" />
            <span className="text-sm font-semibold text-primary uppercase">Admin Tools</span>
          </div>
          <h1 className="text-4xl font-bold text-foreground">Dashboard</h1>
          <p className="text-muted-foreground mt-2">Manage quests and monitor platform activity</p>
        </div>
      </section>

      {/* Content */}
      <section className="px-4 sm:px-6 lg:px-8 py-12">
        <div className="max-w-6xl mx-auto">
          {/* Warning Badge */}
          <div className="mb-8 p-4 rounded-lg border border-destructive/50 bg-destructive/10 flex items-center gap-3">
            <ShieldAlert className="w-5 h-5 text-destructive shrink-0" />
            <div>
              <p className="text-sm font-semibold text-destructive">Admin Access Required</p>
              <p className="text-xs text-muted-foreground mt-1">
                This is a mock admin dashboard for demonstration. Backend authentication and authorization required in
                production.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Form */}
            <div className="lg:col-span-1">
              <Card className="p-6 bg-card/50 sticky top-20">
                <div className="flex items-center gap-2 mb-4">
                  <Plus className="w-4 h-4 text-primary" />
                  <h2 className="text-lg font-bold text-foreground">Create Quest</h2>
                </div>
                <QuestForm onSubmit={handleCreateQuest} isLoading={isSubmitting} />
              </Card>
            </div>

            {/* Quest List */}
            <div className="lg:col-span-2 space-y-8">
              {/* Stats */}
              <div className="grid grid-cols-2 gap-4">
                <Card className="p-4 bg-card/50">
                  <p className="text-xs text-muted-foreground mb-1">Total Quests</p>
                  <p className="text-2xl font-bold text-primary">{allQuests.length}</p>
                </Card>
                <Card className="p-4 bg-card/50">
                  <p className="text-xs text-muted-foreground mb-1">Created Today</p>
                  <p className="text-2xl font-bold text-accent">{createdQuests.length}</p>
                </Card>
              </div>

              {/* Admin Quest List */}
              <AdminQuestList quests={allQuests as Quest[]} onDelete={handleDeleteQuest} />
            </div>
          </div>
        </div>
      </section>
    </main>
  )
}
