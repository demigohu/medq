"use client";

import { useState } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight, MoveRight } from "lucide-react";
import { useIsTablet } from "@/hooks/breakpoint";
import { Button } from "./ui/button";
import Link from "next/link";

type PartnershipCard = {
  id: string;
  imageSrc: string;
  badgeLeft: string;
  badgeRight?: string;
  eyebrow: string;
  headline: string;
  description: string;
  ctaLabel: string;
};

const PARTNERSHIP_CARDS: PartnershipCard[] = [
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
  {
    id: "piku-season-3",
    imageSrc: "/images/partner-img-3.jpg",
    badgeLeft: "PikuDAO",
    badgeRight: "Season 2",
    eyebrow: "Don’t miss",
    headline: "$10,000 PIKU",
    description: "Complete partner quests with PikuDAO to share in season rewards.",
    ctaLabel: "Join Quest",
  },
  {
    id: "exclusive-quests-2",
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
    id: "lumio-season-1",
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

export default function PartnershipCarousel() {
  const isTablet = useIsTablet();
  const CARDS_PER_SLIDE = isTablet ? 1 : 3;

  const totalSlides = Math.max(
    1,
    PARTNERSHIP_CARDS.length - CARDS_PER_SLIDE + 1
  );
  const [index, setIndex] = useState(0);

  const prev = () =>
    setIndex((current) =>
      current === 0 ? totalSlides - 1 : current - 1
    );
  const next = () =>
    setIndex((current) =>
      current === totalSlides - 1 ? 0 : current + 1
    );

  return (
    <section className="space-y-4">
      <h1 className="text-xl font-semibold md:text-2xl">Partnership Quests</h1>

      <div className="relative">
        {/* Track */}
        <div className="overflow-hidden gap-4 py-4 rounded border border-[#1A1A1A] bg-black">
          <div
            className="flex transition-transform duration-500 ease-out"
            style={{
              transform: `translateX(-${(index * 100) / CARDS_PER_SLIDE
                }%)`,
            }}
          >
            {PARTNERSHIP_CARDS.map((card) => (
              <article
                key={card.id}
                className="w-full shrink-0 px-2 lg:w-1/3"
              >
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
        </div>

        {/* Arrows */}
        <button
          type="button"
          onClick={prev}
          className="cursor-pointer absolute left-0 top-1/2 -translate-y-1/2 translate-x-[-40%] rounded-full bg-white/90 p-2 text-black shadow-lg hover:bg-white"
          aria-label="Previous partnership quest"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>
        <button
          type="button"
          onClick={next}
          className="cursor-pointer absolute right-0 top-1/2 -translate-y-1/2 -translate-x-[-40%] rounded-full bg-white/90 p-2 text-black shadow-lg hover:bg-white"
          aria-label="Next partnership quest"
        >
          <ChevronRight className="h-4 w-4" />
        </button>

        {/* Dots */}
        <div className="mt-4 flex justify-center gap-2">
          {Array.from({ length: totalSlides }).map((_, i) => (
            <button
              key={i}
              type="button"
              onClick={() => setIndex(i)}
              className={`h-1.5 w-4 rounded-full transition-colors ${i === index ? "bg-white" : "bg-zinc-700"
                }`}
              aria-label={`Go to slide ${i + 1}`}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

