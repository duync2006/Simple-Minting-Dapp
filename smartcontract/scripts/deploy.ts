import { ethers } from "hardhat";

async function main() {
  console.log("Deploying SimpleNFT contract...");

  // Contract deployment parameters
  const name = "Simple NFT Collection";
  const symbol = "SNFT";
  const baseURI = "https://api.simple-nft.example/metadata/";
  const maxMintsPerAddress = 3;
  const maxSupply = 1000;

  // Deploy the contract
  const SimpleNFT = await ethers.getContractFactory("SimpleNFT");
  const simpleNFT = await SimpleNFT.deploy(
    name,
    symbol,
    baseURI,
    maxMintsPerAddress,
    maxSupply
  );

  await simpleNFT.waitForDeployment();

  console.log(`SimpleNFT deployed to ${await simpleNFT.getAddress()}`);
  console.log(`Name: ${name}`);
  console.log(`Symbol: ${symbol}`);
  console.log(`Base URI: ${baseURI}`);
  console.log(`Max Mints Per Address: ${maxMintsPerAddress}`);
  console.log(`Max Supply: ${maxSupply}`);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
}); 