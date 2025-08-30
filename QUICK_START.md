# 🚀 Quick Start Guide

Get your Carbon Credit Marketplace running in minutes!

## Prerequisites

- **Node.js** v18 or higher
- **npm** or **yarn**
- **MetaMask** browser extension
- **Git**

## 🎯 One-Command Demo Setup

### Option 1: Full Demo (Recommended)
```bash
# Clone the repository
git clone https://github.com/iNeenah/AlepHACKTON.git
cd AlepHACKTON/hackaton

# Install dependencies
npm install

# Start local blockchain (keep this terminal open)
npx hardhat node

# In a new terminal, deploy and setup demo
npm run demo

# Start the app
npm run dev
```

### Option 2: Manual Setup
```bash
# 1. Clone & Install
git clone https://github.com/iNeenah/AlepHACKTON.git
cd AlepHACKTON/hackaton
npm install

# 2. Environment Setup
cp .env.example .env.local

# 3. Start Local Blockchain (Terminal 1)
npx hardhat node

# 4. Deploy & Setup Demo (Terminal 2)
npm run deploy:localhost
npm run demo-data

# 5. Start the App
npm run dev
```

## 🦊 MetaMask Configuration

1. **Add Localhost Network:**
   - Network Name: `Localhost 8545`
   - RPC URL: `http://localhost:8545`
   - Chain ID: `1337`
   - Currency Symbol: `ETH`

2. **Import Test Accounts:**
   ```
   Deployer: 0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80
   User1:    0x59c6995e998f97a5a0044966f0945389dc9e86dae88c7a8412f4603b6b78690d
   User2:    0x5de4111afa1a4b94908f83103eb1f1706367c2e68ca870fc3fb9a804cdab365a
   ```

## 🎉 You're Ready!

Visit `http://localhost:3000` and start exploring:

- **🛒 Marketplace**: Browse and purchase carbon credits
- **💼 Portfolio**: Manage your owned credits
- **⚡ Create**: Mint new carbon credits
- **🏦 Vaults**: Explore Symbiotic vault integration
- **📊 Analytics**: View market statistics

## 🌟 Demo Features

Your local demo includes:
- ✅ 4 carbon credits for sale
- ✅ 1 user portfolio credit
- ✅ Multiple test accounts with ETH
- ✅ Full marketplace functionality
- ✅ Symbiotic Protocol integration

## 🔧 Troubleshooting

### Common Issues

**"Contract not found" error:**
```bash
# Make sure you ran the demo setup
npm run demo
```

**MetaMask connection issues:**
- Ensure you're connected to localhost:8545
- Reset MetaMask account if transactions fail

**Port already in use:**
```bash
# Kill any process using port 8545
npx kill-port 8545
```

## 🌐 Production Deployment

For Sepolia testnet deployment:
```bash
# Get Sepolia ETH from faucet
# Update .env.local with your private key
npm run deploy:sepolia
```

For detailed production deployment, see [DEPLOYMENT.md](./DEPLOYMENT.md).

## 🏆 Key Features

- ✅ **Secure Smart Contracts** - OpenZeppelin + Hardhat
- ✅ **Modern UI** - Next.js + Tailwind CSS
- ✅ **Symbiotic Integration** - Tranche-based vaults
- ✅ **Responsive Design** - Works on mobile
- ✅ **Full Marketplace** - Buy, sell, retire credits
- ✅ **Complete Documentation** - Step-by-step guides

---

**Start in less than 5 minutes! 🚀**