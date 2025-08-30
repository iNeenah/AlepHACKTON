import hre from "hardhat";

async function main() {
  console.log("Deploying CarbonCreditNFT contract...");

  // Get the contract factory
  const CarbonCreditNFT = await hre.ethers.getContractFactory("CarbonCreditNFT");
  
  // Deploy the contract
  const carbonCredit = await CarbonCreditNFT.deploy();
  
  await carbonCredit.waitForDeployment();
  
  const contractAddress = await carbonCredit.getAddress();
  console.log("CarbonCreditNFT deployed to:", contractAddress);
  
  // Add deployer as initial verifier
  const [deployer] = await hre.ethers.getSigners();
  console.log("Adding deployer as verifier:", deployer.address);
  
  await carbonCredit.addVerifier(deployer.address);
  console.log("Deployer added as authorized verifier");
  
  // Save deployment info
  const deploymentInfo = {
    contractAddress: contractAddress,
    deployer: deployer.address,
    network: hre.network.name,
    timestamp: new Date().toISOString(),
  };
  
  console.log("Deployment completed successfully!");
  console.log("Contract address:", contractAddress);
  console.log("Network:", hre.network.name);
  
  return deploymentInfo;
}

// Handle deployment errors
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("Deployment failed:", error);
    process.exit(1);
  });