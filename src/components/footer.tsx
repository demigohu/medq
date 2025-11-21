import Link from "next/link"
import { Github, Twitter, Disc3 } from "lucide-react"

export function Footer() {
  return (
    <footer className="bg-background border-t border-border px-4 sm:px-6 lg:px-8 ">
      <div className="max-w-4xl mx-auto py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* Brand */}
          <div>
            <h3 className="font-bold text-lg text-foreground mb-4">Medq</h3>
            <p className="text-sm text-muted-foreground">
              The ultimate DeFi quest platform where you can complete on-chain tasks and earn valuable rewards.
            </p>
          </div>

          {/* Product */}
          <div>
            <h4 className="font-semibold text-foreground mb-4 text-sm">Product</h4>
            <div className="space-y-2">
              <Link href="/quests" className="text-sm text-muted-foreground hover:text-foreground transition block">
                Quests
              </Link>
              <Link
                href="/leaderboard"
                className="text-sm text-muted-foreground hover:text-foreground transition block"
              >
                Leaderboard
              </Link>
              <Link href="/profile" className="text-sm text-muted-foreground hover:text-foreground transition block">
                Profile
              </Link>
              {/* <Link href="/admin" className="text-sm text-muted-foreground hover:text-foreground transition block">
                Admin
              </Link> */}
            </div>
          </div>

          {/* Community */}
          <div className="col-span-2">
            <h4 className="font-semibold text-foreground mb-4 text-sm">Community</h4>
            <div className="flex gap-4">
              <a href="https://x.com/medqdefi" className="text-muted-foreground hover:text-primary transition">
                <Twitter className="w-5 h-5" />
              </a>
              <a href="https://github.com/demigohu/medq" className="text-muted-foreground hover:text-primary transition">
                <Github className="w-5 h-5" />
              </a>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-border pt-8 flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="text-xs text-muted-foreground">© 2025 Medq. All rights reserved.</p>
        </div>
      </div>
    </footer>
  )
}
