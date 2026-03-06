"use client"

import type { QuestStep } from "@/lib/types"
import { motion } from "framer-motion"
import { CheckCircle2, Circle } from "lucide-react"

interface QuestStepTrackerProps {
  steps: QuestStep[]
}

export function QuestStepTracker({ steps }: QuestStepTrackerProps) {
  const completedCount = steps.filter((s) => s.completed).length
  const progressPercent = (completedCount / steps.length) * 100

  return (
    <div className="space-y-6">
      {/* Progress Bar */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-foreground">Quest Progress</h3>
          <span className="text-sm font-semibold text-accent">
            {completedCount}/{steps.length}
          </span>
        </div>
        <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-linear-to-r from-primary to-accent"
            initial={{ width: 0 }}
            animate={{ width: `${progressPercent}%` }}
            transition={{ duration: 0.6, ease: "easeOut" }}
          />
        </div>
      </div>

      {/* Steps */}
      <div className="space-y-4">
        {steps.map((step, index) => (
          <motion.div
            key={step.id}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3, delay: index * 0.1 }}
            className={`p-4 rounded-lg border transition-all ${
              step.completed ? "bg-accent/10 border-accent/50" : "bg-muted/30 border-border"
            }`}
          >
            <div className="flex items-start gap-4">
              <div className="mt-0.5">
                {step.completed ? (
                  <CheckCircle2 className="w-6 h-6 text-accent shrink-0" />
                ) : (
                  <Circle className="w-6 h-6 text-muted-foreground shrink-0" />
                )}
              </div>
              <div className="flex-1">
                <h4 className="font-semibold text-foreground">{step.title}</h4>
                <p className="text-sm text-muted-foreground mt-1">{step.description}</p>
              </div>
              {step.completed && (
                <span className="text-xs font-semibold text-accent px-2 py-1 rounded-full bg-accent/20">Completed</span>
              )}
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  )
}
