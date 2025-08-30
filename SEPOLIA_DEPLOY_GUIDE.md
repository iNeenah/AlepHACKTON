# 🚀 Sepolia Deploy Guide - Step by Step

## 📋 Prerequisites

### 1. **Get Infura API Key**
1. Go to [infura.io](https://infura.io)
2. Create account and new project
3. Copy your Project ID

### 2. **Get Private Key**
1. Open MetaMask
2. Click account menu → Account Details → Export Private Key
3. ⚠️ **NEVER share this key publicly!**

### 3. **Get Sepolia ETH**
1. Go to [sepoliafaucet.com](https://sepoliafaucet.com)
2. Enter your wallet address
3. Request test ETH (you need ~0.02 ETH for deployment)

## 🔧 Configuration

### 1. **Create .env.local file**
```bash
# Copy the example
cp .env.example .env.local
```

### 2. **Edit .env.local with your values:**
```bash
# 🔗 Blockchain Configuration - Sepolia Testnet
NEXT_PUBLIC_CONTRACT_ADDRESS=will_be_updated_after_deploy
NEXT_PUBLIC_NETWORK_ID=11155111
NEXT_PUBLIC_RPC_URL=https://sepolia.infura.io/v3/YOUR_INFURA_PROJECT_ID
NEXT_PUBLIC_CHAIN_NAME=Sepolia Testnet
NEXT_PUBLIC_CHAIN_ID=11155111

# 🏦 Symbiotic Protocol Configuration - Sepolia (already set)
NEXT_PUBLIC_VAULT_FACTORY_ADDRESS=0x407A039D94948484D356eFB765b3c74382A050B4
NEXT_PUBLIC_OPERATOR_REGISTRY_ADDRESS=0x6F75a4ffF97326A00e52662d82EA4FdE86a2C548
NEXT_PUBLIC_WSTETH_ADDRESS=0xB82381A3fBD3FaFA77B3a7bE693342618240067b
NEXT_PUBLIC_STETH_ADDRESS=0x3e3FE7dBc6B4C189E7128855dD526361c49b40Af

# 🔐 Private Keys (for deployment)
PRIVATE_KEY=YOUR_PRIVATE_KEY_HERE

# 🔑 API Keys
INFURA_PROJECT_ID=YOUR_INFURA_PROJECT_ID
SEPOLIA_URL=https://sepolia.infura.io/v3/YOUR_INFURA_PROJECT_ID
ETHERSCAN_API_KEY=your_etherscan_api_key_optional

# 🔧 Development Settings
NODE_ENV=development
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

## 🚀 Deployment

### Option 1: Automated Script (Recommended)

**Windows:**
```bash
deploy-sepolia.bat
```

**Mac/Linux:**
```bash
chmod +x deploy-sepolia.sh
./deploy-sepolia.sh
```

### Option 2: Manual Steps

```bash
# 1. Install dependencies
npm install

# 2. Compile contracts
npm run compile

# 3. Deploy to Sepolia
npm run deploy:sepolia
```

## 📝 After Deployment

### 1. **Update .env.local**
Copy the contract address from the deployment output and update:
```bash
NEXT_PUBLIC_CONTRACT_ADDRESS=0xYourDeployedContractAddress
```

### 2. **Verify on Etherscan**
- Go to the Etherscan URL shown in deployment output
- Your contract should appear there

### 3. **Get wstETH for Testing**

#### Step 1: Get stETH
1. Go to: https://sepolia.etherscan.io/address/0x3e3FE7dBc6B4C189E7128855dD526361c49b40Af#writeProxyContract
2. Connect your wallet
3. Find function `16. submit`
4. Call with any referral address (or 0x0000000000000000000000000000000000000000)
5. Send some ETH (0.01 ETH is enough)

#### Step 2: Wrap to wstETH
1. Go to: https://sepolia.etherscan.io/address/0xB82381A3fBD3FaFA77B3a7bE693342618240067b
2. Use wrap function to convert stETH → wstETH

### 4. **Start Your App**
```bash
npm run dev
```

Open http://localhost:3000

## 🧪 Testing Your Deployment

### 1. **Connect Wallet**
- Make sure MetaMask is on Sepolia network
- Connect your wallet to the app

### 2. **Test Functions**
1. **Mint Carbon Credit**: Create a new credit
2. **List for Sale**: Put it on marketplace  
3. **Buy Credit**: Purchase from marketplace
4. **Retire Credit**: Use for carbon offset
5. **Vault Integration**: Test Symbiotic features

## 🔍 Troubleshooting

### Common Issues:

#### "Insufficient funds"
- Get more Sepolia ETH from faucet
- Check your wallet balance

#### "Invalid private key"
- Make sure private key is correct (64 characters)
- Remove any 0x prefix

#### "Network error"
- Check Infura URL is correct
- Verify Infura project is active

#### "Contract deployment failed"
- Check gas estimation
- Try again (sometimes network is congested)

#### "Cannot connect to Sepolia"
- Verify RPC URL in .env.local
- Check Infura dashboard for API limits

### Debug Commands:

```bash
# Check network connection
npx hardhat console --network sepolia

# Verify contract compilation
npx hardhat compile

# Check account balance
npx hardhat run scripts/check-balance.js --network sepolia
```

## 📊 Deployment Checklist

- [ ] ✅ Infura API key configured
- [ ] ✅ Private key added to .env.local
- [ ] ✅ Sepolia ETH in wallet (>0.02 ETH)
- [ ] ✅ Dependencies installed
- [ ] ✅ Contracts compiled
- [ ] ✅ Contract deployed successfully
- [ ] ✅ Contract address updated in .env.local
- [ ] ✅ wstETH tokens obtained
- [ ] ✅ App running locally
- [ ] ✅ All functions tested

## 🎯 Success Indicators

When everything is working:
- ✅ Contract appears on Sepolia Etherscan
- ✅ App connects to wallet
- ✅ Can mint carbon credits
- ✅ Marketplace shows listings
- ✅ Vault interface loads
- ✅ Transactions confirm on blockchain

## 🆘 Need Help?

If you encounter issues:
1. Check the troubleshooting section above
2. Verify all environment variables
3. Ensure sufficient Sepolia ETH
4. Try redeploying if needed

The deployment should take 2-5 minutes total once configured properly.