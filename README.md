# 🌱 Carbon Credit Marketplace

A decentralized marketplace for trading verified carbon credits on the blockchain. This platform enables individuals and businesses to easily buy, sell, and retire carbon credits, contributing to environmental sustainability.

## 🚀 Features

- **Mint Carbon Credits**: Create verified carbon credit NFTs
- **Marketplace Trading**: Buy and sell carbon credits
- **Credit Retirement**: Retire credits to offset emissions
- **Web3 Integration**: MetaMask wallet support
- **Real-time Updates**: Live marketplace data
- **Mobile Responsive**: Works on all devices

## 🛠️ Technology Stack

- **Frontend**: Next.js 14, React, TypeScript, Tailwind CSS
- **Blockchain**: Ethereum, Solidity
- **Smart Contracts**: OpenZeppelin ERC-721
- **Development**: Hardhat, Ethers.js
- **Testing**: Chai, Mocha

## 📋 Prerequisites

- Node.js (v18 or later)
- npm or yarn
- MetaMask wallet
- Git

## ⚡ Quick Start

### 1. Clone and Install

```bash
git clone <your-repo-url>
cd carbon-credit-marketplace
npm install
```

### 2. Environment Setup

```bash
cp .env.example .env
# Edit .env with your configuration
```

### 3. Deploy Smart Contract

```bash
# Start local blockchain
npx hardhat node

# In another terminal, deploy contract
npx hardhat run scripts/deploy.js --network localhost
```

### 4. Start Frontend

```bash
npm run dev
```

Visit `http://localhost:3000` to see the application.

## 🧪 Testing

### Run Smart Contract Tests

```bash
npx hardhat test
```

### Run Frontend Tests

```bash
npm run test
```

## 📱 Usage

### For Users

1. **Connect Wallet**: Click "Connect Wallet" and approve MetaMask connection
2. **Browse Marketplace**: View available carbon credits
3. **Purchase Credits**: Buy credits with ETH
4. **Retire Credits**: Use credits to offset your emissions
5. **View Portfolio**: Track your owned credits

### For Verifiers

1. **Mint Credits**: Create new verified carbon credit NFTs
2. **Set Metadata**: Add project details and verification data
3. **Monitor Credits**: Track issued credits and their usage

## 💼 Business Model

- **Transaction Fees**: 2-3% fee on marketplace transactions
- **Verification Services**: Premium verification for carbon projects
- **Corporate Dashboards**: Analytics and reporting for businesses
- **API Access**: Developer access to marketplace data

## 🌍 Environmental Impact

Each carbon credit represents:
- 1 tonne of CO₂ equivalent removed or prevented
- Verified environmental projects
- Traceable impact through blockchain
- Permanent retirement records

## 🔧 Development

### Project Structure

```
├── app/                 # Next.js app directory
├── components/          # React components
├── contracts/           # Solidity smart contracts
├── scripts/            # Deployment scripts
├── test/               # Contract tests
├── hooks/              # Custom React hooks
└── public/             # Static assets
```

### Key Components

- **`CarbonCreditNFT.sol`**: Main smart contract
- **`Web3Provider.tsx`**: Web3 context provider
- **`CarbonCreditCard.tsx`**: Credit display component
- **`MintCarbonCredit.tsx`**: Minting interface

### Smart Contract Functions

```solidity
// Mint new carbon credit
function mintCarbonCredit(address to, uint256 carbonAmount, ...)

// List credit for sale
function listForSale(uint256 tokenId, uint256 price)

// Purchase credit
function buyCarbonCredit(uint256 tokenId) payable

// Retire credit
function retireCarbonCredit(uint256 tokenId)
```

## 🚀 Deployment

### Testnet Deployment

```bash
# Deploy to Sepolia testnet
npx hardhat run scripts/deploy.js --network sepolia
```

### Mainnet Deployment

```bash
# Deploy to Ethereum mainnet
npx hardhat run scripts/deploy.js --network mainnet
```

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Open Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

- 📧 Email: support@carboncreditmarketplace.com
- 💬 Discord: [Join our community](https://discord.gg/carboncredits)
- 📖 Documentation: [docs.carboncreditmarketplace.com](https://docs.carboncreditmarketplace.com)

## 🎯 Roadmap

- [ ] IPFS integration for metadata storage
- [ ] Layer 2 scaling (Polygon, Arbitrum)
- [ ] Mobile app development
- [ ] Carbon project verification API
- [ ] Corporate dashboard
- [ ] Token fractionalization
- [ ] Cross-chain compatibility
- [ ] DAO governance

## 🏆 Awards & Recognition

- 🥇 Best Environmental Impact - Blockchain Hackathon 2024
- 🌟 Top 10 Climate Tech Startups - Green Tech Awards
- 🚀 Most Innovative Use of Blockchain - EthGlobal

---

Made with 💚 for the planet