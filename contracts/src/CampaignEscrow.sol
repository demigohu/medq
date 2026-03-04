// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {SafeERC20} from "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";

/**
 * @title CampaignEscrow
 * @notice Holds partner-funded token rewards (e.g. USDC) for campaign quest completions.
 *         Partner deposits, oracle releases to participants on quest completion.
 *         On Hedera: HTS tokens (e.g. USDC) require token association before receive.
 *         This contract auto-associates on setRewardToken. Participants must associate
 *         the reward token with their account before receiving rewards.
 */
contract CampaignEscrow is Ownable {
    using SafeERC20 for IERC20;

    /// @notice Authorized address that can release rewards (backend oracle)
    address public rewardReleaser;

    /// @notice Token used for campaign rewards (e.g. USDC)
    IERC20 public rewardToken;

    /// @notice campaignId (bytes32) => available balance
    mapping(bytes32 => uint256) private _campaignBalances;

    event RewardReleaserUpdated(address indexed newReleaser);
    event RewardTokenUpdated(address indexed newToken);
    event Deposited(bytes32 indexed campaignId, address indexed depositor, uint256 amount);
    event Released(bytes32 indexed campaignId, address indexed recipient, uint256 amount);

    /// @dev Hedera HTS precompile (HIP-206)
    address private constant HTS_PRECOMPILE = address(0x167);
    /// @dev HederaResponseCodes.SUCCESS
    int32 private constant HTS_SUCCESS = 22;
    /// @dev HederaResponseCodes.TOKEN_ALREADY_ASSOCIATED_TO_ACCOUNT
    int32 private constant HTS_TOKEN_ALREADY_ASSOCIATED = 194;

    error CampaignEscrow__OnlyRewardReleaser();
    error CampaignEscrow__InvalidReleaser();
    error CampaignEscrow__TokenNotConfigured();
    error CampaignEscrow__InsufficientBalance(bytes32 campaignId, uint256 requested, uint256 available);
    error CampaignEscrow__ZeroAmount();
    error CampaignEscrow__HtsAssociationFailed(int32 responseCode);

    modifier onlyRewardReleaser() {
        if (msg.sender != rewardReleaser) revert CampaignEscrow__OnlyRewardReleaser();
        _;
    }

    constructor(address owner_) Ownable(owner_) {}

    function setRewardReleaser(address releaser_) external onlyOwner {
        if (releaser_ == address(0)) revert CampaignEscrow__InvalidReleaser();
        rewardReleaser = releaser_;
        emit RewardReleaserUpdated(releaser_);
    }

    function setRewardToken(address tokenAddress) external onlyOwner {
        if (tokenAddress == address(0)) revert CampaignEscrow__TokenNotConfigured();
        rewardToken = IERC20(tokenAddress);
        emit RewardTokenUpdated(tokenAddress);

        // Hedera HTS: associate this contract with the token so it can receive deposits.
        // Required for HTS tokens (e.g. USDC on Hedera). No-op on non-Hedera chains.
        _htsAssociateToken(address(this), tokenAddress);
    }

    /// @dev Call Hedera HTS precompile to associate account with token (HIP-206).
    ///      Ignores TOKEN_ALREADY_ASSOCIATED. On non-Hedera chains, precompile may not exist; we skip.
    function _htsAssociateToken(address account, address token) private {
        (bool success, bytes memory result) =
            HTS_PRECOMPILE.call(abi.encodeWithSelector(bytes4(keccak256("associateToken(address,address)")), account, token));
        if (!success) return; // Non-Hedera or precompile unavailable
        if (result.length < 32) return;
        int32 code = abi.decode(result, (int32));
        if (code != HTS_SUCCESS && code != HTS_TOKEN_ALREADY_ASSOCIATED) {
            revert CampaignEscrow__HtsAssociationFailed(code);
        }
    }

    /**
     * @notice Partner deposits tokens for a campaign.
     * @param campaignId bytes32 - keccak256(abi.encodePacked(campaignUuid)) from backend
     * @param amount Token amount (with token decimals)
     */
    function deposit(bytes32 campaignId, uint256 amount) external {
        if (address(rewardToken) == address(0)) revert CampaignEscrow__TokenNotConfigured();
        if (amount == 0) revert CampaignEscrow__ZeroAmount();

        rewardToken.safeTransferFrom(msg.sender, address(this), amount);
        _campaignBalances[campaignId] += amount;

        emit Deposited(campaignId, msg.sender, amount);
    }

    /**
     * @notice Release reward to quest completer. Called by backend oracle.
     * @param campaignId bytes32 - must match the campaign UUID hash used in deposit
     * @param recipient Participant who completed the quest
     * @param amount Token amount to release
     */
    function releaseReward(bytes32 campaignId, address recipient, uint256 amount)
        external
        onlyRewardReleaser
    {
        if (address(rewardToken) == address(0)) revert CampaignEscrow__TokenNotConfigured();
        if (amount == 0) revert CampaignEscrow__ZeroAmount();

        uint256 available = _campaignBalances[campaignId];
        if (amount > available) {
            revert CampaignEscrow__InsufficientBalance(campaignId, amount, available);
        }

        _campaignBalances[campaignId] = available - amount;
        rewardToken.safeTransfer(recipient, amount);

        emit Released(campaignId, recipient, amount);
    }

    function campaignBalance(bytes32 campaignId) external view returns (uint256) {
        return _campaignBalances[campaignId];
    }
}
