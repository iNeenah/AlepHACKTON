import pkg from 'hardhat';
const { ethers } = pkg;
import fs from "fs";
import path from "path";

async function main() {
  console.log("🚀 Starting Carbon Credit Marketplace deployment to Sepolia...\n");

  // Get network info
  const network = await ethers.provider.getNetwork();
  console.log("🌐 Network:", network.name, "| Chain ID:", network.chainId.toString());

  // Get the deployer account
  const [deployer] = await ethers.getSigners();
  console.log("📝 Deploying contracts with account:", deployer.address);
  
  const balance = await ethers.provider.getBalance(deployer.address);
  console.log("💰 Account balance:", ethers.formatEther(balance), "ETH");
  
  if (balance < ethers.parseEther("0.01")) {
    console.log("⚠️  WARNING: Low balance! You might need more Sepolia ETH");
    console.log("🔗 Get Sepolia ETH: https://sepoliafaucet.com/");
  }
  console.log("");

  // Deploy the CarbonCreditNFT contract
  console.log("🌱 Deploying CarbonCreditNFT contract...");
  const CarbonCreditNFT = await ethers.getContractFactory("CarbonCreditNFT");
  
  // Estimate gas
  const deploymentData = CarbonCreditNFT.interface.encodeDeploy([]);
  const gasEstimate = await ethers.provider.estimateGas({
    data: deploymentData
  });
  console.log("⛽ Estimated gas:", gasEstimate.toString());
  
  const carbonCreditNFT = await CarbonCreditNFT.deploy();
  console.log("📤 Transaction sent, waiting for confirmation...");
  
  await carbonCreditNFT.waitForDeployment();
  const contractAddress = await carbonCreditNFT.getAddress();
  
  console.log("✅ CarbonCreditNFT deployed to:", contractAddress);
  console.log("🔗 Sepolia Etherscan:", `https://sepolia.etherscan.io/address/${contractAddress}`);
  
  // Add the deployer as an authorized verifier
  console.log("\n🔐 Adding deployer as authorized verifier...");
  const addVerifierTx = await carbonCreditNFT.addVerifier(deployer.address);
  console.log("📤 Transaction sent:", addVerifierTx.hash);
  await addVerifierTx.wait();
  console.log("✅ Deployer added as authorized verifier");

  // Verify the deployment
  console.log("\n🔍 Verifying deployment...");
  const isVerifier = await carbonCreditNFT.authorizedVerifiers(deployer.address);
  console.log("✅ Deployer is authorized verifier:", isVerifier);
  
  const owner = await carbonCreditNFT.owner();
  console.log("✅ Contract owner:", owner);

  // Display deployment summary
  console.log("\n📋 Deployment Summary:");
  console.log("========================");
  console.log("🌱 Contract Name: CarbonCreditNFT");
  console.log("📍 Contract Address:", contractAddress);
  console.log("🔗 Network:", network.name);
  console.log("🆔 Chain ID:", network.chainId.toString());
  console.log("👤 Deployer:", deployer.address);
  console.log("🔐 Authorized Verifier:", deployer.address);
  console.log("🌐 Etherscan:", `https://sepolia.etherscan.io/address/${contractAddress}`);
  
  // Save deployment info to file
  const deploymentInfo = {
    contractName: "CarbonCreditNFT",
    contractAddress: contractAddress,
    network: network.name,
    chainId: network.chainId.toString(),
    deployer: deployer.address,
    deploymentTime: new Date().toISOString(),
    blockNumber: await ethers.provider.getBlockNumber(),
    etherscanUrl: `https://sepolia.etherscan.io/address/${contractAddress}`,
    transactionHash: carbonCreditNFT.deploymentTransaction()?.hash
  };

  // Save to deployments folder
  const deploymentsDir = path.join(__dirname, "..", "deployments");
  if (!fs.existsSync(deploymentsDir)) {
    fs.mkdirSync(deploymentsDir);
  }
  
  const deploymentFile = path.join(deploymentsDir, `sepolia-${Date.now()}.json`);
  fs.writeFileSync(deploymentFile, JSON.stringify(deploymentInfo, null, 2));
  console.log("💾 Deployment info saved to:", deploymentFile);

  console.log("\n🔧 NEXT STEPS:");
  console.log("===============");
  console.log("1. Update your .env.local file with:");
  console.log(`   NEXT_PUBLIC_CONTRACT_ADDRESS=${contractAddress}`);
  console.log(`   NEXT_PUBLIC_NETWORK_ID=${network.chainId}`);
  console.log("");
  console.log("2. Get wstETH tokens for testing:");
  console.log("   - Call submit() on: 0x3e3FE7dBc6B4C189E7128855dD526361c49b40Af");
  console.log("   - Wrap to wstETH: 0xB82381A3fBD3FaFA77B3a7bE693342618240067b");
  console.log("");
  console.log("3. Start your app:");
  console.log("   npm run dev");
  console.log("");
  console.log("🎉 Deployment completed successfully!");
  
  return deploymentInfo;
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Deployment failed:", error);
    process.exit(1);
  });