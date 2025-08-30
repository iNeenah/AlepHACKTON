import hre from "hardhat";

async function main() {
  console.log("🚀 Generando datos de demostración...");
  
  const contractAddress = "0x5FbDB2315678afecb367f032d93F642f64180aa3";
  const CarbonCreditNFT = await hre.ethers.getContractFactory("CarbonCreditNFT");
  const contract = CarbonCreditNFT.attach(contractAddress);
  
  const [deployer, user1, user2, user3] = await hre.ethers.getSigners();
  
  console.log("📝 Cuentas:");
  console.log("Deployer:", deployer.address);
  console.log("User1:", user1.address);
  
  const projects = [
    { name: "Reforestación Amazónica", location: "Brasil", carbonAmount: "25" },
    { name: "Energía Solar Rural", location: "India", carbonAmount: "15" },
    { name: "Captura de Metano", location: "Estados Unidos", carbonAmount: "40" }
  ];
  
  console.log("\n🌱 Creando créditos...");
  
  for (let i = 0; i < projects.length; i++) {
    const project = projects[i];
    const recipient = i === 0 ? user1.address : deployer.address;
    const expiryDate = Math.floor(Date.now() / 1000) + (365 * 24 * 60 * 60);
    
    const metadata = {
      name: project.name + " Carbon Credit",
      description: "Verified carbon credit from " + project.name,
      attributes: [
        { trait_type: "Carbon Amount", value: project.carbonAmount + " tonnes CO2" },
        { trait_type: "Project", value: project.name },
        { trait_type: "Location", value: project.location }
      ]
    };
    
    const tokenURI = "data:application/json;base64," + Buffer.from(JSON.stringify(metadata)).toString('base64');
    
    try {
      console.log(`Creando: ${project.name}`);
      const tx = await contract.mintCarbonCredit(
        recipient,
        project.carbonAmount,
        project.name,
        project.location,
        expiryDate,
        tokenURI
      );
      await tx.wait();
      console.log(`✅ Token ID ${i} creado`);
    } catch (error) {
      console.error(`❌ Error:`, error.message);
    }
  }
  
  console.log("\n💰 Listando para venta...");
  
  try {
    const price1 = hre.ethers.parseEther("0.05");
    const tx1 = await contract.connect(user1).listForSale(0, price1);
    await tx1.wait();
    console.log("✅ Token 0 listado por 0.05 ETH");
    
    const price2 = hre.ethers.parseEther("0.08");
    const tx2 = await contract.listForSale(1, price2);
    await tx2.wait();
    console.log("✅ Token 1 listado por 0.08 ETH");
  } catch (error) {
    console.error("❌ Error listando:", error.message);
  }
  
  console.log("\n🎉 ¡Demo listo!");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });