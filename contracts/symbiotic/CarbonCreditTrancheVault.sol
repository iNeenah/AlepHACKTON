// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "./VotingPowerProvider.sol";

/**
 * @title CarbonCreditTrancheVault
 * @dev Tranche-based vault for carbon credit staking with Senior, Mezzanine, and Junior tranches
 */
contract CarbonCreditTrancheVault is Ownable, ReentrancyGuard {
    
    enum TrancheType { SENIOR, MEZZANINE, JUNIOR }
    
    struct TrancheInfo {
        uint256 totalDeposited;
        uint256 totalShares;
        uint256 targetAllocation;    // Target percentage (basis points)
        uint256 yieldBooster;        // Yield multiplier (basis points)
        uint256 slashingPriority;    // 0 = first to slash, 2 = last to slash
        uint256 lockupPeriod;        // Blocks
        bool acceptingDeposits;
        mapping(address => uint256) shares;
        mapping(address => uint256) lastDepositBlock;
    }
    
    struct UserPosition {
        uint256 seniorShares;
        uint256 mezzanineShares;
        uint256 juniorShares;
        uint256 totalValue;
        uint256 totalRewardsClaimed;
    }
    
    // Core state
    IERC20 public immutable asset;
    VotingPowerProvider public votingPowerProvider;
    
    mapping(TrancheType => TrancheInfo) public tranches;
    mapping(address => UserPosition) public userPositions;
    
    // Configuration
    uint256 public constant BASIS_POINTS = 10000;
    uint256 public rewardRate = 1000; // 10% base APY
    uint256 public totalCarbonOffset;
    bool public emergencyMode = false;
    
    // Events
    event Deposit(address indexed user, TrancheType indexed tranche, uint256 assets, uint256 shares);
    event Withdraw(address indexed user, TrancheType indexed tranche, uint256 shares, uint256 assets);
    event SlashingExecuted(TrancheType indexed tranche, uint256 amount, string reason);
    event CarbonCreditRetired(uint256 indexed creditId, uint256 carbonAmount, address indexed user);
    
    constructor(address _asset, address _votingPowerProvider) {
        require(_asset != address(0) && _votingPowerProvider != address(0), "Invalid addresses");
        
        asset = IERC20(_asset);
        votingPowerProvider = VotingPowerProvider(_votingPowerProvider);
        
        _initializeTranches();
    }
    
    function _initializeTranches() internal {
        // Senior: 40% allocation, 80% yield, low risk
        tranches[TrancheType.SENIOR].targetAllocation = 4000;
        tranches[TrancheType.SENIOR].yieldBooster = 8000;
        tranches[TrancheType.SENIOR].slashingPriority = 2;
        tranches[TrancheType.SENIOR].lockupPeriod = 201600; // ~30 days
        tranches[TrancheType.SENIOR].acceptingDeposits = true;
        
        // Mezzanine: 35% allocation, 100% yield, medium risk
        tranches[TrancheType.MEZZANINE].targetAllocation = 3500;
        tranches[TrancheType.MEZZANINE].yieldBooster = 10000;
        tranches[TrancheType.MEZZANINE].slashingPriority = 1;
        tranches[TrancheType.MEZZANINE].lockupPeriod = 100800; // ~15 days
        tranches[TrancheType.MEZZANINE].acceptingDeposits = true;
        
        // Junior: 25% allocation, 150% yield, high risk
        tranches[TrancheType.JUNIOR].targetAllocation = 2500;
        tranches[TrancheType.JUNIOR].yieldBooster = 15000;
        tranches[TrancheType.JUNIOR].slashingPriority = 0;
        tranches[TrancheType.JUNIOR].lockupPeriod = 50400; // ~7 days
        tranches[TrancheType.JUNIOR].acceptingDeposits = true;
    }
    
    function deposit(TrancheType tranche, uint256 assets) 
        external 
        nonReentrant 
        returns (uint256 shares) 
    {
        require(assets > 0, "Cannot deposit zero");
        require(tranches[tranche].acceptingDeposits, "Tranche not accepting deposits");
        require(!emergencyMode, "Emergency mode active");
        
        shares = _convertToShares(assets, tranche);
        require(shares > 0, "Zero shares minted");
        
        asset.transferFrom(msg.sender, address(this), assets);
        
        tranches[tranche].totalDeposited += assets;
        tranches[tranche].totalShares += shares;
        tranches[tranche].shares[msg.sender] += shares;
        tranches[tranche].lastDepositBlock[msg.sender] = block.number;
        
        _updateUserPosition(msg.sender, tranche, shares, true);
        
        // Register with VotingPowerProvider
        votingPowerProvider.depositStake(address(this), assets);
        
        emit Deposit(msg.sender, tranche, assets, shares);
        return shares;
    }
    
    function withdraw(TrancheType tranche, uint256 shares) 
        external 
        nonReentrant 
        returns (uint256 assets) 
    {
        require(shares > 0, "Cannot withdraw zero");
        require(tranches[tranche].shares[msg.sender] >= shares, "Insufficient shares");
        
        // Check lockup period
        uint256 depositBlock = tranches[tranche].lastDepositBlock[msg.sender];
        require(
            block.number >= depositBlock + tranches[tranche].lockupPeriod || emergencyMode,
            "Lockup period not met"
        );
        
        assets = _convertToAssets(shares, tranche);
        require(assets > 0, "Zero assets calculated");
        
        tranches[tranche].totalShares -= shares;
        tranches[tranche].totalDeposited -= assets;
        tranches[tranche].shares[msg.sender] -= shares;
        
        _updateUserPosition(msg.sender, tranche, shares, false);
        
        votingPowerProvider.withdrawStake(address(this), assets);
        asset.transfer(msg.sender, assets);
        
        emit Withdraw(msg.sender, tranche, shares, assets);
        return assets;
    }
    
    function executeSlashing(uint256 slashAmount, string calldata reason) external onlyOwner {
        require(slashAmount > 0, "Cannot slash zero");
        
        uint256 remainingSlash = slashAmount;
        TrancheType[3] memory slashOrder = [TrancheType.JUNIOR, TrancheType.MEZZANINE, TrancheType.SENIOR];
        
        for (uint256 i = 0; i < 3 && remainingSlash > 0; i++) {
            TrancheType tranche = slashOrder[i];
            uint256 trancheAssets = tranches[tranche].totalDeposited;
            
            if (trancheAssets > 0) {
                uint256 toSlash = remainingSlash > trancheAssets ? trancheAssets : remainingSlash;
                
                tranches[tranche].totalDeposited -= toSlash;
                remainingSlash -= toSlash;
                
                emit SlashingExecuted(tranche, toSlash, reason);
            }
        }
    }
    
    function retireCarbonCredit(uint256 creditId, uint256 carbonAmount) external {
        totalCarbonOffset += carbonAmount;
        emit CarbonCreditRetired(creditId, carbonAmount, msg.sender);
    }
    
    // Internal helper functions
    function _convertToShares(uint256 assets, TrancheType tranche) internal view returns (uint256) {
        uint256 totalShares = tranches[tranche].totalShares;
        uint256 totalAssets = tranches[tranche].totalDeposited;
        
        if (totalAssets == 0 || totalShares == 0) return assets;
        return (assets * totalShares) / totalAssets;
    }
    
    function _convertToAssets(uint256 shares, TrancheType tranche) internal view returns (uint256) {
        uint256 totalShares = tranches[tranche].totalShares;
        uint256 totalAssets = tranches[tranche].totalDeposited;
        
        if (totalShares == 0) return 0;
        return (shares * totalAssets) / totalShares;
    }
    
    function _updateUserPosition(address user, TrancheType tranche, uint256 shares, bool isDeposit) internal {
        UserPosition storage position = userPositions[user];
        
        if (isDeposit) {
            if (tranche == TrancheType.SENIOR) position.seniorShares += shares;
            else if (tranche == TrancheType.MEZZANINE) position.mezzanineShares += shares;
            else position.juniorShares += shares;
        } else {
            if (tranche == TrancheType.SENIOR) position.seniorShares -= shares;
            else if (tranche == TrancheType.MEZZANINE) position.mezzanineShares -= shares;
            else position.juniorShares -= shares;
        }
        
        position.totalValue = 
            _convertToAssets(position.seniorShares, TrancheType.SENIOR) +
            _convertToAssets(position.mezzanineShares, TrancheType.MEZZANINE) +
            _convertToAssets(position.juniorShares, TrancheType.JUNIOR);
    }
    
    // View functions
    function getTrancheInfo(TrancheType tranche) external view returns (
        uint256 totalDeposited,
        uint256 totalShares,
        uint256 targetAllocation,
        uint256 currentAPY,
        uint256 lockupPeriod,
        bool acceptingDeposits
    ) {
        TrancheInfo storage info = tranches[tranche];
        uint256 currentAPY = (rewardRate * info.yieldBooster) / BASIS_POINTS;
        
        return (
            info.totalDeposited,
            info.totalShares,
            info.targetAllocation,
            currentAPY,
            info.lockupPeriod,
            info.acceptingDeposits
        );
    }
    
    function getUserPosition(address user) external view returns (UserPosition memory) {
        return userPositions[user];
    }
    
    function getUserShares(address user, TrancheType tranche) external view returns (uint256) {
        return tranches[tranche].shares[user];
    }
    
    // Admin functions
    function toggleEmergencyMode() external onlyOwner {
        emergencyMode = !emergencyMode;
    }
    
    function updateTrancheStatus(TrancheType tranche, bool acceptingDeposits) external onlyOwner {
        tranches[tranche].acceptingDeposits = acceptingDeposits;
    }
}