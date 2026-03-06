import Image from "next/image";

export default function ProfilePage() {
  const profile = {
    name: "ethan_xlof",
    xHandle: "x_ethan66",
    wallet: "0x52ef...63B4",
    avatarSrc: "/images/dummy-img-1.png",
    level: 1,
    tierLabel: "Carbon",
    xpCurrent: 0,
    xpNeeded: 89,
    benefitsTitle: "YOUR BENEFITS",
    benefitsSubtitle: "Higher Level, Greater Benefits",
    xpValidDays: 30,
    stats: [
      { label: "XP POINTS", value: "2000", tone: "zinc" as const },
      { label: "CURRENT LEVEL", value: "10", tone: "zinc" as const },
      { label: "QUEST COMPLETED", value: "12", tone: "zinc" as const },
      { label: "LEADERBOARD RANK", value: "247", tone: "action" as const },
    ],
  };

  const dailyResetIn = "15:12:28";
  const weeklyResetIn = "4d 15:12:28";

  type QuestTask = {
    id: string;
    title: string;
    chips: string[];
    cta: string;
    fullWidth?: boolean;
  };

  const dailyQuests: QuestTask[] = [
    {
      id: "complete-quest",
      title: "Complete Quest in OAT, NFT or Loyalty Points",
      chips: ["+3", "+3"],
      cta: "Verify",
    },
    {
      id: "daily-checkin",
      title: "Daily Check-in",
      chips: ["+1"],
      cta: "Check-in",
    },
    {
      id: "custom-reward",
      title: "Complete Quest in Token, Custom Reward or Discord Role",
      chips: ["+3"],
      cta: "Verify",
      fullWidth: true,
    },
  ];

  const weeklyQuests: QuestTask[] = [
    {
      id: "weekly-streak",
      title: "Complete 5 quests this week",
      chips: ["+10"],
      cta: "View",
    },
    {
      id: "weekly-referral",
      title: "Invite 1 friend (weekly)",
      chips: ["+5"],
      cta: "Invite",
    },
  ];

  const partnershipQuests: QuestTask[] = [
    {
      id: "partner-quest-1",
      title: "Partnership Quest: Complete a featured partner quest",
      chips: ["+8"],
      cta: "Explore",
      fullWidth: true,
    },
  ];

  const xpPct =
    profile.xpNeeded === 0 ? 0 : (profile.xpCurrent / profile.xpNeeded) * 100;

  return (
    <main className="min-h-screen bg-black px-5 pb-20 pt-24 text-white md:px-10">
      <div className="mx-auto w-full max-w-7xl space-y-6">
        {/* Top identity bar */}
        <section className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-3">
            <div className="relative h-10 w-10 overflow-hidden rounded-full border border-white/10 bg-zinc-900">
              <Image
                src={profile.avatarSrc}
                alt={profile.name}
                fill
                className="object-cover"
              />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <div className="truncate text-sm font-semibold text-white">
                  {profile.name}
                </div>
              </div>
              <div className="flex flex-wrap items-center gap-2 text-[11px] text-zinc-500">
                <span className="inline-flex items-center gap-1">
                  <span className="h-1.5 w-1.5 rounded-full bg-sky-400" />
                  {profile.xHandle}
                </span>
                <span className="text-zinc-700">•</span>
                <span className="rounded border border-[#1A1A1A] bg-[#18181B] px-2 py-0.5 font-mono text-[10px] uppercase tracking-[0.16em] text-zinc-300">
                  {profile.wallet}
                </span>
              </div>
            </div>
          </div>

          <button
            type="button"
            className="inline-flex h-9 w-9 items-center justify-center rounded border border-[#1A1A1A] bg-black text-zinc-300 hover:bg-white/5"
            aria-label="Profile settings"
          >
            <span className="text-lg leading-none">⚙</span>
          </button>
        </section>

        {/* Level / benefits hero */}
        <section>
          <div className="relative overflow-hidden rounded border border-[#1A1A1A] bg-black p-5 lg:col-span-8">
            <div className="pointer-events-none absolute inset-0 bg-linear-to-r from-white/6 via-black to-black" />
            <div className="relative flex h-full flex-col justify-between gap-5 md:flex-row md:items-center">
              <div className="space-y-2">
                <div className="inline-flex items-center gap-2 text-sm font-semibold text-white">
                  <span className="grid h-8 w-8 place-items-center rounded border border-[#1A1A1A] bg-[#18181B] text-xs font-semibold text-zinc-200">
                    L{profile.level}
                  </span>
                  {profile.tierLabel}
                </div>
                <div className="text-[11px] text-zinc-500">
                  {profile.xpCurrent}/{profile.xpNeeded} XP
                </div>
                <div className="h-2 w-full max-w-md overflow-hidden rounded-full bg-[#1A1A1A]">
                  <div
                    className="h-full bg-white transition-[width] duration-500 ease-out"
                    style={{ width: `${xpPct}%` }}
                  />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Stats tiles */}
        <section className="grid gap-3 md:grid-cols-2 lg:grid-cols-4">
          {profile.stats.map((s) => (
            <div
              key={s.label}
              className="rounded border border-[#1A1A1A] bg-black p-4"
            >
              <div className="text-[10px] font-semibold uppercase tracking-[0.16em] text-sky-300/70">
                {s.label}
              </div>
              <div className="mt-3 flex items-center justify-between gap-3">
                {s.tone === "action" ? (
                  <button
                    type="button"
                    className="h-9 rounded border border-[#1A1A1A] bg-[#18181B] px-4 text-xs font-semibold text-white hover:bg-white/10"
                  >
                    {s.value}
                  </button>
                ) : (
                  <div className="text-sm font-semibold text-white">
                    {s.value}
                  </div>
                )}
              </div>
            </div>
          ))}
        </section>

        {/* Quests */}
        <section className="space-y-6">
          <div className="overflow-hidden rounded border border-[#1A1A1A] bg-black">
            <div className="border-b border-[#1A1A1A] p-5">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <div className="text-sm font-semibold text-white">
                    Completed Daily Quests
                  </div>
                  {/* <div className="mt-1 text-[11px] text-zinc-500">
                    Resets in: {dailyResetIn}
                  </div> */}
                </div>
              </div>
            </div>

            <div className="p-5">
              <div className="grid gap-4 md:grid-cols-2">
                {dailyQuests.map((t) => (
                  <div
                    key={t.id}
                    className={`rounded border border-[#1A1A1A] bg-[#0F0F10] p-4 ${t.fullWidth ? "md:col-span-2" : ""}`}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="space-y-3">
                        <div className="text-sm font-semibold text-white">
                          {t.title}
                        </div>
                        <div className="flex items-center gap-2 text-[11px] text-zinc-300">
                          {t.chips.map((c, idx) => (
                            <span
                              key={`${t.id}-${idx}`}
                              className="inline-flex items-center gap-1 rounded border border-[#1A1A1A] bg-black px-2 py-1"
                            >
                              <span className="h-2 w-2 rounded-sm bg-orange-500" />
                              {c}
                            </span>
                          ))}
                        </div>
                      </div>

                      <button
                        type="button"
                        className="h-9 rounded border border-[#1A1A1A] bg-[#18181B] px-4 text-xs font-semibold text-white hover:bg-white/10"
                      >
                        {t.cta}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="overflow-hidden rounded border border-[#1A1A1A] bg-black">
            <div className="border-b border-[#1A1A1A] p-5">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <div className="text-sm font-semibold text-white">
                    Completed Weekly Quests
                  </div>
                  {/* <div className="mt-1 text-[11px] text-zinc-500">
                    Resets in: {weeklyResetIn}
                  </div> */}
                </div>
              </div>
            </div>

            <div className="p-5">
              <div className="grid gap-4 md:grid-cols-2">
                {weeklyQuests.map((t) => (
                  <div
                    key={t.id}
                    className={`rounded border border-[#1A1A1A] bg-[#0F0F10] p-4 ${t.fullWidth ? "md:col-span-2" : ""}`}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="space-y-3">
                        <div className="text-sm font-semibold text-white">
                          {t.title}
                        </div>
                        <div className="flex items-center gap-2 text-[11px] text-zinc-300">
                          {t.chips.map((c, idx) => (
                            <span
                              key={`${t.id}-${idx}`}
                              className="inline-flex items-center gap-1 rounded border border-[#1A1A1A] bg-black px-2 py-1"
                            >
                              <span className="h-2 w-2 rounded-sm bg-orange-500" />
                              {c}
                            </span>
                          ))}
                        </div>
                      </div>

                      <button
                        type="button"
                        className="h-9 rounded border border-[#1A1A1A] bg-[#18181B] px-4 text-xs font-semibold text-white hover:bg-white/10"
                      >
                        {t.cta}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="overflow-hidden rounded border border-[#1A1A1A] bg-black">
            <div className="border-b border-[#1A1A1A] p-5">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <div className="text-sm font-semibold text-white">
                    Completed Partnership Quests
                  </div>
                  {/* <div className="mt-1 text-[11px] text-zinc-500">
                    Partner campaigns & special rewards
                  </div> */}
                </div>
              </div>
            </div>

            <div className="p-5">
              <div className="grid gap-4 md:grid-cols-2">
                {partnershipQuests.map((t) => (
                  <div
                    key={t.id}
                    className={`rounded border border-[#1A1A1A] bg-[#0F0F10] p-4 ${t.fullWidth ? "md:col-span-2" : ""}`}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="space-y-3">
                        <div className="text-sm font-semibold text-white">
                          {t.title}
                        </div>
                        <div className="flex items-center gap-2 text-[11px] text-zinc-300">
                          {t.chips.map((c, idx) => (
                            <span
                              key={`${t.id}-${idx}`}
                              className="inline-flex items-center gap-1 rounded border border-[#1A1A1A] bg-black px-2 py-1"
                            >
                              <span className="h-2 w-2 rounded-sm bg-orange-500" />
                              {c}
                            </span>
                          ))}
                        </div>
                      </div>

                      <button
                        type="button"
                        className="h-9 rounded border border-[#1A1A1A] bg-[#18181B] px-4 text-xs font-semibold text-white hover:bg-white/10"
                      >
                        {t.cta}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
      </div>
    </main>
  )
}
