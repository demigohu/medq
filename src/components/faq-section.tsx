'use client'

import { ChevronDown } from 'lucide-react'
import { useState } from 'react'

interface FAQItem {
  question: string
  answer: string
}

const faqItems: FAQItem[] = [
  {
    question: "What is Medq?",
    answer: "Medq is a gamified DeFi quest platform built on Hedera Testnet. Complete on-chain tasks like token swaps on SaucerSwap or lending on Bonzo Finance to earn MEDQ tokens, Badge NFTs, and XP points. Our AI-powered system generates personalized daily and weekly quests tailored to your DeFi journey."
  },
  {
    question: "How do I get started?",
    answer: "Connect your wallet to the App and ensure you're on Hedera Testnet. Complete your profile with your name and email, then browse available quests. Daily and weekly quests are automatically generated for you after profile completion. Accept a quest, complete the on-chain action (e.g., swap tokens), submit your transaction hash as proof, and earn rewards!"
  },
  {
    question: "What rewards can I earn?",
    answer: "You earn MEDQ tokens (our native reward token), Badge NFTs (unique NFTs for each quest completion, levels 1-10), and XP points (used for leveling up and leaderboard rankings). Daily quests typically reward 50 MEDQ and 50 XP, while weekly quests offer 200 MEDQ and 100 XP. Rewards are automatically distributed on-chain after quest completion verification."
  },
  {
    question: "How does the XP and leveling system work?",
    answer: "You gain XP by completing quests. Your level is calculated as: Level = floor(total XP / 5000) + 1. For example, 0-4,999 XP = Level 1, 5,000-9,999 XP = Level 2, and so on. Higher levels unlock better badge NFTs and improve your leaderboard ranking. Your XP and level are tracked on-chain and displayed in your profile."
  },
  {
    question: "What is a Badge NFT?",
    answer: "Badge NFTs are unique non-fungible tokens (ERC-721) minted automatically when you complete a quest. Each badge corresponds to a level (1-10) and features unique artwork stored on IPFS. These NFTs serve as proof of your quest completions and achievements on the Medq platform. You can view all your badges in your profile's rewards section."
  },
  {
    question: "How do daily and weekly quests work?",
    answer: "Daily quests reset every 24 hours and offer 50 MEDQ + 50 XP. Weekly quests reset every Monday and offer 200 MEDQ + 100 XP. Both are AI-generated and personalized for each user. After completing your profile, you'll automatically receive your first daily and weekly quest. These quests are created by our AI agent and deployed on-chain as smart contract quests."
  },
  {
    question: "How does quest completion work?",
    answer: "First, accept the quest on-chain (requires Hedera Testnet). Next, complete the required action (e.g., swap tokens on SaucerSwap or lend on Bonzo Finance). After the transaction completes, copy your transaction hash and submit it as proof on the quest detail page. Our backend verifies your transaction via Hedera Mirror Node. Once verified, rewards (MEDQ tokens, Badge NFT, and XP) are automatically distributed to your wallet."
  },
  {
    question: "Which DeFi protocols are supported?",
    answer: "Medq currently supports SaucerSwap Finance (token swaps) and Bonzo Finance (lending & borrowing), both on Hedera Testnet. Quest categories include Swap, Lend, Liquidity, and Stake. As the platform grows, we'll add support for more Hedera-based DeFi protocols. Each quest clearly indicates which protocol you'll interact with."
  },
  {
    question: "How does the leaderboard work?",
    answer: "The leaderboard ranks users based on their total XP earned from completing quests. Your rank updates in real-time as you complete quests and earn XP. Users with 0 XP are unranked. You can view your rank on your profile page and compete with other users to climb to the top. The leaderboard helps foster healthy competition within the Medq community."
  },
  {
    question: "Do I need to pay gas fees?",
    answer: "You'll need HBAR (Hedera's native token) to pay for gas fees when accepting quests and interacting with smart contracts on Hedera Testnet. The quest actions themselves (swaps, lending, etc.) may also require gas fees depending on the protocol. All fees are clearly visible before you confirm transactions. Quest participation and rewards are free - you only pay network fees."
  },
  {
    question: "What happens if my quest submission fails?",
    answer: "If transaction verification fails, you'll see an error message explaining the issue. Common reasons include: transaction not found, wrong participant address, quest already completed, or quest expired. Ensure your transaction hash is correct and that you completed the quest action on the correct protocol. You can resubmit with the correct transaction hash if needed."
  },
  {
    question: "Where can I view my MEDQ tokens and Badge NFTs?",
    answer: "MEDQ tokens (ERC-20) and Badge NFTs (ERC-721) are standard tokens on Hedera. They won't automatically appear in HashPack or HashScan - you may need to manually import the token addresses. Visit your profile page to see your total MEDQ earned and view all your badge NFTs with images fetched from IPFS. All rewards are stored on-chain and can be verified via Hedera Explorer."
  }
]

export function FAQSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(0)

  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8 border-t border-border">
      <div className="max-w-4xl mx-auto">
        <div className="mb-12">
          <h2 className="text-4xl font-bold text-foreground mb-4 text-balance">Frequently Asked Questions</h2>
          <p className="text-lg text-muted-foreground">Everything you need to know about Medq</p>
        </div>

        <div className="space-y-3">
          {faqItems.map((item, index) => (
            <div
              key={index}
              className="border border-border rounded-lg bg-card/30 hover:bg-card/50 transition-colors overflow-hidden"
            >
              <button
                onClick={() => setOpenIndex(openIndex === index ? null : index)}
                className="w-full px-6 py-4 flex items-center justify-between hover:opacity-80 transition-opacity"
              >
                <span className="text-left font-semibold text-foreground">{item.question}</span>
                <ChevronDown
                  className={`w-5 h-5 text-primary flex-shrink-0 transition-transform duration-300 ${
                    openIndex === index ? 'rotate-180' : ''
                  }`}
                />
              </button>

              {openIndex === index && (
                <div className="px-6 pb-4 border-t border-border/50">
                  <p className="text-muted-foreground leading-relaxed">{item.answer}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
