"use client";

import { Button } from "@/components/ui/button";
import { useAllQuests } from "@/hooks/useQuests";
import Dither from "@/components/ui/Dither";
import FaultyTerminal from "@/components/ui/FaultyTerminal";
import {
  ArrowRightLeft,
  FileCheck2,
  Github,
  MoveRight,
  Trophy,
  Twitter,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import Marquee from "react-fast-marquee";
import { TypeAnimation } from "react-type-animation";
import PartnershipCarousel from "@/components/partnership-carousel";
import { FaqSection } from "@/components/faq-section";
// import TextType from "@/components/ui/TextType";
// import dynamic from "next/dynamic";

// const Dither = dynamic(() => import("@/components/ui/Dither"), {
//   ssr: false,
// });

const CATEGORY_STYLE: Record<string, { code: string; codeBg: string; codeText: string; bonusDot: string }> = {
  swap: { code: "SW", codeBg: "bg-sky-500/15", codeText: "text-sky-400", bonusDot: "bg-sky-400" },
  liquidity: { code: "LP", codeBg: "bg-sky-500/15", codeText: "text-sky-400", bonusDot: "bg-emerald-400" },
  stake: { code: "ST", codeBg: "bg-indigo-500/15", codeText: "text-indigo-400", bonusDot: "bg-indigo-400" },
  lend: { code: "L", codeBg: "bg-indigo-500/15", codeText: "text-indigo-400", bonusDot: "bg-sky-400" },
};

function mapQuestToCard(q: Record<string, unknown>, idx: number) {
  const cat = (String(q.category || "swap")).toLowerCase();
  const style = CATEGORY_STYLE[cat] || CATEGORY_STYLE.swap;
  const reward = q.reward_per_participant ? `${Number(q.reward_per_participant)} MEDQ` : "— MEDQ";
  return {
    id: String(q.quest_id_on_chain ?? q.id ?? idx),
    code: style.code,
    codeBg: style.codeBg,
    codeText: style.codeText,
    title: String(q.title || "Quest"),
    description: String(q.description || ""),
    reward,
    bonusDot: style.bonusDot,
    bonusLabel: "Badge NFT",
  };
}

const FALLBACK_CAMPAIGNS = [
  {
    id: "#0004",
    code: "LP",
    codeBg: "bg-sky-500/15",
    codeText: "text-sky-400",
    title: "Liquidity Provision Quest",
    description: "Provide liquidity to the HBAR/SAUCE pool for 7 days to earn rewards.",
    reward: "500 MEDQ",
    bonusDot: "bg-emerald-400",
    bonusLabel: "Limited NFT",
  },
  {
    id: "#0005",
    code: "L",
    codeBg: "bg-indigo-500/15",
    codeText: "text-indigo-400",
    title: "Lending Protocol Quest",
    description:
      "Supply HBAR to the Bonzo lending market and earn yield plus rewards.",
    reward: "750 MEDQ",
    bonusDot: "bg-sky-400",
    bonusLabel: "Early Adopter NFT",
  },
  {
    id: "#0006",
    code: "SC",
    codeBg: "bg-fuchsia-500/15",
    codeText: "text-fuchsia-400",
    title: "Smart Contract Deploy",
    description:
      "Deploy your first smart contract using the Hedera JSON-RPC relay.",
    reward: "1200 MEDQ",
    bonusDot: "bg-fuchsia-400",
    bonusLabel: "Developer NFT",
  },
  {
    id: "#0007",
    code: "N",
    codeBg: "bg-blue-500/15",
    codeText: "text-blue-300",
    title: "Native Staking Intro",
    description:
      "Stake at least 1,000 HBAR to any active validator node for 24 hours.",
    reward: "300 MEDQ",
    bonusDot: "bg-blue-300",
    bonusLabel: "Staker Badge",
  },
  {
    id: "#0088",
    code: "D",
    codeBg: "bg-purple-500/15",
    codeText: "text-purple-300",
    title: "DEX Master Trader",
    description:
      "Complete 5 trades with a total volume of $100+ on any supported DEX.",
    reward: "600 MEDQ",
    bonusDot: "bg-purple-300",
    bonusLabel: "Trader NFT",
  },
  {
    id: "#0099",
    code: "NFT",
    codeBg: "bg-emerald-500/15",
    codeText: "text-emerald-300",
    title: "NFT Collector Quest",
    description:
      "Purchase or mint any NFT from a verified collection on SentX.",
    reward: "450 MEDQ",
    bonusDot: "bg-emerald-300",
    bonusLabel: "SentX NFT",
  },
];

export default function Home() {
  const { quests, loading } = useAllQuests();
  const activeCampaigns = quests.length > 0
    ? quests.slice(0, 8).map((q, i) => mapQuestToCard(q, i))
    : FALLBACK_CAMPAIGNS;

  return (
    <main className="min-h-screen bg-black text-white">
      {/* Hero */}
      <section
        id="hero"
        className="mx-auto flex min-h-screen flex-col justify-end overflow-hidden"
      >
        <div className='absolute w-full h-dvh'>
          <Dither
            waveColor={[0, 0, 0.5]}
            disableAnimation={false}
            enableMouseInteraction
            mouseRadius={0.1}
            colorNum={4}
            pixelSize={2}
            waveAmplitude={0.3}
            waveFrequency={3}
            waveSpeed={0.05}
          />
        </div>

        <div className="relative z-10 px-5 md:px-10 py-5 grid md:flex flex-row justify-between">
          <div className="space-y-5 max-w-xl text-center md:text-left">
            <div className="space-y-4">
              <h1 className="text-balance text-4xl font-semibold tracking-tight text-white md:text-5xl">
                Complete Quests. Earn Rewards.
              </h1>
              <TypeAnimation
                sequence={[
                  // Same substring at the start will only be typed once, initially
                  'Join the ultimate DeFi quest platform. Complete on-chain tasks, participate in communities, and earn valuable rewards while climbing the leaderboard.',
                ]}
                speed={75}
              // style={{ fontSize: '2em' }}
              // repeat={Infinity}
              />
            </div>

            <div className="flex flex-wrap items-center gap-3 text-sm justify-center md:justify-start">
              <Link href="/quests">
                <Button variant="default" className="rounded font-semibold bg-white text-black hover:bg-white/80">
                  Explore Quests
                  <MoveRight className="w-4 h-4" />
                </Button>
              </Link>
            </div>
          </div>

          <div className="flex items-end justify-center md:justify-between mt-4 md:mt-0">
            <div className="border-r border-white py-1 px-4">
              <Link href="https://x.com/medq_quests" target="_blank" rel="noopener noreferrer">
                <Twitter className="w-6 h-6 text-white transition-transform duration-500 hover:rotate-[360deg]" />
              </Link>
            </div>
            <div className="py-1 px-4">
              <Link href="https://github.com/medq-quests" target="_blank" rel="noopener noreferrer">
                <Github className="w-6 h-6 text-white transition-transform duration-500 hover:rotate-[360deg]" />
              </Link>
            </div>
          </div>
        </div>

        {/* Invisible sentinel used by the navbar to detect when hero ends */}
        <div id="hero-end" className="absolute bottom-0 mt-24 h-px w-full" />
      </section>

      <div className="border border-[#1A1A1A] m-5 md:m-10">
        <section className="p-10 space-y-8 border-b border-[#1A1A1A]">
          <h1 className="text-3xl font-semibold text-white text-center">Powered By</h1>
          <Marquee className="gap-10" gradient={true} gradientColor="#000000" gradientWidth={100} pauseOnHover={true}>
            <div className="mx-8">
              <Image src="/logo/hedera.png" alt="Medq" className="w-[150px] object-cover" width={1200} height={334} />
            </div>

            <div className="mx-8 mt-1">
              <Image src="/logo/saucer.png" alt="Medq" className="w-[150px] object-cover mt-3" width={1062} height={164} />
            </div>

            <div className="mx-8">
              <Image src="/logo/bonzo.png" alt="Medq" className="w-[100px] object-cover" width={768} height={245} />
            </div>

            <div className="mx-8">
              <Image src="/logo/hedera.png" alt="Medq" className="w-[150px] object-cover" width={1200} height={334} />
            </div>

            <div className="mx-8 mt-1">
              <Image src="/logo/saucer.png" alt="Medq" className="w-[150px] object-cover mt-3" width={1062} height={164} />
            </div>

            <div className="mx-8">
              <Image src="/logo/bonzo.png" alt="Medq" className="w-[100px] object-cover" width={768} height={245} />
            </div>

            <div className="mx-8">
              <Image src="/logo/hedera.png" alt="Medq" className="w-[150px] object-cover" width={1200} height={334} />
            </div>

            <div className="mx-8 mt-1">
              <Image src="/logo/saucer.png" alt="Medq" className="w-[150px] object-cover mt-3" width={1062} height={164} />
            </div>

            <div className="mx-8">
              <Image src="/logo/bonzo.png" alt="Medq" className="w-[100px] object-cover" width={768} height={245} />
            </div>
          </Marquee>
        </section>

        <section className="border-b border-[#1A1A1A]">
          <div className="">
            <div className="border-b border-[#1A1A1A] p-10">
              <h2 className="text-2xl font-semibold tracking-[0.16em] text-white md:text-3xl">
                3 SIMPLE STEPS
              </h2>
              <p className="mt-3 text-xs leading-relaxed text-zinc-400 md:text-sm">
                Join the ultimate DeFi quest platform. Complete on-chain tasks and earn
                rewards — all in a few simple steps.
              </p>
            </div>

            <div className="grid md:grid-cols-3">
              <div className="flex flex-col justify-between border-r border-[#1A1A1A] p-10">
                <div className="space-y-6">
                  <div className="flex items-center justify-center">
                    <div className="flex h-[150px] w-[150px] items-center justify-center text-white">
                      <ArrowRightLeft className="h-[100px] w-[100px]" />
                    </div>
                  </div>

                  <div className="space-y-1 text-left">
                    <span className="text-[11px] font-semibold tracking-[0.18em] text-zinc-500">
                      STEP 01
                    </span>
                    <h3 className="text-sm font-semibold text-white">
                      Accept &amp; Execute
                    </h3>
                    <p className="mt-2 text-xs leading-relaxed text-zinc-400">
                      Select a quest from the Medq platform and perform the required
                      on-chain action or swap on your favorite DeFi venue.
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex flex-col justify-between border-r border-[#1A1A1A] p-10">
                <div className="space-y-6">
                  <div className="flex items-center justify-center">
                    <div className="flex h-[150px] w-[150px] items-center justify-center text-white">
                      <FileCheck2 className="h-[100px] w-[100px]" />
                    </div>
                  </div>
                  <div className="space-y-1 text-left">
                    <span className="text-[11px] font-semibold tracking-[0.18em] text-zinc-500">
                      STEP 02
                    </span>
                    <h3 className="text-sm font-semibold text-white">
                      Automatic Verification
                    </h3>
                    <p className="mt-2 text-xs leading-relaxed text-zinc-400">
                      Once you complete the on-chain action, Medq automatically detects and
                      verifies your transaction via Hedera Mirror Node—no manual submission needed.
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex flex-col justify-between p-10">
                <div className="space-y-6">
                  <div className="flex items-center justify-center">
                    <div className="flex h-[150px] w-[150px] items-center justify-center text-white">
                      <Trophy className="h-[100px] w-[100px]" />
                    </div>
                  </div>
                  <div className="space-y-1 text-left">
                    <span className="text-[11px] font-semibold tracking-[0.18em] text-zinc-500">
                      STEP 03
                    </span>
                    <h3 className="text-sm font-semibold text-white">
                      Receive Rewards
                    </h3>
                    <p className="mt-2 text-xs leading-relaxed text-zinc-400">
                      Once verified, rewards are sent directly to your wallet
                      MEDQ, USDC (for partner quests), and exclusive commemorative NFTs.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section>
          <div>
            {/* Header */}
            <div className="space-y-3 p-10 border-b border-[#1A1A1A]">
              <h2 className="text-3xl font-semibold md:text-4xl">Active Campaigns.</h2>
              <p className="max-w-2xl text-xs leading-relaxed text-zinc-400 md:text-sm">
                Explore verified on-chain quests from the Hedera ecosystem. Complete tasks to
                earn MEDQ tokens and exclusive NFT collectibles.
              </p>
            </div>

            <div>
              <PartnershipCarousel showHeading={false} />
            </div>

            {/* Cards grid */}
            {/* <div className="grid md:grid-cols-2 lg:grid-cols-4">
              {activeCampaigns.map((campaign) => (
                <div
                  key={campaign.id}
                  className="flex h-full flex-col justify-between p-10 border-r border-b border-[#1A1A1A]"
                >
                  <div className="space-y-4">
                    <div className="flex items-center justify-between text-[10px] text-zinc-500">
                      <div className="inline-flex items-center gap-2">
                        <span
                          className={`flex h-7 w-7 items-center justify-center rounded-full text-xs ${campaign.codeBg} ${campaign.codeText}`}
                        >
                          {campaign.code}
                        </span>
                      </div>
                      <span className="rounded-full border border-zinc-700 px-2 py-0.5">
                        ID: {campaign.id}
                      </span>
                    </div>
                    <div className="space-y-2">
                      <h3 className="text-sm font-semibold text-white">
                        {campaign.title}
                      </h3>
                      <p className="text-xs leading-relaxed text-zinc-400">
                        {campaign.description}
                      </p>
                    </div>

                    <div className="mt-4 space-y-2 text-[11px]">
                      <div className="flex items-center justify-between text-zinc-500">
                        <span>REWARD</span>
                        <span className="text-xs font-semibold text-white">
                          {campaign.reward}
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-zinc-500">
                        <span>BONUS</span>
                        <span className="inline-flex items-center gap-1 text-xs text-white">
                          <span
                            className={`h-1.5 w-1.5 rounded-full ${campaign.bonusDot}`}
                          />
                          {campaign.bonusLabel}
                        </span>
                      </div>
                    </div>
                  </div>

                  <Button asChild variant="default" className="rounded mt-5 font-semibold bg-white text-black hover:bg-white/80">
                    <Link href={`/quests/${campaign.id}`}>
                      Join Quest
                      <MoveRight className="w-4 h-4" />
                    </Link>
                  </Button>
                </div>
              ))}
            </div> */}
          </div>
        </section>

        <FaqSection />

        <section className="relative overflow-hidden p-10">

          <div className="pointer-events-none absolute inset-0 z-10">
            <FaultyTerminal
              scale={1.5}
              gridMul={[2, 1]}
              digitSize={1.2}
              timeScale={0.5}
              pause={false}
              scanlineIntensity={0.5}
              glitchAmount={1}
              flickerAmount={1}
              noiseAmp={1}
              chromaticAberration={0}
              dither={0}
              curvature={0.1}
              tint="#f51414"
              mouseReact
              mouseStrength={0.5}
              pageLoadAnimation
              brightness={0.6}
              className="w-full h-full"
              style={{ width: '100%', height: '100%' }}
            />
          </div>

          <div className="mx-auto flex max-w-4xl flex-col items-start justify-between gap-6 md:flex-row md:items-center relative z-10">
            <div className="space-y-3">
              <p className="text-[11px] font-semibold tracking-[0.22em] text-sky-400">
                READY TO START
              </p>
              <h2 className="text-2xl font-semibold md:text-3xl">
                Ready to Begin Your Quest?
              </h2>
              <p className="max-w-xl text-xs leading-relaxed text-zinc-200 md:text-sm">
                Connect your wallet to start earning rewards, complete challenges, and join the community of DeFi enthusiasts.
              </p>
            </div>

            <div className="flex flex-col gap-3 md:flex-row">
              <Link href="/quests">
                <Button variant="default" className="rounded font-semibold bg-white text-black hover:bg-white/80">
                  Explore Quests
                  <MoveRight className="w-4 h-4" />
                </Button>
              </Link>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
