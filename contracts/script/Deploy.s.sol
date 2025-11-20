// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {Script, console} from "forge-std/Script.sol";

import {IdentityRegistry} from "../src/erc8004/IdentityRegistry.sol";
import {ReputationRegistry} from "../src/erc8004/ReputationRegistry.sol";
import {ValidationRegistry} from "../src/erc8004/ValidationRegistry.sol";
import {AgentRegistryAdapter} from "../src/erc8004/AgentRegistryAdapter.sol";
import {MedqToken} from "../src/tokens/MedqToken.sol";
import {RewardVault} from "../src/RewardVault.sol";
import {BadgeNFT} from "../src/BadgeNFT.sol";
import {QuestManager} from "../src/QuestManager.sol";

// Import interfaces for casting
import {IIdentityRegistry} from "../src/erc8004/ReputationRegistry.sol";
import {IIdentityRegistryMinimal} from "../src/erc8004/ValidationRegistry.sol";
import {IIdentityRegistryReader} from "../src/erc8004/AgentRegistryAdapter.sol";

/**
 * @title Deploy
 * @notice Comprehensive deployment script for MEDQ DeFi Quest system.
 *         Deploys ERC-8004 registries, MEDQ ERC-20 token, Badge ERC-721 NFT, RewardVault, and QuestManager.
 *         Sets up all cross-contract references.
 */
contract Deploy is Script {
    function run() external {
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        address deployer = vm.addr(deployerPrivateKey);

        console.log("Deployer:", deployer);
        console.log("Deployer balance:", deployer.balance);

        // Deploy contracts one by one to avoid nonce conflicts
        IdentityRegistry identityRegistry;
        ReputationRegistry reputationRegistry;
        ValidationRegistry validationRegistry;
        AgentRegistryAdapter agentRegistryAdapter;
        MedqToken medqToken;
        RewardVault rewardVault;
        BadgeNFT badgeNft;
        QuestManager questManager;

        // 1. Deploy ERC-8004 Identity Registry
        console.log("\n=== Deploying IdentityRegistry ===");
        vm.startBroadcast(deployerPrivateKey);
        identityRegistry = new IdentityRegistry(deployer);
        vm.stopBroadcast();
        console.log("IdentityRegistry deployed at:", address(identityRegistry));

        // 2. Deploy Reputation Registry
        console.log("\n=== Deploying ReputationRegistry ===");
        IIdentityRegistry identityRegistryInterface = IIdentityRegistry(address(identityRegistry));
        vm.startBroadcast(deployerPrivateKey);
        reputationRegistry = new ReputationRegistry(deployer, identityRegistryInterface);
        vm.stopBroadcast();
        console.log("ReputationRegistry deployed at:", address(reputationRegistry));

        // 3. Deploy Validation Registry
        console.log("\n=== Deploying ValidationRegistry ===");
        IIdentityRegistryMinimal identityRegistryMinimal = IIdentityRegistryMinimal(address(identityRegistry));
        vm.startBroadcast(deployerPrivateKey);
        validationRegistry = new ValidationRegistry(deployer, identityRegistryMinimal);
        vm.stopBroadcast();
        console.log("ValidationRegistry deployed at:", address(validationRegistry));

        // 4. Deploy Agent Registry Adapter
        console.log("\n=== Deploying AgentRegistryAdapter ===");
        IIdentityRegistryReader identityRegistryReader = IIdentityRegistryReader(address(identityRegistry));
        vm.startBroadcast(deployerPrivateKey);
        agentRegistryAdapter = new AgentRegistryAdapter(identityRegistryReader);
        vm.stopBroadcast();
        console.log("AgentRegistryAdapter deployed at:", address(agentRegistryAdapter));

        // 5. Deploy MEDQ ERC-20 Token
        console.log("\n=== Deploying MedqToken (ERC-20) ===");
        vm.startBroadcast(deployerPrivateKey);
        medqToken = new MedqToken(deployer);
        vm.stopBroadcast();
        console.log("MedqToken deployed at:", address(medqToken));

        // 6. Deploy RewardVault
        console.log("\n=== Deploying RewardVault ===");
        vm.startBroadcast(deployerPrivateKey);
        rewardVault = new RewardVault(deployer);
        vm.stopBroadcast();
        console.log("RewardVault deployed at:", address(rewardVault));

        // 7. Deploy BadgeNFT (ERC-721)
        console.log("\n=== Deploying BadgeNFT (ERC-721) ===");
        vm.startBroadcast(deployerPrivateKey);
        badgeNft = new BadgeNFT(deployer);
        vm.stopBroadcast();
        console.log("BadgeNFT deployed at:", address(badgeNft));

        // 8. Deploy QuestManager
        console.log("\n=== Deploying QuestManager ===");
        vm.startBroadcast(deployerPrivateKey);
        questManager = new QuestManager(
            deployer, agentRegistryAdapter, rewardVault, badgeNft, reputationRegistry, validationRegistry
        );
        vm.stopBroadcast();
        console.log("QuestManager deployed at:", address(questManager));

        // 9. Setup phase: configure cross-contract references
        console.log("\n=== Setting up cross-contract references ===");

        // Grant MINTER_ROLE to RewardVault in MedqToken
        console.log("Granting MINTER_ROLE to RewardVault...");
        vm.startBroadcast(deployerPrivateKey);
        medqToken.grantMinterRole(address(rewardVault));
        vm.stopBroadcast();

        // Set MedqToken in RewardVault
        console.log("Setting MedqToken in RewardVault...");
        vm.startBroadcast(deployerPrivateKey);
        rewardVault.setMedqToken(address(medqToken));
        vm.stopBroadcast();

        // Authorize QuestManager to submit reviews
        console.log("Authorizing QuestManager as reviewer...");
        vm.startBroadcast(deployerPrivateKey);
        reputationRegistry.setReviewerAuthorization(address(questManager), true);
        vm.stopBroadcast();

        // Set QuestManager in RewardVault
        console.log("Setting QuestManager in RewardVault...");
        vm.startBroadcast(deployerPrivateKey);
        rewardVault.setQuestManager(address(questManager));
        vm.stopBroadcast();

        // Set QuestManager in BadgeNFT
        console.log("Setting QuestManager in BadgeNFT...");
        vm.startBroadcast(deployerPrivateKey);
        badgeNft.setQuestManager(address(questManager));
        vm.stopBroadcast();

        // Configure BadgeNFT URIs
        console.log("Configuring BadgeNFT URIs...");
        vm.startBroadcast(deployerPrivateKey);
        badgeNft.setBadgeURI(1, "ipfs://bafkreihpk4e7are4vy2ta2jjykezijqwnhi2mrflr6bxnhn4o36isudahq");
        badgeNft.setBadgeURI(2, "ipfs://bafkreihvru352dw5b4qyslzvkcsf5qm7cw3k3y262gcq4e4evvbqzulf6q");
        badgeNft.setBadgeURI(3, "ipfs://bafkreic6lhhm4j62em3jzepbqg3ughcpv7izovujxvjvq4qy6u7qauhwoq");
        badgeNft.setBadgeURI(4, "ipfs://bafkreigzbzacffjlnermzlnynei552tf3djuxgsixsro4hvmpcuyohonf4");
        badgeNft.setBadgeURI(5, "ipfs://bafkreihmqr3haexn5wmktsfhejotpwwpuc7urnr3cvi7h3p57ggz2dns2i");
        badgeNft.setBadgeURI(6, "ipfs://bafkreidhrxrkkca5livv7zr6r4dvoexgyg4i2t4mw4t5qpdf2a6hlfezra");
        badgeNft.setBadgeURI(7, "ipfs://bafkreiagxgdvyvxv5rop66gtuvkzgaw4pei2zph2lxb24kxne4bfmfbsle");
        badgeNft.setBadgeURI(8, "ipfs://bafkreibwqzpefyq3gdj3mqt53m6yqrt2ttwa37osx7qnp44prcfjdcd3mq");
        badgeNft.setBadgeURI(9, "ipfs://bafkreighkh6ww4u3354ja6xx4ahct7n2lx6ba7blimfff4g5s2mgox3u2q");
        badgeNft.setBadgeURI(10, "ipfs://bafkreie5qf24hp4xm7l2gjbjkjr4re7ubs7uoqm6sxo3wkyri3kbghi2qe");
        vm.stopBroadcast();
        console.log("BadgeNFT URIs configured.");

        // Authorize completion oracle
        // Default: use deployer as oracle (can be changed via COMPLETION_ORACLE env var)
        address completionOracle;
        try vm.envAddress("COMPLETION_ORACLE") returns (address oracle) {
            completionOracle = oracle;
        } catch {
            completionOracle = deployer; // Default to deployer if not set
        }

        console.log("Authorizing completion oracle...");
        vm.startBroadcast(deployerPrivateKey);
        questManager.setCompletionOracle(completionOracle, true);
        vm.stopBroadcast();
        console.log("Completion oracle authorized:", completionOracle);

        // 10. Summary
        console.log("\n=== Deployment Summary ===");
        console.log("IdentityRegistry:", address(identityRegistry));
        console.log("ReputationRegistry:", address(reputationRegistry));
        console.log("ValidationRegistry:", address(validationRegistry));
        console.log("AgentRegistryAdapter:", address(agentRegistryAdapter));
        console.log("MedqToken (ERC-20):", address(medqToken));
        console.log("RewardVault:", address(rewardVault));
        console.log("BadgeNFT (ERC-721):", address(badgeNft));
        console.log("QuestManager:", address(questManager));
        console.log("Completion Oracle:", completionOracle);
        console.log("\n=== Next Steps ===");
        console.log("1. Register Agent: forge script script/RegisterAgent.s.sol:RegisterAgent --rpc-url testnet --broadcast");
        console.log("2. Update backend .env with:");
        console.log("   - QUEST_MANAGER_ADDRESS=", address(questManager));
        console.log("   - COMPLETION_ORACLE=", completionOracle);
        console.log("   - PRIVATE_KEY (must match oracle address if COMPLETION_ORACLE is set)");
    }
}
