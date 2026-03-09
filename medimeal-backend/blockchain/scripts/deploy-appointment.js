const hre = require("hardhat");

async function main() {
  console.log("🚀 Deploying AppointmentRegistry Contract...\n");

  // Get deployer account
  const [deployer] = await hre.ethers.getSigners();
  console.log("📍 Deploying with account:", deployer.address);

  // Check balance
  const balance = await hre.ethers.provider.getBalance(deployer.address);
  console.log("💰 Account balance:", hre.ethers.formatEther(balance), "MATIC\n");

  if (balance === 0n) {
    console.error("❌ Insufficient balance. Get test MATIC from https://faucet.polygon.technology/");
    process.exit(1);
  }

  // Deploy AppointmentRegistry
  console.log("📝 Deploying AppointmentRegistry...");
  const AppointmentRegistry = await hre.ethers.getContractFactory("AppointmentRegistry");
  const appointmentRegistry = await AppointmentRegistry.deploy();
  await appointmentRegistry.waitForDeployment();

  const appointmentAddress = await appointmentRegistry.getAddress();
  console.log("✅ AppointmentRegistry deployed to:", appointmentAddress);

  // Wait for a few block confirmations
  console.log("\n⏳ Waiting for block confirmations...");
  await appointmentRegistry.deploymentTransaction().wait(5);
  console.log("✅ Confirmed!\n");

  // Display summary
  console.log("=" .repeat(60));
  console.log("📋 DEPLOYMENT SUMMARY");
  console.log("=" .repeat(60));
  console.log("Network:", hre.network.name);
  console.log("Deployer:", deployer.address);
  console.log("AppointmentRegistry:", appointmentAddress);
  console.log("=" .repeat(60));

  console.log("\n📝 Add this to your .env file:");
  console.log("=" .repeat(60));
  console.log(`APPOINTMENT_CONTRACT=${appointmentAddress}`);
  console.log("=" .repeat(60));

  // Verify on PolygonScan (if not localhost)
  if (hre.network.name !== "hardhat" && hre.network.name !== "localhost") {
    console.log("\n🔍 Verifying contract on PolygonScan...");
    console.log("⏳ Waiting 30 seconds before verification...");
    await new Promise(resolve => setTimeout(resolve, 30000));

    try {
      await hre.run("verify:verify", {
        address: appointmentAddress,
        constructorArguments: [],
      });
      console.log("✅ Contract verified on PolygonScan!");
    } catch (error) {
      console.log("⚠️  Verification failed:", error.message);
      console.log("You can verify manually later using:");
      console.log(`npx hardhat verify --network ${hre.network.name} ${appointmentAddress}`);
    }
  }

  console.log("\n✨ Deployment complete!");
  console.log("\n🔗 View on PolygonScan:");
  if (hre.network.name === "mumbai") {
    console.log(`https://mumbai.polygonscan.com/address/${appointmentAddress}`);
  } else if (hre.network.name === "polygon") {
    console.log(`https://polygonscan.com/address/${appointmentAddress}`);
  }

  console.log("\n🎯 Next steps:");
  console.log("1. Add APPOINTMENT_CONTRACT to your .env file");
  console.log("2. Restart your backend server");
  console.log("3. Test the appointment blockchain endpoints");
  console.log("4. Integrate with your appointment creation flow\n");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Deployment failed:", error);
    process.exit(1);
  });
