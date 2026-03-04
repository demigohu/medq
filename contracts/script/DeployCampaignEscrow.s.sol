// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {Script, console} from "forge-std/Script.sol";

import {CampaignEscrow} from "../src/CampaignEscrow.sol";

/**
 * @title DeployCampaignEscrow
 * @notice Deploy CampaignEscrow for partner campaign USDC rewards.
 *         Set CAMPAIGN_REWARD_TOKEN (USDC address) and COMPLETION_ORACLE in env.
 */
contract DeployCampaignEscrow is Script {
    function run() external {
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        address deployer = vm.addr(deployerPrivateKey);

        address rewardToken = vm.envOr("CAMPAIGN_REWARD_TOKEN", address(0));
        address oracle = vm.envOr("COMPLETION_ORACLE", deployer);

        if (rewardToken == address(0)) {
            console.log("WARNING: CAMPAIGN_REWARD_TOKEN not set. Call setRewardToken() after deploy.");
        }

        console.log("Deployer:", deployer);
        console.log("Reward token (USDC):", rewardToken);
        console.log("Oracle (reward releaser):", oracle);

        vm.startBroadcast(deployerPrivateKey);

        CampaignEscrow escrow = new CampaignEscrow(deployer);
        escrow.setRewardReleaser(oracle);
        if (rewardToken != address(0)) {
            escrow.setRewardToken(rewardToken);
        }

        vm.stopBroadcast();

        console.log("\nCampaignEscrow deployed at:", address(escrow));
        console.log("Next: Add CAMPAIGN_ESCROW_ADDRESS=", address(escrow), "to backend .env");
    }
}
