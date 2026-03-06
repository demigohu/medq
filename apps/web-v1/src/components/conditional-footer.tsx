"use client";

import { usePathname } from "next/navigation";
import { Footer } from "./footer";

// Pages that should NOT show footer (they use sidebar instead)
const SIDEBAR_PAGES = ["/quests", "/leaderboard", "/profile"];

export function ConditionalFooter() {
  const pathname = usePathname();

  // Don't show footer on sidebar pages
  if (SIDEBAR_PAGES.some((page) => pathname?.startsWith(page))) {
    return null;
  }

  return <Footer />;
}

