"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useUserStore } from "@/lib/store";
import { useReownWallet } from "@/hooks/useReownWallet";
import { Button } from "@/components/ui/button";
import { Menu, Webhook, X } from "lucide-react";
import { useState } from "react";
import { AppKitButton } from '@reown/appkit/react'
import Image from "next/image";

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const { user } = useUserStore();
  const router = useRouter();

  // Always call hooks - WagmiProvider is always available now
  const { wallet, isHederaNetwork, switchToHedera } = useReownWallet();

  return (
    <>
      <nav className="max-w-4xl w-full fixed top-6 left-1/2 transform -translate-x-1/2 z-50 px-6 py-3 rounded-full bg-[#121212]/80 backdrop-blur supports-backdrop-filter:bg-[#121212]/60 border border-[#252525]/40 shadow-lg">
        <div className="flex justify-between items-center gap-12">
          <div className="flex items-center gap-8 shrink-0">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-2">
              <Image src="/medq.svg" alt="Medq" width={24} height={24} />
              {/* <Webhook className="w-6 h-6 text-foreground" /> */}
              <span className="font-bold text-xl text-foreground">Medq</span>
            </Link>

            {/* Desktop Menu - Centered */}
            <div className="hidden md:flex items-center gap-8">
              <Link
                href="/quests"
                className="text-muted-foreground hover:text-foreground transition text-sm font-medium"
              >
                Quests
              </Link>
              <Link
                href="/leaderboard"
                className="text-muted-foreground hover:text-foreground transition text-sm font-medium"
              >
                Leaderboard
              </Link>
            </div>
          </div>

          {/* Right Section - Get Started / Connect */}
          <div className="flex items-center gap-3 shrink-0">
            {!isHederaNetwork && wallet.isConnected && (
              <Button
                onClick={switchToHedera}
                variant="outline"
                size="sm"
                className="bg-transparent border-yellow-500 text-yellow-500 hover:bg-yellow-500/10 text-xs"
              >
                Switch to Hedera Testnet
              </Button>
            )}
            <AppKitButton 
              balance="hide"
              label="Connect Wallet"
            />

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="md:hidden inline-flex items-center justify-center w-8 h-8 rounded-lg text-foreground"
            >
              {isOpen ? (
                <X className="w-5 h-5" />
              ) : (
                <Menu className="w-5 h-5" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Menu - positioned below the floating navbar */}
        {isOpen && (
          <div className="fixed top-20 left-1/2 transform -translate-x-1/2 z-40 md:hidden w-full max-w-xs mx-auto px-4">
            <div className="bg-background/80 backdrop-blur border border-border/40 rounded-2xl py-4 space-y-2 shadow-lg">
              <Link
                href="/quests"
                className="block px-4 py-2 text-foreground hover:bg-muted rounded-lg text-sm font-medium"
              >
                Quests
              </Link>
              <Link
                href="/leaderboard"
                className="block px-4 py-2 text-foreground hover:bg-muted rounded-lg text-sm font-medium"
              >
                Leaderboard
              </Link>
            </div>
          </div>
        )}
      </nav>
      {/* <div className="h-24" /> */}
    </>
  );
}
