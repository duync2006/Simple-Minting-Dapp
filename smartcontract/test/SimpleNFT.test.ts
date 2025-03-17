import { expect } from "chai";
import { ethers } from "hardhat";
import { SimpleNFT } from "../typechain-types";
import { Signer } from "ethers";

describe("SimpleNFT", function () {
  let simpleNFT: SimpleNFT;
  let owner: Signer;
  let user1: Signer;
  let user2: Signer;
  let ownerAddress: string;
  let user1Address: string;
  let user2Address: string;

  const NAME = "Simple NFT Collection";
  const SYMBOL = "SNFT";
  const BASE_URI = "https://api.simple-nft.example/metadata/";
  const MAX_MINTS_PER_ADDRESS = 3;
  const MAX_SUPPLY = 10;
  const SAMPLE_TOKEN_URI = "ipfs://QmSample/1.json";

  beforeEach(async function () {
    // Get signers
    [owner, user1, user2] = await ethers.getSigners();
    ownerAddress = await owner.getAddress();
    user1Address = await user1.getAddress();
    user2Address = await user2.getAddress();

    // Deploy contract
    const SimpleNFTFactory = await ethers.getContractFactory("SimpleNFT");
    simpleNFT = await SimpleNFTFactory.deploy(
      NAME,
      SYMBOL,
      BASE_URI,
      MAX_MINTS_PER_ADDRESS,
      MAX_SUPPLY
    ) as SimpleNFT;
  });

  describe("Deployment", function () {
    it("Should set the correct name and symbol", async function () {
      expect(await simpleNFT.name()).to.equal(NAME);
      expect(await simpleNFT.symbol()).to.equal(SYMBOL);
    });

    it("Should set the correct base URI", async function () {
      expect(await simpleNFT.baseURI()).to.equal(BASE_URI);
    });

    it("Should set the correct max mints per address", async function () {
      expect(await simpleNFT.maxMintsPerAddress()).to.equal(MAX_MINTS_PER_ADDRESS);
    });

    it("Should set the correct max supply", async function () {
      expect(await simpleNFT.maxSupply()).to.equal(MAX_SUPPLY);
    });
  });

  describe("Minting", function () {
    it("Should allow a user to mint an NFT", async function () {
      await simpleNFT.connect(user1).mint(user1Address, SAMPLE_TOKEN_URI);
      expect(await simpleNFT.ownerOf(1)).to.equal(user1Address);
      expect(await simpleNFT.tokenURI(1)).to.equal(SAMPLE_TOKEN_URI);
      expect(await simpleNFT.mintCount(user1Address)).to.equal(1);
      expect(await simpleNFT.totalSupply()).to.equal(1);
    });

    it("Should allow a user to mint up to the max limit", async function () {
      // Mint max allowed NFTs
      for (let i = 0; i < MAX_MINTS_PER_ADDRESS; i++) {
        await simpleNFT.connect(user1).mint(user1Address, `${SAMPLE_TOKEN_URI}/${i}`);
      }
      
      expect(await simpleNFT.mintCount(user1Address)).to.equal(MAX_MINTS_PER_ADDRESS);
      
      // Try to mint one more, should revert
      await expect(
        simpleNFT.connect(user1).mint(user1Address, `${SAMPLE_TOKEN_URI}/extra`)
      ).to.be.revertedWithCustomError(simpleNFT, "MintLimitExceeded");
    });

    it("Should prevent minting when paused", async function () {
      // Pause the contract
      await simpleNFT.connect(owner).pause();
      
      // Try to mint, should revert
      await expect(
        simpleNFT.connect(user1).mint(user1Address, SAMPLE_TOKEN_URI)
      ).to.be.revertedWithCustomError(simpleNFT, "EnforcedPause");
      
      // Unpause
      await simpleNFT.connect(owner).unpause();
      
      // Should be able to mint now
      await simpleNFT.connect(user1).mint(user1Address, SAMPLE_TOKEN_URI);
      expect(await simpleNFT.ownerOf(1)).to.equal(user1Address);
    });

    it("Should allow the owner to admin mint", async function () {
      await simpleNFT.connect(owner).adminMint(user2Address, SAMPLE_TOKEN_URI);
      expect(await simpleNFT.ownerOf(1)).to.equal(user2Address);
      
      // Admin minting should not count toward the user's mint limit
      expect(await simpleNFT.mintCount(user2Address)).to.equal(0);
    });

    it("Should prevent reaching max supply", async function () {
      // Mint up to max supply
      for (let i = 0; i < MAX_SUPPLY; i++) {
        await simpleNFT.connect(owner).adminMint(user1Address, `${SAMPLE_TOKEN_URI}/${i}`);
      }
      
      // Try to mint one more, should revert
      await expect(
        simpleNFT.connect(owner).adminMint(user1Address, `${SAMPLE_TOKEN_URI}/extra`)
      ).to.be.revertedWithCustomError(simpleNFT, "MaxSupplyReached");
    });

    it("Should prevent minting to zero address", async function () {
      await expect(
        simpleNFT.connect(user1).mint(ethers.ZeroAddress, SAMPLE_TOKEN_URI)
      ).to.be.revertedWithCustomError(simpleNFT, "InvalidAddress");
    });
  });

  describe("Access control", function () {
    it("Should prevent non-owners from pausing", async function () {
      await expect(
        simpleNFT.connect(user1).pause()
      ).to.be.revertedWithCustomError(simpleNFT, "AccessControlUnauthorizedAccount");
    });

    it("Should prevent non-owners from unpausing", async function () {
      await simpleNFT.connect(owner).pause();
      
      await expect(
        simpleNFT.connect(user1).unpause()
      ).to.be.revertedWithCustomError(simpleNFT, "AccessControlUnauthorizedAccount");
    });

    it("Should prevent non-owners from admin minting", async function () {
      await expect(
        simpleNFT.connect(user1).adminMint(user1Address, SAMPLE_TOKEN_URI)
      ).to.be.revertedWithCustomError(simpleNFT, "AccessControlUnauthorizedAccount");
    });

    it("Should prevent non-owners from changing max mints per address", async function () {
      await expect(
        simpleNFT.connect(user1).setMaxMintsPerAddress(5)
      ).to.be.revertedWithCustomError(simpleNFT, "AccessControlUnauthorizedAccount");
    });

    it("Should prevent non-owners from changing max supply", async function () {
      await expect(
        simpleNFT.connect(user1).setMaxSupply(20)
      ).to.be.revertedWithCustomError(simpleNFT, "AccessControlUnauthorizedAccount");
    });

    it("Should prevent non-owners from changing base URI", async function () {
      await expect(
        simpleNFT.connect(user1).setBaseURI("newBaseURI")
      ).to.be.revertedWithCustomError(simpleNFT, "AccessControlUnauthorizedAccount");
    });
  });

  describe("Settings updates", function () {
    it("Should allow owner to change max mints per address", async function () {
      const newMaxMints = 5;
      await simpleNFT.connect(owner).setMaxMintsPerAddress(newMaxMints);
      expect(await simpleNFT.maxMintsPerAddress()).to.equal(newMaxMints);
    });

    it("Should allow owner to change max supply", async function () {
      const newMaxSupply = 20;
      await simpleNFT.connect(owner).setMaxSupply(newMaxSupply);
      expect(await simpleNFT.maxSupply()).to.equal(newMaxSupply);
    });

    it("Should allow owner to change base URI", async function () {
      const newBaseURI = "https://new-uri.example/metadata/";
      await simpleNFT.connect(owner).setBaseURI(newBaseURI);
      expect(await simpleNFT.baseURI()).to.equal(newBaseURI);
    });

    it("Should prevent setting invalid max mints value", async function () {
      await expect(
        simpleNFT.connect(owner).setMaxMintsPerAddress(0)
      ).to.be.revertedWithCustomError(simpleNFT, "InvalidValue");
    });

    it("Should prevent setting max supply less than current supply", async function () {
      // Mint an NFT
      await simpleNFT.connect(user1).mint(user1Address, SAMPLE_TOKEN_URI);
      
      // Try to set max supply to 0, should revert
      await expect(
        simpleNFT.connect(owner).setMaxSupply(0)
      ).to.be.revertedWithCustomError(simpleNFT, "InvalidValue");
    });
  });

  describe("Gas usage", function () {
    it("Should have reasonable gas usage for minting", async function () {
      const tx = await simpleNFT.connect(user1).mint(user1Address, SAMPLE_TOKEN_URI);
      const receipt = await tx.wait();
      
      // Gas usage for a mint operation should be reasonable
      const gasUsed = receipt?.gasUsed || 0n;
      console.log(`Gas used for minting: ${gasUsed.toString()}`);
      
      // This is a rough estimate, exact values depend on the contract
      expect(gasUsed).to.be.lt(300000n);
    });
  });

  describe("Token URIs and metadata", function () {
    const TOKEN_URI_1 = "ipfs://QmTest1/metadata.json";
    const TOKEN_URI_2 = "ipfs://QmTest2/metadata.json";
    
    beforeEach(async function () {
      // Mint a couple of tokens for testing
      await simpleNFT.connect(user1).mint(user1Address, TOKEN_URI_1);
      await simpleNFT.connect(user2).mint(user2Address, TOKEN_URI_2);
    });

    it("Should store and retrieve the correct token URIs", async function () {
      expect(await simpleNFT.tokenURI(1)).to.equal(TOKEN_URI_1);
      expect(await simpleNFT.tokenURI(2)).to.equal(TOKEN_URI_2);
    });

    it("Should update base URI and maintain individual token URIs", async function () {
      const newBaseURI = "https://updated-api.example/token/";
      await simpleNFT.connect(owner).setBaseURI(newBaseURI);
      
      // Base URI should be updated
      expect(await simpleNFT.baseURI()).to.equal(newBaseURI);
      
      // Existing token URIs should remain unchanged as they use full URIs
      expect(await simpleNFT.tokenURI(1)).to.equal(TOKEN_URI_1);
      expect(await simpleNFT.tokenURI(2)).to.equal(TOKEN_URI_2);
      
      // New tokens can use the new baseURI
      const tokenId3 = await simpleNFT.connect(user1).mint(user1Address, "3.json");
      
      // The token URI will still be what we explicitly set
      expect(await simpleNFT.tokenURI(3)).to.equal("3.json");
    });

    it("Should handle transfers correctly while maintaining token data", async function () {
      // Transfer token 1 from user1 to user2
      await simpleNFT.connect(user1).transferFrom(user1Address, user2Address, 1);
      
      // Check new ownership
      expect(await simpleNFT.ownerOf(1)).to.equal(user2Address);
      
      // Token URI should remain unchanged after transfer
      expect(await simpleNFT.tokenURI(1)).to.equal(TOKEN_URI_1);
      
      // Mint counts should not change after transfers
      expect(await simpleNFT.mintCount(user1Address)).to.equal(1);
    });

    it("Should not allow transfers when paused", async function () {
      // Pause the contract
      await simpleNFT.connect(owner).pause();
      
      // Attempt to transfer should fail when paused
      await expect(
        simpleNFT.connect(user1).transferFrom(user1Address, user2Address, 1)
      ).to.be.revertedWithCustomError(simpleNFT, "EnforcedPause");
      
      // Unpause and try again
      await simpleNFT.connect(owner).unpause();
      await simpleNFT.connect(user1).transferFrom(user1Address, user2Address, 1);
      expect(await simpleNFT.ownerOf(1)).to.equal(user2Address);
    });
  });
}); 