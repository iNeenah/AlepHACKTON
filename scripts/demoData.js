const { ethers } = require("hardhat");

async function main() {
  console.log("🌱 Creating demo carbon credits...\n");

  // Get the contract
  const contractAddress = "0x5FbDB2315678afecb367f032d93F642f64180aa3"; // Update with your deployed address
  const CarbonCreditNFT = await ethers.getContractFactory("CarbonCreditNFT");
  const contract = CarbonCreditNFT.attach(contractAddress);

  const [deployer] = await ethers.getSigners();
  console.log("📝 Creating demo data with account:", deployer.address);

  // Demo carbon credit projects
  const demoProjects = [
    {
      carbonAmount: 100,
      projectName: "Amazon Rainforest Conservation",
      location: "Brazil, South America",
      description: "Protecting 10,000 hectares of pristine Amazon rainforest from deforestation",
      price: "0.5" // ETH
    },
    {
      carbonAmount: 250,
      projectName: "Solar Farm Initiative",
      location: "California, USA",
      description: "Large-scale solar energy project replacing coal power generation",
      price: "1.2" // ETH
    },
    {
      carbonAmount: 75,
      projectName: "Mangrove Restoration",
      location: "Philippines",
      description: "Restoring coastal mangrove ecosystems for carbon sequestration",
      price: "0.3" // ETH
    },
    {
      carbonAmount: 500,
      projectName: "Wind Energy Project",
      location: "Denmark",
      description: "Offshore wind farm generating clean renewable energy",
      price: "2.0" // ETH
    },
    {
      carbonAmount: 150,
      projectName: "Reforestation Program",
      location: "Kenya, Africa",
      description: "Community-led tree planting initiative in degraded lands",
      price: "0.8" // ETH
    },
    {
      carbonAmount: 300,
      projectName: "Biogas Plant",
      location: "India",
      description: "Converting agricultural waste to clean energy and reducing methane emissions",
      price: "1.5" // ETH
    }
  ];

  console.log(`🚀 Creating ${demoProjects.length} demo carbon credits...\n`);

  for (let i = 0; i < demoProjects.length; i++) {
    const project = demoProjects[i];
    
    try {
      console.log(`${i + 1}. Creating: ${project.projectName}`);
      
      // Create metadata
      const metadata = {
        name: `${project.projectName} Carbon Credit`,
        description: project.description,
        image: `https://via.placeholder.com/400x400/10b981/ffffff?text=Carbon+Credit+${i + 1}`,
        attributes: [
          { trait_type: "Carbon Amount", value: `${project.carbonAmount} tonnes CO2` },
          { trait_type: "Project", value: project.projectName },
          { trait_type: "Location", value: project.location },
          { trait_type: "Type", value: "Carbon Credit" },
          { trait_type: "Verification Status", value: "Verified" }
        ]
      };
      
      const tokenURI = "data:application/json;base64," + Buffer.from(JSON.stringify(metadata)).toString('base64');
      
      // Set expiry date to 2 years from now
      const expiryDate = Math.floor(Date.now() / 1000) + (2 * 365 * 24 * 60 * 60);
      
      // Mint the carbon credit
      const mintTx = await contract.mintCarbonCredit(
        deployer.address,
        project.carbonAmount,
        project.projectName,
        project.location,
        expiryDate,
        tokenURI
      );
      
      await mintTx.wait();
      console.log(`   ✅ Minted token ID: ${i}`);
      
      // List for sale
      const priceInWei = ethers.parseEther(project.price);
      const listTx = await contract.listForSale(i, priceInWei);
      await listTx.wait();
      console.log(`   💰 Listed for sale at ${project.price} ETH`);
      
    } catch (error) {
      console.error(`   ❌ Failed to create ${project.projectName}:`, error.message);
    }
    
    console.log(); // Empty line for readability
  }

  // Display summary
  console.log("📊 Demo Data Summary:");
  console.log("=====================");
  
  try {
    const totalTokens = await contract.balanceOf(deployer.address);
    const tokensForSale = await contract.getTokensForSale();
    
    console.log(`🌱 Total Credits Created: ${totalTokens.toString()}`);
    console.log(`🛒 Credits Listed for Sale: ${tokensForSale.length}`);
    console.log(`♻️ Total CO₂ Offset Available: ${demoProjects.reduce((sum, p) => sum + p.carbonAmount, 0)} tonnes`);
    console.log(`💰 Total Market Value: ${demoProjects.reduce((sum, p) => sum + parseFloat(p.price), 0)} ETH`);
    
    console.log("\n🎯 Demo credits are ready for testing!");
    console.log("🌐 Start your frontend with: npm run dev");
    
  } catch (error) {
    console.error("❌ Error getting summary:", error.message);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Demo data creation failed:", error);
    process.exit(1);
  });