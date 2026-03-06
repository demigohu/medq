import Image from 'next/image'
import Link from 'next/link'
import React from 'react'

export default function Footer() {
    return (
        <footer className="border-t border-[#1A1A1A] bg-black p-10">
            <div className="">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
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

                    {[
                        {
                            title: "Menu",
                            links: [
                                {
                                    label: "Quest",
                                    path: "#how-it-works",
                                },
                                {
                                    label: "Leaderboard",
                                    path: "#leaderboard",
                                },
                                {
                                    label: "Partnership",
                                    path: "#partnership",
                                },
                            ],
                        },
                    ].map((column) => (
                        <div key={column.title} className="text-start md:text-end">
                            <h4 className="font-semibold text-white mb-4 text-sm">
                                {column.title}
                            </h4>
                            <ul className="space-y-2">
                                {column.links.map((link) => (
                                    <li key={link.path}>
                                        <Link
                                            href={link.path}
                                            className="text-sm text-muted-foreground hover:text-white transition"
                                        >
                                            {link.label}
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    ))}
                </div>

                <div className="border-t border-[#1A1A1A] pt-8">
                    <p className="text-sm text-muted-foreground text-center">
                        © 2026 Medq. All rights reserved.
                    </p>
                </div>
            </div>
        </footer>
    )
}
