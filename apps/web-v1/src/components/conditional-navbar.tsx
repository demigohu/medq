"use client";

import { usePathname } from "next/navigation";
import { Navbar } from "./navbar";

// Pages that should NOT show navbar (they use sidebar instead)
const SIDEBAR_PAGES = ["/quests", "/leaderboard", "/profile"];

export function ConditionalNavbar() {
  const pathname = usePathname();

  // Don't show navbar on sidebar pages
  if (SIDEBAR_PAGES.some((page) => pathname?.startsWith(page))) {
    return null;
  }

  return <Navbar />;
}

