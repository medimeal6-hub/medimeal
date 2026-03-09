const hre = require("hardhat");
const fs = require('fs');
const path = require('path');

async function main() {
  console.log("🚀 Starting MediMeal Blockchain Deployment...\n");

  const [deployer] = await hre.ethers.getSigners();
  console.log("📍 Deploying contracts with account:", deployer.address);
  
  const balance = await hre.ethers.provider.getBalance(deployer.address);
  console.log("💰 Account balance:", hre.ethers.formatEther(balance), "MATIC\n");

  // Deploy HealthRecordRegistry
  console.log("📝 Deploying HealthRecordRegistry...");
  const HealthRecordRegistry = await hre.ethers.getContractFactory("HealthRecordRegistry");
  const healthRecordRegistry = await HealthRecordRegistry.deploy();
  await healthRecordRegistry.waitForDeployment();
  const healthRecordAddress = await healthRecordRegistry.getAddress();
  console.log("✅ HealthRecordRegistry deployed to:", healthRecordAddress);

  // Deploy PrescriptionRegistry
  console.log("\n📝 Deploying PrescriptionRegistry...");
  const PrescriptionRegistry = await hre.ethers.getContractFactory("PrescriptionRegistry");
  const prescriptionRegistry = await PrescriptionRegistry.deploy();
  await prescriptionRegistry.waitForDeployment();
  const prescriptionAddress = await prescriptionRegistry.getAddress();
  console.log("✅ PrescriptionRegistry deployed to:", prescriptionAddress);

  // Deploy ConsentManager
  console.log("\n📝 Deploying ConsentManager...");
  const ConsentManager = await hre.ethers.getContractFactory("ConsentManager");
  const consentManager = await ConsentManager.deploy();
  await consentManager.waitForDeployment();
  const consentAddress = await consentManager.getAddress();
  console.log("✅ ConsentManager deployed to:", consentAddress);

  // Save deployment info
  const deploymentInfo = {
    network: hre.network.name,
    deployer: deployer.address,
    timestamp: new Date().toISOString(),
    contracts: {
      healthRecordRegistry: healthRecordAddress,
      prescriptionRegistry: prescriptionAddress,
      consentManager: consentAddress
    }
  };

  const deploymentPath = path.join(__dirname, '../deployments', `${hre.network.name}.json`);
  fs.mkdirSync(path.dirname(deploymentPath), { recursive: true });
  fs.writeFileSync(deploymentPath, JSON.stringify(deploymentInfo, null, 2));

  console.log("\n📄 Deployment info saved to:", deploymentPath);

  // Save ABIs
  console.log("\n💾 Saving contract ABIs...");
  const artifactsPath = path.join(__dirname, '../artifacts/contracts');
  
  const healthRecordABI = require(path.join(artifactsPath, 'HealthRecordRegistry.sol/HealthRecordRegistry.json'));
  const prescriptionABI = require(path.join(artifactsPath, 'PrescriptionRegistry.sol/PrescriptionRegistry.json'));
  const consentABI = require(path.join(artifactsPath, 'ConsentManager.sol/ConsentManager.json'));

  fs.writeFileSync(
    path.join(__dirname, '../contracts/HealthRecordRegistry.json'),
    JSON.stringify({ abi: healthRecordABI.abi, address: healthRecordAddress }, null, 2)
  );
  fs.writeFileSync(
    path.join(__dirname, '../contracts/PrescriptionRegistry.json'),
    JSON.stringify({ abi: prescriptionABI.abi, address: prescriptionAddress }, null, 2)
  );
  fs.writeFileSync(
    path.join(__dirname, '../contracts/ConsentManager.json'),
    JSON.stringify({ abi: consentABI.abi, address: consentAddress }, null, 2)
  );

  console.log("✅ ABIs saved successfully");

  // Print environment variables to add
  console.log("\n📋 Add these to your .env file:");
  console.log("=====================================");
  console.log(`HEALTH_RECORD_CONTRACT=${healthRecordAddress}`);
  console.log(`PRESCRIPTION_CONTRACT=${prescriptionAddress}`);
  console.log(`CONSENT_CONTRACT=${consentAddress}`);
  console.log("=====================================\n");

  console.log("🎉 Deployment completed successfully!");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
