import { expect } from "chai";
import hre from "hardhat";
const { ethers } = hre;

describe("CarbonCreditNFT", function () {
  let carbonCredit;
  let owner;
  let verifier;
  let buyer;
  let recipient;

  beforeEach(async function () {
    [owner, verifier, buyer, recipient] = await ethers.getSigners();

    const CarbonCreditNFT = await ethers.getContractFactory("CarbonCreditNFT");
    carbonCredit = await CarbonCreditNFT.deploy();
    await carbonCredit.waitForDeployment();

    // Add verifier
    await carbonCredit.addVerifier(verifier.address);
  });

  describe("Deployment", function () {
    it("Should set the right owner", async function () {
      expect(await carbonCredit.owner()).to.equal(owner.address);
    });

    it("Should add verifier correctly", async function () {
      expect(await carbonCredit.authorizedVerifiers(verifier.address)).to.be.true;
    });
  });

  describe("Minting", function () {
    it("Should mint carbon credit successfully", async function () {
      const carbonAmount = 100;
      const projectName = "Test Project";
      const location = "Test Location";
      const expiryDate = Math.floor(Date.now() / 1000) + 86400; // 1 day from now
      const tokenURI = "https://test.com/metadata/1";

      await expect(
        carbonCredit.connect(verifier).mintCarbonCredit(
          recipient.address,
          carbonAmount,
          projectName,
          location,
          expiryDate,
          tokenURI
        )
      ).to.emit(carbonCredit, "CarbonCreditMinted")
       .withArgs(0, recipient.address, carbonAmount, projectName);

      expect(await carbonCredit.ownerOf(0)).to.equal(recipient.address);
      
      const credit = await carbonCredit.getCarbonCredit(0);
      expect(credit.carbonAmount).to.equal(carbonAmount);
      expect(credit.projectName).to.equal(projectName);
      expect(credit.location).to.equal(location);
    });

    it("Should not allow unauthorized minting", async function () {
      const carbonAmount = 100;
      const projectName = "Test Project";
      const location = "Test Location";
      const expiryDate = Math.floor(Date.now() / 1000) + 86400;
      const tokenURI = "https://test.com/metadata/1";

      await expect(
        carbonCredit.connect(buyer).mintCarbonCredit(
          recipient.address,
          carbonAmount,
          projectName,
          location,
          expiryDate,
          tokenURI
        )
      ).to.be.revertedWith("Not authorized to mint");
    });
  });

  describe("Marketplace", function () {
    let tokenId;

    beforeEach(async function () {
      // Mint a token first
      const carbonAmount = 100;
      const projectName = "Test Project";
      const location = "Test Location";
      const expiryDate = Math.floor(Date.now() / 1000) + 86400;
      const tokenURI = "https://test.com/metadata/1";

      await carbonCredit.connect(verifier).mintCarbonCredit(
        recipient.address,
        carbonAmount,
        projectName,
        location,
        expiryDate,
        tokenURI
      );
      tokenId = 0;
    });

    it("Should list token for sale", async function () {
      const price = ethers.parseEther("0.1");

      await expect(
        carbonCredit.connect(recipient).listForSale(tokenId, price)
      ).to.emit(carbonCredit, "CarbonCreditListed")
       .withArgs(tokenId, price);

      const credit = await carbonCredit.getCarbonCredit(tokenId);
      expect(credit.isForSale).to.be.true;
      expect(credit.price).to.equal(price);
    });

    it("Should allow buying listed token", async function () {
      const price = ethers.parseEther("0.1");

      // List for sale
      await carbonCredit.connect(recipient).listForSale(tokenId, price);

      // Buy token
      await expect(
        carbonCredit.connect(buyer).buyCarbonCredit(tokenId, { value: price })
      ).to.emit(carbonCredit, "CarbonCreditSold")
       .withArgs(tokenId, recipient.address, buyer.address, price);

      expect(await carbonCredit.ownerOf(tokenId)).to.equal(buyer.address);
      
      const credit = await carbonCredit.getCarbonCredit(tokenId);
      expect(credit.isForSale).to.be.false;
    });

    it("Should retire carbon credit", async function () {
      await expect(
        carbonCredit.connect(recipient).retireCarbonCredit(tokenId)
      ).to.emit(carbonCredit, "CarbonCreditRetired")
       .withArgs(tokenId, recipient.address);

      const credit = await carbonCredit.getCarbonCredit(tokenId);
      expect(credit.isRetired).to.be.true;
      expect(credit.isForSale).to.be.false;
    });
  });

  describe("View Functions", function () {
    it("Should return tokens by owner", async function () {
      // Mint multiple tokens
      const carbonAmount = 100;
      const projectName = "Test Project";
      const location = "Test Location";
      const expiryDate = Math.floor(Date.now() / 1000) + 86400;
      const tokenURI = "https://test.com/metadata/";

      await carbonCredit.connect(verifier).mintCarbonCredit(
        recipient.address, carbonAmount, projectName, location, expiryDate, tokenURI + "1"
      );
      await carbonCredit.connect(verifier).mintCarbonCredit(
        recipient.address, carbonAmount, projectName, location, expiryDate, tokenURI + "2"
      );

      const tokens = await carbonCredit.getTokensByOwner(recipient.address);
      expect(tokens.length).to.equal(2);
    });

    it("Should return tokens for sale", async function () {
      // Mint and list token
      const carbonAmount = 100;
      const projectName = "Test Project";
      const location = "Test Location";
      const expiryDate = Math.floor(Date.now() / 1000) + 86400;
      const tokenURI = "https://test.com/metadata/1";

      await carbonCredit.connect(verifier).mintCarbonCredit(
        recipient.address, carbonAmount, projectName, location, expiryDate, tokenURI
      );
      
      const price = ethers.parseEther("0.1");
      await carbonCredit.connect(recipient).listForSale(0, price);

      const forSaleTokens = await carbonCredit.getTokensForSale();
      expect(forSaleTokens.length).to.equal(1);
      expect(forSaleTokens[0]).to.equal(0);
    });
  });
});