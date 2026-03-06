"use client";

import React from 'react'
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { useAccount, useBalance, useDisconnect } from "wagmi";
import { type Address } from "viem";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuGroup,
    DropdownMenuLabel,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuShortcut,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { LogOut, MoveRight } from 'lucide-react';
import Link from 'next/link';

function shortAddress(address: string) {
    return `${address.slice(0, 6)}…${address.slice(-4)}`;
}

export default function ConnectWalletButton() {
    const { address } = useAccount();
    const { disconnect } = useDisconnect();

    const medqTokenAddress = (process.env.NEXT_PUBLIC_MEDQ_TOKEN_ADDRESS &&
        /^0x[a-fA-F0-9]{40}$/.test(process.env.NEXT_PUBLIC_MEDQ_TOKEN_ADDRESS)
        ? (process.env.NEXT_PUBLIC_MEDQ_TOKEN_ADDRESS as Address)
        : undefined);

    const { data: balance, isLoading: isBalanceLoading } = useBalance({
        address,
        token: medqTokenAddress,
        query: {
            enabled: !!address,
        },
    });

    const [copied, setCopied] = React.useState(false);

    const handleCopyAddress = React.useCallback(async (addr?: string) => {
        if (!addr) return;
        try {
            await navigator.clipboard.writeText(addr);
            setCopied(true);
            window.setTimeout(() => setCopied(false), 1200);
        } catch {
            // ignore (clipboard permissions / unsupported)
        }
    }, []);

    return (
        <ConnectButton.Custom>
            {({
                account,
                chain,
                openAccountModal,
                openChainModal,
                openConnectModal,
                authenticationStatus,
                mounted,
            }) => {
                const ready = mounted && authenticationStatus !== "loading";
                const connected =
                    ready &&
                    account &&
                    chain &&
                    (!authenticationStatus ||
                        authenticationStatus === "authenticated");

                return (
                    <div
                        {...(!ready && {
                            "aria-hidden": true,
                            style: {
                                opacity: 0,
                                pointerEvents: "none",
                                userSelect: "none",
                            },
                        })}
                        className='w-full'
                    >
                        {(() => {
                            if (!connected) {
                                return (
                                    <Button variant="default" onClick={openConnectModal} className="rounded w-full font-semibold bg-white text-black hover:bg-white/80">
                                        Connect Wallet
                                    </Button>
                                );
                            }

                            if (chain.unsupported) {
                                return (
                                    <Button variant="default" onClick={openChainModal} className="rounded w-full font-semibold bg-white text-black hover:bg-white/80">
                                        Wrong network
                                    </Button>
                                );
                            }

                            return (
                                // <Button
                                //     size="sm"
                                //     variant="outline"
                                //     onClick={openAccountModal}
                                // >
                                //     {account.displayName}
                                //     {account.displayBalance
                                //         ? ` (${account.displayBalance})`
                                //         : ""}
                                // </Button>
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        {/* <Button variant="ghost" size="icon" className="rounded-full">
                                            <Avatar size="lg">
                                                <AvatarImage src={account.ensAvatar ?? "https://github.com/evilrabbit.png"} alt={account.displayName} />
                                                <AvatarFallback>{account.displayName?.slice(0, 2)?.toUpperCase() ?? "WA"}</AvatarFallback>
                                            </Avatar>
                                        </Button> */}

                                        <Button variant="default" className="rounded font-semibold w-full bg-white text-black hover:bg-white/80">
                                            {account.displayName}
                                            {account.displayBalance
                                                ? ` (${account.displayBalance})`
                                                : ""}
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end" className='rounded'>
                                        <DropdownMenuLabel className="flex items-center gap-2">
                                            <span className="font-medium">Wallet</span>
                                            <DropdownMenuShortcut className="tracking-normal">{chain.name}</DropdownMenuShortcut>
                                        </DropdownMenuLabel>

                                        <DropdownMenuGroup>
                                            <Link href={`/profile`}>
                                                <DropdownMenuItem className="flex items-center justify-between cursor-pointer">
                                                    Profile
                                                    <MoveRight className="w-4 h-4" />
                                                </DropdownMenuItem>
                                            </Link>

                                            <DropdownMenuItem
                                                onSelect={(e) => {
                                                    e.preventDefault();
                                                    handleCopyAddress(account.address);
                                                }}
                                                className='cursor-pointer'
                                            >
                                                {shortAddress(account.address)}
                                                <DropdownMenuShortcut className="tracking-normal">
                                                    {copied ? "Copied" : "Copy"}
                                                </DropdownMenuShortcut>
                                            </DropdownMenuItem>

                                            <DropdownMenuItem disabled>
                                                {medqTokenAddress ? "MEDQ Balance" : "Balance"}
                                                <DropdownMenuShortcut className="tracking-normal">
                                                    {isBalanceLoading
                                                        ? "…"
                                                        : balance
                                                            ? `${Number(balance.formatted).toLocaleString(undefined, { maximumFractionDigits: 4 })} ${balance.symbol}`
                                                            : "-"}
                                                </DropdownMenuShortcut>
                                            </DropdownMenuItem>
                                        </DropdownMenuGroup>
                                        <DropdownMenuSeparator />
                                        <DropdownMenuItem
                                            className="flex items-center justify-between cursor-pointer"
                                            variant="destructive"
                                            onSelect={(e) => {
                                                e.preventDefault();
                                                disconnect();
                                            }}
                                        >
                                            Disconnect
                                            <LogOut className="w-4 h-4" />
                                        </DropdownMenuItem>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            );
                        })()}
                    </div>
                );
            }}
        </ConnectButton.Custom>
    )
}
