import Image from "next/image";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import {
  BadgeCheck,
  Calendar,
  ExternalLink,
  Info,
  MoveRight,
  Users,
} from "lucide-react";

type QuestRequirement = {
  id: string;
  title: string;
  subtitle: string;
  statusLabel: string;
  actionLabel?: string;
  completed?: boolean;
};

type QuestDetail = {
  id: string;
  partner: string;
  partnerLogoSrc?: string;
  verified?: boolean;
  title: string;
  subtitle: string;
  participants: number;
  startAt: string;
  endAt: string;
  heroImageSrc?: string;
  description: string;
  rewards: {
    nftBadgeTitle: string;
    nftBadgeSubtitle: string;
    tokenAllocationTitle: string;
    tokenAllocationSubtitle: string;
  };
  statusLabel: string;
  eligibilityLabel: string;
  howItWorks: string[];
  requirements: QuestRequirement[];
};

const QUESTS: QuestDetail[] = [
  {
    id: "mecca",
    partner: "MECCA",
    partnerLogoSrc: "https://github.com/evilrabbit.png",
    verified: true,
    title: "MECCA, KOLs, & SHOW TOKEN",
    subtitle: "Strategic Collaboration — $3,000 in Raffle Event",
    participants: 24812,
    startAt: "2026/03/04 08:00",
    endAt: "2026/04/07 08:00 (GMT+07:00)",
    heroImageSrc: "/images/partner-img-4.jpg",
    description:
      "An official collaboration between MECCA, KOLs, and SHOW TOKEN to expand Web3 adoption through community engagement and token-based rewards. Complete on-chain and social tasks to qualify for the raffle pool.",
    rewards: {
      nftBadgeTitle: "Medq × Mecca Genesis",
      nftBadgeSubtitle: "LIMITED EDITION",
      tokenAllocationTitle: "3,000 $MEDQ",
      tokenAllocationSubtitle: "RAFFLE ENTRY PER TASK COMPLETED",
    },
    statusLabel: "NOT ELIGIBLE",
    eligibilityLabel: "Complete tasks to claim",
    howItWorks: [
      "Complete all mandatory tasks to be eligible for the main raffle pool.",
      "Holding $MECCA tokens grants a 1.5x weight in the selection process.",
      "Winners will be announced via MEDQ Studio 48h after the event ends.",
    ],
    requirements: [
      {
        id: "passport",
        title: "Verify Medq Passport - Humanity Score",
        subtitle: "REQUIRES SCORE > 90",
        statusLabel: "COMPLETED",
        completed: true,
      },
      {
        id: "hold-mecca",
        title: "Hold min. 100 $MECCA Tokens",
        subtitle: "SNAPSHOT TAKEN EVERY 24H",
        statusLabel: "COMPLETED",
        completed: true,
      },
      {
        id: "follow-x",
        title: "Follow @Mecca_Official on X",
        subtitle: "SOCIAL VERIFICATION",
        statusLabel: "CONNECT X",
        actionLabel: "Connect X",
        completed: false,
      },
    ],
  },
];

type ExploreQuestCard = {
  id: string;
  imageSrc: string;
  badgeLeft: string;
  badgeRight?: string;
  eyebrow: string;
  headline: string;
  description: string;
  ctaLabel: string;
};

const EXPLORE_MORE_QUESTS: ExploreQuestCard[] = [
  {
    id: "piku-season-2",
    imageSrc: "/images/partner-img-3.jpg",
    badgeLeft: "PikuDAO",
    badgeRight: "Season 2",
    eyebrow: "Don’t miss",
    headline: "$10,000 PIKU",
    description: "Complete partner quests with PikuDAO to share in season rewards.",
    ctaLabel: "Join Quest",
  },
  {
    id: "exclusive-quests",
    imageSrc: "/images/partner-img-4.jpg",
    badgeLeft: "Plus & Score",
    badgeRight: "Featured",
    eyebrow: "Unlock exclusive quests",
    headline: "Access featured Medq campaigns",
    description:
      "Get early access to curated quests using Medq Score, Plus, and Smart Saving.",
    ctaLabel: "Join Quest",
  },
  {
    id: "lumio-season",
    imageSrc: "/images/partner-img-5.jpg",
    badgeLeft: "Lumio",
    badgeRight: "Season Quest",
    eyebrow: "Live now",
    headline: "Lumio Airdrop Season",
    description:
      "Complete social and on-chain actions with Lumio to earn bonus MEDQ points.",
    ctaLabel: "Join Quest",
  },
];

function formatCompact(n: number) {
  return Intl.NumberFormat("en", { notation: "compact" }).format(n);
}

function isRequirementCompleted(req: QuestRequirement) {
  if (typeof req.completed === "boolean") return req.completed;
  const status = req.statusLabel.trim().toLowerCase();
  return status === "complete" || status === "completed" || status === "done";
}

export default async function QuestDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const quest = QUESTS.find((q) => q.id === id) ?? QUESTS[0];
  const totalRequirements = quest.requirements.length;
  const completedRequirements = quest.requirements.filter(
    isRequirementCompleted
  ).length;
  const progressPct =
    totalRequirements === 0
      ? 0
      : (completedRequirements / totalRequirements) * 100;

  const exploreCards = EXPLORE_MORE_QUESTS.filter((c) => c.id !== quest.id);

  return (
    <main className="min-h-screen bg-black px-5 pb-20 pt-24 text-white md:px-10">
      <div className="mx-auto w-full space-y-8">
        {/* Hero */}
        <section className="space-y-4">
          <div className="flex flex-wrap items-center gap-2 text-sm font-medium text-zinc-400">
            <span className="inline-flex items-center gap-2 uppercase tracking-[0.14em]">
              <span className="relative h-8 w-8 overflow-hidden rounded-full bg-zinc-900 ring-1 ring-white/10">
                {quest.partnerLogoSrc ? (
                  <Image
                    src={quest.partnerLogoSrc}
                    alt={quest.partner}
                    fill
                    className="object-cover w-full h-full"
                  />
                ) : (
                  <span className="flex h-full w-full items-center justify-center text-[10px] font-semibold text-white">
                    {quest.partner.slice(0, 1)}
                  </span>
                )}
              </span>
              <span className="text-lg text-white">{quest.partner}</span>
              {quest.verified && (
                <BadgeCheck className="h-4 w-4 text-sky-300" />
              )}
            </span>
            <span className="text-zinc-600">•</span>
            <span className="inline-flex items-center gap-2">
              <Users className="h-4 w-4 text-zinc-500" />
              {formatCompact(quest.participants)}
            </span>
            <span className="text-zinc-600">•</span>
            <span className="inline-flex items-center gap-2">
              <Calendar className="h-4 w-4 text-zinc-500" />
              {quest.startAt} - {quest.endAt}
            </span>
          </div>

          <div className="space-y-1">
            <h1 className="text-2xl font-semibold md:text-4xl">{quest.title}</h1>
            <p className="text-base font-medium text-zinc-300 md:text-xl">
              {quest.subtitle}
            </p>
          </div>
        </section>

        {/* Main layout */}
        <section className="grid gap-6 lg:grid-cols-12">
          {/* Left */}
          <div className="space-y-6 lg:col-span-8">
            <div className="overflow-hidden rounded border border-[#1A1A1A] bg-black">
              <div className="relative aspect-video w-full bg-linear-to-b from-zinc-800/40 to-black">
                {quest.heroImageSrc ? (
                  <Image
                    src={quest.heroImageSrc}
                    alt={quest.title}
                    fill
                    className="object-cover opacity-70"
                    priority
                  />
                ) : null}
                <div className="absolute inset-0 bg-linear-to-t from-black via-black/40 to-transparent" />
              </div>

              <div className="p-5 md:p-6">
                <div className="inline-flex items-center gap-2 rounded bg-black/40 border border-[#1A1A1A] px-3 py-1 text-[10px] uppercase tracking-[0.14em] text-zinc-400">
                  Exclusive partnership campaign
                </div>

                <p className="mt-4 text-sm leading-relaxed text-zinc-300 md:text-[15px]">
                  {quest.description}
                </p>
              </div>
            </div>

            {/* Requirements */}
            <div className="space-y-3">
              {/* Progress */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="text-sm font-semibold text-white">
                    Quest Progress
                  </div>
                  <div className="text-xs font-semibold text-zinc-500">
                    {completedRequirements}/{totalRequirements}
                  </div>
                </div>
                <div className="h-2 w-full bg-[#1A1A1A]">
                  <div
                    className="h-full bg-emerald-500 transition-[width] duration-500 ease-out"
                    style={{ width: `${progressPct}%` }}
                  />
                </div>
              </div>

              <div className="flex items-center justify-between gap-3">
                <h2 className="text-sm font-semibold text-white md:text-base">
                  Requirements
                </h2>
                <span className="text-[10px] uppercase tracking-[0.16em] text-zinc-500">
                  Complete all tasks below
                </span>
              </div>

              <div className="space-y-3">
                {quest.requirements.map((req) => (
                  (() => {
                    const done = isRequirementCompleted(req);
                    return (
                  <div
                    key={req.id}
                    className="flex flex-col gap-3 rounded border border-[#1A1A1A] bg-black p-4 md:flex-row md:items-center md:justify-between"
                  >
                    <div className="flex items-start gap-3">
                      <span className="mt-0.5 inline-flex h-8 w-8 items-center justify-center rounded bg-zinc-900 text-zinc-300">
                        <Info className="h-4 w-4" />
                      </span>
                      <div className="space-y-1">
                        <div className="text-sm font-medium text-white">
                          {req.title}
                        </div>
                        <div className="text-[10px] uppercase tracking-[0.16em] text-zinc-500">
                          {req.subtitle}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-end gap-3">
                      {done ? (
                        <span className="rounded border border-emerald-500/30 bg-emerald-500/10 px-3 py-2 text-[10px] font-semibold uppercase tracking-[0.16em] text-emerald-300">
                          Completed
                        </span>
                      ) : req.actionLabel ? (
                        <Button
                          variant="default"
                          size="sm"
                          className="rounded bg-white text-black hover:bg-white/80"
                        >
                          {req.actionLabel}
                          <ExternalLink className="h-4 w-4" />
                        </Button>
                      ) : (
                        <span className="rounded border border-zinc-700 px-3 py-2 text-[10px] font-semibold uppercase tracking-[0.16em] text-zinc-400">
                          {req.statusLabel}
                        </span>
                      )}
                    </div>
                  </div>
                    );
                  })()
                ))}
              </div>
            </div>
          </div>

          {/* Right sidebar */}
          <aside className="space-y-4 lg:col-span-4">
            <div className="rounded border border-[#1A1A1A] bg-black">
              <div className="border-b border-[#1A1A1A] p-5">
                <div className="text-xs font-semibold uppercase tracking-[0.16em] text-zinc-500">
                  Quest rewards
                </div>
              </div>

              <div className="space-y-4 p-5">
                <div className="space-y-1">
                  <div className="text-[10px] uppercase tracking-[0.16em] text-zinc-500">
                    NFT Badge
                  </div>
                  <div className="text-sm font-semibold text-white">
                    {quest.rewards.nftBadgeTitle}
                  </div>
                  <div className="text-[10px] uppercase tracking-[0.16em] text-emerald-400">
                    {quest.rewards.nftBadgeSubtitle}
                  </div>
                </div>

                <div className="space-y-1">
                  <div className="text-[10px] uppercase tracking-[0.16em] text-zinc-500">
                    Token allocation
                  </div>
                  <div className="text-sm font-semibold text-white">
                    {quest.rewards.tokenAllocationTitle}
                  </div>
                  <div className="text-[10px] uppercase tracking-[0.16em] text-zinc-500">
                    {quest.rewards.tokenAllocationSubtitle}
                  </div>
                </div>

                <div className="space-y-2 pt-2 text-[11px]">
                  <div className="flex items-center justify-between text-zinc-500">
                    <span>Status</span>
                    <span className="text-xs font-semibold text-rose-400">
                      {quest.statusLabel}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-zinc-500">
                    <span>Total participants</span>
                    <span className="text-xs font-semibold text-white">
                      {quest.participants.toLocaleString("en")}
                    </span>
                  </div>
                </div>

                <Button
                  variant="default"
                  className="w-full rounded bg-zinc-800 text-zinc-300 hover:bg-zinc-800/80"
                  disabled
                >
                  {quest.eligibilityLabel}
                </Button>
              </div>
            </div>

            <div className="rounded border border-[#1A1A1A] bg-black p-5">
              <div className="mb-3 text-xs font-semibold uppercase tracking-[0.16em] text-zinc-500">
                How it works
              </div>
              <ul className="space-y-2 text-sm text-zinc-400">
                {quest.howItWorks.map((line) => (
                  <li key={line} className="flex gap-2">
                    <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-zinc-600" />
                    <span className="leading-relaxed">{line}</span>
                  </li>
                ))}
              </ul>
            </div>
          </aside>
        </section>

        {/* Explore more quests */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold md:text-2xl">
              Explore more quests
            </h2>
          </div>

          <div className="grid gap-4 lg:grid-cols-3">
            {exploreCards.slice(0, 3).map((card) => (
              <article key={card.id} className="w-full">
                <div className="flex h-full flex-col justify-between rounded border border-[#1A1A1A] bg-[#18181B] px-6 py-6">
                  <div className="relative h-48 w-full overflow-hidden rounded">
                    <Image
                      src={card.imageSrc}
                      alt={card.headline}
                      fill
                      className="object-cover"
                    />
                  </div>

                  <div className="mt-6 space-y-3 text-center md:text-left">
                    <div className="flex items-center justify-between text-[11px] font-medium text-zinc-400">
                      <span className="rounded bg-black/40 px-3 py-1 text-xs uppercase tracking-[0.14em]">
                        {card.badgeLeft}
                      </span>
                      {card.badgeRight && (
                        <span className="rounded bg-sky-500/10 px-3 py-1 text-[10px] uppercase tracking-[0.14em] text-sky-300">
                          {card.badgeRight}
                        </span>
                      )}
                    </div>

                    <div className="space-y-2">
                      <p className="text-[11px] uppercase tracking-[0.16em] text-zinc-500">
                        {card.eyebrow}
                      </p>
                      <p className="text-3xl font-semibold text-sky-300">
                        {card.headline}
                      </p>
                      <p className="text-xs text-zinc-400">
                        {card.description}
                      </p>
                    </div>
                  </div>

                  <Button
                    asChild
                    variant="default"
                    className="rounded mt-6 font-semibold text-black bg-sky-500 hover:bg-sky-400"
                  >
                    <Link href={`/quests/${card.id}`}>
                      {card.ctaLabel}
                      <MoveRight className="w-4 h-4" />
                    </Link>
                  </Button>
                </div>
              </article>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}
