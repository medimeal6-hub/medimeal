const blockchainService = require('../services/blockchainService');
const ipfsService = require('../services/ipfsService');
const config = require('../config/blockchain.config');

/**
 * Initialize blockchain services
 */
async function initialize() {
  console.log('🚀 Initializing MediMeal Blockchain Services...\n');

  // Check configuration
  console.log('📋 Configuration Check:');
  console.log(`   Network: ${config.network}`);
  console.log(`   RPC URL: ${config.rpcUrl}`);
  console.log(`   Blockchain Enabled: ${config.features.enableBlockchain}`);
  console.log(`   IPFS Enabled: ${config.features.enableIPFS}\n`);

  // Initialize blockchain service
  if (config.features.enableBlockchain) {
    console.log('🔗 Initializing Blockchain Service...');
    const blockchainInit = await blockchainService.initialize();
    
    if (blockchainInit) {
      const balance = await blockchainService.getBalance();
      const gasPrice = await blockchainService.getGasPrice();
      
      console.log(`   ✅ Blockchain service ready`);
      console.log(`   💰 Wallet Balance: ${balance} MATIC`);
      console.log(`   ⛽ Gas Price: ${gasPrice?.gasPrice} gwei\n`);
    } else {
      console.log('   ❌ Blockchain service initialization failed\n');
    }
  } else {
    console.log('⏭️  Blockchain service disabled\n');
  }

  // Initialize IPFS service
  if (config.features.enableIPFS) {
    console.log('📦 Initializing IPFS Service...');
    const ipfsInit = await ipfsService.initialize();
    
    if (ipfsInit) {
      console.log('   ✅ IPFS service ready\n');
    } else {
      console.log('   ❌ IPFS service initialization failed\n');
    }
  } else {
    console.log('⏭️  IPFS service disabled\n');
  }

  console.log('✨ Initialization complete!\n');
}

// Run if called directly
if (require.main === module) {
  initialize()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error('❌ Initialization failed:', error);
      process.exit(1);
    });
}

module.exports = initialize;
