"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { ArrowRight, Flame, Calendar, Trophy } from 'lucide-react'
import Link from "next/link"

const features = [
  {
    id: "daily",
    title: "Daily Quest",
    icon: Flame,
    description: "Complete daily challenges",
    stats: "15.2K",
    label: "Active Daily",
  },
  {
    id: "weekly",
    title: "Weekly Quest",
    icon: Calendar,
    description: "Tackle weekly objectives",
    stats: "8.5K",
    label: "Active Weekly",
  },
  {
    id: "leaderboard",
    title: "Leaderboard",
    icon: Trophy,
    description: "Compete and rank up",
    stats: "1.2K",
    label: "Top Players",
  },
]

export function FeaturesShowcase() {
  const [activeFeature, setActiveFeature] = useState("daily")

  const current = features.find((f) => f.id === activeFeature) || features[0]
  const Icon = current.icon

  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8 border-t border-border">
      <div className="max-w-4xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Left Content */}
          <div className="space-y-8">
            <div className="space-y-4">
              <h2 className="text-4xl lg:text-5xl font-bold text-foreground text-balance">
                Everything you need
              </h2>
              <p className="text-lg text-muted-foreground leading-relaxed">
                Grow fast, organize the chaos, and reward the real contributors. This is how you'll keep your
                community alive and thriving.
              </p>
            </div>

            {/* Feature Buttons */}
            <div className="space-y-3">
              {features.map((feature) => {
                const FeatureIcon = feature.icon
                return (
                  <button
                    key={feature.id}
                    onClick={() => setActiveFeature(feature.id)}
                    className={`w-full flex items-center gap-3 px-4 py-4 rounded-xl border transition-all duration-200 ${
                      activeFeature === feature.id
                        ? "bg-primary/10 border-primary/50"
                        : "bg-card/50 border-border hover:border-primary/30"
                    }`}
                  >
                    <div
                      className={`p-2 rounded-lg ${
                        activeFeature === feature.id
                          ? "bg-primary/20 text-primary"
                          : "bg-background text-muted-foreground"
                      }`}
                    >
                      <FeatureIcon className="w-5 h-5" />
                    </div>
                    <div className="text-left">
                      <p className="font-semibold text-foreground">{feature.title}</p>
                      <p className="text-sm text-muted-foreground">{feature.description}</p>
                    </div>
                  </button>
                )
              })}
            </div>

            {/* CTA */}
            <Link href="/quests">
              <Button className="group bg-primary/90 hover:bg-primary text-base py-6 px-6">
                Start Growing <ArrowRight className="ml-2 w-5 h-5 transition-transform group-hover:translate-x-1" />
              </Button>
            </Link>
          </div>

          {/* Right Content - Feature Card */}
          <div className="relative hidden lg:flex items-center justify-end">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-accent/20 rounded-3xl blur-3xl" />

            <div className="relative w-full max-w-sm bg-gradient-to-br from-card/80 to-card/40 rounded-3xl border border-primary/20 p-8 space-y-6">
              {/* Header */}
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground font-semibold uppercase tracking-wide">Featured</p>
                  <h3 className="text-xl font-bold text-foreground">{current.title}</h3>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-accent">{current.stats}</p>
                  <p className="text-xs text-muted-foreground">{current.label}</p>
                </div>
              </div>

              {/* Icon Display */}
              <div className="flex justify-center">
                <div className="relative w-32 h-32 rounded-2xl bg-gradient-to-br from-primary/20 to-accent/20 border border-primary/30 flex items-center justify-center">
                  <div className="absolute inset-2 bg-gradient-to-br from-primary/10 to-transparent rounded-xl" />
                  <Icon className="w-16 h-16 text-primary relative z-10" />
                </div>
              </div>

              {/* Quest Info */}
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 rounded-lg bg-background/50 border border-border/50">
                  <span className="text-sm text-muted-foreground">Participation</span>
                  <span className="text-sm font-semibold text-foreground">22K participants</span>
                </div>
                <div className="flex items-center justify-between p-3 rounded-lg bg-background/50 border border-border/50">
                  <span className="text-sm text-muted-foreground">Rewards</span>
                  <span className="text-sm font-semibold text-accent">Up to 500 XP</span>
                </div>
                <div className="flex items-center justify-between p-3 rounded-lg bg-background/50 border border-border/50">
                  <span className="text-sm text-muted-foreground">Status</span>
                  <span className="text-sm font-semibold text-primary">Active</span>
                </div>
              </div>

              {/* Action Button */}
              <Link href="/quests">
              <Button className="w-full bg-gradient-to-r from-primary to-accent hover:opacity-90 py-6 font-semibold">
                Start Quest
              </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
