const { ethers } = require("hardhat");

async function main() {
  console.log("Deploying FundGuard contract...");

  // Get the signer (deployer account)
  const [deployer] = await ethers.getSigners();
  console.log("Deploying with account:", deployer.address);

  // Check deployer balance
  const balance = await ethers.provider.getBalance(deployer.address);
  console.log("Account balance:", ethers.formatEther(balance), "ETH");

  // Get the contract factory
  const FundGuard = await ethers.getContractFactory("FundGuard");
  
  // Constructor parameter: initial budget in wei (1,000,000 ETH equivalent for testing)
  // This represents $1M budget as mentioned in your deployment docs
  const initialBudget = ethers.parseEther("1000000");
  
  console.log("Initial budget:", ethers.formatEther(initialBudget), "ETH");
  
  // Deploy the contract
  console.log("Deploying contract...");
  const fundGuard = await FundGuard.deploy(initialBudget);
  
  // Wait for deployment to complete
  await fundGuard.waitForDeployment();
  
  const contractAddress = await fundGuard.getAddress();
  console.log("FundGuard deployed to:", contractAddress);
  
  // Save deployment info
  console.log("\n=== Deployment Summary ===");
  console.log("Contract Address:", contractAddress);
  console.log("Initial Budget:", ethers.formatEther(initialBudget), "ETH");
  console.log("Network:", (await ethers.provider.getNetwork()).name);
  console.log("Deployer:", deployer.address);
  
  console.log("\n=== Next Steps ===");
  console.log("1. Copy the contract address above");
  console.log("2. Update CONTRACT_ADDRESS in js/app.js");
  console.log("3. Verify the contract on the block explorer");
  
  return contractAddress;
}

// Handle errors
main()
  .then((address) => {
    console.log("\n✅ Deployment completed successfully!");
    console.log("Contract Address:", address);
    process.exit(0);
  })
  .catch((error) => {
    console.error("❌ Deployment failed:");
    console.error(error);
    process.exit(1);
  });
