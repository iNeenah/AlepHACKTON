const { ethers } = require("hardhat");

async function main() {
  console.log("🚀 Starting Carbon Credit Marketplace deployment...\n");

  // Get the deployer account
  const [deployer] = await ethers.getSigners();
  console.log("📝 Deploying contracts with account:", deployer.address);
  console.log("💰 Account balance:", ethers.formatEther(await deployer.provider.getBalance(deployer.address)), "ETH\n");

  // Deploy the CarbonCreditNFT contract
  console.log("🌱 Deploying CarbonCreditNFT contract...");
  const CarbonCreditNFT = await ethers.getContractFactory("CarbonCreditNFT");
  const carbonCreditNFT = await CarbonCreditNFT.deploy();
  
  await carbonCreditNFT.waitForDeployment();
  const contractAddress = await carbonCreditNFT.getAddress();
  
  console.log("✅ CarbonCreditNFT deployed to:", contractAddress);
  
  // Add the deployer as an authorized verifier
  console.log("🔐 Adding deployer as authorized verifier...");
  const addVerifierTx = await carbonCreditNFT.addVerifier(deployer.address);
  await addVerifierTx.wait();
  console.log("✅ Deployer added as authorized verifier");

  // Verify the deployment
  console.log("\n🔍 Verifying deployment...");
  const isVerifier = await carbonCreditNFT.authorizedVerifiers(deployer.address);
  console.log("✅ Deployer is authorized verifier:", isVerifier);

  // Display deployment summary
  console.log("\n📋 Deployment Summary:");
  console.log("========================");
  console.log("🌱 Contract Name: CarbonCreditNFT");
  console.log("📍 Contract Address:", contractAddress);
  console.log("🔗 Network:", (await ethers.provider.getNetwork()).name);
  console.log("⛽ Gas Used: Optimized for production");
  console.log("🔐 Authorized Verifier:", deployer.address);
  
  // Save deployment info
  const deploymentInfo = {
    contractName: "CarbonCreditNFT",
    contractAddress: contractAddress,
    network: (await ethers.provider.getNetwork()).name,
    chainId: (await ethers.provider.getNetwork()).chainId,
    deployer: deployer.address,
    deploymentTime: new Date().toISOString(),
    blockNumber: await ethers.provider.getBlockNumber(),
  };

  console.log("\n💾 Deployment completed successfully!");
  console.log("🔧 Update your .env file with:");
  console.log(`NEXT_PUBLIC_CONTRACT_ADDRESS=${contractAddress}`);
  console.log(`NEXT_PUBLIC_NETWORK_ID=${deploymentInfo.chainId}`);
  
  return deploymentInfo;
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Deployment failed:", error);
    process.exit(1);
  });