"use client";

import { Navbar } from "@/components/navbar";
import { FeaturedQuestCard } from "@/components/featured-quest-card";
import { Button } from "@/components/ui/button";
import { useUserStore } from "@/lib/store";
import { mockQuests } from "@/data/mock-quests";
import Link from "next/link";
import { ArrowRight, Zap, Users, Trophy } from "lucide-react";
import { Footer } from "@/components/footer";
import { FeaturesShowcase } from "@/components/features-showcase";
import { FAQSection } from "@/components/faq-section";
import { Shader, ChromaFlow, Swirl } from "shaders/react"
import { useEffect, useRef, useState } from "react";

export default function Home() {
  const { isConnected } = useUserStore();
  const featuredQuests = mockQuests.slice(0, 3);

  const [isLoaded, setIsLoaded] = useState(false)
  const shaderContainerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const checkShaderReady = () => {
      if (shaderContainerRef.current) {
        const canvas = shaderContainerRef.current.querySelector("canvas")
        if (canvas && canvas.width > 0 && canvas.height > 0) {
          setIsLoaded(true)
          return true
        }
      }
      return false
    }

    if (checkShaderReady()) return

    const intervalId = setInterval(() => {
      if (checkShaderReady()) {
        clearInterval(intervalId)
      }
    }, 100)

    const fallbackTimer = setTimeout(() => {
      setIsLoaded(true)
    }, 1500)

    return () => {
      clearInterval(intervalId)
      clearTimeout(fallbackTimer)
    }
  }, [])



  return (
    <main className="bg-background text-foreground">
      
      <div
        ref={shaderContainerRef}
        className={`absolute inset-0 z-0 transition-opacity duration-700 ${isLoaded ? "opacity-100" : "opacity-0"}`}
        style={{ contain: "strict" }}
      >
        <Shader className="h-full w-full">
          <Swirl
            colorA="#000000"
            colorB="#ffffff"
            speed={0.8}
            detail={0.8}
            blend={50}
            coarseX={40}
            coarseY={40}
            mediumX={40}
            mediumY={40}
            fineX={40}
            fineY={40}
          />
          <ChromaFlow
            baseColor="#000000"
            upColor="#000000"
            downColor="#d1d1d1"
            leftColor="#ffffff"
            rightColor="#ffffff"
            intensity={0.9}
            radius={1.8}
            momentum={25}
            maskType="alpha"
            opacity={0.97}
          />
        </Shader>
        <div className="absolute inset-0 bg-black/20" />
      </div>

      <Navbar />
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        {/* Halftone Background */}
        {/* <div className="absolute inset-0 pointer-events-none">
          <div
            className="w-full h-full"
            style={{
              backgroundColor: "rgb(var(--background))",
              backgroundImage:
                "radial-gradient(circle, rgba(15, 23, 42, 0.35) 20%, transparent 22%)",
              backgroundSize: "18px 18px",
              maskImage:
                "linear-gradient(90deg, rgba(0,0,0,0.95) 0%, rgba(0,0,0,0.6) 30%, rgba(0,0,0,0.2) 55%, transparent 90%)",
              WebkitMaskImage:
                "linear-gradient(90deg, rgba(0,0,0,0.95) 0%, rgba(0,0,0,0.6) 30%, rgba(0,0,0,0.2) 55%, transparent 90%)",
              opacity: 0.75,
              transform: "scale(1.2)",
            }}
          />
        </div> */}

        <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="flex flex-col">
            {/* Left Content */}
            <div className="text-center flex flex-col items-center justify-center gap-6">
              {/* <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-primary/30 bg-primary/10 w-fit">
                <Zap className="w-4 h-4 text-accent" />
                <span className="text-sm text-primary">Welcome to QuestChain</span>
              </div> */}

              <h1 className="text-5xl lg:text-6xl font-bold text-balance leading-tight">
                Complete Quests.
                <span className="bg-linear-to-r from-primary via-accent to-primary bg-clip-text text-transparent">
                  {" "}
                  Earn Rewards.
                </span>
              </h1>

              <p className="text-lg text-muted-foreground leading-relaxed max-w-lg">
                Join the ultimate DeFi quest platform. Complete on-chain tasks,
                participate in communities, and earn valuable rewards while
                climbing the leaderboard.
              </p>

              {/* <div className="flex flex-col sm:flex-row gap-4 pt-4">
                {isConnected ? (
                  <>
                    <Link href="/quests" className="w-full sm:w-auto">
                      <Button className="w-full bg-linear-to-r from-primary to-accent hover:opacity-90 text-base py-6">
                        Explore Quests <ArrowRight className="ml-2 w-5 h-5" />
                      </Button>
                    </Link>
                    <Link href="/leaderboard" className="w-full sm:w-auto">
                      <Button
                        variant="outline"
                        className="w-full text-base py-6 bg-transparent"
                      >
                        View Leaderboard
                      </Button>
                    </Link>
                  </>
                ) : (
                  <Button className="w-full sm:w-auto bg-linear-to-r from-primary to-accent hover:opacity-90 text-base py-6">
                    Connect Wallet to Start
                  </Button>
                )}
              </div> */}

              <div className="flex flex-col sm:flex-row gap-4 pt-4">
                <Link href="/quests" className="w-full sm:w-auto">
                  <Button className="w-full bg-linear-to-r from-primary to-accent hover:opacity-90 text-base py-6">
                    Explore Quests <ArrowRight className="ml-2 w-5 h-5" />
                  </Button>
                </Link>
                <Link href="/leaderboard" className="w-full sm:w-auto">
                  <Button
                    variant="outline"
                    className="w-full text-base py-6 bg-transparent"
                  >
                    View Leaderboard
                  </Button>
                </Link>
              </div>

              {/* Stats */}
              {/* <div className="grid grid-cols-3 gap-4 pt-8">
                <div className="space-y-2">
                  <p className="text-2xl font-bold text-accent">1,250+</p>
                  <p className="text-sm text-muted-foreground">
                    Active Players
                  </p>
                </div>
                <div className="space-y-2">
                  <p className="text-2xl font-bold text-primary">42</p>
                  <p className="text-sm text-muted-foreground">Active Quests</p>
                </div>
                <div className="space-y-2">
                  <p className="text-2xl font-bold text-accent">$2.5M</p>
                  <p className="text-sm text-muted-foreground">Total Rewards</p>
                </div>
              </div> */}
            </div>

            {/* Right Visual */}
            {/* <div className="hidden lg:block relative">
              <div className="relative">
                <div className="absolute inset-0 bg-linear-to-br from-primary/30 to-accent/30 rounded-3xl blur-2xl" />
                <div className="relative bg-linear-to-br from-card to-card/50 rounded-3xl p-8 border border-primary/20">
                  <div className="space-y-6">
                    <div className="flex items-center justify-between p-4 rounded-xl bg-background/50 border border-border">
                      <div>
                        <p className="text-xs text-muted-foreground">
                          Quest Progress
                        </p>
                        <p className="text-lg font-bold text-foreground">
                          12/42 Completed
                        </p>
                      </div>
                      <Trophy className="w-8 h-8 text-accent" />
                    </div>
                    <div className="flex items-center justify-between p-4 rounded-xl bg-background/50 border border-border">
                      <div>
                        <p className="text-xs text-muted-foreground">
                          Current XP
                        </p>
                        <p className="text-lg font-bold text-foreground">
                          2,850 XP
                        </p>
                      </div>
                      <Zap className="w-8 h-8 text-primary" />
                    </div>
                    <div className="flex items-center justify-between p-4 rounded-xl bg-background/50 border border-border">
                      <div>
                        <p className="text-xs text-muted-foreground">
                          Your Rank
                        </p>
                        <p className="text-lg font-bold text-foreground">
                          #247
                        </p>
                      </div>
                      <Users className="w-8 h-8 text-accent" />
                    </div>
                    <div className="h-24 bg-background/30 rounded-xl border border-border/50 flex items-end justify-around p-4">
                      {[40, 60, 35, 80, 50].map((height, i) => (
                        <div
                          key={i}
                          className="flex-1 bg-linear-to-t from-primary to-accent rounded-md mx-1"
                          style={{ height: `${height}%` }}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div> */}
          </div>
        </div>
      </section>

      <FeaturesShowcase />

      {/* Featured Quests Section */}
      {/* <section className="py-20 px-4 sm:px-6 lg:px-8 border-t border-border bg-card/30">
        <div className="max-w-6xl mx-auto">
          <div className="mb-12">
            <div className="flex items-center gap-2 mb-4">
              <Zap className="w-5 h-5 text-accent" />
              <span className="text-sm font-semibold text-primary uppercase tracking-wider">
                Featured
              </span>
            </div>
            <h2 className="text-4xl font-bold text-foreground text-balance">
              Popular Quests This Week
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {featuredQuests.map((quest) => (
              <FeaturedQuestCard key={quest.id} quest={quest} />
            ))}
          </div>

          <div className="text-center mt-12">
            <Link href="/quests">
              <Button
                variant="outline"
                size="lg"
                className="border-primary/50 hover:bg-primary/10 text-primary bg-transparent"
              >
                View All Quests <ArrowRight className="ml-2 w-4 h-4" />
              </Button>
            </Link>
          </div>
        </div>
      </section> */}

      {/* FAQ Section */}
      <FAQSection />

      {/* CTA Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <div className="relative rounded-3xl border border-primary/30 bg-linear-to-br from-primary/10 to-accent/10 p-12 text-center">
            <div className="absolute inset-0 rounded-3xl bg-linear-to-br from-primary/5 to-accent/5 blur-xl -z-10" />

            <h3 className="text-3xl font-bold mb-4 text-foreground">
              Ready to Begin Your Quest?
            </h3>
            <p className="text-lg text-muted-foreground mb-8 max-w-xl mx-auto">
              Connect your wallet to start earning rewards, complete challenges,
              and join the community of DeFi enthusiasts.
            </p>
            <Link href="/quests">
            <Button className="bg-linear-to-r from-primary to-accent hover:opacity-90 text-base py-6 px-8">
              Start Questing Now <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* <Footer /> */}
    </main>
  );
}
