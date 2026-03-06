"use client";

import * as React from "react";
import {
  Command,
  ChevronRight,
  ChevronLeft,
  ChevronsUpDown,
  LogOut,
  User,
  House,
  LayoutList,
  ChartNoAxesColumn,
  Webhook,
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
  useSidebar,
} from "@/components/ui/sidebar";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  SidebarMenuAction,
} from "@/components/ui/sidebar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "./ui/button";
import Link from "next/link";
import Image from "next/image";
import { useUserStore } from "@/lib/store";
import { useReownWallet } from "@/hooks/useReownWallet";
import { AppKitButton } from '@reown/appkit/react';
import { addTokenToWallet, addNFTToWallet } from "@/lib/addToWallet";
import { Coins, Copy } from "lucide-react";
import { useState } from "react";

const navItem = [
  {
    title: "Home",
    url: "/",
    icon: House,
  },
  {
    title: "Quests",
    url: "/quests",
    icon: LayoutList,
  },
  {
    title: "Leaderboard",
    url: "/leaderboard",
    icon: ChartNoAxesColumn,
  },
  {
    title: "Profile",
    url: "/profile",
    icon: User,
  },
];

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { isMobile, state, toggleSidebar } = useSidebar();
  const { user, walletAddress } = useUserStore();
  const { wallet, isHederaNetwork, switchToHedera, disconnect } = useReownWallet();
  const [addingToken, setAddingToken] = useState(false);
  const [addingNFT, setAddingNFT] = useState(false);

  const handleAddToken = async () => {
    setAddingToken(true);
    try {
      const result = await addTokenToWallet();
      if (result.success) {
        // You can show a toast notification here
        console.log(result.message);
      } else {
        console.error(result.message);
        // You can show an error toast here
      }
    } catch (error) {
      console.error("Failed to add token:", error);
    } finally {
      setAddingToken(false);
    }
  };

  const handleAddNFT = async () => {
    setAddingNFT(true);
    try {
      const result = await addNFTToWallet();
      if (result.success) {
        // You can show a toast notification here
        console.log(result.message);
      } else {
        console.error(result.message);
        // You can show an error toast here
      }
    } catch (error) {
      console.error("Failed to add NFT:", error);
    } finally {
      setAddingNFT(false);
    }
  };

  return (
    <Sidebar variant="floating" collapsible="icon" {...props}>
      <SidebarHeader className="relative">
        {!isMobile && (
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleSidebar}
            className="cursor-pointer absolute -right-3 top-4 z-20 flex h-8 w-8 items-center justify-center rounded-lg border border-border/60 bg-background/80 text-muted-foreground shadow-lg backdrop-blur transition hover:text-foreground"
          >
            {state === "collapsed" ? (
              <ChevronRight className="size-4" />
            ) : (
              <ChevronLeft className="size-4" />
            )}
            <span className="sr-only">Toggle sidebar</span>
          </Button>
        )}
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <div>
                <div className="bg-sidebar-primary text-sidebar-primary-foreground flex aspect-square size-8 items-center justify-center rounded-lg">
                  <Image src="/medq.svg" alt="Medq" width={20} height={20} />
                </div>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-medium">Medq</span>
                  {/* <span className="truncate text-xs">Enterprise</span> */}
                </div>
              </div>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          {/* <SidebarGroupLabel>Platform</SidebarGroupLabel> */}
          <SidebarMenu>
            {navItem.map((item) => (
              <SidebarMenuItem key={item.title}>
                <SidebarMenuButton tooltip={item.title} asChild>
                  <Link href={item.url}>
                    {item.icon && <item.icon />}
                    <span>{item.title}</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        <SidebarMenu>
          {wallet.isConnected && user ? (
            <SidebarMenuItem>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <SidebarMenuButton
                    size="lg"
                    className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
                  >
                    <Avatar className="h-8 w-8 rounded-lg">
                      <AvatarImage src={user.avatar || "/placeholder.svg?height=32&width=32&query=user avatar"} alt={user.name || "User"} />
                      <AvatarFallback className="rounded-lg">
                        {user.name?.[0]?.toUpperCase() || user.walletAddress.slice(2, 4).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="grid flex-1 text-left text-sm leading-tight">
                      <span className="truncate font-medium">
                        {user.name || `${user.walletAddress.slice(0, 6)}...${user.walletAddress.slice(-4)}`}
                      </span>
                      <span className="truncate text-xs">
                        {user.email || `Level ${user.level}`}
                      </span>
                    </div>
                    <ChevronsUpDown className="ml-auto size-4" />
                  </SidebarMenuButton>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  className="w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-lg"
                  side={isMobile ? "bottom" : "right"}
                  align="end"
                  sideOffset={4}
                >
                  <DropdownMenuLabel>
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium leading-none">{user.name || "User"}</p>
                      <p className="text-xs leading-none text-muted-foreground">
                        {user.walletAddress.slice(0, 6)}...{user.walletAddress.slice(-4)}
                      </p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  {!isHederaNetwork && (
                    <>
                      <DropdownMenuItem onClick={switchToHedera}>
                        Switch to Hedera Testnet
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                    </>
                  )}
                  <DropdownMenuLabel className="text-xs">Add to Wallet</DropdownMenuLabel>
                  <DropdownMenuItem 
                    onClick={handleAddToken}
                    disabled={addingToken}
                  >
                    <Coins className="mr-2 h-4 w-4" />
                    {addingToken ? "Adding..." : "Add MEDQ Token"}
                  </DropdownMenuItem>
                  <DropdownMenuItem 
                    onClick={handleAddNFT}
                    disabled={addingNFT}
                  >
                    <Copy className="mr-2 h-4 w-4" />
                    {addingNFT ? "Copying..." : "Copy Badge NFT Address"}
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => disconnect()}>
                    <LogOut className="mr-2 h-4 w-4" />
                    Disconnect Wallet
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </SidebarMenuItem>
          ) : (
            <SidebarMenuItem>
              <div className="flex flex-col gap-2 p-2">
                <AppKitButton 
                  balance="hide"
                  label="Connect Wallet"
                />
              </div>
            </SidebarMenuItem>
          )}
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
