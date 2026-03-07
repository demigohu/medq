"use client";

import { useMemo } from "react";
import Image from "next/image";
import { useLeaderboard } from "@/hooks/useLeaderboard";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";
import { OrbitingCircles } from "@/components/ui/orbiting-circles";
import {
    BadgeCheck,
    ChevronLeft,
    ChevronRight,
    Crown,
    Diamond,
    File,
    Lock,
    Rocket,
    Search,
    Settings,
    Sparkles,
    Star,
    TrendingUp,
    Trophy,
    Users,
    Wallet,
} from "lucide-react";
import { useIsMobile } from "@/hooks/breakpoint";

type LeaderRow = {
    rank: number;
    name: string;
    handle: string;
    avatarSrc: string;
    level: number;
    xp: number;
    deltaToday?: number;
    distribution: { defi: number; social: number; nft: number };
    trendPct?: number;
};

function mapApiToLeaderRow(entry: { rank: number; name?: string; wallet_address: string; level: number; total_xp: number; avatar_url?: string }, idx: number): LeaderRow {
    const shortAddr = `${entry.wallet_address.slice(0, 6)}...${entry.wallet_address.slice(-4)}`;
    return {
        rank: entry.rank ?? idx + 1,
        name: entry.name || `User ${shortAddr}`,
        handle: shortAddr,
        avatarSrc: entry.avatar_url || "/images/dummy-img-1.png",
        level: entry.level,
        xp: entry.total_xp,
        distribution: { defi: 50, social: 30, nft: 20 },
    };
}

const FALLBACK_LEADERBOARD: LeaderRow[] = [
    {
        rank: 1,
        name: "HederaMaster",
        handle: "0xA...B52",
        avatarSrc: "/images/dummy-img-1.png",
        level: 99,
        xp: 1240500,
        deltaToday: 412,
        distribution: { defi: 62, social: 28, nft: 10 },
        trendPct: 12.1,
    },
    {
        rank: 2,
        name: "CryptoKing",
        handle: "0x12...F81",
        avatarSrc: "/images/dummy-img-2.png",
        level: 95,
        xp: 1180200,
        distribution: { defi: 54, social: 34, nft: 12 },
        trendPct: 6.4,
    },
    {
        rank: 3,
        name: "QuestSeeker",
        handle: "0x9C...221",
        avatarSrc: "https://github.com/evilrabbit.png",
        level: 92,
        xp: 950400,
        distribution: { defi: 41, social: 44, nft: 15 },
        trendPct: 3.2,
    },
    {
        rank: 4,
        name: "HBAR_Warrior",
        handle: "0x2D...E40",
        avatarSrc: "/images/partner-img-1.jpg",
        level: 88,
        xp: 820100,
        distribution: { defi: 58, social: 30, nft: 12 },
    },
    {
        rank: 5,
        name: "Web3Wizard",
        handle: "0x88...712",
        avatarSrc: "/images/partner-img-2.jpg",
        level: 85,
        xp: 790000,
        distribution: { defi: 45, social: 40, nft: 15 },
    },
    {
        rank: 6,
        name: "Web3Wizard",
        handle: "0x88...712",
        avatarSrc: "/images/partner-img-2.jpg",
        level: 85,
        xp: 790000,
        distribution: { defi: 50, social: 35, nft: 15 },
    },
    {
        rank: 7,
        name: "Web3Wizard",
        handle: "0x88...712",
        avatarSrc: "/images/partner-img-2.jpg",
        level: 85,
        xp: 790000,
        distribution: { defi: 30, social: 55, nft: 15 },
    },
    {
        rank: 8,
        name: "Web3Wizard",
        handle: "0x88...712",
        avatarSrc: "/images/partner-img-2.jpg",
        level: 85,
        xp: 790000,
        distribution: { defi: 25, social: 45, nft: 30 },
    },
    {
        rank: 9,
        name: "Web3Wizard",
        handle: "0x88...712",
        avatarSrc: "/images/partner-img-2.jpg",
        level: 85,
        xp: 790000,
        distribution: { defi: 62, social: 20, nft: 18 },
    },
    {
        rank: 10,
        name: "Web3Wizard",
        handle: "0x88...712",
        avatarSrc: "/images/partner-img-2.jpg",
        level: 85,
        xp: 790000,
        distribution: { defi: 35, social: 40, nft: 25 },
    },
];

const LEADERBOARD_META = {
    totalXpEarned: 124802950,
    activeQuesters: 24812,
    seasonRewardsPool: 125000,
    seasonRewardsUnit: "USDT",
};

function formatNumber(n: number) {
    return Intl.NumberFormat("en").format(n);
}

function formatCompact(n: number) {
    return Intl.NumberFormat("en", {
        notation: "compact",
        maximumFractionDigits: 1,
    }).format(n);
}

function rankBadgeClass(rank: number) {
    if (rank === 1) return "bg-amber-500/15 text-amber-300 border-amber-500/20";
    if (rank === 2) return "bg-zinc-500/15 text-zinc-200 border-zinc-500/25";
    if (rank === 3) return "bg-orange-500/15 text-orange-300 border-orange-500/20";
    return "bg-zinc-900 text-zinc-300 border-[#1A1A1A]";
}

function rankCardAccent(rank: number) {
    if (rank === 1) return "from-amber-500/15 via-black to-black";
    if (rank === 2) return "from-zinc-300/10 via-black to-black";
    return "from-orange-500/15 via-black to-black";
}

function TopStatsStrip() {
    return (
        <div className="grid gap-4 md:grid-cols-3">
            <div className="relative overflow-hidden rounded border border-[#1A1A1A] bg-black p-5">
                <div className="pointer-events-none absolute inset-0 bg-linear-to-b from-white/5 via-black to-black" />
                <div className="relative flex items-center justify-between gap-4">
                    <div className="space-y-1">
                        <div className="text-[10px] font-semibold uppercase tracking-[0.16em] text-zinc-500">
                            Total XP earned
                        </div>
                        <div className="text-2xl font-semibold text-white">
                            {formatNumber(LEADERBOARD_META.totalXpEarned)}
                        </div>
                    </div>
                    <span className="grid h-10 w-10 place-items-center rounded border border-[#1A1A1A] bg-[#18181B] text-zinc-200">
                        <TrendingUp className="h-4 w-4" />
                    </span>
                </div>
            </div>

            <div className="relative overflow-hidden rounded border border-[#1A1A1A] bg-black p-5">
                <div className="pointer-events-none absolute inset-0 bg-linear-to-b from-white/5 via-black to-black" />
                <div className="relative flex items-center justify-between gap-4">
                    <div className="space-y-1">
                        <div className="text-[10px] font-semibold uppercase tracking-[0.16em] text-zinc-500">
                            Active questers
                        </div>
                        <div className="text-2xl font-semibold text-white">
                            {formatNumber(LEADERBOARD_META.activeQuesters)}
                        </div>
                    </div>
                    <span className="grid h-10 w-10 place-items-center rounded border border-[#1A1A1A] bg-[#18181B] text-sky-200">
                        <Users className="h-4 w-4" />
                    </span>
                </div>
            </div>

            <div className="relative overflow-hidden rounded border border-[#1A1A1A] bg-black p-5">
                <div className="pointer-events-none absolute inset-0 bg-linear-to-b from-white/5 via-black to-black" />
                <div className="relative flex items-center justify-between gap-4">
                    <div className="space-y-1">
                        <div className="text-[10px] font-semibold uppercase tracking-[0.16em] text-zinc-500">
                            REWARDS DISTRIBUTED
                        </div>
                        <div className="text-2xl font-semibold text-white">
                            {formatCompact(LEADERBOARD_META.seasonRewardsPool)}{" "}
                            {LEADERBOARD_META.seasonRewardsUnit}
                        </div>
                    </div>
                    <span className="grid h-10 w-10 place-items-center rounded border border-[#1A1A1A] bg-[#18181B] text-emerald-200">
                        <Wallet className="h-4 w-4" />
                    </span>
                </div>
            </div>
        </div>
    );
}

function OrbitProfile({
    row,
}: {
    row: Pick<LeaderRow, "rank" | "name" | "avatarSrc">;
}) {
    return (
        <div>
            <div className="flex h-full w-full flex-col items-center justify-center gap-2 rounded p-2 text-center">
                <div className="relative h-10 w-10 overflow-hidden rounded">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                        src={row.avatarSrc}
                        alt={row.name}
                        className="object-cover w-full h-full"
                    />
                </div>
                <div className="space-y-0.5">
                    <div className="text-[9px] font-semibold uppercase tracking-[0.16em] text-zinc-500">
                        Rank {row.rank}
                    </div>
                    <div className="truncate text-[11px] font-semibold text-zinc-200">
                        {row.name}
                    </div>
                </div>
            </div>
        </div>
    );
}

function HallOfFameOrbit({ rows }: { rows: LeaderRow[] }) {
    const isMobile = useIsMobile();
    const first = rows.find((r) => r.rank === 1) ?? rows[0];
    const orbiters1 = rows.filter((r) => r.rank >= 2 && r.rank <= 3);
    const orbiters2 = rows.filter((r) => r.rank >= 4 && r.rank <= 5);

    return (
        <section className="relative overflow-hidden rounded border border-[#1A1A1A] bg-black px-6 py-10">
            <div className="pointer-events-none absolute inset-0 bg-radial from-white/6 via-black to-black" />

            <div className="relative mx-auto max-w-4xl">
                <div className="text-center">
                    <div className="text-3xl font-semibold tracking-[0.12em] text-white md:text-4xl">
                        HALL OF FAME
                    </div>
                    <p className="mt-2 text-xs leading-relaxed text-zinc-500">
                        Top performers currently orbiting the Medq ecosystem.
                        <br />
                        Snapshots taken every 24h.
                    </p>
                </div>

                <div className="relative mx-auto mt-8 flex h-[700px] w-full max-w-3xl items-center justify-center overflow-hidden">
                    <OrbitingCircles radius={ isMobile ? 70 : 170} reverse>
                        {orbiters1.map((r) => (
                            <OrbitProfile key={r.rank} row={r} />
                        ))}
                    </OrbitingCircles>
                    {/* Orbiting ring */}
                    <OrbitingCircles radius={ isMobile ? 140 : 270} iconSize={92} duration={22}>
                        {orbiters2.map((r) => (
                            <OrbitProfile key={r.rank} row={r} />
                        ))}
                    </OrbitingCircles>



                    {/* Center */}
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                        <div className="mb-3 flex flex-col items-center">
                            <div className="relative overflow-hidden p-2 flex flex-col items-center justify-center">
                                <div className="relative h-16 w-16 overflow-hidden rounded">
                                    {/* eslint-disable-next-line @next/next/no-img-element */}
                                    <img
                                        src={first?.avatarSrc ?? "/images/dummy-img-1.png"}
                                        alt={first?.name ?? "Rank 1"}
                                        className="object-cover w-full h-full"
                                    />
                                </div>
                                <div className="mt-2 text-center">
                                    <div className="text-[9px] font-semibold uppercase tracking-[0.16em] text-zinc-500">
                                        Rank #1
                                    </div>
                                    <div className="inline-flex items-center justify-center gap-2 text-sm font-semibold text-white">
                                        {first?.name ?? "—"}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* <div className="grid h-16 w-16 place-items-center rounded-full border border-white/10 bg-white text-black shadow-[0_18px_60px_rgba(255,255,255,0.18)]">
                            <Rocket className="h-5 w-5" />
                        </div> */}
                    </div>
                </div>
            </div>
        </section>
    );
}

function QuestDistributionBar({
    distribution,
}: {
    distribution: LeaderRow["distribution"];
}) {
    const total = distribution.defi + distribution.social + distribution.nft;
    const defiPct = total === 0 ? 0 : (distribution.defi / total) * 100;
    const socialPct = total === 0 ? 0 : (distribution.social / total) * 100;
    const nftPct = Math.max(0, 100 - defiPct - socialPct);

    return (
        <div className="w-full max-w-[240px]">
            <div className="h-2 w-full overflow-hidden rounded-full bg-white/10">
                <div className="flex h-full">
                    <div className="h-full bg-white/60" style={{ width: `${defiPct}%` }} />
                    <div
                        className="h-full bg-sky-500"
                        style={{ width: `${socialPct}%` }}
                    />
                    <div
                        className="h-full bg-fuchsia-500"
                        style={{ width: `${nftPct}%` }}
                    />
                </div>
            </div>
        </div>
    );
}

function LeaderboardTable({ rows }: { rows: LeaderRow[] }) {
    return (
        <div className="overflow-hidden rounded border border-[#1A1A1A] bg-black">
            <Table className="w-full">
                <TableHeader>
                    <TableRow className="hover:bg-transparent">
                        <TableHead className="px-5 py-3 text-[10px] font-semibold uppercase tracking-[0.16em] text-zinc-500">
                            Rank
                        </TableHead>
                        <TableHead className="px-5 py-3 text-[10px] font-semibold uppercase tracking-[0.16em] text-zinc-500">
                            User
                        </TableHead>
                        <TableHead className="px-5 py-3 text-[10px] font-semibold uppercase tracking-[0.16em] text-zinc-500">
                            Level
                        </TableHead>
                        <TableHead className="px-5 py-3 text-[10px] font-semibold uppercase tracking-[0.16em] text-zinc-500">
                            Quest distribution
                        </TableHead>
                        <TableHead className="px-5 py-3 text-[10px] font-semibold uppercase tracking-[0.16em] text-zinc-500">
                            XP points
                        </TableHead>
                        <TableHead className="px-5 py-3 text-right text-[10px] font-semibold uppercase tracking-[0.16em] text-zinc-500">
                            Trend
                        </TableHead>
                    </TableRow>
                </TableHeader>

                <TableBody>
                    {rows.map((row) => (
                        <TableRow
                            key={row.rank}
                            className={cn(
                                "hover:bg-white/5",
                                row.rank <= 3 && "bg-white/3"
                            )}
                        >
                            <TableCell className="px-5 py-4 align-middle">
                                <span
                                    className={cn(
                                        "inline-flex h-8 w-8 items-center justify-center rounded border text-xs font-semibold",
                                        rankBadgeClass(row.rank)
                                    )}
                                >
                                    {row.rank}
                                </span>
                            </TableCell>

                            <TableCell className="px-5 py-4 align-middle">
                                <div className="flex items-center gap-3">
                                    <div className="relative h-10 w-10 overflow-hidden rounded border border-white/10 bg-zinc-900">
                                        {/* eslint-disable-next-line @next/next/no-img-element */}
                                        <img
                                            src={row.avatarSrc}
                                            alt={row.name}
                                            className="object-cover w-full h-full"
                                        />
                                    </div>
                                    <div className="min-w-0">
                                        <div className="inline-flex items-center gap-2 font-semibold text-white">
                                            <span className="truncate">{row.name}</span>
                                        </div>
                                        <div className="text-xs text-zinc-500">{row.handle}</div>
                                    </div>
                                </div>
                            </TableCell>

                            <TableCell className="px-5 py-4 align-middle">
                                <span className="inline-flex items-center rounded border border-[#1A1A1A] bg-[#18181B] px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-white">
                                    LVL {row.level}
                                </span>
                            </TableCell>

                            <TableCell className="px-5 py-4 align-middle">
                                <QuestDistributionBar distribution={row.distribution} />
                            </TableCell>

                            <TableCell className="px-5 py-4 align-middle">
                                <div className="space-y-1">
                                    <div className="text-sm font-semibold text-white">
                                        {formatNumber(row.xp)}
                                    </div>
                                    {typeof row.deltaToday === "number" ? (
                                        <div className="text-[11px] text-emerald-400">
                                            +{formatNumber(row.deltaToday)} today
                                        </div>
                                    ) : null}
                                </div>
                            </TableCell>

                            <TableCell className="px-5 py-4 text-right align-middle">
                                {typeof row.trendPct === "number" ? (
                                    <span className="text-[11px] font-semibold text-emerald-400">
                                        +{row.trendPct}%
                                    </span>
                                ) : (
                                    <span className="text-xs text-zinc-600">—</span>
                                )}
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>

            <div className="flex flex-col gap-3 border-t border-[#1A1A1A] px-5 py-4 text-xs text-zinc-500 md:flex-row md:items-center md:justify-between">
                <div>Showing 1-10 of 100 players</div>
                <div className="flex items-center justify-between gap-3 md:justify-end">
                    <div className="flex items-center gap-2">
                        <button
                            type="button"
                            className="grid h-9 w-9 place-items-center rounded border border-[#1A1A1A] bg-black text-zinc-300 hover:bg-white/5"
                            aria-label="Previous page"
                        >
                            <ChevronLeft className="h-4 w-4" />
                        </button>
                        {[1, 2, 3].map((p) => (
                            <button
                                key={p}
                                type="button"
                                className={cn(
                                    "grid h-9 w-9 place-items-center rounded border text-xs font-semibold",
                                    p === 1
                                        ? "border-sky-500/40 bg-sky-500/15 text-sky-100"
                                        : "border-[#1A1A1A] bg-black text-zinc-300 hover:bg-white/5"
                                )}
                                aria-current={p === 1 ? "page" : undefined}
                            >
                                {p}
                            </button>
                        ))}
                        <button
                            type="button"
                            className="grid h-9 w-11 place-items-center rounded border border-[#1A1A1A] bg-black text-xs font-semibold text-zinc-300 hover:bg-white/5"
                        >
                            10
                        </button>
                        <button
                            type="button"
                            className="grid h-9 w-9 place-items-center rounded border border-[#1A1A1A] bg-black text-zinc-300 hover:bg-white/5"
                            aria-label="Next page"
                        >
                            <ChevronRight className="h-4 w-4" />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

function CurrentUserRow() {
    const rank = 247;
    const xpApprox = 2850;
    const distribution = { defi: 40, social: 45, nft: 15 };
    const trendPct = 4.8;

    return (
        <div className="flex flex-col gap-3 rounded border border-[#1A1A1A] bg-black px-5 py-3 text-sm shadow-[0_0_0_1px_rgba(255,255,255,0.03)] md:flex-row md:items-center">
            {/* Rank */}
            <div className="flex items-center gap-3 md:w-[72px]">
                <span
                    className={cn(
                        "inline-flex h-8 w-8 items-center justify-center rounded border text-xs font-semibold",
                        rankBadgeClass(rank)
                    )}
                >
                    {rank}
                </span>
            </div>

            {/* User */}
            <div className="flex flex-1 items-center gap-3 md:min-w-[210px]">
                <div className="relative h-10 w-10 overflow-hidden rounded border border-white/10 bg-zinc-900">
                    <Image
                        src="/images/dummy-img-1.png"
                        alt="Your profile"
                        fill
                        className="object-cover"
                    />
                </div>
                <div className="min-w-0">
                    <div className="flex items-center gap-2">
                        <span className="truncate text-sm font-semibold text-white">
                            Eva
                        </span>
                        <span className="rounded-full border border-[#3F4248] bg-zinc-900 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.16em] text-zinc-300">
                            You
                        </span>
                    </div>
                    <div className="text-[11px] text-zinc-500">Level 8 • 12 quests</div>
                </div>
            </div>

            {/* Level */}
            <div className="md:w-[140px]">
                <span className="inline-flex items-center rounded border border-[#1A1A1A] bg-[#18181B] px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-white">
                    LVL 8
                </span>
            </div>

            {/* Distribution */}
            <div className="md:w-[260px]">
                <QuestDistributionBar distribution={distribution} />
            </div>

            {/* XP + trend */}
            <div className="flex flex-1 items-center justify-end gap-6 text-xs md:w-[170px] md:flex-none">
                <div className="space-y-1 text-right">
                    <div className="text-sm font-semibold text-white">
                        ~ {xpApprox.toLocaleString("en")} XP
                    </div>
                    <div className="text-[11px] text-zinc-500">Season progress</div>
                </div>
                <div className="text-right">
                    <span className="text-[11px] font-semibold text-emerald-400">
                        +{trendPct}%
                    </span>
                </div>
            </div>
        </div>
    );
}

export default function LeaderboardPage() {
    const { leaderboard, loading } = useLeaderboard(100);
    const leaderboardRows = useMemo(() => {
        if (leaderboard.length > 0) {
            return leaderboard.map((e, i) => mapApiToLeaderRow(e, i));
        }
        return FALLBACK_LEADERBOARD;
    }, [leaderboard]);

    return (
        <main className="min-h-screen bg-black px-5 pb-20 pt-24 text-white md:px-10">
            <div className="mx-auto w-full space-y-6">
                <TopStatsStrip />
                <HallOfFameOrbit rows={leaderboardRows} />

                <section className="space-y-3">
                    <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
                        <div>
                            <div className="text-sm font-semibold text-white">
                                FULL LEADERBOARD
                            </div>
                            <div className="text-[10px] font-semibold uppercase tracking-[0.16em] text-zinc-500">
                                Season 3 • All network players
                            </div>
                        </div>
                    </div>

                    <CurrentUserRow />

                    <LeaderboardTable rows={leaderboardRows} />
                </section>
            </div>
        </main>
    );
}
