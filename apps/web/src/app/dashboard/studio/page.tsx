"use client";

import { DataTable } from '@/components/data-table';
import { useIsTablet } from '@/hooks/breakpoint';
import { cn } from '@/lib/utils';
import { CircleCheck, CircleDashed, Menu, Plus, Search, Trash2, X } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import React, { useCallback, useEffect, useId, useMemo, useState } from 'react'
import { ColumnDef } from "@tanstack/react-table";
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import {
    InputGroup,
    InputGroupAddon,
    InputGroupInput,
  } from "@/components/ui/input-group"

type QuestType = {
    id: string;
    partner_wallet: string;
    title: string;
    template_type: string;
    description: string;
    thumbnail: string;
    status: string;
    participants: number;
    period_start: string;
    period_end: string;
    network: string;
    token: string;
    token_amount_per_winner: string;
    distribution: string;
    updatedAt: string;
    createdAt: string;
}

const CENTER_ITEMS: {
    key: string;
    label: string;
    title: string;
    description: string;
}[] = [
        {
            key: "/partnership",
            label: "Partnership",
            title: "Partnership",
            description: "Explore collaboration opportunities and partner benefits powered by Medq.",
        },
        {
            key: "/quest",
            label: "Quests",
            title: "Quests",
            description: "Discover and complete Medq quests to grow your on-chain health reputation.",
        },
    ];

export default function StudioPage() {
    const router = useRouter();
    const [questData, setQuestData] = useState<QuestType[]>([]);
    const [selectedRowId, setSelectedRowId] = useState<string[]>([]);
    const [isDeleteQuestDialogOpen, setIsDeleteQuestDialogOpen] = useState(false);
    const [selectedQuest, setSelectedQuest] = useState<QuestType | null>(null);
    const [searchTerm, setSearchTerm] = useState("");

    const dummyQuests: QuestType[] = [
        {
            id: "1",
            partner_wallet: "0xA1b2C3d4E5f678901234567890abcdef12345678",
            title: "Complete DeFi Swap Challenge",
            template_type: "DEFI",
            description: "<p>Quest description</p>",
            thumbnail: "https://picsum.photos/seed/defi/600/400",
            status: "PUBLISHED",
            participants: 128,
            period_start: "2026-03-01T00:00:00Z",
            period_end: "2026-03-31T23:59:59Z",
            network: "ethereum",
            token: "usdc",
            token_amount_per_winner: "10",
            distribution: "raffle",
            updatedAt: "2026-03-03T10:15:00Z",
            createdAt: "2026-02-25T08:00:00Z",
        },
        {
            id: "2",
            partner_wallet: "0xBb7dF9aC81234567890aBCdEfF1234567890abcd",
            title: "NFT Minting Sprint",
            template_type: "NFT",
            description: "<p>Quest description</p>",
            thumbnail: "https://picsum.photos/seed/nft/600/400",
            status: "PUBLISHED",
            participants: 0,
            period_start: "2026-04-01T00:00:00Z",
            period_end: "2026-04-15T23:59:59Z",
            network: "ethereum",
            token: "usdc",
            token_amount_per_winner: "7",
            distribution: "raffle",
            updatedAt: "2026-03-04T09:00:00Z",
            createdAt: "2026-03-01T12:30:00Z",
        },
        {
            id: "3",
            partner_wallet: "0xCcDeF1234567890abcdefABCDEF1234567890Ef12",
            title: "Liquidity Provider Booster",
            template_type: "LIQUIDITY",
            description: "<p>Quest description</p>",
            thumbnail: "https://picsum.photos/seed/liquidity/600/400",
            status: "NOT_PUBLISHED",
            participants: 342,
            period_start: "2026-02-01T00:00:00Z",
            period_end: "2026-02-28T23:59:59Z",
            network: "ethereum",
            token: "usdc",
            token_amount_per_winner: "5",
            distribution: "raffle",
            updatedAt: "2026-03-01T00:10:00Z",
            createdAt: "2026-01-25T14:20:00Z",
        },
    ];

    const columns: ColumnDef<QuestType>[] = [
        {
            accessorKey: "title",
            header: "Title",
            cell: ({ row }) => (
                <div className="max-w-[240px] truncate">
                    {row.getValue("title")}
                </div>
            ),
        },
        {
            accessorKey: "thumbnail",
            header: "Thumbnail Images",
            cell: ({ row }) => {
                return (
                    <div className="flex items-center -space-x-2 max-w-[200px]">
                        <Image
                            src={row.getValue("thumbnail")}
                            alt="Thumbnail images"
                            width={48}
                            height={36}
                            className="h-[36px] w-[48px] object-cover rounded"
                            loading="lazy"
                        />
                    </div>
                );
            },
        },
        {
            accessorKey: "participants",
            header: "Participants",
            cell: ({ row }) => (
                <div className="max-w-[240px] truncate">
                    {row.getValue("participants")}
                </div>
            ),
        },
        {
            accessorKey: "token_amount_per_winner",
            header: "Token Amount per Winner",
            cell: ({ row }) => (
                <div className="max-w-[240px] truncate">
                    {row.getValue("token_amount_per_winner")}
                </div>
            ),
        },
        {
            accessorKey: "token",
            header: "Token",
            cell: ({ row }) => (
                <div className="max-w-[240px] truncate">
                    <span className='uppercase'>{row.getValue("token")}</span>
                </div>
            ),
        },
        {
            accessorKey: "status",
            header: "Status",
            cell: ({ row }) => (
                <div className="flex items-center gap-2">
                    {row.getValue("status") === "PUBLISHED" ? (
                        <CircleCheck className="h-4 w-4" color="#03A01A" />
                    ) : (
                        <CircleDashed className="h-4 w-4" />
                    )}
                    <span
                        className={`${row.getValue("status") === "PUBLISHED" ? "text-[#03A01A]" : ""
                            }`}
                    >
                        {row.getValue("status") === "PUBLISHED" ? "Published" : "Draft"}
                    </span>
                </div>
            ),
        },
        {
            accessorKey: "updatedAt",
            header: "Last Updated",
            cell: ({ row }) => {
                const formatted = row.getValue("updatedAt")
                    ? new Date(row.getValue("updatedAt")).toLocaleString("en-US", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                        hour12: true,
                    })
                    : "";
                return <div>{formatted}</div>;
            },
        },
        {
            id: "delete",
            enableHiding: false,
            cell: ({ row }) => (
                <div>
                    <Trash2
                        className="w-4 h-4 text-[#9B1515]"
                        onClick={(e) => {
                            e.stopPropagation();
                            handleOpenDeleteEventDialog(row.original);
                        }}
                    />
                </div>
            ),
        },
    ];

    useEffect(() => {
        setQuestData(dummyQuests);
    }, []);

    const filteredQuests = useMemo(() => {
        if (!searchTerm.trim()) return questData;
        const query = searchTerm.toLowerCase();
        return questData.filter((quest) =>
            quest.title.toLowerCase().includes(query)
        );
    }, [questData, searchTerm]);

    const handleRowClick = useCallback((row: QuestType) => {
        router.push(`/dashboard/studio/edit-quest/${row.id}`);
    }, [router]);

    const handleSelectionRowChange = useCallback((rows: QuestType[]) => {
        const selectedIds = rows.map((row: QuestType) => row.id);
        setSelectedRowId(selectedIds);
    }, []);

    const handleOpenDeleteEventDialog = useCallback((row: QuestType) => {
        setSelectedQuest(row);
        setIsDeleteQuestDialogOpen(true);
    }, []);

    return (
        <>
            <div className="min-h-screen bg-[#0d0e13] px-5 pb-20 pt-24 text-white md:px-10">
                <div className='max-w-7xl mx-auto'>
                    <div className="space-y-8">
                        <div className='flex flex-col md:flex-row gap-4 items-center justify-between p-8 border border-[#1A1A1A] rounded bg-[linear-gradient(to_right,#2845D6,#0d0e13_60%)]'>
                            <div className="space-y-2">
                                <h1 className="text-3xl font-semibold tracking-tight text-white">
                                    Quests
                                </h1>
                                <p className="text-sm text-zinc-400 max-w-2xl">
                                    Create and manage promotional quests for your project.
                                    Reward users with tokens when they complete on-chain or social tasks.
                                </p>
                            </div>
                            <Link href="/dashboard/studio/create-quest">
                                <Button variant="default" className="text-white border border-[#1A1A1A] rounded bg-[#2845D6] hover:bg-[#2845D6]/80">
                                    <Plus className="w-4 h-4" />
                                    Create Quest
                                </Button>
                            </Link>
                        </div>

                        <div className='space-y-4'>
                            <InputGroup className="max-w-xs border border-[#1A1A1A] rounded bg-black text-white">
                                <InputGroupInput
                                    placeholder="Search quest..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                                <InputGroupAddon>
                                    <Search className="w-4 h-4" />
                                </InputGroupAddon>
                            </InputGroup>
                            <DataTable
                                key={questData.map((row) => row.id).join(",")}
                                columns={columns}
                                data={filteredQuests}
                                // onSelectionChange={handleSelectionChange}
                                onSelectedRowsChange={handleSelectionRowChange}
                                onRowClick={handleRowClick}
                            />
                        </div>
                    </div>
                </div>

                <Dialog open={isDeleteQuestDialogOpen} onOpenChange={setIsDeleteQuestDialogOpen}>
                    <DialogContent className="sm:max-w-sm bg-black border border-[#1A1A1A] rounded text-white">
                        <DialogHeader>
                            <DialogTitle>Delete selected quest?</DialogTitle>
                            <DialogDescription>
                                You area about to permanently delete the selected news quest. This action cannot be undone.
                            </DialogDescription>
                        </DialogHeader>
                        <DialogFooter>
                            <DialogClose asChild>
                                <Button variant="default" className='rounded bg-white text-black text-xs hover:bg-white/80'>Cancel</Button>
                            </DialogClose>
                            <Button type="submit" className='rounded bg-[#9B1515] text-white text-xs hover:bg-[#9B1515]/80'>Delete</Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>
        </>

    )
}
