export function FaqSection() {
    return (
        <section>
            <div className="">
                <div className="space-y-3 border-b border-[#1A1A1A] p-10">
                    {/* <p className="text-[11px] font-semibold tracking-[0.22em] text-zinc-500">
                QUESTIONS
              </p> */}
                    <h2 className="text-2xl font-semibold md:text-3xl">FAQ</h2>
                    <p className="text-xs text-zinc-400 md:text-sm">
                        Everything you need to know about running and joining Medq quests.
                    </p>
                </div>

                <div className="divide-y divide-[#1A1A1A]">
                    {/* Getting started */}
                    <div>
                        <div className="border-b border-[#1A1A1A] px-10 py-4 text-sm font-semibold uppercase tracking-[0.22em] text-zinc-500">
                            Getting started
                        </div>
                        <details className="group border-b border-[#1A1A1A] p-10">
                            <summary className="flex cursor-pointer list-none items-center justify-between text-sm font-medium text-white">
                                <span>What is Medq?</span>
                                <span className="text-xs text-zinc-500 group-open:hidden">+</span>
                                <span className="hidden text-xs text-zinc-500 group-open:inline">
                                    -
                                </span>
                            </summary>
                            <p className="mt-2 text-xs leading-relaxed text-zinc-400">
                                Medq is a gamified DeFi quest platform built on Hedera Testnet.
                                Complete on-chain tasks like token swaps on SaucerSwap or lending
                                on Bonzo Finance to earn MEDQ tokens, Badge NFTs, and XP points.
                                Our AI-powered system generates personalized daily and weekly quests
                                tailored to your DeFi journey.
                            </p>
                        </details>

                        <details className="group p-10">
                            <summary className="flex cursor-pointer list-none items-center justify-between text-sm font-medium text-white">
                                <span>How do I get started?</span>
                                <span className="text-xs text-zinc-500 group-open:hidden">+</span>
                                <span className="hidden text-xs text-zinc-500 group-open:inline">
                                    -
                                </span>
                            </summary>
                            <p className="mt-2 text-xs leading-relaxed text-zinc-400">
                                Connect your wallet to the App and ensure you're on Hedera
                                Testnet. Complete your profile with your name and email, then
                                browse available quests. Daily and weekly quests are automatically
                                generated for you after profile completion. Accept a quest, complete
                                the on-chain action (e.g., swap tokens), submit your transaction hash
                                as proof, and earn rewards!
                            </p>
                        </details>
                    </div>

                    {/* XP, rewards & badges */}
                    <div>
                        <div className="border-b border-[#1A1A1A] px-10 py-4 text-sm font-semibold uppercase tracking-[0.22em] text-zinc-500">
                            XP, rewards & badges
                        </div>
                        <details className="group border-b border-[#1A1A1A] p-10">
                            <summary className="flex cursor-pointer list-none items-center justify-between text-sm font-medium text-white">
                                <span>What rewards can i earn?</span>
                                <span className="text-xs text-zinc-500 group-open:hidden">+</span>
                                <span className="hidden text-xs text-zinc-500 group-open:inline">
                                    -
                                </span>
                            </summary>
                            <p className="mt-2 text-xs leading-relaxed text-zinc-400">
                                You earn MEDQ tokens (our native reward token), Badge NFTs (unique
                                NFTs for each quest completion, levels 1-10), and XP points (used
                                for leveling up and leaderboard rankings). Daily quests typically
                                reward 50 MEDQ and 50 XP, while weekly quests offer 200 MEDQ and
                                100 XP. Rewards are automatically distributed on-chain after quest
                                completion verification.
                            </p>
                        </details>

                        <details className="group border-b border-[#1A1A1A] p-10">
                            <summary className="flex cursor-pointer list-none items-center justify-between text-sm font-medium text-white">
                                <span>How does the XP and leveling system work?</span>
                                <span className="text-xs text-zinc-500 group-open:hidden">+</span>
                                <span className="hidden text-xs text-zinc-500 group-open:inline">
                                    -
                                </span>
                            </summary>
                            <p className="mt-2 text-xs leading-relaxed text-zinc-400">
                                You gain XP by completing quests. Your level is calculated as:
                                Level = floor(total XP / 5000) + 1. For example, 0-4,999 XP = Level
                                1, 5,000-9,999 XP = Level 2, and so on. Higher levels unlock better
                                badge NFTs and improve your leaderboard ranking. Your XP and level
                                are tracked on-chain and displayed in your profile.
                            </p>
                        </details>

                        <details className="group p-10">
                            <summary className="flex cursor-pointer list-none items-center justify-between text-sm font-medium text-white">
                                <span>What is a Badge NFT?</span>
                                <span className="text-xs text-zinc-500 group-open:hidden">+</span>
                                <span className="hidden text-xs text-zinc-500 group-open:inline">
                                    -
                                </span>
                            </summary>
                            <p className="mt-2 text-xs leading-relaxed text-zinc-400">
                                Badge NFTs are unique non-fungible tokens (ERC-721) minted
                                automatically when you complete a quest. Each badge corresponds
                                to a level (1-10) and features unique artwork stored on IPFS.
                                These NFTs serve as proof of your quest completions and achievements
                                on the Medq platform. You can view all your badges in your profile's
                                rewards section.
                            </p>
                        </details>
                    </div>

                    {/* Quests & completion */}
                    <div>
                        <div className="border-b border-[#1A1A1A] px-10 py-4 text-sm font-semibold uppercase tracking-[0.22em] text-zinc-500">
                            Quests & completion
                        </div>
                        <details className="group border-b border-[#1A1A1A] p-10">
                            <summary className="flex cursor-pointer list-none items-center justify-between text-sm font-medium text-white">
                                <span>How do daily and weekly quests work?</span>
                                <span className="text-xs text-zinc-500 group-open:hidden">+</span>
                                <span className="hidden text-xs text-zinc-500 group-open:inline">
                                    -
                                </span>
                            </summary>
                            <p className="mt-2 text-xs leading-relaxed text-zinc-400">
                                Daily quests reset every 24 hours and offer 50 MEDQ + 50 XP. Weekly
                                quests reset every Monday and offer 200 MEDQ + 100 XP. Both are
                                AI-generated and personalized for each user. After completing your
                                profile, you'll automatically receive your first daily and weekly
                                quest. These quests are created by our AI agent and deployed on-chain
                                as smart contract quests.
                            </p>
                        </details>

                        <details className="group border-b border-[#1A1A1A] p-10">
                            <summary className="flex cursor-pointer list-none items-center justify-between text-sm font-medium text-white">
                                <span>How does quest completion work?</span>
                                <span className="text-xs text-zinc-500 group-open:hidden">+</span>
                                <span className="hidden text-xs text-zinc-500 group-open:inline">
                                    -
                                </span>
                            </summary>
                            <p className="mt-2 text-xs leading-relaxed text-zinc-400">
                                First, accept the quest on-chain (requires Hedera Testnet). Next,
                                complete the required action (e.g., swap tokens on SaucerSwap or
                                lend on Bonzo Finance). After the transaction completes, medq
                                automatically verifies quest completion by checking submitted
                                transaction hashes through Hedera’s Mirror Node. Once verified,
                                rewards (MEDQ tokens, Badge NFT, and XP) are automatically
                                distributed to your wallet.
                            </p>
                        </details>

                        <details className="group border-b border-[#1A1A1A] p-10">
                            <summary className="flex cursor-pointer list-none items-center justify-between text-sm font-medium text-white">
                                <span>Which DeFi protocols are supported?</span>
                                <span className="text-xs text-zinc-500 group-open:hidden">+</span>
                                <span className="hidden text-xs text-zinc-500 group-open:inline">
                                    -
                                </span>
                            </summary>
                            <p className="mt-2 text-xs leading-relaxed text-zinc-400">
                                Medq currently supports SaucerSwap Finance (token swaps) and Bonzo
                                Finance (lending & borrowing), both on Hedera Testnet. Quest
                                categories include Swap, Lend, Liquidity, and Stake. As the platform
                                grows, we'll add support for more Hedera-based DeFi protocols. Each
                                quest clearly indicates which protocol you'll interact with.
                            </p>
                        </details>

                        <details className="group p-10">
                            <summary className="flex cursor-pointer list-none items-center justify-between text-sm font-medium text-white">
                                <span>How does the leaderboard work?</span>
                                <span className="text-xs text-zinc-500 group-open:hidden">+</span>
                                <span className="hidden text-xs text-zinc-500 group-open:inline">
                                    -
                                </span>
                            </summary>
                            <p className="mt-2 text-xs leading-relaxed text-zinc-400">
                                The leaderboard ranks users based on their total XP earned from
                                completing quests. Your rank updates in real-time as you complete
                                quests and earn XP. Users with 0 XP are unranked. You can view your
                                rank on your profile page and compete with other users to climb
                                to the top. The leaderboard helps foster healthy competition
                                within the Medq community.
                            </p>
                        </details>
                    </div>

                    {/* Fees, troubleshooting & wallets */}
                    <div>
                        <div className="border-b border-[#1A1A1A] px-10 py-4 text-sm font-semibold uppercase tracking-[0.22em] text-zinc-500">
                            Fees, troubleshooting & wallets
                        </div>
                        <details className="group border-b border-[#1A1A1A] p-10">
                            <summary className="flex cursor-pointer list-none items-center justify-between text-sm font-medium text-white">
                                <span>Do I need to pay gas fees?</span>
                                <span className="text-xs text-zinc-500 group-open:hidden">+</span>
                                <span className="hidden text-xs text-zinc-500 group-open:inline">
                                    -
                                </span>
                            </summary>
                            <p className="mt-2 text-xs leading-relaxed text-zinc-400">
                                You'll need HBAR (Hedera's native token) to pay for gas fees when
                                accepting quests and interacting with smart contracts on Hedera
                                Testnet. The quest actions themselves (swaps, lending, etc.) may
                                also require gas fees depending on the protocol. All fees are
                                clearly visible before you confirm transactions. Quest participation
                                and rewards are free - you only pay network fees.
                            </p>
                        </details>

                        <details className="group border-b border-[#1A1A1A] p-10">
                            <summary className="flex cursor-pointer list-none items-center justify-between text-sm font-medium text-white">
                                <span>What happens if my quest submission fails?</span>
                                <span className="text-xs text-zinc-500 group-open:hidden">+</span>
                                <span className="hidden text-xs text-zinc-500 group-open:inline">
                                    -
                                </span>
                            </summary>
                            <p className="mt-2 text-xs leading-relaxed text-zinc-400">
                                If transaction verification fails, you'll see an error message
                                explaining the issue. Common reasons include: transaction not found,
                                wrong participant address, quest already completed, or quest
                                expired. Ensure your transaction hash is correct and that you
                                completed the quest action on the correct protocol. You can
                                resubmit with the correct transaction hash if needed.
                            </p>
                        </details>

                        <details className="group p-10">
                            <summary className="flex cursor-pointer list-none items-center justify-between text-sm font-medium text-white">
                                <span>Where can I view my MEDQ tokens and Badge NFTs?</span>
                                <span className="text-xs text-zinc-500 group-open:hidden">+</span>
                                <span className="hidden text-xs text-zinc-500 group-open:inline">
                                    -
                                </span>
                            </summary>
                            <p className="mt-2 text-xs leading-relaxed text-zinc-400">
                                MEDQ tokens (ERC-20) and Badge NFTs (ERC-721) are standard tokens
                                on Hedera. They won't automatically appear in HashPack or HashScan
                                - you may need to manually import the token addresses. Visit your
                                profile page to see your total MEDQ earned and view all your badge
                                NFTs with images fetched from IPFS. All rewards are stored on-chain
                                and can be verified via Hedera Explorer.
                            </p>
                        </details>
                    </div>

                    {/* Medq Studio & creators */}
                    <div>
                        <div className="border-b border-[#1A1A1A] px-10 py-4 text-sm font-semibold uppercase tracking-[0.22em] text-zinc-500">
                            Medq Studio & creators
                        </div>
                        <details className="group border-b border-[#1A1A1A] p-10">
                            <summary className="flex cursor-pointer list-none items-center justify-between text-sm font-medium text-white">
                                <span>What is Medq Studio?</span>
                                <span className="text-xs text-zinc-500 group-open:hidden">+</span>
                                <span className="hidden text-xs text-zinc-500 group-open:inline">
                                    -
                                </span>
                            </summary>
                            <p className="mt-2 text-xs leading-relaxed text-zinc-400">
                                Medq Studio is a campaign dashboard that allows projects to create and manage quest campaigns to promote their products or protocols. Projects can design tasks, set rewards, and encourage users to complete on-chain activities.
                            </p>
                        </details>

                        <details className="group border-b border-[#1A1A1A] p-10">
                            <summary className="flex cursor-pointer list-none items-center justify-between text-sm font-medium text-white">
                                <span>Who can create quests in Medq Studio?</span>
                                <span className="text-xs text-zinc-500 group-open:hidden">+</span>
                                <span className="hidden text-xs text-zinc-500 group-open:inline">
                                    -
                                </span>
                            </summary>
                            <p className="mt-2 text-xs leading-relaxed text-zinc-400">
                                Any project or community member can create quests using Medq
                                Studio. It is designed for teams that want to promote their
                                protocols, launch campaigns, or incentivize user engagement.
                            </p>
                        </details>

                        <details className="group border-b border-[#1A1A1A] p-10">
                            <summary className="flex cursor-pointer list-none items-center justify-between text-sm font-medium text-white">
                                <span>How do users participate in a quest?</span>
                                <span className="text-xs text-zinc-500 group-open:hidden">+</span>
                                <span className="hidden text-xs text-zinc-500 group-open:inline">
                                    -
                                </span>
                            </summary>
                            <p className="mt-2 text-xs leading-relaxed text-zinc-400">
                                Users participate by completing the required on-chain actions
                                described in the quest, such as swapping tokens or interacting
                                with a protocol. After completing the task, users submit their
                                transaction proof to receive rewards.
                            </p>
                        </details>

                        <details className="group border-b border-[#1A1A1A] p-10">
                            <summary className="flex cursor-pointer list-none items-center justify-between text-sm font-medium text-white">
                                <span>Can I edit or delete a quest after creating it?</span>
                                <span className="text-xs text-zinc-500 group-open:hidden">+</span>
                                <span className="hidden text-xs text-zinc-500 group-open:inline">
                                    -
                                </span>
                            </summary>
                            <p className="mt-2 text-xs leading-relaxed text-zinc-400">
                                Yes. Medq Studio allows creators to edit quest details, update
                                rewards, adjust campaign settings, or delete quests if they are
                                no longer needed.
                            </p>
                        </details>
                    </div>
                </div>
            </div>
        </section>
    );
}

