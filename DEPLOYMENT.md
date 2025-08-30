# 🚀 Deployment Guide

This guide covers deploying the Carbon Credit Marketplace to various networks.

## 📋 Prerequisites

- Node.js v18+
- npm or yarn
- Hardhat installed
- Private key for deployment account
- RPC URLs for target networks
- Sufficient ETH for gas fees

## 🔧 Environment Setup

1. **Copy environment file**
   ```bash
   cp .env.example .env.local
   ```

2. **Configure environment variables**
   ```bash
   # Required for deployment
   PRIVATE_KEY=your_private_key_here
   SEPOLIA_URL=https://sepolia.infura.io/v3/your_project_id
   MAINNET_URL=https://mainnet.infura.io/v3/your_project_id
   ETHERSCAN_API_KEY=your_etherscan_api_key
   ```

## 🏠 Local Development

### 1. Start Local Blockchain
```bash
npx hardhat node
```

### 2. Deploy to Local Network
```bash
npm run deploy:localhost
```

### 3. Create Demo Data
```bash
npm run demo-data
```

### 4. Start Frontend
```bash
npm run dev
```

## 🧪 Testnet Deployment (Sepolia)

### 1. Get Testnet ETH
- Visit [Sepolia Faucet](https://sepoliafaucet.com/)
- Request test ETH for your deployment account

### 2. Deploy to Sepolia
```bash
npm run deploy:sepolia
```

### 3. Verify Contract
```bash
npm run verify:sepolia
```

### 4. Update Frontend Config
```bash
# Update .env.local
NEXT_PUBLIC_CONTRACT_ADDRESS=your_sepolia_contract_address
NEXT_PUBLIC_NETWORK_ID=11155111
NEXT_PUBLIC_RPC_URL=https://sepolia.infura.io/v3/your_project_id
```

## 🌐 Mainnet Deployment

### ⚠️ Pre-deployment Checklist

- [ ] Smart contracts audited
- [ ] Sufficient ETH for deployment (~0.1 ETH)
- [ ] Frontend tested on testnet
- [ ] Environment variables configured
- [ ] Backup of private keys

### 1. Deploy to Mainnet
```bash
npm run deploy:mainnet
```

### 2. Verify Contract
```bash
npm run verify:mainnet
```

### 3. Update Production Config
```bash
# Update production environment
NEXT_PUBLIC_CONTRACT_ADDRESS=your_mainnet_contract_address
NEXT_PUBLIC_NETWORK_ID=1
NEXT_PUBLIC_RPC_URL=https://mainnet.infura.io/v3/your_project_id
```

## 🔍 Contract Verification

### Automatic Verification
```bash
npx hardhat verify --network sepolia DEPLOYED_CONTRACT_ADDRESS
```

### Manual Verification
1. Go to [Etherscan](https://etherscan.io/verifyContract)
2. Enter contract address
3. Select compiler version: 0.8.20
4. Upload flattened source code
5. Submit for verification

## 📊 Post-Deployment Steps

### 1. Add Authorized Verifiers
```javascript
// Using Hardhat console
npx hardhat console --network sepolia

const contract = await ethers.getContractAt("CarbonCreditNFT", "CONTRACT_ADDRESS");
await contract.addVerifier("VERIFIER_ADDRESS");
```

### 2. Create Initial Carbon Credits
```bash
# Run demo data script on deployed contract
npx hardhat run scripts/demoData.js --network sepolia
```

### 3. Test Core Functionality
- [ ] Mint carbon credit
- [ ] List for sale
- [ ] Purchase credit
- [ ] Retire credit
- [ ] View portfolio

## 🌍 Multi-Chain Deployment

### Polygon Deployment
```bash
# Configure Polygon network
POLYGON_URL=https://polygon-mainnet.infura.io/v3/your_project_id

# Deploy to Polygon
npx hardhat run scripts/deploy.js --network polygon
```

### Arbitrum Deployment
```bash
# Add Arbitrum network to hardhat.config.js
arbitrum: {
  url: "https://arb1.arbitrum.io/rpc",
  accounts: [process.env.PRIVATE_KEY],
  chainId: 42161,
}

# Deploy to Arbitrum
npx hardhat run scripts/deploy.js --network arbitrum
```

## 🔧 Troubleshooting

### Common Issues

**1. Insufficient Gas**
```bash
Error: insufficient funds for intrinsic transaction cost
```
Solution: Add more ETH to deployment account

**2. Nonce Too Low**
```bash
Error: nonce has already been used
```
Solution: Reset account nonce in MetaMask

**3. Contract Size Too Large**
```bash
Error: contract code size exceeds limit
```
Solution: Enable optimizer in hardhat.config.js

**4. Verification Failed**
```bash
Error: contract verification failed
```
Solution: Ensure exact compiler settings match

### Gas Optimization Tips

1. **Enable Optimizer**
   ```javascript
   solidity: {
     settings: {
       optimizer: {
         enabled: true,
         runs: 200,
       },
     },
   }
   ```

2. **Use Gas Reporter**
   ```bash
   npm install hardhat-gas-reporter
   REPORT_GAS=true npm run test
   ```

3. **Estimate Gas Before Deployment**
   ```javascript
   const gasEstimate = await contract.deployTransaction.estimateGas();
   console.log("Estimated gas:", gasEstimate.toString());
   ```

## 📈 Monitoring

### Track Deployment
- Monitor transaction on Etherscan
- Verify contract source code
- Check initial state variables
- Test basic functionality

### Set Up Alerts
- Contract interaction monitoring
- Large transaction alerts
- Error event notifications
- Gas price optimization

## 🔐 Security Considerations

### Pre-Deployment
- [ ] Code audit completed
- [ ] Test coverage > 90%
- [ ] No hardcoded secrets
- [ ] Access controls verified

### Post-Deployment
- [ ] Ownership transferred to multisig
- [ ] Emergency pause mechanism tested
- [ ] Upgrade path documented
- [ ] Monitoring systems active

## 📞 Support

If you encounter issues during deployment:

1. Check the [troubleshooting section](#troubleshooting)
2. Review Hardhat documentation
3. Join our Discord community
4. Create an issue on GitHub

---

**Happy Deploying! 🚀**