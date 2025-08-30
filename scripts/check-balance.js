const { ethers } = require("hardhat");

async function main() {
  console.log("🔍 Checking account balance and network info...\n");

  try {
    // Get network info
    const network = await ethers.provider.getNetwork();
    console.log("🌐 Network:", network.name);
    console.log("🆔 Chain ID:", network.chainId.toString());
    console.log("🔗 RPC URL:", network.provider?.connection?.url || "Unknown");

    // Get signer
    const [signer] = await ethers.getSigners();
    console.log("\n👤 Account:", signer.address);

    // Get balance
    const balance = await ethers.provider.getBalance(signer.address);
    const balanceEth = ethers.formatEther(balance);
    console.log("💰 Balance:", balanceEth, "ETH");

    // Check if sufficient for deployment
    const minRequired = 0.02;
    if (parseFloat(balanceEth) < minRequired) {
      console.log(`⚠️  WARNING: Balance is low! You need at least ${minRequired} ETH for deployment`);
      console.log("🔗 Get Sepolia ETH: https://sepoliafaucet.com/");
    } else {
      console.log("✅ Balance is sufficient for deployment");
    }

    // Get latest block
    const blockNumber = await ethers.provider.getBlockNumber();
    console.log("📦 Latest block:", blockNumber);

    // Test connection
    console.log("\n🧪 Testing connection...");
    const gasPrice = await ethers.provider.getFeeData();
    console.log("⛽ Current gas price:", ethers.formatUnits(gasPrice.gasPrice || 0, "gwei"), "gwei");

    console.log("\n✅ Connection test successful!");

  } catch (error) {
    console.error("❌ Error checking balance:", error.message);
    
    if (error.message.includes("could not detect network")) {
      console.log("\n🔧 Troubleshooting:");
      console.log("- Check your SEPOLIA_URL in .env.local");
      console.log("- Verify Infura project ID is correct");
      console.log("- Make sure Infura project is active");
    }
    
    if (error.message.includes("invalid private key")) {
      console.log("\n🔧 Troubleshooting:");
      console.log("- Check your PRIVATE_KEY in .env.local");
      console.log("- Make sure it's 64 characters (no 0x prefix)");
      console.log("- Verify the private key is correct");
    }
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Script failed:", error);
    process.exit(1);
  });