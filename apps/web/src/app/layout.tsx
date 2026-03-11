import type { Metadata } from "next";
import { Space_Mono, Matemasie } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/navbar";
import Footer from "@/components/footer";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Providers } from "@/lib/providers";

const spaceMono = Space_Mono({
  variable: "--font-space-mono",
  subsets: ["latin"],
  weight: ["400", "700"],
});

const matemasie = Matemasie({
  variable: "--font-matemasie",
  subsets: ["latin"],
  weight: ["400"],
});

export const metadata: Metadata = {
  title: "Medq - Ultimate DeFi Quest Platform",
  description: "Complete quests, earn rewards, and grow your on-chain health reputation.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="scrollbar-hide">
      <body
        className={`${spaceMono.variable} ${matemasie.variable} font-mono antialiased bg-black`}
      >
        <Providers>
          <TooltipProvider>{children}</TooltipProvider>
        </Providers>
      </body>
    </html>
  );
}
