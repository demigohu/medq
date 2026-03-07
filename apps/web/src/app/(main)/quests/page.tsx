"use client";

import PartnershipCarousel from "@/components/partnership-carousel";
import { Button } from "@/components/ui/button";
import { MoveRight } from "lucide-react";
import Link from "next/link";
import { useAllQuests, useUserQuests } from "@/hooks/useQuests";
import { useWallet } from "@/hooks/useWallet";

const CATEGORY_STYLE: Record<string, { code: string; codeBg: string; codeText: string; bonusDot: string }> = {
  swap: { code: "SW", codeBg: "bg-sky-500/15", codeText: "text-sky-400", bonusDot: "bg-sky-400" },
  liquidity: { code: "LP", codeBg: "bg-sky-500/15", codeText: "text-sky-400", bonusDot: "bg-emerald-400" },
  stake: { code: "ST", codeBg: "bg-indigo-500/15", codeText: "text-indigo-400", bonusDot: "bg-indigo-400" },
  lend: { code: "L", codeBg: "bg-indigo-500/15", codeText: "text-indigo-400", bonusDot: "bg-sky-400" },
};

function mapQuestToCard(q: Record<string, unknown>, idx: number) {
  const cat = String(q.category || "swap").toLowerCase();
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

const PARTNERSHIP_QUESTS = [
    {
        id: "global-dollar",
        partner: "Global Dollar Network",
        title: "The Global Dollar Experience",
        description:
            "Engage, learn, earn USDG – a L1 USD-backed stablecoin engineered for security.",
        points: "100 Points",
        cta: "Explore",
    },
    {
        id: "pikudao",
        partner: "PikuDAO",
        title: "$10,000 PIKU",
        description: "Seasonal quest with boosted rewards for active liquidity providers.",
        points: "Featured",
        cta: "Join Quest",
    },
    {
        id: "exclusive",
        partner: "Medq Plus",
        title: "Unlock Exclusive Quests",
        description:
            "Access featured quests with Medq Score, Plus & Smart Saving for power users.",
        points: "Invite only",
        cta: "Upgrade Now",
    },
] as const;

const FALLBACK_QUEST = {
    id: "0",
    code: "LP",
    codeBg: "bg-sky-500/15",
    codeText: "text-sky-400",
    title: "No quests available",
    description: "Connect your wallet or check back later for new quests.",
    reward: "— MEDQ",
    bonusDot: "bg-emerald-400",
    bonusLabel: "Badge NFT",
};

export default function QuestsPage() {
    const { address, isConnected } = useWallet();
    const { quests: userQuests } = useUserQuests(isConnected ? address : null);
    const { quests: allQuests } = useAllQuests(isConnected ? address : null);

    const dailyQuests = userQuests?.daily
        ? [mapQuestToCard(userQuests.daily as Record<string, unknown>, 0)]
        : allQuests.length > 0
            ? allQuests.slice(0, 4).map((q, i) => mapQuestToCard(q, i))
            : [FALLBACK_QUEST];

    const weeklyQuests = userQuests?.weekly
        ? [mapQuestToCard(userQuests.weekly as Record<string, unknown>, 0)]
        : allQuests.length > 4
            ? allQuests.slice(4, 6).map((q, i) => mapQuestToCard(q, i + 4))
            : allQuests.slice(0, 2).map((q, i) => mapQuestToCard(q, i));

    return (
        <main className="min-h-screen bg-black px-5 pb-20 pt-24 text-white md:px-10">
            <div className="space-y-12">
                {/* Partnership Quests as carousel */}
                <PartnershipCarousel />

                {/* Daily Quests */}
                <section className="space-y-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3 text-xs">
                            <h2 className="text-base font-semibold md:text-lg">Daily Quests</h2>
                            <span className="rounded border border-zinc-700 px-2 py-0.5 text-[10px] uppercase tracking-[0.16em] text-zinc-400">
                                Reset in 12h
                            </span>
                        </div>

                        {/* <button className="flex items-center gap-1 text-[11px] font-semibold tracking-[0.16em] text-zinc-400 hover:text-white">
                            View All <span>→</span>
                        </button> */}
                    </div>

                    <div className="grid gap-4 md:grid-cols-4">
                        {dailyQuests.map((quest) => (
                            <div
                                key={quest.id}
                                className="flex h-full flex-col justify-between p-6 border border-[#1A1A1A] rounded"
                            >
                                <div className="space-y-4">
                                    <div className="flex items-center justify-between text-[10px] text-zinc-500">
                                        <div className="inline-flex items-center gap-2">
                                            <span
                                                className={`flex h-7 w-7 items-center justify-center rounded-full text-xs ${quest.codeBg} ${quest.codeText}`}
                                            >
                                                {quest.code}
                                            </span>
                                        </div>
                                        <span className="rounded border border-zinc-700 px-2 py-0.5">
                                            ID: {quest.id}
                                        </span>
                                    </div>
                                    <div className="space-y-2">
                                        <h3 className="text-sm font-semibold text-white">
                                            {quest.title}
                                        </h3>
                                        <p className="text-xs leading-relaxed text-zinc-400">
                                            {quest.description}
                                        </p>
                                    </div>

                                    <div className="mt-4 space-y-2 text-[11px]">
                                        <div className="flex items-center justify-between text-zinc-500">
                                            <span>REWARD</span>
                                            <span className="text-xs font-semibold text-white">
                                                {quest.reward}
                                            </span>
                                        </div>
                                        <div className="flex items-center justify-between text-zinc-500">
                                            <span>BONUS</span>
                                            <span className="inline-flex items-center gap-1 text-xs text-white">
                                                <span
                                                    className={`h-1.5 w-1.5 rounded-full ${quest.bonusDot}`}
                                                />
                                                {quest.bonusLabel}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                {/* <button className="mt-5 inline-flex h-9 w-full items-center justify-center rounded bg-white text-[11px] font-semibold tracking-[0.16em] text-black hover:bg-zinc-200">
                                    JOIN QUEST &rarr;
                                </button> */}
                                <Button asChild variant="default" className="rounded mt-5 font-semibold bg-white text-black hover:bg-white/80">
                                    <Link href={`/quests/${quest.id}`}>
                                        Join Quest
                                        <MoveRight className="w-4 h-4" />
                                    </Link>
                                </Button>
                            </div>
                        ))}
                    </div>
                </section>

                {/* Weekly Quests */}
                <section className="space-y-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3 text-xs">
                            <h2 className="text-base font-semibold md:text-lg">Weekly Quests</h2>
                            <span className="rounded border border-zinc-700 px-2 py-0.5 text-[10px] uppercase tracking-[0.16em] text-zinc-400">
                                Reset in 5 days
                            </span>
                        </div>

                        {/* <div className="flex items-center gap-4 text-[11px] text-zinc-500">
                            <button className="border-b border-white pb-0.5 text-white">
                                All Quests
                            </button>
                            <button>Governance</button>
                            <button>Liquidity</button>
                        </div> */}
                    </div>

                    <div className="grid gap-4 md:grid-cols-2">
                        {weeklyQuests.map((quest) => (
                            <div
                                key={quest.id}
                                className="flex h-full flex-col justify-between p-6 border border-[#1A1A1A] rounded"
                            >
                                <div className="space-y-4">
                                    <div className="flex items-center justify-between text-[10px] text-zinc-500">
                                        <div className="inline-flex items-center gap-2">
                                            <span
                                                className={`flex h-7 w-7 items-center justify-center rounded text-xs ${quest.codeBg} ${quest.codeText}`}
                                            >
                                                {quest.code}
                                            </span>
                                        </div>
                                        <span className="rounded border border-zinc-700 px-2 py-0.5">
                                            ID: {quest.id}
                                        </span>
                                    </div>
                                    <div className="space-y-2">
                                        <h3 className="text-sm font-semibold text-white">
                                            {quest.title}
                                        </h3>
                                        <p className="text-xs leading-relaxed text-zinc-400">
                                            {quest.description}
                                        </p>
                                    </div>

                                    <div className="mt-4 space-y-2 text-[11px]">
                                        <div className="flex items-center justify-between text-zinc-500">
                                            <span>REWARD</span>
                                            <span className="text-xs font-semibold text-white">
                                                {quest.reward}
                                            </span>
                                        </div>
                                        <div className="flex items-center justify-between text-zinc-500">
                                            <span>BONUS</span>
                                            <span className="inline-flex items-center gap-1 text-xs text-white">
                                                <span
                                                    className={`h-1.5 w-1.5 rounded-full ${quest.bonusDot}`}
                                                />
                                                {quest.bonusLabel}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                {/* <button className="mt-5 inline-flex h-9 w-full items-center justify-center rounded bg-white text-[11px] font-semibold tracking-[0.16em] text-black hover:bg-zinc-200">
                                    JOIN QUEST &rarr;
                                </button> */}
                                <Button asChild variant="default" className="rounded mt-5 font-semibold bg-white text-black hover:bg-white/80">
                                    <Link href={`/quests/${quest.id}`}>
                                        Join Quest
                                        <MoveRight className="w-4 h-4" />
                                    </Link>
                                </Button>
                            </div>
                        ))}
                    </div>
                </section>
            </div>
        </main>
    );
}
