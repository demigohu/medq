import Image from 'next/image'
import Link from 'next/link'
import React from 'react'

export default function FooterDashboard() {
    return (
        <footer className="border-t border-[#1A1A1A] bg-black p-10">
            <div className="max-w-7xl mx-auto">
                <h1 className="text-2xl md:text-8xl font-bold text-center text-white mb-8">MEDQ | Studio</h1>
                {/* <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                    <div className="col-span-1">
                        <div className="flex items-center gap-2 mb-4">
                            <div className="w-6 h-6 bg-transparent flex items-center justify-center">
                                <Image
                                    src="/logo/medq.svg"
                                    className=""
                                    alt="Medq"
                                    width={32}
                                    height={32}
                                />
                            </div>
                            <span className="text-xl text-white font-matemasie mb-1">MEDQ</span>
                        </div>
                        <p className="text-sm text-muted-foreground">
                            Join the ultimate DeFi quest platform. Complete on-chain tasks, participate in communities, and earn valuable rewards while climbing the leaderboard.
                        </p>
                    </div>
                </div> */}

                <div className="border-t border-[#1A1A1A] pt-8">
                    <p className="text-sm text-muted-foreground text-center">
                        © Medq 2026
                    </p>
                    <p className="text-sm text-muted-foreground text-center">
                        Built for Hedera Apex Hackathon
                    </p>
                </div>
            </div>
        </footer>
    )
}
