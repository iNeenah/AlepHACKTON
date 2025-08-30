import pkg from 'hardhat';
const { ethers } = pkg;

async function main() {
  console.log("🚀 Starting Local Demo Setup...\n");

  // Get the deployer account
  const [deployer, user1, user2] = await ethers.getSigners();
  console.log("📝 Deploying with account:", deployer.address);
  console.log("👤 Demo users:", user1.address, user2.address);
  
  const balance = await ethers.provider.getBalance(deployer.address);
  console.log("💰 Deployer balance:", ethers.formatEther(balance), "ETH\n");

  // Deploy the CarbonCreditNFT contract
  console.log("🌱 Deploying CarbonCreditNFT contract...");
  const CarbonCreditNFT = await ethers.getContractFactory("CarbonCreditNFT");
  const carbonCreditNFT = await CarbonCreditNFT.deploy();
  await carbonCreditNFT.waitForDeployment();
  
  const contractAddress = await carbonCreditNFT.getAddress();
  console.log("✅ CarbonCreditNFT deployed to:", contractAddress);

  // Add deployer as verifier
  console.log("\n🔐 Setting up verifiers...");
  await carbonCreditNFT.addVerifier(deployer.address);
  await carbonCreditNFT.addVerifier(user1.address);
  console.log("✅ Verifiers added");

  // Create demo carbon credits
  console.log("\n🌍 Creating demo carbon credits...");
  
  const demoCredits = [
    {
      to: deployer.address,
      carbonAmount: ethers.parseUnits("100", 0), // 100 tons
      projectName: "Amazon Rainforest Conservation",
      location: "Brazil",
      expiryDate: Math.floor(Date.now() / 1000) + (365 * 24 * 60 * 60), // 1 year
      metadataURI: "https://ipfs.io/ipfs/QmDemo1",
      price: ethers.parseEther("0.1")
    },
    {
      to: deployer.address,
      carbonAmount: ethers.parseUnits("250", 0), // 250 tons
      projectName: "Solar Farm Initiative",
      location: "California, USA",
      expiryDate: Math.floor(Date.now() / 1000) + (365 * 24 * 60 * 60),
      metadataURI: "https://ipfs.io/ipfs/QmDemo2",
      price: ethers.parseEther("0.25")
    },
    {
      to: deployer.address,
      carbonAmount: ethers.parseUnits("500", 0), // 500 tons
      projectName: "Wind Energy Project",
      location: "Texas, USA",
      expiryDate: Math.floor(Date.now() / 1000) + (365 * 24 * 60 * 60),
      metadataURI: "https://ipfs.io/ipfs/QmDemo3",
      price: ethers.parseEther("0.5")
    },
    {
      to: user1.address,
      carbonAmount: ethers.parseUnits("150", 0), // 150 tons
      projectName: "Reforestation Program",
      location: "Indonesia",
      expiryDate: Math.floor(Date.now() / 1000) + (365 * 24 * 60 * 60),
      metadataURI: "https://ipfs.io/ipfs/QmDemo4",
      price: ethers.parseEther("0.15")
    }
  ];

  for (let i = 0; i < demoCredits.length; i++) {
    const credit = demoCredits[i];
    console.log(`⚡ Minting credit ${i + 1}: ${credit.projectName}`);
    
    const tx = await carbonCreditNFT.mintCarbonCredit(
      credit.to,
      credit.carbonAmount,
      credit.projectName,
      credit.location,
      credit.expiryDate,
      credit.metadataURI
    );
    await tx.wait();
    
    // List for sale
    const listTx = await carbonCreditNFT.listForSale(i, credit.price);
    await listTx.wait();
    
    console.log(`✅ Credit ${i + 1} minted and listed for ${ethers.formatEther(credit.price)} ETH`);
  }

  // Create some user credits (not for sale)
  console.log("\n💼 Creating user portfolio credits...");
  const userCredit = await carbonCreditNFT.connect(user1).mintCarbonCredit(
    user1.address,
    ethers.parseUnits("75", 0),
    "Ocean Cleanup Initiative",
    "Pacific Ocean",
    Math.floor(Date.now() / 1000) + (365 * 24 * 60 * 60),
    "https://ipfs.io/ipfs/QmDemo5"
  );
  await userCredit.wait();
  console.log("✅ User portfolio credit created");

  // Display summary
  console.log("\n📋 Demo Setup Complete!");
  console.log("========================");
  console.log("🌱 Contract Address:", contractAddress);
  console.log("🔗 Network: Localhost (Hardhat)");
  console.log("👤 Deployer:", deployer.address);
  console.log("👥 Demo Users:", user1.address, user2.address);
  console.log("🛒 Credits for Sale: 4");
  console.log("💼 User Portfolio: 1 credit");
  
  console.log("\n🎯 Next Steps:");
  console.log("1. Update your .env.local with:");
  console.log(`   NEXT_PUBLIC_CONTRACT_ADDRESS=${contractAddress}`);
  console.log("2. Start your app: npm run dev");
  console.log("3. Connect MetaMask to localhost:8545");
  console.log("4. Import test accounts using private keys from Hardhat");
  
  console.log("\n🔑 Test Account Private Keys:");
  console.log("Deployer:", "0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80");
  console.log("User1:", "0x59c6995e998f97a5a0044966f0945389dc9e86dae88c7a8412f4603b6b78690d");
  console.log("User2:", "0x5de4111afa1a4b94908f83103eb1f1706367c2e68ca870fc3fb9a804cdab365a");
  
  console.log("\n🎉 Demo ready! Your marketplace is fully functional locally!");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Demo setup failed:", error);
    process.exit(1);
  });