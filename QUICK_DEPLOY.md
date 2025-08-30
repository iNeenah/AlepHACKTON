# 🚀 Quick Deploy Guide - Hackathon Ready

## ⚡ 5-Minute Setup

### 1. 🔧 Environment Setup
```bash
# Copy and configure environment
cp .env.example .env.local

# Edit .env.local with these values:
NEXT_PUBLIC_CONTRACT_ADDRESS=your_deployed_contract_address
NEXT_PUBLIC_NETWORK_ID=11155111
NEXT_PUBLIC_RPC_URL=https://sepolia.infura.io/v3/your_infura_key
NEXT_PUBLIC_CHAIN_NAME=Sepolia Testnet
NEXT_PUBLIC_CHAIN_ID=11155111

# Symbiotic addresses (already configured)
NEXT_PUBLIC_VAULT_FACTORY_ADDRESS=0x407A039D94948484D356eFB765b3c74382A050B4
NEXT_PUBLIC_OPERATOR_REGISTRY_ADDRESS=0x6F75a4ffF97326A00e52662d82EA4FdE86a2C548
NEXT_PUBLIC_WSTETH_ADDRESS=0xB82381A3fBD3FaFA77B3a7bE693342618240067b
NEXT_PUBLIC_STETH_ADDRESS=0x3e3FE7dBc6B4C189E7128855dD526361c49b40Af

PRIVATE_KEY=your_private_key_here
INFURA_PROJECT_ID=your_infura_project_id
```

### 2. 🏗️ Deploy Contract
```bash
# Install dependencies
npm install

# Compile contracts
npm run compile

# Deploy to Sepolia
npm run deploy:sepolia
```

### 3. 💰 Get Test Tokens
1. **Get Sepolia ETH**: https://sepoliafaucet.com/
2. **Get stETH**: Call `submit()` on `0x3e3FE7dBc6B4C189E7128855dD526361c49b40Af`
3. **Wrap to wstETH**: Use `0xB82381A3fBD3FaFA77B3a7bE693342618240067b`

### 4. 🚀 Start App
```bash
# Start development server
npm run dev

# Open http://localhost:3000
```

## 🎪 Demo Script

### Opening (30 seconds)
"Today I'm presenting a revolutionary carbon credit marketplace that combines environmental impact with cutting-edge DeFi security through Symbiotic Protocol."

### Problem Statement (30 seconds)
"Current carbon credit markets lack transparency, security, and accessibility. Traditional systems are centralized, slow, and don't provide real-time verification."

### Solution Demo (3 minutes)

#### 1. **Connect Wallet** (30s)
- Show MetaMask connection
- Display wallet address and network

#### 2. **Browse Marketplace** (30s)
- Show available carbon credits
- Highlight verification details
- Explain project information

#### 3. **Create Carbon Credit** (45s)
- Navigate to mint section
- Fill out project details
- Execute mint transaction
- Show NFT creation

#### 4. **Symbiotic Integration** (45s)
- Navigate to vaults section
- Explain tranche system
- Show deposit interface
- Highlight security benefits

#### 5. **Purchase & Retire** (30s)
- Buy a carbon credit
- Show ownership transfer
- Retire credit for offset
- Display environmental impact

### Technical Architecture (1 minute)
"Built on Ethereum with Solidity smart contracts, Next.js frontend, and integrated with Symbiotic's multi-asset staking vaults for unprecedented security."

### Impact & Future (30 seconds)
"This platform democratizes carbon markets, provides transparent environmental impact tracking, and leverages DeFi innovations for a sustainable future."

## 🛠️ Troubleshooting

### Common Issues:
1. **Contract not deployed**: Run `npm run deploy:sepolia`
2. **No test ETH**: Use Sepolia faucet
3. **RPC errors**: Check Infura key
4. **Wallet connection**: Ensure MetaMask is on Sepolia

### Backup Plans:
1. **Screenshots/Video**: If live demo fails
2. **Localhost Demo**: If Sepolia is down
3. **Code Walkthrough**: Show smart contract code

## 📊 Key Metrics to Highlight

- **Security**: Multi-asset staking protection
- **Transparency**: Blockchain verification
- **Accessibility**: Web3 interface
- **Innovation**: Symbiotic integration
- **Impact**: Real environmental benefits

## 🏆 Judging Criteria Focus

1. **Technical Innovation**: Symbiotic integration
2. **User Experience**: Clean, intuitive interface  
3. **Real-world Impact**: Environmental benefits
4. **Code Quality**: Clean, documented, tested
5. **Presentation**: Clear, compelling story

## ⏰ Time Management

- **Setup**: 5 minutes
- **Demo**: 5 minutes  
- **Q&A**: 2-3 minutes
- **Buffer**: 2 minutes

Total: ~15 minutes max

## 🎯 Success Metrics

✅ **Demo runs smoothly**
✅ **All features work**
✅ **Story is compelling**
✅ **Technical depth shown**
✅ **Questions answered confidently**