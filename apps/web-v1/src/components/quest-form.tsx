"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Plus } from "lucide-react"

interface QuestFormData {
  title: string
  projectName: string
  description: string
  category: string
  type: "on-chain" | "off-chain" | "social" | "community"
  difficulty: "easy" | "medium" | "hard"
  xpReward: string
}

interface QuestFormProps {
  onSubmit: (data: QuestFormData) => void
  isLoading?: boolean
}

export function QuestForm({ onSubmit, isLoading }: QuestFormProps) {
  const [formData, setFormData] = useState<QuestFormData>({
    title: "",
    projectName: "",
    description: "",
    category: "DeFi",
    type: "on-chain",
    difficulty: "medium",
    xpReward: "250",
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (formData.title && formData.projectName && formData.description) {
      onSubmit(formData)
      setFormData({
        title: "",
        projectName: "",
        description: "",
        category: "DeFi",
        type: "on-chain",
        difficulty: "medium",
        xpReward: "250",
      })
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="text-sm font-semibold text-foreground mb-2 block">Quest Title</label>
        <Input
          placeholder="e.g., Swap on Uniswap V4"
          value={formData.title}
          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          required
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="text-sm font-semibold text-foreground mb-2 block">Project Name</label>
          <Input
            placeholder="e.g., Uniswap"
            value={formData.projectName}
            onChange={(e) => setFormData({ ...formData, projectName: e.target.value })}
            required
          />
        </div>

        <div>
          <label className="text-sm font-semibold text-foreground mb-2 block">XP Reward</label>
          <Input
            type="number"
            placeholder="250"
            value={formData.xpReward}
            onChange={(e) => setFormData({ ...formData, xpReward: e.target.value })}
          />
        </div>
      </div>

      <div>
        <label className="text-sm font-semibold text-foreground mb-2 block">Description</label>
        <textarea
          placeholder="Describe the quest..."
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          className="w-full px-3 py-2 rounded-md border border-border bg-muted/30 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
          rows={4}
          required
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div>
          <label className="text-sm font-semibold text-foreground mb-2 block">Type</label>
          <select
            value={formData.type}
            onChange={(e) =>
              setFormData({
                ...formData,
                type: e.target.value as QuestFormData["type"],
              })
            }
            className="w-full px-3 py-2 rounded-md border border-border bg-muted/30 text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
          >
            <option value="on-chain">On-Chain</option>
            <option value="off-chain">Off-Chain</option>
            <option value="social">Social</option>
            <option value="community">Community</option>
          </select>
        </div>

        <div>
          <label className="text-sm font-semibold text-foreground mb-2 block">Category</label>
          <select
            value={formData.category}
            onChange={(e) => setFormData({ ...formData, category: e.target.value })}
            className="w-full px-3 py-2 rounded-md border border-border bg-muted/30 text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
          >
            <option value="DeFi">DeFi</option>
            <option value="NFT">NFT</option>
            <option value="Community">Community</option>
            <option value="Governance">Governance</option>
            <option value="Cross-Chain">Cross-Chain</option>
          </select>
        </div>

        <div>
          <label className="text-sm font-semibold text-foreground mb-2 block">Difficulty</label>
          <select
            value={formData.difficulty}
            onChange={(e) =>
              setFormData({
                ...formData,
                difficulty: e.target.value as QuestFormData["difficulty"],
              })
            }
            className="w-full px-3 py-2 rounded-md border border-border bg-muted/30 text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
          >
            <option value="easy">Easy</option>
            <option value="medium">Medium</option>
            <option value="hard">Hard</option>
          </select>
        </div>
      </div>

      <Button
        type="submit"
        disabled={isLoading}
        className="w-full bg-linear-to-r from-primary to-accent hover:opacity-90"
      >
        <Plus className="w-4 h-4 mr-2" />
        {isLoading ? "Creating..." : "Create Quest"}
      </Button>
    </form>
  )
}
